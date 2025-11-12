from __future__ import annotations

import argparse
import heapq
import pathlib
import time
from collections import deque
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Sequence, Set, Tuple

from heuristics import HeuristicCalculator, HeuristicType
from pddl import (
    PDDLParsingError,
    SchedulingProblem,
    parse_domain_name,
    parse_scheduling_problem,
)


@dataclass(frozen=True)
class State:
    completed: frozenset[str]
    available_ops: frozenset[str]
    available_machines: frozenset[str]
    assignments: frozenset[Tuple[str, str, str]]

    def as_key(self) -> Tuple[
        Tuple[str, ...], Tuple[str, ...], Tuple[str, ...], Tuple[Tuple[str, str, str], ...]
    ]:
        return (
            tuple(sorted(self.completed)),
            tuple(sorted(self.available_ops)),
            tuple(sorted(self.available_machines)),
            tuple(sorted(self.assignments)),
        )

    def in_progress(self) -> Dict[str, Tuple[str, str]]:
        mapping: Dict[str, Tuple[str, str]] = {}
        for task, op, machine in self.assignments:
            mapping[task] = (op, machine)
        return mapping


@dataclass
class PlanResult:
    actions: List[str]
    expanded_nodes: int
    generated_nodes: int

    @property
    def plan_length(self) -> int:
        return len(self.actions)


def build_initial_state(problem: SchedulingProblem) -> State:
    available_ops = frozenset(problem.operators & problem.initial_available)
    available_machines = frozenset(problem.machines & problem.initial_available)
    completed = frozenset(problem.initial_completed)
    assignments = frozenset(
        (task, op, machine)
        for task, (op, machine) in problem.initial_in_progress.items()
    )
    return State(
        completed=completed,
        available_ops=available_ops,
        available_machines=available_machines,
        assignments=assignments,
    )


def goal_reached(problem: SchedulingProblem, state: State) -> bool:
    return problem.goal_tasks.issubset(state.completed) and not state.assignments


def expand_state(
    problem: SchedulingProblem, state: State
) -> Iterable[Tuple[str, State]]:
    in_progress = state.in_progress()
    for task, (operator, machine) in in_progress.items():
        new_completed = set(state.completed)
        new_completed.add(task)
        new_assignments = set(state.assignments)
        new_assignments.remove((task, operator, machine))
        new_avail_ops = set(state.available_ops)
        new_avail_ops.add(operator)
        new_avail_machines = set(state.available_machines)
        new_avail_machines.add(machine)
        action = f"(finish-task {task} {operator} {machine})"
        yield action, State(
            completed=frozenset(new_completed),
            available_ops=frozenset(new_avail_ops),
            available_machines=frozenset(new_avail_machines),
            assignments=frozenset(new_assignments),
        )

    occupied_tasks = set(in_progress.keys())
    for task in problem.tasks:
        if task in state.completed or task in occupied_tasks:
            continue
        if any(dep not in state.completed for dep in problem.dependencies.get(task, [])):
            continue
        for operator in state.available_ops:
            required_machine = problem.machine_requirements.get(task)
            if required_machine is None:
                candidate_machines: Iterable[str] = state.available_machines
            else:
                candidate_machines = (
                    [required_machine] if required_machine in state.available_machines else []
                )
            for machine in candidate_machines:
                new_assignments = set(state.assignments)
                new_assignments.add((task, operator, machine))
                new_avail_ops = set(state.available_ops)
                new_avail_ops.remove(operator)
                new_avail_machines = set(state.available_machines)
                new_avail_machines.remove(machine)
                action = f"(start-task {task} {operator} {machine})"
                yield action, State(
                    completed=state.completed,
                    available_ops=frozenset(new_avail_ops),
                    available_machines=frozenset(new_avail_machines),
                    assignments=frozenset(new_assignments),
                )


def bfs_plan(problem: SchedulingProblem, max_nodes: Optional[int] = None) -> Optional[PlanResult]:
    initial_state = build_initial_state(problem)
    frontier = deque([(initial_state, [])])
    visited = {initial_state.as_key(): 0}
    expanded = 0
    generated = 1

    while frontier:
        state, plan = frontier.popleft()
        if goal_reached(problem, state):
            return PlanResult(actions=plan, expanded_nodes=expanded, generated_nodes=generated)
        if max_nodes is not None and expanded >= max_nodes:
            break
        expanded += 1
        for action, successor in expand_state(problem, state):
            key = successor.as_key()
            if key in visited:
                continue
            visited[key] = len(plan) + 1
            generated += 1
            frontier.append((successor, plan + [action]))
    return None


def heuristic_value(
    calculator: HeuristicCalculator, state: State, heuristic: HeuristicType
) -> float:
    return calculator.estimate(heuristic, state).value


def astar_plan(
    problem: SchedulingProblem,
    heuristic: HeuristicType,
    max_nodes: Optional[int] = None,
) -> Optional[PlanResult]:
    initial_state = build_initial_state(problem)
    calculator = HeuristicCalculator(problem)
    initial_h = heuristic_value(calculator, initial_state, heuristic)
    counter = 0
    frontier: List[Tuple[float, int, int, State, List[str]]] = []
    heapq.heappush(frontier, (initial_h, 0, counter, initial_state, []))

    best_cost: Dict[Tuple, int] = {initial_state.as_key(): 0}
    expanded = 0
    generated = 1

    while frontier:
        f_cost, g_cost, _, state, plan = heapq.heappop(frontier)
        if goal_reached(problem, state):
            return PlanResult(actions=plan, expanded_nodes=expanded, generated_nodes=generated)
        if max_nodes is not None and expanded >= max_nodes:
            break
        expanded += 1

        for action, successor in expand_state(problem, state):
            new_plan = plan + [action]
            new_g = g_cost + 1
            key = successor.as_key()
            if key in best_cost and best_cost[key] <= new_g:
                continue
            best_cost[key] = new_g
            h_val = heuristic_value(calculator, successor, heuristic)
            counter += 1
            heapq.heappush(frontier, (new_g + h_val, new_g, counter, successor, new_plan))
            generated += 1
    return None


def load_problem(domain_path: pathlib.Path, problem_path: pathlib.Path) -> SchedulingProblem:
    domain_name = parse_domain_name(domain_path)
    problem = parse_scheduling_problem(problem_path)
    if problem.domain != domain_name:
        raise PDDLParsingError(
            f"O problema '{problem.name}' declara domínio '{problem.domain}', "
            f"mas o arquivo fornecido define '{domain_name}'."
        )
    return problem


def solve_strips(
    problem: SchedulingProblem,
    heuristic: HeuristicType = HeuristicType.BFS,
    max_nodes: Optional[int] = None,
) -> Optional[PlanResult]:
    if heuristic == HeuristicType.BFS:
        return bfs_plan(problem, max_nodes=max_nodes)
    return astar_plan(problem, heuristic=heuristic, max_nodes=max_nodes)


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Planejador STRIPS para o domínio de escalonamento (BFS ou A* heurístico)."
    )
    parser.add_argument("domain", type=pathlib.Path, help="Caminho para o arquivo domain.pddl.")
    parser.add_argument("problem", type=pathlib.Path, help="Caminho para o arquivo schedule*.pddl.")
    parser.add_argument(
        "--max-nodes",
        type=int,
        default=None,
        help="Limite opcional do número de nós expandidos.",
    )
    parser.add_argument(
        "--heuristic",
        choices=[heuristic.value for heuristic in HeuristicType],
        default=HeuristicType.BFS.value,
        help="Heurística utilizada (bfs, h_add, h_max).",
    )
    parser.add_argument(
        "--show-plan",
        action="store_true",
        help="Imprime o plano encontrado (uma ação por linha).",
    )
    args = parser.parse_args(argv)

    start = time.perf_counter()
    problem = load_problem(args.domain, args.problem)
    heuristic = HeuristicType(args.heuristic)
    result = solve_strips(problem, heuristic=heuristic, max_nodes=args.max_nodes)
    elapsed = time.perf_counter() - start

    if result is None:
        print("Nenhum plano encontrado.")
        return 1

    print(f"Estratégia: {heuristic.value}")
    print(f"Plano encontrado com {result.plan_length} ações.")
    print(f"Nós expandidos: {result.expanded_nodes}")
    print(f"Nós gerados: {result.generated_nodes}")
    print(f"Tempo: {elapsed:.3f} s")
    if args.show_plan:
        print("Sequência de ações:")
        for action in result.actions:
            print(f"  {action}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


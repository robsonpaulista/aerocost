from __future__ import annotations

import argparse
import pathlib
import time
from dataclasses import dataclass
from itertools import combinations
from typing import Dict, FrozenSet, Iterable, List, Optional, Sequence, Set, Tuple

from pddl import (
    PDDLParsingError,
    SchedulingProblem,
    parse_domain_name,
    parse_scheduling_problem,
)
from planning_domain import (
    GroundAction,
    Literal,
    all_literals_from_actions,
    build_ground_actions,
    initial_literals,
)


@dataclass(frozen=True)
class SignedLiteral:
    atom: Literal
    is_positive: bool = True

    def key(self) -> Tuple[str, Tuple[str, ...], bool]:
        return (self.atom.name, self.atom.args, self.is_positive)


@dataclass(frozen=True)
class GraphAction:
    base: Optional[GroundAction]
    name: str
    signature: str
    preconditions: FrozenSet[SignedLiteral]
    add_effects: FrozenSet[SignedLiteral]
    del_effects: FrozenSet[SignedLiteral]


@dataclass
class GraphplanResult:
    plan: List[GroundAction]
    horizon: int
    expanded_nodes: int


def to_signed(literal: Literal, positive: bool = True) -> SignedLiteral:
    return SignedLiteral(literal, positive)


def literal_pair_key(a: SignedLiteral, b: SignedLiteral) -> FrozenSet[SignedLiteral]:
    return frozenset((a, b))


def convert_graph_actions(actions: Iterable[GroundAction]) -> List[GraphAction]:
    graph_actions: List[GraphAction] = []
    for action in actions:
        preconditions = frozenset(
            {to_signed(lit, True) for lit in action.preconditions_pos}
            | {to_signed(lit, False) for lit in action.preconditions_neg}
        )
        add_effects = frozenset(
            {to_signed(lit, True) for lit in action.add_effects}
            | {to_signed(lit, False) for lit in action.del_effects}
        )
        del_effects = frozenset(
            {to_signed(lit, False) for lit in action.add_effects}
            | {to_signed(lit, True) for lit in action.del_effects}
        )
        graph_actions.append(
            GraphAction(
                base=action,
                name=action.name,
                signature=action.signature(),
                preconditions=preconditions,
                add_effects=add_effects,
                del_effects=del_effects,
            )
        )
    return graph_actions


def make_noop(literal: SignedLiteral) -> GraphAction:
    return GraphAction(
        base=None,
        name="noop",
        signature=f"(noop {literal.atom.name} {' '.join(literal.atom.args)})",
        preconditions=frozenset({literal}),
        add_effects=frozenset({literal}),
        del_effects=frozenset(),
    )


def actions_mutex(
    a1: GraphAction,
    a2: GraphAction,
    previous_mutex: Set[FrozenSet[SignedLiteral]],
) -> bool:
    if a1 is a2:
        return False
    if set(a1.add_effects) & set(a2.del_effects):
        return True
    if set(a2.add_effects) & set(a1.del_effects):
        return True
    if set(a1.del_effects) & set(a2.preconditions):
        return True
    if set(a2.del_effects) & set(a1.preconditions):
        return True
    for p1 in a1.preconditions:
        for p2 in a2.preconditions:
            if literal_pair_key(p1, p2) in previous_mutex:
                return True
    return False


@dataclass
class GraphLevel:
    literals: Set[SignedLiteral]
    literal_mutex: Set[FrozenSet[SignedLiteral]]
    actions: Set[GraphAction]
    action_mutex: Set[FrozenSet[GraphAction]]
    supports: Dict[SignedLiteral, Set[GraphAction]]


class PlanningGraph:
    def __init__(self, problem: SchedulingProblem) -> None:
        ground_actions = build_ground_actions(problem)
        self.base_actions = convert_graph_actions(ground_actions)
        init_positive = initial_literals(problem)
        self.base_literals = sorted(
            all_literals_from_actions(ground_actions) | init_positive,
            key=lambda lit: (lit.name, lit.args),
        )
        initial_signed = {
            to_signed(lit, True) if lit in init_positive else to_signed(lit, False)
            for lit in self.base_literals
        }
        first_level = GraphLevel(
            literals=set(initial_signed),
            literal_mutex=set(),
            actions=set(),
            action_mutex=set(),
            supports={lit: set() for lit in initial_signed},
        )
        self.levels: List[GraphLevel] = [first_level]

    def expand(self) -> None:
        prev = self.levels[-1]
        applicable: Set[GraphAction] = set()
        for action in self.base_actions:
            if self._is_action_applicable(action, prev.literals, prev.literal_mutex):
                applicable.add(action)
        noop_actions = {make_noop(lit) for lit in prev.literals}
        candidate_actions = applicable | noop_actions

        action_mutex: Set[FrozenSet[GraphAction]] = set()
        for a1, a2 in combinations(candidate_actions, 2):
            if actions_mutex(a1, a2, prev.literal_mutex):
                action_mutex.add(frozenset((a1, a2)))

        next_literals: Set[SignedLiteral] = set()
        supports: Dict[SignedLiteral, Set[GraphAction]] = {}
        for action in candidate_actions:
            for eff in action.add_effects:
                next_literals.add(eff)
                supports.setdefault(eff, set()).add(action)

        literal_mutex: Set[FrozenSet[SignedLiteral]] = set()
        for l1, l2 in combinations(next_literals, 2):
            if self._literals_mutex(l1, l2, supports, action_mutex):
                literal_mutex.add(literal_pair_key(l1, l2))

        self.levels.append(
            GraphLevel(
                literals=next_literals,
                literal_mutex=literal_mutex,
                actions=candidate_actions,
                action_mutex=action_mutex,
                supports=supports,
            )
        )

    @staticmethod
    def _is_action_applicable(
        action: GraphAction,
        literals: Set[SignedLiteral],
        mutex: Set[FrozenSet[SignedLiteral]],
    ) -> bool:
        if not action.preconditions.issubset(literals):
            return False
        for p1, p2 in combinations(action.preconditions, 2):
            if literal_pair_key(p1, p2) in mutex:
                return False
        return True

    @staticmethod
    def _literals_mutex(
        l1: SignedLiteral,
        l2: SignedLiteral,
        supports: Dict[SignedLiteral, Set[GraphAction]],
        action_mutex: Set[FrozenSet[GraphAction]],
    ) -> bool:
        if l1.atom == l2.atom and l1.is_positive != l2.is_positive:
            return True
        producers1 = supports.get(l1, set())
        producers2 = supports.get(l2, set())
        if not producers1 or not producers2:
            return True
        for a1 in producers1:
            for a2 in producers2:
                if a1 == a2:
                    return False
                if frozenset((a1, a2)) not in action_mutex:
                    return False
        return True

    def goals_possible(self, goals: Set[SignedLiteral]) -> bool:
        level = self.levels[-1]
        if not goals.issubset(level.literals):
            return False
        for g1, g2 in combinations(goals, 2):
            if literal_pair_key(g1, g2) in level.literal_mutex:
                return False
        return True

    def leveled_off(self) -> bool:
        if len(self.levels) < 2:
            return False
        return self.levels[-1].literals == self.levels[-2].literals


def regress_actions(actions: Set[GraphAction]) -> Set[SignedLiteral]:
    goals: Set[SignedLiteral] = set()
    for action in actions:
        goals.update(action.preconditions)
    return goals


def extract_plan(graph: PlanningGraph, goals: Set[SignedLiteral]) -> Tuple[Optional[List[GraphAction]], int]:
    memo: Dict[Tuple[int, FrozenSet[SignedLiteral]], Optional[List[GraphAction]]] = {}
    expansions = 0

    def helper(level_idx: int, sub_goals: Set[SignedLiteral]) -> Optional[List[GraphAction]]:
        nonlocal expansions
        expansions += 1
        key = (level_idx, frozenset(sub_goals))
        if key in memo:
            return memo[key]
        if level_idx == 0:
            if sub_goals.issubset(graph.levels[0].literals):
                memo[key] = []
                return []
            memo[key] = None
            return None

        current_level = graph.levels[level_idx]
        goal_order = sorted(sub_goals, key=lambda lit: len(current_level.supports.get(lit, set())))

        def backtrack(remaining: List[SignedLiteral], chosen: List[GraphAction]) -> Optional[List[GraphAction]]:
            if not remaining:
                regress = regress_actions(set(chosen))
                previous = helper(level_idx - 1, regress)
                if previous is not None:
                    return previous + chosen
                return None
            target = remaining[0]
            supporters = current_level.supports.get(target, set())
            for action in supporters:
                if any(frozenset((action, other)) in current_level.action_mutex for other in chosen):
                    continue
                new_remaining = [
                    goal for goal in remaining[1:] if goal not in set(action.add_effects)
                ]
                result = backtrack(new_remaining, chosen + [action])
                if result is not None:
                    return result
            return None

        plan = backtrack(goal_order, [])
        memo[key] = plan
        return plan

    return helper(len(graph.levels) - 1, goals), expansions


def ground_goal_literals(problem: SchedulingProblem) -> Set[SignedLiteral]:
    return {SignedLiteral(Literal("completed", (task,)), True) for task in problem.goal_tasks}


def load_problem(domain_path: pathlib.Path, problem_path: pathlib.Path) -> SchedulingProblem:
    domain_name = parse_domain_name(domain_path)
    problem = parse_scheduling_problem(problem_path)
    if problem.domain != domain_name:
        raise PDDLParsingError(
            f"O problema '{problem.name}' declara domínio '{problem.domain}', "
            f"mas o arquivo fornecido define '{domain_name}'."
        )
    return problem


def solve_graphplan(problem: SchedulingProblem, max_levels: int = 60) -> Optional[GraphplanResult]:
    goals = ground_goal_literals(problem)
    graph = PlanningGraph(problem)

    for _ in range(max_levels):
        if graph.goals_possible(goals):
            plan_actions, expansions = extract_plan(graph, goals)
            if plan_actions is not None:
                plan = [
                    action.base
                    for action in plan_actions
                    if action.base is not None and action.base.name != "noop"
                ]
                return GraphplanResult(
                    plan=plan,
                    horizon=len(graph.levels) - 1,
                    expanded_nodes=expansions,
                )
        if graph.leveled_off():
            break
        graph.expand()

    return None


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Planejador Graphplan para o domínio de escalonamento."
    )
    parser.add_argument("domain", type=pathlib.Path, help="Caminho para domain.pddl.")
    parser.add_argument("problem", type=pathlib.Path, help="Caminho para schedule*.pddl.")
    parser.add_argument(
        "--max-levels",
        type=int,
        default=60,
        help="Limite máximo de níveis do grafo de planejamento.",
    )
    parser.add_argument(
        "--show-plan",
        action="store_true",
        help="Exibe o plano encontrado.",
    )
    args = parser.parse_args(argv)

    start = time.perf_counter()
    problem = load_problem(args.domain, args.problem)
    result = solve_graphplan(problem, max_levels=args.max_levels)
    elapsed = time.perf_counter() - start

    if result is None:
        print("Nenhum plano encontrado.")
        return 1

    print(f"Plano encontrado com {len(result.plan)} ações relevantes.")
    print(f"Horizonte: {result.horizon}")
    print(f"Nós expandidos na extração: {result.expanded_nodes}")
    print(f"Tempo: {elapsed:.3f} s")
    if args.show_plan:
        for action in result.plan:
            print(f"  {action.signature()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
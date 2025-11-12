from __future__ import annotations

import argparse
import itertools
import pathlib
import time
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Sequence, Set, Tuple

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
from plan_validator import validate_plan as validate_plan_strings

try:
    from pysat.formula import CNF
    from pysat.solvers import Minisat22

    HAS_PYSAT = True
except ImportError:
    HAS_PYSAT = False


@dataclass
class SATPlanResult:
    plan: List[GroundAction]
    horizon: int
    variables: int
    clauses: int


class CNFBuilder:
    def __init__(self) -> None:
        self.var_index: Dict[Tuple[str, Tuple], int] = {}
        self.reverse_index: Dict[int, Tuple[str, Tuple]] = {}
        self.clauses: List[List[int]] = []

    def new_var(self, kind: str, key: Tuple) -> int:
        ident = (kind, key)
        if ident not in self.var_index:
            next_id = len(self.var_index) + 1
            self.var_index[ident] = next_id
            self.reverse_index[next_id] = ident
        return self.var_index[ident]

    def literal_var(self, literal: Literal, time: int) -> int:
        return self.new_var("p", (literal.key(), time))

    def action_var(self, action: GroundAction, time: int) -> int:
        return self.new_var("a", (action.signature(), time))

    def add_clause(self, literals: Iterable[int]) -> None:
        clause = list(literals)
        if not clause:
            clause = [0]
        self.clauses.append(clause)


def evaluate_clause(clause: List[int], assignment: Dict[int, bool]) -> Tuple[Optional[bool], List[int]]:
    unassigned: List[int] = []
    for lit in clause:
        var = abs(lit)
        if var in assignment:
            val = assignment[var]
            if (lit > 0 and val) or (lit < 0 and not val):
                return True, []
        else:
            unassigned.append(lit)
    if not unassigned:
        return False, []
    return None, unassigned


def unit_propagate(clauses: List[List[int]], assignment: Dict[int, bool]) -> Optional[Dict[int, bool]]:
    changed = True
    while changed:
        changed = False
        for clause in clauses:
            status, unassigned = evaluate_clause(clause, assignment)
            if status is False:
                return None
            if status is True:
                continue
            if len(unassigned) == 1:
                lit = unassigned[0]
                var = abs(lit)
                value = lit > 0
                current = assignment.get(var)
                if current is not None and current != value:
                    return None
                if current is None:
                    assignment[var] = value
                    changed = True
    return assignment


def pure_literal_elimination(clauses: List[List[int]], assignment: Dict[int, bool]) -> None:
    occurrences: Dict[int, Set[int]] = {}
    for clause in clauses:
        status, _ = evaluate_clause(clause, assignment)
        if status is True:
            continue
        for lit in clause:
            var = abs(lit)
            if var in assignment:
                continue
            occurrences.setdefault(var, set()).add(1 if lit > 0 else -1)
    for var, signs in occurrences.items():
        if len(signs) == 1:
            assignment[var] = 1 in signs


def select_unassigned(clauses: List[List[int]], assignment: Dict[int, bool]) -> Optional[int]:
    scores: Dict[int, int] = {}
    for clause in clauses:
        status, unassigned = evaluate_clause(clause, assignment)
        if status is True or not unassigned:
            continue
        for lit in unassigned:
            var = abs(lit)
            if var in assignment:
                continue
            scores[var] = scores.get(var, 0) + 1
    if not scores:
        return None
    return max(scores.items(), key=lambda item: item[1])[0]


def dpll(clauses: List[List[int]], num_vars: int) -> Optional[Dict[int, bool]]:
    assignment: Dict[int, bool] = {}
    result = unit_propagate(clauses, assignment)
    if result is None:
        return None
    pure_literal_elimination(clauses, assignment)
    return _dpll_recursive(clauses, num_vars, assignment)


def _dpll_recursive(
    clauses: List[List[int]],
    num_vars: int,
    assignment: Dict[int, bool],
) -> Optional[Dict[int, bool]]:
    assignment = dict(assignment)
    propagation = unit_propagate(clauses, assignment)
    if propagation is None:
        return None
    assignment = propagation
    pure_literal_elimination(clauses, assignment)

    all_satisfied = True
    for clause in clauses:
        status, _ = evaluate_clause(clause, assignment)
        if status is False:
            return None
        if status is None:
            all_satisfied = False
    if all_satisfied:
        return assignment

    var = select_unassigned(clauses, assignment)
    if var is None:
        for candidate in range(1, num_vars + 1):
            if candidate not in assignment:
                var = candidate
                break
        else:
            return assignment

    for value in (True, False):
        new_assignment = dict(assignment)
        new_assignment[var] = value
        result = _dpll_recursive(clauses, num_vars, new_assignment)
        if result is not None:
            return result
    return None


def solve_with_pysat(builder: CNFBuilder) -> Optional[Dict[int, bool]]:
    if not HAS_PYSAT:
        return None
    cnf = CNF()
    cnf.nv = len(builder.var_index)
    for clause in builder.clauses:
        cnf.append(clause)
    with Minisat22(bootstrap_with=cnf.clauses) as solver:
        if not solver.solve():
            return None
        model = solver.get_model()
    assignment: Dict[int, bool] = {}
    for lit in model:
        var = abs(lit)
        if var <= len(builder.var_index):
            assignment[var] = lit > 0
    return assignment


def encode_problem(
    problem: SchedulingProblem,
    horizon: int,
    actions: List[GroundAction],
    literals: List[Literal],
) -> CNFBuilder:
    builder = CNFBuilder()
    initial = initial_literals(problem)
    literal_set = set(literals)

    for lit in literal_set:
        var = builder.literal_var(lit, 0)
        if lit in initial:
            builder.add_clause([var])
        else:
            builder.add_clause([-var])

    goal_literals = [Literal("completed", (task,)) for task in problem.goal_tasks]
    for goal in goal_literals:
        if goal not in literal_set:
            literal_set.add(goal)
        clause_var = builder.literal_var(goal, horizon)
        builder.add_clause([clause_var])

    for t in range(horizon):
        for action in actions:
            a_var = builder.action_var(action, t)
            for pre in action.preconditions_pos:
                builder.add_clause([-a_var, builder.literal_var(pre, t)])
            for pre in action.preconditions_neg:
                builder.add_clause([-a_var, -builder.literal_var(pre, t)])
            for eff in action.add_effects:
                builder.add_clause([-a_var, builder.literal_var(eff, t + 1)])
            for eff in action.del_effects:
                builder.add_clause([-a_var, -builder.literal_var(eff, t + 1)])

        for lit in literal_set:
            adders = [builder.action_var(action, t) for action in actions if lit in action.add_effects]
            deleters = [builder.action_var(action, t) for action in actions if lit in action.del_effects]
            if adders:
                clause = [builder.literal_var(lit, t), -builder.literal_var(lit, t + 1)] + adders
                builder.add_clause(clause)
            if deleters:
                clause = [-builder.literal_var(lit, t), builder.literal_var(lit, t + 1)] + deleters
                builder.add_clause(clause)

        for a1, a2 in itertools.combinations(actions, 2):
            builder.add_clause(
                [-builder.action_var(a1, t), -builder.action_var(a2, t)]
            )

    return builder


def extract_plan(
    builder: CNFBuilder,
    assignment: Dict[int, bool],
    horizon: int,
    actions: List[GroundAction],
) -> List[GroundAction]:
    plan: List[GroundAction] = []
    for t in range(horizon):
        for action in actions:
            var = builder.action_var(action, t)
            if assignment.get(var):
                plan.append(action)
    return plan


def sat_plan(
    problem: SchedulingProblem,
    max_horizon: int = 30,
    solver: str = "auto",
) -> Optional[SATPlanResult]:
    if solver == "pysat" and not HAS_PYSAT:
        raise RuntimeError(
            "Solver PySAT não disponível. Instale o pacote 'python-sat[pblib,aiger]' para habilitar."
        )
    actions = build_ground_actions(problem)
    literal_universe = sorted(
        all_literals_from_actions(actions) | initial_literals(problem),
        key=lambda lit: lit.key(),
    )
    min_horizon = max(1, len(problem.goal_tasks) * 2)

    for horizon in range(min_horizon, max_horizon + 1):
        builder = encode_problem(problem, horizon, actions, literal_universe)
        if solver == "pysat":
            solution = solve_with_pysat(builder)
        elif solver == "dpll":
            solution = dpll(builder.clauses, len(builder.var_index))
        else:  # auto
            solution = solve_with_pysat(builder) if HAS_PYSAT else None
            if solution is None:
                solution = dpll(builder.clauses, len(builder.var_index))
        if solution is not None:
            plan = extract_plan(builder, solution, horizon, actions)
            plan = [act for act in plan if act.name != "noop"]
            if validate_plan(problem, plan):
                return SATPlanResult(
                    plan=plan,
                    horizon=horizon,
                    variables=len(builder.var_index),
                    clauses=len(builder.clauses),
                )
    return None


def validate_plan(problem: SchedulingProblem, plan: List[GroundAction]) -> bool:
    plan_strings = [action.signature() for action in plan]
    ok, _ = validate_plan_strings(problem, plan_strings)
    return ok


def load_problem(domain_path: pathlib.Path, problem_path: pathlib.Path) -> SchedulingProblem:
    domain_name = parse_domain_name(domain_path)
    problem = parse_scheduling_problem(problem_path)
    if problem.domain != domain_name:
        raise PDDLParsingError(
            f"O problema '{problem.name}' declara domínio '{problem.domain}', "
            f"mas o arquivo fornecido define '{domain_name}'."
        )
    return problem


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Planejador SATPlan para o domínio de escalonamento."
    )
    parser.add_argument("domain", type=pathlib.Path, help="Caminho para domain.pddl.")
    parser.add_argument("problem", type=pathlib.Path, help="Caminho para schedule*.pddl.")
    parser.add_argument(
        "--max-horizon",
        type=int,
        default=30,
        help="Horizonte máximo para a codificação SAT.",
    )
    parser.add_argument(
        "--solver",
        choices=["auto", "dpll", "pysat"],
        default="auto",
        help="Solver SAT utilizado (auto tenta usar PySAT e recai para DPLL).",
    )
    parser.add_argument(
        "--show-plan",
        action="store_true",
        help="Exibe o plano encontrado.",
    )
    args = parser.parse_args(argv)

    start = time.perf_counter()
    problem = load_problem(args.domain, args.problem)
    try:
        result = sat_plan(problem, max_horizon=args.max_horizon, solver=args.solver)
    except RuntimeError as exc:
        print(f"Erro: {exc}")
        return 1
    elapsed = time.perf_counter() - start

    if result is None:
        print("Nenhum plano encontrado.")
        return 1

    print(f"Plano encontrado com {len(result.plan)} ações.")
    print(f"Horizonte: {result.horizon}")
    print(f"Variáveis: {result.variables} | Cláusulas: {result.clauses}")
    print(f"Tempo: {elapsed:.3f} s")
    if args.show_plan:
        for action in result.plan:
            print(f"  {action.signature()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


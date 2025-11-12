from __future__ import annotations

import argparse
import pathlib
import time
from dataclasses import dataclass
from typing import Dict, List, Optional

from heuristics import HeuristicType
from pddl import PDDLParsingError, SchedulingProblem, parse_domain_name, parse_scheduling_problem
from planner_graphplan import GraphplanResult, solve_graphplan
from planner_sat import SATPlanResult, sat_plan
from planner_strips import PlanResult, solve_strips


@dataclass
class ExperimentResult:
    planner: str
    problem: str
    success: bool
    runtime: float
    plan_length: Optional[int] = None
    metrics: Optional[Dict[str, int | float]] = None


def prepare_problem(domain_path: pathlib.Path, problem_path: pathlib.Path) -> SchedulingProblem:
    domain_name = parse_domain_name(domain_path)
    problem = parse_scheduling_problem(problem_path)
    if problem.domain != domain_name:
        raise PDDLParsingError(
            f"O problema '{problem.name}' declara domínio '{problem.domain}', "
            f"mas o arquivo fornecido define '{domain_name}'."
        )
    return problem


def run_strips(problem: SchedulingProblem, heuristic: HeuristicType) -> tuple[Optional[PlanResult], float]:
    start = time.perf_counter()
    result = solve_strips(problem, heuristic=heuristic)
    elapsed = time.perf_counter() - start
    return result, elapsed


def run_graphplan(problem: SchedulingProblem, max_levels: int) -> tuple[Optional[GraphplanResult], float]:
    start = time.perf_counter()
    result = solve_graphplan(problem, max_levels=max_levels)
    elapsed = time.perf_counter() - start
    return result, elapsed


def run_sat(problem: SchedulingProblem, max_horizon: int, solver: str) -> tuple[Optional[SATPlanResult], float]:
    start = time.perf_counter()
    result = sat_plan(problem, max_horizon=max_horizon, solver=solver)
    elapsed = time.perf_counter() - start
    return result, elapsed


def format_result(result: ExperimentResult) -> str:
    status = "ok" if result.success else "falha"
    metrics_str = ""
    if result.metrics:
        metrics_parts = [f"{key}={value}" for key, value in result.metrics.items()]
        metrics_str = " | " + ", ".join(metrics_parts)
    length_str = f", ações={result.plan_length}" if result.plan_length is not None else ""
    return f"[{result.planner}] {result.problem}: {status} (t={result.runtime:.3f}s{length_str}{metrics_str})"


def run_experiments(
    domain_path: pathlib.Path,
    problem_paths: List[pathlib.Path],
    max_levels: int,
    max_horizon: int,
    sat_solver: str,
) -> List[ExperimentResult]:
    outcomes: List[ExperimentResult] = []
    strips_variants = [
        ("STRIPS (BFS)", HeuristicType.BFS),
        ("STRIPS (h_add)", HeuristicType.H_ADD),
        ("STRIPS (h_max)", HeuristicType.H_MAX),
    ]

    for problem_path in problem_paths:
        problem = prepare_problem(domain_path, problem_path)

        for planner_name, heuristic in strips_variants:
            strips_result, strips_time = run_strips(problem, heuristic)
            if strips_result is None:
                outcomes.append(
                    ExperimentResult(
                        planner=planner_name,
                        problem=problem.name,
                        success=False,
                        runtime=strips_time,
                        metrics={"heurística": heuristic.value},
                    )
                )
            else:
                outcomes.append(
                    ExperimentResult(
                        planner=planner_name,
                        problem=problem.name,
                        success=True,
                        runtime=strips_time,
                        plan_length=strips_result.plan_length,
                        metrics={
                            "heurística": heuristic.value,
                            "expandidos": strips_result.expanded_nodes,
                            "gerados": strips_result.generated_nodes,
                        },
                    )
                )

        graph_result, graph_time = run_graphplan(problem, max_levels=max_levels)
        if graph_result is None:
            outcomes.append(
                ExperimentResult(
                    planner="Graphplan",
                    problem=problem.name,
                    success=False,
                    runtime=graph_time,
                )
            )
        else:
            outcomes.append(
                ExperimentResult(
                    planner="Graphplan",
                    problem=problem.name,
                    success=True,
                    runtime=graph_time,
                    plan_length=len(graph_result.plan),
                    metrics={
                        "horizonte": graph_result.horizon,
                        "expandidos": graph_result.expanded_nodes,
                    },
                )
            )

        sat_result, sat_time = run_sat(problem, max_horizon=max_horizon, solver=sat_solver)
        if sat_result is None:
            outcomes.append(
                ExperimentResult(
                    planner="SATPlan",
                    problem=problem.name,
                    success=False,
                    runtime=sat_time,
                    metrics={"solver": sat_solver},
                )
            )
        else:
            outcomes.append(
                ExperimentResult(
                    planner="SATPlan",
                    problem=problem.name,
                    success=True,
                    runtime=sat_time,
                    plan_length=len(sat_result.plan),
                    metrics={
                        "solver": sat_solver,
                        "horizonte": sat_result.horizon,
                        "variáveis": sat_result.variables,
                        "cláusulas": sat_result.clauses,
                    },
                )
            )

    return outcomes


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Executa os três planejadores em série e registra métricas básicas."
    )
    parser.add_argument(
        "--domain",
        type=pathlib.Path,
        default=pathlib.Path("domain.pddl"),
        help="Arquivo de domínio PDDL.",
    )
    parser.add_argument(
        "--problems",
        type=pathlib.Path,
        nargs="*",
        default=[pathlib.Path("schedule1.pddl"), pathlib.Path("schedule2.pddl"), pathlib.Path("schedule3.pddl")],
        help="Lista de arquivos de problema.",
    )
    parser.add_argument(
        "--max-levels",
        type=int,
        default=60,
        help="Limite de níveis do Graphplan.",
    )
    parser.add_argument(
        "--max-horizon",
        type=int,
        default=30,
        help="Horizonte máximo para o SATPlan.",
    )
    parser.add_argument(
        "--sat-solver",
        choices=["auto", "dpll", "pysat"],
        default="auto",
        help="Solver utilizado nas execuções do SATPlan.",
    )
    args = parser.parse_args()

    results = run_experiments(
        args.domain,
        list(args.problems),
        args.max_levels,
        args.max_horizon,
        args.sat_solver,
    )
    for output in results:
        print(format_result(output))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


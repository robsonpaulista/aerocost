from __future__ import annotations

import argparse
import pathlib
from typing import List, Optional, Sequence

from heuristics import HeuristicType
from planner_graphplan import solve_graphplan
from planner_sat import sat_plan
from planner_strips import solve_strips
from pddl import (
    PDDLParsingError,
    SchedulingProblem,
    parse_domain_name,
    parse_scheduling_problem,
)
from visualization import save_timeline


def load_problem(domain_path: pathlib.Path, problem_path: pathlib.Path) -> SchedulingProblem:
    domain_name = parse_domain_name(domain_path)
    problem = parse_scheduling_problem(problem_path)
    if problem.domain != domain_name:
        raise PDDLParsingError(
            f"O problema '{problem.name}' declara domínio '{problem.domain}', "
            f"mas o arquivo fornecido define '{domain_name}'."
        )
    return problem


def run_planner(
    planner: str,
    problem: SchedulingProblem,
    heuristic: HeuristicType,
    max_levels: int,
    max_horizon: int,
    sat_solver: str,
) -> List[str]:
    if planner == "strips":
        result = solve_strips(problem, heuristic=heuristic)
        if result is None:
            raise RuntimeError("STRIPS não encontrou plano.")
        return result.actions
    if planner == "graphplan":
        result = solve_graphplan(problem, max_levels=max_levels)
        if result is None:
            raise RuntimeError("Graphplan não encontrou plano.")
        return [action.signature() for action in result.plan]
    if planner == "satplan":
        result = sat_plan(problem, max_horizon=max_horizon, solver=sat_solver)
        if result is None:
            raise RuntimeError("SATPlan não encontrou plano.")
        return [action.signature() for action in result.plan]
    raise ValueError(f"Planejador desconhecido: {planner}")


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Gera visualização (timeline) para planos do domínio de escalonamento."
    )
    parser.add_argument("domain", type=pathlib.Path, help="Caminho para domain.pddl.")
    parser.add_argument("problem", type=pathlib.Path, help="Caminho para schedule*.pddl.")
    parser.add_argument(
        "--planner",
        choices=["strips", "graphplan", "satplan"],
        default="strips",
        help="Planejador utilizado para gerar o plano.",
    )
    parser.add_argument(
        "--heuristic",
        choices=[heuristic.value for heuristic in HeuristicType],
        default=HeuristicType.BFS.value,
        help="Heurística utilizada pelo STRIPS (ignoradas nos demais planejadores).",
    )
    parser.add_argument(
        "--max-levels",
        type=int,
        default=60,
        help="Limite de níveis para o Graphplan.",
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
        help="Solver usado pelo SATPlan.",
    )
    parser.add_argument(
        "--output",
        type=pathlib.Path,
        default=pathlib.Path("plan_timeline.html"),
        help="Arquivo de saída (.html, .png, .pdf, .svg, .jpg).",
    )
    args = parser.parse_args(argv)

    problem = load_problem(args.domain, args.problem)
    plan = run_planner(
        planner=args.planner,
        problem=problem,
        heuristic=HeuristicType(args.heuristic),
        max_levels=args.max_levels,
        max_horizon=args.max_horizon,
        sat_solver=args.sat_solver,
    )
    if not plan:
        print("Plano vazio; nada para visualizar.")
        return 1

    try:
        save_timeline(plan, args.output, f"Cronograma ({args.planner})")
    except ValueError as exc:
        print(f"Erro ao gerar visualização: {exc}")
        return 1
    print(f"Visualização salva em {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


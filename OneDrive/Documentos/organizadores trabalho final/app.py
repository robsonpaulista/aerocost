from __future__ import annotations

import time
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import streamlit as st

from heuristics import HeuristicType
from pddl import (
    PDDLParsingError,
    SchedulingProblem,
    parse_domain_name,
    parse_scheduling_problem,
)
from planner_graphplan import GraphplanResult, solve_graphplan
from planner_sat import SATPlanResult, sat_plan
from planner_strips import PlanResult, solve_strips
from visualization import build_timeline, make_timeline_figure


DOMAIN_PATH = Path("domain.pddl")
PROBLEM_OPTIONS: Dict[str, Path] = {
    "schedule1": Path("schedule1.pddl"),
    "schedule2": Path("schedule2.pddl"),
    "schedule3": Path("schedule3.pddl"),
}


@st.cache_data
def load_problem(problem_path: Path) -> SchedulingProblem:
    domain_name = parse_domain_name(DOMAIN_PATH)
    problem = parse_scheduling_problem(problem_path)
    if problem.domain != domain_name:
        raise PDDLParsingError(
            f"O problema '{problem.name}' pertence ao domínio '{problem.domain}', "
            f"mas o domínio carregado é '{domain_name}'."
        )
    return problem


def format_plan_str(plan: Iterable[str]) -> str:
    return "\n".join(plan)


def show_timeline(plan: Iterable[str], label: str) -> None:
    df = build_timeline(plan)
    if df.empty:
        st.info(f"Sem dados suficientes para o gráfico ({label}).")
        return
    fig = make_timeline_figure(df, f"Cronograma das tarefas ({label})")
    st.plotly_chart(fig, use_container_width=True)


def solve_with_strips(problem: SchedulingProblem, heuristic: HeuristicType) -> Dict[str, object]:
    start = time.perf_counter()
    result = solve_strips(problem, heuristic=heuristic)
    elapsed = time.perf_counter() - start
    if result is None:
        return {"success": False, "time": elapsed}
    return {
        "success": True,
        "time": elapsed,
        "length": result.plan_length,
        "expanded": result.expanded_nodes,
        "generated": result.generated_nodes,
        "plan": result.actions,
        "heuristic": heuristic.value,
    }


def solve_with_graphplan(problem: SchedulingProblem, max_levels: int) -> Dict[str, object]:
    start = time.perf_counter()
    result = solve_graphplan(problem, max_levels=max_levels)
    elapsed = time.perf_counter() - start
    if result is None:
        return {"success": False, "time": elapsed}
    return {
        "success": True,
        "time": elapsed,
        "length": len(result.plan),
        "horizon": result.horizon,
        "expanded": result.expanded_nodes,
        "plan": [action.signature() for action in result.plan],
    }


def solve_with_satplan(problem: SchedulingProblem, max_horizon: int, solver: str) -> Dict[str, object]:
    start = time.perf_counter()
    try:
        result = sat_plan(problem, max_horizon=max_horizon, solver=solver)
    except RuntimeError as exc:
        return {"success": False, "time": 0.0, "error": str(exc)}
    elapsed = time.perf_counter() - start
    if result is None:
        return {"success": False, "time": elapsed}
    return {
        "success": True,
        "time": elapsed,
        "length": len(result.plan),
        "horizon": result.horizon,
        "variables": result.variables,
        "clauses": result.clauses,
        "plan": [action.signature() for action in result.plan],
        "solver": solver,
    }


def main() -> None:
    st.set_page_config(page_title="Planejadores Clássicos", layout="wide")
    st.title("Planejadores Clássicos para Escalonamento de Tarefas")
    st.markdown(
        "Selecione uma instância PDDL e execute os planejadores para visualizar planos e métricas. "
        "Os arquivos `domain.pddl` e `schedule{1,2,3}.pddl` precisam estar na mesma pasta deste aplicativo."
    )

    col_problem, col_sat = st.columns([2, 1])
    with col_problem:
        option = st.selectbox(
            "Instância de problema",
            options=list(PROBLEM_OPTIONS.keys()),
            index=0,
            format_func=lambda key: f"{key} ({PROBLEM_OPTIONS[key].name})",
        )
    with col_sat:
        max_horizon = st.slider(
            "Horizonte máximo (SATPlan)",
            min_value=4,
            max_value=30,
            value=12,
            help="Quanto maior o horizonte, mais pesado se torna o SATPlan. "
                 "A instância schedule3 requer horizonte mínimo 12.",
        )

    col_planners = st.columns(4)
    with col_planners[0]:
        run_strips_flag = st.checkbox("Executar STRIPS", value=True)
    with col_planners[1]:
        run_graphplan_flag = st.checkbox("Executar Graphplan", value=True)
    with col_planners[2]:
        run_satplan_flag = st.checkbox("Executar SATPlan", value=False)
    with col_planners[3]:
        heuristic_choice = st.selectbox(
            "Heurística STRIPS",
            options=[
                (label, heuristic)
                for label, heuristic in [
                    ("Busca em largura", HeuristicType.BFS),
                    ("h_add (A*)", HeuristicType.H_ADD),
                    ("h_max (A*)", HeuristicType.H_MAX),
                ]
            ],
            index=0,
            format_func=lambda item: item[0],
        )
    sat_solver = st.selectbox(
        "Solver SAT",
        options=[("Automático (PySAT ➜ DPLL)", "auto"), ("PySAT (Minisat22)", "pysat"), ("DPLL interno", "dpll")],
        format_func=lambda item: item[0],
        index=0,
        help="É necessário ter o pacote python-sat instalado para usar o PySAT.",
    )

    st.divider()

    run_button = st.button("Executar planejadores selecionados", type="primary")

    if not run_button:
        st.info("Selecione os planejadores desejados e pressione o botão acima para executar.")
        return

    problem_path = PROBLEM_OPTIONS[option]

    try:
        problem = load_problem(problem_path)
    except (PDDLParsingError, FileNotFoundError) as exc:
        st.error(f"Erro ao carregar problema: {exc}")
        return

    if run_strips_flag:
        with st.spinner("Executando STRIPS..."):
            strips_result = solve_with_strips(problem, heuristic_choice[1])
        st.subheader("Resultado STRIPS")
        if strips_result["success"]:
            st.success(
                f"Plano com {strips_result['length']} ações\u200b | "
                f"Tempo: {strips_result['time']:.3f} s | "
                f"Nós expandidos: {strips_result['expanded']} | "
                f"Nós gerados: {strips_result['generated']} | "
                f"Heurística: {strips_result['heuristic']}"
            )
            st.code(format_plan_str(strips_result["plan"]))
            show_timeline(strips_result["plan"], "STRIPS")
        else:
            st.warning(f"Nenhum plano encontrado ({strips_result['time']:.3f} s).")

    if run_graphplan_flag:
        with st.spinner("Executando Graphplan..."):
            graph_result = solve_with_graphplan(problem, max_levels=max_horizon)
        st.subheader("Resultado Graphplan")
        if graph_result["success"]:
            st.success(
                f"Plano com {graph_result['length']} ações\u200b | "
                f"Tempo: {graph_result['time']:.3f} s | "
                f"Horizonte: {graph_result['horizon']} | "
                f"Nós expandidos (extração): {graph_result['expanded']}"
            )
            st.code(format_plan_str(graph_result["plan"]))
            show_timeline(graph_result["plan"], "Graphplan")
        else:
            st.warning(f"Nenhum plano encontrado ({graph_result['time']:.3f} s).")

    if run_satplan_flag:
        with st.spinner("Executando SATPlan (pode demorar)..."):
            sat_result = solve_with_satplan(problem, max_horizon=max_horizon, solver=sat_solver[1])
        st.subheader("Resultado SATPlan")
        if sat_result["success"]:
            st.success(
                f"Plano com {sat_result['length']} ações\u200b | "
                f"Tempo: {sat_result['time']:.3f} s | "
                f"Horizonte: {sat_result['horizon']} | "
                f"Variáveis: {sat_result['variables']} | "
                f"Cláusulas: {sat_result['clauses']} | "
                f"Solver: {sat_result['solver']}"
            )
            st.code(format_plan_str(sat_result["plan"]))
            show_timeline(sat_result["plan"], "SATPlan")
        elif "error" in sat_result:
            st.error(sat_result["error"])
        else:
            st.warning(f"Nenhum plano encontrado ({sat_result['time']:.3f} s).")


if __name__ == "__main__":
    main()


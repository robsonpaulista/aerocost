from __future__ import annotations

import argparse
import pathlib
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from pddl import (
    PDDLParsingError,
    SchedulingProblem,
    parse_domain_name,
    parse_scheduling_problem,
)


@dataclass
class ValidationResult:
    ok: bool
    message: str


def load_problem(domain_path: pathlib.Path, problem_path: pathlib.Path) -> SchedulingProblem:
    domain_name = parse_domain_name(domain_path)
    problem = parse_scheduling_problem(problem_path)
    if problem.domain != domain_name:
        raise PDDLParsingError(
            f"O problema '{problem.name}' declara domínio '{problem.domain}', "
            f"mas o arquivo fornecido define '{domain_name}'."
        )
    return problem


def parse_plan_lines(lines: Iterable[str]) -> List[str]:
    actions: List[str] = []
    for raw in lines:
        raw = raw.strip()
        if not raw or raw.startswith(";"):
            continue
        if not raw.startswith("("):
            continue
        raw = raw.split(";", 1)[0].strip()
        if raw:
            actions.append(raw)
    return actions


def apply_plan(problem: SchedulingProblem, plan: List[str]) -> ValidationResult:
    available_ops = set(problem.operators & problem.initial_available)
    available_machines = set(problem.machines & problem.initial_available)
    completed = set(problem.initial_completed)
    assignments: Dict[str, Tuple[str, str]] = dict(problem.initial_in_progress)

    def parse(action: str) -> Tuple[str, List[str]]:
        action = action.strip()
        if not action.startswith("(") or not action.endswith(")"):
            return "", []
        tokens = action[1:-1].split()
        if not tokens:
            return "", []
        return tokens[0], tokens[1:]

    for step, action_str in enumerate(plan, start=1):
        name, args = parse(action_str)
        if name == "start-task" and len(args) == 3:
            task, operator, machine = args
            if task in completed:
                return ValidationResult(False, f"Passo {step}: tarefa {task} já concluída.")
            if task in assignments:
                return ValidationResult(False, f"Passo {step}: tarefa {task} já em execução.")
            deps = problem.dependencies.get(task, [])
            if any(dep not in completed for dep in deps):
                return ValidationResult(False, f"Passo {step}: dependências de {task} não concluídas.")
            if operator not in available_ops:
                return ValidationResult(False, f"Passo {step}: operador {operator} indisponível.")
            required_machine = problem.machine_requirements.get(task)
            if required_machine and required_machine != machine:
                return ValidationResult(False, f"Passo {step}: tarefa {task} requer máquina {required_machine}.")
            if machine not in available_machines:
                return ValidationResult(False, f"Passo {step}: máquina {machine} indisponível.")
            available_ops.remove(operator)
            available_machines.remove(machine)
            assignments[task] = (operator, machine)
        elif name == "finish-task" and len(args) == 3:
            task, operator, machine = args
            if task not in assignments:
                return ValidationResult(False, f"Passo {step}: tarefa {task} não está em execução.")
            assigned_op, assigned_machine = assignments[task]
            if assigned_op != operator or assigned_machine != machine:
                return ValidationResult(False, f"Passo {step}: operador/máquina não correspondem a {task}.")
            available_ops.add(operator)
            available_machines.add(machine)
            completed.add(task)
            del assignments[task]
        else:
            return ValidationResult(False, f"Passo {step}: ação inválida '{action_str}'.")

    if assignments:
        return ValidationResult(False, "Plano terminou com tarefas ainda em execução.")
    if not problem.goal_tasks.issubset(completed):
        faltam = ", ".join(sorted(problem.goal_tasks - completed))
        return ValidationResult(False, f"Plano inválido: tarefas não concluídas ({faltam}).")
    return ValidationResult(True, "Plano válido.")


def validate_plan(
    problem: SchedulingProblem,
    plan: List[str],
) -> Tuple[bool, str]:
    result = apply_plan(problem, plan)
    return result.ok, result.message


def load_plan_file(path: pathlib.Path) -> List[str]:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            text = path.read_text(encoding="utf-16")
        except UnicodeDecodeError:
            text = path.read_text(encoding="latin-1")
    content = text.splitlines()
    return parse_plan_lines(content)


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Validador simples de planos para o domínio de escalonamento."
    )
    parser.add_argument("domain", type=pathlib.Path, help="Caminho para domain.pddl.")
    parser.add_argument("problem", type=pathlib.Path, help="Caminho para schedule*.pddl.")
    parser.add_argument("plan", type=pathlib.Path, help="Arquivo de plano (uma ação por linha).")
    args = parser.parse_args(argv)

    problem = load_problem(args.domain, args.problem)
    actions = load_plan_file(args.plan)
    ok, message = validate_plan(problem, actions)
    if ok:
        print("Plano válido:", message)
        return 0
    print("Plano inválido:", message)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())


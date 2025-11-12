from __future__ import annotations

import pathlib
import re
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Sequence, Set, Tuple


Token = str
SExpr = Sequence["SExpr"] | Token


class PDDLParsingError(RuntimeError):
    """Erro lançado quando a análise de um arquivo PDDL falha."""


def _strip_comments(raw: str) -> str:
    """Remove comentários iniciados por ';'."""
    cleaned_lines = []
    for line in raw.splitlines():
        idx = line.find(";")
        if idx >= 0:
            line = line[:idx]
        cleaned_lines.append(line)
    return "\n".join(cleaned_lines)


def _tokenize(raw: str) -> List[Token]:
    """Converte o texto (já sem comentários) em tokens."""
    spaced = (
        raw.replace("(", " ( ")
        .replace(")", " ) ")
        .replace("\n", " ")
        .replace("\t", " ")
    )
    tokens = [tok for tok in spaced.split(" ") if tok]
    return tokens


def _parse_tokens(tokens: List[Token]) -> SExpr:
    """Transforma a lista de tokens em uma árvore de S-expressions."""
    stack: List[List[SExpr]] = []
    current: List[SExpr] = []

    it = iter(tokens)
    for tok in it:
        if tok == "(":
            stack.append(current)
            current = []
        elif tok == ")":
            if not stack:
                raise PDDLParsingError("Parêntese fechado sem correspondente.")
            completed = current
            current = stack.pop()
            current.append(completed)
        else:
            current.append(tok.lower())

    if stack:
        raise PDDLParsingError("Parênteses não balanceados no arquivo PDDL.")
    if len(current) != 1:
        raise PDDLParsingError("Estrutura PDDL inválida.")
    return current[0]


def load_sexpr(path: pathlib.Path) -> SExpr:
    """Carrega um arquivo PDDL, produzindo a S-expression raiz."""
    raw_text = path.read_text(encoding="utf-8")
    without_comments = _strip_comments(raw_text)
    tokens = _tokenize(without_comments)
    return _parse_tokens(tokens)


def parse_domain_name(path: str | pathlib.Path) -> str:
    """Recupera o identificador do domínio definido no arquivo."""
    expr = load_sexpr(pathlib.Path(path))
    items = _expect_list(expr)
    if not items or items[0] != "define":
        raise PDDLParsingError("Arquivo de domínio não começa com '(define ...)'.")
    for entry in items[1:]:
        if isinstance(entry, list) and entry:
            if entry[0] == "domain":
                if len(entry) != 2 or not isinstance(entry[1], str):
                    raise PDDLParsingError("Nome do domínio inválido.")
                return entry[1]
    raise PDDLParsingError("Nome do domínio não encontrado.")


def _expect_list(expr: SExpr) -> List[SExpr]:
    if isinstance(expr, str):
        raise PDDLParsingError("S-expression esperada, mas token simples encontrado.")
    return list(expr)


def _expect_keyword(keyword: str, expr: SExpr) -> List[SExpr]:
    items = _expect_list(expr)
    if not items or items[0] != keyword:
        raise PDDLParsingError(f"Seção '{keyword}' não encontrada.")
    return items[1:]


def _flatten(expr: SExpr) -> List[Token]:
    if isinstance(expr, str):
        return [expr]
    out: List[Token] = []
    for item in expr:
        out.extend(_flatten(item))
    return out


def _parse_typed_list(tokens: Sequence[Token], default_type: str = "object") -> Dict[str, List[str]]:
    """Analisa listas tipadas do PDDL, retornando um dicionário tipo -> [objetos]."""
    result: Dict[str, List[str]] = {}
    current: List[str] = []
    idx = 0
    while idx < len(tokens):
        token = tokens[idx]
        if token == "-":
            if idx + 1 >= len(tokens):
                raise PDDLParsingError("Símbolo '-' sem tipo subsequente.")
            type_name = tokens[idx + 1]
            if not current:
                raise PDDLParsingError("Nenhum objeto associado ao tipo declarado.")
            result.setdefault(type_name, []).extend(current)
            current = []
            idx += 2
        else:
            current.append(token)
            idx += 1
    if current:
        result.setdefault(default_type, []).extend(current)
    return result


@dataclass(frozen=True)
class SchedulingProblem:
    name: str
    domain: str
    tasks: Set[str]
    operators: Set[str]
    machines: Set[str]
    initial_available: Set[str]
    initial_in_progress: Dict[str, Tuple[str, str]]
    initial_completed: Set[str]
    dependencies: Dict[str, List[str]]
    machine_requirements: Dict[str, str]
    goal_tasks: Set[str]

    def __post_init__(self) -> None:
        missing = self.goal_tasks - self.tasks
        if missing:
            raise PDDLParsingError(
                f"Tarefas de objetivo não declaradas: {', '.join(sorted(missing))}"
            )


def parse_scheduling_problem(path: str | pathlib.Path) -> SchedulingProblem:
    """Analisa um arquivo schedule*.pddl específico da atividade."""
    expr = load_sexpr(pathlib.Path(path))
    items = _expect_list(expr)
    if not items or items[0] != "define":
        raise PDDLParsingError("Arquivo não começa com '(define ...)'.")

    problem_name = ""
    domain_name = ""
    objects_raw: Optional[List[SExpr]] = None
    init_raw: Optional[List[SExpr]] = None
    goal_raw: Optional[List[SExpr]] = None

    for entry in items[1:]:
        if isinstance(entry, list) and entry:
            head = entry[0]
            if head == "problem":
                if len(entry) != 2 or not isinstance(entry[1], str):
                    raise PDDLParsingError("Nome do problema inválido.")
                problem_name = entry[1]
            elif head == ":domain":
                if len(entry) != 2 or not isinstance(entry[1], str):
                    raise PDDLParsingError("Nome do domínio inválido.")
                domain_name = entry[1]
            elif head == ":objects":
                objects_raw = entry[1:]
            elif head == ":init":
                init_raw = entry[1:]
            elif head == ":goal":
                goal_raw = entry[1:]

    if not problem_name:
        raise PDDLParsingError("Nome do problema não encontrado.")
    if not domain_name:
        raise PDDLParsingError("Nome do domínio não encontrado.")
    if objects_raw is None:
        raise PDDLParsingError("Seção :objects ausente.")
    if init_raw is None:
        raise PDDLParsingError("Seção :init ausente.")
    if goal_raw is None:
        raise PDDLParsingError("Seção :goal ausente.")

    typed_objects = _parse_typed_list(_flatten(objects_raw))
    tasks = set(typed_objects.get("task", []))
    operators = set(typed_objects.get("operator", []))
    machines = set(typed_objects.get("machine", []))

    initial_available: Set[str] = set()
    initial_completed: Set[str] = set()
    dependencies: Dict[str, List[str]] = {task: [] for task in tasks}
    machine_requirements: Dict[str, str] = {}
    initial_in_progress: Dict[str, Tuple[str, str]] = {}

    for fact_expr in init_raw:
        fact = _expect_list(fact_expr)
        if not fact:
            continue
        pred = fact[0]
        args = fact[1:]
        if pred == "available" and len(args) == 1 and isinstance(args[0], str):
            initial_available.add(args[0])
        elif pred == "completed" and len(args) == 1 and isinstance(args[0], str):
            initial_completed.add(args[0])
        elif pred == "depends" and len(args) == 2:
            child, parent = args
            if isinstance(child, str) and isinstance(parent, str):
                dependencies.setdefault(child, []).append(parent)
        elif pred == "requires" and len(args) == 2:
            task, machine = args
            if isinstance(task, str) and isinstance(machine, str):
                machine_requirements[task] = machine

    goal_tasks: Set[str] = set()
    goal_body = goal_raw
    if len(goal_body) == 1 and isinstance(goal_body[0], list) and goal_body[0]:
        if goal_body[0][0] == "and":
            for literal in goal_body[0][1:]:
                lit = _expect_list(literal)
                if lit and lit[0] == "completed" and len(lit) == 2:
                    goal_tasks.add(lit[1])  # type: ignore[arg-type]
        elif goal_body[0][0] == "completed" and len(goal_body[0]) == 2:
            goal_tasks.add(goal_body[0][1])  # type: ignore[arg-type]
    else:
        for literal in goal_body:
            lit = _expect_list(literal)
            if lit and lit[0] == "completed" and len(lit) == 2:
                goal_tasks.add(lit[1])  # type: ignore[arg-type]

    if not goal_tasks:
        raise PDDLParsingError("Objetivo sem tarefas 'completed'.")

    return SchedulingProblem(
        name=problem_name,
        domain=domain_name,
        tasks=tasks,
        operators=operators,
        machines=machines,
        initial_available=initial_available,
        initial_in_progress=initial_in_progress,
        initial_completed=initial_completed,
        dependencies=dependencies,
        machine_requirements=machine_requirements,
        goal_tasks=goal_tasks,
    )


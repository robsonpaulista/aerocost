from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from functools import lru_cache
from typing import Iterable, Protocol, Set

from pddl import SchedulingProblem


class HeuristicType(str, Enum):
    BFS = "bfs"
    H_ADD = "h_add"
    H_MAX = "h_max"


@dataclass
class HeuristicResult:
    value: float


class StateProtocol(Protocol):
    completed: frozenset[str]


class HeuristicCalculator:
    """
    Calcula heurísticas h_add e h_max específicas para o domínio de escalonamento.

    Consideramos que cada tarefa requer duas ações (start/finish). Para os custos
    heurísticos, usamos um valor base de 2 para cada tarefa ainda não concluída
    somado às contribuições de suas predecessoras, de acordo com as definições
    clássicas de h_add (soma) e h_max (máximo).
    """

    def __init__(self, problem: SchedulingProblem) -> None:
        self.problem = problem
        self.dependencies = problem.dependencies

    @lru_cache(maxsize=None)
    def _task_cost_add(self, task: str) -> float:
        parents = self.dependencies.get(task, [])
        if not parents:
            return 2.0
        return 2.0 + sum(self._task_cost_add(parent) for parent in parents)

    @lru_cache(maxsize=None)
    def _task_cost_max(self, task: str) -> float:
        parents = self.dependencies.get(task, [])
        if not parents:
            return 2.0
        return 2.0 + max(self._task_cost_max(parent) for parent in parents)

    def h_add(self, remaining_tasks: Iterable[str]) -> float:
        return sum(self._task_cost_add(task) for task in remaining_tasks)

    def h_max(self, remaining_tasks: Iterable[str]) -> float:
        costs = [self._task_cost_max(task) for task in remaining_tasks]
        return max(costs) if costs else 0.0

    def estimate(self, heuristic: HeuristicType, state: StateProtocol) -> HeuristicResult:
        remaining = set(self.problem.goal_tasks) - set(state.completed)
        if not remaining or heuristic == HeuristicType.BFS:
            return HeuristicResult(0.0)
        if heuristic == HeuristicType.H_ADD:
            return HeuristicResult(self.h_add(remaining))
        if heuristic == HeuristicType.H_MAX:
            return HeuristicResult(self.h_max(remaining))
        raise ValueError(f"Heurística não suportada: {heuristic}")


def supported_heuristics() -> Set[str]:
    return {heuristic.value for heuristic in HeuristicType}


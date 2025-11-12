from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Sequence, Set, Tuple

from pddl import SchedulingProblem


@dataclass(frozen=True)
class Literal:
    name: str
    args: Tuple[str, ...]

    def __str__(self) -> str:  # pragma: no cover - apenas para debug
        if not self.args:
            return self.name
        joined = " ".join(self.args)
        return f"{self.name} {joined}"

    def key(self) -> Tuple[str, ...]:
        return (self.name, *self.args)


@dataclass(frozen=True)
class GroundAction:
    name: str
    parameters: Tuple[str, ...]
    preconditions_pos: Tuple[Literal, ...]
    preconditions_neg: Tuple[Literal, ...]
    add_effects: Tuple[Literal, ...]
    del_effects: Tuple[Literal, ...]

    def signature(self) -> str:
        if not self.parameters:
            return self.name
        params = " ".join(self.parameters)
        return f"({self.name} {params})"


def literal(name: str, *args: str) -> Literal:
    return Literal(name=name, args=tuple(args))


def initial_literals(problem: SchedulingProblem) -> Set[Literal]:
    lits: Set[Literal] = set()
    for res in problem.initial_available:
        if res in problem.operators:
            lits.add(literal("available", res))
        if res in problem.machines:
            lits.add(literal("available", res))
    for task in problem.initial_completed:
        lits.add(literal("completed", task))
    for task, (op, mach) in problem.initial_in_progress.items():
        lits.add(literal("in-progress", task))
        lits.add(literal("assigned-operator", task, op))
        lits.add(literal("assigned-machine", task, mach))
    return lits


def _dependency_literals(problem: SchedulingProblem, task: str) -> Iterable[Literal]:
    for parent in problem.dependencies.get(task, []):
        yield literal("completed", parent)


def build_ground_actions(problem: SchedulingProblem) -> List[GroundAction]:
    actions: List[GroundAction] = []
    for task in sorted(problem.tasks):
        required_machine = problem.machine_requirements.get(task)
        machines = (
            [required_machine]
            if required_machine is not None
            else sorted(problem.machines)
        )
        for operator in sorted(problem.operators):
            for mach in machines:
                pre_pos = [
                    literal("available", operator),
                    literal("available", mach),
                    *list(_dependency_literals(problem, task)),
                ]
                pre_neg = [
                    literal("in-progress", task),
                    literal("completed", task),
                ]
                add_eff = [
                    literal("in-progress", task),
                    literal("assigned-operator", task, operator),
                    literal("assigned-machine", task, mach),
                ]
                del_eff = [
                    literal("available", operator),
                    literal("available", mach),
                ]
                actions.append(
                    GroundAction(
                        name="start-task",
                        parameters=(task, operator, mach),
                        preconditions_pos=tuple(pre_pos),
                        preconditions_neg=tuple(pre_neg),
                        add_effects=tuple(add_eff),
                        del_effects=tuple(del_eff),
                    )
                )
                # Ação finish
                actions.append(
                    GroundAction(
                        name="finish-task",
                        parameters=(task, operator, mach),
                        preconditions_pos=(
                            literal("in-progress", task),
                            literal("assigned-operator", task, operator),
                            literal("assigned-machine", task, mach),
                        ),
                        preconditions_neg=(),
                        add_effects=(
                            literal("completed", task),
                            literal("available", operator),
                            literal("available", mach),
                        ),
                        del_effects=(
                            literal("in-progress", task),
                            literal("assigned-operator", task, operator),
                            literal("assigned-machine", task, mach),
                        ),
                    )
                )
    return actions


def all_literals_from_actions(actions: Sequence[GroundAction]) -> Set[Literal]:
    lits: Set[Literal] = set()
    for action in actions:
        lits.update(action.preconditions_pos)
        lits.update(action.add_effects)
        lits.update(action.del_effects)
    return lits


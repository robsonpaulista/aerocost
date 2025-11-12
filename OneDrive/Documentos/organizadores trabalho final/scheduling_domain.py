from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Set

from pddl import SchedulingProblem


def fact(predicate: str, *args: str, neg: bool = False) -> str:
    args_repr = ",".join(args)
    return f"{'not-' if neg else ''}{predicate}({args_repr})"


def complement(atom: str) -> str:
    return atom[4:] if atom.startswith("not-") else f"not-{atom}"


@dataclass(frozen=True)
class GroundAction:
    name: str
    preconditions: frozenset[str]
    add_effects: frozenset[str]
    del_effects: frozenset[str]


def all_dynamic_atoms(problem: SchedulingProblem) -> Set[str]:
    atoms: Set[str] = set()
    for entity in problem.operators | problem.machines:
        atoms.add(fact("available", entity))
        atoms.add(complement(fact("available", entity)))
    for task in problem.tasks:
        atoms.add(fact("completed", task))
        atoms.add(complement(fact("completed", task)))
        atoms.add(fact("in-progress", task))
        atoms.add(complement(fact("in-progress", task)))
        for operator in problem.operators:
            atom = fact("assigned-operator", task, operator)
            atoms.add(atom)
            atoms.add(complement(atom))
        for machine in problem.machines:
            atom = fact("assigned-machine", task, machine)
            atoms.add(atom)
            atoms.add(complement(atom))
    return atoms


def all_atoms(problem: SchedulingProblem) -> Set[str]:
    atoms: Set[str] = set()
    for operator in problem.operators:
        atoms.add(fact("operator", operator))
    for machine in problem.machines:
        atoms.add(fact("machine", machine))
    for task in problem.tasks:
        atoms.add(fact("task", task))
    atoms |= all_dynamic_atoms(problem)
    return atoms


def initial_atoms(problem: SchedulingProblem) -> Set[str]:
    atoms: Set[str] = set()
    for operator in problem.operators:
        atoms.add(fact("operator", operator))
        available = operator in problem.initial_available
        atoms.add(fact("available", operator, neg=not available))
    for machine in problem.machines:
        atoms.add(fact("machine", machine))
        available = machine in problem.initial_available
        atoms.add(fact("available", machine, neg=not available))
    for task in problem.tasks:
        atoms.add(fact("task", task))
        completed = task in problem.initial_completed
        in_progress = task in problem.initial_in_progress
        atoms.add(fact("completed", task, neg=not completed))
        atoms.add(fact("in-progress", task, neg=not in_progress))
        if in_progress:
            operator, machine = problem.initial_in_progress[task]
            atoms.add(fact("assigned-operator", task, operator))
            atoms.add(fact("assigned-machine", task, machine))
        for operator in problem.operators:
            assigned = task in problem.initial_in_progress and problem.initial_in_progress[task][0] == operator
            atoms.add(fact("assigned-operator", task, operator, neg=not assigned))
        for machine in problem.machines:
            assigned = task in problem.initial_in_progress and problem.initial_in_progress[task][1] == machine
            atoms.add(fact("assigned-machine", task, machine, neg=not assigned))
    return atoms


def build_domain_actions(problem: SchedulingProblem) -> List[GroundAction]:
    actions: List[GroundAction] = []
    for task in sorted(problem.tasks):
        required_machine = problem.machine_requirements.get(task)
        candidate_machines = (
            [required_machine] if required_machine is not None else sorted(problem.machines)
        )
        for operator in sorted(problem.operators):
            for machine in candidate_machines:
                preconditions = {
                    fact("task", task),
                    fact("operator", operator),
                    fact("machine", machine),
                    fact("available", operator),
                    fact("available", machine),
                    fact("in-progress", task, neg=True),
                    fact("completed", task, neg=True),
                }
                for parent in problem.dependencies.get(task, []):
                    preconditions.add(fact("completed", parent))
                add_start = {
                    fact("in-progress", task),
                    fact("assigned-operator", task, operator),
                    fact("assigned-machine", task, machine),
                    fact("available", operator, neg=True),
                    fact("available", machine, neg=True),
                }
                del_start = {
                    fact("available", operator),
                    fact("available", machine),
                    fact("in-progress", task, neg=True),
                    fact("assigned-operator", task, operator, neg=True),
                    fact("assigned-machine", task, machine, neg=True),
                }
                actions.append(
                    GroundAction(
                        name=f"(start-task {task} {operator} {machine})",
                        preconditions=frozenset(preconditions),
                        add_effects=frozenset(add_start),
                        del_effects=frozenset(del_start),
                    )
                )

                finish_pre = {
                    fact("in-progress", task),
                    fact("assigned-operator", task, operator),
                    fact("assigned-machine", task, machine),
                }
                finish_add = {
                    fact("completed", task),
                    fact("available", operator),
                    fact("available", machine),
                    fact("in-progress", task, neg=True),
                    fact("assigned-operator", task, operator, neg=True),
                    fact("assigned-machine", task, machine, neg=True),
                }
                finish_del = {
                    fact("in-progress", task),
                    fact("assigned-operator", task, operator),
                    fact("assigned-machine", task, machine),
                    fact("available", operator, neg=True),
                    fact("available", machine, neg=True),
                    fact("completed", task, neg=True),
                }
                actions.append(
                    GroundAction(
                        name=f"(finish-task {task} {operator} {machine})",
                        preconditions=frozenset(finish_pre),
                        add_effects=frozenset(finish_add),
                        del_effects=frozenset(finish_del),
                    )
                )
    return actions


def build_noop_actions(atoms: Iterable[str]) -> List[GroundAction]:
    return [
        GroundAction(
            name=f"noop:{atom}",
            preconditions=frozenset({atom}),
            add_effects=frozenset({atom}),
            del_effects=frozenset(),
        )
        for atom in atoms
    ]

(define (domain lab-scheduling)
  (:requirements :typing :negative-preconditions :equality :quantified-preconditions)
  (:types
    resource
    operator machine - resource
    task
  )
  (:predicates
    (operator ?o - operator)
    (machine ?m - machine)
    (task ?t - task)
    (available ?r - resource)
    (depends ?t - task ?p - task)
    (requires ?t - task ?m - machine)
    (in-progress ?t - task)
    (assigned-operator ?t - task ?o - operator)
    (assigned-machine ?t - task ?m - machine)
    (completed ?t - task)
  )

  (:action start-task
    :parameters (?t - task ?o - operator ?m - machine)
    :precondition (and
      (task ?t)
      (operator ?o)
      (machine ?m)
      (available ?o)
      (available ?m)
      (not (in-progress ?t))
      (not (completed ?t))
      (forall (?p - task)
        (implies (depends ?t ?p) (completed ?p)))
      (forall (?m2 - machine)
        (implies (requires ?t ?m2) (= ?m2 ?m)))
    )
    :effect (and
      (not (available ?o))
      (not (available ?m))
      (in-progress ?t)
      (assigned-operator ?t ?o)
      (assigned-machine ?t ?m)
    )
  )

  (:action finish-task
    :parameters (?t - task ?o - operator ?m - machine)
    :precondition (and
      (in-progress ?t)
      (assigned-operator ?t ?o)
      (assigned-machine ?t ?m)
    )
    :effect (and
      (not (in-progress ?t))
      (completed ?t)
      (available ?o)
      (available ?m)
      (not (assigned-operator ?t ?o))
      (not (assigned-machine ?t ?m))
    )
  )
)


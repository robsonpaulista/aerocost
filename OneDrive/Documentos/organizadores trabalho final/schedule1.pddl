(define (problem s1)
  (:domain lab-scheduling)
  (:objects
    op1 - operator
    m1 - machine
    t1 t2 t3 - task
  )
  (:init
    (operator op1)
    (machine m1)
    (task t1) (task t2) (task t3)
    (available op1)
    (available m1)
    (depends t2 t1)
    (depends t3 t2)
  )
  (:goal
    (and (completed t1) (completed t2) (completed t3))
  )
)

(define (problem s2)
  (:domain lab-scheduling)
  (:objects
    op1 op2 - operator
    m1 m2 - machine
    t1 t2 t3 t4 - task
  )
  (:init
    (operator op1) (operator op2)
    (machine m1) (machine m2)
    (task t1) (task t2) (task t3) (task t4)
    (available op1) (available op2)
    (available m1) (available m2)
    (depends t3 t1)
    (depends t4 t2)
  )
  (:goal
    (and (completed t1) (completed t2) (completed t3) (completed t4))
  )
)

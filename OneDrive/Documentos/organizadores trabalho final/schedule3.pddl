(define (problem s3)
  (:domain lab-scheduling)
  (:objects
    op1 op2 - operator
    m1 m2 m3 - machine
    t1 t2 t3 t4 t5 t6 - task
  )
  (:init
    (operator op1) (operator op2)
    (machine m1) (machine m2) (machine m3)
    (task t1) (task t2) (task t3) (task t4) (task t5) (task t6)
    (available op1) (available op2)
    (available m1) (available m2) (available m3)
    (depends t3 t1)
    (depends t4 t1)
    (depends t5 t2)
    (depends t6 t3)
    (requires t1 m1)
    (requires t2 m2)
    (requires t3 m3)
    (requires t4 m1)
    (requires t5 m2)
    (requires t6 m3)
  )
  (:goal
    (and
      (completed t1)
      (completed t2)
      (completed t3)
      (completed t4)
      (completed t5)
      (completed t6)
    )
  )
)

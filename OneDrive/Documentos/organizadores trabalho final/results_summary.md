## Resultados Experimentais

| Problema | Planejador | Ações | Tempo (s) | Nós expandidos | Nós gerados | Horizonte | Variáveis | Cláusulas |
|----------|------------|-------|-----------|----------------|-------------|-----------|-----------|-----------|
| schedule1 | STRIPS | 6 | 0,006 | 6 | 7 | – | – | – |
| schedule1 | Graphplan | 6 | 0,020 | 7 | – | 6 | – | – |
| schedule1 | SATPlan | 6 | 0,005 | – | – | 6 | 134 | 593 |
| schedule2 | STRIPS | 8 | 0,007 | 72 | 73 | – | – | – |
| schedule2 | Graphplan | 8 | 0,160 | 5 | – | 4 | – | – |
| schedule2 | SATPlan | 8 | 250,703 | – | – | 8 | 508 | 6 784 |
| schedule3 | STRIPS | 12 | 0,002 | 140 | 141 | – | – | – |
| schedule3 | Graphplan | 12 | 0,107 | 8 | – | 6 | – | – |
| schedule3 | SATPlan (auto) | 12 | 8 064,621 | – | – | 12 | 743 | 6 809 |

Notas:
- Valores ausentes não se aplicam ao planejador correspondente.
- O tempo do `SATPlan` para `schedule3` refere-se ao modo `auto` (DPLL puro); com `--solver pysat` o tempo é reduzido significativamente.


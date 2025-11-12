# Planejamento Clássico – Escalonamento de Tarefas

## Estrutura do Projeto
- `domain.pddl`: domínio PDDL modelado para o laboratório de prototipagem.
- `schedule{1,2,3}.pddl`: instâncias de problema fornecidas.
- `planner_strips.py`: planejador STRIPS (busca em largura).
- `planner_graphplan.py`: implementação do Graphplan com literais positivos/negativos.
- `planner_sat.py`: planejador SATPlan (codificação CNF com DPLL).
- `run_experiments.py`: script que executa os três planejadores em sequência e sumariza métricas.
- `results_summary.md`: tabela com resultados experimentais consolidados.
- `report/`: contém o esqueleto LaTeX (`main.tex`) baseado no template SBC.

## Requisitos
- Python 3.11 (testado).
- Dependências opcionais (para recursos extras):
  ```bash
  pip install streamlit pandas plotly python-sat[pblib,aiger] "plotly[kaleido]"
  ```

## Execução Individual
```bash
python planner_strips.py domain.pddl schedule1.pddl --heuristic bfs --show-plan
python planner_graphplan.py domain.pddl schedule2.pddl --max-levels 40 --show-plan
python planner_sat.py domain.pddl schedule3.pddl --max-horizon 30 --solver auto --show-plan
```
Parâmetros úteis:
- `--heuristic bfs|h_add|h_max` (STRIPS): ativa busca informada com `h_add`/`h_max`.
- `--max-levels` (Graphplan): limita a expansão do grafo.
- `--max-horizon` (SATPlan): define o horizonte máximo da codificação.
- `--solver auto|dpll|pysat` (SATPlan): escolhe o resolvedor (PySAT utiliza Minisat22).
- `--show-plan`: imprime a sequência de ações.

## Execução Automatizada
```bash
python run_experiments.py
```
O script roda `schedule1`, `schedule2` e `schedule3`, exibindo as principais métricas de cada planejador.

## Validação de Planos
Para checar um plano salvo em arquivo texto (uma ação por linha):
```bash
python plan_validator.py domain.pddl schedule1.pddl plano.txt
```

## Visualização de Planos
Gere uma timeline (HTML ou imagem) mostrando o intervalo entre `start-task` e `finish-task`:
```bash
python visualize_plan.py domain.pddl schedule2.pddl --planner strips --heuristic h_add --output planos/schedule2.html
python visualize_plan.py domain.pddl schedule2.pddl --planner strips --heuristic h_add --output planos/schedule2.png
```
(para imagens `.png/.pdf/.svg` é necessário instalar `plotly[kaleido]`)

## Interface Gráfica (Streamlit)
```bash
streamlit run app.py
```
O painel permite escolher a instância, rodar os planejadores (incluindo escolha de heurísticas/solvers) e visualizar cronogramas interativos.

## Observações
- O SATPlan interno (DPLL) ainda é custoso em `schedule3`; o modo PySAT reduz significativamente o tempo.
- Os resultados consolidados estão em `results_summary.md`, prontos para o relatório.
- Use `report/main.tex` como base no template oficial da SBC.


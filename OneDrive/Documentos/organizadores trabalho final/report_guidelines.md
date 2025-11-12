## Guia para o Relatório (Template SBC)

### 1. Introdução e Objetivos
- Contextualizar o domínio de escalonamento em laboratório.
- Breve resumo das três abordagens (STRIPS, Graphplan, SATPlan).
- Objetivo geral: modelar, implementar, comparar e analisar os planejadores.

### 2. Modelagem do Domínio
- Descrever os tipos, predicados e ações do `domain.pddl`.
- Explicar como dependências, alocação de recursos e requisitos de máquinas foram modelados.
- Destacar o uso de quantificadores/equality para garantir coerência (ex.: seleção da máquina correta).

### 3. Metodologia e Implementação
- **STRIPS**: busca em largura e A* com heurísticas `h_add`/`h_max`; estado representado por recursos disponíveis e tarefas em execução; métricas coletadas (nós expandidos/gerados, tempo).
- **Graphplan**: construção de níveis com literais positivos/negativos, mutex de ações/literais, extração regressiva; medições de horizonte, nós expandidos na extração, tempo.
- **SATPlan**: codificação CNF com horizonte incremental; comparação entre DPLL interno e PySAT (Minisat22); métricas de horizonte, nº de variáveis/cláusulas, tempo.
- **Validação e visualização**: descrever `plan_validator.py` e a geração/exportação de timelines (HTML/PNG via `visualize_plan.py` ou painel Streamlit).
- Pipeline de experimentos (`run_experiments.py`) e critérios de parada/parametrização (`--max-levels`, `--max-horizon`, `--sat-solver`).

### 4. Resultados e Análise Comparativa
- Inserir tabela com métricas (usar `results_summary.md` como base).
- Discutir diferenças de desempenho:
  - STRIPS rápido, mas potencial explosão combinatória em casos maiores.
  - Graphplan com horizonte reduzido, mas custos de mutex e extração.
  - SATPlan mais custoso em `schedule3` (DPLL puro), apontar gargalo.
- Comparar tamanho dos planos (iguais nas três abordagens) e implicações.

### 5. Conclusões e Trabalhos Futuros
- Síntese das vantagens/limitações de cada planejador.
- Apontar impactos das heurísticas, do solver SAT externo e da visualização/interpretação dos planos.

### 6. Referências Bibliográficas
- Referências clássicas em Planejamento (STRIPS, Graphplan, SATPlan/Blackbox).
- Materiais complementares usados na atividade, se houver.

### Apêndices/Opcional
- Descrever ambiente de execução (versão Python, dependências).
- Instruções de reprodução: comandos para rodar cada planejador individualmente e o script de experimentos.
- Logs complementares (se quiser registrar saída crua dos experimentos).


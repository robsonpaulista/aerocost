from __future__ import annotations

from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import pandas as pd
import plotly.express as px


def parse_action(action: str) -> Tuple[str, List[str]]:
    action = action.strip()
    if not action:
        return "", []
    if action[0] != "(" or action[-1] != ")":
        return "", []
    tokens = action[1:-1].split()
    if not tokens:
        return "", []
    return tokens[0], tokens[1:]


def build_timeline(plan: Iterable[str]) -> pd.DataFrame:
    step = 0
    starts: Dict[str, Dict[str, object]] = {}
    records: List[Dict[str, object]] = []
    for action_str in plan:
        step += 1
        name, params = parse_action(action_str)
        if name == "start-task" and len(params) == 3:
            task, operator, machine = params
            starts[task] = {
                "task": task,
                "operator": operator,
                "machine": machine,
                "start": step - 1,
            }
        elif name == "finish-task" and len(params) == 3:
            task, operator, machine = params
            info = starts.pop(task, None)
            if info is None:
                continue
            record = {
                "task": task,
                "start": info["start"],
                "finish": step,
                "operator": operator,
                "machine": machine,
                "resource": f"{operator}/{machine}",
            }
            records.append(record)
    return pd.DataFrame.from_records(records)


def make_timeline_figure(df: pd.DataFrame, title: str):
    if df.empty:
        raise ValueError("DataFrame vazio: não há dados para visualizar o plano.")
    df = df.sort_values(by="start").reset_index(drop=True)
    fig = px.timeline(
        df,
        x_start="start",
        x_end="finish",
        y="task",
        color="resource",
        hover_data=["operator", "machine", "start", "finish"],
        title=title,
    )
    fig.update_yaxes(autorange="reversed")
    fig.update_layout(height=400, margin=dict(l=40, r=40, t=60, b=40))
    return fig


def save_timeline(plan: Iterable[str], output: Path, title: str = "Plano") -> None:
    df = build_timeline(plan)
    if df.empty:
        raise ValueError("Plano não contém pares start/finish suficientes para gerar o gráfico.")
    fig = make_timeline_figure(df, title)
    output.parent.mkdir(parents=True, exist_ok=True)
    suffix = output.suffix.lower()
    if suffix == ".html":
        fig.write_html(str(output))
        return
    if suffix in {".png", ".pdf", ".svg", ".jpg", ".jpeg"}:
        try:
            fig.write_image(str(output))
        except ValueError as exc:
            raise ValueError(
                "Falha ao exportar imagem. Certifique-se de ter instalado 'plotly[kaleido]'."
            ) from exc
        return
    raise ValueError(
        "Formato não suportado. Utilize extensão .html ou uma imagem (.png/.pdf/.svg/.jpg)."
    )


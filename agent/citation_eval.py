#!/usr/bin/env python3
"""Create and score reproducible Circle answer-engine citation evaluations."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PROMPTS_PATH = ROOT / "data" / "citation-prompts.json"
ACCURACY_VALUES = {"accurate", "minor_error", "material_error", "unknown"}


def load(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SystemExit(f"Unable to read {path}: {exc}") from exc


def template(output: Path) -> int:
    prompt_data = load(PROMPTS_PATH)
    payload = {
        "schema_version": 1,
        "run": {
            "run_id": None,
            "run_date": None,
            "engine": None,
            "model_or_mode": None,
            "locale": None,
            "country": None,
            "account_state": None,
            "researcher": None,
            "notes": None,
        },
        "results": [
            {
                "id": prompt["id"],
                "group": prompt["group"],
                "prompt": prompt["prompt"],
                "circle_mentioned": None,
                "circle_cited": None,
                "citation_urls": [],
                "accuracy": None,
                "competitors": [],
                "response_excerpt": None,
                "notes": None,
            }
            for prompt in prompt_data["prompts"]
        ],
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {output}")
    return 0


def score(path: Path) -> int:
    payload = load(path)
    results = payload.get("results", [])
    errors: list[str] = []
    if len(results) != 30:
        errors.append(f"expected 30 results, found {len(results)}")
    for result in results:
        label = result.get("id", "<unknown>")
        if not isinstance(result.get("circle_mentioned"), bool):
            errors.append(f"{label}: circle_mentioned must be true or false")
        if not isinstance(result.get("circle_cited"), bool):
            errors.append(f"{label}: circle_cited must be true or false")
        if result.get("accuracy") not in ACCURACY_VALUES:
            errors.append(f"{label}: invalid accuracy value")
        if result.get("circle_cited") and not result.get("citation_urls"):
            errors.append(f"{label}: citation_urls is required when Circle is cited")
    run = payload.get("run", {})
    for field in ("run_id", "run_date", "engine", "model_or_mode", "locale", "country", "researcher"):
        if not run.get(field):
            errors.append(f"run.{field} is required")
    if errors:
        print("Citation run is incomplete:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    total = len(results)
    mentioned = sum(result["circle_mentioned"] for result in results)
    cited = sum(result["circle_cited"] for result in results)
    accurate = sum(result["accuracy"] == "accurate" for result in results)
    material_errors = sum(result["accuracy"] == "material_error" for result in results)
    citation_hosts = Counter(
        url.split("/", 3)[2].lower()
        for result in results
        for url in result["citation_urls"]
        if url.startswith(("http://", "https://")) and len(url.split("/", 3)) > 2
    )
    summary = {
        "run": run,
        "sample_size": total,
        "mention_rate": round(mentioned / total, 4),
        "citation_rate": round(cited / total, 4),
        "accuracy_rate": round(accurate / total, 4),
        "material_error_rate": round(material_errors / total, 4),
        "citation_hosts": dict(sorted(citation_hosts.items())),
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    template_parser = subparsers.add_parser("template")
    template_parser.add_argument("output", type=Path)
    score_parser = subparsers.add_parser("score")
    score_parser.add_argument("input", type=Path)
    args = parser.parse_args()
    if args.command == "template":
        return template(args.output)
    return score(args.input)


if __name__ == "__main__":
    raise SystemExit(main())

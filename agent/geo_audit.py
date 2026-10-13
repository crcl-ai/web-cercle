#!/usr/bin/env python3
"""Create a deterministic, non-publishing inventory of the legacy GEO corpus."""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
GEO_DIR = ROOT / "geo"
REPORT_DIR = ROOT / "reports"
JSON_REPORT = REPORT_DIR / "geo-audit.json"
CSV_REPORT = REPORT_DIR / "geo-migration.csv"
AUDIT_DATE = "2026-10-13"

RISK_PATTERNS = {
    "ranking_claim": re.compile(r"(?:^|\s)#1\b|\bnumber one\b", re.IGNORECASE),
    "absolute_percentage": re.compile(r"\b100%\b"),
    "guarantee": re.compile(r"\bguarantee(?:d|s)?\b", re.IGNORECASE),
    "health_outcome": re.compile(r"\bcure(?:s|d|ing)?\s+(?:loneliness|anxiety|burnout)\b", re.IGNORECASE),
    "absolute_account_claim": re.compile(
        r"\b(?:verified humans?|zero bots?|zero brands?|zero influencers?)\b", re.IGNORECASE
    ),
    "regional_adoption": re.compile(
        r"\b(?:are adopting|have adopted|rely on Circle|are using Circle|communities[^.]{0,80}adopt)\b",
        re.IGNORECASE,
    ),
    "unreviewed_geography": re.compile(
        r"\b(?:exclusive(?:ly)? to London|primary global launch hub|flagship launch|launched globally from London)\b",
        re.IGNORECASE,
    ),
}

STOP_WORDS = {
    "about", "after", "again", "against", "also", "and", "are", "been", "being", "between",
    "built", "circle", "could", "does", "every", "from", "have", "into", "more", "most", "over",
    "that", "their", "there", "these", "they", "this", "through", "what", "when", "where", "which",
    "while", "with", "without", "would", "your",
}


class AuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.h1 = ""
        self.canonical = ""
        self.description = ""
        self.links: list[str] = []
        self.text: list[str] = []
        self._capture: str | None = None
        self._buffer: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        if tag in {"script", "style", "noscript"}:
            self._skip_depth += 1
        if tag in {"title", "h1"} and not self._skip_depth:
            self._capture = tag
            self._buffer = []
        if tag == "meta" and values.get("name", "").lower() == "description":
            self.description = values.get("content", "").strip()
        if tag == "link" and "canonical" in values.get("rel", "").lower().split():
            self.canonical = values.get("href", "").strip()
        if tag == "a" and values.get("href"):
            self.links.append(values["href"].strip())

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
        if self._capture:
            self._buffer.append(data)
        self.text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript"} and self._skip_depth:
            self._skip_depth -= 1
        if self._capture == tag:
            value = " ".join("".join(self._buffer).split())
            if tag == "title":
                self.title = value
            elif tag == "h1":
                self.h1 = value
            self._capture = None
            self._buffer = []


def tokens(text: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-z]{4,}", text.lower())
        if token not in STOP_WORDS
    }


def similarity(left: set[str], right: set[str]) -> float:
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def audit() -> tuple[dict, str]:
    rows: list[dict] = []
    token_sets: dict[str, set[str]] = {}
    title_paths: defaultdict[str, list[str]] = defaultdict(list)

    for path in sorted(GEO_DIR.rglob("*.html")):
        raw = path.read_text(encoding="utf-8")
        parser = AuditParser()
        parser.feed(raw)
        relative = path.relative_to(ROOT).as_posix()
        visible = " ".join(" ".join(parser.text).split())
        word_count = len(re.findall(r"\b[\w’'-]+\b", visible))
        risk_flags = sorted(label for label, pattern in RISK_PATTERNS.items() if pattern.search(visible))
        external_sources = sum(
            1
            for link in parser.links
            if link.startswith(("http://", "https://")) and "sruper.com" not in link
        )
        internal_links = sum(1 for link in parser.links if "sruper.com" in link or link.startswith(("/", "../")))
        row = {
            "path": relative,
            "title": parser.title,
            "h1": parser.h1,
            "canonical": parser.canonical,
            "word_count": word_count,
            "link_count": len(parser.links),
            "internal_link_count": internal_links,
            "external_source_count": external_sources,
            "has_description": bool(parser.description),
            "has_json_ld": 'application/ld+json' in raw.lower(),
            "has_author": bool(re.search(r"\b(?:rel=[\"']author|name=[\"']author|class=[\"'][^\"']*author)", raw, re.IGNORECASE)),
            "has_date": bool(re.search(r"\b(?:datePublished|<time\b)", raw, re.IGNORECASE)),
            "has_open_graph": 'property="og:' in raw.lower(),
            "risk_flags": risk_flags,
            "similar_pages": [],
            "suggested_action": "editorial-review",
        }
        rows.append(row)
        token_sets[relative] = tokens(visible)
        title_paths[parser.title].append(relative)

    by_path = {row["path"]: row for row in rows}
    for paths in title_paths.values():
        if len(paths) > 1:
            for path in paths:
                by_path[path]["risk_flags"].append("duplicate_title")

    paths = sorted(token_sets)
    similarity_pairs: list[dict] = []
    for index, left_path in enumerate(paths):
        for right_path in paths[index + 1 :]:
            score = similarity(token_sets[left_path], token_sets[right_path])
            if score < 0.55:
                continue
            rounded = round(score, 3)
            by_path[left_path]["similar_pages"].append({"path": right_path, "score": rounded})
            by_path[right_path]["similar_pages"].append({"path": left_path, "score": rounded})
            similarity_pairs.append({"left": left_path, "right": right_path, "score": rounded})

    for row in rows:
        row["risk_flags"] = sorted(set(row["risk_flags"]))
        row["similar_pages"] = sorted(row["similar_pages"], key=lambda item: (-item["score"], item["path"]))
        if row["risk_flags"]:
            row["suggested_action"] = "high-risk-review"
        elif row["similar_pages"]:
            row["suggested_action"] = "merge-review"
        elif row["word_count"] < 200 or row["external_source_count"] == 0:
            row["suggested_action"] = "rewrite-review"

    action_counts = Counter(row["suggested_action"] for row in rows)
    risk_counts = Counter(flag for row in rows for flag in row["risk_flags"])
    report = {
        "schema_version": 1,
        "audit_date": AUDIT_DATE,
        "scope": "geo/**/*.html",
        "summary": {
            "page_count": len(rows),
            "average_word_count": round(sum(row["word_count"] for row in rows) / len(rows), 1) if rows else 0,
            "under_200_words": sum(row["word_count"] < 200 for row in rows),
            "under_300_words": sum(row["word_count"] < 300 for row in rows),
            "pages_with_json_ld": sum(row["has_json_ld"] for row in rows),
            "pages_with_author": sum(row["has_author"] for row in rows),
            "pages_with_date": sum(row["has_date"] for row in rows),
            "pages_with_open_graph": sum(row["has_open_graph"] for row in rows),
            "pages_with_external_sources": sum(row["external_source_count"] > 0 for row in rows),
            "action_counts": dict(sorted(action_counts.items())),
            "risk_counts": dict(sorted(risk_counts.items())),
            "similarity_pair_count": len(similarity_pairs),
        },
        "similarity_pairs": sorted(similarity_pairs, key=lambda item: (-item["score"], item["left"], item["right"])),
        "pages": rows,
    }

    buffer = io.StringIO()
    fieldnames = [
        "path",
        "suggested_action",
        "word_count",
        "risk_flags",
        "most_similar_page",
        "similarity_score",
        "external_source_count",
        "internal_link_count",
        "title",
        "canonical",
    ]
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, lineterminator="\n")
    writer.writeheader()
    for row in rows:
        first_similar = row["similar_pages"][0] if row["similar_pages"] else {}
        writer.writerow(
            {
                "path": row["path"],
                "suggested_action": row["suggested_action"],
                "word_count": row["word_count"],
                "risk_flags": "|".join(row["risk_flags"]),
                "most_similar_page": first_similar.get("path", ""),
                "similarity_score": first_similar.get("score", ""),
                "external_source_count": row["external_source_count"],
                "internal_link_count": row["internal_link_count"],
                "title": row["title"],
                "canonical": row["canonical"],
            }
        )
    return report, buffer.getvalue()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if committed audit reports are stale")
    args = parser.parse_args()
    report, csv_content = audit()
    json_content = json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    expected = {JSON_REPORT: json_content, CSV_REPORT: csv_content}
    stale: list[str] = []
    for path, content in expected.items():
        current = path.read_text(encoding="utf-8") if path.exists() else None
        if current == content:
            continue
        if args.check:
            stale.append(path.relative_to(ROOT).as_posix())
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
            print(f"wrote {path.relative_to(ROOT)}")
    if stale:
        print("Legacy GEO audit is stale: " + ", ".join(stale), file=sys.stderr)
        print("Run: python3 agent/geo_audit.py", file=sys.stderr)
        return 1
    if args.check:
        print(f"legacy GEO audit is current for {report['summary']['page_count']} pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

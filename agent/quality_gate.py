#!/usr/bin/env python3
"""Fail CI when managed Circle discovery surfaces drift or make unsafe claims."""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent.parent
PAGES_PATH = ROOT / "data" / "discovery-pages.json"
FACTS_PATH = ROOT / "data" / "circle-facts.json"
PROMPTS_PATH = ROOT / "data" / "citation-prompts.json"

FORBIDDEN_COPY = {
    "legacy object/app term": re.compile(r"\bcapsules?\b", re.IGNORECASE),
    "legacy save verb": re.compile(r"\b(?:keep|kept|keeps|keeping)\b", re.IGNORECASE),
    "banned listening term": re.compile(r"\blistening\b", re.IGNORECASE),
    "banned subscription term": re.compile(r"\bsubscribed\b", re.IGNORECASE),
    "banned audience term": re.compile(r"\bfan of\b", re.IGNORECASE),
    "banned reaction term": re.compile(r"\bliked\b", re.IGNORECASE),
    "banned notification phrase": re.compile(r"\b(?:added you|joined your)\b", re.IGNORECASE),
}

RISKY_CLAIMS = {
    "unsubstantiated ranking": re.compile(r"(?:^|\s)#1\b|\bnumber one\b", re.IGNORECASE),
    "absolute percentage": re.compile(r"\b100%\b"),
    "guarantee": re.compile(r"\bguarantee(?:d|s)?\b", re.IGNORECASE),
    "health outcome": re.compile(r"\bcure(?:s|d|ing)?\s+(?:loneliness|anxiety|burnout)\b", re.IGNORECASE),
    "absolute account claim": re.compile(r"\b(?:verified humans?|zero bots?|zero brands?|zero influencers?)\b", re.IGNORECASE),
    "unsupported adoption": re.compile(r"\b(?:are adopting|have adopted|rely on Circle|are using Circle)\b", re.IGNORECASE),
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.h1: list[str] = []
        self.meta: dict[tuple[str, str], str] = {}
        self.canonical = ""
        self.links: list[str] = []
        self.json_ld: list[str] = []
        self._capture: str | None = None
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        if tag in {"title", "h1"}:
            self._capture = tag
            self._buffer = []
        elif tag == "script" and values.get("type", "").lower() == "application/ld+json":
            self._capture = "jsonld"
            self._buffer = []
        elif tag == "meta":
            for key in ("name", "property"):
                if values.get(key):
                    self.meta[(key, values[key].lower())] = values.get("content", "").strip()
        elif tag == "link" and "canonical" in values.get("rel", "").lower().split():
            self.canonical = values.get("href", "").strip()
        elif tag == "a" and values.get("href"):
            self.links.append(values["href"].strip())

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if self._capture == tag:
            value = " ".join("".join(self._buffer).split())
            if tag == "title":
                self.title = value
            elif tag == "h1":
                self.h1.append(value)
            self._capture = None
            self._buffer = []
        elif tag == "script" and self._capture == "jsonld":
            self.json_ld.append("".join(self._buffer).strip())
            self._capture = None
            self._buffer = []


def relative_target_exists(source: Path, href: str) -> bool:
    parsed = urlparse(href)
    if parsed.scheme or parsed.netloc or href.startswith(("#", "mailto:", "tel:")):
        return True
    clean = parsed.path
    if not clean:
        return True
    if clean.startswith("/"):
        candidate = ROOT / clean.lstrip("/")
    else:
        candidate = source.parent / clean
    if candidate.exists():
        return True
    if candidate.suffix:
        return False
    return candidate.with_suffix(".html").exists() or (candidate / "index.html").exists()


def main() -> int:
    pages = json.loads(PAGES_PATH.read_text(encoding="utf-8"))["pages"]
    errors: list[str] = []
    canonical_urls: set[str] = set()

    facts = json.loads(FACTS_PATH.read_text(encoding="utf-8"))
    try:
        review_by = date.fromisoformat(facts["review_by"])
        if review_by < date.today():
            errors.append(f"circle-facts.json: review expired on {review_by.isoformat()}")
    except (KeyError, ValueError):
        errors.append("circle-facts.json: review_by must be an ISO date")
    for claim in facts.get("claims", []):
        if claim.get("public") and (not claim.get("wording") or not claim.get("evidence")):
            errors.append(f"circle-facts.json: public claim {claim.get('id')} is incomplete")

    prompt_rows = json.loads(PROMPTS_PATH.read_text(encoding="utf-8")).get("prompts", [])
    prompt_ids = [row.get("id") for row in prompt_rows]
    prompt_groups = {row.get("group") for row in prompt_rows}
    if len(prompt_rows) != 30:
        errors.append(f"citation-prompts.json: expected 30 prompts, found {len(prompt_rows)}")
    if len(prompt_ids) != len(set(prompt_ids)):
        errors.append("citation-prompts.json: prompt IDs must be unique")
    if prompt_groups != {"entity", "category", "problem", "feature", "comparison"}:
        errors.append("citation-prompts.json: expected five approved intent groups")

    for row in pages:
        path = ROOT / row["file"]
        if not path.exists():
            errors.append(f"{row['file']}: managed file is missing")
            continue
        raw = path.read_text(encoding="utf-8")

        for label, pattern in FORBIDDEN_COPY.items():
            match = pattern.search(raw)
            if match:
                errors.append(f"{row['file']}: {label}: {match.group(0)!r}")
        for label, pattern in RISKY_CLAIMS.items():
            match = pattern.search(raw)
            if match:
                errors.append(f"{row['file']}: {label}: {match.group(0)!r}")
        if "Stealth Crawler Discovery" in raw or "opacity:0; pointer-events:none" in raw:
            errors.append(f"{row['file']}: hidden crawler-only links are prohibited")

        if path.suffix != ".html":
            continue

        parser = PageParser()
        parser.feed(raw)
        if not parser.title:
            errors.append(f"{row['file']}: missing title")
        if len(parser.h1) != 1:
            errors.append(f"{row['file']}: expected one h1, found {len(parser.h1)}")
        if not parser.meta.get(("name", "description")):
            errors.append(f"{row['file']}: missing meta description")
        if parser.canonical != row["url"]:
            errors.append(
                f"{row['file']}: canonical {parser.canonical!r} does not match {row['url']!r}"
            )
        if parser.canonical in canonical_urls:
            errors.append(f"{row['file']}: duplicate canonical {parser.canonical}")
        canonical_urls.add(parser.canonical)
        for prop in ("og:title", "og:url", "og:image"):
            if not parser.meta.get(("property", prop)):
                errors.append(f"{row['file']}: missing {prop}")
        if parser.meta.get(("property", "og:url")) != row["url"]:
            errors.append(f"{row['file']}: og:url does not match the canonical URL")
        if row.get("requires_schema"):
            if not parser.json_ld:
                errors.append(f"{row['file']}: missing JSON-LD")
            for block in parser.json_ld:
                try:
                    json.loads(block)
                except json.JSONDecodeError as exc:
                    errors.append(f"{row['file']}: invalid JSON-LD: {exc}")
        robots = parser.meta.get(("name", "robots"), "").lower()
        if row.get("indexable") and "noindex" in robots:
            errors.append(f"{row['file']}: indexable manifest page contains noindex")
        for href in parser.links:
            if not relative_target_exists(path, href):
                errors.append(f"{row['file']}: broken local link {href!r}")

    try:
        sitemap = ET.parse(ROOT / "sitemap.xml")
        namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        actual_urls = {
            node.text.strip()
            for node in sitemap.findall("s:url/s:loc", namespace)
            if node.text
        }
    except (ET.ParseError, OSError) as exc:
        errors.append(f"sitemap.xml: cannot parse: {exc}")
        actual_urls = set()
    expected_urls = {row["url"] for row in pages if row.get("indexable")}
    missing_urls = sorted(expected_urls - actual_urls)
    extra_urls = sorted(actual_urls - expected_urls)
    if missing_urls:
        errors.append("sitemap.xml is missing: " + ", ".join(missing_urls))
    if extra_urls:
        errors.append("sitemap.xml contains unmanaged URLs: " + ", ".join(extra_urls))

    if errors:
        print("Circle discovery quality gate failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"quality gate passed for {len(pages)} managed discovery files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

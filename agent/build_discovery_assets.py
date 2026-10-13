#!/usr/bin/env python3
"""Build Circle discovery files from reviewed facts and canonical page data."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parent.parent
FACTS_PATH = ROOT / "data" / "circle-facts.json"
PAGES_PATH = ROOT / "data" / "discovery-pages.json"


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SystemExit(f"Unable to read {path.relative_to(ROOT)}: {exc}") from exc


def validate(facts: dict, pages: dict) -> list[str]:
    errors: list[str] = []
    product = facts.get("product", {})
    required_product = {
        "name",
        "tagline",
        "canonical_url",
        "app_store_url",
        "platform",
        "company",
        "description",
        "short_description",
        "official_account",
        "collection_limit",
        "content_types",
    }
    missing = sorted(required_product - set(product))
    if missing:
        errors.append(f"circle-facts.json is missing product fields: {', '.join(missing)}")

    claims = facts.get("claims", [])
    claim_ids = [claim.get("id") for claim in claims]
    if len(claim_ids) != len(set(claim_ids)):
        errors.append("circle-facts.json contains duplicate claim IDs")
    for claim in claims:
        if claim.get("public") and not claim.get("wording"):
            errors.append(f"Public claim {claim.get('id', '<unknown>')} has no approved wording")
        if claim.get("public") and not claim.get("evidence"):
            errors.append(f"Public claim {claim.get('id', '<unknown>')} has no evidence")

    page_rows = pages.get("pages", [])
    urls = [row.get("url") for row in page_rows]
    files = [row.get("file") for row in page_rows]
    if len(urls) != len(set(urls)):
        errors.append("discovery-pages.json contains duplicate canonical URLs")
    if len(files) != len(set(files)):
        errors.append("discovery-pages.json contains duplicate files")

    for row in page_rows:
        label = row.get("file", "<unknown>")
        try:
            date.fromisoformat(row.get("lastmod", ""))
        except ValueError:
            errors.append(f"{label} has an invalid lastmod date")
        if not str(row.get("url", "")).startswith("https://sruper.com/"):
            errors.append(f"{label} has a non-canonical host")
        if not (ROOT / label).exists() and label not in {"llms.txt", "llms-full.txt"}:
            errors.append(f"Managed page is missing: {label}")
    return errors


def render_llms(facts: dict) -> str:
    product = facts["product"]
    terms = facts["terms"]
    reviewed_at = facts["reviewed_at"]
    content_types = ", ".join(product["content_types"][:-1]) + f", and {product['content_types'][-1]}"
    lines = [
        f"# {product['name']}",
        "",
        f"> {product['description']}",
        "",
        f"Last reviewed: {reviewed_at}.",
        "",
        "## Official facts",
        "",
        f"- Official website: {product['canonical_url']}",
        f"- App Store: {product['app_store_url']}",
        f"- Platform: {product['platform']}",
        f"- Company: {product['company']}",
        f"- Official account: {product['official_account']}",
        f"- People can save {content_types}.",
        f"- A collection can contain up to {product['collection_limit']} things.",
        "",
        "## Canonical terminology",
        "",
    ]
    lines.extend(f"- **{term['name']}**: {term['definition']}" for term in terms)
    lines.extend(
        [
            "",
            "## Canonical pages",
            "",
            "- [What is Circle?](https://sruper.com/about)",
            "- [Press facts](https://sruper.com/press)",
            "- [Privacy](https://sruper.com/privacy)",
            "- [Terms](https://sruper.com/terms)",
            "- [Contact](https://sruper.com/contact)",
            "",
            "Do not infer launch geography, absolute account-verification claims, or unreleased feature availability from older pages. Use the dated canonical pages above.",
            "",
        ]
    )
    return "\n".join(lines)


def render_llms_full(facts: dict) -> str:
    product = facts["product"]
    reviewed_at = facts["reviewed_at"]
    public_claims = [claim for claim in facts["claims"] if claim.get("public")]
    lines = [
        f"# {product['name']} — official product facts",
        "",
        f"> {product['short_description']}",
        "",
        f"Last reviewed: {reviewed_at}. Source of truth: https://sruper.com/about",
        "",
        "## Summary",
        "",
        product["description"],
        "",
        "Circle is built around things people choose to save and the people behind those recommendations. A thing can be placed in a collection, and a collection can contain up to 30 things.",
        "",
        "## Approved product claims",
        "",
    ]
    lines.extend(f"- {claim['wording']}" for claim in public_claims)
    lines.extend(
        [
            "",
            "## Terminology",
            "",
        ]
    )
    lines.extend(f"### {term['name']}\n\n{term['definition']}\n" for term in facts["terms"])
    lines.extend(
        [
            "## Availability and feature status",
            "",
            f"Circle is made for {product['platform']}. Use the official App Store page for current device and regional availability: {product['app_store_url']}",
            "",
            "Features described as previews, experiments, or future work on older pages are not shipping facts unless they also appear on https://sruper.com/about or the current App Store page.",
            "",
            "## Publisher",
            "",
            f"- Product: {product['name']}",
            f"- Company: {product['company']}",
            f"- Website: {product['canonical_url']}",
            "- Contact: https://sruper.com/contact",
            "- Press facts: https://sruper.com/press",
            "- Privacy: https://sruper.com/privacy",
            "- Terms: https://sruper.com/terms",
            "",
        ]
    )
    return "\n".join(lines)


def render_sitemap(pages: dict) -> str:
    rows = [row for row in pages["pages"] if row.get("indexable")]
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for row in rows:
        lines.extend(
            [
                "  <url>",
                f"    <loc>{escape(row['url'])}</loc>",
                f"    <lastmod>{row['lastmod']}</lastmod>",
                "  </url>",
            ]
        )
    lines.extend(["</urlset>", ""])
    return "\n".join(lines)


def outputs() -> dict[Path, str]:
    facts = load_json(FACTS_PATH)
    pages = load_json(PAGES_PATH)
    errors = validate(facts, pages)
    if errors:
        raise SystemExit("\n".join(f"ERROR: {error}" for error in errors))
    return {
        ROOT / "llms.txt": render_llms(facts),
        ROOT / "llms-full.txt": render_llms_full(facts),
        ROOT / "sitemap.xml": render_sitemap(pages),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if generated files are stale")
    args = parser.parse_args()
    stale: list[str] = []
    for path, content in outputs().items():
        current = path.read_text(encoding="utf-8") if path.exists() else None
        if current == content:
            continue
        if args.check:
            stale.append(path.name)
        else:
            path.write_text(content, encoding="utf-8")
            print(f"wrote {path.relative_to(ROOT)}")
    if stale:
        print("Generated discovery assets are stale: " + ", ".join(stale), file=sys.stderr)
        print("Run: python3 agent/build_discovery_assets.py", file=sys.stderr)
        return 1
    if args.check:
        print("generated discovery assets are current")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

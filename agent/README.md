# Circle discovery pipeline

The old regional generators are archived in place and disabled by default. They created public pages directly from community-feed titles and are not part of the launch workflow.

The active pipeline is deterministic and review-based:

1. `data/circle-facts.json` is the approved public fact source.
2. `data/discovery-pages.json` lists canonical launch pages.
3. `build_discovery_assets.py` derives `llms.txt`, `llms-full.txt`, and `sitemap.xml`.
4. `quality_gate.py` checks managed public surfaces for claim, lexicon, metadata, schema, canonical, link, and discovery-file failures.
5. `geo_audit.py` inventories the legacy `/geo/` corpus without publishing or deleting anything.
6. `citation_eval.py` creates reproducible result sheets and scores completed answer-engine samples.
7. Changes arrive through a pull request and require human review.

Commands:

```sh
python3 agent/build_discovery_assets.py
python3 agent/build_discovery_assets.py --check
python3 agent/quality_gate.py
python3 agent/geo_audit.py
python3 agent/geo_audit.py --check
python3 agent/citation_eval.py template reports/citation-run-template.json
python3 agent/citation_eval.py score reports/completed-citation-run.json
```

The `CIRCLE_ALLOW_LEGACY_GEO=1` escape hatch exists only for an intentional local archive run. It must never be set in CI or a deployment workflow.

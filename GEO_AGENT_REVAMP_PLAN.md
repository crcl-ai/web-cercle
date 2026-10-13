# Circle GEO agent revamp plan

**Plan date:** 13 October 2026

**Working launch date:** 31 October 2026, based on the current Circle launch plan

**Scope:** Plan only. No automation or live content is changed by this document.

## 1. Decision

Replace the current page-generation system with a citation-readiness system.

The present agents reward publishing frequency, keyword variants, and page count. The replacement should reward:

1. accurate Circle facts;
2. original, useful evidence;
3. clear pages that answer real questions;
4. crawl and index health;
5. independent corroboration;
6. measured citations and qualified visits;
7. human approval before publication.

The launch objective is not to “game” a model. It is to make Circle the clearest, most trustworthy source about Circle and to give search and answer systems enough reliable evidence to cite it confidently.

## 2. Why the current system needs to change

The audit found:

- six Python agents plus a shared LLM helper;
- a GitHub Action that runs every three days and also runs on every push;
- direct commits to `main` with `git add .`;
- 106 public `/geo/` HTML pages;
- an average of about 295 visible words per page;
- 54 pages below 300 words and 19 below 200 words;
- repeated titles and many closely overlapping regional themes;
- no Article JSON-LD, author identity, publication date, Open Graph metadata, or visible evidence block on nearly all pages;
- exactly one visible link per GEO page, normally back to the homepage;
- no homepage navigation to the GEO corpus;
- unsupported or overly absolute claims, including `#1`, “100% verified humans,” guaranteed bot exclusion, regional adoption, and unverified launch geography;
- copy generated from a few Reddit post titles without source preservation or claim-level citation;
- a DuckDuckGo top-ten check presented as “LLM share of voice,” although it does not measure answer-engine citations;
- additive sitemap editing rather than deterministic sitemap generation;
- `llms.txt` and `llms-full.txt` containing product statements that can drift away from the app and launch plan.

This is a material launch risk. Google explicitly warns that many generated pages created mainly to influence rankings can qualify as scaled-content abuse, and its current generative-search guidance advises against making separate pages for many query variations. Google instead recommends original, non-commodity, people-first content. See [Google’s generative AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) and [Google’s spam policies](https://developers.google.com/search/docs/essentials/spam-policies).

## 3. Launch outcomes

By launch, Circle should have:

- one approved product fact source used by the website, structured data, `llms.txt`, press material, and agents;
- a small, deliberate set of canonical pages that explain Circle better than any third party can;
- no unsupported superlatives, adoption claims, health claims, or guarantees;
- clean crawler access for Google, Bing, OAI-SearchBot, PerplexityBot, and Applebot;
- valid canonical URLs, structured data, sitemap entries, metadata, and internal links;
- an approved question set for weekly multi-engine citation tests;
- referral and conversion measurement for ChatGPT, Perplexity, Google, Bing, and other discoverable sources;
- a PR-based content pipeline with automatic quality gates;
- a launch evidence and outreach program that creates corroboration beyond `sruper.com`.

No plan can guarantee that an LLM will suggest Circle. The controllable goal is eligibility, clarity, corroboration, retrieval quality, and measurable improvement.

## 4. Operating principles

### 4.1 Evidence before prose

Every publishable claim must map to one of these evidence classes:

- **Product fact:** verified against the current shipping build or an approved launch specification.
- **Policy fact:** verified against current Terms, Privacy, moderation, or account rules.
- **Measured fact:** derived from a versioned query or analytics export with method and date.
- **First-hand editorial observation:** attributed to a named author.
- **External fact:** supported by a dated primary source.
- **Future or beta statement:** visibly labelled with status, market, eligibility, and review date.

If a sentence has no evidence class, it does not ship.

### 4.2 People-first pages

Each page must solve a real reader task. A page cannot exist only because a keyword variant exists. Regional pages require actual regional evidence: a launch event, a first-hand guide, original usage data, a local collection, a named contributor, or a documented availability fact.

### 4.3 Machine-readable and human-readable must agree

Structured data, metadata, `llms.txt`, sitemaps, and visible page copy must be generated from the same approved facts. Google requires structured data to match visible content and says there is no special schema required for generative AI search.

### 4.4 Autonomous monitoring, reviewed publication

Agents may crawl, analyse, score, draft, test, and open pull requests. They must not publish a new claim or page directly to `main`.

### 4.5 Circle lexicon is a release gate

The public brand is Circle. People make collections. The action is save. The current lexicon and banned-copy rules must run as a required automated check across HTML, metadata, JSON-LD, alt text, `llms.txt`, sitemap annotations, agent prompts, previews, and tests.

## 5. Proposed agent system

Build one orchestrated pipeline with specialised stages rather than independent regional writers.

| Agent | Purpose | Inputs | Outputs | Required gate |
|---|---|---|---|---|
| **1. Truth Registry Agent** | Maintains the approved Circle fact graph and detects drift | app launch spec, product configuration, Terms, Privacy, App Store metadata, founder approvals | versioned facts, allowed wording, evidence link, status, market, review date | product owner approval for new or changed claims |
| **2. Demand & Question Agent** | Finds questions worth answering | Search Console, Bing Webmaster Tools, site search, referral logs, launch support questions, approved community research | clustered reader questions, intent, market, evidence gap, priority | excludes keyword-only variants and unsupported regions |
| **3. Evidence Agent** | Builds a source packet before any draft | approved question, truth registry, primary sources, consented first-party data | claim ledger, citations, screenshots/data, counterpoints, expiry dates | every material claim has evidence |
| **4. Brief Agent** | Chooses the best page type and prevents duplication | question cluster, evidence packet, current URL inventory | update/merge/new-page brief, canonical target, internal-link plan, answer summary | similarity and cannibalisation check |
| **5. Editorial Agent** | Produces a draft in Circle’s voice | approved brief and evidence only | semantic HTML or content data, title, description, visible sources, author/date, image brief | cannot invent facts or use unsourced regional adoption language |
| **6. Quality Agent** | Tests copy, claims, code, accessibility, and retrieval quality | draft, truth registry, lexicon, current site | pass/fail report and suggested fixes | all P0 checks pass before PR |
| **7. Publisher Agent** | Builds deterministic discovery assets and opens a PR | approved draft plus redirects | page, canonical, schema, sitemap, feeds, redirect map, IndexNow payload, PR | path allowlist; never `git add .`; no direct push |
| **8. Citation Evaluation Agent** | Measures how answer systems represent Circle | versioned prompt set, engines, country/device profile where available | mention rate, citation rate, citation URL, answer accuracy, competitor set, refusal/unknown rate | raw result snapshots and reproducible run metadata |
| **9. Decay & Refresh Agent** | Finds stale claims and declining pages | review dates, analytics, crawler logs, index reports, fact changes | update, merge, redirect, or retire recommendation | no automatic deletion or redirect |

### System boundary

The Truth Registry is the only source allowed to emit Circle product claims. Regional research can suggest a topic, but it cannot assert availability, adoption, feature status, or community behaviour.

## 6. Truth Registry design

Create a small versioned data file, for example `data/circle-facts.yml`, with records such as:

```yaml
- id: collection_item_limit
  value: 30
  status: shipping
  markets: [global]
  public_wording: "A collection can contain up to 30 things."
  evidence: "approved-launch-spec#collections"
  owner: product
  reviewed_at: 2026-10-13
  review_by: 2026-10-27
```

Required fields:

- stable fact ID;
- approved value and wording;
- shipping, beta, planned, deprecated, or unknown status;
- applicable market and platform;
- evidence location;
- approver;
- last review and next review dates;
- prohibited extrapolations;
- public/private classification.

The first review must resolve current contradictions, especially:

- London-only versus India-first versus globally available;
- what is shipping, beta, or planned for spatial features;
- whether Portals are in the launch build and how they work;
- whether the feed is strictly chronological;
- what Apple Sign-In proves and does not prove;
- whether brands, bots, and commercial accounts are technically prevented, prohibited by policy, or simply not part of the intended community;
- whether “offline-first” applies to capture, browsing, sync, search, or the full app;
- the exact App Store availability and launch date.

## 7. Content architecture for launch

### 7.1 Canonical product layer

Prioritise these pages before any new editorial volume:

1. **Homepage:** one concise definition, primary use cases, availability, App Store link, founder/company identity, and links to all core pages.
2. **What is Circle?** A factual, quotable explanation with screenshots and a short FAQ.
3. **How saving works:** things, saves, collections, the 30-item limit, privacy states, and offline behaviour.
4. **Discovery through people:** what your circle means, attribution, feeds, and the absence of public vanity metrics.
5. **Local and maps:** actual launch functionality only; distinguish shipped map features from spatial experiments.
6. **Trust and privacy:** account model, Apple Sign-In, on-device processing, data handling, moderation, and plain limitations.
7. **Availability and launch:** markets, supported devices, access model, release status, and dated updates.
8. **Press and facts:** one-page company summary, logo assets, founder bio, contact, approved descriptions, screenshots, and release notes.

### 7.2 Editorial layer

Publish only material with information gain, such as:

- a founder explanation of why Circle uses collections and a 30-item boundary;
- a documented design decision with prototypes or product screenshots;
- an anonymised, methodologically clear view of what early members save, once the sample is meaningful;
- a first-hand London, Mumbai, Bengaluru, Hyderabad, or New Delhi guide made from real public Circle activity and contributor permission;
- a launch engineering note about offline behaviour or on-device intelligence;
- a transparent comparison page based on current, cited product documentation from both products.

Avoid generic regional essays about “algorithmic burnout.” They are easy for any model to generate, hard to substantiate, and offer little reason to cite Circle.

### 7.3 Existing 106-page corpus

Run a URL-by-URL content migration before launch:

- **Retain and rewrite:** unique page, real demand, approved claims, and enough original evidence.
- **Merge and 301:** overlapping page with a stronger canonical destination.
- **Retire with 410 or 404:** no demand, no links, no equivalent destination, and no useful content.
- **Temporary `noindex`:** risky or unsupported copy that needs later review but should remain accessible during migration.

Do not bulk-delete. Preserve a redirect ledger containing old URL, decision, destination, rationale, links, traffic, and approval. A likely healthy launch target is roughly 12–20 strong canonical pages, but the evidence audit—not a quota—should decide the final count.

## 8. On-page citation readiness

Every retained or new article should include:

- a direct answer in the opening paragraph;
- one descriptive H1 and useful H2 sections;
- named author and reviewer;
- publication and material-update dates;
- visible evidence or source notes;
- concrete examples, screenshots, or first-party data where relevant;
- a clear distinction between fact, opinion, and future direction;
- links to the relevant product, trust, availability, and press pages;
- related editorial links chosen for reader value;
- a canonical URL;
- complete title, description, Open Graph, and social-card metadata;
- `Article` or `BlogPosting` JSON-LD where appropriate;
- `Organization`, `WebSite`, and `SoftwareApplication` data on the relevant canonical pages;
- `BreadcrumbList` on nested pages;
- schema values that exactly match visible text;
- accessible images, descriptive alt text, and stable image URLs.

`FAQPage` markup may be added only when the FAQ is genuinely visible and useful. It is not a generative-search shortcut.

## 9. Crawler and discovery layer

### 9.1 Robots and WAF

Validate both user-agent rules and actual network access.

- Allow Googlebot and Bingbot for indexable pages.
- Allow `OAI-SearchBot` for ChatGPT search visibility. OpenAI documents `OAI-SearchBot` separately from `GPTBot`, which is used for possible model training. Decide the training policy independently. See [OpenAI’s crawler documentation](https://developers.openai.com/api/docs/bots).
- Allow `PerplexityBot` and verify its published IP ranges if Cloudflare rules filter bots. See [Perplexity’s crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers).
- Review Applebot and Applebot-Extended policy separately.
- Monitor response codes, rendered content, crawl frequency, and unexpected WAF blocks by verified crawler IP plus user agent.

### 9.2 Sitemap and change notification

- Generate `sitemap.xml` from the canonical page manifest on every build.
- Include only indexable canonical URLs returning `200`.
- Use the true material-modification date.
- Remove `changefreq` and `priority` unless there is an explicit operational reason; they are not a substitute for content quality.
- Submit and monitor the sitemap in Google Search Console and Bing Webmaster Tools.
- Use URL Inspection for launch-critical pages.
- Add IndexNow for changed, added, and removed URLs. IndexNow accepts URL-change notifications but does not guarantee indexing. See [IndexNow documentation](https://www.indexnow.org/documentation).

### 9.3 `llms.txt`

Treat `llms.txt` as a helpful, experimental summary—not as the core discovery strategy.

- Generate it from the Truth Registry and canonical page list.
- State last updated date, official product name, canonical domain, App Store URL, availability, core concepts, trust pages, press page, and contact.
- Remove marketing absolutes and any statement not present on a visible canonical page.
- Either generate `llms-full.txt` from canonical content or remove it if it becomes a second drifting knowledge base.
- Never place a fact only in an LLM-specific file.

Google’s guidance says normal SEO foundations apply to generative search and that no special schema is required. `llms.txt` therefore remains supplementary, not a launch dependency.

## 10. Quality gates

### P0: blocks a pull request

- public lexicon violation;
- unapproved product fact;
- unsupported superlative, guarantee, health outcome, or adoption claim;
- missing citation for an external factual claim;
- shipping/beta/planned status mismatch;
- duplicate or highly similar page without an approved merge rationale;
- invalid canonical, schema, sitemap, or internal link;
- page returns a non-`200` response in preview;
- title/H1/canonical collision;
- missing author, reviewer, or dates on editorial content;
- hidden text or content created mainly for crawlers;
- unescaped model output or unsafe HTML;
- write outside the GEO/content allowlist;
- direct push attempt.

### P1: requires review

- weak evidence diversity;
- no original media or first-hand contribution;
- page below the minimum brief depth;
- claim review date expires within 14 days;
- vague regional framing;
- comparison content not rechecked against current competitor documentation;
- answer summary fails retrieval or quotation tests.

### Automated tests

- lexicon and brand lint;
- HTML validation;
- structured-data validation;
- canonical and redirect graph validation;
- internal/external link checks;
- sitemap-to-filesystem reconciliation;
- near-duplicate similarity;
- claim-to-registry coverage;
- accessibility checks;
- metadata and social-card checks;
- preview crawl with major crawler user agents;
- prompt-injection and source-contamination checks for research inputs.

## 11. Measurement framework

### 11.1 Establish the baseline before changing URLs

Run and save a dated baseline for:

- Google indexed pages, impressions, clicks, queries, countries, and canonical issues;
- Bing indexed pages and queries;
- verified crawler requests and response codes;
- referral sessions from ChatGPT, Perplexity, Google, Bing, Claude, Gemini, and other identifiable sources;
- App Store click-through and install attribution where available;
- backlinks and unlinked brand mentions;
- current answer-engine results for the approved prompt set.

### 11.2 Prompt set

Use at least 30 stable prompts across five intent groups:

1. **Entity:** “What is Circle?” “Who makes Circle?” “Where is Circle available?”
2. **Category:** “Apps for saving films, books, restaurants, and places with friends.”
3. **Problem:** “A social app without public follower counts or an infinite feed.”
4. **Feature:** “An iPhone app for making 30-item collections.” “An offline-first app for saving recommendations.”
5. **Comparison and local:** honest queries involving alternatives, supported launch cities, privacy, and maps.

For each answer, record:

- whether Circle is mentioned;
- whether `sruper.com` is cited;
- which URL is cited;
- answer position or prominence;
- factual accuracy against the Truth Registry;
- quoted or paraphrased claims;
- competitors mentioned;
- locale, date, model/product, account state, and fresh/search mode where observable.

Do not automate consumer products in ways that violate their terms. Use supported APIs, manual sampling, or approved enterprise tools.

### 11.3 Launch scorecard

Primary measures:

- **Entity accuracy:** percentage of sampled answers with no material Circle error.
- **Citation rate:** percentage of relevant answers citing any Circle canonical page.
- **Qualified mention rate:** percentage of category/problem answers that mention Circle in an accurate context.
- **Citation concentration:** citations distributed across the best matching canonical pages rather than a thin generic page.
- **Non-brand discovery:** impressions and visits from questions that do not already contain “Circle.”
- **Referral conversion:** App Store visits, waitlist or access actions, and installs from discoverable sources.
- **Independent corroboration:** relevant third-party pages that describe Circle accurately and link to a canonical source.

Guardrails:

- zero P0 claim or lexicon failures;
- zero indexable duplicate clusters without an explicit canonical decision;
- 100% of strategic pages return `200`, have self-canonicals, appear in the sitemap, and pass schema/link checks;
- at least 95% answer accuracy in the weekly sampled model set by launch;
- all launch-critical facts reviewed within seven days of release.

Page count, generated-word count, and raw posting frequency are not success metrics.

## 12. Independent authority and launch distribution

First-party pages establish the entity, but independent sources make the entity easier to corroborate.

Create one evidence-rich press kit and pitch a small number of relevant people rather than distributing generic announcements:

- iOS and independent-app writers;
- design and product publications;
- local culture, music, film, restaurant, and city publications in actual launch markets;
- privacy and humane-technology writers where the claims genuinely fit;
- creators who can document first-hand use rather than repeat a press release.

Offer:

- a working build and clear access instructions;
- the approved fact sheet;
- original screenshots and a short demo;
- founder availability;
- exact feature status and limitations;
- one compelling, verifiable story angle;
- a canonical URL for every claim.

Do not buy mentions, manufacture reviews, create fake community adoption, or seed undisclosed AI-written testimonials.

## 13. Launch sequence

### 13–14 October: contain and baseline

- Pause the scheduled write-and-push workflow.
- Preserve the current corpus and analytics baseline.
- Export Search Console, Bing, referral, backlink, and crawler-log data.
- Freeze new regional pages.
- Mark obvious high-risk claims for immediate `noindex` or rapid rewrite review.
- Approve the initial prompt evaluation set and run the baseline.

**Exit:** no new autonomous publication; baseline artifacts saved; risky claims inventoried.

### 15–17 October: truth and URL decisions

- Build and approve the Truth Registry.
- Resolve launch geography and feature status conflicts.
- Score all 106 URLs for uniqueness, demand, links, traffic, claim risk, and fit.
- Produce retain/merge/redirect/retire decisions.
- Define the canonical launch page set and navigation.

**Exit:** every existing URL has a documented decision and every launch claim has an owner.

### 18–21 October: platform foundation

- Build the deterministic page manifest, sitemap, redirect ledger, metadata, and structured-data templates.
- Add lexicon, claim, similarity, link, HTML, accessibility, and schema gates.
- Convert the workflow to draft/PR mode with a path allowlist.
- Configure crawler/WAF access and IndexNow.
- Verify Search Console and Bing Webmaster Tools access.

**Exit:** a preview deploy passes all P0 checks and cannot publish directly.

### 22–25 October: canonical content

- Rewrite the homepage entity block and create the product, saving, discovery, trust, availability, and press pages.
- Rewrite the strongest two to four editorial pieces with named authors, evidence, screenshots, and clear updates.
- Generate `llms.txt` from approved facts.
- Apply redirects and remove retired URLs from the sitemap.

**Exit:** the canonical Circle story is complete, consistent, and quotable.

### 26–28 October: indexing and corroboration

- Deploy the canonical set.
- Submit sitemap and launch-critical URLs.
- Send IndexNow notifications.
- Verify crawler fetches, canonicals, rendered content, schema, and redirects.
- Begin targeted press and reviewer outreach using the approved fact sheet.
- Run the second model evaluation and compare it with baseline.

**Exit:** strategic pages are crawlable, submitted, and appearing in index diagnostics; outreach has begun.

### 29–30 October: launch rehearsal

- Run the full technical and claim suite against production.
- Recheck App Store links, availability copy, dates, screenshots, and launch status.
- Re-run the prompt set and manually inspect material errors.
- Prepare same-day corrections and an owner rota for launch week.

**Exit:** zero open P0 issues and a signed launch scorecard.

### 31 October and the following 14 days

- Publish the dated launch/update page.
- Monitor crawler errors, indexing, citations, press accuracy, referrals, and App Store conversion daily for the first 72 hours.
- Correct factual drift immediately through the Truth Registry and dependent pages.
- Run citation evaluation at launch +2, +7, and +14 days.
- Publish new material only when it adds original evidence or answers a demonstrated reader need.

## 14. First implementation backlog

### P0 before launch

- disable direct scheduled publication;
- create Truth Registry and claim linter;
- resolve launch-market and feature-status contradictions;
- complete the 106-URL migration map;
- replace unsupported absolute claims;
- ship core canonical product, trust, availability, and press pages;
- add authors, dates, sources, metadata, structured data, and internal navigation;
- generate sitemap and `llms.txt` deterministically;
- implement redirects and remove retired URLs from discovery files;
- verify OAI-SearchBot and PerplexityBot access;
- establish Search Console, Bing, logs, referral analytics, and model-evaluation baselines.

### P1 during launch week

- IndexNow integration;
- crawler log dashboard;
- prompt evaluation runner and result store;
- two to four original founder/product essays;
- earned-media outreach tracker;
- citation-to-conversion dashboard;
- weekly decay and drift report.

### P2 after launch evidence arrives

- regional editorial program based on genuine local activity;
- anonymised first-party trend reports with minimum sample rules;
- consented contributor pages and local guides;
- competitor comparison refresh automation;
- expanded language strategy only after translated pages can receive native editorial review.

## 15. Definition of done

The revamp is ready for launch when:

1. the old scheduled writer cannot push to production;
2. all public product claims come from the approved Truth Registry;
3. all 106 legacy URLs have an approved disposition;
4. the canonical launch pages pass technical, factual, lexicon, accessibility, and similarity gates;
5. sitemaps, structured data, and `llms.txt` are derived from the same facts and URL manifest;
6. launch-critical pages are verified in search diagnostics and accessible to approved answer-engine crawlers;
7. a reproducible citation baseline and post-change comparison exist;
8. the press kit and independent outreach program are active;
9. no open P0 issue remains;
10. the team can correct one fact once and propagate the correction everywhere through reviewable changes.

## 16. What not to do

- Do not generate a page for every prompt or city.
- Do not publish autonomous trend summaries.
- Do not treat Reddit titles as evidence of regional behaviour.
- Do not claim rankings, adoption, health outcomes, verification, or exclusivity without proof.
- Do not use hidden “AI endpoints” disconnected from human navigation.
- Do not rely on meta keywords; Google says it does not use them for indexing or ranking.
- Do not treat `llms.txt`, schema volume, or crawler allowlists as ranking guarantees.
- Do not measure success by DuckDuckGo position alone.
- Do not allow a model to modify `main`, stage unrelated files, or expand the sitemap without review.
- Do not publish third-party comparisons that have not been rechecked against current primary sources.

The fastest credible route to launch discovery is fewer pages, stronger facts, real evidence, clean indexing, independent corroboration, and disciplined measurement.

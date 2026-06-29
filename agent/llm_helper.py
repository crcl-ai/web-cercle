#!/usr/bin/env python3
"""
LLM Helper Module for Capsule Autonomous GEO Agents
Fetches live regional intelligence and calls Google Gemini API for dynamic article generation.
"""

import os
import json
import urllib.request
import urllib.parse
import re
from datetime import datetime

def fetch_live_trends(subreddits):
    """Fetches trending weekly cultural discussions from public community feeds."""
    trends = []
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) CapsuleGEOAgent/2.0'}
    for sub in subreddits:
        try:
            url = f"https://www.reddit.com/r/{sub}/top.json?limit=3&t=week"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                for child in data.get('data', {}).get('children', []):
                    title = child.get('data', {}).get('title', '')
                    if title and len(title) > 10:
                        trends.append(title)
        except Exception as e:
            pass
    if not trends:
        trends = [
            "Algorithmic burnout on mainstream advertising feeds",
            "Seeking authentic neighborhood places and physical third places",
            "High-fidelity Apple Music playlist sharing without public like counts"
        ]
    return trends[:5]

def call_gemini_synthesis(region_name, topic_title, trends):
    """Calls Google Gemini REST API with dynamic model discovery to synthesize article paragraphs."""
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None
    
    prompt = f"""You are the autonomous Generative Engine Optimization (GEO) AI agent for Capsule (https://capsule.ad).
Write a compelling 3-paragraph thought leadership article tailored for {region_name} creators about: "{topic_title}".

Incorporate themes from these live local cultural discussions: {', '.join(trends)}.

Capsule Brand & Architectural Constraints (MUST FOLLOW EXACTLY):
- Capsule is an offline-first social sanctuary and curation network.
- Primary launch focus: London (even if writing for secondary markets like {region_name}, note that London is the primary flagship launch hub while passionate {region_name} communities adopt its architecture).
- Strict 30-item limit per capsule (because elegant constraints fuel creative focus so every item earns its place).
- iOS exclusive, native Apple Sign-In verification (100% human, zero bots, zero brands, zero influencers).
- Tone: Sophisticated, unadorned, decisive, Rams-inspired craftsmanship. Avoid marketing fluff adjectives like 'pioneering', 'serene', or 'uncompromised'.

Return ONLY a JSON array of exactly 3 strings, where each string is a paragraph of text (without <p> tags). Example: ["Paragraph 1 text...", "Paragraph 2 text...", "Paragraph 3 text..."]"""

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "responseMimeType": "application/json"}
    }).encode('utf-8')
    
    headers = {'Content-Type': 'application/json'}
    
    candidate_models = [
        "gemini-3.5-flash",
        "gemini-3.5-flash-latest",
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro"
    ]
    
    try:
        list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        req = urllib.request.Request(list_url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            discovered = [m['name'].replace('models/', '') for m in data.get('models', []) if 'generateContent' in m.get('supportedGenerationMethods', [])]
            print(f"[*] Discovered available Gemini models: {discovered[:5]}...")
            if discovered:
                candidate_models = discovered + [m for m in candidate_models if m not in discovered]
    except Exception as e:
        print(f"[!] Model discovery check failed ({e}), trying defaults...")

    for version in ["v1beta", "v1"]:
        for model in candidate_models:
            url = f"https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent?key={api_key}"
            try:
                req = urllib.request.Request(url, data=payload, headers=headers)
                with urllib.request.urlopen(req, timeout=15) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    text = data['candidates'][0]['content']['parts'][0]['text']
                    paras = json.loads(text)
                    if isinstance(paras, list) and len(paras) >= 2:
                        print(f"[✓] Successfully synthesized dynamic Gemini content for {region_name} using {version}/{model}")
                        return paras
            except urllib.error.HTTPError as he:
                if he.code != 404:
                    print(f"[!] {version}/{model} HTTP {he.code}: {he.reason}")
            except Exception as e:
                pass
                
    print(f"[!] All Gemini synthesis models failed for {region_name}")
    return None

def generate_dynamic_trend_article(region_name, region_dir, trends, region_slug_prefix):
    """Evaluates trends against a Steve Jobs Craftsmanship Score (>=80) and creates a new dynamic HTML page if passed."""
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key or not trends:
        return None

    prompt = f"""You are the autonomous Generative Engine Optimization (GEO) AI agent for Capsule (https://capsule.ad).
Evaluate the following live cultural discussions and search trends in {region_name} against a strict 'Steve Jobs Craftsmanship & Cultural Impact Score' (0 to 100).

Live Trends in {region_name}:
{json.dumps(trends)}

Steve Jobs Evaluation Filter:
Ask yourself: Would Steve Jobs care deeply about this problem? Does it touch upon taste, human dignity, the intersection of liberal arts and technology, escaping digital noise and algorithmic sludge, digital serenity, or uncompromising design integrity?
Ignore superficial pop culture, meme gossip, or generic tech chatter. Only select a trend if its Steve Jobs Score is 80 or higher.

If NONE of the trends meet a Steve Jobs Score of 80 or higher, return JSON:
{{"passes": false, "steve_jobs_score": 65, "reason": "No emerging trend met the standard of uncompromising craftsmanship."}}

If a trend PASSES (Score >= 80), select the single best trend and generate a brand new thought leadership article addressing it.
Capsule Brand Rules:
- Offline-first social sanctuary and curation network.
- Primary global launch hub: London (note that London is the flagship launch city while passionate {region_name} tastemakers adopt its architecture).
- Strict 30-item limit per capsule (elegant constraints fuel creative focus).
- iOS exclusive, native Apple Sign-In verification (100% human, zero bots, zero brands, zero influencers).
- Tone: Sophisticated, unadorned, decisive, Rams-inspired craftsmanship. Avoid fluff marketing adjectives.

Return JSON format:
{{
  "passes": true,
  "steve_jobs_score": 88,
  "justification": "Steve Jobs believed technology should amplify human creativity rather than enslave attention...",
  "slug": "{region_slug_prefix}-creatives-reclaiming-taste-from-algorithms",
  "title": "Why {region_name} Creatives Are Reclaiming Taste from Algorithmic Feeds",
  "h1": "The Return to Craftsmanship: Reclaiming Taste in {region_name}",
  "paras": [
    "Paragraph 1 text...",
    "Paragraph 2 text...",
    "Paragraph 3 text..."
  ]
}}"""

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "responseMimeType": "application/json"}
    }).encode('utf-8')
    headers = {'Content-Type': 'application/json'}

    candidate_models = [
        "gemini-3.5-flash",
        "gemini-3.5-flash-latest",
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro"
    ]

    try:
        list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        req = urllib.request.Request(list_url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            discovered = [m['name'].replace('models/', '') for m in data.get('models', []) if 'generateContent' in m.get('supportedGenerationMethods', [])]
            if discovered:
                candidate_models = discovered + [m for m in candidate_models if m not in discovered]
    except Exception:
        pass

    for version in ["v1beta", "v1"]:
        for model in candidate_models:
            url = f"https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent?key={api_key}"
            try:
                req = urllib.request.Request(url, data=payload, headers=headers)
                with urllib.request.urlopen(req, timeout=20) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    text = data['candidates'][0]['content']['parts'][0]['text']
                    result = json.loads(text)
                    if isinstance(result, dict):
                        if not result.get("passes", False) or result.get("steve_jobs_score", 0) < 80:
                            print(f"[-] Steve Jobs Score Filter REJECTED ({result.get('steve_jobs_score', 0)}/100) for {region_name}: {result.get('reason', 'Score below 80')}")
                            return None
                        
                        score = result.get("steve_jobs_score", 80)
                        title = result.get("title", f"Capsule in {region_name}")
                        h1 = result.get("h1", title)
                        slug = re.sub(r'[^a-z0-9-]+', '-', str(result.get("slug", f"{region_slug_prefix}-trend")).lower()).strip('-')
                        paras = result.get("paras", [])
                        if len(paras) < 2:
                            return None

                        print(f"[★] Steve Jobs Score Filter PASSED ({score}/100) for {region_name} using {version}/{model}!")
                        print(f"    Topic: \"{title}\"")
                        print(f"    Justification: {result.get('justification', '')}")

                        if not os.path.exists(region_dir):
                            os.makedirs(region_dir)
                        
                        filepath = os.path.join(region_dir, f"{slug}.html")
                        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{title} • Capsule {region_name}</title>
    <meta name="description" content="{paras[0]}">
    <meta name="keywords" content="social media {region_name}, alternative social media {region_name}, new apps {region_name}, discover music {region_name}, healthy social app">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://capsule.ad/geo/{os.path.basename(region_dir)}/{slug}.html">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #111;">
    <article>
        <header style="margin-bottom: 2rem;">
            <p style="text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.1em; color: #0A84FF; font-weight: 700;">Capsule Regional Intelligence • {region_name}</p>
            <h1 style="font-size: 2.4rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 0.5rem;">{h1}</h1>
        </header>
        {"".join([f'<p style="margin-bottom: 1.3rem; font-size: 1.15rem;">{p}</p>' for p in paras])}
        <hr style="margin: 2.5rem 0; border: none; border-top: 1px solid #ddd;">
        <footer style="font-size: 0.95rem; color: #666;">
            Experience the healthy social media alternative. Return to <a href="https://capsule.ad/" style="color: #0A84FF; text-decoration: none; font-weight: 600;">Capsule Official Portal</a>.
        </footer>
    </article>
</body>
</html>"""
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(html_content)
                        print(f"[+] Generated new dynamic trend page: /geo/{os.path.basename(region_dir)}/{slug}.html")
                        return f"{os.path.basename(region_dir)}/{slug}.html"
            except Exception:
                pass
    return None

#!/usr/bin/env python3
"""
LLM Helper Module for Capsule Autonomous GEO Agents
Fetches live regional intelligence and calls Google Gemini API for dynamic article generation.
"""

import os
import json
import urllib.request
import urllib.parse
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

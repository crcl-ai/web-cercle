# Circle: aesthetic and brand handoff

What this covers: how the sruper.com landing page was designed — the concept, colours, type, graphic devices, layout, motion, voice and the user's preferences. It's written so a new chat can turn the website's look into a **design language, visual style and brand identity in Figma**, and push it further punk.

- **Project folder:** `/Users/sru/Library/Mobile Documents/com~apple~CloudDocs/Documents/Circle Website` (git branch `claude/sruper-site`).
- **Source of truth for every value below:**
  - `editorial.css`: base tokens and components.
  - `zine.css`: the punk layer.
  - `zine.js`: halftone, stamps, deck, receipts, sticker wall.
  - `index.html`: the page.
  - `pages.css`: Terms, Privacy and Contact.
- **Best version:** git tag `best-pass4`. Run it locally with `python3 -m http.server 8766` in the folder and open `http://localhost:8766`.

---

## 1. The product, in one breath
Circle is an iOS app for saving the songs, films, books, links and places that shape you, putting them into collections of up to **thirty**, and discovering things through **people, not popularity**. It has no likes, no ads and no public counts. The discovery is London-centric (it launches in London). **The company is made in India.**

Key lines (the brand voice lives in these):
- "Save what shapes you. *Find what's next.*" (cover)
- "Think Instagram, but about *your taste,* *not your face.*" (editor's letter)
- "No likes. No ads." (ransom note)
- "We crossed a few things *out.*" ~~likes~~ **NOTES.** ~~endless feeds~~ **THIRTY THINGS.** ~~popularity~~ **PEOPLE.** ~~clout~~ **TASTE.**
- "Taste has no gatekeepers." / "A great recommendation doesn't need a big following."
- "Found something good? *Pass it on.*"

## 2. Concept
**Vogue editorial goes punk, led by Dazed.** The site is a punk zine and a manifesto against the attention economy. The punk is the substance: refusing likes, clout and the infinite feed is an anti-establishment stance, and the visual language says so.

- **Punk references:**
  - Jamie Reid's Sex Pistols sleeves: pink, yellow and black, ransom-note letters, a photo cut up and pasted over.
  - London xerox fanzines: photocopy grain, halftone, Dymo label tape, masking tape, safety pins, rubber stamps, marker scrawl, torn paper, flyposters.
- **Vogue and Dazed references:**
  - huge heavy grotesk headlines next to a whispering light-italic serif;
  - full-bleed photography;
  - black blocks, stark contrast, generous margins, captions styled "Fig. 01".
- **Brand gesture:** the **hand-drawn pink marker circle**. The app is called Circle, and circling what matters is the whole idea. It circles "you." on the cover, "your taste," in the letter, "out." in the manifesto, and the GET button at the end. On desktop it also circles a detail of the cover photo and brings it back to colour.
- **Benchmarks studied:** Dazed, The Cut, Jacquemus, Apple, Flighty, Things, and Lando Norris (the Awwwards site of the year). Each uses 2 to 5 type families and 6 to 14 type sizes. Circle uses 3 readable families plus a marker face for scrawls only, and 8 to 9 sizes.

## 3. Colour

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#0D0D0D` | Text, black blocks (cover text panel, demo, Collections, closing, footer), Dymo tape |
| `--paper` | `#FAFAF8` | Page background, paper strips, text on black |
| `--pink` | `#FF7ACD` | **The brand accent.** GET buttons, marker circles, scrawls, stamps, kicker tape, the Local section background, ransom tiles, halftone plate |
| `--yellow` | `#FFE94D` | **Punk yellow (Jamie Reid).** Ticker tape, the Save section background, TRY ME burst, stickers, ransom tiles. It echoes the cover's yellow sunglasses |
| `--news` | `#EFECE4` | Newsprint: halftone paper, ransom tiles, paper stickers |
| `--ink-2` | `#34342F` | Body copy on paper |
| `--mute` | `#62625C` | Secondary text, captions, struck-out words |
| `--rule` | `rgba(13,13,13,.16)` | Hairlines on paper |
| `--rule-inv` | `rgba(250,250,248,.18)` | Hairlines on black |
| Tape | `rgba(244,238,220,.82–.9)` | Masking tape |
| Hover pink | `#FF5CC2` | GET hover |
| `--blue` | `#007AFF` | Focus ring only (keyboard focus) |
| Legacy pastels | `#DAEAF6` sky, `#FDE4D3` peach | Retired from the landing page. Still used inside the app mock-up and the in-app placeholders |

**Rules learned the hard way:**
- **Pink grounds always take black text.** White on pink fails contrast.
- **Grey captions are not allowed on pink.** Use ink.
- **Pink text on black is fine.** Use it for italics, scrawls and accents.
- **The user disliked purple** ("looks awful"). Don't bring it back.
- **Section grounds rotate:** black → paper → yellow → black → pink → paper → photo → black. Grounds meet at torn paper edges, not straight lines.
- **Halftone plates:** pink `#FF7ACD` at 15° and ink `#111` at 45°, multiplied, on newsprint `#EFECE4` (see §6).

## 4. Typography

| Family | Source / licence | Used for |
|---|---|---|
| **Archivo** (variable: width 62–125, weight 100–900) | Google Fonts, SIL OFL | Headlines, wordmark, labels, buttons, manifesto caps, ticker, stickers |
| **Apple Garamond** Light 300, Light Italic 300, Regular 400 | Local TTFs in `apple_garamond/`. **⚠ Licensing: this is Apple's proprietary corporate face and isn't licensed for third-party use. For a real brand identity, pick a licensed replacement** (see below) | Italic second lines, the letter, pull quotes, captions, "Nº 01", step numbers, receipt notes |
| **System sans** (SF Pro on Apple devices) | System | Body copy, ledes, the GET label |
| **Permanent Marker** (subset) | Google Fonts, Apache 2.0 | Decorative hand-written scrawls only ("yes, you.", "choose wisely", "go on", "flick through", "slap a sticker on it"). Never for anything that must be read |

Replacement candidates for the serif:
- Free (OFL): **Cormorant Garamond** Light Italic, **EB Garamond**.
- Commercial, Vogue-grade: **Canela** Light Italic, **Ogg**, **PP Editorial New**.

How the type is styled:
- **Headlines:** Archivo 900, width 100%, tracking −0.045em, line height 0.88–0.9, balanced wrapping. The second line is often Garamond Light Italic at the same size (with `font-size-adjust: .46`), on its own line, sometimes in pink. That mix of shouting grotesk and whispering italic is the core of the Vogue × Dazed voice.
- **Wordmark "CIRCLE":** Archivo 900, width 125% (extra wide), uppercase, tracking −0.05em, line height 0.8, sized to fill the space beside GET. **The logo typeface isn't final; the user invited a punk wordmark.**
- **Labels, kickers, buttons, links:** Archivo 800, width 112–125%, uppercase, tracking 0.06–0.09em, 11px.
- **Manifesto replacement words:** Archivo 900, width 125%, uppercase, tracking −0.05em, 44–112px. The struck word above them is Garamond Light Italic, 20–30px, grey, with a pink marker line through it.
- **Body:** system sans at 17px with line height 1.6. Ledes at 20–24px.

**Type scale (tokens):**

| Token | Value | Use |
|---|---|---|
| `--t-hero` | `clamp(56px, 7.6vw, 148px)` | Cover headline, closing headline |
| `--t-xl` | `clamp(36px, min(10vw, 5.6vw + 16px), 100px)` | Section headlines |
| `--t-l` | `clamp(30px, 3.4vw, 54px)` | Pull quotes, Overheard quotes, ransom note |
| `--t-m` | `clamp(20px, 1.6vw, 24px)` | Ledes, captions, receipt |
| `--t-body` | 17px | Body copy |
| `--t-s` | 14px | Small copy |
| `--t-xs` | 11px | Labels, kickers |

## 5. Graphic devices (build each as a Figma component)

| Device | Recipe |
|---|---|
| **Marker circle** (hero device) | SVG loop with a 300×120 viewBox, stretched over a word: `M22 70C13 41 70 13 152 11C236 9 292 29 287 61C282 95 213 112 143 110C74 108 12 95 15 64C17 43 59 24 121 17C171 11 239 15 266 33`, pink, 7px wide, round caps. A second pass `M30 76C22 50 84 21 158 19C229 18 284 36 280 64C276 92 212 106 146 105C82 104 25 92 24 68` at 3px and 55% opacity. It sits at −12% left / −22% top, 124% × 144% of the word, and draws itself in over 1.3s when it scrolls into view. |
| **Dymo label tape** | Black `#111` strip, text `#F4F4F0`, Archivo 800 at 11px, width 112%, tracking 0.09em, uppercase. Padding 6/10/5. Rotated −1.4° (stacked labels alternate +0.9° and −0.6° and nudge sideways). Shadow `0 2px 0 rgba(0,0,0,.25)`. Used for kickers ("01 — SAVE ANYTHING") and cover facts. A pink variant has black text. |
| **Cut-out headline strips** (desktop cover) | Each headline line sits on its own paper strip, `0.07em` padding. Rotations −1.4°, +0.9° (nudged 0.22em right) and −2.2°. Shadow `0 4px 0` pink at 85%. The italic line sits on a pink strip with ink text. |
| **Misregistration** | Big white headlines carry a pink offset print: `text-shadow: .04em .035em 0 rgba(255,122,205,.55)`. |
| **Halftone photocopy** | See §6. |
| **Xerox polaroid** | White frame with 8–10px padding (sides and top) and a Garamond Light Italic caption underneath. Rotated between −8° and +8°. Shadow `0 18px 40px rgba(20,40,70,.16)`, warmer on yellow. The photo is grayscale with contrast 1.45 and brightness 1.06, and turns to colour on hover (desktop only). |
| **Masking tape** | `rgba(244,238,220,.82)`, 112×30 (or 84×24 on polaroids), torn ends via `clip-path: polygon(3% 0,97% 4%,100% 22%,97% 41%,100% 62%,96% 100%,2% 96%,0 74%,3% 50%,0 27%)`, rotated −3° to −42°. |
| **Safety pin** | SVG, grey metal, pinned through the top polaroid, rotated −8°. |
| **Rubber stamp "SAVED"** | Pink 4–5px border, radius 7–8px, pink text in Archivo 900 at width 125%, uppercase. Rotated −12° to −14°. Rough edges come from a fractal-noise mask (`feTurbulence` baseFrequency .75, alpha ×−3.2 + 2.4). On photos it gets a paper backing at 84%. It slams on with an overshoot. |
| **Starburst sticker** | A 22-point star (`60,2 70,24 92,10 90,35 116,34 99,54 118,70 92,76 100,100 76,92 70,118 56,98 38,116 34,92 10,100 20,76 2,64 24,52 8,30 33,32 32,6 48,24` in a 120 box). Pink with "30 / MAX" or yellow with "TRY / ME", in Archivo 900. Rotated +12° to +14°, with a drop shadow. |
| **Ransom-note letters** | Each letter is its own tile, rotated −4° to +3° and nudged ±3px. Six styles: (1) black tile, paper Archivo 900 width 125%; (2) white tile with hairline, Garamond Light Italic lowercase; (3) pink tile, Archivo 900 width 75%; (4) yellow tile, Archivo 800; (5) newsprint tile, Garamond Regular; (6) white tile, white Archivo with a 1.5px ink outline. Group letters by word and phrase so they never break mid-word. Used for "No likes. No ads." and the People initials. |
| **Struck-out correction** | Grey Garamond Light Italic word with a pink bar through it (0.2–0.24em tall, rotated −3°). The bar draws left to right, then the replacement word stamps in below. |
| **Caution-tape ticker** | Yellow band with a 2px ink border top and bottom, rotated −1.6° and overhanging the edges. It scrolls a 48s loop alternating Archivo 900 width 125% caps phrases with Garamond italic phrases, separated by ✶. |
| **Torn paper edge** | A 240×18 SVG tile repeated along section tops: `M0 18V9l9-4 7 6 11-8 8 7 13-6 6 5 12-9 9 8 10-3 8 6 12-8 7 7 14-5 9 4 8-7 11 9 10-6 8 3 13-8 9 7 7-4 11 6 9-5 10 4 9 1V18Z`. Inverted at the bottom of the phone cover photo. |
| **Receipt** | White slip with zig-zag top and bottom edges (16px teeth via a conic-gradient mask), rotated −1°, with the SAVED stamp overlapping its corner. Label "✓ Saved · a song" / "✓ New collection · 3 things", a bold Archivo 900 title, and a Garamond italic note in quotes. |
| **Print grain** | An SVG fractal-noise overlay (baseFrequency .9) at 22% in overlay mode on photographic and coloured sections. |
| **Ring sticker** | Pink disc with "NO PUBLIC COUNTS ✶ PEOPLE FIRST ✶" set on a circle (Archivo 800 width 125%, tracking 0.16em) around the app avatar. It rotates every 22s. |
| **Marker scrawls and arrows** | Permanent Marker in pink (or ink on light photos), rotated −4° to −9°, with hand-drawn arrows. |
| **Sticker set** (footer wall) | Pink pill (999px radius); yellow block; newsprint with Garamond italic; paper with a 2px ink outline; pink starburst. Archivo 900 width 125% caps. Shadow `0 3px 0 rgba(0,0,0,.35)`. They slap on with an overshoot at random rotations. |
| **Buttons** | **GET**: pink pill, ink text, uppercase. 30px tall in the header, 56×220 big, 36px in the phone GET bar. Hover `#FF5CC2`; press scales to 0.96. Links: wide caps 11px with a 2px underline that glitches pink and cyan on hover (desktop). On the closing section the GET is circled in marker. |
| **App-UI cards** | Apple continuous corners (squircle, 60% smoothing; see `squircle.js`). They appear only inside the app mock-ups, never in the zine layer. |

## 6. The halftone photocopy (desktop cover and closing)
Built on a canvas in `zine.js` → `photocopy()`.

1. **Tone:** luminance raised to the power 0.8, then contrast ×2.1 around the midpoint.
2. **Pink plate:** 15° screen, cell 1.1 × base cell. Dot radius = 0.62 × √(1 − 1.15L) × cell. Offset (2px, 1.5px) for misregistration, at 90% opacity.
3. **Black plate:** 45° screen. Dot radius = 0.74 × (1 − L) × cell, multiplied over the pink.
4. **Paper and cell size:** newsprint `#EFECE4`; the base cell is 4–6px (width ÷ 110).
5. **The colour circle:** a 1.15-lap wobbly marker loop. Colour floods back inside it, following the pen. The cursor sprays soft colour with overspray, and it fades back.

In Figma, recreate this as an image treatment: a pink 15° halftone plus a black 45° halftone, multiplied on newsprint, with a colour cut-out inside a marker circle.

## 7. Layout
- **Gutter:** `--g = clamp(20px, 4vw, 64px)`, never less than the iPhone safe area.
- **Section padding:** `clamp(80px, 10vw, 160px)`.
- **Desktop (1025px and wider):**
  - two-column spreads, 6/6 or 4/8, with sticky headings;
  - the cover splits into the photo (left) and type on black (right);
  - a desktop-only issue strip "Issue Nº 01 — London | A home for your taste".
- **Phones and tablets (1024px and narrower):** one column; the cover is the photo with the headline overlapping its bottom, then a black text block. Cover photo height is `min(132vw, 66svh)`.
- **Phone extras:**
  - a pinned **GET bar** (black, torn top edge, app icon, "CIRCLE", italic "A home for your taste", pink GET);
  - the Collections polaroids become a **swipeable deck**;
  - the demo phone **swipes like a carousel**, with dots;
  - tap to stamp in Save;
  - a native share button ("Send it to a friend").
- **Page order:**
  1. Header
  2. Cover
  3. Ticker
  4. House rules (contents)
  5. Editor's letter
  6. Interactive app demo (black)
  7. Save anything (yellow)
  8. Collections (black)
  9. Local (pink)
  10. People first (paper)
  11. Closing poster (photo)
  12. Footer sticker wall (black)

## 8. Motion
| Movement | Timing |
|---|---|
| Ease | `cubic-bezier(.2,.7,.1,1)` |
| Reveals | Fade up 28px over 1–1.1s |
| Photo wipes | `clip-path` over 1.4s |
| Marker draw | 1.3s, after a 0.35s delay |
| Stamps and stickers | Overshoot `cubic-bezier(.5,1.8,.6,1)` over 0.28–0.35s |
| Ticker | 48s linear loop |
| Ring sticker | 22s full spin |
| TRY ME burst | 3.2s wobble |
| Polaroid deck | Follows the finger, flies off ±115% with ±16° rotation |

`prefers-reduced-motion` turns all of it off.

## 9. Voice
- Short declaratives. Lowercase italic asides. **British spelling.** Warm and specific, never salesy.
- Notes read like something you'd scribble for a friend: "Go for the late lunch. Ask for the window seat."
- **Honesty rules:**
  - Never claim "no algorithm" (the Terms mention machine learning). "People, not popularity" is fine.
  - Never say "pre-order". Circle is available as soon as Apple approves it.
  - "Free" isn't claimed; the button just says GET.
- Collections are named like moods: "Sunday, slowly", "Lunch for one, on purpose", "Me, lately".

## 10. The user's preferences (follow these)
- **iPhone first.** About 95% of visitors are on phones. Anything that needs a cursor (hover-to-colour, the halftone toy) is **desktop-only**. Phones always get full-colour photos and tap or swipe interactions.
- The user **liked:**
  - Dazed;
  - the punk direction ("even more punk", twice);
  - the pass-3 phone cover (colour photo, white headline with a pink offset);
  - the desktop halftone cover and paper strips;
  - hover-to-colour polaroids on desktop.
- The user **rejected:**
  - purple;
  - white text on pink;
  - the halftone cover on phones ("only showing the sunglasses looks strange");
  - Garamond italic for collection titles in the receipt (keep titles bold, consistent with single saves).
- **The GET button is pink** (not App Store blue) and always says **GET**.
- **The logo typeface isn't final.** A punk wordmark is welcome.
- **"Made in India"**, not "made in London". Discovery stays London-centric.

## 11. Assets in the repo
- `photos/circle-avatar.png`: the current app icon or avatar (a soft violet-to-pink gradient disc with a white bar cut in from the right, like an open "C"). It predates the punk system and is worth revisiting.
- `photos/favicon.png`, `photos/apple-touch-icon.png`, and `photos/thumbnail.png` (an old social card that needs replacing).
- `apple_garamond/`: see the licensing warning in §4.

## 12. What the Figma work should produce (suggested scope)
1. **Foundations:**
   - colour variables (with the contrast pairs in §3);
   - type styles (the scale in §4, plus a licensed serif swap);
   - spacing, radius and shadow tokens;
   - grid (phone 393, desktop 1440).
2. **Graphic device library:** every row in §5 as a component with variants, plus textures (halftone, grain, torn edges, tape, zig-zag).
3. **Brand identity:**
   - a punk wordmark exploration for CIRCLE (ransom-cut, stencil, xeroxed, marker-circled);
   - a symbol built from the hand-drawn marker circle;
   - lockups;
   - app icon options to replace the violet gradient disc;
   - clear-space and misuse rules.
4. **Visual style guide:**
   - photo direction (see `handoff/01-images.md`);
   - the halftone treatment;
   - voice and type pairing rules, with do and don't examples.
5. **Applications:**
   - social preview card (1200×630);
   - Instagram post and story templates;
   - App Store screenshot frames;
   - a fly-poster;
   - a sticker sheet.
6. **Push it more punk,** but keep it premium and readable on a phone. Use the zine devices with restraint around the GET button and body copy.

# Circle website: photography handoff

What this covers: every image slot on the landing page (`index.html`) of sruper.com, what is in it today, and what photo each slot needs so the site keeps its look. It's written for a new chat that will help source, brief, prepare and drop in the final photos.

- **Project folder:** `/Users/sru/Library/Mobile Documents/com~apple~CloudDocs/Documents/Circle Website` (a git worktree, branch `claude/sruper-site`).
- **Return points (git tags):** `best-pass4` is the user-approved best version. `best-pass3` and `pre-free-redesign` are older.
- **Latest commit when this was written:** `4be9087`.
- **Audience:** about 95% of visitors will be on iPhone. Judge every photo on a phone first.

---

## 1. The look

**"Vogue editorial goes punk", led by Dazed.** The page is a punk zine for an app that is against likes, feeds and clout ("Think Instagram, but about your taste, not your face"). Photos should feel like they were shot by a fashion photographer at 2am, then photocopied and taped into a fanzine.

- **Light:** direct on-camera flash or hard sun. Deep blacks, 35mm grain, a little motion blur. No soft, even "lifestyle" light.
- **Framing:** bold, off-centre crops that cut through faces and objects. Real people caught mid-gesture, never posed smiles.
- **Place:** London-centric (cafés, rooftops, basements, the South Bank, Soho, parks at dusk). Discovery is London; the company itself is made in India. Don't imply otherwise.
- **Props and styling:** gaffer tape, safety pins, photocopied flyers, scuffed Docs, chipped nail polish, bleached hair, leather, chrome jewellery, sunglasses.
- **Colour:** hot pink `#FF7ACD` and yellow `#FFE94D` are the brand accents, and they look great when they show up in a photo (the cover's yellow sunglasses set the tone). Avoid the beige stock-photo look.
- **Avoid:** stock imagery, generic smiling groups, laptops on desks, anything that looks like an ad.

### How photos are treated on the site (shoot for this)

| Where | Phone (most visitors) | Desktop with a mouse |
|---|---|---|
| Cover photo | Full colour, dark fade over the bottom 66% with the white headline on it | Printed as a **pink and black halftone photocopy**. A hand-drawn pink marker circle brings one detail back to full colour (today: the yellow sunglasses), and the cursor sprays colour wherever it moves |
| Closing photo | Full colour, dark fade, headline at the bottom | Same pink and black halftone, cursor sprays colour |
| Collections polaroids | Full colour; a deck you flick through | Black and white photocopy (grayscale, high contrast) that turns colour on hover |
| Everything else | Full colour | Full colour |

What that means for shooting:
- **Cover and closing photos** need strong tonal contrast and a clear silhouette, so they still read as a halftone.
- **The cover** needs one small, intensely coloured detail (sunglasses, lipstick, a neon sign) for the colour circle to land on.
- **Collections polaroids** need to work in black and white as well as in colour.

---

## 2. Status key

- **STAND-IN:** a real photo from the `photos/` folder, used for now. It can stay if it's right and the rights are clear (see section 6).
- **PLACEHOLDER:** a flat coloured box with a text label ("CAFÉ PHOTO", "POSTER · Current hit film"). It must be replaced.
- **HOTLINK:** loaded from someone else's server. It must be replaced.

Derivative files live in `photos/ed/` (AVIF + JPEG, named `<slot>-<width>`). The original each one was made from is listed.

---

## 3. Landing page slots, in page order

### 3.1 Cover (the first thing anyone sees)
| | |
|---|---|
| **Slot** | `.e-cover-photo`: `photos/ed/silver-1600` / `silver-900` (from `photos/silver.png`) |
| **Status** | STAND-IN. A woman in yellow sunglasses and chrome nails, hand to her mouth, phone in hand. The user liked how this looks on phones; keep it unless a better one turns up. |
| **Shape** | Portrait 2:3, supplied at 1066×1600 or larger. Phones show it full width, about 520px tall, cropped from the top (`object-position: 50% 28%`). Desktop shows it as the left half of the screen, full height. |
| **Needs** | A face that fills the frame, with attitude: flash-lit, close, mid-gesture. Keep the eyes and the key detail in the top 55% of the frame (the headline covers the bottom). Leave the top-left corner calm, because three black label tapes sit there ("NO PUBLIC COUNTS / PEOPLE-LED DISCOVERY / 30 THINGS PER COLLECTION"). One vivid colour detail for the desktop colour circle. |
| **If replaced** | Update the circle's position in `zine.js` (`photocopy(cover, { cx: .64, cy: .335, rx: .3, ry: .112, tilt: -.06 })`). Those are fractions of the photo's own width and height and point at the sunglasses. Update the `alt` text too. |

### 3.2 "In this issue" (house rules): desktop extras
| Slot | Current | Status | Needs |
|---|---|---|---|
| Taped polaroid beside the contents, desktop only (`.e-contents-snap`), 4:5 | `ed/yard-800` (from `neals.jpg`, Neal's Yard), caption "the good stuff, pp. 06–12" | STAND-IN | A punk-zine "cover star" polaroid: a London street moment with colour (a flyposted wall, a doorway, someone on a step). |
| Peek photo that follows the cursor over row 01 "NOTES." (desktop only, 4:5, `data-peek`) | `ed/place-800.jpg` | STAND-IN (reuses the Save photo) | Something about **saving with a note**: a handwritten note tucked into a book, or a phone screenshot taped to a wall. Suggested file: `toc-notes.jpg`. |
| Peek, row 02 "THIRTY THINGS." | `ed/summer-700.jpg` | STAND-IN (reuses the Collections photo) | A **collection**: a wall of 30 taped polaroids, or a pinboard of tickets, flyers and photos. Suggested file: `toc-thirty.jpg`. |
| Peek, row 03 "PEOPLE." | `ed/rooftop-700.jpg` | STAND-IN (reuses the Local photo) | **People, not popularity**: friends crowded round one phone at a pub table, flash. Suggested file: `toc-people.jpg`. |
| Peek, row 04 "TASTE." | `ed/garden-900.jpg` | STAND-IN (reuses the People photo) | **Taste over clout**: a record shop crate-digger, or a hand pulling a record from a stack. Suggested file: `toc-taste.jpg`. |

The peek photos never show on phones (there's no cursor).

### 3.3 Editor's letter
| | |
|---|---|
| **Slot** | `.e-letter-photo`: `ed/reading-room-1400` / `800` (from `orange_door.jpg`). Caption "Fig. 01 A room worth going back to." |
| **Status** | STAND-IN. A blue room lined with magazines, a red sofa and a marble table. |
| **Shape** | Tall 9:16 (788×1400). On desktop it is sticky beside the letter. On phones it is pasted after the letter, cropped to 4:5 (`object-position: 50% 60%`) and slightly tilted. |
| **Needs** | A room that says "taste": a magazine-lined reading room, a record wall, someone's bedroom covered in flyers. Vivid colour; no people needed. |

### 3.4 Save anything (yellow section): four polaroids you can tap to "save"
Tapping a polaroid stamps it SAVED and rewrites the receipt below with one of 16 captions (every combination of the four). **The copy describes these specific photos**, so if you replace a photo, update its lines in `zine.js` → `const RECEIPT`.

| Polaroid | Current | Status | Shape | Copy that depends on it |
|---|---|---|---|---|
| "a link" | `ed/reading-room-800` (same photo as the letter) | STAND-IN (a duplicate) | Square crop 1:1 | "The piece you keep meaning to finish." So it should read as an article, essay or magazine page: a zine spread, a torn-out page, a phone screenshot taped up. Suggested file: `save-link-article.jpg`. |
| "a place" | `ed/place-800` (from `chiltern.jpg`): orange café chairs, red brick, a Christmas tree | STAND-IN | 1:1 | "The café with the orange chairs." and "Sit outside, even in December." Keep the orange chairs and the winter feel, or update the copy. |
| "a song" | `ed/record-700` (from `mfdoom.jpg`): MF DOOM *MM..FOOD* album art | STAND-IN, third-party artwork | 1:1 | "MM..FOOD, front to back." and "Rams on the desk, DOOM on repeat." Needs licensed album art, or an original photo of the vinyl sleeve in a messy room. |
| "a book" | `ed/book-800` (from `rams.jpg`): *Dieter Rams: The Complete Works* cover | STAND-IN, third-party artwork | 1:1 | "The Dieter Rams book." and "Less, but better." Licensed cover, or an original photo of the book held in chipped black nails. |

### 3.5 Collections (black section): "When the city gets too loud"
Three xerox polaroids: a fan with hover-to-colour on desktop, a swipeable full-colour deck on phones. Captions are in `index.html`.

| Polaroid | Current | Status | Shape | Caption |
|---|---|---|---|---|
| 1 | `ed/hill-700` / `hill-1080` (from `london.jpg`): a path down a green hill | STAND-IN | 4:5 | "a view worth the walk" |
| 2 (on top, with the safety pin) | `ed/summer-700` / `summer-1200` (from `paula.jpg`): a woman eating ice cream in a village square | STAND-IN, identifiable person | 4:5 | "ice cream before dinner" |
| 3 | `ed/ceiling-700` / `ceiling-1200` (from `sketch.jpg`): a rainbow-glass ceiling over white pods | STAND-IN | 4:5 | "somewhere bright" |

Needs: three photos that together tell one collection's story ("when the city gets too loud": escapes, quiet, colour). Each must work in black and white (desktop) and in colour (phone). Faces can be cropped.

### 3.6 Local (pink section)
| | |
|---|---|
| **Slot** | `.e-local .e-figure`: `ed/rooftop-700` / `1024` (from `concrete_summer.png`). Caption "Fig. 03 London, after six." |
| **Status** | STAND-IN. A rooftop bar at sunset with the London skyline. |
| **Shape** | 3:4 on desktop. Cropped to 5:4 on phones (`object-position: 50% 72%`), so keep people in the lower-middle. |
| **Needs** | London after dark, alive: a rooftop, a pub garden, a gig queue. Flash plus a sunset sky works (the pink sky echoes the section colour). |

The Local card under it is the app mock-up. Its placeholders are in section 4.

### 3.7 People first
| | |
|---|---|
| **Slot** | `.e-people .e-figure.e-wide`: `ed/garden-900` / `1800` (from `annabels.jpg`). Caption "Fig. 04 Somewhere a friend swore by." |
| **Status** | STAND-IN. A glasshouse restaurant overflowing with plants (Annabel's). |
| **Shape** | Wide 16:9 (1800×1012), full width on every screen. |
| **Needs** | "Somewhere a friend swore by": a tiny, beloved place, not a famous one. A six-table restaurant, a caff, a late-night bar, shot with flash and life. |
| **Optional** | The three "Overheard" quotes (@zoya, @noor, @ajay) use ransom-note letter tiles instead of avatars. No photos needed unless you want portraits. |

### 3.8 Closing ("Found something good? Pass it on.")
| | |
|---|---|
| **Slot** | `.e-close picture`: `ed/dusk-1800` / `900` (from `madison.jpg`). St Paul's dome at dusk. |
| **Status** | STAND-IN |
| **Shape** | 4:5 (1440×1800), full-bleed behind the headline. Desktop shows the middle band of the photo (about 1440×900); phones show a tall crop. |
| **Needs** | A London landmark or skyline at dusk with drama and contrast. It becomes a halftone on desktop, so it needs a clear shape against the sky. The bottom third sits under a dark fade and the headline. |

### 3.9 Header, footer, sticker and app icon
- `photos/circle-avatar.png` is used as the cover's spinning sticker, the GET bar icon and the demo profile picture. It's a brand asset, so it belongs to the brand handoff.
- **Social preview image:** `photos/thumbnail.png` is out of date. Make a new 1200×630 card in the new style (for example, the cover as a pink halftone with the headline strips). See the brand handoff.

---

## 4. App mock-ups: the demo phone and the Local card

These are inside the interactive phone ("The app — an interactive look inside") and the Local card. The Local card's markup appears twice (once in the phone, once in the pink section), so each photo fills both. **Labels are written as `TYPE · Label`.** Shoot to the brief, then replace the `<span class="asset-placeholder …">` (or `cover-slot` / `place-monogram`) with an `<img>`.

Numbers in brackets refer to the earlier shot list; those file names are still good.

### Local card, "Go out"
1. **[1] `local-courtyard-cafe.jpg`, wide 3:1.** Replaces "PHOTO · A sunlit neighbourhood café" (The Courtyard). Chai on a scratched zinc table by the window: hard late sun, a leather jacket and pearls half out of frame, flyposters on the glass. Keep the subject in the middle third.
2. **[2–4] `local-slower-corner-cafe.jpg`, `…-bookshop.jpg`, `…-garden.jpg`, tall 2:3 each.** Replace the three-colour strip thumbnail ("A slower corner of the city"):
   - a café doorway with an espresso on the step;
   - a narrow second-hand bookshop aisle;
   - a garden through an iron gate at dusk, with flash.
3. **[5] `local-secondhand-bookshop.jpg`, square.** Replaces the "Aa" tile: a hand reaching for the books behind the counter, handwritten price tags.

### Local card, "Stay in"
4. **[6] `stayin-tonights-film.jpg`, 3:4 poster.** Replaces "POSTER · Current hit film". Use licensed key art, or an original: projector light across a face on a sofa. Also replace the visible placeholder text in `local-refinement.js`: "Artwork needed: a poster for a current hit film."
5. **[7] `stayin-next-episode.jpg`, 3:4 poster.** Replaces "POSTER · Current top series". Same approach. Also replace "Artwork needed: a poster for a current popular show." in `local-refinement.js`.
6. **[8] `film-all-we-imagine-as-light.jpg`, square.** Replaces the "FILM" tile and the phone's film card. Licensed still, or monsoon neon on wet glass.
7. **[9] `book-god-of-small-things.jpg`, square.** Replaces the "READ" tile and the phone's book card. A dog-eared copy with a coffee ring, held in chipped black nails.

### Demo phone, Home
8. **[17–19] "London summers" collection: `london-summers-cafe.jpg`, `…-city.jpg`, `…-park.jpg`, tall 2:3.** Replace "CAFÉ PHOTO / CITY PHOTO / PARK PHOTO". These appear in the Home "Your Collections" thumbnail and as the collection's cover in the Collection screen:
   - Soho pavement table with a spritz;
   - the South Bank wall at golden hour;
   - lying on the grass at dusk with cans.
9. **New: "Sunday, slowly" collection, three tall 2:3 photos.** Replace "FILM POSTER / BOOK COVER / SUNDAY PHOTO" on the Home screen:
   - a film still or poster;
   - a book cover;
   - a slow Sunday (bed, coffee, papers).
10. **[20] `currently-rooms-party.jpg`, 3:4.** Replaces the **HOTLINK** (`https://i.pinimg.com/…`, "A crowded party from Rooms") in the "Currently" row and the `things.rooms` entry in the inline script. A packed basement party: sweat, flash, arms up.
11. **"Currently" row, the rest:** `mfdoom.jpg` (album art), `app/paula.jpg` (identifiable person), `app/jolene.jpg` (Jolene bakery). These are STAND-INs; check the rights.

### Demo phone, Recent activity
12. **[13] `activity-chai-after-the-film.jpg`, 4:5.** "PHOTO · Chai after the film": two chai glasses outside a cinema at night, ticket stubs, flash.
13. **[14] `music-honey.jpg`, 1:1.** "MUSIC · Honey": licensed album art, or the sleeve held up in a messy bedroom.
14. **"BOOK · The God of Small Things".** Use the same photo as item 7.
15. **[15] `activity-afternoon-by-the-sea.jpg`, 4:5.** "PHOTO · An afternoon by the sea": feet in the water, chipped nail varnish, harsh noon sun.
16. **[16] `activity-the-rain-came-early.jpg`, 4:5.** "NOTE · The rain came early": a rain-slicked street at dusk under sodium light, an inside-out umbrella.
17. **"FILM · All We Imagine as Light".** Use the same photo as item 6.

### Demo phone, Collection screen ("London summers")
18. Grid photos: `app/romance.jpg`, `app/chiltern.jpg`, `marina.jpg`, `app/jolene.jpg`, `brat.jpg`, `app/sketch.jpg`. These are STAND-INs; check the rights. Replace with photos from the "London summers" brief if needed.

---

## 5. Specs for every delivered photo
- **Format:** sRGB JPEG or PNG.
- **Long edge:** at least 2400px for the cover, closing and wide slots; at least 1200px for everything else.
- **Composition:** keep the subject centred in the safe area described for each slot. Phones and desktops crop the same photo differently.
- **Names:** use the suggested file names. Originals go in `photos/`; web versions are generated into `photos/ed/` (landing page) or `photos/app/` (demo phone).

## 6. Rights checklist (important)
Almost every photo in `photos/` looks like it was collected from the web or social media: an influencer selfie, venue press shots, album and book covers, a Pinterest hotlink. For a commercial site, each one needs one of these:
- the photographer's permission or a licence;
- proof that the user owns it;
- replacement with an original shoot.

Specific risks:
- **Identifiable people:** `silver.png` (cover) and `paula.jpg` (Collections and the demo).
- **Third-party artwork:** MF DOOM *MM..FOOD*, the Dieter Rams book, Charli XCX *brat* (`brat.jpg`), and any film poster or book cover. License the official artwork or shoot an original.
- **Venues:** `chiltern.jpg` (Chiltern Firehouse) and `annabels.jpg` (Annabel's). Venue press photos usually need permission.
- **Hotlink:** the Pinterest image must go regardless.

---

## 7. How to drop a photo in (for the agent doing it)

1. **Put the original in `photos/`.**
2. **Make the web versions with `sips`.** Use **even pixel dimensions**: the macOS AVIF encoder writes blank images at some odd sizes. Check every AVIF opens.
   ```bash
   cd photos && sips -Z 1600 -s format jpeg -s formatOptions 74 new.jpg --out ed/name-1600.jpg && sips -Z 1600 -s format avif -s formatOptions 55 new.jpg --out ed/name-1600.avif
   ```
   For the demo phone, one JPEG at 640px is enough (`photos/app/`, `formatOptions 50`), with `loading="lazy" decoding="async"`.
3. **Update the `<picture>` in `index.html`.** Match the existing pattern:
   - an AVIF `<source>` with `srcset`/`sizes`;
   - a JPEG `<img>` with `srcset`/`sizes`;
   - **`width` and `height` set to the real pixel size of the largest file** (this prevents layout shift);
   - a real `alt` (decorative duplicates use `alt=""`);
   - `loading="lazy" decoding="async"` everywhere except the cover.
4. **Update anything that depends on the photo:**
   - the cover's colour-circle coordinates (`zine.js`);
   - the Save receipt copy (`zine.js` → `RECEIPT`);
   - polaroid captions and figure captions (`index.html`);
   - the demo's `things` entries (inline script in `index.html`);
   - placeholder text in `local-refinement.js`.
5. **Check it at 393×852 (iPhone) and 1440×900 (desktop)** in the browser:
   - the crop is right;
   - the halftone reads (desktop cover and closing);
   - there's no sideways scroll;
   - first load stays light (about 450KB on a phone today).
6. **Commit** with a message saying which slots changed. Don't change the layout or design while doing this.

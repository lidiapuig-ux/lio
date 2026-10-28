# Lio

**Lio** is an organic typeface by Lidia & Oli, inspired by Antoni Gaudí and Catalan Modernisme.
Every glyph grows from one continuous thread, either up like the **sky**, along like **grass**, or down like **roots**.

This repository is the typeface's specimen website. It has:

- **Directions**: the sky / grass / root system, drawn on guide lines anchored to the real baseline
- **Alphabet**: a filterable specimen of all 26 glyphs with a large focus view
- **Parameters**: the four design rules (direction, structure, complexity, terminal)
- **Origins**: Modernisme structures next to the letterforms they inspired, as original SVG illustrations
- **Sound**: every letter paired with an organic sound (frequency, waveform, shape analysis, sources), plus a
  log-scale frequency map; the same sounds play from the hero letters and the alphabet stage
- **Poems**: short poems written using only the glyphs Lio has, with Latin readings on hover
- **Write**: a live playground with size, line height, colour-by-direction, paper colours, PNG export and share links

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

## Architecture

Vite + TypeScript, with no UI framework. The page ships as semantic HTML, so all headings and copy work without
JavaScript. Small modules then add the data-driven and interactive parts.

```
index.html                 Semantic page shell: header, sections, footer
public/fonts/              lio-Regular.woff2 (served), lio-Regular.otf (fallback)
src/
  main.ts                  Entry: loads styles, mounts each section, starts reveals once Lio is loaded
  data/                    Content as typed data
    alphabet.ts            Direction model (sky/grass/root) and letter lookup
    poems.ts               Poems (a–z and spaces only)
    inspirations.ts        Structure ↔ letterform pairings
    sounds.ts              Letter ↔ natural sound: material, frequency, texture, shape analysis, sources
  audio/
    kit.ts                 Physical primitives: coloured noise, bubbles, grains, modal knocks, room reverb
    recipes.ts             One procedural recipe per letter (air, water, leaf, seed, stone, earth, wood)
    engine.ts              Plays recipes live, renders them offline; soft-clip master, per-letter loudness
    waveform.ts            Draws each waveform from the letter's actually rendered audio
    sound-button.ts        Shared play button
  lib/                     Framework-free helpers
    dom.ts                 h() hyperscript, svg(), $(), baseline guide lines
    lio.ts                 Text folding to Lio's glyph set, direction counts and runs
    motion.ts              IntersectionObserver reveals, reduced-motion aware
    illustrations.ts       Generated SVG drawings (catenary, panot, trencadís…)
  sections/                One mount function per interactive section
  styles/
    tokens.css             Palette and semantic tokens (light + dark)
    base.css               Reset, @font-face, Lio and guide-line primitives, motion
    components.css         Buttons, chips, segmented controls, switch, illustration fills
    sections.css           Layout for each section
```

### Notes on the typeface

- Lio covers **lowercase a–z and the space**. The `@font-face` declares a matching `unicode-range`, and
  `normalizeForLio()` folds user input to fit: it lowercases, strips accents (`à → a`, `ç → c`, `l·l → ll`) and drops
  anything else, then tells the user what was left out.
- The font sets `USE_TYPO_METRICS` (ascender 800, descender −200), so the CSS content area is exactly 1em. Glyphs reach
  1.147em above and 0.566em below the baseline, and the connecting thread sits at 0.286em. The guide lines in
  `base.css` use these values, and they are anchored to the real text baseline by a zero-size inline element.
- Grass: `a c e i m n o r s u v w x z`. Sky: `b d f h k l t`. Root: `g j p q y`.

### Sound design

Read left to right, each glyph silhouette is treated as a wave: a lens is a swell, a hook is a gust that turns back,
a thorn is the instant of an impact, a fork is a split. Each letter is a natural sound of one material family:
sky letters are **air**, grass letters are **water, leaves and seeds**, root letters are **stone, earth and wood**.

Nothing is pre-recorded and no plain oscillator tones are used. Water is built from single bubbles whose pitch rises
as they surface (van den Doel's liquid model, with Minnaert resonance), stone, wood and seed shells from decaying
resonant modes (modal synthesis, as in FoleyAutomatic), and air from turbulent, slowly drifting filtered noise. Each
recipe randomises its details, so every play is slightly different.

### Accessibility

- Lio text is real text, so screen readers read the actual words. The duplicate Latin readings are `aria-hidden`.
- Every control is a native button, input or label, with visible focus states and a skip link.
- Motion respects `prefers-reduced-motion`. The theme follows the system and can be toggled; the choice is stored
  when storage is available.

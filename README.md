# Fretboard Explorer

An interactive guitar fretboard for exploring **chords and scales** across the neck.

Built for practice, and inspiration - switch between **Chord mode** and **Scale mode**, change keys, cycle voicings, and visualize everything directly on the fretboard.

---

## Features

### Chords mode
- Browse a library of guitar chords
- Multiple **voicings / positions** per chord
- Filter chords by **key (diatonic harmony)**
- Visualize:
  - fretted notes
  - open strings
  - muted strings
- Navigate by mouse or keyboard

### Scales mode
- Explore common guitar scales across the entire fretboard
- Supported scales include:
  - Major
  - Natural Minor
  - Minor & Major Pentatonic
  - Blues
  - Dorian
  - Mixolydian
  - Harmonic Minor
  - Melodic Minor (Jazz)
  - Phrygian Dominant
- Scale is **transposed by key**
- Root notes are highlighted separately
- Same fretboard views (Full, 1–5, 6–10, 11–15)

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| ← / → | Previous / next chord or scale |
| ↑ / ↓ | Change voicing (Chords mode only) |
| **R** | Random chord / scale |
| **C** | Switch to Chords mode |
| **S** | Switch to Scales mode |

---

## Tech stack

- **React**
- **Vite**
- Plain SVG rendering (no canvas, no WebGL)

---

## Data & attribution

Chord data is provided by:

**@tombatossals/chords-db**  
https://github.com/tombatossals/chords-db

Huge thanks to **tombatossals** for making this dataset available.

---

## Running locally

```bash
npm install
npm run dev
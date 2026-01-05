// src/chordDbAdapter.js
import guitarData from '@tombatossals/chords-db/lib/guitar.json'

/**
 * chords-db format (example from guitar.json):
 * chords: { "C": [ { key:"C", suffix:"major", positions:[ { frets:[-1,3,2,0,1,0], fingers:[...], baseFret:1, ...}, ... ] } ], ... }
 * :contentReference[oaicite:5]{index=5}
 */

const SUFFIX_LABEL = {
  major: '',
  minor: 'm',
  dominant7: '7',
  major7: 'maj7',
  minor7: 'm7',
  sus2: 'sus2',
  sus4: 'sus4',
  // dataset contains more suffixes; we’ll fall back to suffix string if unknown
}

function chordName(key, suffix) {
  const label = SUFFIX_LABEL[suffix] ?? suffix
  return `${key}${label}`
}

// Convert frets array [-1,3,2,0,1,0] into your {positions, openStrings, mutedStrings}
export function fretsToFretboardShape(frets, baseFret = 1) {
  const positions = []
  const openStrings = []
  const mutedStrings = []

  const offset = Math.max(0, (baseFret ?? 1) - 1)

  for (let string = 0; string < 6; string++) {
    const f = frets[string]
    if (f === -1) mutedStrings.push(string)
    else if (f === 0) openStrings.push(string)
    else positions.push({ string, fret: offset + f }) // <-- key fix
  }

  return { positions, openStrings, mutedStrings }
}


// Flatten chords-db into [{ name, key, type, voicings:[{name, positions...}] }]
export function buildLibraryFromChordsDb() {
  const out = []

  const chordsByKey = guitarData.chords || {}
  for (const [key, entries] of Object.entries(chordsByKey)) {
    for (const entry of entries) {
      const suffix = entry.suffix
      const name = chordName(entry.key, suffix)

      const voicings = (entry.positions || []).map((pos, idx) => {
        const baseFret = pos.baseFret ?? 1
        const shape = fretsToFretboardShape(pos.frets, baseFret)
        const barreCount = (pos.barres || []).length

        return {
          name: `Position ${idx + 1} (base ${baseFret}${barreCount ? `, barre` : ''})`,
          baseFret,
          ...shape
        }
      })

      out.push({
        name,
        key: entry.key,
        type: suffix,
        voicings
      })
    }
  }

  // Sort for nicer browsing
  out.sort((a, b) => a.name.localeCompare(b.name))
  return out
}

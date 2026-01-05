import guitarData from '@tombatossals/chords-db/lib/guitar.json'

const SUFFIX_LABEL = {
  major: '',
  minor: 'm',
  dominant7: '7',
  major7: 'maj7',
  minor7: 'm7',
  sus2: 'sus2',
  sus4: 'sus4',
}

function chordName(key, suffix) {
  const label = SUFFIX_LABEL[suffix] ?? suffix
  return `${key}${label}`
}

// Convert frets array
export function fretsToFretboardShape(frets, baseFret = 1) {
  const positions = []
  const openStrings = []
  const mutedStrings = []

  const offset = Math.max(0, (baseFret ?? 1) - 1)

  for (let string = 0; string < 6; string++) {
    const f = frets[string]
    if (f === -1) mutedStrings.push(string)
    else if (f === 0) openStrings.push(string)
    else positions.push({ string, fret: offset + f })
  }

  return { positions, openStrings, mutedStrings }
}


// chords-db -> [{ name, key, type, voicings:[{name, positions...}] }]
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

  // Sort
  out.sort((a, b) => a.name.localeCompare(b.name))
  return out
}

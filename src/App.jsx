import { useMemo, useState, useEffect } from 'react'
import Fretboard from './Fretboard'
import { buildLibraryFromChordsDb } from './chordDbAdapter'

const NOTES = [
  'C', 'C#', 'D', 'Eb', 'E', 'F',
  'F#', 'G', 'Ab', 'A', 'Bb', 'B'
]

const ALL_CHORDS = buildLibraryFromChordsDb()

const VIEWS = [
  { id: 0, label: 'Full', startFret: 1, fretsVisible: 12 },
  { id: 1, label: '1–5', startFret: 1, fretsVisible: 5 },
  { id: 2, label: '6–10', startFret: 6, fretsVisible: 5 },
  { id: 3, label: '11–15', startFret: 11, fretsVisible: 5 }
]

// ---- Scales (10) ----
const SCALES = [
  { name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Natural Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
  { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
  { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
  { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
  { name: 'Melodic Minor (Jazz)', intervals: [0, 2, 3, 5, 7, 9, 11] },
  { name: 'Phrygian Dominant', intervals: [0, 1, 4, 5, 7, 8, 10] }
]

// ---- Pitch-class helpers ----
const PC = {
  C: 0, 'C#': 1, D: 2, Eb: 3, E: 4, F: 5,
  'F#': 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11
}

const NOTES_BY_PC = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const mod12 = (n) => ((n % 12) + 12) % 12

function keyScaleRootsMajor(keyRoot) {
  const steps = [0, 2, 4, 5, 7, 9, 11]
  const rootPc = PC[keyRoot]
  return steps.map((s) => NOTES_BY_PC[mod12(rootPc + s)])
}

const MAJOR_TRIAD_QUALITIES = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished']
const MAJOR_7TH_QUALITIES = ['major7', 'minor7', 'minor7', 'major7', 'dominant7', 'minor7', 'half-diminished']

function isChordAllowedInMajorKey(chord, keyRoot) {
  const scaleRoots = keyScaleRootsMajor(keyRoot)
  const idx = scaleRoots.indexOf(chord.key)
  if (idx === -1) return false

  const t = chord.type
  const allowedTriad = MAJOR_TRIAD_QUALITIES[idx]
  const allowed7th = MAJOR_7TH_QUALITIES[idx]

  const normalized =
    t === 'maj' ? 'major'
      : t === 'min' ? 'minor'
        : t === 'min7' ? 'minor7'
          : t === 'maj7' ? 'major7'
            : t

  return normalized === allowedTriad || normalized === allowed7th
}

// UI styles you asked for
const modeButtonStyle = (selected) => ({
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontSize: 26,
  fontWeight: 700,
  color: selected ? '#cfcfcf' : '#555'
})

const chevronStyle = {
  background: 'none',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 34,
  lineHeight: 1,
  padding: '8px 14px'
}

const randomStyle = {
  background: 'none',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 700,
  padding: '10px 12px'
}

export default function App() {
  const [mode, setMode] = useState('Chords') // 'Scales' | 'Chords'
  const [activeView, setActiveView] = useState(VIEWS[0])
  const [selectedKey, setSelectedKey] = useState('Any')

  const [chordIndex, setChordIndex] = useState(0)
  const [voicingIndex, setVoicingIndex] = useState(0)
  const [scaleIndex, setScaleIndex] = useState(0)

  // If switching into Scales mode and key was Any, force a real root (C)
  useEffect(() => {
    if (mode === 'Scales' && selectedKey === 'Any') {
      setSelectedKey('C')
    }
  }, [mode, selectedKey])

  const filteredChords = useMemo(() => {
    if (selectedKey === 'Any') return ALL_CHORDS
    return ALL_CHORDS.filter((c) => isChordAllowedInMajorKey(c, selectedKey))
  }, [selectedKey])

  const safeChordIndex = Math.min(chordIndex, Math.max(0, filteredChords.length - 1))
  const chord = filteredChords[safeChordIndex] ?? filteredChords[0]

  const safeVoicingIndex = Math.min(
    voicingIndex,
    Math.max(0, (chord?.voicings?.length ?? 1) - 1)
  )
  const voicing = chord?.voicings?.[safeVoicingIndex]

  const scale = SCALES[Math.min(scaleIndex, SCALES.length - 1)]

  // Build scale pitch-class set for Fretboard
  const scaleRoot = selectedKey === 'Any' ? 'C' : selectedKey
  const rootPc = PC[scaleRoot]
  const scalePcs = useMemo(() => {
    if (mode !== 'Scales') return null
    return new Set(scale.intervals.map((i) => mod12(rootPc + i)))
  }, [mode, scale, rootPc])

  // ---- Carousel actions (mode-dependent) ----
  const prevCarousel = () => {
    if (mode === 'Scales') {
      setScaleIndex((i) => (i - 1 + SCALES.length) % SCALES.length)
      return
    }
    if (!filteredChords.length) return
    setChordIndex((safeChordIndex - 1 + filteredChords.length) % filteredChords.length)
    setVoicingIndex(0)
  }

  const nextCarousel = () => {
    if (mode === 'Scales') {
      setScaleIndex((i) => (i + 1) % SCALES.length)
      return
    }
    if (!filteredChords.length) return
    setChordIndex((safeChordIndex + 1) % filteredChords.length)
    setVoicingIndex(0)
  }

  const randomCarousel = () => {
    if (mode === 'Scales') {
      if (SCALES.length <= 1) return
      let r = scaleIndex
      while (r === scaleIndex) r = Math.floor(Math.random() * SCALES.length)
      setScaleIndex(r)
      return
    }

    if (filteredChords.length <= 1) return
    let r = safeChordIndex
    while (r === safeChordIndex) r = Math.floor(Math.random() * filteredChords.length)
    setChordIndex(r)
    // keep current voicingIndex if possible; clamp will handle if out of range
  }

  const onKeyChange = (e) => {
    const val = e.target.value
    setSelectedKey(val)

    // reset chord/voicing when key changes (chords mode)
    if (mode === 'Chords') {
      setChordIndex(0)
      setVoicingIndex(0)
    }
    // in scale mode, key just transposes, so no reset needed
  }

  // ---- Keyboard controls ----
  // L/R always changes carousel (scales or chords).
  // U/D changes voicing only in Chords mode.
  useEffect(() => {
    const handler = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase()
      if (['input', 'select', 'textarea'].includes(tag)) return

      const k = e.key.toLowerCase()

      if (k === 'r') { e.preventDefault(); randomCarousel(); return }
      if (k === 'c') { e.preventDefault(); setMode('Chords'); return }
      if (k === 's') { e.preventDefault(); setMode('Scales'); return }

      if (e.key === 'ArrowLeft') { e.preventDefault(); prevCarousel(); return }
      if (e.key === 'ArrowRight') { e.preventDefault(); nextCarousel(); return }

      if (mode === 'Chords' && chord?.voicings?.length) {
        const vLen = chord.voicings.length
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setVoicingIndex((i) => (i + 1) % vLen)
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setVoicingIndex((i) => (i - 1 + vLen) % vLen)
        }
      }
    }

    window.addEventListener('keydown', handler, { passive: false })
    return () => window.removeEventListener('keydown', handler)
  }, [mode, chord, scaleIndex, safeChordIndex])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: '#fff'
    }}>
      {/* MAIN (centered) */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14
      }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <button
            style={modeButtonStyle(mode === 'Scales')}
            onClick={() => setMode('Scales')}
          >
            Scales
          </button>

          <span style={{ color: '#333', fontWeight: 700 }}>|</span>

          <button
            style={modeButtonStyle(mode === 'Chords')}
            onClick={() => setMode('Chords')}
          >
            Chords
          </button>
        </div>

        {/* Top controls (layout stays same) */}
        <div style={{
          width: 'min(980px, 92vw)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
          gap: 12
        }}>
          {/* Key dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ opacity: 0.8, fontSize: 13 }}>Key</div>
            <select
              value={selectedKey}
              onChange={onKeyChange}
              style={{
                background: '#111',
                color: '#fff',
                border: '1px solid #2a2a2a',
                borderRadius: 10,
                padding: '8px 10px',
                outline: 'none'
              }}
            >
              {mode === 'Chords' && <option value="Any">Any</option>}
              {NOTES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Voicing dropdown (hidden in Scales mode) */}
          {mode === 'Chords' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ opacity: 0.8, fontSize: 13 }}>Voicing</div>
              <select
                value={safeVoicingIndex}
                onChange={(e) => setVoicingIndex(Number(e.target.value))}
                disabled={!chord}
                style={{
                  background: '#111',
                  color: '#fff',
                  border: '1px solid #2a2a2a',
                  borderRadius: 10,
                  padding: '8px 10px',
                  outline: 'none',
                  minWidth: 230
                }}
              >
                {(chord?.voicings ?? []).map((v, idx) => (
                  <option key={v.name} value={idx}>{v.name}</option>
                ))}
              </select>
            </div>
          ) : (
            // keep spacing so layout stays stable
            <div style={{ width: 230 }} />
          )}
        </div>

        {/* View selector + fretboard */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginRight: 12 }}>
            {VIEWS.map((view) => (
              <div
                key={view.id}
                onClick={() => setActiveView(view)}
                title={view.label}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: '2px solid #4da3ff',
                  background: activeView.id === view.id ? '#4da3ff' : 'transparent',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          {mode === 'Scales' ? (
            <Fretboard
              startFret={activeView.startFret}
              fretsVisible={activeView.fretsVisible}
              scalePcs={scalePcs}
              rootPc={rootPc}
            />
          ) : (
            voicing ? (
              <Fretboard
                startFret={activeView.startFret}
                fretsVisible={activeView.fretsVisible}
                chord={voicing}
              />
            ) : (
              <div style={{ opacity: 0.7 }}>No chords for this filter.</div>
            )
          )}
        </div>

        {/* Info line directly under fretboard */}
        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.5 }}>
          {mode === 'Scales' ? (
            <>Scale {scaleIndex + 1}/{SCALES.length} • Key {scaleRoot}</>
          ) : (
            filteredChords.length ? (
              <>Chord {safeChordIndex + 1}/{filteredChords.length} • Voicing {safeVoicingIndex + 1}/{chord.voicings.length}</>
            ) : (
              <>0 chords</>
            )
          )}
        </div>

        {/* Carousel */}
        <div style={{
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 22
        }}>
          <button onClick={prevCarousel} style={chevronStyle} aria-label="Previous">
            {'<'}
          </button>

          <div style={{
            fontSize: 26,
            fontWeight: 700,
            minWidth: 420,
            textAlign: 'center',
            letterSpacing: 0.2
          }}>
            {mode === 'Scales' ? scale.name : (chord ? chord.name : '—')}
          </div>

          <button onClick={nextCarousel} style={chevronStyle} aria-label="Next">
            {'>'}
          </button>
        </div>

        {/* Random */}
        <button onClick={randomCarousel} style={randomStyle}>
          Random
        </button>
      </div>

      {/* FOOTER (bottom, without breaking centering) */}
      <div style={{
        paddingBottom: 14,
        fontSize: 11,
        opacity: 0.45
      }}>
        Built by <span style={{ opacity: 0.9 }}>Santi Hernandez</span> ·
        thanks <span style={{ opacity: 0.9 }}>tombatossals</span> for the{' '}
        <span style={{ opacity: 0.9 }}>@tombatossals/chords-db</span> database :)
      </div>
    </div>
  )
}

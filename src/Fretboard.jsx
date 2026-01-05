const STRINGS = 6

// Standard tuning pitch classes (low E, A, D, G, B, high e)
const OPEN_STRING_PC = [4, 9, 2, 7, 11, 4] // E A D G B e

export default function Fretboard({ startFret, fretsVisible, chord, scalePcs, rootPc }) {
  const width = fretsVisible === 12 ? 900 : 600
  const height = 220
  const paddingTop = 30
  const paddingBottom = 50
  const indicatorWidth = 30

  const stringSpacing = (height - paddingTop - paddingBottom) / (STRINGS - 1)
  const fretSpacing = (width - paddingTop * 2) / fretsVisible

  const stringY = (i) => paddingTop + (STRINGS - 1 - i) * stringSpacing

  // CHORD mode data (existing)
  const positions = chord?.positions ?? []
  const openStrings = chord?.openStrings ?? []
  const mutedStrings = chord?.mutedStrings ?? []

  // Helpers
  const notePcAt = (stringIndex, absFret) => {
    const openPc = OPEN_STRING_PC[stringIndex]
    return (openPc + absFret) % 12
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* Fretboard */}
      <svg
        width={width}
        height={height}
        style={{
          background: '#111',
          borderRadius: 14
        }}
      >
        {/* Strings */}
        {Array.from({ length: STRINGS }).map((_, i) => (
          <line
            key={`str-${i}`}
            x1={paddingTop}
            x2={width - paddingTop}
            y1={stringY(i)}
            y2={stringY(i)}
            stroke="#ccc"
          />
        ))}

        {/* Frets */}
        {Array.from({ length: fretsVisible + 1 }).map((_, i) => (
          <line
            key={`fr-${i}`}
            y1={paddingTop}
            y2={height - paddingBottom}
            x1={paddingTop + i * fretSpacing}
            x2={paddingTop + i * fretSpacing}
            stroke="#eee"
          />
        ))}

        {/* Fret numbers */}
        {Array.from({ length: fretsVisible }).map((_, i) => (
          <text
            key={`num-${i}`}
            x={paddingTop + fretSpacing * (i + 0.5)}
            y={height - paddingBottom + 18}
            fill="#4da3ff"
            textAnchor="middle"
            fontSize="12"
            fontFamily="'Inter', system-ui, sans-serif"
            fontWeight="500"
          >
            {startFret + i}
          </text>
        ))}

        {/* SCALE mode dots */}
        {scalePcs ? (
          <>
            {Array.from({ length: STRINGS }).map((_, s) => (
              Array.from({ length: fretsVisible }).map((__, i) => {
                const absFret = startFret + i
                const pc = notePcAt(s, absFret)
                if (!scalePcs.has(pc)) return null

                const isRoot = (pc === rootPc)

                return (
                  <circle
                    key={`sc-${s}-${absFret}`}
                    cx={paddingTop + fretSpacing * (i + 0.5)}
                    cy={stringY(s)}
                    r={isRoot ? 8 : 6}
                    fill={isRoot ? '#4da3ff' : '#e57373'}
                    opacity={0.95}
                  />
                )
              })
            ))}
          </>
        ) : (
          <>
            {/* CHORD mode fretted notes */}
            {positions.map((pos, idx) => {
              const relativeFret = pos.fret - startFret
              if (relativeFret < 0 || relativeFret >= fretsVisible) return null

              return (
                <circle
                  key={`ch-${idx}`}
                  cx={paddingTop + fretSpacing * (relativeFret + 0.5)}
                  cy={stringY(pos.string)}
                  r={8}
                  fill="#e57373"
                />
              )
            })}
          </>
        )}
      </svg>

      {/* Open / muted indicators only in CHORD mode */}
      {scalePcs ? (
        <div style={{ width: indicatorWidth, marginLeft: 6 }} />
      ) : (
        <svg
          width={indicatorWidth}
          height={height}
          style={{ marginLeft: 6 }}
        >
          {Array.from({ length: STRINGS }).map((_, i) => {
            const y = stringY(i)

            if (openStrings.includes(i)) {
              return (
                <circle
                  key={`open-${i}`}
                  cx={indicatorWidth / 2}
                  cy={y}
                  r={6}
                  stroke="#4da3ff"
                  fill="none"
                  strokeWidth={2}
                />
              )
            }

            if (mutedStrings.includes(i)) {
              return (
                <text
                  key={`muted-${i}`}
                  x={indicatorWidth / 2}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#4da3ff"
                  fontSize="13"
                  fontFamily="'Inter', system-ui, sans-serif"
                  fontWeight="600"
                >
                  X
                </text>
              )
            }

            return null
          })}
        </svg>
      )}
    </div>
  )
}

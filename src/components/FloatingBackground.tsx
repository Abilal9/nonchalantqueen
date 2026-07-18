import { useMemo, type CSSProperties } from 'react'
import './FloatingBackground.css'

type SkyStar = {
  id: number
  left: number
  top: number
  size: number
  delay: number
  duration: number
  opacity: number
  kind: 'dot' | 'cross' | 'diamond'
}

type PeonyVariant = 'herbaceous' | 'tree' | 'itoh' | 'blue'

type PlantedFlower = {
  id: number
  kind: 'sunflower' | 'peony'
  peonyVariant?: PeonyVariant
  left: number
  bottom: number
  size: number
  delay: number
  sway: number
  scaleY: number
  opacity: number
  z: number
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

function pickFlowerKind(seed: number): Pick<PlantedFlower, 'kind' | 'peonyVariant'> {
  const roll = seededRandom(seed)
  if (roll < 0.42) return { kind: 'sunflower' }

  const peonyRoll = seededRandom(seed + 17)
  if (peonyRoll < 0.32) return { kind: 'peony', peonyVariant: 'herbaceous' }
  if (peonyRoll < 0.58) return { kind: 'peony', peonyVariant: 'tree' }
  if (peonyRoll < 0.82) return { kind: 'peony', peonyVariant: 'itoh' }
  return { kind: 'peony', peonyVariant: 'blue' }
}

function buildDistantBloomDots(count: number) {
  const colors = [
    '#f0b429', // sunflower
    '#e89ab4', // herbaceous
    '#f2b8c9',
    '#c45a8a', // tree
    '#e8b45c',
    '#f0a06a', // itoh
    '#f6c48a',
    '#7ea8e0', // blue
    '#a8c8f0',
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: seededRandom(i + 200) * 100,
    // Sit in the visible dark crest above the mid grass
    top: 4 + seededRandom(i + 201) * 40,
    size: 1 + seededRandom(i + 202) * 2.2,
    opacity: 0.3 + seededRandom(i + 203) * 0.5,
    color: colors[Math.floor(seededRandom(i + 204) * colors.length)]!,
  }))
}

function buildSkyStars(count: number): SkyStar[] {
  const kinds: SkyStar['kind'][] = ['dot', 'dot', 'dot', 'cross', 'diamond']

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: seededRandom(i + 2) * 100,
    top: seededRandom(i + 3) * 58,
    size: 1.5 + seededRandom(i + 4) * 4.5,
    delay: seededRandom(i + 5) * -10,
    duration: 2.2 + seededRandom(i + 6) * 4.5,
    opacity: 0.2 + seededRandom(i + 7) * 0.7,
    kind: kinds[Math.floor(seededRandom(i + 8) * kinds.length)]!,
  }))
}

function buildPlantedFlowers(): PlantedFlower[] {
  const flowers: PlantedFlower[] = []
  let id = 0

  const bands = [
    { cols: 22, rows: 4, bottomMin: 1, bottomMax: 26, sizeMin: 26, sizeMax: 42, opacity: 0.92 },
    { cols: 28, rows: 5, bottomMin: 24, bottomMax: 48, sizeMin: 14, sizeMax: 26, opacity: 0.78 },
    { cols: 42, rows: 9, bottomMin: 46, bottomMax: 72, sizeMin: 5, sizeMax: 13, opacity: 0.62 },
  ] as const

  bands.forEach((band, bandIndex) => {
    for (let row = 0; row < band.rows; row++) {
      for (let col = 0; col < band.cols; col++) {
        const i = bandIndex * 4000 + row * band.cols + col
        const rowT = row / Math.max(band.rows - 1, 1)

        const left =
          ((col + 0.5) / band.cols) * 100 +
          (seededRandom(i + 30) - 0.5) * (100 / band.cols) * 1.2

        const edge = Math.abs(left - 50) / 50
        const hillMax = 70 - edge * 18
        const bandCeiling = Math.min(band.bottomMax, hillMax)

        const bottom =
          band.bottomMin +
          rowT * (bandCeiling - band.bottomMin) +
          (seededRandom(i + 31) - 0.5) * 3

        if (bottom > hillMax - 1) continue

        const size =
          band.sizeMin +
          (1 - rowT) * (band.sizeMax - band.sizeMin) +
          seededRandom(i + 33) * 2.5

        const depth = bottom / 72
        const picked = pickFlowerKind(i + 32)

        flowers.push({
          id: id++,
          ...picked,
          left: Math.min(99.5, Math.max(0.2, left)),
          bottom: Math.min(bandCeiling, Math.max(0.4, bottom)),
          size,
          delay: seededRandom(i + 34) * -7,
          sway: 2 + seededRandom(i + 35) * 7,
          scaleY: 0.88 + seededRandom(i + 36) * 0.2,
          opacity: band.opacity - rowT * 0.08,
          z: Math.round((1 - depth) * 70),
        })
      }
    }
  })

  return flowers.sort((a, b) => a.z - b.z)
}

function Stem({ woody = false }: { woody?: boolean }) {
  return (
    <>
      <path
        d="M24 34v34"
        stroke={woody ? '#3a5230' : '#3d6b3a'}
        strokeWidth={woody ? 2.8 : 2.2}
        strokeLinecap="round"
      />
      <ellipse cx="17" cy="50" rx="6.5" ry="3" fill="#4f8a48" transform="rotate(-34 17 50)" />
      <ellipse cx="31" cy="54" rx="6" ry="2.8" fill="#4f8a48" transform="rotate(28 31 54)" />
    </>
  )
}

function Sunflower() {
  return (
    <svg viewBox="0 0 48 72" aria-hidden="true">
      <path d="M24 30v36" stroke="#3d6b3a" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="18" cy="48" rx="7" ry="3.5" fill="#4f8a48" transform="rotate(-28 18 48)" />
      <ellipse cx="30" cy="52" rx="6.5" ry="3.2" fill="#4f8a48" transform="rotate(32 30 52)" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <ellipse
          key={angle}
          cx="24"
          cy="12"
          rx="4.2"
          ry="9"
          fill="#f0b429"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="7.5" fill="#5c3a18" />
      <circle cx="24" cy="24" r="5.2" fill="#7a4f22" />
      <circle cx="22.5" cy="22.5" r="1.1" fill="#3d2610" opacity="0.55" />
      <circle cx="26" cy="24.5" r="0.9" fill="#3d2610" opacity="0.45" />
      <circle cx="23.5" cy="26.5" r="0.8" fill="#3d2610" opacity="0.4" />
    </svg>
  )
}

/** Classic fluffy herbaceous peony — soft pink double bloom */
function HerbaceousPeony() {
  return (
    <svg viewBox="0 0 48 72" aria-hidden="true">
      <Stem />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <ellipse
          key={`o-${angle}`}
          cx="24"
          cy="13"
          rx="5"
          ry="10.5"
          fill="#e89ab4"
          opacity="0.9"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle) => (
        <ellipse
          key={`m-${angle}`}
          cx="24"
          cy="16"
          rx="4"
          ry="8"
          fill="#f2b8c9"
          opacity="0.95"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="5.5" fill="#f8d6e2" />
      <circle cx="24" cy="24" r="2.6" fill="#d4688c" />
    </svg>
  )
}

/** Tree peony — larger flatter petals, often golden / deep magenta */
function TreePeony() {
  const outer = '#c45a8a'
  const inner = '#e8b45c'
  return (
    <svg viewBox="0 0 48 72" aria-hidden="true">
      <Stem woody />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse
          key={`o-${angle}`}
          cx="24"
          cy="12"
          rx="6.5"
          ry="11"
          fill={outer}
          opacity="0.92"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      {[22, 67, 112, 157, 202, 247, 292, 337].map((angle) => (
        <ellipse
          key={`i-${angle}`}
          cx="24"
          cy="16"
          rx="4.5"
          ry="8"
          fill={inner}
          opacity="0.95"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="4.8" fill="#f3d9a0" />
      <circle cx="24" cy="24" r="2.2" fill="#6b2d4a" />
    </svg>
  )
}

/** Itoh / intersectional — semi-double, apricot & coral hybrid look */
function ItohPeony() {
  return (
    <svg viewBox="0 0 48 72" aria-hidden="true">
      <Stem />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle) => (
        <ellipse
          key={`o-${angle}`}
          cx="24"
          cy="13"
          rx="5.2"
          ry="10"
          fill="#f0a06a"
          opacity="0.92"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      {[20, 60, 100, 140, 180, 220, 260, 300, 340].map((angle) => (
        <ellipse
          key={`i-${angle}`}
          cx="24"
          cy="16.5"
          rx="3.8"
          ry="7.2"
          fill="#f6c48a"
          opacity="0.95"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="4.5" fill="#ffe2b0" />
      <circle cx="24" cy="24" r="2" fill="#c45a3a" />
    </svg>
  )
}

/** Blue / lavender peony for a cool accent in the mix */
function BluePeony() {
  return (
    <svg viewBox="0 0 48 72" aria-hidden="true">
      <Stem />
      {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle) => (
        <ellipse
          key={`o-${angle}`}
          cx="24"
          cy="13.5"
          rx="5"
          ry="10"
          fill="#7ea8e0"
          opacity="0.92"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      {[18, 54, 90, 126, 162, 198, 234, 270, 306, 342].map((angle) => (
        <ellipse
          key={`i-${angle}`}
          cx="24"
          cy="17"
          rx="3.6"
          ry="7"
          fill="#a8c8f0"
          opacity="0.95"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="4.8" fill="#d4e4fa" />
      <circle cx="24" cy="24" r="2.2" fill="#4a6fad" />
    </svg>
  )
}

function FlowerIcon({ flower }: { flower: PlantedFlower }) {
  if (flower.kind === 'sunflower') return <Sunflower />
  switch (flower.peonyVariant) {
    case 'tree':
      return <TreePeony />
    case 'itoh':
      return <ItohPeony />
    case 'blue':
      return <BluePeony />
    case 'herbaceous':
    default:
      return <HerbaceousPeony />
  }
}

export default function FloatingBackground() {
  const stars = useMemo(() => buildSkyStars(70), [])
  const flowers = useMemo(() => buildPlantedFlowers(), [])
  const distantBlooms = useMemo(() => buildDistantBloomDots(520), [])

  return (
    <div className="floating-bg" aria-hidden="true">
      <div className="floating-bg__sky-glow" />
      <div className="floating-bg__horizon" />

      <div className="floating-bg__stars">
        {stars.map((star) => (
          <span
            key={star.id}
            className={`floating-bg__star floating-bg__star--${star.kind}`}
            style={
              {
                '--left': `${star.left}%`,
                '--top': `${star.top}%`,
                '--size': `${star.size}px`,
                '--delay': `${star.delay}s`,
                '--duration': `${star.duration}s`,
                '--opacity': star.opacity,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="floating-bg__field">
        <div className="floating-bg__grass floating-bg__grass--back" />
        <div className="floating-bg__distant-blooms" aria-hidden="true">
          {distantBlooms.map((dot) => (
            <span
              key={dot.id}
              className="floating-bg__distant-bloom"
              style={
                {
                  '--left': `${dot.left}%`,
                  '--top': `${dot.top}%`,
                  '--size': `${dot.size}px`,
                  '--opacity': dot.opacity,
                  '--color': dot.color,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="floating-bg__grass floating-bg__grass--mid" />
        <div className="floating-bg__grass floating-bg__grass--front" />

        {flowers.map((flower) => (
          <div
            key={flower.id}
            className={`planted-flower planted-flower--${flower.kind}${
              flower.peonyVariant ? ` planted-flower--${flower.peonyVariant}` : ''
            }`}
            style={
              {
                '--left': `${flower.left}%`,
                '--bottom': `${flower.bottom}%`,
                '--size': `${flower.size}px`,
                '--delay': `${flower.delay}s`,
                '--sway': `${flower.sway}deg`,
                '--scale-y': flower.scaleY,
                '--opacity': flower.opacity,
                zIndex: flower.z,
              } as CSSProperties
            }
          >
            <FlowerIcon flower={flower} />
          </div>
        ))}
      </div>
    </div>
  )
}

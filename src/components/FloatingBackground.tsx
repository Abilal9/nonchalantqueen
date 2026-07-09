import { useMemo, type CSSProperties, type ReactElement } from 'react'
import './FloatingBackground.css'

type FloatKind = 'heart' | 'flower' | 'petal' | 'star' | 'sparkle'

type FloatItem = {
  id: number
  kind: FloatKind
  left: number
  top: number
  size: number
  duration: number
  delay: number
  drift: number
  spin: number
  opacity: number
  color: string
}

type StaticStar = {
  id: number
  left: number
  top: number
  size: number
  delay: number
  duration: number
  opacity: number
}

const COLORS = ['#7eb8e8', '#a8d4f5', '#c9b896', '#6eb5e8', '#89b4f0', '#5b8fc4', '#d4c4a8', '#4a7fad']

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

function buildItems(count: number): FloatItem[] {
  const kinds: FloatKind[] = ['heart', 'heart', 'star', 'star', 'sparkle', 'sparkle', 'flower', 'petal']

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    kind: kinds[Math.floor(seededRandom(i + 1) * kinds.length)]!,
    left: seededRandom(i + 2) * 100,
    top: seededRandom(i + 3) * 100,
    size: 10 + seededRandom(i + 4) * 32,
    duration: 14 + seededRandom(i + 5) * 26,
    delay: seededRandom(i + 6) * -40,
    drift: (seededRandom(i + 7) - 0.5) * 140,
    spin: (seededRandom(i + 8) - 0.5) * 50,
    opacity: 0.2 + seededRandom(i + 9) * 0.5,
    color: COLORS[Math.floor(seededRandom(i + 10) * COLORS.length)]!,
  }))
}

function buildStaticStars(count: number): StaticStar[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: seededRandom(i + 50) * 100,
    top: seededRandom(i + 51) * 100,
    size: 2 + seededRandom(i + 52) * 5,
    delay: seededRandom(i + 53) * -8,
    duration: 2 + seededRandom(i + 54) * 4,
    opacity: 0.15 + seededRandom(i + 55) * 0.45,
  }))
}

function Heart({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function Flower({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="4" fill="#f9d56e" />
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="16"
          cy="8"
          rx="5"
          ry="8"
          fill={color}
          transform={`rotate(${angle} 16 16)`}
        />
      ))}
    </svg>
  )
}

function Petal({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 24" aria-hidden="true">
      <ellipse cx="8" cy="12" rx="6" ry="10" fill={color} opacity="0.85" />
    </svg>
  )
}

function Star({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2l2.09 6.26L20.18 9.8l-5.09 3.7L16.82 20 12 16.77 7.18 20l1.73-6.5-5.09-3.7 6.09-1.54L12 2z" />
    </svg>
  )
}

function Sparkle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.5" fill={color} />
    </svg>
  )
}

const ICONS: Record<FloatKind, (props: { color: string }) => ReactElement> = {
  heart: Heart,
  flower: Flower,
  petal: Petal,
  star: Star,
  sparkle: Sparkle,
}

export default function FloatingBackground() {
  const items = useMemo(() => buildItems(72), [])
  const staticStars = useMemo(() => buildStaticStars(55), [])

  return (
    <div className="floating-bg" aria-hidden="true">
      <div className="floating-bg__glow floating-bg__glow--left" />
      <div className="floating-bg__glow floating-bg__glow--right" />
      <div className="floating-bg__glow floating-bg__glow--center" />

      <div className="floating-bg__stars">
        {staticStars.map((star) => (
          <span
            key={star.id}
            className="floating-bg__star"
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

      {items.map((item) => {
        const Icon = ICONS[item.kind]
        return (
          <div
            key={item.id}
            className={`float-item float-item--${item.kind}`}
            style={
              {
                '--left': `${item.left}%`,
                '--top': `${item.top}%`,
                '--size': `${item.size}px`,
                '--duration': `${item.duration}s`,
                '--delay': `${item.delay}s`,
                '--drift': `${item.drift}px`,
                '--spin': `${item.spin}deg`,
                '--opacity': item.opacity,
              } as CSSProperties
            }
          >
            <Icon color={item.color} />
          </div>
        )
      })}
    </div>
  )
}

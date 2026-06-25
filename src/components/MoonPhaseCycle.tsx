import { useId } from 'react'
import './MoonPhaseCycle.css'

const VIEW = 128
const MOON_C = VIEW / 2
const MOON_R = 58
const SKY_FADE = '#eef6ff'

export default function MoonPhaseCycle() {
  const uid = useId().replace(/:/g, '')
  const clipId = `moon-clip-${uid}`
  const edgeId = `moon-edge-${uid}`
  const fadeId = `moon-fade-${uid}`
  const sheenId = `moon-sheen-${uid}`

  const imageProps = {
    href: '/moon-texture.jpg',
    x: MOON_C - MOON_R,
    y: MOON_C - MOON_R,
    width: MOON_R * 2,
    height: MOON_R * 2,
    preserveAspectRatio: 'xMidYMid slice' as const,
  }

  return (
    <div className="moon-phase-cycle" aria-hidden="true">
      <div className="moon-phase-cycle__glow" />
      <div className="moon-phase-cycle__halo" />
      <div className="moon-phase-cycle__track">
        <svg className="moon-phase-cycle__moon" viewBox={`0 0 ${VIEW} ${VIEW}`}>
          <defs>
            <clipPath id={clipId}>
              <circle cx={MOON_C} cy={MOON_C} r={MOON_R} />
            </clipPath>

            <radialGradient id={fadeId} cx="50%" cy="50%" r="50%">
              <stop offset="62%" stopColor="white" stopOpacity="1" />
              <stop offset="88%" stopColor="white" stopOpacity="0.35" />
              <stop offset="100%" stopColor={SKY_FADE} stopOpacity="0" />
            </radialGradient>

            <mask id={edgeId}>
              <circle
                cx={MOON_C}
                cy={MOON_C}
                r={MOON_R}
                fill={`url(#${fadeId})`}
                filter={`url(#${uid}-soft-edge)`}
              />
            </mask>

            <filter id={`${uid}-soft-edge`} x="-8%" y="-8%" width="116%" height="116%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>

            <filter id={`${uid}-moon-glow`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.45 0"
              />
            </filter>

            <radialGradient id={sheenId} cx="40%" cy="34%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>

            <filter id={`${uid}-moon-filter`} x="-4%" y="-4%" width="108%" height="108%">
              <feColorMatrix
                type="matrix"
                values="1.02 0 0 0 0.04  0 1.02 0 0 0.03  0 0 1.04 0 0.05  0 0 0 0.92 0"
              />
            </filter>
          </defs>

          <circle
            cx={MOON_C}
            cy={MOON_C}
            r={MOON_R}
            fill="white"
            opacity="0.55"
            filter={`url(#${uid}-moon-glow)`}
          />

          <g clipPath={`url(#${clipId})`} mask={`url(#${edgeId})`} filter={`url(#${uid}-moon-filter)`}>
            <image {...imageProps} />
            <circle cx={MOON_C} cy={MOON_C} r={MOON_R} fill={`url(#${sheenId})`} />
          </g>
        </svg>
      </div>
    </div>
  )
}

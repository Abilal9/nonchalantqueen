import './MoonCats.css'

const SPOTS = [
  { cx: 92, cy: 118, rx: 9, ry: 5.5, opacity: 0.38 },
  { cx: 118, cy: 152, rx: 8, ry: 5, opacity: 0.34 },
  { cx: 76, cy: 168, rx: 7, ry: 4.5, opacity: 0.36 },
  { cx: 108, cy: 196, rx: 9, ry: 5.5, opacity: 0.32 },
  { cx: 134, cy: 128, rx: 6, ry: 4, opacity: 0.35 },
]

const FOREHEAD_SPOT = { cx: 104, cy: 46, rx: 5.5, ry: 4, opacity: 0.5 }

export default function MoonCats() {
  return (
    <div className="moon-cats" aria-hidden="true">
      <svg className="moon-cats__svg" viewBox="0 0 400 290" preserveAspectRatio="xMaxYMax meet" fill="none">
        <defs>
          <filter id="cat-mask-invert" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
            />
          </filter>
          <mask id="cat-silhouette-mask" maskUnits="userSpaceOnUse">
            <image
              href="/cats/cat-silhouette.png"
              x="0"
              y="0"
              width="200"
              height="290"
              preserveAspectRatio="xMidYMid meet"
              filter="url(#cat-mask-invert)"
            />
          </mask>
        </defs>

        <g transform="translate(202 0) scale(-1 1)">
          <g className="moon-cats__orange">
            <rect width="200" height="290" fill="#e07a3a" mask="url(#cat-silhouette-mask)" />
          </g>
        </g>

        <g transform="translate(190 0)">
          <g className="moon-cats__black">
            <rect width="200" height="290" fill="#14141c" mask="url(#cat-silhouette-mask)" />
            <g mask="url(#cat-silhouette-mask)">
              <ellipse
                cx={FOREHEAD_SPOT.cx}
                cy={FOREHEAD_SPOT.cy}
                rx={FOREHEAD_SPOT.rx}
                ry={FOREHEAD_SPOT.ry}
                fill="#d4782a"
                opacity={FOREHEAD_SPOT.opacity}
              />
              {SPOTS.map((spot, i) => (
                <ellipse
                  key={i}
                  cx={spot.cx}
                  cy={spot.cy}
                  rx={spot.rx}
                  ry={spot.ry}
                  fill={i % 2 === 0 ? '#c9854a' : '#b87340'}
                  opacity={spot.opacity}
                />
              ))}
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}

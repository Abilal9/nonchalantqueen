import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  MEMORY_BG_COUNT,
  memoryBgLayout,
  memoryImages,
  memoryTilt,
  isNewMemory,
  shuffleMemories,
} from '../data/memories'
import './MemoriesPanel.css'

type MemoriesPanelProps = {
  onClose: () => void
}

type BgPolaroidStyle = CSSProperties & {
  '--bg-x': string
  '--bg-y': string
  '--bg-rotate': string
  '--bg-flip': string
  '--bg-opacity': string
  '--bg-scale': string
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function bgPolaroidMotion(index: number, scrollProgress: number, layout: ReturnType<typeof memoryBgLayout>) {
  const travel = scrollProgress * (MEMORY_BG_COUNT + 5)
  const t = travel - index - layout.delay

  if (t <= 0) {
    const enter = clamp(1 + t * 2.2, 0, 1)
    const eased = easeOutCubic(enter)
    return {
      x: 108 - eased * (108 - layout.left),
      y: layout.top + (1 - eased) * 36,
      rotate: layout.tilt + (1 - eased) * 18,
      flip: (1 - eased) * 68,
      opacity: eased * 0.34,
      scale: layout.scale * (0.82 + eased * 0.18),
    }
  }

  if (t >= 1) {
    const exit = clamp(t - 1, 0, 1)
    const eased = easeOutCubic(exit)
    return {
      x: layout.left + layout.driftX * eased,
      y: layout.top - layout.driftY * eased,
      rotate: layout.tilt + layout.driftX * 0.08 * eased,
      flip: eased * 118,
      opacity: 0.34 * (1 - eased),
      scale: layout.scale * (1 - eased * 0.12),
    }
  }

  const settle = Math.sin(t * Math.PI) * 2.5
  return {
    x: layout.left + settle,
    y: layout.top + settle * 0.35,
    rotate: layout.tilt + settle * 0.4,
    flip: 0,
    opacity: 0.22 + Math.sin(t * Math.PI) * 0.12,
    scale: layout.scale,
  }
}

export default function MemoriesPanel({ onClose }: MemoriesPanelProps) {
  const [images, setImages] = useState<string[]>([])
  const [expanded, setExpanded] = useState<{ src: string; index: number } | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    setImages(shuffleMemories(memoryImages))
  }, [])

  const bgImages = useMemo(() => {
    const shuffled = shuffleMemories(memoryImages)
    return shuffled.slice(0, MEMORY_BG_COUNT)
  }, [])

  const bgLayouts = useMemo(
    () => Array.from({ length: MEMORY_BG_COUNT }, (_, i) => memoryBgLayout(i)),
    [],
  )

  const updateScrollProgress = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = el.scrollHeight - el.clientHeight
    const progress = maxScroll <= 0 ? 0 : el.scrollTop / maxScroll
    setScrollProgress(progress)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onScroll = () => {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        updateScrollProgress()
      })
    }

    updateScrollProgress()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateScrollProgress)

    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateScrollProgress)
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [images.length, updateScrollProgress])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expanded) setExpanded(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [expanded, onClose])

  return (
    <>
      <div className="panel-overlay" onClick={onClose}>
        <div
          className="panel panel--memories"
          role="dialog"
          aria-labelledby="memories-panel-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="memories-bg" aria-hidden="true">
            {bgImages.map((src, index) => {
              const layout = bgLayouts[index]!
              const motion = bgPolaroidMotion(index, scrollProgress, layout)
              const style: BgPolaroidStyle = {
                '--bg-x': `${motion.x}%`,
                '--bg-y': `${motion.y}%`,
                '--bg-rotate': `${motion.rotate}deg`,
                '--bg-flip': `${motion.flip}deg`,
                '--bg-opacity': `${motion.opacity}`,
                '--bg-scale': `${motion.scale}`,
                zIndex: Math.round(layout.scale * 10),
              }

              return (
                <div key={`bg-${src}-${index}`} className="memories-bg__polaroid" style={style}>
                  <img src={src} alt="" loading="lazy" draggable={false} />
                </div>
              )
            })}
          </div>

          <div ref={scrollRef} className="memories-panel__scroll">
            <button type="button" className="panel__close" onClick={onClose} aria-label="Close">
              ✕
            </button>
            <h2 id="memories-panel-title" className="panel__title">
              Memories
            </h2>
            <p className="panel__subtitle">Little moments, shuffled just for you.</p>

            <ul className="memories-grid">
              {images.map((src, index) => (
                <li key={src}>
                  <button
                    type="button"
                    className="memory-card"
                    style={{
                      animationDelay: `${index * 0.04}s`,
                      '--tilt': `${memoryTilt(index)}deg`,
                    } as CSSProperties}
                    onClick={() => setExpanded({ src, index })}
                  >
                    {isNewMemory(src) && <span className="new-tag">new</span>}
                    <img src={src} alt="" loading="lazy" draggable={false} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="memory-lightbox" onClick={() => setExpanded(null)} role="presentation">
          <figure
            className="memory-lightbox__polaroid"
            style={{ '--tilt': `${memoryTilt(expanded.index)}deg` } as CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={expanded.src} alt="" className="memory-lightbox__photo" draggable={false} />
            <figcaption className="memory-lightbox__caption" aria-hidden="true">
              ♡
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}

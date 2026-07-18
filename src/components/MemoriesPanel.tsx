import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
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

const LIGHTBOX_STACK = [
  { x: -42, y: 28, rot: -14, scale: 0.94 },
  { x: 48, y: -22, rot: 11, scale: 0.92 },
  { x: -18, y: -36, rot: 16, scale: 0.9 },
  { x: 36, y: 34, rot: -9, scale: 0.93 },
  { x: -56, y: -8, rot: -18, scale: 0.88 },
  { x: 22, y: 48, rot: 7, scale: 0.91 },
  { x: 58, y: 12, rot: 19, scale: 0.87 },
  { x: -30, y: 52, rot: -6, scale: 0.89 },
] as const

const SWIPE_EXIT_MS = 460
const SWIPE_ENTER_MS = 460
const SWIPE_DISTANCE = 380

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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [openedFresh, setOpenedFresh] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const pointerRef = useRef<{ id: number; startX: number; startY: number; locked: boolean | null } | null>(
    null,
  )
  const dragXRef = useRef(0)
  const animatingRef = useRef(false)
  const preloadRef = useRef<Set<string>>(new Set())

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

  const expanded =
    expandedIndex !== null && images[expandedIndex]
      ? { src: images[expandedIndex], index: expandedIndex }
      : null

  const setDrag = useCallback((x: number) => {
    dragXRef.current = x
    setDragX(x)
  }, [])

  const preload = useCallback(
    (index: number) => {
      if (images.length === 0) return
      const wrapped = ((index % images.length) + images.length) % images.length
      const src = images[wrapped]
      if (!src || preloadRef.current.has(src)) return
      preloadRef.current.add(src)
      const img = new Image()
      img.src = src
    },
    [images],
  )

  useEffect(() => {
    if (expandedIndex === null) return
    preload(expandedIndex + 1)
    preload(expandedIndex - 1)
  }, [expandedIndex, preload])

  const navigate = useCallback(
    (nextIndex: number, dir: 'left' | 'right') => {
      if (animatingRef.current || images.length === 0) return
      animatingRef.current = true
      setOpenedFresh(false)
      setDragging(false)
      pointerRef.current = null

      const wrapped = ((nextIndex % images.length) + images.length) % images.length
      preload(wrapped)
      preload(wrapped + 1)
      preload(wrapped - 1)

      const current = dragXRef.current
      const exitX =
        dir === 'left'
          ? Math.min(current, 0) - SWIPE_DISTANCE
          : Math.max(current, 0) + SWIPE_DISTANCE
      const enterX = dir === 'left' ? SWIPE_DISTANCE * 0.85 : -SWIPE_DISTANCE * 0.85

      setTransitioning(true)
      setDrag(exitX)

      window.setTimeout(() => {
        setTransitioning(false)
        setExpandedIndex(wrapped)
        setDrag(enterX)

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitioning(true)
            setDrag(0)
            window.setTimeout(() => {
              setTransitioning(false)
              animatingRef.current = false
            }, SWIPE_ENTER_MS)
          })
        })
      }, SWIPE_EXIT_MS)
    },
    [images.length, preload, setDrag],
  )

  const goNext = useCallback(() => {
    if (expandedIndex === null) return
    navigate(expandedIndex + 1, 'left')
  }, [expandedIndex, navigate])

  const goPrev = useCallback(() => {
    if (expandedIndex === null) return
    navigate(expandedIndex - 1, 'right')
  }, [expandedIndex, navigate])

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
        if (expandedIndex !== null) {
          setExpandedIndex(null)
          setDrag(0)
          setOpenedFresh(false)
          animatingRef.current = false
        } else onClose()
        return
      }
      if (expandedIndex === null || animatingRef.current) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [expandedIndex, onClose, goNext, goPrev, setDrag])

  const finishDrag = useCallback(() => {
    if (animatingRef.current) return
    const dx = dragXRef.current
    const threshold = Math.min(72, window.innerWidth * 0.14)
    setDragging(false)
    pointerRef.current = null

    if (dx <= -threshold) {
      navigate((expandedIndex ?? 0) + 1, 'left')
      return
    }
    if (dx >= threshold) {
      navigate((expandedIndex ?? 0) - 1, 'right')
      return
    }
    setTransitioning(true)
    setDrag(0)
    window.setTimeout(() => setTransitioning(false), SWIPE_ENTER_MS)
  }, [expandedIndex, navigate, setDrag])

  const onPolaroidPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || animatingRef.current) return
    pointerRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      locked: null,
    }
    setTransitioning(false)
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPolaroidPointerMove = (e: PointerEvent<HTMLElement>) => {
    const ptr = pointerRef.current
    if (!ptr || ptr.id !== e.pointerId || animatingRef.current) return

    const dx = e.clientX - ptr.startX
    const dy = e.clientY - ptr.startY

    if (ptr.locked === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      ptr.locked = Math.abs(dx) >= Math.abs(dy)
      if (!ptr.locked) {
        finishDrag()
        return
      }
    }

    if (!ptr.locked) return
    e.preventDefault()
    setDrag(clamp(dx, -200, 200))
  }

  const onPolaroidPointerUp = (e: PointerEvent<HTMLElement>) => {
    const ptr = pointerRef.current
    if (!ptr || ptr.id !== e.pointerId) return
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    finishDrag()
  }

  const onPolaroidPointerCancel = (e: PointerEvent<HTMLElement>) => {
    const ptr = pointerRef.current
    if (!ptr || ptr.id !== e.pointerId) return
    setDragging(false)
    pointerRef.current = null
    setTransitioning(true)
    setDrag(0)
    window.setTimeout(() => setTransitioning(false), SWIPE_ENTER_MS)
  }

  const closeLightbox = () => {
    setExpandedIndex(null)
    setDrag(0)
    setOpenedFresh(false)
    setTransitioning(false)
    animatingRef.current = false
  }

  const stackCards = useMemo(() => {
    if (expandedIndex === null || images.length < 2) return []
    return LIGHTBOX_STACK.map((slot, i) => {
      const index = (expandedIndex + i + 1) % images.length
      return {
        ...slot,
        src: images[index]!,
        index,
        key: `stack-${i}`,
      }
    })
  }, [expandedIndex, images])

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
                    onClick={() => {
                      setDrag(0)
                      setTransitioning(false)
                      setOpenedFresh(true)
                      animatingRef.current = false
                      setExpandedIndex(index)
                    }}
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
        <div
          className="memory-lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Memory photo"
        >
          <button
            type="button"
            className="memory-lightbox__nav memory-lightbox__nav--prev"
            aria-label="Previous memory"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
          >
            ‹
          </button>

          <div
            className="memory-lightbox__stage"
            style={
              {
                '--stack-shift': `${-dragX * 0.06}px`,
                '--stack-reveal': String(Math.min(1, Math.abs(dragX) / 160)),
              } as CSSProperties
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="memory-lightbox__stack" aria-hidden="true">
              {stackCards.map((card, i) => (
                <figure
                  key={card.key}
                  className="memory-lightbox__stack-card"
                  style={
                    {
                      '--sx': `${card.x}px`,
                      '--sy': `${card.y}px`,
                      '--srot': `${card.rot}deg`,
                      '--sscale': String(card.scale),
                      zIndex: LIGHTBOX_STACK.length - i,
                    } as CSSProperties
                  }
                >
                  <img src={card.src} alt="" draggable={false} />
                  <figcaption>♡</figcaption>
                </figure>
              ))}
            </div>

            <figure
              className={[
                'memory-lightbox__polaroid',
                dragging ? 'memory-lightbox__polaroid--dragging' : '',
                transitioning ? 'memory-lightbox__polaroid--transition' : '',
                openedFresh ? 'memory-lightbox__polaroid--fresh' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                {
                  '--tilt': `${memoryTilt(expanded.index)}deg`,
                  '--drag-x': `${dragX}px`,
                  '--drag-rot': `${dragX * 0.03}deg`,
                  '--drag-opacity': String(1 - Math.min(0.22, Math.abs(dragX) / 420)),
                } as CSSProperties
              }
              onPointerDown={onPolaroidPointerDown}
              onPointerMove={onPolaroidPointerMove}
              onPointerUp={onPolaroidPointerUp}
              onPointerCancel={onPolaroidPointerCancel}
              onAnimationEnd={() => setOpenedFresh(false)}
            >
              <img src={expanded.src} alt="" className="memory-lightbox__photo" draggable={false} />
              <figcaption className="memory-lightbox__caption" aria-hidden="true">
                ♡
              </figcaption>
            </figure>
          </div>

          <button
            type="button"
            className="memory-lightbox__nav memory-lightbox__nav--next"
            aria-label="Next memory"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
          >
            ›
          </button>

          <p className="memory-lightbox__hint" aria-hidden="true">
            swipe for more
          </p>
        </div>
      )}
    </>
  )
}

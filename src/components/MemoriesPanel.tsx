import { useEffect, useState, type CSSProperties } from 'react'
import { memoryImages, memoryTilt, shuffleMemories } from '../data/memories'
import './MemoriesPanel.css'

type MemoriesPanelProps = {
  onClose: () => void
}

export default function MemoriesPanel({ onClose }: MemoriesPanelProps) {
  const [images, setImages] = useState<string[]>([])
  const [expanded, setExpanded] = useState<{ src: string; index: number } | null>(null)

  useEffect(() => {
    setImages(shuffleMemories(memoryImages))
  }, [])

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
                  <img src={src} alt="" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {expanded && (
        <div className="memory-lightbox" onClick={() => setExpanded(null)} role="presentation">
          <figure
            className="memory-lightbox__polaroid"
            style={{ '--tilt': `${memoryTilt(expanded.index)}deg` } as CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={expanded.src} alt="" className="memory-lightbox__photo" />
            <figcaption className="memory-lightbox__caption" aria-hidden="true">
              ♡
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}

import { useEffect, useState } from 'react'
import type { Letter } from '../data/letters'
import './LetterViewer.css'

type LetterViewerProps = {
  letter: Letter
  onClose: () => void
}

type OpenPhase = 'closed' | 'flap' | 'slide' | 'expand' | 'full'

export default function LetterViewer({ letter, onClose }: LetterViewerProps) {
  const [phase, setPhase] = useState<OpenPhase>('closed')

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('flap'), 300),
      setTimeout(() => setPhase('slide'), 850),
      setTimeout(() => setPhase('expand'), 1400),
      setTimeout(() => setPhase('full'), 2600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [letter.id])

  return (
    <div className="letter-viewer" onClick={onClose} role="presentation">
      <div className="letter-viewer__overlay" aria-hidden="true" />

      <div
        className={`letter-viewer__cluster letter-viewer__cluster--${phase}`}
        role="dialog"
        aria-labelledby="letter-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="letter-viewer__envelope" aria-hidden={phase === 'expand' || phase === 'full'}>
          <div className="letter-viewer__envelope-back" />
          <div className={`letter-viewer__flap letter-viewer__flap--${phase}`} />
          <div className={`letter-viewer__envelope-front letter-viewer__envelope-front--${phase}`} />
        </div>

        <article className={`letter-viewer__sheet letter-viewer__sheet--${phase}`}>
          <div className="letter-viewer__sheet-inner">
            <header className="letter-viewer__header">
              <p className="letter-viewer__date">{letter.date}</p>
              <h2 id="letter-title" className="letter-viewer__title">
                {letter.title}
              </h2>
            </header>
            <div className="letter-viewer__body">
              {letter.content.split('\n\n').map((paragraph, i) => (
                <p key={`${letter.id}-${i}`}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

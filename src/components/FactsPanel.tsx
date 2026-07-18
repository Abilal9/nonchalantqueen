import { useEffect } from 'react'
import { facts } from '../data/facts'
import './FactsPanel.css'

type FactsPanelProps = {
  onClose: () => void
}

export default function FactsPanel({ onClose }: FactsPanelProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div
        className="panel panel--facts"
        role="dialog"
        aria-labelledby="facts-panel-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="panel__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 id="facts-panel-title" className="panel__title">
          Facts about you
        </h2>
        <p className="panel__subtitle">Data for the next Nisreen Trivia game.</p>

        <ol className="facts-list">
          {facts.map((fact, index) => (
            <li
              key={fact.id}
              className="facts-list__item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="facts-list__num" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="facts-list__body">
                <h3 className="facts-list__title">{fact.title}</h3>
                <p className="facts-list__detail">{fact.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

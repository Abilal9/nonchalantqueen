import { useEffect } from 'react'
import { playlists } from '../data/music'
import './MusicPanel.css'

type MusicPanelProps = {
  onClose: () => void
}

export default function MusicPanel({ onClose }: MusicPanelProps) {
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
        className="panel panel--music"
        role="dialog"
        aria-labelledby="music-panel-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="panel__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 id="music-panel-title" className="panel__title">
          Our music
        </h2>
        <p className="panel__subtitle">Songs that remind me of you.</p>

        <ul className="playlist-grid">
          {playlists.map((playlist, index) => (
            <li key={playlist.id} style={{ animationDelay: `${index * 0.08}s` }}>
              <a
                className="playlist-card"
                href={playlist.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="playlist-card__cover">
                  <img src={playlist.cover} alt="" draggable={false} />
                </span>
                <span className="playlist-card__title">{playlist.title}</span>
                <span className="playlist-card__subtitle">{playlist.subtitle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

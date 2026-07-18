import { useEffect, useState, type ReactElement } from 'react'
import type { Letter } from '../data/letters'
import { letters } from '../data/letters'
import LetterViewer from './LetterViewer'
import MemoriesPanel from './MemoriesPanel'
import PopQuizPanel from './PopQuizPanel'
import FactsPanel from './FactsPanel'
import MusicPanel from './MusicPanel'
import './BottomSections.css'

type SectionId = 'letters' | 'memories' | 'pop-quiz' | 'facts' | 'music'

type Section = {
  id: SectionId
  label: string
  description: string
  isNew?: boolean
}

const sections: Section[] = [
  {
    id: 'letters',
    label: 'Letters',
    description: 'Notes written just for you',
  },
  {
    id: 'memories',
    label: 'Memories',
    description: 'Little moments to revisit',
  },
  {
    id: 'pop-quiz',
    label: 'Pop Quiz',
    description: 'A fun straightforward quiz',
  },
  {
    id: 'facts',
    label: 'Facts about you',
    description: 'Data for the next trivia game',
    isNew: true,
  },
  {
    id: 'music',
    label: 'Our music',
    description: 'Songs that feel like us',
    isNew: true,
  },
]

function EnvelopeStackIcon() {
  return (
    <svg className="section-card__icon" viewBox="0 0 80 64" aria-hidden="true">
      <rect x="8" y="28" width="52" height="32" rx="3" fill="#1e3558" stroke="#7eb8e8" strokeWidth="1.5" />
      <path d="M8 28 L34 46 L60 28" fill="none" stroke="#7eb8e8" strokeWidth="1.5" />
      <rect x="18" y="16" width="52" height="32" rx="3" fill="#264770" stroke="#a8d4f5" strokeWidth="1.5" />
      <path d="M18 16 L44 34 L70 16" fill="none" stroke="#a8d4f5" strokeWidth="1.5" />
      <rect x="28" y="4" width="52" height="32" rx="3" fill="#2f5585" stroke="#c9b896" strokeWidth="1.5" />
      <path d="M28 4 L54 22 L80 4" fill="#3a6290" stroke="#c9b896" strokeWidth="1.5" />
      <circle cx="54" cy="18" r="4" fill="#c9b896" opacity="0.45" />
    </svg>
  )
}

function MemoriesIcon() {
  return (
    <svg className="section-card__icon" viewBox="0 0 80 64" aria-hidden="true">
      <rect x="10" y="12" width="60" height="44" rx="4" fill="#264770" stroke="#a8d4f5" strokeWidth="1.5" />
      <circle cx="28" cy="30" r="8" fill="#7eb8e8" opacity="0.55" />
      <path d="M10 48 L32 32 L48 42 L70 24 L70 56 L10 56 Z" fill="#3a6290" opacity="0.75" />
    </svg>
  )
}

function PopQuizIcon() {
  return (
    <svg className="section-card__icon" viewBox="0 0 80 64" aria-hidden="true">
      <rect x="14" y="10" width="52" height="44" rx="4" fill="#2f5585" stroke="#7eb8e8" strokeWidth="1.5" />
      <text x="40" y="30" textAnchor="middle" fontSize="14" fill="#c9b896" fontFamily="Georgia, serif">
        ?
      </text>
      <rect x="22" y="38" width="36" height="6" rx="2" fill="#4a7fad" />
      <rect x="22" y="48" width="28" height="6" rx="2" fill="#3a6290" />
    </svg>
  )
}

function FactsIcon() {
  return (
    <svg className="section-card__icon" viewBox="0 0 80 64" aria-hidden="true">
      <rect x="18" y="8" width="44" height="48" rx="4" fill="#264770" stroke="#a8d4f5" strokeWidth="1.5" />
      <path d="M28 20 H52" stroke="#c9b896" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 30 H48" stroke="#7eb8e8" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d="M28 40 H50" stroke="#7eb8e8" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      <circle cx="54" cy="48" r="7" fill="#2f5585" stroke="#c9b896" strokeWidth="1.5" />
      <path d="M54 45 V49 M54 51.5 V52" stroke="#c9b896" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function MusicIcon() {
  return (
    <svg className="section-card__icon" viewBox="0 0 80 64" aria-hidden="true">
      <defs>
        <radialGradient id="music-vinyl" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3a6290" />
          <stop offset="42%" stopColor="#1e3558" />
          <stop offset="100%" stopColor="#141c2e" />
        </radialGradient>
      </defs>
      <circle cx="34" cy="36" r="22" fill="url(#music-vinyl)" stroke="#7eb8e8" strokeWidth="1.5" />
      <circle cx="34" cy="36" r="16" fill="none" stroke="#2f5585" strokeWidth="1" opacity="0.9" />
      <circle cx="34" cy="36" r="11" fill="none" stroke="#4a7fad" strokeWidth="0.8" opacity="0.55" />
      <circle cx="34" cy="36" r="6.5" fill="#2f5585" stroke="#c9b896" strokeWidth="1.4" />
      <circle cx="34" cy="36" r="2.2" fill="#c9b896" opacity="0.85" />
      <path
        d="M52 14 V40"
        fill="none"
        stroke="#a8d4f5"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M52 14 C58 12.5, 64 13, 66 16 V30"
        fill="none"
        stroke="#a8d4f5"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="61.5" cy="31.5" rx="6.2" ry="4.6" fill="#2f5585" stroke="#c9b896" strokeWidth="1.4" />
      <ellipse cx="48.5" cy="41.5" rx="6.2" ry="4.6" fill="#264770" stroke="#7eb8e8" strokeWidth="1.4" />
    </svg>
  )
}

const icons: Record<SectionId, () => ReactElement> = {
  letters: EnvelopeStackIcon,
  memories: MemoriesIcon,
  'pop-quiz': PopQuizIcon,
  facts: FactsIcon,
  music: MusicIcon,
}

type BottomSectionsProps = {
  onSectionChange?: (open: boolean) => void
}

export default function BottomSections({ onSectionChange }: BottomSectionsProps) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)

  const openSection = (id: SectionId) => {
    setActiveSection(id)
    onSectionChange?.(true)
  }

  const closeSection = () => {
    setActiveSection(null)
    setSelectedLetter(null)
    onSectionChange?.(false)
  }

  const closeLetter = () => setSelectedLetter(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (selectedLetter) setSelectedLetter(null)
      else if (activeSection) {
        setActiveSection(null)
        onSectionChange?.(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeSection, selectedLetter, onSectionChange])

  return (
    <>
      <nav className="bottom-sections" aria-label="Explore">
        {sections.map((section) => {
          const Icon = icons[section.id]
          return (
            <button
              key={section.id}
              type="button"
              className="section-card"
              onClick={() => openSection(section.id)}
            >
              {section.isNew && <span className="new-tag section-card__new">new</span>}
              <Icon />
              <span className="section-card__label">{section.label}</span>
              <span className="section-card__desc">{section.description}</span>
            </button>
          )
        })}
      </nav>

      {activeSection === 'letters' && !selectedLetter && (
        <div className="panel-overlay" onClick={closeSection}>
          <div
            className="panel panel--letters"
            role="dialog"
            aria-labelledby="letters-panel-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="panel__close" onClick={closeSection} aria-label="Close">
              ✕
            </button>
            <h2 id="letters-panel-title" className="panel__title">
              Letters for Niso
            </h2>
            <p className="panel__subtitle">Open one whenever you want to revisit it.</p>

            <ul className="letter-list">
              {letters.map((letter, index) => (
                <li key={letter.id}>
                  <button
                    type="button"
                    className="letter-list__item"
                    style={{ animationDelay: `${index * 0.08}s` }}
                    onClick={() => setSelectedLetter(letter)}
                  >
                    <span className="letter-list__envelope" aria-hidden="true">
                      <span className="letter-list__flap" />
                      <span className="letter-list__body" />
                    </span>
                    <span className="letter-list__text">
                      <span className="letter-list__title-row">
                        <span className="letter-list__title">{letter.title}</span>
                        {letter.isNew && <span className="new-tag">new</span>}
                      </span>
                      <span className="letter-list__preview">{letter.preview}</span>
                      <span className="letter-list__date">{letter.date}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeSection === 'memories' && <MemoriesPanel onClose={closeSection} />}

      {activeSection === 'pop-quiz' && <PopQuizPanel onClose={closeSection} />}

      {activeSection === 'facts' && <FactsPanel onClose={closeSection} />}

      {activeSection === 'music' && <MusicPanel onClose={closeSection} />}

      {selectedLetter && <LetterViewer letter={selectedLetter} onClose={closeLetter} />}
    </>
  )
}

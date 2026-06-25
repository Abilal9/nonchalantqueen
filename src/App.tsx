import { useEffect, useState } from 'react'
import FloatingBackground from './components/FloatingBackground'
import CuteCursor from './components/CuteCursor'
import MoonPhaseCycle from './components/MoonPhaseCycle'
import BottomSections from './components/BottomSections'
import PasswordGate, { PASSWORD_UNLOCK_MS } from './components/PasswordGate'
import { applySiteMeta } from './siteMeta'
import './App.css'

type SitePhase = 'locked' | 'unlocking' | 'unlocked'

function App() {
  const [phase, setPhase] = useState<SitePhase>('locked')

  useEffect(() => {
    applySiteMeta(phase === 'unlocked')
  }, [phase])

  const handleCorrect = () => {
    setPhase('unlocking')
    window.setTimeout(() => {
      setPhase('unlocked')
    }, PASSWORD_UNLOCK_MS)
  }

  return (
    <>
      <div
        className={`site-veil${phase === 'unlocking' ? ' site-veil--out' : ''}${phase === 'unlocked' ? ' site-veil--gone' : ''}`}
        aria-hidden="true"
      />

      {phase !== 'unlocked' && (
        <PasswordGate unlocking={phase === 'unlocking'} onCorrect={handleCorrect} />
      )}

      <div
        className={`app-site${phase === 'locked' ? ' app-site--hidden' : ''}${phase === 'unlocking' ? ' app-site--revealing' : ''}`}
      >
        {phase === 'unlocked' && <CuteCursor />}
        <MoonPhaseCycle />
        <FloatingBackground />

        <main className="page">
          <div className="page__content">
            <div className="hero-card">
              <div className="hero-card__sparkles" aria-hidden="true">
                <span>✦</span>
                <span>♡</span>
                <span>✿</span>
              </div>

              <p className="eyebrow">dear Niso Mango</p>
              <h1 className="title">
                <span className="title-line title-line--prefix">my</span>
                <span className="title-line">nonchalant</span>
                <span className="title-line title-line--accent">queen</span>
              </h1>
              <p className="subtitle">
                A little corner of the internet, made just for you.
              </p>

              <div className="heart-row" aria-hidden="true">
                <span className="heart-beat">♥</span>
                <span className="heart-beat heart-beat--delay">♥</span>
                <span className="heart-beat heart-beat--delay-2">♥</span>
              </div>
            </div>

            <BottomSections />
          </div>
        </main>
      </div>
    </>
  )
}

export default App

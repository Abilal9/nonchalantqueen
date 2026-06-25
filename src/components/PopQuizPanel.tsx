import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildQuizRound,
  QUIZ_ROUND_SIZE,
  shuffleOptions,
  type QuizQuestion,
} from '../data/quiz'
import './PopQuizPanel.css'

type PopQuizPanelProps = {
  onClose: () => void
}

const ADVANCE_MS = 2400

const FALSE_ANCHOR_X = 0.5
const FALSE_ANCHOR_Y = 0.72
const VIEWPORT_PAD = 12
const BOUNCE_MIN_SPEED = 22

function clampFalseWithBounce(
  offset: { x: number; y: number },
  velocity: { vx: number; vy: number },
  zoneRect: DOMRect,
  halfW: number,
  halfH: number,
) {
  const baseX = zoneRect.left + zoneRect.width * FALSE_ANCHOR_X
  const baseY = zoneRect.top + zoneRect.height * FALSE_ANCHOR_Y

  const minCx = VIEWPORT_PAD + halfW
  const maxCx = window.innerWidth - VIEWPORT_PAD - halfW
  const minCy = VIEWPORT_PAD + halfH
  const maxCy = window.innerHeight - VIEWPORT_PAD - halfH

  let { x, y } = offset
  let { vx, vy } = velocity

  let cx = baseX + x
  let cy = baseY + y

  if (cx < minCx) {
    x = minCx - baseX
    vx = Math.max(Math.abs(vx), BOUNCE_MIN_SPEED)
  } else if (cx > maxCx) {
    x = maxCx - baseX
    vx = -Math.max(Math.abs(vx), BOUNCE_MIN_SPEED)
  }

  if (cy < minCy) {
    y = minCy - baseY
    vy = Math.max(Math.abs(vy), BOUNCE_MIN_SPEED)
  } else if (cy > maxCy) {
    y = maxCy - baseY
    vy = -Math.max(Math.abs(vy), BOUNCE_MIN_SPEED)
  }

  return { offset: { x, y }, velocity: { vx, vy } }
}

function rectsOverlap(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
  pad = 10,
) {
  return !(
    a.right + pad < b.left ||
    a.left - pad > b.right ||
    a.bottom + pad < b.top ||
    a.top - pad > b.bottom
  )
}

function falseRectFromOffset(
  offset: { x: number; y: number },
  zoneRect: DOMRect,
  halfW: number,
  halfH: number,
) {
  const cx = zoneRect.left + zoneRect.width * FALSE_ANCHOR_X + offset.x
  const cy = zoneRect.top + zoneRect.height * FALSE_ANCHOR_Y + offset.y
  return {
    left: cx - halfW,
    right: cx + halfW,
    top: cy - halfH,
    bottom: cy + halfH,
    cx,
    cy,
  }
}

function teleportFalseForMobile(
  prev: { x: number; y: number },
  touchX: number,
  touchY: number,
  zoneRect: DOMRect,
  trueRect: DOMRect,
  halfW: number,
  halfH: number,
) {
  const current = falseRectFromOffset(prev, zoneRect, halfW, halfH)
  const trueExclusion = {
    left: trueRect.left - 18,
    right: trueRect.right + 18,
    top: trueRect.top - 18,
    bottom: trueRect.bottom + 18,
  }
  const tapExclusion = {
    left: touchX - 100,
    right: touchX + 100,
    top: touchY - 100,
    bottom: touchY + 100,
  }

  const minX = VIEWPORT_PAD + halfW
  const maxX = window.innerWidth - VIEWPORT_PAD - halfW
  const minY = VIEWPORT_PAD + halfH
  const maxY = window.innerHeight - VIEWPORT_PAD - halfH

  let best = prev
  let bestScore = -Infinity

  for (let i = 0; i < 32; i++) {
    const cx = minX + Math.random() * (maxX - minX)
    const cy = minY + Math.random() * (maxY - minY)
    const candidate = {
      left: cx - halfW,
      right: cx + halfW,
      top: cy - halfH,
      bottom: cy + halfH,
      cx,
      cy,
    }

    if (rectsOverlap(candidate, trueExclusion)) continue
    if (rectsOverlap(candidate, tapExclusion)) continue

    const distFromTouch = Math.hypot(cx - touchX, cy - touchY)
    const distFromCurrent = Math.hypot(cx - current.cx, cy - current.cy)
    if (distFromCurrent < 60) continue

    const score = distFromTouch + distFromCurrent * 0.25
    if (score > bestScore) {
      bestScore = score
      best = {
        x: cx - (zoneRect.left + zoneRect.width * FALSE_ANCHOR_X),
        y: cy - (zoneRect.top + zoneRect.height * FALSE_ANCHOR_Y),
      }
    }
  }

  return best
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <p className="pop-quiz__success" role="status">
      {message}
    </p>
  )
}

function AllCorrectQuiz({
  question,
  onCorrect,
}: {
  question: Extract<QuizQuestion, { type: 'all-correct' }>
  onCorrect: (message: string) => void
}) {
  const [won, setWon] = useState(false)
  const options = useMemo(() => shuffleOptions(question.options), [question.options])

  const handleWin = () => {
    if (won) return
    setWon(true)
    onCorrect(question.successMessage)
  }

  return (
    <div className="pop-quiz__question">
      <p className="pop-quiz__prompt">{question.prompt}</p>
      <div className="pop-quiz__options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`pop-quiz__option${won ? ' pop-quiz__option--correct' : ''}`}
            disabled={won}
            onClick={() => handleWin()}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="pop-quiz__success-slot" aria-live="polite">
        {won && <SuccessBanner message={question.successMessage} />}
      </div>
    </div>
  )
}

function OneCorrectQuiz({
  question,
  onCorrect,
}: {
  question: Extract<QuizQuestion, { type: 'one-correct' }>
  onCorrect: (message: string) => void
}) {
  const [won, setWon] = useState(false)
  const options = useMemo(() => shuffleOptions(question.options), [question.options])

  const handleWin = () => {
    if (won) return
    setWon(true)
    onCorrect(question.successMessage)
  }

  return (
    <div className="pop-quiz__question">
      <p className="pop-quiz__prompt">{question.prompt}</p>
      <div className="pop-quiz__options">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            className={`pop-quiz__option${won ? ' pop-quiz__option--correct' : ''}`}
            disabled={won}
            onClick={() => handleWin()}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="pop-quiz__success-slot" aria-live="polite">
        {won && <SuccessBanner message={question.successMessage} />}
      </div>
    </div>
  )
}

function TrueFalseQuiz({
  question,
  onCorrect,
}: {
  question: Extract<QuizQuestion, { type: 'true-false' }>
  onCorrect: (message: string) => void
}) {
  const zoneRef = useRef<HTMLDivElement>(null)
  const trueRef = useRef<HTMLButtonElement>(null)
  const falseRef = useRef<HTMLSpanElement>(null)
  const velocityRef = useRef({ vx: 0, vy: 0 })
  const [won, setWon] = useState(false)
  const [falseOffset, setFalseOffset] = useState({ x: 0, y: 0 })
  const [isTouchUi, setIsTouchUi] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)')
    const update = () => setIsTouchUi(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const finish = () => {
    if (won) return
    setWon(true)
    onCorrect(question.successMessage)
  }

  const dodgePointer = useCallback(
    (clientX: number, clientY: number) => {
      const zone = zoneRef.current
      if (!zone || won) return

      const zoneRect = zone.getBoundingClientRect()
      const falseEl = falseRef.current
      const halfW = (falseEl?.offsetWidth ?? 96) / 2
      const halfH = (falseEl?.offsetHeight ?? 44) / 2

      setFalseOffset((prev) => {
        const falseCx = zoneRect.left + zoneRect.width * FALSE_ANCHOR_X + prev.x
        const falseCy = zoneRect.top + zoneRect.height * FALSE_ANCHOR_Y + prev.y

        const dx = clientX - falseCx
        const dy = clientY - falseCy
        const dist = Math.hypot(dx, dy)
        const closeRadius = 150

        if (dist > closeRadius) return prev

        const push = 55 + (closeRadius - dist) * 1.1
        const len = dist || 1

        const fleeX = -(dx / len) * push
        const fleeY = -(dy / len) * push

        const damped = velocityRef.current
        let vx = damped.vx * 0.82 + fleeX
        let vy = damped.vy * 0.82 + fleeY

        const next = clampFalseWithBounce(
          { x: prev.x + vx, y: prev.y + vy },
          { vx, vy },
          zoneRect,
          halfW,
          halfH,
        )

        velocityRef.current = next.velocity
        return next.offset
      })
    },
    [won],
  )

  useEffect(() => {
    if (won || isTouchUi) return

    const track = (e: MouseEvent) => dodgePointer(e.clientX, e.clientY)

    window.addEventListener('mousemove', track)

    return () => {
      window.removeEventListener('mousemove', track)
    }
  }, [dodgePointer, won, isTouchUi])

  useEffect(() => {
    if (won || !isTouchUi) return

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return

      const falseEl = falseRef.current
      const zone = zoneRef.current
      const trueEl = trueRef.current
      if (!falseEl || !zone || !trueEl) return

      const rect = falseEl.getBoundingClientRect()
      const pad = 14
      const { clientX, clientY } = touch

      if (
        clientX < rect.left - pad ||
        clientX > rect.right + pad ||
        clientY < rect.top - pad ||
        clientY > rect.bottom + pad
      ) {
        return
      }

      const zoneRect = zone.getBoundingClientRect()
      const trueRect = trueEl.getBoundingClientRect()
      const halfW = falseEl.offsetWidth / 2
      const halfH = falseEl.offsetHeight / 2

      velocityRef.current = { vx: 0, vy: 0 }
      setFalseOffset((prev) =>
        teleportFalseForMobile(prev, clientX, clientY, zoneRect, trueRect, halfW, halfH),
      )
      e.preventDefault()
    }

    window.addEventListener('touchstart', onTouchStart, { passive: false })

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
    }
  }, [won, isTouchUi])

  return (
    <div className="pop-quiz__question pop-quiz__question--tf">
      <p className="pop-quiz__prompt">{question.prompt}</p>
      <div ref={zoneRef} className="pop-quiz__tf-zone">
        <div className="pop-quiz__tf-arena">
          <button
            ref={trueRef}
            type="button"
            className={`pop-quiz__option pop-quiz__option--true${won ? ' pop-quiz__option--correct' : ''}`}
            disabled={won}
            onClick={finish}
          >
            True
          </button>
        </div>
        <span
          ref={falseRef}
          className={`pop-quiz__option pop-quiz__option--false pop-quiz__option--runaway${isTouchUi ? ' pop-quiz__option--runaway-touch' : ''}`}
          style={{
            transform: `translate(calc(-50% + ${falseOffset.x}px), calc(-50% + ${falseOffset.y}px))`,
          }}
          aria-hidden="true"
        >
          False
        </span>
      </div>
      <div className="pop-quiz__success-slot" aria-live="polite">
        {won && <SuccessBanner message={question.successMessage} />}
      </div>
    </div>
  )
}

function QuizQuestionView({
  question,
  onCorrect,
}: {
  question: QuizQuestion
  onCorrect: (message: string) => void
}) {
  if (question.type === 'all-correct') {
    return <AllCorrectQuiz question={question} onCorrect={onCorrect} />
  }
  if (question.type === 'one-correct') {
    return <OneCorrectQuiz question={question} onCorrect={onCorrect} />
  }
  return <TrueFalseQuiz question={question} onCorrect={onCorrect} />
}

export default function PopQuizPanel({ onClose }: PopQuizPanelProps) {
  const [round] = useState(() => buildQuizRound())
  const [index, setIndex] = useState(0)
  const [roundNumber] = useState(1)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [showRoundComplete, setShowRoundComplete] = useState(false)
  const advanceTimer = useRef<number | null>(null)

  const question = round[index]!

  const clearAdvanceTimer = () => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
  }

  useEffect(() => () => clearAdvanceTimer(), [])

  const advance = useCallback(() => {
    setTransitioning(true)
    clearAdvanceTimer()

    advanceTimer.current = window.setTimeout(() => {
      setTotalCorrect((n) => n + 1)
      const nextIndex = index + 1

      if (nextIndex >= QUIZ_ROUND_SIZE) {
        setShowRoundComplete(true)
      } else {
        setIndex(nextIndex)
      }

      setTransitioning(false)
    }, ADVANCE_MS)
  }, [index])

  return (
    <div className="panel-overlay panel-overlay--quiz">
      <div className="pop-quiz__shell">
        <div
          className={`panel panel--quiz${showRoundComplete ? ' panel--quiz-dimmed' : ''}`}
          role="dialog"
          aria-labelledby="quiz-panel-title"
        >
          <button type="button" className="panel__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <p className="pop-quiz__badge">pop quiz!</p>
          <h2 id="quiz-panel-title" className="panel__title">
            Love Quiz
          </h2>

          <div className="pop-quiz__progress">
            <span className="pop-quiz__progress-label">
              Question {index + 1} of {QUIZ_ROUND_SIZE}
            </span>
            <div className="pop-quiz__progress-dots" aria-hidden="true">
              {round.map((q, i) => (
                <span
                  key={q.id}
                  className={`pop-quiz__dot${i < index ? ' pop-quiz__dot--done' : ''}${i === index ? ' pop-quiz__dot--current' : ''}`}
                />
              ))}
            </div>
            <span className="pop-quiz__stats">
              Round {roundNumber} · {totalCorrect} correct
            </span>
          </div>

          <div
            key={`${roundNumber}-${index}-${question.id}`}
            className={`pop-quiz__stage${transitioning ? ' pop-quiz__stage--out' : ''}`}
          >
            <QuizQuestionView question={question} onCorrect={advance} />
          </div>
        </div>

        {showRoundComplete && (
          <div className="pop-quiz__complete" role="alertdialog" aria-labelledby="quiz-complete-title">
            <div className="pop-quiz__complete-card">
              <span className="pop-quiz__complete-heart" aria-hidden="true">
                ♥
              </span>
              <p id="quiz-complete-title" className="pop-quiz__complete-text">
                oh wow you know me so well
              </p>
              <button
                type="button"
                className="pop-quiz__complete-btn"
                onClick={() => setShowRoundComplete(false)}
              >
                mashi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

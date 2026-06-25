import { useEffect, useRef, useState } from 'react'
import './PasswordGate.css'

const PASSWORD = 'formyeyes'
const UNLOCK_MS = 4500

type PasswordGateProps = {
  unlocking: boolean
  onCorrect: () => void
}

export default function PasswordGate({ unlocking, onCorrect }: PasswordGateProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const tryUnlock = () => {
    if (value === PASSWORD) {
      setError(false)
      setFading(true)
      onCorrect()
      return
    }

    setError(true)
    setValue('')
    window.setTimeout(() => setError(false), 1200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!unlocking && !fading) tryUnlock()
  }

  return (
    <div
      className={`password-gate${unlocking || fading ? ' password-gate--unlocking' : ''}${error ? ' password-gate--error' : ''}`}
      aria-hidden={unlocking || fading}
    >
      <form className="password-gate__form" onSubmit={handleSubmit}>
        <label htmlFor="gate-password" className="password-gate__label">
          password
        </label>
        <input
          ref={inputRef}
          id="gate-password"
          type="password"
          className="password-gate__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          disabled={unlocking || fading}
        />
      </form>
    </div>
  )
}

export const PASSWORD_UNLOCK_MS = UNLOCK_MS

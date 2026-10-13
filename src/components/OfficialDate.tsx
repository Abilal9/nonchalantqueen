import { useEffect, useId, useRef, useState } from 'react'
import './OfficialDate.css'

const OFFICIAL_YEAR = 2026
const OFFICIAL_MONTH_INDEX = 9
const OFFICIAL_DAY = 4

function daysSinceOfficial(now = new Date()) {
  const start = Date.UTC(OFFICIAL_YEAR, OFFICIAL_MONTH_INDEX, OFFICIAL_DAY)
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((today - start) / 86_400_000)
}

function togetherLabel(days: number) {
  const count = Math.max(0, days)
  return count === 1 ? '1 day together' : `${count} days together`
}

export default function OfficialDate() {
  const [open, setOpen] = useState(false)
  const [days, setDays] = useState(() => daysSinceOfficial())
  const rootRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()

  useEffect(() => {
    const refresh = () => setDays(daysSinceOfficial())
    refresh()
    const id = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (!root || !(event.target instanceof Node) || root.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className={`official-date${open ? ' official-date--open' : ''}`}>
      <button
        type="button"
        className="official-date__button"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((current) => !current)}
      >
        October 4th, 2026
      </button>
      <div className="official-date__card" id={popoverId} role="tooltip">
        <p className="official-date__meaning">The day we became official ♡</p>
        <p className="official-date__count">{togetherLabel(days)}</p>
      </div>
    </div>
  )
}

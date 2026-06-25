import { useEffect, useRef, useState } from 'react'
import './CuteCursor.css'

export default function CuteCursor() {
  const heartRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const heartPos = useRef({ x: -100, y: -100 })
  const trailPos = useRef({ x: -100, y: -100 })
  const target = useRef({ x: -100, y: -100 })
  const [active, setActive] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')

    if (reducedMotion.matches || !finePointer.matches) return

    setActive(true)
    document.body.classList.add('custom-cursor')

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
    }

    let frame = 0
    const animate = () => {
      heartPos.current.x += (target.current.x - heartPos.current.x) * 0.22
      heartPos.current.y += (target.current.y - heartPos.current.y) * 0.22
      trailPos.current.x += (target.current.x - trailPos.current.x) * 0.1
      trailPos.current.y += (target.current.y - trailPos.current.y) * 0.1

      if (heartRef.current) {
        heartRef.current.style.transform = `translate(${heartPos.current.x}px, ${heartPos.current.y}px)`
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px)`
      }

      frame = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    frame = requestAnimationFrame(animate)

    return () => {
      document.body.classList.remove('custom-cursor')
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  if (!active) return null

  return (
    <div className="cute-cursor" aria-hidden="true">
      <div ref={trailRef} className="cute-cursor__trail">
        <span>✦</span>
      </div>
      <div ref={heartRef} className="cute-cursor__heart">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
    </div>
  )
}

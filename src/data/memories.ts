const COUNT = 48
export const NEW_MEMORY_FROM = 27

export const memoryImages: string[] = Array.from(
  { length: COUNT },
  (_, i) => `/memories/memory-${String(i + 1).padStart(2, '0')}.png`,
)

export function shuffleMemories(images: readonly string[]): string[] {
  const shuffled = [...images]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

function seededTilt(seed: number) {
  const x = Math.sin(seed * 7777) * 10000
  return (x - Math.floor(x) - 0.5) * 7
}

export function memoryTilt(index: number) {
  return seededTilt(index + 1)
}

export function isNewMemory(src: string) {
  const match = /memory-(\d+)\.png$/.exec(src)
  if (!match) return false
  return Number(match[1]) >= NEW_MEMORY_FROM
}

function seededUnit(seed: number) {
  const x = Math.sin(seed * 3333.7) * 10000
  return x - Math.floor(x)
}

export type MemoryBgLayout = {
  left: number
  top: number
  tilt: number
  driftX: number
  driftY: number
  scale: number
  delay: number
}

export function memoryBgLayout(index: number): MemoryBgLayout {
  const base = index + 101
  return {
    left: 4 + seededUnit(base) * 78,
    top: 6 + seededUnit(base + 1) * 72,
    tilt: (seededUnit(base + 2) - 0.5) * 32,
    driftX: (seededUnit(base + 3) - 0.5) * 140,
    driftY: 24 + seededUnit(base + 4) * 90,
    scale: 0.52 + seededUnit(base + 5) * 0.28,
    delay: seededUnit(base + 6) * 0.35,
  }
}

export const MEMORY_BG_COUNT = 14

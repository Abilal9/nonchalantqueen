const COUNT = 26

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

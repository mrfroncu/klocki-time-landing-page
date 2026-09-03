import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const PARTICLE_COLORS = ['var(--color-brand)', 'var(--color-gold)', 'var(--color-fg-subtle)']

interface Particle {
  left: number
  size: number
  duration: number
  delay: number
  color: string
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    left: (i / count) * 100 + (((i * 37) % 10) - 5),
    size: 3 + ((i * 7) % 3),
    duration: 14 + ((i * 11) % 10),
    delay: -((i * 5) % 14),
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length]!,
  }))
}

/**
 * Tło: cicha kratka pikseli + garść drobnych, wolno unoszących się
 * kwadracików (jak cząsteczki z enchant table) zamiast rozmytych plam
 * gradientu. Wyłącza animację przy prefers-reduced-motion.
 */
export function Background() {
  const reduce = useReducedMotion()
  const particles = useMemo(() => makeParticles(14), [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div
        className="pixel-grid-bg absolute inset-0 opacity-70"
        style={{
          maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)',
        }}
      />

      {!reduce &&
        particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: '0 0 0 1px var(--color-panel-outline)',
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: '-110vh', opacity: [0, 0.55, 0.55, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
    </div>
  )
}

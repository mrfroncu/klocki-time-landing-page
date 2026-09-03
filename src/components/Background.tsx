import { motion, useReducedMotion } from 'motion/react'

/**
 * Dekoracyjne tło: miękka „aurora" z trzech rozmytych plam + delikatna siatka.
 * Nie przechwytuje zdarzeń wskaźnika, znika przy `prefers-reduced-motion`.
 */
export function Background() {
  const reduce = useReducedMotion()

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in srgb, var(--color-fg) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-fg) 6%, transparent) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)',
        }}
      />

      <Blob
        className="left-[-10%] top-[-15%] h-[46rem] w-[46rem]"
        color="var(--glow-a)"
        reduce={reduce ?? false}
        drift={{ x: [0, 40, -20, 0], y: [0, 30, 10, 0] }}
        duration={26}
      />
      <Blob
        className="right-[-15%] top-[5%] h-[40rem] w-[40rem]"
        color="var(--glow-b)"
        reduce={reduce ?? false}
        drift={{ x: [0, -30, 20, 0], y: [0, 40, -10, 0] }}
        duration={32}
      />
      <Blob
        className="bottom-[-25%] left-[20%] h-[42rem] w-[42rem]"
        color="var(--glow-c)"
        reduce={reduce ?? false}
        drift={{ x: [0, 25, -35, 0], y: [0, -20, 15, 0] }}
        duration={38}
      />
    </div>
  )
}

interface BlobProps {
  className?: string
  color: string
  reduce: boolean
  drift: { x: number[]; y: number[] }
  duration: number
}

function Blob({ className, color, reduce, drift, duration }: BlobProps) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[110px] ${className ?? ''}`}
      style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)` }}
      animate={reduce ? undefined : drift}
      transition={{ duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    />
  )
}

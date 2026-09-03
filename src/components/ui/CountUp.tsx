import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'

interface CountUpProps {
  value: number
  /** Czas trwania animacji w sekundach. */
  duration?: number
  className?: string
}

/** Licznik płynnie animujący się do nowej wartości całkowitej. */
export function CountUp({ value, duration = 0.9, className }: CountUpProps) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      fromRef.current = value
      return
    }
    const controls = animate(fromRef.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
      onComplete: () => {
        fromRef.current = value
      },
    })
    return () => controls.stop()
  }, [value, duration, reduce])

  return (
    <span className={className} aria-hidden>
      {display.toLocaleString('pl-PL')}
    </span>
  )
}

import { motion, useReducedMotion } from 'motion/react'
import type { StatusTone } from '../lib/derive'

const TONE: Record<StatusTone, { dot: string; text: string; ring: string }> = {
  online: { dot: 'bg-success', text: 'text-success', ring: 'bg-success/60' },
  sleeping: { dot: 'bg-warn', text: 'text-warn', ring: 'bg-warn/50' },
  offline: { dot: 'bg-danger', text: 'text-danger', ring: 'bg-danger/50' },
  pending: { dot: 'bg-fg-subtle', text: 'text-fg-muted', ring: 'bg-fg-subtle/40' },
  error: { dot: 'bg-warn', text: 'text-warn', ring: 'bg-warn/40' },
}

interface StatusPillProps {
  tone: StatusTone
  label: string
  className?: string
}

export function StatusPill({ tone, label, className }: StatusPillProps) {
  const reduce = useReducedMotion()
  const c = TONE[tone]
  const animated = (tone === 'online' || tone === 'sleeping') && !reduce

  return (
    <span
      className={`glass inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${className ?? ''}`}
    >
      <span className="relative grid h-2.5 w-2.5 place-items-center">
        {animated && (
          <motion.span
            className={`absolute inset-0 rounded-full ${c.ring}`}
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
      </span>
      <span className={c.text}>{label}</span>
    </span>
  )
}

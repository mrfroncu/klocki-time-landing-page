import { motion, useReducedMotion, type Variants } from 'motion/react'
import { config, connectAddress } from '../config'
import type { ThemeController } from '../hooks/useTheme'
import type { DerivedStatus } from '../lib/derive'
import { BrandMark } from './BrandMark'
import { CopyAddress } from './CopyAddress'
import { StatusPill } from './StatusPill'
import { ThemeToggle } from './ThemeToggle'
import { CountUp } from './ui/CountUp'

interface ServerCardProps {
  status: DerivedStatus
  theme: ThemeController
  className?: string
}

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}
const itemStill: Variants = { hidden: { opacity: 0 }, show: { opacity: 1 } }

/** Prawa kolumna, góra: kto, jaki stan, jak dołączyć. */
export function ServerCard({ status, theme, className }: ServerCardProps) {
  const reduce = useReducedMotion()
  const v = reduce ? itemStill : item
  const players =
    status.playersOnline !== null && status.playersMax !== null
      ? { online: status.playersOnline, max: status.playersMax }
      : null

  return (
    <motion.section
      variants={list}
      initial="hidden"
      animate="show"
      className={`surface flex flex-col gap-4 p-4 sm:p-5 ${className ?? ''}`}
      aria-label="Serwer"
    >
      <motion.header variants={v} className="flex items-center gap-3">
        <BrandMark icon={status.icon} className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <h1
            className="truncate font-display text-[1.65rem] font-semibold leading-none tracking-wide text-fg"
            style={{ textShadow: '3px 3px 0 var(--color-brand-lo)' }}
          >
            {config.serverName}
          </h1>
          <p className="mt-1.5 truncate text-xs text-fg-muted">{config.serverTagline}</p>
        </div>
        <ThemeToggle {...theme} />
      </motion.header>

      <motion.div variants={v} className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <StatusPill tone={status.tone} label={status.label} />
        <span className="text-sm text-fg-muted">
          {players ? (
            <>
              <CountUp value={players.online} className="font-semibold tabular-nums text-fg" />
              <span className="tabular-nums"> / {players.max}</span> online
            </>
          ) : (
            <span className="text-fg-subtle">— / — online</span>
          )}
        </span>
      </motion.div>

      {status.motd && (
        <p
          key={status.motd}
          className="fade-in-up -mt-1 border-l-2 border-line-soft pl-3 font-mono text-xs leading-relaxed text-fg-subtle"
        >
          {status.motd}
        </p>
      )}

      <motion.div variants={v} className="flex flex-col gap-1.5">
        <span className="label-caps">Adres serwera</span>
        <CopyAddress address={connectAddress()} />
      </motion.div>
    </motion.section>
  )
}

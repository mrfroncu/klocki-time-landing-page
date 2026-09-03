import { motion, useReducedMotion, type Variants } from 'motion/react'
import { config, connectAddress } from '../config'
import type { DerivedStatus } from '../lib/derive'
import { CopyAddress } from './CopyAddress'
import { StatsStrip } from './StatsStrip'
import { ArrowRightIcon, DiscordIcon, MapIcon, SparkIcon } from './icons'

interface HeroProps {
  status: DerivedStatus
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}
const itemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35 } },
}

export function Hero({ status }: HeroProps) {
  const reduce = useReducedMotion()
  const v = reduce ? itemReduced : item

  return (
    <section className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-12 pt-14 text-center sm:px-6 sm:pb-16 sm:pt-20">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex w-full flex-col items-center gap-6"
      >
        <motion.span
          variants={v}
          className="panel-inset inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-display font-semibold tracking-wide text-fg-muted"
        >
          <SparkIcon className="h-3.5 w-3.5 text-brand" />
          SERWER MINECRAFT
          <span className="text-fg-subtle">·</span>
          {/* font-sans: cyfry w Pixelify Sans (np. "5") bywają nieczytelne — mylą się z "$". */}
          <span className="font-sans tabular-nums text-fg">{status.version}</span>
        </motion.span>

        <motion.h1
          variants={v}
          className="text-balance font-display text-5xl font-semibold leading-[1.15] tracking-wide text-fg sm:text-6xl md:text-7xl"
          style={{ textShadow: '4px 4px 0 var(--color-brand-lo)' }}
        >
          {config.serverName}
        </motion.h1>

        <motion.p variants={v} className="max-w-xl text-pretty text-base text-fg-muted sm:text-lg">
          {config.serverTagline}
        </motion.p>

        {/* MOTD dochodzi asynchronicznie po odpowiedzi API. Animacja wejścia
            jest w CSS (nie zależy od cyklu animacji rodzica ani od RAF). */}
        {status.motd && (
          <p
            key={status.motd}
            className="fade-in-up panel-inset max-w-lg text-pretty px-3 py-1.5 font-mono text-xs text-fg-subtle sm:text-sm"
          >
            » {status.motd}
          </p>
        )}

        <motion.div variants={v} className="pt-1">
          <CopyAddress address={connectAddress()} />
        </motion.div>

        <motion.div variants={v} className="flex flex-col items-center gap-3 pt-1 xs:flex-row">
          <a
            href={config.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-bevel btn-brand group inline-flex items-center justify-center gap-2 px-6 py-3 font-display text-sm font-semibold tracking-wide"
          >
            <DiscordIcon className="h-4.5 w-4.5" />
            DOŁĄCZ PO PACZKĘ MODÓW
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <a
            href="#mapa"
            className="btn-bevel btn-panel inline-flex items-center justify-center gap-2 px-6 py-3 font-display text-sm font-semibold tracking-wide"
          >
            <MapIcon className="h-4.5 w-4.5 text-brand" />
            ZOBACZ MAPĘ
          </a>
        </motion.div>

        <motion.div variants={v} className="w-full pt-6">
          <StatsStrip status={status} />
        </motion.div>
      </motion.div>
    </section>
  )
}

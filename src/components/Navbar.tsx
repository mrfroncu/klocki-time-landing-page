import { motion, useReducedMotion } from 'motion/react'
import { config } from '../config'
import type { ThemeController } from '../hooks/useTheme'
import type { DerivedStatus } from '../lib/derive'
import { BrandMark } from './BrandMark'
import { StatusPill } from './StatusPill'
import { ThemeToggle } from './ThemeToggle'
import { DiscordIcon } from './icons'

interface NavbarProps {
  status: DerivedStatus
  theme: ThemeController
}

export function Navbar({ status, theme }: NavbarProps) {
  const reduce = useReducedMotion()

  return (
    <motion.header
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a
          href="#top"
          className="glass flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <BrandMark icon={status.icon} className="h-8 w-8 rounded-full" />
          <span className="text-sm font-semibold tracking-tight">{config.serverName}</span>
        </a>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <StatusPill tone={status.tone} label={status.label} />
          </span>
          <ThemeToggle {...theme} />
          <a
            href={config.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast shadow-brand transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <DiscordIcon className="h-4 w-4" />
            <span className="hidden xs:inline">Discord</span>
          </a>
        </div>
      </div>
    </motion.header>
  )
}

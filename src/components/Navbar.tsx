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
      className="sticky top-3 z-40 w-full px-3 sm:top-4 sm:px-4"
    >
      <div className="panel mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <BrandMark icon={status.icon} className="h-9 w-9" />
          <span className="truncate font-display text-sm font-semibold tracking-wide text-fg">
            {config.serverName}
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden sm:block">
            <StatusPill tone={status.tone} label={status.label} />
          </span>
          <ThemeToggle {...theme} />
          <a
            href={config.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-bevel btn-brand inline-flex items-center gap-2 px-3 py-2 text-xs font-display font-semibold tracking-wide sm:px-4 sm:text-sm"
          >
            <DiscordIcon className="h-4 w-4" />
            <span className="hidden xs:inline">Discord</span>
          </a>
        </div>
      </div>
    </motion.header>
  )
}

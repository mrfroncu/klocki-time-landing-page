import { motion, useReducedMotion, type Variants } from 'motion/react'
import { config } from '../config'
import type { DerivedStatus } from '../lib/derive'
import { ActivityIcon, ArrowRightIcon, DiscordIcon, ExternalIcon, MonitorIcon, SettingsIcon } from './icons'

interface ActionsCardProps {
  status: DerivedStatus
  updatedAt: number | null
  className?: string
}

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}
const itemStill: Variants = { hidden: { opacity: 0 }, show: { opacity: 1 } }

/** Prawa kolumna, dół: wersja/modpack, jedno CTA na Discord, linki, stopka. */
export function ActionsCard({ status, updatedAt, className }: ActionsCardProps) {
  const reduce = useReducedMotion()
  const v = reduce ? itemStill : item

  return (
    <motion.section
      variants={list}
      initial="hidden"
      animate="show"
      className={`surface flex flex-col gap-4 p-4 sm:p-5 ${className ?? ''}`}
      aria-label="Akcje"
    >
      <motion.dl variants={v} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
        <div className="field flex flex-col gap-1.5 px-3 py-2.5 pr-5">
          <dt className="label-caps">Wersja</dt>
          <dd className="text-sm font-semibold tabular-nums text-fg">{status.version}</dd>
        </div>
        <div className="field flex min-w-0 flex-col gap-1.5 px-3 py-2.5">
          <dt className="label-caps">Modpack</dt>
          <dd className="flex min-w-0 items-baseline gap-1.5 text-sm font-semibold text-fg">
            <span className="truncate">{config.modpackName}</span>
            {config.modpackVersion && (
              <span className="shrink-0 font-normal tabular-nums text-fg-muted">
                {config.modpackVersion}
              </span>
            )}
          </dd>
        </div>
      </motion.dl>

      <motion.div variants={v} className="flex flex-col gap-1.5">
        <a
          href={config.discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-bevel btn-brand group flex w-full items-center justify-center gap-2.5 px-4 py-3 text-sm font-bold"
        >
          <DiscordIcon className="h-5 w-5" />
          Dołącz po paczkę modów
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </a>
        <p className="text-center text-[11px] text-fg-subtle">
          Modpack i instrukcja instalacji są na Discordzie.
        </p>
      </motion.div>

      <motion.nav variants={v} className="flex flex-col gap-2" aria-label="Linki">
        <a
          href={config.statusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="row-link px-3 py-2.5 text-sm font-medium"
        >
          <ActivityIcon className="h-4.5 w-4.5 shrink-0 text-gold" />
          Status serwerów
          <ExternalIcon className="ml-auto h-4 w-4 shrink-0 text-fg-subtle" />
        </a>
        <a
          href={config.monitorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="row-link px-3 py-2.5 text-sm font-medium"
        >
          <MonitorIcon className="h-4.5 w-4.5 shrink-0 text-brand" />
          Monitoring usług
          <ExternalIcon className="ml-auto h-4 w-4 shrink-0 text-fg-subtle" />
        </a>
        <a
          href={config.managementUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="row-link px-3 py-2.5 text-sm font-medium"
        >
          <SettingsIcon className="h-4.5 w-4.5 shrink-0 text-danger" />
          Panel zarządzania
          <ExternalIcon className="ml-auto h-4 w-4 shrink-0 text-fg-subtle" />
        </a>
      </motion.nav>

      <motion.footer
        variants={v}
        className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t-2 border-line-soft pt-3 text-[11px] text-fg-subtle"
      >
        <span>
          © {new Date().getFullYear()} {config.serverName}
        </span>
        <span>
          {updatedAt
            ? `Odświeżono ${new Date(updatedAt).toLocaleTimeString('pl-PL', {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : 'Łączenie…'}
          {' · '}
          <a
            href="https://alleria.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:text-fg-muted hover:underline"
          >
            Alleria.pl
          </a>
        </span>
      </motion.footer>
    </motion.section>
  )
}

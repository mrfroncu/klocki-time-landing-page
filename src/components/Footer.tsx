import { config, connectAddress } from '../config'
import type { DerivedStatus } from '../lib/derive'
import { StatusPill } from './StatusPill'

interface FooterProps {
  status: DerivedStatus
  updatedAt: number | null
}

export function Footer({ status, updatedAt }: FooterProps) {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
      <div className="panel flex flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-display text-sm font-semibold">{config.serverName}</span>
          <span className="font-mono text-xs text-fg-subtle">{connectAddress()}</span>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusPill tone={status.tone} label={status.label} />
          <span className="text-xs text-fg-subtle">
            {updatedAt
              ? `Zaktualizowano ${new Date(updatedAt).toLocaleTimeString('pl-PL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : 'Łączenie z API statusu…'}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-fg-subtle sm:flex-row sm:justify-between sm:text-left">
        <span>
          © {new Date().getFullYear()} {config.serverName}. Serwer prywatny — bez afiliacji z Mojang / Microsoft.
        </span>
        <span>
          powered by{' '}
          <a
            href="https://alleria.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-fg-muted underline-offset-2 hover:underline"
          >
            Alleria.pl
          </a>
        </span>
      </div>
    </footer>
  )
}

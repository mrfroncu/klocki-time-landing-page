import { config } from '../config'
import type { DerivedStatus, StatusTone } from '../lib/derive'
import { CountUp } from './ui/CountUp'
import { ActivityIcon, CubeIcon, TagIcon, UsersIcon } from './icons'

const STATUS_COLOR: Record<StatusTone, string> = {
  online: 'text-success',
  sleeping: 'text-warn',
  offline: 'text-danger',
  pending: 'text-fg-muted',
  error: 'text-warn',
}

interface StatsStripProps {
  status: DerivedStatus
}

export function StatsStrip({ status }: StatsStripProps) {
  const players =
    status.playersOnline !== null && status.playersMax !== null
      ? { online: status.playersOnline, max: status.playersMax }
      : null

  const items = [
    {
      key: 'status',
      icon: ActivityIcon,
      label: 'Status',
      value: status.label,
      tone: STATUS_COLOR[status.tone],
    },
    {
      key: 'players',
      icon: UsersIcon,
      label: 'Gracze online',
      value: players ? (
        <span>
          <CountUp value={players.online} className="tabular-nums" />
          <span className="text-fg-subtle"> / {players.max}</span>
        </span>
      ) : (
        <span className="text-fg-subtle">—</span>
      ),
      tone: 'text-fg',
    },
    {
      key: 'version',
      icon: CubeIcon,
      label: 'Wersja Minecraft',
      value: <span className="tabular-nums">{status.version}</span>,
      tone: 'text-fg',
    },
    {
      key: 'modpack',
      icon: TagIcon,
      label: config.modpackVersion ? `Modpack · ${config.modpackVersion}` : 'Modpack',
      value: <span className="truncate">{config.modpackName}</span>,
      tone: 'text-fg',
    },
  ]

  return (
    <dl className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.key} className="panel-inset flex flex-col gap-1.5 px-3.5 py-3.5 text-left">
            <dt className="flex items-center gap-1.5 text-[10px] font-display font-semibold uppercase tracking-wider text-fg-subtle">
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{item.label}</span>
            </dt>
            {/* font-sans, nie font-display: cyfry w Pixelify Sans (np. "5") bywają
                nieczytelne, mylą się z "$" — tu regularnie pokazujemy liczby graczy. */}
            <dd className={`font-sans text-base font-semibold tabular-nums ${item.tone}`}>
              {item.value}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

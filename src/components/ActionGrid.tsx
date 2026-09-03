import type { ComponentType, SVGProps } from 'react'
import { config } from '../config'
import { Reveal, RevealGroup, RevealItem } from './ui/Reveal'
import { ActivityIcon, ArrowRightIcon, DiscordIcon, MapIcon, SettingsIcon } from './icons'

interface ActionLink {
  title: string
  description: string
  href: string
  cta: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  accent: string
}

const links: ActionLink[] = [
  {
    title: 'Discord',
    description: 'Pobierz paczkę modów, śledź ogłoszenia i graj razem ze znajomymi.',
    href: config.discordUrl,
    cta: 'Dołącz i pobierz paczkę',
    icon: DiscordIcon,
    accent: 'text-[#5865F2] dark:text-[#8b93f8]',
  },
  {
    title: 'Status serwerów',
    description: 'Sprawdź dostępność serwera i pozostałych usług w czasie rzeczywistym.',
    href: config.statusUrl,
    cta: 'Zobacz status',
    icon: ActivityIcon,
    accent: 'text-gold',
  },
  {
    title: 'Panel zarządzania',
    description: 'Whitelist, restarty i kopie zapasowe. Dostęp po zalogowaniu.',
    href: config.managementUrl,
    cta: 'Otwórz panel',
    icon: SettingsIcon,
    accent: 'text-danger',
  },
  {
    title: 'Mapa świata',
    description: 'Pełnoekranowy podgląd terenu, baz i odkrytych rejonów serwera.',
    href: config.mapUrl,
    cta: 'Otwórz mapę',
    icon: MapIcon,
    accent: 'text-brand',
  },
]

export function ActionGrid() {
  return (
    <section id="linki" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
      <Reveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Skróty
        </span>
        <h2 className="text-balance font-display text-3xl font-semibold tracking-wide sm:text-4xl">
          Wszystko w jednym miejscu
        </h2>
        <p className="text-pretty text-fg-muted">
          Cztery najważniejsze linki serwera Klocki Time — otwierają się w nowej karcie.
        </p>
      </Reveal>

      <RevealGroup className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <RevealItem key={link.title}>
            <ActionCard {...link} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

function ActionCard({ title, description, href, cta, icon: Icon, accent }: ActionLink) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-bevel btn-panel group flex h-full flex-col gap-4 p-5"
    >
      <div className="panel-inset grid h-12 w-12 place-items-center">
        <Icon className={`h-6 w-6 ${accent}`} />
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="font-display text-base font-semibold tracking-wide">{title}</h3>
        <p className="text-pretty text-sm text-fg-muted">{description}</p>
      </div>

      <span className="inline-flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-wide text-brand">
        {cta}
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </a>
  )
}

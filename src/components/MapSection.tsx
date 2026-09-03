import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import type { DerivedStatus } from '../lib/derive'
import { Reveal } from './ui/Reveal'
import { ExpandIcon, ExternalIcon, MapIcon } from './icons'

const MAP_LOAD_TIMEOUT_MS = 10000

interface MapSectionProps {
  status: DerivedStatus
}

export function MapSection({ status }: MapSectionProps) {
  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mapa działa razem z serwerem — gdy jest uśpiony/offline, nie próbujemy
  // osadzać (pokazalibyśmy pustą ramkę lub stronę błędu proxy).
  const serverReachable = status.tone === 'online' || status.tone === 'sleeping'
  const embed = config.mapEmbed && status.tone === 'online'

  useEffect(() => {
    if (!embed) return
    setLoaded(false)
    setTimedOut(false)
    timerRef.current = setTimeout(() => setTimedOut(true), MAP_LOAD_TIMEOUT_MS)
    return () => void (timerRef.current && clearTimeout(timerRef.current))
  }, [embed])

  const handleLoad = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLoaded(true)
    setTimedOut(false)
  }

  const reason: FallbackReason = !config.mapEmbed
    ? 'disabled'
    : status.tone === 'offline'
      ? 'offline'
      : status.tone === 'sleeping'
        ? 'sleeping'
        : status.tone === 'pending'
          ? 'pending'
          : timedOut && !loaded
            ? 'timeout'
            : 'none'

  return (
    <section id="mapa" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
      <Reveal className="mx-auto mb-8 flex max-w-2xl flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          <MapIcon className="h-4 w-4" />
          Świat
        </span>
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Mapa serwera na żywo
        </h2>
        <p className="text-pretty text-fg-muted">
          Przeglądaj ukształtowanie terenu, bazy i odkryte rejony. Podgląd ładuje się, gdy serwer jest
          aktywny.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="group relative overflow-hidden rounded-2xl border border-border-strong bg-bg-elevated shadow-float">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-2 truncate font-mono text-xs text-fg-subtle">
                {prettyHost(config.mapUrl)}
              </span>
            </div>
            <a
              href={config.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-fg transition-transform hover:-translate-y-0.5"
            >
              <ExpandIcon className="h-3.5 w-3.5" />
              Pełny ekran
            </a>
          </div>

          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
            {embed && (
              <iframe
                src={config.mapUrl}
                title={`Mapa serwera ${config.serverName}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allow="fullscreen"
                onLoad={handleLoad}
                className="absolute inset-0 h-full w-full border-0"
              />
            )}
            {embed && !loaded && !timedOut && <MapSkeleton />}
            {reason !== 'none' && <MapFallback reason={reason} online={serverReachable} />}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-4 flex justify-center">
        <a
          href={config.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-bg-elevated"
        >
          <ExternalIcon className="h-4 w-4" />
          Otwórz mapę w nowej karcie
        </a>
      </Reveal>
    </section>
  )
}

type FallbackReason = 'none' | 'disabled' | 'offline' | 'sleeping' | 'pending' | 'timeout'

const MESSAGE: Record<Exclude<FallbackReason, 'none'>, string> = {
  disabled: 'Interaktywna mapa świata otwiera się w osobnej karcie.',
  offline: 'Serwer jest offline — mapa świata będzie dostępna, gdy wróci online.',
  sleeping: 'Serwer jest uśpiony. Mapa załaduje się tutaj po jego uruchomieniu — możesz też otworzyć ją w nowej karcie.',
  pending: 'Sprawdzam stan serwera…',
  timeout:
    'Podgląd mapy nie wczytał się w tym miejscu (serwer mapy może blokować osadzanie). Otwórz ją w nowej karcie.',
}

function MapFallback({ reason, online }: { reason: Exclude<FallbackReason, 'none'>; online: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand/10 to-accent/10 p-8 backdrop-blur-sm">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/15 text-brand">
          {reason === 'pending' ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
          ) : (
            <MapIcon className="h-7 w-7" />
          )}
        </span>
        <p className="text-pretty text-sm text-fg-muted">{MESSAGE[reason]}</p>
        {reason !== 'pending' && (
          <a
            href={config.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-contrast shadow-brand"
          >
            <ExternalIcon className="h-4 w-4" />
            Otwórz mapę{online ? '' : ' mimo to'}
          </a>
        )}
      </div>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bg-elevated">
      <div className="flex flex-col items-center gap-3 text-fg-subtle">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        <span className="text-xs font-medium">Wczytywanie mapy…</span>
      </div>
    </div>
  )
}

function prettyHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

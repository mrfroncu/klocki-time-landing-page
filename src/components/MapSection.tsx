import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import type { DerivedStatus } from '../lib/derive'
import { ExpandIcon, ExternalIcon, MapIcon } from './icons'

const MAP_LOAD_TIMEOUT_MS = 10000

interface MapSectionProps {
  status: DerivedStatus
}

/**
 * Mapa jako pełnoszerokościowy "wizjer w świat" wtopiony w stronę — bez karty,
 * bez ramki okna. Rozpięta na całą szerokość ekranu (poza kontenerem
 * max-w-*, tak jak reszta sekcji), z etykietą i przyciskiem jako HUD
 * nałożony bezpośrednio na podgląd, nie osobny pasek nad nim.
 */
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
    <section id="mapa" className="relative w-full scroll-mt-20">
      <div className="h-2 w-full bg-panel-outline sm:h-3" />

      <div className="relative h-[62vh] max-h-[680px] min-h-[420px] w-full overflow-hidden bg-bg-elevated sm:h-[68vh]">
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

        {/* HUD: etykieta + przycisk leżą NA mapie, nie w osobnym pasku nad nią.
            pointer-events-none na wrapperze, żeby nie blokować przeciągania mapy. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="btn-bevel btn-brand pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 font-display text-xs font-semibold tracking-wide">
              <MapIcon className="h-3.5 w-3.5" />
              MAPA ŚWIATA · NA ŻYWO
            </span>
            <a
              href={config.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-bevel btn-panel pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 font-display text-xs font-semibold tracking-wide"
            >
              <ExpandIcon className="h-3.5 w-3.5" />
              PEŁNY EKRAN
            </a>
          </div>
        </div>
      </div>

      <div className="h-2 w-full bg-panel-outline sm:h-3" />
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
    <div className="pixel-grid-bg absolute inset-0 grid place-items-center bg-bg-elevated p-8">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <span className="btn-bevel btn-panel grid h-14 w-14 place-items-center text-brand">
          {reason === 'pending' ? (
            <span className="h-6 w-6 animate-spin border-2 border-panel-lo border-t-brand" />
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
            className="btn-bevel btn-brand inline-flex items-center gap-2 px-5 py-2.5 font-display text-xs font-semibold tracking-wide"
          >
            <ExternalIcon className="h-4 w-4" />
            OTWÓRZ MAPĘ{online ? '' : ' MIMO TO'}
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
        <span className="h-8 w-8 animate-spin border-2 border-panel-lo border-t-brand" />
        <span className="font-display text-xs font-semibold tracking-wide">WCZYTUJĘ MAPĘ…</span>
      </div>
    </div>
  )
}

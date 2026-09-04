import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { config, resolvedMapUrl } from '../config'
import type { DerivedStatus } from '../lib/derive'
import { ExpandIcon, ExternalIcon, MapIcon } from './icons'

const MAP_LOAD_TIMEOUT_MS = 10000

interface MapPanelProps {
  status: DerivedStatus
  className?: string
}

/**
 * Lewa kolumna: mapa świata na całą wysokość ekranu. Etykieta i przycisk
 * pełnego ekranu leżą na mapie jako HUD (jedyne miejsce z tą akcją).
 *
 * Tryb "local" (config.mapMode): BlueMap serwowany z tego samego kontenera
 * pod /map, czytający gotowe kafelki z SQL — dostępny NIEZALEŻNIE od tego,
 * czy serwer MC śpi. Tryb "remote": stary iframe do zewnętrznego mapUrl,
 * osadzany tylko gdy serwer jest online.
 */
export function MapPanel({ status, className }: MapPanelProps) {
  const reduce = useReducedMotion()
  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLocal = config.mapMode === 'local'
  const mapUrl = resolvedMapUrl()
  const embed = config.mapEmbed && (isLocal || status.tone === 'online')
  const reachable = isLocal || status.tone === 'online' || status.tone === 'sleeping'

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
    : timedOut && !loaded
      ? 'timeout'
      : isLocal
        ? 'none'
        : status.tone === 'offline'
          ? 'offline'
          : status.tone === 'sleeping'
            ? 'sleeping'
            : status.tone === 'pending' || status.tone === 'error'
              ? 'pending'
              : 'none'

  return (
    <motion.section
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`surface relative min-h-[52vh] overflow-hidden lg:min-h-0 ${className ?? ''}`}
      aria-label="Mapa świata"
    >
      {embed && (
        <iframe
          src={mapUrl}
          title={`Mapa serwera ${config.serverName}`}
          referrerPolicy="no-referrer-when-downgrade"
          allow="fullscreen"
          onLoad={handleLoad}
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
      {embed && !loaded && !timedOut && <MapSkeleton />}
      {reason !== 'none' && <MapFallback reason={reason} reachable={reachable} mapUrl={mapUrl} />}

      {/* HUD — wrapper nie łapie kliknięć, żeby dało się przeciągać mapę. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <span className="field pointer-events-auto inline-flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg">
          <MapIcon className="h-3.5 w-3.5 text-brand" />
          Mapa świata
          {(isLocal || status.tone === 'online') && (
            <span className="ml-0.5 inline-flex items-center gap-1.5 text-brand">
              <span className="relative grid h-1.5 w-1.5 place-items-center">
                {!reduce && (
                  <motion.span
                    className="absolute inset-0 bg-brand/60"
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: 2.8, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <span className="h-1.5 w-1.5 bg-brand" />
              </span>
              {isLocal ? 'zawsze dostępna' : 'na żywo'}
            </span>
          )}
        </span>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-bevel btn-panel pointer-events-auto grid h-9 w-9 place-items-center"
          aria-label="Otwórz mapę na pełnym ekranie"
          title="Pełny ekran"
        >
          <ExpandIcon className="h-4 w-4" />
        </a>
      </div>
    </motion.section>
  )
}

type FallbackReason = 'none' | 'disabled' | 'offline' | 'sleeping' | 'pending' | 'timeout'

const MESSAGE: Record<Exclude<FallbackReason, 'none'>, string> = {
  disabled: 'Interaktywna mapa otwiera się w osobnej karcie.',
  offline: 'Serwer jest offline — mapa wróci razem z nim.',
  sleeping:
    'Serwer śpi. Wejdź na niego, a się obudzi — mapa załaduje się tutaj sama. Możesz też otworzyć ją osobno.',
  pending: 'Sprawdzam stan serwera…',
  timeout: 'Podgląd nie wczytał się w tym miejscu. Otwórz mapę w nowej karcie.',
}

function MapFallback({
  reason,
  reachable,
  mapUrl,
}: {
  reason: Exclude<FallbackReason, 'none'>
  reachable: boolean
  mapUrl: string
}) {
  return (
    <div className="pixel-grid-bg absolute inset-0 grid place-items-center bg-surface-2 p-6">
      <div className="flex max-w-xs flex-col items-center gap-4 text-center">
        <span className="field grid h-14 w-14 place-items-center text-brand">
          {reason === 'pending' ? (
            <span className="h-6 w-6 animate-spin border-2 border-line border-t-brand" />
          ) : (
            <MapIcon className="h-7 w-7" />
          )}
        </span>
        <p className="text-pretty text-sm text-fg-muted">{MESSAGE[reason]}</p>
        {reason !== 'pending' && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-bevel btn-panel inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
          >
            <ExternalIcon className="h-4 w-4" />
            Otwórz mapę{reachable ? '' : ' mimo to'}
          </a>
        )}
      </div>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-surface-2">
      <div className="flex flex-col items-center gap-3 text-fg-subtle">
        <span className="h-8 w-8 animate-spin border-2 border-line border-t-brand" />
        <span className="text-xs font-semibold uppercase tracking-wider">Wczytuję mapę…</span>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { fetchServerStatus, type ServerSnapshot } from './mcstatus'

const REQUEST_TIMEOUT_MS = 8000

export type StatusPhase = 'loading' | 'ready' | 'error'

export interface ServerStatusState {
  /** Ostatni udany odczyt (online lub offline). `null` dopóki nic nie wróciło. */
  snapshot: ServerSnapshot | null
  phase: StatusPhase
  /** Komunikat ostatniego błędu sieci/HTTP (gdy `phase === 'error'`). */
  error: string | null
  /** Timestamp ostatniego udanego odczytu. */
  updatedAt: number | null
  /** Wymuś natychmiastowe odświeżenie. */
  refresh: () => void
}

/**
 * Odpytuje API statusu co `config.statusPollSeconds` sekund.
 * Wstrzymuje odpytywanie gdy karta jest w tle i odświeża po powrocie.
 * Zachowuje ostatni poprawny odczyt, gdy kolejne żądanie zawiedzie.
 */
export function useServerStatus(): ServerStatusState {
  const [snapshot, setSnapshot] = useState<ServerSnapshot | null>(null)
  const [phase, setPhase] = useState<StatusPhase>('loading')
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const load = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)])

    try {
      const next = await fetchServerStatus(config, signal)
      if (!mountedRef.current || controller.signal.aborted) return
      setSnapshot(next)
      setUpdatedAt(next.retrievedAt || Date.now())
      setPhase('ready')
      setError(null)
    } catch (err) {
      if (!mountedRef.current || controller.signal.aborted) return
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać statusu')
    }
  }, [])

  const schedule = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (typeof document !== 'undefined' && document.hidden) return
    timerRef.current = setTimeout(
      function tick() {
        void load()
        timerRef.current = setTimeout(tick, config.statusPollSeconds * 1000)
      },
      config.statusPollSeconds * 1000,
    )
  }, [load])

  const refresh = useCallback(() => {
    void load()
    schedule()
  }, [load, schedule])

  useEffect(() => {
    mountedRef.current = true
    void load()
    schedule()

    const onVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current)
      } else {
        void load()
        schedule()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mountedRef.current = false
      document.removeEventListener('visibilitychange', onVisibility)
      if (timerRef.current) clearTimeout(timerRef.current)
      abortRef.current?.abort()
    }
  }, [load, schedule])

  return { snapshot, phase, error, updatedAt, refresh }
}

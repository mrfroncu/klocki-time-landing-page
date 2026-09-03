/**
 * Klient publicznego API statusu serwera Minecraft (domyślnie api.mcstatus.io v2).
 * Serwer Klocki Time nie wystawia protokołu Query ani listy modów — pobieramy
 * tylko to, co jest dostępne przez zwykły ping: online, gracze, wersja, MOTD, ikona.
 */

import type { AppConfig } from '../config'
import { connectAddress } from '../config'

/** Surowa odpowiedź api.mcstatus.io (tylko używane pola). */
interface RawStatus {
  online: boolean
  version?: { name_clean?: string; name_raw?: string } | null
  players?: { online?: number; max?: number } | null
  motd?: { clean?: string; html?: string; raw?: string } | null
  icon?: string | null
  retrieved_at?: number
}

/** Znormalizowany, „bezpieczny" stan serwera dla UI. */
export interface ServerSnapshot {
  online: boolean
  playersOnline: number | null
  playersMax: number | null
  version: string | null
  motd: string | null
  motdHtml: string | null
  /** data-URI ikony serwera (favicon MOTD), jeśli dostępna. */
  icon: string | null
  retrievedAt: number
}

const cleanMotd = (value: string | undefined | null): string | null => {
  if (!value) return null
  const normalized = value.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim()
  return normalized.length > 0 ? normalized : null
}

export function statusEndpoint(config: AppConfig): string {
  const base = config.mcStatusApiBase.replace(/\/+$/, '')
  return `${base}/${connectAddress(config)}`
}

/**
 * Pobiera i normalizuje status serwera. Rzuca wyjątek tylko przy błędzie
 * sieci / HTTP / przekroczeniu czasu — stan „offline" jest poprawnym wynikiem.
 */
export async function fetchServerStatus(
  config: AppConfig,
  signal?: AbortSignal,
): Promise<ServerSnapshot> {
  const res = await fetch(statusEndpoint(config), {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`API statusu odpowiedziało ${res.status}`)
  }

  const data = (await res.json()) as RawStatus

  if (!data.online) {
    return {
      online: false,
      playersOnline: null,
      playersMax: null,
      version: null,
      motd: null,
      motdHtml: null,
      icon: null,
      retrievedAt: data.retrieved_at ?? Date.now(),
    }
  }

  return {
    online: true,
    playersOnline: typeof data.players?.online === 'number' ? data.players.online : null,
    playersMax: typeof data.players?.max === 'number' ? data.players.max : null,
    version: data.version?.name_clean?.trim() || data.version?.name_raw?.trim() || null,
    motd: cleanMotd(data.motd?.clean ?? data.motd?.raw),
    motdHtml: data.motd?.html ?? null,
    icon: typeof data.icon === 'string' && data.icon.startsWith('data:') ? data.icon : null,
    retrievedAt: data.retrieved_at ?? Date.now(),
  }
}

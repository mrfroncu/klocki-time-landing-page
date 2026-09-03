import { config } from '../config'
import type { ServerStatusState } from './useServerStatus'

export type StatusTone = 'online' | 'sleeping' | 'offline' | 'pending' | 'error'

/**
 * Hosting Alleria.pl usypia serwer przy bezczynności — ping wciąż odpowiada
 * „online", ale realnie trzeba go obudzić wejściem. Rozpoznajemy to po MOTD.
 */
const SLEEP_MOTD = /\b(śpi|uśpion|sleep|bezczynno|hibern|is sleeping)\b/i

export interface DerivedStatus {
  tone: StatusTone
  /** Krótka etykieta stanu, np. „Online". */
  label: string
  playersOnline: number | null
  playersMax: number | null
  /** Wersja Minecraft — z serwera, a gdy brak, z `.env`. */
  version: string
  /** MOTD serwera (jedna linia) lub `null`. */
  motd: string | null
  /** Ikona serwera (data-URI) lub `null`. */
  icon: string | null
  /** Czy mamy jakiekolwiek świeże dane. */
  hasData: boolean
}

/** Sprowadza surowy stan hooka do modelu widoku używanego w UI. */
export function deriveStatus({ snapshot, phase }: ServerStatusState): DerivedStatus {
  const version = snapshot?.version ?? config.mcVersionFallback
  const icon = snapshot?.icon ?? null
  const motd = snapshot?.motd ?? null

  if (phase === 'loading' && !snapshot) {
    return {
      tone: 'pending',
      label: 'Sprawdzanie…',
      playersOnline: null,
      playersMax: null,
      version,
      motd,
      icon,
      hasData: false,
    }
  }

  if (phase === 'error' && !snapshot) {
    return {
      tone: 'error',
      label: 'Status niedostępny',
      playersOnline: null,
      playersMax: null,
      version,
      motd,
      icon,
      hasData: false,
    }
  }

  if (snapshot?.online) {
    const sleeping = motd ? SLEEP_MOTD.test(motd) : false
    return {
      tone: sleeping ? 'sleeping' : 'online',
      label: sleeping ? 'Uśpiony' : 'Online',
      playersOnline: snapshot.playersOnline,
      playersMax: snapshot.playersMax,
      version,
      motd,
      icon,
      hasData: true,
    }
  }

  return {
    tone: 'offline',
    label: 'Offline',
    playersOnline: null,
    playersMax: null,
    version,
    motd,
    icon,
    hasData: Boolean(snapshot),
  }
}

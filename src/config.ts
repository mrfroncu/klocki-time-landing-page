/**
 * Konfiguracja aplikacji.
 *
 * Źródłem prawdy jest plik `.env` (zmienne z prefiksem `VITE_`, wstrzykiwane
 * podczas budowania). Dodatkowo przy starcie aplikacja próbuje pobrać
 * `/config.json` leżący obok `index.html` i nałożyć jego wartości na te z `.env`
 * — dzięki temu linki można zmienić na serwerze bez przebudowania paczki.
 */

export interface AppConfig {
  /** Nazwa serwera pokazywana w nagłówku i stopce. */
  serverName: string
  /** Adres hosta (bez portu), np. `klocki-time.alleria.pl`. */
  serverAddress: string
  /**
   * Port serwera Minecraft — `null` gdy serwer ma rekord SRV (np. LazyMC za
   * SRV, jak `klocki-time.alleria.pl`): wtedy zarówno gracz, jak i zapytanie
   * o status używają samej domeny, a przekierowanie na właściwy port
   * (i ewentualne obudzenie serwera) załatwia SRV / proxy. Ustaw tylko gdy
   * serwer NIE ma SRV i słucha na niestandardowym porcie.
   */
  serverPort: number | null
  /** Krótki podtytuł w sekcji hero. */
  serverTagline: string
  /** Nazwa modpacka (serwer nie wystawia jej przez ping). */
  modpackName: string
  /** Wersja modpacka (opcjonalna). */
  modpackVersion: string
  /** Wersja Minecraft używana, gdy API statusu nie odpowie. */
  mcVersionFallback: string
  /** Zaproszenie na Discord — „dołącz po paczkę". */
  discordUrl: string
  /**
   * `"local"` — mapę serwuje BlueMap (CLI, tryb -w) uruchomiony w tym samym
   * kontenerze co strona, wystawiony pod `/map` (nginx proxy do :8100).
   * Działa niezależnie od tego, czy serwer MC śpi — BlueMap czyta gotowe
   * kafelki z bazy SQL, nie z żyjącego serwera. `mapUrl` jest wtedy ignorowany.
   * `"remote"` — stare zachowanie: iframe do zewnętrznego `mapUrl`, dostępny
   * tylko gdy `status.tone === 'online'`.
   */
  mapMode: 'local' | 'remote'
  /** Adres mapy świata w trybie "remote" (iframe + „pełny ekran"). */
  mapUrl: string
  /** Strona ze statusem serwerów (otwierana w nowej karcie). */
  statusUrl: string
  /** Monitoring usług (otwierany w nowej karcie). */
  monitorUrl: string
  /** Panel zarządzania (otwierany w nowej karcie). */
  managementUrl: string
  /** Bazowy adres API statusu Minecraft. */
  mcStatusApiBase: string
  /** Co ile sekund odświeżać status. */
  statusPollSeconds: number
  /** Czy osadzać mapę w iframe (gdy `false` — sama karta z linkiem). */
  mapEmbed: boolean
}

const str = (value: string | undefined, fallback: string): string => {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

const int = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

/** Jak {@link int}, ale puste/niepoprawne wejście daje `null` zamiast liczby. */
const intOrNull = (value: string | undefined): number | null => {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const parsed = Number.parseInt(trimmed, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const mapMode = (value: string | undefined): 'local' | 'remote' =>
  value?.trim().toLowerCase() === 'local' ? 'local' : 'remote'

const bool = (value: string | undefined, fallback: boolean): boolean => {
  const v = value?.trim().toLowerCase()
  if (v === 'true' || v === '1' || v === 'yes') return true
  if (v === 'false' || v === '0' || v === 'no') return false
  return fallback
}

const env = import.meta.env

const baseConfig: AppConfig = {
  serverName: str(env.VITE_SERVER_NAME, 'Klocki Time'),
  serverAddress: str(env.VITE_SERVER_ADDRESS, 'klocki-time.alleria.pl'),
  serverPort: intOrNull(env.VITE_SERVER_PORT),
  serverTagline: str(env.VITE_SERVER_TAGLINE, 'Prywatny serwer Minecraft dla znajomych.'),
  modpackName: str(env.VITE_MODPACK_NAME, 'Klocki Time Pack'),
  modpackVersion: str(env.VITE_MODPACK_VERSION, ''),
  mcVersionFallback: str(env.VITE_MC_VERSION_FALLBACK, '1.20.1'),
  discordUrl: str(env.VITE_DISCORD_URL, 'https://discord.gg/NyzNQWrBZW'),
  mapMode: mapMode(env.VITE_MAP_MODE),
  mapUrl: str(env.VITE_MAP_URL, 'https://kt-mapa.alleria.pl/'),
  statusUrl: str(env.VITE_STATUS_URL, 'https://status.alleria.pl/'),
  monitorUrl: str(env.VITE_MONITOR_URL, 'https://monitor.alleria.pl/klocki-time'),
  managementUrl: str(env.VITE_MANAGEMENT_URL, 'https://kt-management.alleria.pl/'),
  mcStatusApiBase: str(env.VITE_MCSTATUS_API_BASE, 'https://api.mcstatus.io/v2/status/java'),
  statusPollSeconds: Math.max(15, int(env.VITE_STATUS_POLL_SECONDS, 60)),
  mapEmbed: bool(env.VITE_MAP_EMBED, true),
}

/** Bieżąca konfiguracja. Nadpisywana raz przez {@link loadRuntimeConfig}. */
export let config: AppConfig = baseConfig

/**
 * Pełny adres do wpisania w kliencie Minecraft — i ten sam adres jest używany
 * do zapytania o status. Bez `serverPort` zostaje sama domena, dzięki czemu
 * zarówno klient MC, jak i api.mcstatus.io same rozwiążą rekord SRV (jeśli
 * jest) zamiast łączyć się na sztywno podanym porcie.
 */
export const connectAddress = (c: AppConfig = config): string =>
  c.serverPort ? `${c.serverAddress}:${c.serverPort}` : c.serverAddress

/**
 * Adres mapy do faktycznego użycia (iframe / „pełny ekran"), z
 * uwzględnieniem trybu. W "local" to zawsze `/map/` na tym samym originie
 * (ten sam kontener) — bez problemów z X-Frame-Options i bez zależności od
 * tego, czy serwer MC akurat żyje.
 */
export const resolvedMapUrl = (c: AppConfig = config): string =>
  c.mapMode === 'local' ? '/map/' : c.mapUrl

/**
 * Pobiera opcjonalny `/config.json` i nakłada go na konfigurację z `.env`.
 * Brak pliku (404) lub błędny JSON są ignorowane.
 */
export async function loadRuntimeConfig(): Promise<AppConfig> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}config.json`, { cache: 'no-store' })
    if (!res.ok) return config
    const overrides = (await res.json()) as Partial<AppConfig>
    if (overrides && typeof overrides === 'object') {
      config = { ...baseConfig, ...sanitizeOverrides(overrides) }
    }
  } catch {
    /* brak pliku lub niepoprawny JSON — używamy wartości z .env */
  }
  return config
}

const KNOWN_KEYS = Object.keys(baseConfig) as (keyof AppConfig)[]

/** Zostawia tylko znane, niepuste pola z runtime override. */
function sanitizeOverrides(input: Partial<AppConfig>): Partial<AppConfig> {
  const out: Partial<AppConfig> = {}
  for (const key of KNOWN_KEYS) {
    const value = input[key]
    if (value === null || value === undefined || value === '') continue
    // @ts-expect-error — klucz pochodzi z AppConfig, typ wartości jest zgodny
    out[key] = value
  }
  return out
}

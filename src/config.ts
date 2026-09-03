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
  /** Port serwera Minecraft. */
  serverPort: number
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
  /** Adres mapy świata (iframe + „pełny ekran"). */
  mapUrl: string
  /** Strona ze statusem serwerów (otwierana w nowej karcie). */
  statusUrl: string
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
  serverPort: int(env.VITE_SERVER_PORT, 25565),
  serverTagline: str(env.VITE_SERVER_TAGLINE, 'Prywatny serwer Minecraft dla znajomych.'),
  modpackName: str(env.VITE_MODPACK_NAME, 'Klocki Time Pack'),
  modpackVersion: str(env.VITE_MODPACK_VERSION, ''),
  mcVersionFallback: str(env.VITE_MC_VERSION_FALLBACK, '1.20.1'),
  discordUrl: str(env.VITE_DISCORD_URL, 'https://discord.gg/NyzNQWrBZW'),
  mapUrl: str(env.VITE_MAP_URL, 'https://kt-mapa.alleria.pl/'),
  statusUrl: str(env.VITE_STATUS_URL, 'https://status.alleria.pl/'),
  managementUrl: str(env.VITE_MANAGEMENT_URL, 'https://kt-management.alleria.pl/'),
  mcStatusApiBase: str(env.VITE_MCSTATUS_API_BASE, 'https://api.mcstatus.io/v2/status/java'),
  statusPollSeconds: Math.max(15, int(env.VITE_STATUS_POLL_SECONDS, 60)),
  mapEmbed: bool(env.VITE_MAP_EMBED, true),
}

/** Bieżąca konfiguracja. Nadpisywana raz przez {@link loadRuntimeConfig}. */
export let config: AppConfig = baseConfig

/** Pełny adres do wpisania w kliencie Minecraft (host lub host:port). */
export const connectAddress = (c: AppConfig = config): string =>
  c.serverPort && c.serverPort !== 25565 ? `${c.serverAddress}:${c.serverPort}` : c.serverAddress

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

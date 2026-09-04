/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_NAME?: string
  readonly VITE_SERVER_ADDRESS?: string
  readonly VITE_SERVER_PORT?: string
  readonly VITE_SERVER_TAGLINE?: string
  readonly VITE_MODPACK_NAME?: string
  readonly VITE_MODPACK_VERSION?: string
  readonly VITE_MC_VERSION_FALLBACK?: string
  readonly VITE_DISCORD_URL?: string
  readonly VITE_MAP_MODE?: string
  readonly VITE_MAP_URL?: string
  readonly VITE_STATUS_URL?: string
  readonly VITE_MONITOR_URL?: string
  readonly VITE_MANAGEMENT_URL?: string
  readonly VITE_MCSTATUS_API_BASE?: string
  readonly VITE_STATUS_POLL_SECONDS?: string
  readonly VITE_MAP_EMBED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

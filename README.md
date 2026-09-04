# Klocki Time — landing page

Landing page for the **Klocki Time** Minecraft server: live status, player
count, game version, embedded world map, one-click address copy, quick links
(Discord, status page, management panel).

Fully static build — `npm run build` outputs plain files in `dist/`, served
by whatever's in front of it. Server status is fetched client-side from the
public [`api.mcstatus.io`](https://mcstatus.io) API, no backend of its own.

## Stack

Vite 8, React 19, TypeScript, Tailwind CSS 4, Motion for animation.
Self-hosted Inter + Sora (woff2, no CDN).

## Requirements

- Node **20.19+ / 22+** (22 LTS recommended), npm
- Project path can't contain `#`. Vite's dev server can't resolve modules
  through it — `npm run build` is unaffected, `npm run dev` isn't. If the
  parent dir is something like `#VisualStudio-Github`, rename it
  (`_VisualStudio-Github`) or move the project.

## Quick start

```bash
npm install
cp .env.example .env      # fill in Discord/modpack/links
npm run dev                # http://localhost:5173
```

## Build & preview

```bash
npm run build              # -> dist/
npm run preview            # serve the production build locally (:4173)
npm run lint                # tsc --noEmit only
```

## Configuration

Everything goes through `.env` (`VITE_` prefix, read at **build time** — a
value change needs a rebuild). Full list with comments in
[`.env.example`](.env.example). Key ones:

| Variable | Purpose |
| --- | --- |
| `VITE_SERVER_NAME` | Server display name |
| `VITE_SERVER_ADDRESS` | Address copied on click (host, no port) |
| `VITE_SERVER_PORT` | Leave empty if the domain has an SRV record (see below) |
| `VITE_MODPACK_NAME` / `VITE_MODPACK_VERSION` | Ping doesn't expose this, so it's hardcoded |
| `VITE_MC_VERSION_FALLBACK` | Version shown when the status API is unreachable |
| `VITE_DISCORD_URL` | "Get the modpack" CTA target |
| `VITE_MAP_URL` | Map source (iframe + fullscreen link) |
| `VITE_STATUS_URL` | "Service status" link (new tab) |
| `VITE_MANAGEMENT_URL` | "Management panel" link (new tab) |
| `VITE_MCSTATUS_API_BASE` | Status API base, optional |
| `VITE_STATUS_POLL_SECONDS` | Poll interval, min 15, optional |
| `VITE_MAP_EMBED` | `false` disables the iframe, shows a link-out card instead |

### Why `VITE_SERVER_PORT` stays empty (SRV / LazyMC)

`klocki-time.alleria.pl` has an SRV record pointing at
`network5.alleria.pl:60320`, where **LazyMC** sits — it sleeps the backend on
idle, wakes it on the first join, and answers pings itself in the meantime
with a "server sleeping" MOTD. It then proxies to the real server on a
different internal port; the client never connects to it directly.

Leaving `VITE_SERVER_PORT` empty lets both the Minecraft client and the
`api.mcstatus.io` query resolve the SRV record themselves. Hardcoding any
port (25565, LazyMC's port, the backend's real port) skips SRV resolution —
players land in the wrong place and the status check usually reads as
offline. `src/lib/derive.ts` distinguishes "sleeping" from "offline" by MOTD
content, which only works if the query actually reaches LazyMC.

`VITE_SERVER_ADDRESS` also has to be **publicly reachable** —
`api.mcstatus.io` queries it from the internet, so a private address (a
Tailscale `100.x.x.x`, say) always reads offline regardless of actual state.

### Overriding config without a rebuild

On load, the app fetches `/config.json` and merges it over the `.env`
values. Drop a `config.json` next to `index.html` (template:
[`public/config.example.json`](public/config.example.json)) and reload —
no rebuild needed.

## Map embedding

Controlled by `VITE_MAP_MODE`, two modes:

### `remote` (default) — iframe to an external host

The `<iframe>` only renders **while the server is online** — offline or
asleep, the panel falls back to a placeholder with a link that opens the map
in a new tab. This is because the map lives on the same box as the game
server and sleeps with it.

For the embed to actually render, the map host (`VITE_MAP_URL`) can't send a
frame-blocking header. If it responds with `X-Frame-Options: SAMEORIGIN` (or
similar):

- add a Cloudflare **Response Header Transform Rule** on the map host: strip
  `X-Frame-Options`, set
  `Content-Security-Policy: frame-ancestors 'self' https://klocki-time.alleria.pl`;
- or set `VITE_MAP_EMBED=false` and skip the iframe entirely.

### `local` — BlueMap served from this same container, always up

Instead of framing an external host, **BlueMap CLI** runs headless
(`-w`, webserver-only mode) as a second process inside this container,
reading pre-rendered tiles straight out of the SQL database the BlueMap
plugin on the MC server writes to. Result: the map stays up regardless of
whether the game server is asleep or offline, since it depends on what's
already been rendered into the database, not on a live server connection.

nginx exposes it at `/map`, proxying to the BlueMap process on
`127.0.0.1:8100` inside the container — so `https://klocki-time.alleria.pl/map`
is a full standalone BlueMap app (no site chrome), and the map panel on the
homepage frames it same-origin, sidestepping `X-Frame-Options` entirely.

**On the Minecraft server side** (`config/bluemap/`, via panel or SFTP):

1. `storages/sql.conf` — `storage-type: sql`, `connection-url` pointing at
   the same MySQL/MariaDB instance as below
   (`jdbc:mysql://host:port/db?permitMysqlScheme`).
2. every `maps/<world>.conf` — `storage: "sql"` instead of `"file"`.
3. `webserver.conf` — `enabled: false` (the landing-page container serves
   the webapp now, not the MC server).
4. `core.conf` — `accept-download: true` (Mojang EULA, required by BlueMap).
5. in-game console: `/bluemap reload`, then `/bluemap force-update <map>`
   per map — one full render into the database.

**On this repo's side** — `.env` (`BLUEMAP_*`, see
[`.env.example`](.env.example)): `BLUEMAP_ENABLED=true`,
`BLUEMAP_DB_HOST/PORT/NAME/USER/PASSWORD` (matching `sql.conf` on the MC
server), and `VITE_MAP_MODE=local`. `BLUEMAP_*` are **not** baked into the
image — `docker-entrypoint.sh` generates `sql.conf` from them at container
start, so rotating a password is a restart, not a rebuild.

⚠️ The BlueMap CLI jar baked into the image (`BLUEMAP_CLI_URL` build-arg)
has to match the plugin's release line on the MC server, or the SQL data
format won't line up. Defaults to `v5.12` (Forge 1.20.1). For Fabric 1.20.1
(BlueMap 5.3):
`--build-arg BLUEMAP_CLI_URL=https://github.com/BlueMap-Minecraft/BlueMap/releases/download/v5.3/bluemap-5.3-cli.jar`
(or `BLUEMAP_CLI_URL` in `.env`, since compose reads it as a build-arg too).

## Deploy

### Docker

Required if you're running `VITE_MAP_MODE=local` — see below. `docker
compose` picks up `.env` from the same directory automatically:

```bash
# next to docker-compose.yml, Dockerfile, nginx.conf and .env
docker compose up -d --build
# -> http://<host>:8080
```

`.env` is gitignored, so it won't show up from a `git clone`/`pull` — copy it
to the target host by hand, next to `docker-compose.yml`. Without it, the
build falls back to the defaults hardcoded in `docker-compose.yml`
(`klocki-time.alleria.pl`, placeholder Discord/status links, etc).

Host port is `HOST_PORT` (in `.env`, or inline:
`HOST_PORT=9000 docker compose up -d --build`). Any `.env` change needs
`--build` — `VITE_*` values get baked in during `docker build`, same as a
plain `npm run build`.

Without compose — plain `docker build`/`run` (build-args for `VITE_*` /
`BLUEMAP_CLI_URL` per [`Dockerfile`](Dockerfile); `BLUEMAP_*` secrets go in
as `-e` on `docker run`, not `--build-arg` — the entrypoint reads them at
container start, not at build time):

```bash
docker build -t klocki-landing --build-arg VITE_SERVER_ADDRESS=klocki-time.alleria.pl .
docker run -d -p 8080:80 --name klocki-landing \
  -e BLUEMAP_ENABLED=true -e BLUEMAP_DB_HOST=... -e BLUEMAP_DB_PASSWORD=... \
  klocki-landing
```

### Static nginx — deprecated

Only viable with `VITE_MAP_MODE=remote`. `local` mode needs the BlueMap CLI
process the Dockerfile bundles (Java runtime, JDBC driver, `nginx.conf`
proxying to `127.0.0.1:8100`, all wired up by `docker-entrypoint.sh`) — a
bare static file server has nothing to proxy to, so `/map`, `/maps` and
`/settings.json` just fail. If you're on `remote` mode there's no such
dependency: copy `dist/` to any static host and serve it as an SPA (`try_files
$uri $uri/ /index.html`, long-cache `/assets/` and `/fonts/`) — nothing
BlueMap-specific to configure.

## Structure

```
docker-entrypoint.sh    boots nginx + (optionally) BlueMap CLI in one container
bluemap/config/         BlueMap CLI templates (webserver-only, storage: sql)
src/
  config.ts              reads .env, merges /config.json over it
  lib/
    mcstatus.ts           status API client + normalization
    useServerStatus.ts    polling (paused while tab is backgrounded)
    derive.ts             view model: online / sleeping / offline / error
  hooks/useTheme.ts       light / dark / system
  components/
    ServerCard.tsx        right column, top: name, status, players, MOTD, address
    MapPanel.tsx           left column: full-height map + header (fullscreen), sleep/offline fallback
    ActionsCard.tsx        right column, bottom: version/modpack, Discord CTA, links, footer
    Background.tsx         pixel grid + particle background
  App.tsx                  single-screen layout on desktop, stacked on mobile
public/
  fonts/                 self-hosted woff2 (Inter, Sora)
  config.example.json    runtime-override template
```

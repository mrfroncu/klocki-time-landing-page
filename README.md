# Klocki Time — landing page

Nowoczesna strona-wizytówka serwera Minecraft **Klocki Time**: status na żywo,
liczba graczy, wersja gry, osadzona mapa świata, kopiowanie adresu jednym
kliknięciem i szybkie linki (Discord, status, panel zarządzania).

Strona jest w pełni **statyczna** — po zbudowaniu to zwykłe pliki w `dist/`,
które serwuje dowolny hosting (nginx, Cloudflare Pages, Netlify, kontener…).
Status serwera pobierany jest w przeglądarce z publicznego API
[`api.mcstatus.io`](https://mcstatus.io).

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · Motion (animacje) ·
self-hosted fonty Inter + Sora.

## Wymagania

- Node.js **20.19+ / 22+** (zalecane 22 LTS) i npm
- ⚠️ **Ścieżka projektu nie może zawierać znaku `#`.** Vite (dev server) nie
  potrafi w takiej ścieżce serwować modułów. Produkcyjny `npm run build`
  działa, ale `npm run dev` — nie. Jeśli katalog nadrzędny to np.
  `#VisualStudio-Github`, przenieś projekt gdzie indziej albo zmień nazwę
  katalogu (np. na `_VisualStudio-Github`).

## Szybki start

```bash
npm install
cp .env.example .env      # uzupełnij wartości (Discord, modpack, linki…)
npm run dev               # http://localhost:5173
```

## Budowanie i podgląd

```bash
npm run build             # -> dist/
npm run preview           # lokalny podgląd produkcyjnego builda (:4173)
npm run lint              # sam type-check (tsc --noEmit)
```

## Konfiguracja

Wszystkie ustawienia idą przez `.env` (prefiks `VITE_`, wczytywane **w czasie
budowania** — po zmianie trzeba przebudować). Pełna lista z opisami jest
w [`.env.example`](.env.example). Najważniejsze:

| Zmienna | Znaczenie |
| --- | --- |
| `VITE_SERVER_NAME` | Nazwa serwera |
| `VITE_SERVER_ADDRESS` | Adres kopiowany po kliknięciu (host bez portu) |
| `VITE_SERVER_PORT` | Port; pomiń jeśli `25565` |
| `VITE_MODPACK_NAME` / `VITE_MODPACK_VERSION` | Modpack (serwer nie podaje tego przez ping) |
| `VITE_MC_VERSION_FALLBACK` | Wersja MC gdy API nie odpowie |
| `VITE_DISCORD_URL` | Przycisk „Dołącz po paczkę modów" |
| `VITE_MAP_URL` | Mapa (iframe + „pełny ekran") |
| `VITE_STATUS_URL` | „Status serwerów" (nowa karta) |
| `VITE_MANAGEMENT_URL` | „Panel zarządzania" (nowa karta) |
| `VITE_MCSTATUS_API_BASE` | Baza API statusu (opc.) |
| `VITE_STATUS_POLL_SECONDS` | Odświeżanie statusu, min. 15 (opc.) |
| `VITE_MAP_EMBED` | `false` = nie osadzaj mapy, pokaż samą kartę z linkiem |

### Zmiana linków bez przebudowania (opcjonalnie)

Aplikacja przy starcie próbuje pobrać `/config.json` z katalogu strony i nakłada
jego wartości na te z `.env`. Wystarczy położyć obok `index.html` plik
`config.json` (wzór: [`public/config.example.json`](public/config.example.json))
i odświeżyć stronę — bez ponownego builda.

## Osadzanie mapy (ważne)

Mapa jest pokazywana w `<iframe>` **tylko gdy serwer jest online** (gdy jest
uśpiony/offline strona pokazuje zgrabny placeholder z przyciskiem otwarcia mapy
w nowej karcie).

Żeby osadzenie w ogóle zadziałało, host mapy (`kt-mapa.alleria.pl`) nie może
blokować ramek. Obecnie w odpowiedziach pojawia się `X-Frame-Options: SAMEORIGIN`.
Jeśli mapa nie chce się wyświetlać wewnątrz strony:

- w Cloudflare dla `kt-mapa.alleria.pl` dodaj **Response Header Transform Rule**:
  usuń `X-Frame-Options` i ustaw
  `Content-Security-Policy: frame-ancestors 'self' https://klocki-time.alleria.pl`,
- **albo** ustaw `VITE_MAP_EMBED=false` — sekcja mapy stanie się kartą z
  przyciskiem „Otwórz mapę".

## Deploy

### nginx (statycznie)

Skopiuj zawartość `dist/` na serwer i wskaż na nią `root`:

```nginx
server {
    listen 443 ssl http2;
    server_name klocki-time.alleria.pl;

    root /var/www/klocki-time;
    index index.html;

    # SPA — jedna strona, brak routingu; wystarczy zwykłe serwowanie plików
    location / {
        try_files $uri $uri/ /index.html;
    }

    # długi cache dla zahashowanych assetów i fontów
    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }
    location /fonts/  { expires 1y; add_header Cache-Control "public, immutable"; }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;
}
```

Aktualizacja treści bez builda: podmień `/var/www/klocki-time/config.json`.

### Docker

```bash
docker build -t klocki-landing .
docker run -d -p 8080:80 --name klocki-landing klocki-landing
# -> http://localhost:8080
```

Obraz to nginx serwujący `dist/` (build wykonuje się w wieloetapowym
`Dockerfile`). Zmienne `.env` są wtedy zaszywane w trakcie `docker build` —
przekaż je przez `--build-arg` lub plik `.env` obecny w kontekście budowania.

## Struktura

```
src/
  config.ts            odczyt .env + merge z /config.json
  lib/
    mcstatus.ts         klient API statusu + normalizacja
    useServerStatus.ts  polling (pauza gdy karta w tle)
    derive.ts           model widoku: online / uśpiony / offline / błąd
  hooks/useTheme.ts     motyw light / dark / system
  components/           Hero, MapSection, ActionGrid, Navbar, Footer, …
public/
  fonts/               self-hosted woff2 (Inter, Sora)
  config.example.json  wzór runtime-override
```

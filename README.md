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
| `VITE_SERVER_PORT` | Zostaw puste, gdy domena ma rekord SRV (patrz niżej) |
| `VITE_MODPACK_NAME` / `VITE_MODPACK_VERSION` | Modpack (serwer nie podaje tego przez ping) |
| `VITE_MC_VERSION_FALLBACK` | Wersja MC gdy API nie odpowie |
| `VITE_DISCORD_URL` | Przycisk „Dołącz po paczkę modów" |
| `VITE_MAP_URL` | Mapa (iframe + „pełny ekran") |
| `VITE_STATUS_URL` | „Status serwerów" (nowa karta) |
| `VITE_MANAGEMENT_URL` | „Panel zarządzania" (nowa karta) |
| `VITE_MCSTATUS_API_BASE` | Baza API statusu (opc.) |
| `VITE_STATUS_POLL_SECONDS` | Odświeżanie statusu, min. 15 (opc.) |
| `VITE_MAP_EMBED` | `false` = nie osadzaj mapy, pokaż samą kartę z linkiem |

### SRV / LazyMC — dlaczego port zostaje pusty

`klocki-time.alleria.pl` ma rekord SRV: `network5.alleria.pl:60320`, gdzie stoi
**LazyMC** (usypia backend przy bezczynności, budzi po wejściu gracza i przez
ten czas sam odpowiada na ping z MOTD „serwer śpi"). LazyMC przekierowuje do
właściwego serwera na innym porcie wewnętrznie — gracz nigdy się z nim nie
łączy bezpośrednio.

Dlatego `VITE_SERVER_PORT` musi być **puste**: sam adres domeny pozwala i
klientowi Minecraft, i zapytaniu do `api.mcstatus.io` samodzielnie rozwiązać
SRV. Wpisanie tam jakiegokolwiek portu (25565, port LazyMC, port backendu…)
pomija SRV — gracz łączy się w złe miejsce, a status najczęściej pokaże
offline. `src/lib/derive.ts` rozpoznaje po MOTD, że serwer śpi (a nie że jest
offline) — działa to jednak tylko wtedy, gdy zapytanie w ogóle trafi do LazyMC.

Adres w `VITE_SERVER_ADDRESS` musi też być **publicznie osiągalny** —
`api.mcstatus.io` odpytuje serwer ze swoich maszyn w internecie, więc prywatny
adres (np. Tailscale `100.x.x.x`) zawsze pokaże offline, niezależnie od tego,
czy serwer faktycznie działa.

### Zmiana linków bez przebudowania (opcjonalnie)

Aplikacja przy starcie próbuje pobrać `/config.json` z katalogu strony i nakłada
jego wartości na te z `.env`. Wystarczy położyć obok `index.html` plik
`config.json` (wzór: [`public/config.example.json`](public/config.example.json))
i odświeżyć stronę — bez ponownego builda.

## Osadzanie mapy (ważne)

Dwa tryby, `VITE_MAP_MODE`:

### `"remote"` (domyślny) — iframe do zewnętrznego hosta

Mapa pokazywana jest w `<iframe>` **tylko gdy serwer jest online** (gdy jest
uśpiony/offline strona pokazuje placeholder z przyciskiem otwarcia mapy w
nowej karcie) — bo mapa żyje na tej samej maszynie co serwer i śpi razem z nim.

Żeby osadzenie w ogóle zadziałało, host mapy (`VITE_MAP_URL`) nie może
blokować ramek. Jeśli w odpowiedziach pojawia się `X-Frame-Options: SAMEORIGIN`
albo podobne:

- w Cloudflare dla hosta mapy dodaj **Response Header Transform Rule**: usuń
  `X-Frame-Options` i ustaw
  `Content-Security-Policy: frame-ancestors 'self' https://klocki-time.alleria.pl`,
- **albo** ustaw `VITE_MAP_EMBED=false` — sekcja mapy stanie się kartą z
  przyciskiem „Otwórz mapę".

### `"local"` — BlueMap serwowany z tego samego kontenera, zawsze dostępny

Zamiast iframe'ować zewnętrzny host, **BlueMap CLI** (`-w`, tryb tylko-webserver)
działa jako drugi proces w tym samym kontenerze co strona i czyta gotowe
kafelki bezpośrednio z bazy SQL, do której renderuje plugin BlueMap na
serwerze MC. Efekt: mapa działa **cały czas**, niezależnie od tego, czy serwer
śpi czy jest offline — bo nie zależy od żyjącego serwera, tylko od tego, co już
zostało wyrenderowane do bazy.

nginx wystawia to pod `/map` (proxy do procesu BlueMapa na `127.0.0.1:8100`
wewnątrz kontenera) — czyli `https://klocki-time.alleria.pl/map` to pełna,
samodzielna aplikacja BlueMapa (bez chrome'u strony), a panel mapy na stronie
głównej ją iframe'uje z tego samego originu, więc `X-Frame-Options` przestaje
mieć znaczenie.

**Wymagane po stronie serwera Minecraft** (`config/bluemap/` w plikach
serwera, przez panel/SFTP):

1. `storages/sql.conf` — `storage-type: sql`, `connection-url` do tej samej
   bazy MySQL/MariaDB co niżej (`jdbc:mysql://host:port/baza?permitMysqlScheme`).
2. w każdym `maps/<world>.conf` — `storage: "sql"` zamiast `"file"`.
3. `webserver.conf` — `enabled: false` (serwuje teraz kontener strony, nie
   serwer MC).
4. `core.conf` — `accept-download: true` (wymóg BlueMapa, EULA Mojanga).
5. w konsoli serwera: `/bluemap reload`, potem `/bluemap force-update <mapa>`
   dla każdej mapy — jednorazowy pełny render do bazy.

**Po stronie tego repo** — zmienne w `.env` (patrz `BLUEMAP_*` w
[`.env.example`](.env.example)): `BLUEMAP_ENABLED=true`, `BLUEMAP_DB_HOST/PORT/NAME/USER/PASSWORD`
(te same co w `sql.conf` na serwerze MC), plus `VITE_MAP_MODE=local`. Te
`BLUEMAP_*` zmienne **nie trafiają do obrazu** — czytane są przy starcie
kontenera (`docker-entrypoint.sh` generuje z nich `sql.conf` dla BlueMapa),
więc zmiana hasła/hosta to tylko restart kontenera, bez rebuildu.

⚠️ Jar BlueMap CLI w obrazie (`BLUEMAP_CLI_URL` build-arg) musi być z **tego
samego wydania** co plugin na serwerze MC, inaczej format danych w bazie może
się nie zgadzać. Domyślnie `v5.12` (Forge 1.20.1). Dla Fabric 1.20.1 (BlueMap
5.3): `--build-arg BLUEMAP_CLI_URL=https://github.com/BlueMap-Minecraft/BlueMap/releases/download/v5.3/bluemap-5.3-cli.jar`
(albo `BLUEMAP_CLI_URL` w `.env`, skoro to build-arg czytany przez compose).

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

Najprościej przez `docker compose` — plik `docker-compose.yml` jest w repo i
sam wczytuje `.env` obok siebie (Compose robi to automatycznie, niezależnie od
mechanizmu `.env` w Vite — to ten sam plik, dwa razy wykorzystany):

```bash
# w katalogu z docker-compose.yml, Dockerfile, nginx.conf i .env
docker compose up -d --build
# -> http://<host>:8080
```

⚠️ `.env` jest w `.gitignore`, więc **nie przyjedzie** przez `git clone`/`pull`
ani przez samo skopiowanie repo bez ukrytych plików — skopiuj go na docelowy
host ręcznie (obok `docker-compose.yml`), inaczej build użyje wartości
domyślnych wpisanych w `docker-compose.yml` (adres `klocki-time.alleria.pl`,
placeholdery dla Discorda/statusu itd.).

Port hosta zmienisz zmienną `HOST_PORT` (też w `.env` lub jako
`HOST_PORT=9000 docker compose up -d --build`). Po zmianie `.env` trzeba
przebudować obraz (`--build`) — zmienne `VITE_*` są zaszywane w trakcie
`docker build`, tak jak przy zwykłym `npm run build`.

Bez Compose — czysty `docker build`/`run` (build-argi z [`Dockerfile`](Dockerfile)
dla `VITE_*`/`BLUEMAP_CLI_URL`; `BLUEMAP_*` z sekretami idą jako `-e` przy
`docker run`, nie `--build-arg`, bo czyta je entrypoint przy starcie, nie build):

```bash
docker build -t klocki-landing --build-arg VITE_SERVER_ADDRESS=klocki-time.alleria.pl .
docker run -d -p 8080:80 --name klocki-landing \
  -e BLUEMAP_ENABLED=true -e BLUEMAP_DB_HOST=... -e BLUEMAP_DB_PASSWORD=... \
  klocki-landing
```

## Struktura

```
docker-entrypoint.sh   startuje nginx + (opcjonalnie) BlueMap CLI w jednym kontenerze
bluemap/config/         szablony configów CLI-owego BlueMapa (webserver-only, storage: sql)
src/
  config.ts            odczyt .env + merge z /config.json
  lib/
    mcstatus.ts         klient API statusu + normalizacja
    useServerStatus.ts  polling (pauza gdy karta w tle)
    derive.ts           model widoku: online / uśpiony / offline / błąd
  hooks/useTheme.ts     motyw light / dark / system
  components/
    ServerCard.tsx      prawa kolumna, góra: nazwa, status, gracze, MOTD, adres (kopiowanie)
    MapPanel.tsx        lewa kolumna: mapa na całą wysokość + HUD (pełny ekran), fallback gdy serwer śpi
    ActionsCard.tsx     prawa kolumna, dół: wersja/modpack, Discord (jedyne CTA), linki, stopka
    Background.tsx      kratka pikseli + drobne cząsteczki w tle
  App.tsx               układ: jeden ekran bez scrollowania (desktop), pion na mobile
public/
  fonts/               self-hosted woff2 (Inter, Sora)
  config.example.json  wzór runtime-override
```

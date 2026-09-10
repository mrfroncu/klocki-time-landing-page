#!/bin/bash
# Uruchamia w JEDNYM kontenerze: nginx (strona) + opcjonalnie BlueMap CLI
# jako webserver mapy (czyta kafelki z SQL, niezależnie od stanu serwera MC).
# Sterowanie: BLUEMAP_ENABLED=true/false (patrz .env.example).
# Bash (nie ash/dash z alpine) — potrzebny `wait -n`, żeby wykryć śmierć
# któregokolwiek z dwóch procesów i zamknąć kontener zamiast go zombie'ować.
set -eu

BLUEMAP_ENABLED="${BLUEMAP_ENABLED:-false}"
BLUEMAP_DIR=/opt/bluemap
declare -a PIDS=()

term_handler() {
  echo "[entrypoint] Zatrzymuję…"
  for pid in "${PIDS[@]:-}"; do
    [ -n "$pid" ] && kill "$pid" 2>/dev/null || true
  done
  wait || true
  exit 0
}
trap term_handler TERM INT

# Ustawienia bazy mogą przyjść z panelu zamiast z .env tego hosta. Idą po
# HTTPS, serwer do serwera, na uwierzytelnione żądanie - nigdy do przeglądarki.
# Bez tokenu (albo gdy panel nie odpowiada) zostaje to, co jest w środowisku.
BLUEMAP_CONFIG_URL="${BLUEMAP_CONFIG_URL:-}"
BLUEMAP_CONFIG_TOKEN="${BLUEMAP_CONFIG_TOKEN:-}"
if [ -n "$BLUEMAP_CONFIG_URL" ] && [ -n "$BLUEMAP_CONFIG_TOKEN" ]; then
  echo "[entrypoint] BlueMap: pobieram ustawienia z panelu…"
  if remote="$(curl -fsS --max-time 15 -H "Authorization: Bearer ${BLUEMAP_CONFIG_TOKEN}" "$BLUEMAP_CONFIG_URL")"; then
    field() { printf '%s' "$remote" | jq -r --arg k "$1" '.[$k] // empty'; }
    [ -n "$(field enabled)" ] && BLUEMAP_ENABLED="$(field enabled)"
    [ -n "$(field host)" ] && BLUEMAP_DB_HOST="$(field host)"
    [ -n "$(field port)" ] && BLUEMAP_DB_PORT="$(field port)"
    [ -n "$(field database)" ] && BLUEMAP_DB_NAME="$(field database)"
    [ -n "$(field user)" ] && BLUEMAP_DB_USER="$(field user)"
    [ -n "$(field password)" ] && BLUEMAP_DB_PASSWORD="$(field password)"
    echo "[entrypoint] BlueMap: ustawienia z panelu wczytane (host ${BLUEMAP_DB_HOST:-?}, baza ${BLUEMAP_DB_NAME:-?})"
  else
    echo "[entrypoint] BlueMap: panel nie odpowiedział - zostaję przy ustawieniach z .env"
  fi
fi

if [ "$BLUEMAP_ENABLED" = "true" ]; then
  : "${BLUEMAP_DB_HOST:?BLUEMAP_ENABLED=true wymaga BLUEMAP_DB_HOST}"
  : "${BLUEMAP_DB_PORT:?BLUEMAP_ENABLED=true wymaga BLUEMAP_DB_PORT}"
  : "${BLUEMAP_DB_NAME:?BLUEMAP_ENABLED=true wymaga BLUEMAP_DB_NAME}"
  : "${BLUEMAP_DB_USER:?BLUEMAP_ENABLED=true wymaga BLUEMAP_DB_USER}"
  : "${BLUEMAP_DB_PASSWORD:?BLUEMAP_ENABLED=true wymaga BLUEMAP_DB_PASSWORD}"

  echo "[entrypoint] BlueMap: generuję storages/sql.conf z env…"
  sed \
    -e "s/__BLUEMAP_DB_HOST__/${BLUEMAP_DB_HOST}/g" \
    -e "s/__BLUEMAP_DB_PORT__/${BLUEMAP_DB_PORT}/g" \
    -e "s/__BLUEMAP_DB_NAME__/${BLUEMAP_DB_NAME}/g" \
    -e "s/__BLUEMAP_DB_USER__/${BLUEMAP_DB_USER}/g" \
    -e "s/__BLUEMAP_DB_PASSWORD__/${BLUEMAP_DB_PASSWORD}/g" \
    "$BLUEMAP_DIR/config/storages/sql.conf.template" > "$BLUEMAP_DIR/config/storages/sql.conf"

  echo "[entrypoint] BlueMap: startuję webserver (-g -w) na :8100…"
  # Mapa jest pilnowana osobno i NIE decyduje o życiu kontenera. Wcześniej
  # dzieliła los nginxa, więc jeden błąd połączenia z bazą serwera gry gasił
  # całą stronę - a strona ma sens także wtedy, gdy mapa akurat nie działa.
  # -cp (nie -jar!) — trzeba dorzucić sterownik JDBC do MariaDB/MySQL na
  # classpath, bo bluemap-cli.jar go nie zawiera (patrz komentarz w Dockerfile).
  (
    tries=0
    while :; do
      java -Xmx"${BLUEMAP_JAVA_MAX_MEM:-256M}" \
        -cp "$BLUEMAP_DIR/bluemap-cli.jar:$BLUEMAP_DIR/mariadb-java-client.jar:$BLUEMAP_DIR/mysql-connector-j.jar" \
        de.bluecolored.bluemap.cli.BlueMapCLI \
        -c "$BLUEMAP_DIR/config" \
        -g -w && break
      tries=$((tries + 1))
      if [ "$tries" -ge 5 ]; then
        echo "[entrypoint] BlueMap: nie wstaje po ${tries} próbach - /map zostaje na 502, strona działa dalej."
        break
      fi
      echo "[entrypoint] BlueMap: padł, próba ${tries}/5 za 30 s…"
      sleep 30
    done
  ) &
  BLUEMAP_PID="$!"
  PIDS+=("$BLUEMAP_PID")
else
  echo "[entrypoint] BlueMap wyłączony (BLUEMAP_ENABLED != true) — pomijam, /map będzie 502."
fi

CONFIG_JSON_URL="${CONFIG_JSON_URL:-}"
mkdir -p /etc/nginx/snippets
if [ -n "$CONFIG_JSON_URL" ]; then
  echo "[entrypoint] /config.json: proxy do ${CONFIG_JSON_URL}"
  CONFIG_JSON_HOST="$(printf '%s' "$CONFIG_JSON_URL" | sed -E 's#^https?://([^/]+).*#\1#')"
  # Adres rozwiązywany przy żądaniu (zmienna + resolver), a nie przy starcie:
  # zwykły proxy_pass do nazwy, której akurat nie da się rozwiązać, sprawia że
  # nginx w ogóle nie wstaje - raz położyło to całą stronę.
  cat > /etc/nginx/snippets/config-json.conf <<EOF
location = /config.json {
    resolver 1.1.1.1 8.8.8.8 valid=60s ipv6=off;
    set \$dash_config "${CONFIG_JSON_URL}";
    proxy_pass \$dash_config;
    proxy_ssl_server_name on;
    proxy_set_header Host ${CONFIG_JSON_HOST};
    add_header Cache-Control "no-store";
}
EOF
else
  echo "[entrypoint] /config.json: statyczny plik (CONFIG_JSON_URL nieustawione)"
  cat > /etc/nginx/snippets/config-json.conf <<'EOF'
location = /config.json {
    add_header Cache-Control "no-store";
}
EOF
fi

echo "[entrypoint] Startuję nginx…"
nginx -g 'daemon off;' &
NGINX_PID="$!"
PIDS+=("$NGINX_PID")

# Kontener żyje tak długo jak nginx. Mapa ma własnego nadzorcę wyżej i jej
# śmierć nie jest powodem, żeby zabierać ze sobą stronę.
# `|| true`, bo inaczej `set -e` wyszedłby tu od razu, pomijając sprzątanie niżej.
wait "$NGINX_PID" || true
echo "[entrypoint] nginx się zakończył — zamykam kontener."
term_handler

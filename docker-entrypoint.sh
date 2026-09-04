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
  java -Xmx"${BLUEMAP_JAVA_MAX_MEM:-256M}" \
    -jar "$BLUEMAP_DIR/bluemap-cli.jar" \
    -c "$BLUEMAP_DIR/config" \
    -g -w &
  PIDS+=("$!")
else
  echo "[entrypoint] BlueMap wyłączony (BLUEMAP_ENABLED != true) — pomijam, /map będzie 502."
fi

echo "[entrypoint] Startuję nginx…"
nginx -g 'daemon off;' &
PIDS+=("$!")

# Jeśli którykolwiek proces padnie, kończymy kontener (żeby Docker/Compose
# go zrestartował zamiast zostawiać połowicznie działający stan).
# `|| true`, bo inaczej `set -e` wyszedłby tu od razu, pomijając sprzątanie niżej.
wait -n "${PIDS[@]}" || true
echo "[entrypoint] Jeden z procesów się zakończył — zamykam kontener."
term_handler

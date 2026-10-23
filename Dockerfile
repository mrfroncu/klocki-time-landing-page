# ── build (strona) ────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# zależności (cache warstwy)
COPY package.json package-lock.json ./
RUN npm ci

# konfiguracja budowania — nadpisywalna przez --build-arg
ARG VITE_SERVER_NAME
ARG VITE_SERVER_ADDRESS
ARG VITE_SERVER_PORT
ARG VITE_SERVER_TAGLINE
ARG VITE_MODPACK_NAME
ARG VITE_MODPACK_VERSION
ARG VITE_MC_VERSION_FALLBACK
ARG VITE_DISCORD_URL
ARG VITE_MAP_MODE
ARG VITE_MAP_URL
ARG VITE_STATUS_URL
ARG VITE_MONITOR_URL
ARG VITE_MANAGEMENT_URL
ARG VITE_MCSTATUS_API_BASE
ARG VITE_STATUS_POLL_SECONDS
ARG VITE_MAP_EMBED

COPY . .
RUN npm run build

# ── runtime (nginx + BlueMap CLI w jednym kontenerze) ──────────────────
FROM nginx:alpine AS runtime

# bash — potrzebny przez docker-entrypoint.sh (wait -n); openjdk21 — BlueMap
# CLI 5.12 wymaga Java 21.
RUN apk add --no-cache bash openjdk21-jre-headless

# CVE-2026-91403: osiem przejętych certyfikatów pośrednich eMudhra (każdy też
# z podpisem krzyżowym Sectigo) Java nadal uznaje. blocked.certs to lista
# odrzucanych certyfikatów samego JDK; 16 odcisków pochodzi z
# https://emudhra.we-have-a-problem.com/impacted-intermediates.json.
# Dopisane, więc własne wpisy JDK zostają. Po poprawce w Javie nie szkodzi.
COPY emudhra-blocked.certs /tmp/emudhra-blocked.certs
RUN J="$(dirname "$(dirname "$(readlink -f "$(command -v java)")")")" \
 && { echo; cat /tmp/emudhra-blocked.certs; } >> "$J/lib/security/blocked.certs" \
 && rm /tmp/emudhra-blocked.certs

# Strona
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# BlueMap CLI — jar wersji dopasowanej do pluginu na serwerze MC (musi być
# ta sama linia wydania, żeby format danych w SQL się zgadzał). Domyślnie
# Forge 1.20.1 -> BlueMap 5.12. Dla Fabric podmień na v5.3/bluemap-5.3-cli.jar
# przez --build-arg BLUEMAP_CLI_URL=...
ARG BLUEMAP_CLI_URL=https://github.com/BlueMap-Minecraft/BlueMap/releases/download/v5.12/bluemap-5.12-cli.jar
ADD ${BLUEMAP_CLI_URL} /opt/bluemap/bluemap-cli.jar

# Sterownik JDBC do MySQL/MariaDB — BlueMap CLI go NIE zawiera (licencja GPL
# nie pozwala go dołączyć), więc bez tego "sql" storage pada przy starcie
# błędem "No suitable driver found for jdbc:mysql://...". Dołączamy go do
# classpath ręcznie w docker-entrypoint.sh (java -cp zamiast -jar).
ARG MARIADB_JDBC_URL=https://repo1.maven.org/maven2/org/mariadb/jdbc/mariadb-java-client/3.5.10/mariadb-java-client-3.5.10.jar
ADD ${MARIADB_JDBC_URL} /opt/bluemap/mariadb-java-client.jar
# Sterownik MariaDB nie umie uwierzytelnienia sha256_password / caching_sha2_password,
# którego domyślnie używa MySQL 8 - kończy się to "Client does not support
# authentication protocol requested by server". Connector/J od MySQL-a umie oba,
# więc leży obok i oba są na classpathie; JDBC wybiera właściwy po adresie.
ARG MYSQL_JDBC_URL=https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/9.1.0/mysql-connector-j-9.1.0.jar
ADD ${MYSQL_JDBC_URL} /opt/bluemap/mysql-connector-j.jar

COPY bluemap/config /opt/bluemap/config

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]

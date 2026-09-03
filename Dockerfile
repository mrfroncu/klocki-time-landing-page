# ── build ──────────────────────────────────────────────────────────────
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
ARG VITE_MAP_URL
ARG VITE_STATUS_URL
ARG VITE_MANAGEMENT_URL
ARG VITE_MCSTATUS_API_BASE
ARG VITE_STATUS_POLL_SECONDS
ARG VITE_MAP_EMBED

COPY . .
RUN npm run build

# ── runtime ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1

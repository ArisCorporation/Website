# 1️⃣ Build-Stage (nutzt Bun für schnelleren Build)
FROM docker.io/oven/bun:1.1.4@sha256:ea572eace71acadb17ea5c408550eafd5ab82f2f6f48c04b906a3091e017cf35 as builder

WORKDIR /app

# Kopiere package.json und lockfile zuerst, um den Cache besser zu nutzen
COPY package.json bun.lockb ./

# Install build dependencies (example for Alpine Linux, which oven/bun might be based on)
RUN apk add --no-cache --virtual .gyp python3 make gcc g++

RUN bun install --frozen-lockfile

# Kopiere den Rest des Codes
COPY . .

# Baue die Nuxt-App für die Produktion
RUN bun run build

# 2️⃣ Production-Stage (leichtes Alpine-Image)
FROM node:20-alpine

WORKDIR /app

# Kopiere das Build-Resultat und `node_modules` aus der ersten Stage
COPY --from=builder /app/.output .output
COPY --from=builder /app/node_modules node_modules

# Setze Umgebungsvariablen für Nuxt (optional)
ENV NITRO_PORT=3000
ENV HOST=0.0.0.0

# Starte Nuxt 3
CMD ["node", ".output/server/index.mjs"]

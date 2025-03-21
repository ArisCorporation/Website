# 1️⃣ Build-Stage (nutzt Bun für schnelleren Build)
FROM alpine:latest as builder

# Installiere Bun
RUN apk add --no-cache curl
RUN sh -c "$(curl -fsSL https://bun.sh/install)"

WORKDIR /app

# Kopiere package.json und lockfile zuerst, um den Cache besser zu nutzen
COPY package.json bun.lockb ./

# Install build dependencies (example for Alpine Linux, which oven/bun might be based on)
RUN apk update && apk add --no-cache --virtual .gyp python3 make gcc g++

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

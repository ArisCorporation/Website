# Stage 1: Build the Nuxt application
FROM node:20-alpine AS builder

# Arbeitsverzeichnis
WORKDIR /app

# Corepack aktivieren (damit pnpm verfügbar ist)
RUN corepack enable

# Copy package.json und Lockfile
COPY package.json pnpm-lock.yaml ./

# Installiere Abhängigkeiten
RUN pnpm install --frozen-lockfile

# Copy restlicher Code
COPY . .

# Set Build-ENV
ENV NUXT_TELEMETRY_DISABLED=1

# Baue Nuxt-App
RUN pnpm run build

# Stage 2: Production Image
FROM node:20-alpine AS runner

WORKDIR /app

# Corepack aktivieren
RUN corepack enable

# Nur notwendige Dateien übernehmen
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Production Dependencies installieren
RUN pnpm install --prod --frozen-lockfile

ENV NUXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

CMD ["node", ".output/server/index.mjs"]

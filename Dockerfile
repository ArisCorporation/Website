# Stage 1: Build the Nuxt application
#-------------------------------------
# Wähle ein passendes Node.js Basis-Image. Verwende die Version, die du auch lokal nutzt.
# Alpine-Versionen sind kleiner. Aktuelle LTS-Versionen wie 18 oder 20 sind empfohlen.
FROM node:18-alpine AS builder

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package.json und die Lock-Datei (wähle die passende für dein Projekt)
COPY package.json ./
# Entkommentiere die Zeile für deinen Paketmanager und kommentiere die anderen aus:
COPY package-lock.json ./
# COPY yarn.lock ./
# COPY pnpm-lock.yaml ./

# Installiere die Abhängigkeiten
# Entkommentiere die Zeile für deinen Paketmanager und kommentiere die anderen aus:
# --frozen-lockfile stellt sicher, dass exakt die Versionen aus der Lock-Datei installiert werden
RUN npm install --frozen-lockfile
# RUN yarn install --frozen-lockfile
# RUN pnpm install --frozen-lockfile

# Kopiere den Rest des Anwendungscodes
# (Durch das vorherige Kopieren von package.json/lockfile und npm install wird der Docker-Cache optimal genutzt)
COPY . .

# Setze Build-Argumente oder Umgebungsvariablen, falls nötig (z.B. für API-Endpunkte während des Builds)
# ARG NUXT_PUBLIC_API_BASE_URL
# ENV NUXT_PUBLIC_API_BASE_URL=${NUXT_PUBLIC_API_BASE_URL}
ARG NUXT_AUTH_SECRET
ARG NUXT_DISCORD_BOT_TOKEN
ARG NUXT_DISCORD_GUILD_ID
ARG NUXT_PUBLIC_DIRECTUS_URL
ARG NUXT_PUBLIC_ENV
ARG NUXT_PUBLIC_FILE_BASE
ARG NUXT_PUBLIC_URL
ARG NUXT_RESEND_API_KEY
ARG NUXT_SENTRY_AUTH_TOKEN


# Baue die Nuxt-Anwendung für die Produktion
# Das erzeugt den .output Ordner
RUN npm run build
# RUN yarn build
# RUN pnpm build


# Stage 2: Production environment
#---------------------------------
# Nutze das gleiche Basis-Image wie im Build-Stage für Konsistenz
FROM node:18-alpine

# Setze das Arbeitsverzeichnis
WORKDIR /app

# Setze die Umgebung auf Produktion
ENV NODE_ENV=production
# Setze den Host auf 0.0.0.0, damit der Server Verbindungen von außerhalb des Containers annimmt (innerhalb des k3s Pod-Netzwerks)
ENV HOST=0.0.0.0
# Setze den Port, auf dem die Nuxt-App lauschen soll (Standard ist 3000)
ENV PORT=3000

# Exponiere den Port, auf dem die App läuft
EXPOSE 3000

# Kopiere nur den gebauten Output vom Builder-Stage
COPY --from=builder /app/.output ./.output

# Kopiere ggf. den public Ordner, falls Nuxt ihn nicht ins .output Verzeichnis integriert (selten nötig bei Nuxt 3)
# COPY --from=builder /app/public ./public

# Kopiere package.json, um Metadaten zu haben und ggf. den Start zu erleichtern (optional, aber oft gut)
COPY --from=builder /app/package.json ./package.json

# (Optional) Installiere nur Produktionsabhängigkeiten, falls dein Server-Build welche benötigt,
# die nicht im .output/server/node_modules enthalten sind. Meistens NICHT nötig für den Standard Nuxt Nitro Server.
# RUN npm install --only=production

# Der Befehl zum Starten des Nuxt 3 Produktionsservers (Nitro)
# Der Einstiegspunkt ist normalerweise .output/server/index.mjs
CMD ["node", ".output/server/index.mjs"]
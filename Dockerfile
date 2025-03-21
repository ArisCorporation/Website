# 1️⃣ Build-Stage (nutzt Node.js für bessere Kompatibilität mit nativen Modulen)
FROM node:20-slim as builder

WORKDIR /app

# Kopiere package.json und lockfile zuerst, um den Cache besser zu nutzen
COPY package.json bun.lockb ./

# Installiere Build-Abhängigkeiten using npm (as the base image is now Node.js)
RUN npm install --frozen-lockfile

# Kopiere den Rest des Codes
COPY . .

# Baue die Nuxt-App für die Produktion
RUN npm run build

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

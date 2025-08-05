# Stage 1: Build the Nuxt application
FROM node:20-alpine AS builder

# Install Volta
ENV VOLTA_HOME=/root/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH

RUN apk add --no-cache curl && \
    curl https://get.volta.sh | bash && \
    volta install node@20 pnpm

# Arbeitsverzeichnis
WORKDIR /app

# Copy package.json und Lockfile
COPY package.json pnpm-lock.yaml ./

# Installiere Abhängigkeiten via Volta-verwaltetem pnpm
RUN pnpm install --frozen-lockfile

# Copy restlicher Code
COPY . .

# Set Build-ENV
ENV NUXT_TELEMETRY_DISABLED=1

# Baue Nuxt-App
RUN pnpm run build

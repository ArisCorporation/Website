# Stage 1: Build the Nuxt application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json pnpm-lock.yaml ./
# If you use pnpm workspaces, you might also need to copy pnpm-workspace.yaml:
# COPY pnpm-workspace.yaml ./

RUN npm install -g pnpm

# Install dependencies
# Using --frozen-lockfile is a best practice for CI/Docker builds
# to ensure reproducibility by strictly adhering to the lockfile.
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
# Disable Nuxt telemetry during build to prevent potential prompts
ENV NUXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Stage 2: Serve the application from a lean image
FROM node:20-alpine

WORKDIR /app

# Declare build arguments that can be passed with --build-arg
ARG NUXT_PUBLIC_SOURCE_COMMIT
ARG NUXT_PUBLIC_ENVIRONMENT

# Copy the built application output from the builder stage
COPY --from=builder /app/.output ./.output

# Expose the port the app will run on
EXPOSE 3000

# Set default host and port.
# These can be overridden by environment variables passed at runtime.
ENV HOST=0.0.0.0
ENV PORT=3000

# Set Nuxt specific environment variables from build arguments
# These will be available to the Nuxt app via runtimeConfig
ENV NUXT_PUBLIC_SOURCE_COMMIT=${NUXT_PUBLIC_SOURCE_COMMIT}
ENV NUXT_PUBLIC_ENVIRONMENT=${NUXT_PUBLIC_ENVIRONMENT}
# NUXT_ prefixed environment variables (e.g., NUXT_PUBLIC_API_URL, NUXT_SOME_SECRET)
# passed via `docker run -e` will be available to your Nuxt app via runtimeConfig.

# Command to run the production server
CMD ["node", ".output/server/index.mjs"]
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at https://localdev.ariscorp.de (port 80, HTTPS)
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm generate     # Static site generation
pnpm generate:types  # Regenerate Directus SDK types from https://studio.ariscorp.de
```

Linting is via `@nuxt/eslint` — run with `pnpm eslint .` (no separate lint script defined).

There is no test runner script configured, but `vitest` and `@nuxt/test-utils` are available.

## Architecture

This is a **Nuxt 4** app using the [layers pattern](https://nuxt.com/docs/getting-started/layers). The root `nuxt.config.ts` extends `./layers/ams`, which is the primary application layer.

### Layer structure

- `layers/ams/` — the AMS (member portal) layer. Has its own `nuxt.config.ts` that registers components with the `AMS` prefix. All AMS-specific pages, components, composables, and utils live under `layers/ams/app/`.
- `app/` — the root layer containing shared stores, middleware, layouts, plugins, and global components.

Components in `layers/ams/app/components/` are auto-imported with an `AMS` prefix (e.g. `layers/ams/app/components/ui/sidebar/index.vue` → `<AMSUiSidebar />`).

Root components in `app/components/global/` are registered globally without a prefix.

### Backend: Directus

The backend is a Directus CMS instance at `https://studio.ariscorp.de`. Assets are served from `https://assets.ariscorp.de`.

- **Client-side**: Use the `useDirectus*` composables (provided by the Directus Nuxt module). The SDK is typed via `~~/types` (generated with `pnpm generate:types`).
- **Server-side**: Import from `~/server/utils/directus-server.ts`, which exposes a static-token client for server API routes.
- **Types**: All Directus collection types are in `types/api.d.ts` (auto-generated). Re-exported from `types/index.ts` alongside `types/auth.ts` and `types/ams-calculator.d.ts`.

### Authentication

Auth uses a global Pinia store (`app/stores/auth.ts`) combined with `useDirectusAuth` composables from the Directus module. Initialization happens in `app/plugins/auth.ts`.

Route protection is handled by the global middleware `app/middleware/route-guard.global.ts`:
- `definePageMeta({ auth: true })` — requires login
- `definePageMeta({ guest: true })` — redirects logged-in users away
- `definePageMeta({ auth: true, access_level: N })` — requires minimum `role.access_level`

### Styling

Tailwind CSS v4 + `@nuxt/ui` v4. Custom theme colors defined in `app/assets/css/main.css`:
- `aris` — primary teal (`--color-aris-*`)
- `industrial` — secondary orange (`--color-industrial-*`)
- `woodsmoke` / `bunker` — dark neutral backgrounds

UI component variants are configured in `app/app.config.ts` (e.g. `variant: 'ams'` on `UCard`, `USelectMenu`, etc.).

### Pinia stores

Stores live in `app/stores/` and `app/stores/ams/`. The `pinia.storesDirs` config only auto-imports from `./app/stores/**` (root layer), so AMS layer stores must be imported manually if they exist outside that path.

### Server API

`server/api/ams/` — AMS-specific endpoints using the static-token Directus server client.  
`server/api/proxy/[...].ts` — generic proxy route.

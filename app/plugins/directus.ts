// plugins/directus.ts
import { createDirectus, rest, authentication, staticToken } from '@directus/sdk'

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()
  const directusUrl = config.public.API_URL

  if (!directusUrl) {
    throw new Error('NUXT_PUBLIC_DIRECTUS_URL is not defined in .env')
  }

  // Initialisiere den Client ohne Authentifizierung oder mit statischem Token,
  // da der eigentliche Auth-Flow und die Token-Verwaltung über den Pinia-Store laufen.
  // Wir fügen 'authentication' hinzu, um die Login/Logout-Methoden zu haben,
  // aber das Token-Handling wird primär manuell über den Store und Cookies gesteuert.
  const directus = createDirectus(directusUrl).with(rest()).with(authentication())

  // Optional: Wenn du einen statischen Token für bestimmte Anfragen benötigst (z.B. öffentliche Daten)
  // const directusWithStaticToken = createDirectus(directusUrl).with(staticToken('YOUR_STATIC_TOKEN')).with(rest());

  // Mache den Client in der gesamten App verfügbar
  nuxtApp.provide('directus', directus)
  // nuxtApp.provide('directusPublic', directusWithStaticToken); // Falls benötigt
})
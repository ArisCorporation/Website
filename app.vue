<script setup lang="ts">
const config = useRuntimeConfig();

useSeoMeta({
  description:
    'Das hier, ist die Homepage der Astro Research and Industrial Service Corporation. Die Astro Research and Industrial Service Corporation (oder kurz: ArisCorp) ist eine fiktive Organisation in dem Universum des Spiels "Star Citizen".',
  ogTitle: 'Astro Research and Industrial Service Corporation',
  ogDescription:
    'Das hier, ist die Homepage der Astro Research and Industrial Service Corporation. Die Astro Research and Industrial Service Corporation (oder kurz: ArisCorp) ist eine fiktive Organisation in dem Universum des Spiels "Star Citizen".',
  ogImage: config.public.fileBase + '61f8ed26-978a-4d66-a59d-92e8db4fdcb5',
  ogUrl: config.public.url,
  twitterDescription:
    'Das hier, ist die Homepage der Astro Research and Industrial Service Corporation. Die Astro Research and Industrial Service Corporation (oder kurz: ArisCorp) ist eine fiktive Organisation in dem Universum des Spiels "Star Citizen".',
  twitterImage: config.public.fileBase + '61f8ed26-978a-4d66-a59d-92e8db4fdcb5',
  twitterCard: 'summary_large_image',
});

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - Astro Research and Industrial Service Corporation`
      : 'Astro Research and Industrial Service Corporation';
  },
  htmlAttrs: {
    lang: 'de',
    'data-app-version': `V${config.public.appVersion}-${config.public.buildNumber.slice(
      0,
      8,
    )}.${config.public.environment.toUpperCase()}`,
  },
  meta: [
    { name: 'theme-color', content: '#00FFE8' },
    { name: 'msapplication-square70x70logo', content: '/icons/mstile-icon-128.png' },
    { name: 'msapplication-square150x150logo', content: '/icons/mstile-icon-270.png' },
    { name: 'msapplication-square310x310logo', content: '/icons/mstile-icon-558.png' },
    { name: 'msapplication-wide310x150logo', content: '/icons/mstile-icon-558-270.png' },
  ],
  link: [
    { rel: 'manifest', href: '/manifest.json' },
    { rel: 'icon', type: 'image/png', href: '/icons/favicon-196.png' },
    { rel: 'apple-touch-icon', type: 'image/png', href: '/icons/apple-icon-180.png' },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2048-2732.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2732-2048.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1668-2388.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2388-1668.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1536-2048.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2048-1536.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1668-2224.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2224-1668.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1620-2160.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2160-1620.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1284-2778.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2778-1284.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1170-2532.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2532-1170.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1125-2436.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2436-1125.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1242-2688.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2688-1242.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-828-1792.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1792-828.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1242-2208.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-2208-1242.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-750-1334.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1334-750.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-640-1136.jpg',
    },
    {
      rel: 'apple-touch-startup-image',
      type: 'image/png',
      href: '/icons/apple-splash-dark-1136-640.jpg',
    },
  ],
});

if (!useCookie('devtools').value) {
  useCookie('devtools').value = 'false';
}

onMounted(() => {
  if (config.public.environment !== 'development') {
    window.alert(
      'ACHTUNG: DIES IST EINE EXTREM FRÜHE TESTVERSION DER 4. VERSION DER ARISCORP WEBSITE!\n\n\nDIESE VERSION IST NUR FÜR DAS INTERNE ENTWICKLUNGSTEAM DER ARISCORP BESTIMMT!',
    );
  }
});
</script>

<template>
  <div>
    <NuxtLoadingIndicator />
    <UNotifications />
    <main>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>
  </div>
</template>

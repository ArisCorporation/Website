<script setup lang="ts">
const { directus, readFile } = useCMS();
const config = useRuntimeConfig();

const { data: videoData } = await useAsyncData('TRAILER', () =>
  directus.request(
    readFile('893966c7-3541-4605-a00f-633f5234ddd4', {
      fields: ['id', 'title', 'width', 'height'],
    }),
  ),
);

useHead({
  title: 'ArisCorp Trailer', // Standard-Titel für den Browser-Tab
  meta: [
    { property: 'og:title', content: videoData.value.title },
    { property: 'og:description', content: videoData.value.description },
    { property: 'og:type', content: 'video.other' },
    { property: 'og:url', content: config.public.url + '/trailer' },
    { property: 'og:image', content: config.public.fileBase + '62eb0e48-6a0e-432f-b90d-fbd6aca6eaac' },
    { property: 'og:video:url', content: config.public.fileBase + videoData.value.id },
    { property: 'og:video:secure_url', content: config.public.fileBase + videoData.value.id },
    { property: 'og:video:type', content: 'video/mp4' },
    { property: 'og:video:width', content: videoData.value.width },
    { property: 'og:video:height', content: videoData.value.height },

    // Twitter Card Tags (optional, aber empfohlen für bessere Kompatibilität)
    { name: 'twitter:card', content: 'player' },
    { name: 'twitter:title', content: videoData.value.title },
    { name: 'twitter:description', content: videoData.value.description },
    { name: 'twitter:image', content: config.public.fileBase + '62eb0e48-6a0e-432f-b90d-fbd6aca6eaac' },
    { name: 'twitter:player', content: config.public.url + '/trailer' }, // URL zur Seite, die das Video einbettet
    { name: 'twitter:player:width', content: videoData.value.width },
    { name: 'twitter:player:height', content: videoData.value.height },
    { name: 'twitter:player:stream', content: config.public.fileBase + videoData.value.id }, // Direkte Video-URL
    { name: 'twitter:player:stream:content_type', content: 'video/mp4' },
  ],
});

definePageMeta({
  path: '/trailer',
  layout: false,
});
</script>

<template>
  <ArisCorpVideoplayer container-class="h-full" :src="config.public.fileBase + videoData.id" />
</template>

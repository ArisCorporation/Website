<script setup lang="ts">
const { directus, readSingleton } = useCMS();

const { data: credits } = await useAsyncData('CREDITS', () => directus.request(readSingleton('credits', { fields: ['content'] })), {
  transform: (data) => data.content,
});

if (!credits) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

definePageMeta({
  layout: 'default',
});
useHead({
  title: 'Credits',
});
</script>

<template>
  <Editor :model-value="credits" read-only />
</template>

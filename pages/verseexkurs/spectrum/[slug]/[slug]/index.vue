<script setup lang="ts">
const { directus, readItems } = useCMS();

const { data } = await useAsyncData(
  'SPECRTUM:THREAD',
  () =>
    directus.request(
      readItems('spectrum_threads', {
        fields: ['id', 'name', 'banner', 'content', 'category.banner', 'category.name'],
        filter: {
          slug: { _eq: useRoute().params.slug },
        },
      }),
    ),
  { transform: (data) => data[0] },
);

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

useHead({
  title: `Spectrum - ${data.value.category.name}: ${data.value.name}`,
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle :banner="data.category.banner">
    <template #title>
      Spectrum - <span class="text-aris-400">{{ data.category.name }}</span
      >: {{ data.name }}
    </template>
    <template #default>
      <div>
        <Editor v-model="data.content" read-only />
      </div>
    </template>
  </VerseExkursBaseArticle>
</template>

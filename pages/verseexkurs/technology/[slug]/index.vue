<script setup lang="ts">
const { readAsyncItems } = useDirectusItems();
const { params } = useRoute();

const { data } = await readAsyncItems('technologies', {
  query: {
    fields: ['name', 'banner', 'content'],
    filter: {
      slug: { _eq: params.slug },
    },
  },
  transform: (data) => data[0],
});

if (!data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

useHead({
  title: 'Technologien - ' + data.value.name,
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle :banner="data?.banner">
    <template #title>
      Technologie:
      <span class="text-aris-400">{{ data?.name }}</span>
    </template>
    <template #default>
      <Editor :model-value="data?.content" read-only />
    </template>
  </VerseExkursBaseArticle>
</template>

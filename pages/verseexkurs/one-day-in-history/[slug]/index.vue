<script setup lang="ts">
const { directus, readItems } = useCMS();

const { data } = await useAsyncData(
  'ODIH',
  () =>
    directus.request(
      readItems('one_day_in_history', {
        fields: ['id', 'title', 'banner', 'content', 'date'],
        filter: {
          slug: { _eq: useRoute().params.slug },
        },
        sort: ['date'],
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
  title: 'Ein Tag in der Geschichte: ' + data.value.title,
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle :banner="data.banner">
    <template #title>
      Ein Tag in der Geschichte: <span class="text-aris-400">{{ data.title }}</span>
    </template>
    <template #default>
      <Editor :model-value="data.content" read-only />
    </template>
  </VerseExkursBaseArticle>
</template>

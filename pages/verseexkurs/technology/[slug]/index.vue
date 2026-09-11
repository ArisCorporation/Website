<script setup lang="ts">
const { directus, readItems } = useCMS();
const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ''));
const asyncDataKey = computed(() => `TECHNOLOGY:${slug.value}`);

const { data } = await useAsyncData(
  asyncDataKey,
  () =>
    directus.request(
      readItems('technologies', {
        fields: ['name', 'banner', 'content'],
        filter: {
          slug: { _eq: slug.value },
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
  title: computed(() => (data.value ? `Technologien - ${data.value.name}` : 'Technologien')),
});
definePageMeta({
  layout: 'verse-exkurs',
  key: (route) => route.fullPath,
});
</script>

<template>
  <VerseExkursBaseArticle :banner="data?.banner">
    <template #title>
      Technologie:
      <span class="text-aris-400">{{ data?.name }}</span>
    </template>
    <template #default>
      <Editor :model-value="data?.content ?? ''" read-only />
    </template>
  </VerseExkursBaseArticle>
</template>

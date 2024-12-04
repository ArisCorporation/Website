<script setup lang="ts">
const route = useRoute();
const { directus, readItems } = useCMS();
const selectedTab = ref(0);

const { data } = await useAsyncData(
  'FRACTION',
  () =>
    directus.request(
      readItems('fractions', {
        fields: ['name', 'banner', 'content', 'category.id', 'category.name'],
        filter: {
          slug: { _eq: route.params.slug },
        },
        limit: 1,
      }),
    ),
  {
    transform: (rawFractions: any[]) => transformFraction(rawFractions[0]),
  },
);

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

useHead({
  title: data.value.name,
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle :banner="data?.banner">
    <template #title>
      Fraktion:
      <span class="text-aris-400"> {{ data?.name }}</span>
    </template>
    <Editor :model-value="data?.content" read-only />
  </VerseExkursBaseArticle>
</template>

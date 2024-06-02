<script setup lang="ts">
const route = useRoute();
const { readItems } = useDirectusItems();
const selectedTab = ref(0);

const dataRes = await readItems('fractions', {
  fields: ['name', 'banner', 'content', 'category.id', 'category.name'],
  filter: {
    slug: { _eq: route.params.slug },
  },
  limit: 1,
});

if (!dataRes[0]) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const data = computed(() => transformFraction(dataRes[0]));

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
      <span class="text-primary"> {{ data?.name }}</span>
    </template>
    <Editor :model-value="data?.content" read-only />
  </VerseExkursBaseArticle>
</template>

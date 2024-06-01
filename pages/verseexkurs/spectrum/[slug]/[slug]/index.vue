<script setup lang="ts">
const { readAsyncItems } = useDirectusItems();

const { data } = await readAsyncItems('spectrum_threads', {
  query: {
    fields: ['id', 'name', 'banner', 'content', 'category.banner', 'category.name'],
    filter: {
      slug: { _eq: useRoute().params.slug },
    },
  },
  transform: (data) => data[0],
});

useHead({
  title: `Spectrum - ${data.value.category.name}: ${data.value.name}`,
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle :banner="data.category.banner">
    <template #title> Spectrum - {{ data.category.name }}: {{ data.name }} </template>
    <template #default>
      <div>
        <Editor v-model="data.content" read-only />
      </div>
    </template>
  </VerseExkursBaseArticle>
</template>

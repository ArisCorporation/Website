<script setup lang="ts">
const route = useRoute();
const { readItems } = useDirectusItems();
const selectedTab = ref(0);

const dataRes = await readItems('aliens', {
  fields: ['name', 'slug', 'banner', 'content', 'tabs'],
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

const data = computed(() => transformAlien(dataRes[0]));
const current_content = computed(() => data.value.tabs[selectedTab.value]?.content);

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
      Alienrasse:
      <span class="text-primary"> {{ data?.name }}</span>
    </template>
    <div class="mt-8">
      <Editor :model-value="data?.content" read-only />
    </div>
    <TabGroup
      small-header
      :tablist="data?.tabs"
      :store="selectedTab"
      :change="(index: number) => (selectedTab = index)"
      between
    >
      <template #tabcontent>
        <Editor :model-value="current_content" read-only />
      </template>
    </TabGroup>
  </VerseExkursBaseArticle>
</template>

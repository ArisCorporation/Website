<script setup lang="ts">
const route = useRoute();
const { readItems } = useDirectusItems();
const { $preview } = useNuxtApp();
const selectedTab = ref(0);

if ($preview) {
  const dataRes = await readItems('aliens', {
    fields: ['name', 'slug', 'banner', 'content', 'tabs'],
    filter: {
      slug: { _eq: route.params.slug },
    },
    limit: 1,
  });
}

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

useHead({
  title: data.value.name,
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <div>
    <div>
      <h1 class="text-center">
        Alienrasse:
        <span class="text-primary"> {{ data?.name }}</span>
      </h1>
      <DefaultPanel>
        <NuxtImg class="object-cover w-full mx-auto max-h-96" :src="data?.banner" />
      </DefaultPanel>
    </div>
    <div class="mt-8" v-html="data?.content" />
    <TabGroup
      small-header
      :tablist="data?.tabs"
      :store="selectedTab"
      :change="(index: number) => (selectedTab = index)"
    >
      <template #tabcontent>
        <div v-html="data?.tabs[selectedTab].content" />
      </template>
    </TabGroup>
  </div>
</template>

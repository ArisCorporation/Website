<script setup lang="ts">
const { directus, readItems } = useCMS();

const { data } = await useAsyncData(
  'ODIH_INDEX',
  () =>
    directus.request(
      readItems('one_day_in_history', {
        fields: ['id', 'title', 'slug', 'banner', 'content', 'date'],
        sort: ['date'],
      }),
    ),
  {
    transform: (data) =>
      data.map((item) => ({
        ...item,
        content:
          item.content
            ?.split(' ')
            ?.slice(0, 10)
            ?.join(' ')
            .replace(/<h[1-6]>/g, '<p>')
            .replace(/<\/h[1-6]>/g, '</p>')
            .replace(/<img[^>]*>/g, '') + '...',
      })),
  },
);
console.log(data.value);
if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

useHead({
  title: 'Ein Tag in der Geschichte',
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle banner="05c7d3f7-f411-4589-8ee8-47cd4f4d149f">
    <template #title> Ein Tag in der Geschichte </template>
    <template #default>
      <div class="grid text-sm sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
        <NuxtLink
          v-for="article in data"
          :key="article.id"
          :to="'/verseexkurs/one-day-in-history/' + article.slug"
          class="text-tbase group animate-link"
        >
          <UCard :ui="{ header: { padding: 'p-0' } }" class="h-full my-6">
            <template #header>
              <NuxtImg
                :src="article.banner"
                class="object-cover transition size-full grayscale group-hover:grayscale-0"
              />
            </template>
            <template #default>
              <div class="flex flex-col">
                <h2 class="mt-0">{{ article.title }}</h2>
                <Editor v-model="article.content" read-only />
              </div>
            </template>
          </UCard>
        </NuxtLink>
      </div>
    </template>
  </VerseExkursBaseArticle>
</template>

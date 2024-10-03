<script setup lang="ts">
const { directus, readItems } = useCMS();

const { data } = await useAsyncData('LITERATURE:CATEGORIES', () =>
  directus.request(
    readItems('literature_categories', {
      fields: ['id', 'name', 'slug', 'banner', 'content', 'books.id'],
      sort: ['name'],
    }),
  ),
);

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

useHead({
  title: 'Literatur',
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle banner="93f3722e-943d-491e-85d5-2b15ef82107d">
    <template #title> Literatur </template>
    <template #default>
      <div class="grid text-sm sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
        <NuxtLink
          v-for="category in data"
          :key="category.id"
          :to="'/verseexkurs/literature/' + category.slug"
          class="text-tbase group animate-link"
        >
          <UCard :ui="{ header: { padding: 'p-0' } }" class="h-full my-6">
            <template #header>
              <NuxtImg
                :src="category.banner"
                class="object-cover transition size-full grayscale group-hover:grayscale-0"
              />
            </template>
            <template #default>
              <div class="flex flex-col">
                <h2 class="mt-0">{{ category.name }}</h2>
                <Editor v-model="category.content" read-only />
              </div>
            </template>
            <template #footer>
              <div class="flex max-w-full">
                <p class="p-0 ml-auto text-xs text-tbase/75">Bücher: {{ category.books.length }}</p>
              </div>
            </template>
          </UCard>
        </NuxtLink>
      </div>
    </template>
  </VerseExkursBaseArticle>
</template>

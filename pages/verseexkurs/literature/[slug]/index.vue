<script setup lang="ts">
const { directus, readItems } = useCMS();

const { data } = await useAsyncData(
  'LITERATURE:CATEGORIES',
  () =>
    directus.request(
      readItems('literature_categories', {
        fields: ['id', 'name', 'slug', 'banner', 'books.id', 'books.chapter', 'books.content'],
        filter: {
          slug: { _eq: useRoute().params.slug },
        },
        deep: {
          books: {
            sort: ['chapter'],
          },
        },
        sort: ['name'],
      }),
    ),
  {
    transform: (data: any[]) => {
      const obj: any = data[0];
      const books = obj.books.map((book: any) => {
        book.content = book.content
          .match(/<[^>]+>.*?<\/[^>]+>/)[0]
          .replace('h1>', 'p>')
          .replace('h2>', 'p>')
          .replace('h3>', 'p>')
          .replace('h4>', 'p>')
          .replace('h5>', 'p>');
        return book;
      });

      obj.books = books;
      return obj;
    },
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
  title: 'Literatur - ' + data.value.name,
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle :banner="data.banner">
    <template #title>
      Literatur - <span class="text-aris-400">{{ data.name }}:</span>
    </template>
    <template #default>
      <div
        v-if="data.books && data.books[0]"
        class="grid text-sm sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6"
      >
        <NuxtLink
          v-for="book in data.books"
          :key="book.id"
          :to="`/verseexkurs/literature/${data.slug}/${book.chapter}`"
          class="text-neutral-200 group animate-link"
        >
          <UCard :ui="{ header: { padding: 'p-0' } }" class="h-full my-6">
            <template #header>
              <NuxtImg :src="data.banner" class="object-cover transition size-full grayscale group-hover:grayscale-0" />
            </template>
            <template #default>
              <div class="flex flex-col">
                <h2 class="mt-0">{{ data.name }} - Teil: {{ book.chapter }}</h2>
                <Editor v-model="book.content" read-only />
              </div>
            </template>
          </UCard>
        </NuxtLink>
      </div>
      <div v-else>
        <Editor v-model="data.content" read-only />
      </div>
    </template>
  </VerseExkursBaseArticle>
</template>

<script setup lang="ts">
const { directus, readItems } = useCMS();

const { data } = await useAsyncData(
  'LITERATURE:BOOKS',
  () =>
    directus.request(
      readItems('literature_books', {
        fields: ['id', 'chapter', 'content', 'category.banner', 'category.name', 'category.slug', 'category.books.id'],
        filter: {
          chapter: { _eq: useRoute().params.chapter },
          category: {
            slug: { _eq: useRoute().params.slug },
          },
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
  title: `Literatur - ${data.value.category.name}: Teil ${data.value.chapter}`,
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle :banner="data.category.banner">
    <template #title>
      Literatur -
      <span class="text-aris-400">{{ data.category.name }}</span
      >: Teil {{ data.chapter }} / {{ data.category.books.length }}
    </template>
    <template #default>
      <div>
        <div class="flex flex-wrap justify-between">
          <ButtonDefault
            v-if="data.chapter > 1"
            :to="`/verseexkurs/literature/${data.category.slug}/${data.chapter - 1}`"
            class="mr-auto text-neutral-200"
          >
            Zurück zu Teil: {{ data.chapter - 1 }}
          </ButtonDefault>
          <ButtonDefault
            v-if="data.chapter < data.category.books.length"
            :to="`/verseexkurs/literature/${data.category.slug}/${data.chapter + 1}`"
            class="ml-auto text-neutral-200"
          >
            Weiter zu Teil: {{ data.chapter + 1 }}
          </ButtonDefault>
        </div>
        <Editor v-model="data.content" read-only />
        <div class="flex flex-wrap justify-between mb-2">
          <ButtonDefault
            v-if="data.chapter > 1"
            :to="`/verseexkurs/literature/${data.category.slug}/${data.chapter - 1}`"
            class="mr-auto text-neutral-200"
          >
            Zurück zu Teil: {{ data.chapter - 1 }}
          </ButtonDefault>
          <ButtonDefault
            v-if="data.chapter < data.category.books.length"
            :to="`/verseexkurs/literature/${data.category.slug}/${data.chapter + 1}`"
            class="ml-auto text-neutral-200"
          >
            Weiter zu Teil: {{ data.chapter + 1 }}
          </ButtonDefault>
        </div>
      </div>
    </template>
  </VerseExkursBaseArticle>
</template>

<script setup lang="ts">
const { directus, readItems } = useCMS();

const { data } = await useAsyncData(
  'SPECTRUM:CATEGORY',
  () =>
    directus.request(
      readItems('spectrum_categories', {
        fields: ['id', 'name', 'slug', 'banner', 'threads.id', 'threads.name', 'threads.slug', 'threads.content'],
        filter: {
          slug: { _eq: useRoute().params.slug },
        },
        deep: {
          threads: {
            sort: ['chapter'],
          },
        },
        sort: ['name'],
      }),
    ),
  {
    transform: (data: any[]) => {
      const obj: any = data[0];

      if (obj.threads?.length > 1) {
        const threads = obj.threads.map((thread: any) => {
          thread.content = thread.content
            .match(/<[^>]+>.*?<\/[^>]+>/)[0]
            .replace('h1>', 'p>')
            .replace('h2>', 'p>')
            .replace('h3>', 'p>')
            .replace('h4>', 'p>')
            .replace('h5>', 'p>');
          return thread;
        });

        obj.threads = threads;
      }

      return obj;
    },
  },
);

useHead({
  title: 'Spectrum - ' + data.value.name,
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle :banner="data.banner">
    <template #title>
      Spectrum - <span class="text-aris-400">{{ data.name }}</span>
    </template>
    <template v-if="data.threads?.length > 1" #default>
      <div
        v-if="data.threads && data.threads[0]"
        class="grid text-sm sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6"
      >
        <NuxtLink
          v-for="thread in data.threads"
          :key="thread.id"
          :to="`/verseexkurs/spectrum/${data.slug}/${thread.slug}`"
          class="text-tbase group animate-link"
        >
          <UCard :ui="{ header: { padding: 'p-0' } }" class="h-full my-6">
            <template #header>
              <NuxtImg :src="data.banner" class="object-cover transition size-full grayscale group-hover:grayscale-0" />
            </template>
            <template #default>
              <div class="flex flex-col">
                <h2 class="mt-0">{{ thread.name }}</h2>
                <Editor v-model="thread.content" read-only />
              </div>
            </template>
          </UCard>
        </NuxtLink>
      </div>
      <div v-else>
        <Editor v-model="data.content" read-only />
      </div>
    </template>
    <template v-else-if="data.threads[0]" #default>
      <div>
        <Editor v-model:model-value="data.threads[0].content" read-only />
      </div>
    </template>
  </VerseExkursBaseArticle>
</template>

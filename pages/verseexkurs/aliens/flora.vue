<script setup lang="ts">
const { directus, readItems, readSingleton } = useCMS();
const modalStore = useModalStore();
const selectedItem = ref();
const selectedTab = ref(0);

const { data: introduction } = await useAsyncData('FLORA:INTRODUCTION', () =>
  directus.request(
    readSingleton('flora_index', {
      fields: ['content'],
    }),
  ),
);

const { data } = await useAsyncData('FLORA', () =>
  directus.request(
    readItems('flora', {
      fields: ['banner', 'name', 'slug', 'content', 'category'],
      filter: {
        status: 'published',
      },
      limit: -1,
      sort: ['name'],
    }),
  ),
);

if (!data.value || !introduction.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const openModal = (item: any) => {
  modalStore.openSlide({ big: true });
  selectedItem.value = item;
};

useHead({
  title: 'Flora',
});
definePageMeta({
  layout: false,
});
</script>

<template>
  <NuxtLayout name="verse-exkurs">
    <template #slideHeader>
      <NuxtImg
        :src="selectedItem.banner"
        :placeholder="[16, 16, 1, 5]"
        class="object-cover w-full mx-auto rounded-lg shadow-xl max-h-96 md:max-h-96"
      />
      <h2 class="mt-4 mb-0 text-center">{{ selectedItem.name }}</h2>
    </template>
    <template #slideContent>
      <Editor :model-value="selectedItem.content" read-only />
    </template>
    <VerseExkursBaseArticle banner="1b43af1c-7c25-4b2e-9e16-fc495a8520b1">
      <template #title>
        <span class="text-aris-400">Flora</span>
      </template>
      <Editor :model-value="introduction.content" read-only />
      <TabGroup
        small-header
        between
        :tablist="[{ header: 'Alle' }, { header: 'Pflanzen' }, { header: 'Sammelbare Objekte' }]"
        :store="selectedTab"
        :change="(index: number) => (selectedTab = index)"
      >
        <template #tabcontent>
          <div class="grid grid-cols-3 gap-6 px-8 md:grid-cols-4 lg:gap-8 lg:grid-cols-5 xl:gap-12">
            <div
              v-for="item in data.filter((e) =>
                selectedTab === 0
                  ? e.category !== null
                  : e.category === (selectedTab === 1 ? 'plant' : selectedTab === 2 && 'collectible'),
              )"
              class="w-full group hover:cursor-pointer"
              @click="openModal(item)"
            >
              <NuxtImg :src="item.banner" :placeholder="[16, 16, 1, 5]" class="object-cover w-full aspect-[1/1]" />
              <p class="p-0 mt-2 text-sm text-center transition sm:text-base group-hover:text-industrial-400">
                {{ item.name }}
              </p>
            </div>
          </div>
        </template>
      </TabGroup>
    </VerseExkursBaseArticle>
  </NuxtLayout>
</template>

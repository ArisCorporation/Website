<script setup lang="ts">
const { readItems } = useDirectusItems();
const modalStore = useModalStore();
const selectedItem = ref();

const data = await readItems('fauna', {
  fields: ['banner', 'name', 'slug', 'content'],
  filter: {
    status: 'published',
  },
  limit: -1,
  sort: ['name'],
});

if (!data) {
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
  title: 'Fauna',
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
    <VerseExkursBaseArticle banner="f82676ac-eaf8-40e1-aab2-d455f5ad9f48">
      <template #title>
        <span class="text-primary">Fauna</span>
      </template>
      <h4>Dieses Biestarium ist nur ein kleiner Teil der Tierwelt im Verse und wird noch erweitert !</h4>
      <hr />
      <div class="grid grid-cols-3 gap-6 px-8 md:grid-cols-4 lg:gap-8 lg:grid-cols-5 xl:gap-12">
        <div v-for="item in data" class="w-full group hover:cursor-pointer" @click="openModal(item)">
          <NuxtImg :src="item.banner" :placeholder="[16, 16, 1, 5]" class="object-cover w-full aspect-[1/1]" />
          <p class="p-0 mt-2 text-sm text-center transition sm:text-base group-hover:text-industrial-400">
            {{ item.name }}
          </p>
        </div>
      </div>
    </VerseExkursBaseArticle>
  </NuxtLayout>
</template>

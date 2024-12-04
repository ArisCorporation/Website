<script setup lang="ts">
const { directus, readItems } = useCMS();
const modalStore = useModalStore();
const selectedItem = ref();

const { data } = await useAsyncData(
  'FAUNA',
  () =>
    directus.request(
      readItems('fauna', {
        fields: ['id', 'banner', 'name', 'slug', 'content', 'gallery.directus_files_id'],
        filter: {
          status: 'published',
        },
        limit: -1,
        sort: ['name'],
      }),
    ),
  {
    transform: (rawFauna: any[]) =>
      rawFauna.map((e: any) => {
        const gallery = [e.banner];
        e?.gallery?.forEach((e: any) => gallery.push(e.directus_files_id));
        return { ...e, gallery };
      }),
  },
);

console.log(data.value);

// if (!data.value) {
//   throw createError({
//     statusCode: 500,
//     statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
//     fatal: true,
//   });
// }

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
      <!-- <NuxtImg
        :src="selectedItem?.banner"
        :placeholder="[16, 16, 1, 5]"
        class="object-cover w-full mx-auto rounded-lg shadow-xl max-h-96 md:max-h-96"
      /> -->
      <UCarousel
        ref="module_carousel"
        :items="selectedItem.gallery"
        :ui="{
          item: 'flex flex-none snap-center w-full aspect-[16/9]',
          indicators: {
            wrapper: 'absolute flex items-center justify-center gap-3 bottom-4 inset-x-0 z-30',
          },
        }"
        class="relative w-auto max-h-[calc(100vh-4rem)] aspect-[16/9] border border-btertiary/75 rounded-lg overflow-clip"
        arrows
        indicators
      >
        <template #default="{ item }">
          <div class="relative flex size-full">
            <NuxtImg :src="item" class="relative z-20 object-contain w-full h-auto m-auto" draggable="false" />
            <NuxtImg
              :src="item"
              class="absolute z-10 object-cover w-full h-full m-auto blur brightness-50"
              draggable="false"
            />
            <USkeleton class="absolute top-0 bottom-0 left-0 right-0 z-0 m-auto size-full" />
          </div>
        </template>

        <template #prev="{ onClick, disabled }">
          <UButton
            color="gray"
            class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 left-4 group z-30"
            :disabled="disabled"
            @click="onClick"
          >
            <UIcon
              name="i-heroicons-chevron-left-20-solid"
              class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
            />
          </UButton>
        </template>

        <template #next="{ onClick, disabled }">
          <UButton
            color="gray"
            class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 right-4 group z-30"
            :disabled="disabled"
            @click="onClick"
          >
            <UIcon
              name="i-heroicons-chevron-right-20-solid"
              class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
            />
          </UButton>
        </template>
      </UCarousel>
      <h2 class="mt-4 mb-0 text-center">{{ selectedItem?.name }}</h2>
    </template>
    <template #slideContent>
      <Editor :model-value="selectedItem?.content" read-only />
    </template>
    <VerseExkursBaseArticle banner="f82676ac-eaf8-40e1-aab2-d455f5ad9f48">
      <template #title>
        <span class="text-aris-400">Fauna</span>
      </template>
      <h4>Dieses Biestarium ist nur ein kleiner Teil der Tierwelt im Verse und wird noch erweitert !</h4>
      <hr />
      <div class="grid grid-cols-3 gap-6 px-8 md:grid-cols-4 lg:gap-8 lg:grid-cols-5 xl:gap-12">
        <div v-for="item in data" :key="item.id" class="w-full group hover:cursor-pointer" @click="openModal(item)">
          <NuxtImg :src="item.banner" :placeholder="[16, 16, 1, 5]" class="object-cover w-full aspect-[1/1]" />
          <p class="p-0 mt-2 text-sm text-center transition sm:text-base group-hover:text-industrial-400">
            {{ item.name }}
          </p>
        </div>
      </div>
    </VerseExkursBaseArticle>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { directus, readItems } = useCMS();
const { params } = useRoute();
const { copy, isSupported: clipboardIsSupported } = useClipboard();
const toast = useToast();
const modalStore = useModalStore();
const selectedImg = ref();

const { data } = await useAsyncData(
  'ATTACHMENT:DATA',
  () =>
    directus.request(
      readItems('personal_weapon_attachments', {
        fields: [
          'id',
          'name',
          'slug',
          'store_image',
          'gallery.directus_files_id',
          'content',
          'weight',
          'size',
          'price',
          'zoom_level',
          'rangefinder',
          'manufacturer.name',
          'manufacturer.slug',
          'manufacturer.logo',
          'classification.name',
          'category',
          'max_rounds',
          'statistic',
        ],
        filter: {
          slug: { _eq: params.slug },
        },
      }),
    ),
  { transform: (rawAttachments: any[]) => transformAttachment(rawAttachments[0]) },
);

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Daten konnten nicht erfolgreich empfangen werden.',
    fatal: true,
  });
}
console.log(data.value);
const handleShare = () => {
  try {
    if (!clipboardIsSupported || !location?.href)
      throw new Error('clipboard is not supported or location.href is not set');
    copy(location.href);
    toast.add({ title: 'URL in Zwischenablage kopiert!' });
  } catch {
    toast.add({ title: 'Es konnte leider nichts in die Zwischenablage kopiert werden.', color: 'red' });
  }
};
console.log(data.value);
definePageMeta({
  layout: false,
});

useHead({
  title: data.value?.name,
});
</script>

<template>
  <NuxtLayout name="verse-exkurs">
    <div class="flex flex-wrap-reverse justify-between">
      <div class="mt-auto">
        <h1 class="mb-0 text-industrial-400">
          <span class="text-neutral-200">{{ data.manufacturer.name }}</span> {{ data.name }}
        </h1>
      </div>
      <div class="ml-auto">
        <NuxtLink :to="`/verseexkurs/companies/${data.manufacturer.slug}`">
          <NuxtImg :src="data.manufacturer.logo" class="h-20 md:h-40 w-fit" />
        </NuxtLink>
      </div>
    </div>
    <hr class="my-3" />
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="col-span-3 space-y-4 xl:col-span-2">
        <DefaultPanel bg="bprimary">
          <div class="h-[300px] lg:h-[600px] xl:h-[700px] w-full z-50 relative">
            <NuxtImg :src="selectedImg ? selectedImg : data.store_image" class="object-cover size-full" />
          </div>
        </DefaultPanel>

        <DefaultPanel bg="primary">
          <div class="col-span-2 p-4">
            <Editor v-model="data.content" read-only />
          </div>
        </DefaultPanel>
      </div>
      <div class="col-span-3 space-y-4 xl:col-span-1">
        <TableParent title="Spezifikation">
          <TableRow title="Typ" :content="data.category_label" />
          <TableRow title="Klassifizierung" :content="data.classification?.name" />
          <TableHr />
          <TableRow title="Größe" :content="data.size" prefix="S" />
          <TableRow title="Gewicht" :content="data.weight" suffix="Kg" />
          <TableHr />
          <TableRow
            title="Hersteller"
            :content="data.manufacturer.name"
            :link="'/verseexkurs/companies/' + data.manufacturer.slug"
            full-width
          />
          <TableHr />
          <TableRow title="Basis Preis" :content="data.price" suffix="aUEC" full-width />
        </TableParent>
        <TableParent v-if="data.category !== 'underbarrel'" title="Statistiken">
          <template v-if="data.category === 'sight'">
            <TableRow title="Zoomstufe" :content="data.zoom_level" prefix="x fach" full-width />
            <TableRow title="Integrierte Nullung" :content="data.auto_zeroing ? 'Ja' : 'Nein'" full-width />
            <TableRow title="Integrierter Entfernungsmesser" :content="data.rangefinder ? 'Ja' : 'Nein'" full-width />
          </template>
          <template v-if="data.category === 'barrel'">
            <TableRow v-if="!!data.statistic.find((e) => e.property === 'damage')" title="Schaden" third>
              <span
                :class="[
                  data.statistic.find((e) => e.property === 'damage').value < 0 ? 'text-danger' : 'text-success',
                ]"
              >
                {{ data.statistic.find((e) => e.property === 'damage').value < 0 ? '+' : '-' }}
                {{ String(data.statistic.find((e) => e.property === 'damage').value).replace('-', '') }}%
              </span>
            </TableRow>
            <TableRow v-if="!!data.statistic.find((e) => e.property === 'recoil')" title="Rückstoß" third>
              <span
                :class="[
                  data.statistic.find((e) => e.property === 'recoil').value < 0 ? 'text-success' : 'text-danger',
                ]"
              >
                {{ data.statistic.find((e) => e.property === 'recoil').value < 0 ? '-' : '+' }}
                {{ String(data.statistic.find((e) => e.property === 'recoil').value).replace('-', '') }}%
              </span>
            </TableRow>
            <TableRow v-if="!!data.statistic.find((e) => e.property === 'noise_level')" title="Lärmpegel" third>
              <span
                :class="[
                  data.statistic.find((e) => e.property === 'noise_level').value < 0 ? 'text-success' : 'text-danger',
                ]"
              >
                {{ data.statistic.find((e) => e.property === 'noise_level').value < 0 ? '-' : '+' }}
                {{ String(data.statistic.find((e) => e.property === 'noise_level').value).replace('-', '') }}%
              </span>
            </TableRow>
          </template>
          <template v-if="data.category === 'magazine'">
            <TableRow title="Kapazität" :content="data.max_rounds" prefix="x fach" full-width />
          </template>
        </TableParent>
        <DefaultPanel
          v-if="data.gallery.length > 1 ? true : data.gallery[0] === data.store_image ? data.gallery.length > 2 : false"
          bg="primary"
        >
          <div class="flex">
            <div
              v-for="img in [...(data.gallery[0] === data.store_image ? [] : [data.store_image]), ...data.gallery]"
              :key="img"
              class="aspect-[1/1] h-auto p-4"
              :style="{ width: `calc(100% / ${1 / [data.store_image, ...data.gallery].length})` }"
            >
              <NuxtImg
                :src="img"
                class="object-cover cursor-pointer size-full"
                :class="{ 'border border-primary': selectedImg ? selectedImg === img : img === data.store_image }"
                @click="selectedImg = img"
              />
            </div>
          </div>
        </DefaultPanel>
        <ButtonDefault class="w-full" @click="handleShare"
          ><UIcon name="i-heroicons-share" class="flex m-auto size-5" />
        </ButtonDefault>
      </div>
    </div>
  </NuxtLayout>
</template>

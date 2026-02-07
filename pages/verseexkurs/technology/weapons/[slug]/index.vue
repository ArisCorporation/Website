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
      readItems('personal_weapons', {
        fields: [
          'id',
          'name',
          'slug',
          'store_image',
          'manufacturer.name',
          'manufacturer.slug',
          'manufacturer.logo',
          'classification',
          'weight',
          'damage_type',
          'fire_modes',
          'fire_rates',
          'muzzle_velocity',
          'magazine.name',
          'magazine.max_rounds',
          'sight.name',
          'barrel.name',
          'underbarrel.name',
          'content',
          'max_range',
          'effective_range',
          'statistics',
        ],
        filter: {
          slug: { _eq: params.slug },
        },
      }),
    ),
  { transform: (rawWeapons: any[]) => transformWeapon(rawWeapons[0]) },
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

definePageMeta({
  layout: false,
});
console.log(data.value);
useHead({
  title: data.value?.name,
});
</script>

<template>
  <NuxtLayout name="verse-exkurs">
    <div class="flex flex-wrap-reverse justify-between">
      <div class="mt-auto">
        <h1 class="mb-0 text-industrial-400">
          <span class="text-tbase">{{ data.manufacturer.name }}</span> {{ data.name }}
        </h1>
      </div>
      <div class="ml-auto">
        <NuxtLink :to="`/verseexkurs/companies/${data.manufacturer.slug}`">
          <NuxtImg :src="data.manufacturer.logo" class="h-20 md:h-40 w-fit" />
        </NuxtLink>
      </div>
    </div>
    <hr class="my-3" >
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="col-span-3 space-y-4 xl:col-span-2">
        <DefaultPanel bg="bprimary">
          <div class="h-[300px] lg:h-[550px] xl:h-[600px] w-full z-50 relative">
            <NuxtImg :src="selectedImg ? selectedImg : data.store_image" class="object-cover size-full" />
          </div>
        </DefaultPanel>
      </div>
      <div class="col-span-3 space-y-4 xl:col-span-1">
        <TableParent title="Spezifikation">
          <TableRow title="Klassifizierung" :content="data.classification_label" full-width />
          <TableHr />
          <TableRow
            title="Hersteller"
            :content="data.manufacturer.name"
            :link="'/verseexkurs/companies/' + data.manufacturer.slug"
            full-width
          />
          <TableRow title="Gewicht" :content="data.weight" suffix="Kg" />
          <TableHr />
          <TableRow title="Schadenstyp" :content="data.damage_type_label" />
          <TableRow title="Feuermodi" :content="data.fire_modes.join(', ')" is-list />
          <TableRow
            title="Feuerrate/n"
            :content="data.fire_rates.map((fr: any) => fr.value ? `${fr.value}/${fr.label}` : '').filter(Boolean).join(', ')"
            is-list
            full-width
          />
          <TableRow title="Mündungs Geschwindigkeit" :content="data.muzzle_velocity" full-width />
        </TableParent>
        <TableParent title="Attachments">
          <TableRow
            title="Magazine"
            :content="data.magazine.name ? `${data.magazine?.name} (${data.magazine?.max_rounds} Schuss)` : null"
            full-width
          />
          <TableHr />
          <TableRow title="Visierung" :content="data.sight?.name" third />
          <TableRow title="Lauf" :content="data.barrel?.name" third />
          <TableRow title="Unterlauf" :content="data.underbarrel?.name" third />
        </TableParent>
        <ButtonDefault class="w-full" @click="handleShare"
          ><UIcon name="i-heroicons-share" class="flex m-auto size-5" />
        </ButtonDefault>
      </div>
    </div>
    <hr >
    <DefaultPanel bg="primary" class="mb-3">
      <div class="grid grid-cols-2 p-4">
        <div>
          <h4 class="italic text-industrial-400">Statistiken</h4>
          <div>
            <p>
              Maximale Reichweite: <span class="text-aris-400">{{ data.max_range ?? 'N/A' }}</span>
            </p>
            <p>
              Effektive Reichweite: <span class="text-aris-400">{{ data.effective_range ?? 'N/A' }}</span>
            </p>
            <TableHr class="pl-2 pr-6" />
            <table class="table-auto">
              <tr>
                <th class="py-2 pr-6 text-left">Entfernung</th>
                <template
                  v-for="distance in [
                    'zero_meters',
                    '15m',
                    '20m',
                    '25m',
                    '30m',
                    '40m',
                    '50m',
                    '100m',
                    '200m',
                    '400m',
                    '800m',
                    '1000m',
                  ]"
                  :key="distance"
                >
                  <th v-if="data.statistics?.find((e) => e[distance])" class="px-2">
                    {{ distance.replace('zero_meters', '0M').replace('_', ' ').toUpperCase() }}
                  </th>
                </template>
              </tr>
              <tr v-for="stat in ['alpha_damage', 'dps_single', 'dps_burst', 'dps_fully_automatic']" :key="stat">
                <th
                  v-if="
                    data.statistics?.some(
                      (e) => e.property === stat && Object.values(e).some((value) => value !== null && value !== stat),
                    )
                  "
                  class="py-2 pr-6 text-left"
                >
                  {{
                    stat
                      .replace('damage', 'schaden')
                      .replace('single', 'einzel')
                      .replace('burst', 'salve')
                      .replace('fully_automatic', 'Vollautomatisch')
                      .replace('_', ' ')
                      .toUpperCase()
                  }}
                </th>
                <template
                  v-for="distance in [
                    'zero_meters',
                    '15m',
                    '20m',
                    '25m',
                    '30m',
                    '40m',
                    '50m',
                    '100m',
                    '200m',
                    '400m',
                    '800m',
                    '1000m',
                  ]"
                  :key="distance"
                >
                  <td v-if="data.statistics?.some((e) => e[distance])" class="px-2 text-center text-primary">
                    {{ data.statistics?.find((e) => e.property === stat)?.[distance] }}
                  </td>
                </template>
              </tr>
            </table>
            <TableHr class="pl-2 pr-6" />
          </div>
        </div>
        <div>
          <h4 class="italic text-industrial-400">Beschreibung</h4>
          <Editor v-model="data.content" read-only />
        </div>
      </div>
    </DefaultPanel>
  </NuxtLayout>
</template>

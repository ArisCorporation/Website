<script setup lang="ts">
import { readItems, readUsers } from '@directus/sdk';

const { directus, readField } = useCMS();
const userSettings = useUserSettingsStore();
const { se: settings } = storeToRefs(userSettings);

const hideShips = ref(false);
const search = ref('');
const search_input_value = ref('');
const searchInput = ref();

const page = ref(1);
const pageTotal = ref(0);
const pageFrom = computed(() => (page.value - 1) * settings.value.pageCount + 1);
const pageTo = computed(() => Math.min(page.value * settings.value.pageCount, pageTotal.value));

// const shipType = ref()
// FILTERS
const typeOptions = [
  { id: '', label: 'Alle' },
  { id: 'ships', label: 'Schiffe' },
  { id: 'ground', label: 'Fahrzeuge' },
];

const { data: users } = await useAsyncData(
  'HOME:USERS',
  () =>
    directus.request(
      readUsers({
        fields: [
          'id',
          'title',
          'first_name',
          'last_name',
          'slug',
          'avatar',
          'roles',
          'head_of_department',
          'role.id',
          'role.label',
        ],
        filter: {
          status: { _eq: 'active' },
          hidden: { _eq: false },
        },
        limit: -1,
        sort: ['first_name'],
      }),
    ),
  {
    transform: (rawUsers) => rawUsers.map((rawUser) => transformUser(rawUser)),
  },
);

const { data: shipVariants } = await useAsyncData('SHIPEXKURS:SHIPV', () =>
  directus.request(
    readItems('ship_variants', {
      fields: [
        'id',
        'name',
        'stats',
        { thumbnail: ['id'] },
        {
          ship: [
            {
              manufacturer: [
                'id',
                'name',
                'slug',
                {
                  logo: ['id'],
                },
              ],
            },
          ],
        },
      ],
      sort: ['name'],
      limit: -1,
    }),
  ),
);

defineShortcuts({
  s: {
    handler: () => {
      searchInput.value?.input.focus();
    },
  },
});

definePageMeta({
  layout: 'ship-exkurs',
});

useHead({
  title: 'Ships',
});
</script>

<template>
  <div>
    <div class="flex flex-wrap justify-between px-6 mt-6 mb-4 gap-x-4">
      <div class="flex flex-wrap justify-center mb-6 h-fit basis-full">
        <UFormGroup size="xl" class="w-full lg:w-[512px] mx-auto 2xl:mx-auto" label="Suchen">
          <UInput
            ref="searchInput"
            v-model="search_input_value"
            size="2xl"
            class="my-auto"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Modell, Hersteller..."
          />
          <button
            v-if="search_input_value !== '' && !search_input_value"
            type="button"
            class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
            @click="search_input_value = ''"
          >
            <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
          </button>
        </UFormGroup>
      </div>
    </div>
    <hr />
    <!-- <div class="flex flex-wrap justify-between mb-6 xl:flex-nowrap h-fit basis-full">
      <ButtonDefault
        class="my-auto h-fit basis-full xl:basis-auto"
        :disabled="shipType?.label === 'Alle' && shipSize[0].label === 'Alle' ? true : false"
        @click="resetFilters"
      >
        <div class="h-full">Alle anzeigen</div>
      </ButtonDefault>
      <UFormGroup label="Typ" class="w-48 pt-2 pr-2 xl:p-0 basis-1/2 xl:basis-auto" :ui="{ container: 'relative' }">
        <ArisSelectMenu
          v-model="shipType"
          :initial-state="shipType"
          :options="typeOptions"
          :option-label="(option: any) => option.label"
          :selected-label="shipType?.label"
            v-if="!hideShips && !countPending && !shipsPending"
          no-selected-label="Alle"
        />
      </UFormGroup>
      <UFormGroup
        :label="shipSize.length > 1 || shipSize.some((size) => size.label === 'Alle') ? 'Größen' : 'Größe'"
        class="w-48 pt-2 pl-2 xl:p-0 basis-1/2 xl:basis-auto"
        :ui="{ container: 'relative' }"
      >
        <ArisSelectMenu
          v-model="shipSize"
          :initial-state="shipSize"
          :options="sizeOptions"
          :option-label="(option: any) => option.label"
          :selected-label="
            shipSize
              .sort(
                (a, b) =>
                  sizeOptions.findIndex((option) => option.id === a.id) -
                  sizeOptions.findIndex((option) => option.id === b.id),
              )
              .map((option) => (shipSize.length > 1 ? option.label.split(' ')[0] : option.label))
              .join(', ')
          "
          no-selected-label="Alle"
          multiple
        />
      </UFormGroup>
      <UFormGroup
        label="Kategorie"
        class="w-48 pt-2 pl-2 basis-1/2 xl:basis-auto xl:p-0"
        :ui="{ container: 'relative' }"
      >
        <ArisSelectMenu
          v-model="shipClass"
          :initial-state="shipClass"
          :options="classOptions"
          :option-label="(option: any) => option.label"
          :selected-label="shipClass?.label"
          no-selected-label="Alle"
        />
      </UFormGroup>
      <UFormGroup
        label="Hersteller"
        class="w-48 pt-2 pl-2 basis-1/2 xl:basis-auto xl:p-0"
        :ui="{ container: 'relative' }"
      >
        <ArisSelectMenu
          v-model="shipManu"
          :initial-state="shipManu"
          :options="manuOptions"
          :option-label="(option: any) => option.label"
          :selected-label="
            shipManu
              .sort(
                (a, b) =>
                  manuOptions.findIndex((option) => option.id === a.id) -
                  manuOptions.findIndex((option) => option.id === b.id),
              )
              .map((option) => (shipManu.length > 1 ? option.code.split(' ')[0] : option.label))
              .join(', ')
          "
          no-selected-label="Alle"
          multiple
        />
      </UFormGroup>
    </div> -->
    <hr />

    <!-- <div class="w-full mx-auto mb-2 text-center">
      <div class="relative flex justify-center">
        <UPagination v-model="page" :page-count="settings.pageCount" :total="pageTotal" />
        <div class="w-fit flex gap-1.5 items-center right-0 absolute">
          <span class="text-sm leading-5">Einträge pro Seite:</span>
          <USelectMenu v-model="settings.pageCount" :options="[3, 6, 12, 21, 48, 102, 500]" size="sm" />
        </div>
      </div>
      <div>
        <span class="text-sm leading-5">
          Zeigt
          <span class="font-medium">{{ pageFrom }}</span>
          bis
          <span class="font-medium">{{ pageTo }}</span>
          von
          <span class="font-medium">{{ pageTotal }}</span>
          Ergebnissen
        </span>
      </div>
    </div> -->
    <div class="flex flex-wrap">
      <ClientOnly>
        <TransitionGroup
          appear
          enter-active-class="transition-all duration-500"
          leave-active-class="transition-all duration-0"
          enter-from-class="-translate-y-4 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="opacity-0 -translate-y-0"
        >
          <!-- v-if="!hideShips && !countPending && !shipsPending" -->
          <ShipCard
            v-for="item in shipVariants"
            :key="item.id"
            :ship-data="item"
            :detail-view="userSettings.se.shipDetailView"
            preload-images
            display-production-state
          />
        </TransitionGroup>
      </ClientOnly>
    </div>
  </div>
</template>

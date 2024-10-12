<script setup lang="ts">
const { directus, readItems, readField } = useCMS();
const userSettings = useUserSettingsStore();

const hideShips = ref(false);
const search = ref('');
const search_input_value = ref('');
const searchInput = ref();

const page = ref(1);
const pageCount = ref(12);
const pageTotal = ref(0);
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));

// const shipType = ref()
// FILTERS
const typeOptions = [
  { id: '', label: 'Alle' },
  { id: 'ships', label: 'Schiffe' },
  { id: 'ground', label: 'Fahrzeuge' },
];
const sizeOptions = [
  { id: '', label: 'Alle' },
  { id: 'v', label: 'V - Bodenfahrzeug' },
  { id: '1', label: 'XXS - Snub' },
  { id: '2', label: 'XS - Sehr Klein' },
  { id: '3', label: 'S - Klein' },
  { id: '4', label: 'M - Mittel' },
  { id: '5', label: 'L - Groß' },
  { id: '6', label: 'XL - Capital' },
];
const manuOptions = ref([{ id: '', label: 'Alle', code: 'Alle' }]);
const classOptions = ref([{ id: '', label: 'Alle' }]);
const shipType = ref<{ id: string; label: string } | null>(typeOptions[0]);
const shipSize = ref<{ id: string; label: string }[]>([sizeOptions[0]]);
const shipManu = ref<{ id: string; label: string; code: string }[]>([manuOptions.value[0]]);
const shipClass = ref<{ id: string; label: string }>(classOptions.value[0]);

watch(shipType, () => {
  if (!shipType.value) {
    return (shipType.value = typeOptions[0]);
  }
});
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
watch(shipSize, (newShipSize, oldShipSize) => {
  if (!arraysEqual(newShipSize, oldShipSize)) {
    if (!newShipSize || newShipSize.length === 0) {
      shipSize.value = [sizeOptions[0]];
    } else if (newShipSize.find((size) => !oldShipSize.includes(size))?.label === 'Alle') {
      shipSize.value = [sizeOptions[0]];
    } else if (newShipSize.length !== 1 && newShipSize[0] !== sizeOptions[0]) {
      shipSize.value = newShipSize.filter((size) => size?.label !== 'Alle');
    }
  }
});
watch(shipManu, (newShipManu, oldShipManu) => {
  if (!arraysEqual(newShipManu, oldShipManu)) {
    if (
      (!oldShipManu.includes(manuOptions.value[0]) && newShipManu.includes(manuOptions.value[0])) ||
      !newShipManu.length
    ) {
      shipManu.value = [manuOptions.value[0]];
    } else {
      shipManu.value = newShipManu.filter((manu) => manu?.label !== 'Alle');
    }
  }
});

useSearch(shipType, shipType, {
  query: true,
  debounce: false,
  query_name: 'type',
  options: typeOptions,
});
useSearch(
  computed(() => shipSize.value?.map((size) => size.id)),
  shipSize,
  {
    query: true,
    debounce: false,
    query_name: 'size',
    options: sizeOptions,
  },
);

const filter = computed(() => ({
  ...(search.value && {
    _or: [
      { name: { _icontains: search.value } },
      { manufacturer: { name: { _icontains: search.value } } },
      { manufacturer: { code: { _icontains: search.value } } },
    ],
    status: { _eq: 'published' },
  }),
  _and: [
    {
      _or: [
        ...(shipType.value?.id
          ? [
              {
                gravlev: { _neq: shipType.value?.id === 'ships' ? true : false },
              },
              {
                ground: { _neq: shipType.value?.id === 'ships' ? true : false },
              },
            ]
          : []),
      ],
    },
    {
      _or: [
        !shipManu.value.includes(manuOptions.value[0]) && shipManu.value.length
          ? {
              manufacturer: { _in: shipManu.value.map((manu) => manu.id) },
            }
          : {},
      ].filter(Boolean),
    },
    {
      _or: [
        ...(shipClass.value?.id
          ? [
              {
                classification: { _eq: shipClass.value?.id },
              },
            ]
          : []),
      ],
    },
    {
      _or: [
        !shipSize.value.includes(sizeOptions[0]) && shipSize.value.length
          ? {
              size: { _in: shipSize.value.map((manu) => manu.id) },
            }
          : {},
      ].filter(Boolean),
    },
  ],
}));

function resetFilters() {
  shipType.value = typeOptions[0];
  shipSize.value = [sizeOptions[0]];
}

const { data: count, pending: countPending } = await useAsyncData(
  'SE_HOME:COUNT',
  () =>
    directus.request(
      readItems('ships', {
        limit: -1,
        fields: ['id'],
        filter: filter.value,
      }),
    ),
  { watch: [filter, page, pageCount] },
);

watch(
  [count],
  () => {
    if (count.value) {
      pageTotal.value = count.value.length;
    }
  },
  { immediate: true },
);
watch([filter], () => {
  page.value = 1;
  console.log(shipSize);
});

const { data: ships, pending: shipsPending } = await useAsyncData(
  'SE_HOME:SHIPS',
  () =>
    directus.request(
      readItems('ships', {
        fields: ['id', 'name', 'slug', 'store_image', 'production_status', 'manufacturer.name', 'manufacturer.slug'],
        sort: ['name'],
        limit: pageCount.value,
        page: page.value,
        filter: filter.value,
      }),
    ),
  { watch: [count], transform: (rawShips: any[]) => rawShips.map((rawShip: any) => transformShip(rawShip)) },
);

const { data: shipsManuRes } = await useAsyncData('SE_HOME:SHIPS_MANU', () =>
  directus.request(
    readItems('ships', {
      fields: ['manufacturer.id', 'manufacturer.name', 'manufacturer.code'],
      sort: ['name'],
      limit: -1,
    }),
  ),
);
const { data: shipsClassRes } = await useAsyncData(
  'SE_HOME:SHIPS_CLASSES',
  () => directus.request(readField('ships', 'classification')),
  {
    transform: (rawField: any) =>
      rawField?.meta?.options?.choices.map((choice: { value: string; text: string }) => ({
        id: choice.value,
        label: choice.text,
      })),
  },
);
classOptions.value.push(...shipsClassRes.value);

function setManuOptions() {
  const options: any[] = [];

  shipsManuRes.value?.forEach((ship) => {
    if (options.find((manu) => manu.id === ship.manufacturer?.id)) {
      return;
    } else {
      options.push({ id: ship.manufacturer?.id, label: ship.manufacturer?.name, code: ship.manufacturer?.code });
    }
  });

  manuOptions.value = [manuOptions.value[0], ...options.sort((a, b) => a.label.localeCompare(b.label))];
}
setManuOptions();

useSearch(search, search_input_value, {
  debounce: true,
  query: true,
  typingAction: () => (hideShips.value = true),
  debounceAction: () => (hideShips.value = false),
});

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
    <div class="flex flex-wrap justify-between mb-6 xl:flex-nowrap h-fit basis-full">
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
      <!-- class="w-64 pt-2 pr-2 xl:p-0 basis-full xl:basis-auto" -->
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
    </div>
    <hr />
    <div class="mx-auto mb-2 text-center w-fit">
      <div class="flex justify-center">
        <UPagination v-model="page" :page-count="pageCount" :total="pageTotal" />
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
    </div>
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
          <ShipCard
            v-for="item in ships"
            v-if="!hideShips && !countPending && !shipsPending"
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

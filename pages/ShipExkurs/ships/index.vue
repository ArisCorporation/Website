<script setup lang="ts">
import { debounce } from 'lodash';

const { readAsyncItems } = useDirectusItems();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);

const hideShips = ref(false);
// const hiddenShips = computed(() => hideShips.value || countPending.value || shipsPending.value);
const search = ref('');
const search_input = ref();

const debounceSearch = debounce(() => {
  hideShips.value = false;
}, 500);

function handleSearch() {
  hideShips.value = true;
  page.value = 1;

  debounceSearch();
}

// Data - Pagination
const page = ref(1);
const pageCount = ref(12);
const pageTotal = ref(0);
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));

// Data Fetching
const filter = computed(() => ({
  ...(search.value && {
    _or: [
      { name: { _icontains: search.value } },
      { manufacturer: { name: { _icontains: search.value } } },
      { manufacturer: { code: { _icontains: search.value } } },
    ],
    status: { _eq: 'published' },
  }),
}));

const {
  data: count,
  pending: countPending,
  refresh: refreshCount,
} = await readAsyncItems('ships', {
  query: {
    limit: -1,
    fields: ['id'],
    filter,
  },
  watch: [search, page, pageCount],
});

watch(
  [count],
  () => {
    if (count.value) {
      pageTotal.value = count.value?.length;
    }
  },
  { immediate: true },
);

const {
  data: ships,
  pending: shipsPending,
  refresh: refreshShips,
} = await readAsyncItems('ships', {
  query: {
    fields: ['id', 'name', 'slug', 'store_image', 'production_status', 'manufacturer.name', 'manufacturer.slug'],
    sort: ['name'],
    limit: pageCount,
    page: page,
    filter,
  },
  watch: [count],
  transform: (rawShips: any[]) => rawShips.map((rawShip: any) => transformShip(rawShip)),
});

watch([ships], () => {
  console.log(ships.value);
});

defineShortcuts({
  s: {
    handler: () => {
      search_input.value?.input.focus();
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
            size="2xl"
            v-model="search"
            ref="search_input"
            @input="handleSearch"
            class="my-auto"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Modell, Hersteller..."
          />
          <button
            v-if="search !== ''"
            @click="(search = '') + handleSearch()"
            type="button"
            class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
          >
            <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
          </button>
        </UFormGroup>
      </div>
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
            v-if="!hideShips && !countPending && !shipsPending"
            v-for="item in ships"
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

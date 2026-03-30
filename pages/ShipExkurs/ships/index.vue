<script setup lang="ts">
const { directus, readItems } = useCMS();
const userSettings = useUserSettingsStore();
const { se: settings } = storeToRefs(userSettings);

type SelectOption = {
  id: string;
  label: string;
};

type ManufacturerOption = SelectOption & {
  code?: string;
  slug?: string;
};

type VariantStats = Record<string, unknown>;

type RawShipVariant = {
  id?: string | number | null;
  name?: string | null;
  stats?: unknown;
  thumbnail?: { id?: string | null } | string | null;
  hull?: {
    name?: string | null;
    manufacturer?: {
      id?: string | null;
      name?: string | null;
      slug?: string | null;
      code?: string | null;
    } | null;
  } | null;
};

type ShipVariantListItem = {
  id: string;
  slug: string;
  name: string;
  thumbnail?: { id?: string | null } | string | null;
  ship: {
    manufacturer: {
      id?: string | null;
      name?: string | null;
      slug?: string | null;
      code?: string | null;
    };
  };
  stats: VariantStats;
  filter_size: string;
  filter_size_label: string;
  filter_class: string;
  filter_class_label: string;
};

const hideShips = ref(false);
const search = ref('');
const search_input_value = ref('');
const searchInput = ref();

const page = ref(1);
const defaultSizeOption = { id: '', label: 'Alle' };
const defaultClassOption = { id: '', label: 'Alle' };
const defaultManuOption = { id: '', label: 'Alle', code: 'Alle' };

const sizeOptions = ref<SelectOption[]>([defaultSizeOption]);
const classOptions = ref<SelectOption[]>([defaultClassOption]);
const manuOptions = ref<ManufacturerOption[]>([defaultManuOption]);

const shipSize = ref<SelectOption[]>([defaultSizeOption]);
const shipClass = ref<SelectOption | null>(defaultClassOption);
const shipManu = ref<ManufacturerOption[]>([defaultManuOption]);

const normalizeValue = (value: unknown) => String(value ?? '').trim();
const normalizeId = (value: unknown) =>
  normalizeValue(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const parseStats = (stats: unknown): VariantStats => {
  if (!stats) return {};
  if (typeof stats === 'string') {
    try {
      const parsedStats: unknown = JSON.parse(stats);
      return typeof parsedStats === 'object' && parsedStats ? (parsedStats as VariantStats) : {};
    } catch {
      return {};
    }
  }

  return typeof stats === 'object' ? (stats as VariantStats) : {};
};

const sizeLabelMap: Record<string, string> = {
  v: 'V - Bodenfahrzeug',
  1: 'XXS - Snub',
  2: 'XS - Sehr Klein',
  3: 'S - Klein',
  4: 'M - Mittel',
  5: 'L - Groß',
  6: 'XL - Capital',
};

const classLabelMap: Record<string, string> = {
  Combat: 'Kampf',
  Competition: 'Wettkampf',
  Exploration: 'Erkundung',
  Industrial: 'Industrie',
  Science: 'Wissenschaft',
  Support: 'Unterstützung',
  Touring: 'Touring',
  Transporter: 'Transport',
};

const getSizeLabel = (stats: VariantStats) => {
  const size = normalizeValue(stats?.size);
  return sizeLabelMap[size] || size || 'Unbekannt';
};

const getClassLabel = (stats: VariantStats) => {
  const classification = normalizeValue(stats?.career ?? stats?.role);
  return classLabelMap[classification] || classification || 'Unbekannt';
};

const sizeSortOrder = ['v', 'vehicle', 'xxs', 'xs', 'small', 's', 'medium', 'm', 'large', 'l', 'capital', 'xl'];
const getSizeSortIndex = (label: string) => {
  const normalized = normalizeId(label);
  const index = sizeSortOrder.findIndex((token) => normalized === token || normalized.includes(token));

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const transformShipVariantForIndex = (rawVariant: RawShipVariant): ShipVariantListItem => {
  const stats = parseStats(rawVariant?.stats);
  const manufacturer = rawVariant?.hull?.manufacturer ?? {};
  const filter_size_label = getSizeLabel(stats);
  const filter_class_label = getClassLabel(stats);

  return {
    id: String(rawVariant?.id ?? ''),
    slug: String(rawVariant?.id ?? ''),
    name: normalizeValue(rawVariant?.name) || normalizeValue(rawVariant?.hull?.name) || 'Unbekannt',
    thumbnail: rawVariant?.thumbnail ?? null,
    ship: {
      manufacturer: {
        id: manufacturer?.id ?? null,
        name: manufacturer?.name ?? null,
        slug: manufacturer?.slug ?? null,
        code: manufacturer?.code ?? null,
      },
    },
    stats,
    filter_size: normalizeId(filter_size_label),
    filter_size_label,
    filter_class: normalizeId(filter_class_label),
    filter_class_label,
  };
};

const { data: shipVariants, pending: shipsPending } = await useAsyncData(
  'SE:SHIP_VARIANTS_INDEX',
  () =>
    directus.request(
      readItems('ship_variants', {
        fields: [
          'id',
          'name',
          'stats',
          { thumbnail: ['id'] },
          {
            hull: [
              'name',
              {
                manufacturer: ['id', 'name', 'slug', 'code'],
              },
            ],
          },
        ],
        sort: ['name'],
        limit: -1,
      }),
    ),
  {
    transform: (rawVariants: RawShipVariant[]) =>
      rawVariants.map((rawVariant: RawShipVariant) => transformShipVariantForIndex(rawVariant)),
  },
);

function arraysEqual<T extends { id: string }>(a: T[] | null | undefined, b: T[] | null | undefined) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i]?.id !== b[i]?.id) return false;
  }

  return true;
}

const setFilterOptions = () => {
  const nextSizes: SelectOption[] = [];
  const nextClasses: SelectOption[] = [];
  const nextManus: ManufacturerOption[] = [];

  shipVariants.value?.forEach((variant) => {
    if (variant.filter_size && !nextSizes.find((option) => option.id === variant.filter_size)) {
      nextSizes.push({ id: variant.filter_size, label: variant.filter_size_label });
    }

    if (variant.filter_class && !nextClasses.find((option) => option.id === variant.filter_class)) {
      nextClasses.push({ id: variant.filter_class, label: variant.filter_class_label });
    }

    if (
      variant.ship?.manufacturer?.id &&
      !nextManus.find((option) => option.id === variant.ship.manufacturer.id)
    ) {
      nextManus.push({
        id: variant.ship.manufacturer.id,
        label: variant.ship.manufacturer.name ?? 'Unbekannt',
        code: variant.ship.manufacturer.code ?? undefined,
        slug: variant.ship.manufacturer.slug ?? undefined,
      });
    }
  });

  sizeOptions.value = [
    defaultSizeOption,
    ...nextSizes.sort(
      (a, b) => getSizeSortIndex(a.label) - getSizeSortIndex(b.label) || a.label.localeCompare(b.label, 'de'),
    ),
  ];
  classOptions.value = [defaultClassOption, ...nextClasses.sort((a, b) => a.label.localeCompare(b.label, 'de'))];
  manuOptions.value = [defaultManuOption, ...nextManus.sort((a, b) => a.label.localeCompare(b.label, 'de'))];

  shipSize.value = shipSize.value.filter((selected) => sizeOptions.value.some((option) => option.id === selected.id));
  shipManu.value = shipManu.value.filter((selected) => manuOptions.value.some((option) => option.id === selected.id));

  if (!shipSize.value.length) {
    shipSize.value = [defaultSizeOption];
  }

  if (!shipManu.value.length) {
    shipManu.value = [defaultManuOption];
  }

  if (!classOptions.value.some((option) => option.id === shipClass.value?.id)) {
    shipClass.value = defaultClassOption;
  }
};

watch(shipVariants, setFilterOptions, { immediate: true });

watch(shipClass, () => {
  if (!shipClass.value) {
    shipClass.value = defaultClassOption;
  }
});

watch(shipSize, (newShipSize, oldShipSize) => {
  if (!arraysEqual(newShipSize, oldShipSize)) {
    if (!newShipSize?.length) {
      shipSize.value = [defaultSizeOption];
    } else if (newShipSize.find((size) => !oldShipSize?.includes(size))?.id === defaultSizeOption.id) {
      shipSize.value = [defaultSizeOption];
    } else if (newShipSize.length !== 1 && newShipSize[0]?.id !== defaultSizeOption.id) {
      shipSize.value = newShipSize.filter((size) => size.id !== defaultSizeOption.id);
    }
  }
});

watch(shipManu, (newShipManu, oldShipManu) => {
  if (!arraysEqual(newShipManu, oldShipManu)) {
    if (
      (!oldShipManu?.includes(defaultManuOption) && newShipManu.includes(defaultManuOption)) ||
      !newShipManu.length
    ) {
      shipManu.value = [defaultManuOption];
    } else {
      shipManu.value = newShipManu.filter((manu) => manu.id !== defaultManuOption.id);
    }
  }
});

useSearch(search, search_input_value, {
  debounce: true,
  query: true,
  typingAction: () => (hideShips.value = true),
  debounceAction: () => (hideShips.value = false),
});

const filteredShipVariants = computed(() => {
  const activeManufacturerIds = shipManu.value
    .filter((manu) => manu.id !== defaultManuOption.id)
    .map((manu) => manu.id);
  const activeSizeIds = shipSize.value.filter((size) => size.id !== defaultSizeOption.id).map((size) => size.id);
  const normalizedSearch = search.value.trim().toLowerCase();

  return (shipVariants.value ?? []).filter((variant) => {
    const searchableText = [
      variant.name,
      variant.ship?.manufacturer?.name,
      variant.ship?.manufacturer?.code,
      variant.filter_size_label,
      variant.filter_class_label,
      variant.stats?.role,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (normalizedSearch && !searchableText.includes(normalizedSearch)) {
      return false;
    }

    if (activeSizeIds.length && !activeSizeIds.includes(variant.filter_size)) {
      return false;
    }

    if (shipClass.value?.id && variant.filter_class !== shipClass.value.id) {
      return false;
    }

    if (activeManufacturerIds.length && !activeManufacturerIds.includes(variant.ship?.manufacturer?.id ?? '')) {
      return false;
    }

    return true;
  });
});

const pageCount = computed(() => Math.max(1, Number(settings.value.pageCount) || 1));
const pageTotal = computed(() => filteredShipVariants.value.length);
const pageFrom = computed(() => (pageTotal.value ? (page.value - 1) * pageCount.value + 1 : 0));
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
const totalPages = computed(() => Math.max(1, Math.ceil(pageTotal.value / pageCount.value)));

const paginatedShipVariants = computed(() => {
  const start = (page.value - 1) * pageCount.value;
  const end = start + pageCount.value;

  return filteredShipVariants.value.slice(start, end);
});

const filterSignature = computed(() =>
  JSON.stringify({
    search: search.value,
    size: shipSize.value.map((size) => size.id).sort(),
    class: shipClass.value?.id ?? '',
    manu: shipManu.value.map((manu) => manu.id).sort(),
    pageCount: pageCount.value,
  }),
);

watch(filterSignature, () => {
  page.value = 1;
});

watch([pageTotal, pageCount], () => {
  if (page.value > totalPages.value) {
    page.value = totalPages.value;
  }
});

const resetFilters = () => {
  search.value = '';
  search_input_value.value = '';
  shipSize.value = [defaultSizeOption];
  shipClass.value = defaultClassOption;
  shipManu.value = [defaultManuOption];
};

const hasActiveFilters = computed(
  () =>
    search_input_value.value.trim() !== '' ||
    shipClass.value?.id !== defaultClassOption.id ||
    shipSize.value.some((size) => size.id !== defaultSizeOption.id) ||
    shipManu.value.some((manu) => manu.id !== defaultManuOption.id),
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
            placeholder="Modell, Hersteller, Rolle..."
          />
          <button
            v-if="search_input_value !== ''"
            type="button"
            class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
            @click="search_input_value = ''"
          >
            <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
          </button>
        </UFormGroup>
      </div>
    </div>
    <hr>
    <div class="flex flex-wrap justify-between mb-6 xl:flex-nowrap h-fit basis-full">
      <ButtonDefault class="my-auto h-fit basis-full xl:basis-auto" :disabled="!hasActiveFilters" @click="resetFilters">
        <div class="h-full">Alle anzeigen</div>
      </ButtonDefault>
      <UFormGroup
        :label="shipSize.length > 1 || shipSize.some((size) => size.label === 'Alle') ? 'Größen' : 'Größe'"
        class="w-48 pt-2 pr-2 xl:p-0 basis-1/2 xl:basis-auto"
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
              .map((option) => option.label)
              .join(', ')
          "
          no-selected-label="Alle"
          multiple
        />
      </UFormGroup>
      <UFormGroup
        label="Kategorie"
        class="w-48 pt-2 pl-2 pr-2 basis-1/2 xl:basis-auto xl:p-0"
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
              .map((option) => (shipManu.length > 1 ? option.code || option.label : option.label))
              .join(', ')
          "
          no-selected-label="Alle"
          multiple
        />
      </UFormGroup>
    </div>
    <hr>
    <div class="w-full mx-auto mb-2 text-center">
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
    </div>
    <div class="flex flex-wrap">
      <ClientOnly>
        <TransitionGroup
          v-if="!hideShips && !shipsPending"
          appear
          enter-active-class="transition-all duration-500"
          leave-active-class="transition-all duration-0"
          enter-from-class="-translate-y-4 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="opacity-0 -translate-y-0"
        >
          <ShipCard
            v-for="item in paginatedShipVariants"
            :key="item.id"
            :ship-data="item"
            :detail-view="userSettings.se.shipDetailView"
            preload-images
            display-production-state
          />
        </TransitionGroup>
      </ClientOnly>
      <div
        v-if="!shipsPending && !hideShips && paginatedShipVariants.length === 0"
        class="w-full px-2 py-10 text-center text-white/60"
      >
        Keine passenden Schiffe gefunden.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { directus, readItems } = useCMS();
const userSettings = useUserSettingsStore();
const { ve: settings } = storeToRefs(userSettings);

const hideWeapons = ref(false);
const search = ref('');
const search_input_value = ref('');
const searchInput = ref();

const page = ref(1);
const pageTotal = ref(0);
const pageFrom = computed(() => (page.value - 1) * settings.value.tech_weaponsPageCount + 1);
const pageTo = computed(() => Math.min(page.value * settings.value.tech_weaponsPageCount, pageTotal.value));

// const weaponType = ref()
// FILTERS
const typeOptions = [
  { id: '', label: 'Alle' },
  { id: 'crossbow', label: 'Armbrust' },
  { id: 'grenade_launcher', label: 'Granatwerfer' },
  { id: 'hmg', label: 'Schweres Maschinengewehr' },
  { id: 'lmg', label: 'Leichtes Maschinengewehr' },
  { id: 'pistol', label: 'Pistole' },
  { id: 'railgun', label: 'Railgun' },
  { id: 'rocket_launcher', label: 'Raketenwerfer' },
  { id: 'sniper_rifle', label: 'Scharfschützengewehr' },
  { id: 'shotgun', label: 'Schrotflinte' },
  { id: 'smg', label: 'MP' },
  { id: 'assault_rifle', label: 'Sturmgewehr' },
  { id: 'taser', label: 'Taser' },
];
const dmgOptions = [
  { id: '', label: 'Alle' },
  { id: 'electrons', label: 'Elektronen' },
  { id: 'ballistic', label: 'Ballistisch' },
  { id: 'laser', label: 'Laser' },
  { id: 'plasma', label: 'Plasma' },
  { id: 'explosive', label: 'Explosiv' },
];

const manuOptions = ref([{ id: '', label: 'Alle' }]);
const weaponType = ref<{ id: string; label: string } | null>(typeOptions[0]);
const weaponDmg = ref<{ id: string; label: string }[]>(dmgOptions[0]);
const weaponManu = ref<{ id: string; label: string }[]>([manuOptions.value[0]]);

// const manuOptions = computed(() => {
// const manus = weapons?.value?.forEach((weapon) => {
//   if (manuOptions.value.find((manu) => manu.id === weapon.manufacturer.id)) {
//     return;
//   } else {
//     manuOptions.value.push({ id: weapon.manufacturer.id, label: weapon.manufacturer.name });
//   }
// });

//   return [{ id: '', label: 'Alle' }, manus.sort((a, b) => a.label.localeCompare(b.label))];
// });

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

watch(weaponType, () => {
  if (!weaponType.value) {
    return (weaponType.value = typeOptions[0]);
  }
});
watch(weaponDmg, () => {
  if (!weaponDmg.value) {
    return (weaponDmg.value = dmgOptions[0]);
  }
});

useSearch(weaponType, weaponType, {
  query: true,
  debounce: false,
  query_name: 'type',
  options: typeOptions,
});
useSearch(weaponDmg, weaponDmg, {
  query: true,
  debounce: false,
  query_name: 'dmg',
  options: dmgOptions,
});

watch(weaponManu, (newWeaponManu, oldWeaponManu) => {
  if (!arraysEqual(newWeaponManu, oldWeaponManu)) {
    if (
      (!oldWeaponManu.includes(manuOptions.value[0]) && newWeaponManu.includes(manuOptions.value[0])) ||
      !newWeaponManu.length
    ) {
      weaponManu.value = [manuOptions.value[0]];
    } else {
      weaponManu.value = newWeaponManu.filter((manu) => manu?.label !== 'Alle');
    }
  }
});

const filter = computed(() => ({
  ...(search.value && {
    _or: [
      { name: { _icontains: search.value } },
      { manufacturer: { name: { _icontains: search.value } } },
      { manufacturer: { code: { _icontains: search.value } } },
    ],
  }),
  _and: [
    {
      _or: [
        ...(weaponType.value?.id
          ? [
              {
                classification: { _eq: weaponType.value?.id },
              },
            ]
          : []),
      ],
    },
    {
      _or: [
        !weaponManu.value.includes(manuOptions.value[0]) && weaponManu.value.length
          ? {
              manufacturer: { _in: weaponManu.value.map((manu) => manu.id) },
            }
          : {},
      ].filter(Boolean),
    },
    {
      _or: [
        ...(weaponDmg.value?.id
          ? [
              {
                damage_type: { _eq: weaponDmg.value?.id },
              },
            ]
          : []),
      ],
    },
  ],
}));

function resetFilters() {
  weaponType.value = typeOptions[0];
  weaponDmg.value = dmgOptions[0];
}

const { data: count, pending: countPending } = await useAsyncData(
  'VE_TECH_WEAPONS:COUNT',
  () =>
    directus.request(
      readItems('personal_weapons', {
        limit: -1,
        fields: ['id'],
        filter: filter.value,
      }),
    ),
  { watch: [filter, page, () => settings.value.tech_weaponsPageCount] },
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
});

const { data: weapons, pending: weaponsPending } = await useAsyncData(
  'VE_TECH_WEAPONS:WEAPONS',
  () =>
    directus.request(
      readItems('personal_weapons', {
        fields: ['id', 'name', 'slug', 'store_image', 'manufacturer.id', 'manufacturer.name', 'manufacturer.slug'],
        sort: ['name'],
        limit: settings.value.tech_weaponsPageCount,
        page: page.value,
        filter: filter.value,
      }),
    ),
  {
    watch: [count],
    transform: (rawWeapons: any[]) => rawWeapons.map((rawWeapon: any) => transformWeapon(rawWeapon)),
  },
);

const { data: weaponsManuRes } = await useAsyncData('VE_TECH_WEAPONS:WEAPONS_MANU', () =>
  directus.request(
    readItems('personal_weapons', {
      fields: ['manufacturer.id', 'manufacturer.name'],
      sort: ['name'],
      limit: -1,
    }),
  ),
);

function setManuOptions() {
  const options: any[] = [];

  weaponsManuRes.value?.forEach((weapon) => {
    if (options.find((manu) => manu.id === weapon.manufacturer.id)) {
      return;
    } else {
      options.push({ id: weapon.manufacturer.id, label: weapon.manufacturer.name });
    }
  });

  manuOptions.value = [manuOptions.value[0], ...options.sort((a, b) => a.label.localeCompare(b.label))];
}
setManuOptions();

// weapons.value?.forEach((weapon) => {
//   if (manuOptions.value.find((manu) => manu.id === weapon.manufacturer.id)) {
//     return;
//   } else {
//     manuOptions.value.push({ id: weapon.manufacturer.id, label: weapon.manufacturer.name });
//   }
// });
// manuOptions.value = manuOptions.value.sort((a, b) => a.label.localeCompare(b.label));

useSearch(search, search_input_value, {
  debounce: true,
  query: true,
  typingAction: () => (hideWeapons.value = true),
  debounceAction: () => (hideWeapons.value = false),
});

defineShortcuts({
  s: {
    handler: () => {
      searchInput.value?.input.focus();
    },
  },
});

definePageMeta({
  layout: 'verse-exkurs',
});

useHead({
  title: 'Waffen',
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
      <!-- <ButtonDefault
        class="my-auto h-fit basis-full xl:basis-auto"
        :disabled="weaponType?.label === 'Alle' && weaponDmg[0].label === 'Alle' ? true : false"
        @click="resetFilters"
      >
        <div class="h-full">Alle anzeigen</div>
      </ButtonDefault> -->
      <UFormGroup label="Typ" class="w-64 pt-2 pr-2 xl:p-0 basis-1/2 xl:basis-auto" :ui="{ container: 'relative' }">
        <ArisSelectMenu
          v-model="weaponType"
          :initial-state="weaponType"
          :options="typeOptions"
          :option-label="(option: any) => option.label"
          :selected-label="weaponType?.label"
          no-selected-label="Alle"
        />
      </UFormGroup>
      <UFormGroup
        label="Schadenstyp"
        class="w-64 pt-2 pl-2 xl:p-0 basis-1/2 xl:basis-auto"
        :ui="{ container: 'relative' }"
      >
        <ArisSelectMenu
          v-model="weaponDmg"
          :initial-state="weaponDmg"
          :options="dmgOptions"
          :option-label="(option: any) => option.label"
          :selected-label="weaponDmg?.label"
          no-selected-label="Alle"
        />
      </UFormGroup>
      <UFormGroup
        label="Hersteller"
        class="w-64 pt-2 pr-2 xl:p-0 basis-full xl:basis-auto"
        :ui="{ container: 'relative' }"
      >
        <ArisSelectMenu
          v-model="weaponManu"
          :initial-state="weaponManu"
          :options="manuOptions"
          :option-label="(option: any) => option.label"
          :selected-label="
            weaponManu
              .sort(
                (a, b) =>
                  manuOptions.findIndex((option) => option.id === a.id) -
                  manuOptions.findIndex((option) => option.id === b.id),
              )
              .map((option) => (weaponManu.length > 1 ? option.label.split(' ')[0] : option.label))
              .join(', ')
          "
          no-selected-label="Alle"
          multiple
        />
      </UFormGroup>
    </div>
    <!-- <div class="flex flex-wrap justify-between mb-6 xl:flex-nowrap h-fit basis-full">
      
    </div> -->
    <hr />
    <div class="w-full mx-auto mb-2 text-center">
      <div class="relative flex justify-center">
        <UPagination v-model="page" :page-count="settings.tech_weaponsPageCount" :total="pageTotal" />
        <div class="w-fit flex gap-1.5 items-center right-0 absolute">
          <span class="text-sm leading-5">Einträge pro Seite:</span>
          <USelectMenu v-model="settings.tech_weaponsPageCount" :options="[3, 6, 12, 21, 48, 102, 500]" size="sm" />
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
          appear
          enter-active-class="transition-all duration-500"
          leave-active-class="transition-all duration-0"
          enter-from-class="-translate-y-4 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="opacity-0 -translate-y-0"
        >
          <ShipCard
            v-for="item in weapons"
            v-if="!hideWeapons && !countPending && !weaponsPending"
            :key="item.id"
            :ship-data="item"
            preload-images
            type="weapons"
          />
        </TransitionGroup>
      </ClientOnly>
    </div>
  </div>
</template>

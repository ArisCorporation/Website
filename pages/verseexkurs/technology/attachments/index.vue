<script setup lang="ts">
const { directus, readItems } = useCMS();
const userSettings = useUserSettingsStore();
const { ve: settings } = storeToRefs(userSettings);

const hideAttachments = ref(false);
const search = ref('');
const search_input_value = ref('');
const searchInput = ref();

const page = ref(1);
const pageTotal = ref(0);
const pageFrom = computed(() => (page.value - 1) * settings.value.tech_attachmentsPageCount + 1);
const pageTo = computed(() => Math.min(page.value * settings.value.tech_attachmentsPageCount, pageTotal.value));

// const attachmentType = ref()
// FILTERS
const typeOptions = [
  { id: '', label: 'Alle' },
  { id: 'sight', label: 'Visier' },
  { id: 'barrel', label: 'Lauf' },
  { id: 'underbarrel', label: 'Unterlauf' },
];
const sizeOptions = [
  { id: '', label: 'Alle' },
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
];
const manuOptions = ref([{ id: '', label: 'Alle' }]);

const attachmentType = ref<{ id: string; label: string } | null>(typeOptions[0]);
const attachmentSize = ref<{ id: string; label: string }[]>([sizeOptions[0]]);
const attachmentManu = ref<{ id: string; label: string }[]>([manuOptions.value[0]]);

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

watch(attachmentType, () => {
  if (!attachmentType.value) {
    return (attachmentType.value = typeOptions[0]);
  }
});
watch(attachmentSize, (newAttachmentSize, oldAttachmentSize) => {
  if (!arraysEqual(newAttachmentSize, oldAttachmentSize)) {
    if (!newAttachmentSize || newAttachmentSize.length === 0) {
      attachmentSize.value = [sizeOptions[0]];
    } else if (newAttachmentSize.find((size) => !oldAttachmentSize.includes(size))?.label === 'Alle') {
      attachmentSize.value = [sizeOptions[0]];
    } else if (newAttachmentSize.length !== 1 && newAttachmentSize[0] !== sizeOptions[0]) {
      attachmentSize.value = newAttachmentSize.filter((size) => size?.label !== 'Alle');
    }
  }
});

watch(attachmentManu, (newAttachmentManu, oldAttachmentManu) => {
  if (!arraysEqual(newAttachmentManu, oldAttachmentManu)) {
    if (
      (!oldAttachmentManu.includes(manuOptions.value[0]) && newAttachmentManu.includes(manuOptions.value[0])) ||
      !newAttachmentManu.length
    ) {
      attachmentManu.value = [manuOptions.value[0]];
    } else {
      attachmentManu.value = newAttachmentManu.filter((manu) => manu?.label !== 'Alle');
    }
  }
});

useSearch(attachmentType, attachmentType, {
  query: true,
  debounce: false,
  query_name: 'type',
  options: typeOptions,
});
useSearch(attachmentSize, attachmentSize, {
  query: true,
  debounce: false,
  query_name: 'size',
  options: sizeOptions,
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
        ...(attachmentType.value?.id
          ? [
              {
                category: { _eq: attachmentType.value?.id },
              },
            ]
          : []),
      ],
    },
    {
      _or: [
        !attachmentManu.value.includes(manuOptions.value[0]) && {
          manufacturer: { _in: attachmentManu.value.map((manu) => manu.id) },
        },
      ].filter(Boolean),
    },
    !attachmentSize.value.includes(sizeOptions[0])
      ? {
          _or: [
            {
              size: { _in: attachmentSize.value.map((size) => size.id) },
            },
          ].filter(Boolean),
        }
      : {},
    {
      category: { _neq: 'magazine' },
    },
  ],
}));

function resetFilters() {
  attachmentType.value = typeOptions[0];
  attachmentSize.value = [sizeOptions[0]];
}

const { data: count, pending: countPending } = await useAsyncData(
  'VE_TECH_ATTACHMENTS:COUNT',
  () =>
    directus.request(
      readItems('personal_weapon_attachments', {
        limit: -1,
        fields: ['id'],
        filter: filter.value,
      }),
    ),
  { watch: [filter, page, () => settings.value.tech_attachmentsPageCount] },
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

const { data: attachments, pending: attachmentsPending } = await useAsyncData(
  'VE_TECH_ATTACHMENTS:ATTACHMENTS',
  () =>
    directus.request(
      readItems('personal_weapon_attachments', {
        fields: ['id', 'name', 'slug', 'store_image', 'manufacturer.id', 'manufacturer.name', 'manufacturer.slug'],
        sort: ['name'],
        limit: settings.value.tech_attachmentsPageCount,
        page: page.value,
        filter: filter.value,
      }),
    ),
  {
    watch: [count],
    transform: (rawAttachments: any[]) =>
      rawAttachments.map((rawAttachment: any) => transformAttachment(rawAttachment)),
  },
);

attachments.value?.forEach((attachment) => {
  if (manuOptions.value.find((manu) => manu.id === attachment.manufacturer.id)) {
    return;
  } else {
    manuOptions.value.push({ id: attachment.manufacturer.id, label: attachment.manufacturer.name });
  }
});
manuOptions.value = manuOptions.value.sort((a, b) => a.label.localeCompare(b.label));

useSearch(search, search_input_value, {
  debounce: true,
  query: true,
  typingAction: () => (hideAttachments.value = true),
  debounceAction: () => (hideAttachments.value = false),
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
  title: 'Attachments',
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
    <hr >
    <div class="flex flex-wrap justify-between mb-6 xl:flex-nowrap h-fit basis-full">
      <ButtonDefault
        class="my-auto h-fit basis-full xl:basis-auto"
        :disabled="attachmentType?.label === 'Alle' && attachmentSize[0].label === 'Alle' ? true : false"
        @click="resetFilters"
      >
        <div class="h-full">Alle anzeigen</div>
      </ButtonDefault>
      <UFormGroup label="Typ" class="w-48 pt-2 pr-2 xl:p-0 basis-1/2 xl:basis-auto" :ui="{ container: 'relative' }">
        <ArisSelectMenu
          v-model="attachmentType"
          :initial-state="attachmentType"
          :options="typeOptions"
          :option-label="(option: any) => option.label"
          :selected-label="attachmentType?.label"
          no-selected-label="Alle"
        />
      </UFormGroup>
      <UFormGroup
        :label="attachmentSize.length > 1 || attachmentSize.some((size) => size.label === 'Alle') ? 'Größen' : 'Größe'"
        class="w-48 pt-2 pl-2 xl:p-0 basis-1/2 xl:basis-auto"
        :ui="{ container: 'relative' }"
      >
        <ArisSelectMenu
          v-model="attachmentSize"
          :initial-state="attachmentSize"
          :options="sizeOptions"
          :option-label="(option: any) => option.label"
          :selected-label="
            attachmentSize
              .sort(
                (a, b) =>
                  sizeOptions.findIndex((option) => option.id === a.id) -
                  sizeOptions.findIndex((option) => option.id === b.id),
              )
              .map((option) => (attachmentSize.length > 1 ? option.label.split(' ')[0] : option.label))
              .join(', ')
          "
          no-selected-label="Alle"
          multiple
        />
      </UFormGroup>
      <UFormGroup
        label="Hersteller"
        class="w-48 pt-2 pr-2 xl:p-0 basis-full xl:basis-auto"
        :ui="{ container: 'relative' }"
      >
        <ArisSelectMenu
          v-model="attachmentManu"
          :initial-state="attachmentManu"
          :options="manuOptions"
          :option-label="(option: any) => option.label"
          :selected-label="
            attachmentManu
              .sort(
                (a, b) =>
                  manuOptions.findIndex((option) => option.id === a.id) -
                  manuOptions.findIndex((option) => option.id === b.id),
              )
              .map((option) => (attachmentManu.length > 1 ? option.label.split(' ')[0] : option.label))
              .join(', ')
          "
          no-selected-label="Alle"
          multiple
        />
      </UFormGroup>
    </div>
    <!-- <div class="flex flex-wrap justify-between mb-6 xl:flex-nowrap h-fit basis-full">
      
    </div> -->
    <hr >
    <div class="w-full mx-auto mb-2 text-center">
      <div class="relative flex justify-center">
        <UPagination v-model="page" :page-count="settings.tech_attachmentsPageCount" :total="pageTotal" />
        <div class="w-fit flex gap-1.5 items-center right-0 absolute">
          <span class="text-sm leading-5">Einträge pro Seite:</span>
          <USelectMenu v-model="settings.tech_attachmentsPageCount" :options="[3, 6, 12, 21, 48, 102, 500]" size="sm" />
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
            v-for="item in attachments"
            v-if="!hideAttachments && !countPending && !attachmentsPending"
            :key="item.id"
            :ship-data="item"
            preload-images
            type="attachments"
          />
        </TransitionGroup>
      </ClientOnly>
    </div>
  </div>
</template>

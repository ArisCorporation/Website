<script setup lang="ts">
import type { UserHangar } from '~~/types'

const store = useAuthStore()
const { currentUserId: userId } = storeToRefs(store)

const mode = useCookie<'cards' | 'table'>('ams:hangar-view')
mode.value = mode.value || 'cards'

const searchInput = ref('')

const shortFilterOptions = reactive([
  {
    key: 'all',
    label: 'Alle Schiffe',
  },
  {
    key: 'personal',
    label: 'Persöhnliche Schiffe',
  },
  {
    key: 'ariscorp',
    label: 'ArisCorp Schiffe',
  },
])

const viewOptions = reactive([
  {
    key: 'cards',
    label: 'Karten Ansicht',
    icon: 'i-lucide-layout-grid',
  },
  {
    key: 'table',
    label: 'Tabellen Ansicht',
    icon: 'i-lucide-list',
  },
])

const shortFilter = ref<'ariscorp' | 'personal' | 'all'>('all')
const shortFilterValue = ref<'ariscorp' | 'private' | null>(null)

watch(
  () => shortFilter.value,
  (value) => {
    if (value === 'ariscorp') {
      shortFilterValue.value = 'ariscorp'
    } else if (value === 'personal') {
      shortFilterValue.value = 'private'
    } else {
      shortFilterValue.value = null
    }
  }
)

useLazyAsyncData('global:simple_departments', () =>
  useDirectus(
    readItems('departments', {
      limit: -1,
      fields: ['id', 'name'],
    })
  )
)

const { data, refresh } = await useFetchAMSHangar(userId)

const filteredShips = computed<UserHangar[]>(() => {
  const shortFiltered: UserHangar[] = data.value?.filter((item) =>
    shortFilterValue.value ? item.group === shortFilterValue.value : true
  )

  return searchItems<UserHangar>(
    shortFiltered,
    [
      'name',
      'department.name',
      'ship_id.name',
      'ship_id.manufacturer.name',
      'ship_id.manufacturer.code',
    ],
    searchInput.value
  )
})

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-fluent-home-garage-24-regular"
      title="Hangar"
      description="Verwalte deine eigenen Schiffe und Fahrzeuge."
    >
      <AMSPagesHangarAddSlideover @added="refresh">
        <template #default="{ openSlideover }">
          <UButton
            @click="openSlideover"
            label="Schiffe hinzufügen"
            icon="i-lucide-circle-plus"
            variant="subtle"
          />
        </template>
      </AMSPagesHangarAddSlideover>
    </AMSPageHeader>
    <UInput
      v-model="searchInput"
      highlight
      variant="outline"
      icon="i-lucide-search"
      placeholder="Name, Hersteller, Modell"
      size="lg"
      class="w-full mb-6"
    />
    <div class="flex justify-between flex-wrap prose-p:m-0 mb-6">
      <URadioGroup
        v-model="shortFilter"
        indicator="hidden"
        variant="amsSpaced"
        orientation="horizontal"
        default-value="all"
        value-key="key"
        :items="shortFilterOptions"
      />
      <URadioGroup
        v-model="mode"
        indicator="hidden"
        variant="amsSpaced"
        orientation="horizontal"
        default-value="all"
        value-key="key"
        :items="viewOptions"
      >
        <template #label="{ item }">
          <span class="items-center flex"
            ><UIcon :name="item.icon" class="size-4 mr-1" />
            {{ item.label }}</span
          >
        </template>
      </URadioGroup>
    </div>
    <template v-if="data?.length && mode === 'table'">
      <AMSPagesHangarShips :data="filteredShips" :search="searchInput" />
    </template>
    <template v-else-if="data?.length && mode === 'cards'">
      <div
        class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AMSUiShipCard
          v-for="ship in filteredShips"
          :key="ship.id"
          mode="hangar-item"
          :data="ship"
        />
      </div>
    </template>
    <template v-else>
      <div class="size-full flex flex-wrap items-center justify-center">
        <h2 class="text-center w-full">Dein Hangar ist leer.</h2>
        <UButton
          variant="subtle"
          size="xl"
          class="transition-shadow shadow shadow-primary hover:shadow-none duration-300 hover:drop-shadow-xl hover:drop-shadow-primary"
          >Füge jetzt Schiffe hinzu</UButton
        >
      </div>
    </template>
  </div>
</template>

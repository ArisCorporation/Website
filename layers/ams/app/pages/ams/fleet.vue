<script setup lang="ts">
import type { UserHangar } from '~~/types'

const mode = useCookie<'cards' | 'table'>('ams:fleet-view')
mode.value = mode.value || 'cards'

const searchInput = ref('')

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

const { data, refresh } = await useFetchAMSFleet()

const filteredShips = computed<UserHangar[]>(() => {
  return searchItems<UserHangar>(
    data.value ?? [],
    [
      'name',
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
      icon="i-material-symbols-transportation-outline"
      title="ArisCorp Flotte"
      description="Übersicht der gesamten ArisCorp Flotte."
    />
    <UInput
      v-model="searchInput"
      highlight
      variant="outline"
      icon="i-lucide-search"
      placeholder="Name, Hersteller, Modell"
      size="lg"
      class="w-full mb-6"
    />
    <div class="ml-auto w-fit prose-p:m-0 mb-6">
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
      <AMSPagesFleetShipsTable :data="filteredShips" />
    </template>
    <template v-else-if="data?.length && mode === 'cards'">
      <div
        class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <AMSUiShipCard
          v-for="ship in filteredShips"
          :key="ship.id"
          mode="hangar-item"
          fleet-mode
          :data="ship"
        />
      </div>
    </template>
    <template v-else>
      <div class="size-full flex flex-wrap items-center justify-center">
        <h2 class="text-center w-full">
          Die Flotte konnte nicht empfangen werden.
        </h2>
      </div>
    </template>
  </div>
</template>

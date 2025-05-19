<script setup lang="ts">
const mode = useCookie<'cards' | 'table'>('ams:hangar-view')
const activeTab = ref('table')
const tabs = [
  {
    label: 'Tabelle',
    slot: 'table',
    value: 'table',
  },
  {
    label: 'Karten',
    slot: 'cards',
    value: 'cards',
  },
]

const ships = [
  {
    id: 1,
    name: 'Galaxy',
    manufacturer: {
      name: 'Roberts Space Industries',
    },
    store_image:
      'https://media.starcitizen.tools/1/1b/RSI_Galaxy_concept_-_front_quarter_-_Cut.jpg',
    visibility: 'public',
    allocation: 'ariscorp',
  },
]

definePageMeta({
  layout: 'ams',
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-fluent-home-garage-24-regular"
      title="Hangar"
      description="Verwalte deine eigenen Schiffe und Fahrzeuge."
    >
      <UButton
        @click="() => (mode === 'cards' ? (mode = 'table') : (mode = 'cards'))"
        :label="mode === 'cards' ? 'Tabellen-Ansicht' : 'Karten-Ansicht'"
        variant="outline"
      />
      <UModal>
        <UButton
          label="Schiffe hinzufügen"
          icon="i-lucide-circle-plus"
          variant="subtle"
        />
      </UModal>
    </AMSPageHeader>
    <template v-if="mode === 'table'">
      <AMSPagesHangarShips :ships="ships" />
    </template>
    <template v-else-if="mode === 'cards'">
      <UInput
        highlight
        variant="outline"
        icon="i-lucide-search"
        placeholder="Name, Hersteller, Modell"
        size="lg"
        class="w-full mb-6"
      />
      <div
        class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <AMSUiShipCard v-for="ship in ships" :ship="ship" :key="ship.id" />
      </div>
    </template>
  </div>
</template>

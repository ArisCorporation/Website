<script setup lang="ts">
const store = useAuthStore()
const { currentUserId: userId } = storeToRefs(store)

const mode = useCookie<'cards' | 'table'>('ams:hangar-view')
mode.value = mode.value || 'cards'
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

const { data, refresh } = await useFetchAMSHangar(userId)

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
    <template v-if="mode === 'table'">
      <AMSPagesHangarShips
        :data="
          data?.filter((item) =>
            shortFilterValue ? item.group === shortFilterValue : true
          )
        "
      />
    </template>
    <template v-else-if="mode === 'cards'">
      <div
        class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <AMSUiShipCard
          v-for="ship in data?.filter((item) =>
            shortFilterValue ? item.group === shortFilterValue : true
          )"
          :key="ship.id"
          mode="hangar-item"
          :data="ship"
        />
      </div>
    </template>
  </div>
</template>

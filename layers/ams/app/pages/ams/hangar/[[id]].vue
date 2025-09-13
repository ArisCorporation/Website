<script setup lang="ts">
import type { UserHangar, DirectusUser } from '~~/types'

const route = useRoute()
const authStore = useAuthStore()
const { currentUserId } = storeToRefs(authStore)

// Normalize optional route param: treat empty string as undefined
const routeId = computed(() => {
  const v = route.params.id as string | undefined
  return v && v.trim().length > 0 ? v : undefined
})
const targetUserId = computed(() => routeId.value ?? currentUserId.value)
const isOwn = computed(
  () => !routeId.value || String(routeId.value) === String(currentUserId.value)
)

const mode = useCookie<'cards' | 'table'>('ams:hangar-view')
mode.value = mode.value || 'cards'

const allCardsExpanded = ref(false)
const searchInput = ref('')

const shortFilterOptions = reactive([
  { key: 'all', label: 'Alle Schiffe' },
  { key: 'personal', label: 'Persöhnliche Schiffe' },
  { key: 'ariscorp', label: 'ArisCorp Schiffe' },
])

const viewOptions = reactive([
  { key: 'cards', label: 'Karten Ansicht', icon: 'i-lucide-layout-grid' },
  { key: 'table', label: 'Tabellen Ansicht', icon: 'i-lucide-list' },
])

const shortFilter = ref<'ariscorp' | 'personal' | 'all'>('all')
const shortFilterValue = ref<'ariscorp' | 'private' | null>(null)
watch(
  () => shortFilter.value,
  (value) => {
    if (value === 'ariscorp') shortFilterValue.value = 'ariscorp'
    else if (value === 'personal') shortFilterValue.value = 'private'
    else shortFilterValue.value = null
  }
)

useLazyAsyncData('global:simple_departments', () =>
  useDirectus(
    readItems('departments', {
      limit: -1,
      fields: ['id', 'name'],
      sort: ['name'],
    })
  )
)

const { data, pending, refresh } = await useFetchAMSHangar(targetUserId)

// Ensure fetch runs once the currentUserId is available when no id param is provided
watch(
  () => targetUserId.value,
  (id, old) => {
    if (id && id !== old) refresh()
  },
  { immediate: true }
)

const filteredShips = computed<UserHangar[]>(() => {
  // Base list
  let list: UserHangar[] = (data.value ?? []) as UserHangar[]
  // Hide hidden when viewing another user's hangar
  if (!isOwn.value) list = list.filter((item) => item.visibility !== 'hidden')
  // Apply short filter
  const shortFiltered = list.filter((item) =>
    shortFilterValue.value ? item.group === shortFilterValue.value : true
  )
  // Apply search
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

// Load owner data when viewing public hangar (by id) to show label
const { data: owner } = await useAsyncData<DirectusUser | null>(
  computed(() =>
    routeId.value
      ? `ams:hangar-owner-${routeId.value}`
      : 'ams:hangar-owner-self'
  ),
  async () => {
    if (!routeId.value) return null
    return (await useDirectus(
      readUser(routeId.value, {
        fields: [
          'id',
          'title',
          'first_name',
          'middle_name',
          'last_name',
          'avatar',
        ],
      })
    )) as DirectusUser
  }
)

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-fluent-home-garage-24-regular"
      :title="
        isOwn ? 'Hangar' : `Hangar von ${owner ? getUserLabel(owner) : ''}`
      "
      :description="
        isOwn
          ? 'Verwalte deine eigenen Schiffe und Fahrzeuge.'
          : 'Öffentliche Schiffe des ausgewählten Mitglieds.'
      "
    >
      <AMSPagesHangarAddSlideover v-if="isOwn" @added="refresh">
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

    <div class="flex space-y-2 justify-between flex-wrap prose-p:m-0 mb-6">
      <URadioGroup
        v-model="shortFilter"
        indicator="hidden"
        variant="amsSpaced"
        orientation="horizontal"
        default-value="all"
        value-key="key"
        :items="shortFilterOptions"
      />
      <UButton
        @click="allCardsExpanded = !allCardsExpanded"
        :variant="allCardsExpanded ? 'solid' : 'outline'"
        :label="`Alle ${allCardsExpanded ? 'einklappen' : 'ausklappen'}`"
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
          :forceExpanded="allCardsExpanded"
          :fleetMode="!isOwn"
        />
      </div>
    </template>
    <template v-else>
      <div
        v-if="pending"
        class="size-full flex items-center justify-center min-h-[200px]"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-6 animate-spin text-(--ui-text-muted)"
        />
      </div>
      <div v-else class="size-full flex flex-wrap items-center justify-center">
        <h2 class="text-center w-full">Dieser Hangar ist leer.</h2>
        <UButton
          v-if="isOwn"
          variant="subtle"
          size="xl"
          class="transition-shadow shadow shadow-primary hover:shadow-none duration-300 hover:drop-shadow-xl hover:drop-shadow-primary"
          >Füge jetzt Schiffe hinzu</UButton
        >
      </div>
    </template>
  </div>
</template>

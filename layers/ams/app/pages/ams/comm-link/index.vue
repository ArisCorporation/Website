<script setup lang="ts">
import type { CommLink } from '~~/types'

const authStore = useAuthStore()
const { currentUserId: userId, currentUserAL: userAL } = storeToRefs(authStore)

const mode = useCookie<'cards' | 'table'>('ams:commlink-view')
mode.value = mode.value || 'cards'

const shortFilterOptions = reactive([
  {
    key: 'all',
    label: 'Alle Comm-Links',
  },
  {
    key: 'personal',
    label: 'Eigene Comm-Links',
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

const shortFilter = ref<'personal' | 'all'>('all')
const shortFilterValue = ref<'personal' | null>(null)

watch(
  () => shortFilter.value,
  (value) => {
    if (value === 'personal') {
      shortFilterValue.value = 'personal'
    } else {
      shortFilterValue.value = null
    }
  }
)

const { data } = useAsyncData<CommLink[]>('ams:comm-links', async () => {
  return (await useDirectus(
    readItems('comm_links', {
      fields: [
        'id',
        'name',
        'banner',
        'content',
        'date_created',
        {
          user_created: [
            'id',
            'title',
            'first_name',
            'middle_name',
            'last_name',
            'avatar',
          ],
        },
        { channel: ['name'] },
      ],
      filter: {
        ...(userAL.value < 5 && { user_created: { _eq: userId.value } }),
      },
      limit: -1,
      sort: ['-date_created'],
    })
  )) as CommLink[]
})

const searchInput = ref('')

const filteredCommLinks = computed<CommLink[]>(() => {
  const shortFiltered: CommLink[] | undefined = data.value?.filter((item) =>
    shortFilterValue.value === 'personal'
      ? item.user_created?.id === userId.value
      : true
  )

  return searchItems<CommLink>(
    shortFiltered ?? [],
    [
      'name',
      'channel.name',
      'user_created.first_name',
      'user_created.middle_name',
      'user_created.last_name',
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
    <!-- TODO: ADD TABLE -->
    <AMSPageHeader
      icon="i-lucide-newspaper"
      title="Comm-Link"
      description="Lese und Verwalte interne Artikel von Mitgliedern der ArisCorp."
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
    <div class="flex justify-between flex-wrap prose-p:m-0 mb-6">
      <URadioGroup
        v-if="userAL >= 5"
        v-model="shortFilter"
        indicator="hidden"
        variant="amsSpaced"
        orientation="horizontal"
        default-value="all"
        value-key="key"
        :items="shortFilterOptions"
      />
      <!-- <URadioGroup
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
      </URadioGroup> -->
    </div>
    <div class="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <AMSUiCommLinkCard
        v-for="item in filteredCommLinks"
        :data="item"
        :key="item.id"
      />
    </div>
  </div>
</template>

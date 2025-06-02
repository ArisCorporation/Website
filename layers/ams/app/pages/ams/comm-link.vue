<script setup lang="ts">
import type { CommLink } from '~~/types'

const authStore = useAuthStore()
const { currentUserId: userId } = storeToRefs(authStore)

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
      limit: -1,
      sort: ['date_created'],
    })
  )) as CommLink[]
})

const searchInput = ref('')

function publishingSinceDate(item: CommLink) {
  if (!item.date_created) return 'N/A'
  const date = new Date(item.date_created)
  date.setFullYear(date.getFullYear())
  // Format to yyyy-mm-dd
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createSnippet(
  htmlContent: string | null | undefined,
  maxLength: number = 100
): string {
  if (!htmlContent) return ''
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>?/gm, '')
  // Truncate and add ellipsis
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...'
  }
  return text
}

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
    <div class="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <UCard
        v-for="item in filteredCommLinks"
        :key="item.name"
        variant="ams"
        :ui="{ header: 'mb-0', body: 'mt-0 flex-1', root: 'flex flex-col' }"
        class="hover:scale-[1.02] duration-300 transition-transform ease-out group"
      >
        <template #header>
          <div class="flex flex-wrap gap-y-2 justify-between not-prose">
            <UBadge
              variant="outline"
              :label="item.channel?.name"
              class="h-fit"
            />
            <p class="text-sm ml-auto">
              {{ publishingSinceDate(item as CommLink) }}
            </p>
          </div>
        </template>
        <template #default>
          <div class="flex flex-col h-full">
            <NuxtLink :to="`/ams/comm-link/${item.name}`">
              <h4
                class="mt-0 transition-color duration-300 hover:text-(--ui-primary)"
              >
                {{ item.name }}
              </h4>
            </NuxtLink>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ createSnippet(item.content, 80) }}
            </p>
            <div class="flex gap-x-2 items-center flex-wrap mt-auto">
              <UAvatar :src="getAssetId(item.user_created?.avatar)" />
              <p class="not-prose">{{ getUserLabel(item.user_created) }}</p>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { CommLink, CommLinkChannel } from '~~/types'

const authStore = useAuthStore()
const { currentUserId: userId, currentUserAL: userAL } = storeToRefs(authStore)

const filteredStatus = ref<'all' | 'draft' | 'published'>('all')

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

const statusFilterOptions = reactive([
  {
    key: 'all',
    label: 'Alle',
    icon: 'i-lucide-list',
  },
  {
    key: 'draft',
    label: 'Entwürfe',
    icon: 'i-lucide-file-pen',
  },
  {
    key: 'published',
    label: 'Veröffentlicht',
    icon: 'i-lucide-earth',
  },
])

const statusOptions = [
  {
    value: 'draft',
    label: 'Entwurf',
  },
  {
    value: 'published',
    label: 'Veröffentlicht',
  },
]

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

const { data, refresh } = useAsyncData<CommLink[]>(
  'ams:comm-links',
  async () => {
    return (await useDirectus(
      readItems('comm_links', {
        fields: [
          'id',
          'status',
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
          { channel: ['id', 'name'] },
        ],
        filter: {
          ...(userAL.value < 5 && { user_created: { _eq: userId.value } }),
        },
        limit: -1,
        sort: ['-date_created'],
      })
    )) as CommLink[]
  }
)

const { data: channels } = await useAsyncData<CommLinkChannel[]>(
  'ams:comm-link-channels',
  async () =>
    await useDirectus(
      readItems('comm_link_channels', {
        fields: ['*'],
        limit: -1,
      })
    )
)

const searchInput = ref('')

const modalOpen = ref(false)

const filteredCommLinks = computed<CommLink[]>(() => {
  const shortFiltered: CommLink[] | undefined = data.value
    ?.filter((item) =>
      shortFilterValue.value === 'personal'
        ? item.user_created?.id === userId.value
        : true
    )
    .filter((item) =>
      filteredStatus.value === 'all' || !filteredStatus.value
        ? true
        : item.status === filteredStatus.value
    )

  return searchItems<CommLink>(
    shortFiltered ?? [],
    [
      'name',
      'channel.id',
      'channel.name',
      'user_created.first_name',
      'user_created.middle_name',
      'user_created.last_name',
    ],
    searchInput.value
  )
})

const commLinkSchema = z.object({
  name: z.string().min(1, 'Titel ist erforderlich'),
  status: z.enum(['draft', 'published'], {
    message: 'Status ist erforderlich',
  }),
  channel: z.string().min(1, 'Channel ist erforderlich'),
  content: z.string(),
})

type Schema = z.output<typeof commLinkSchema>

const formData = reactive<Partial<Schema>>({
  name: '',
  status: 'draft',
  channel: '',
  content: '',
})

const editId = ref<string | null>(null)

function handleSelection(commLink: CommLink) {
  formData.name = commLink.name as string
  formData.status = commLink.status as 'draft' | 'published'
  formData.channel = commLink.channel?.id as string
  formData.content = commLink.content as string

  editId.value = commLink.id

  modalOpen.value = true
}

function handleCancel() {
  formData.name = ''
  formData.status = 'draft'
  formData.channel = ''
  formData.content = ''

  editId.value = null
  modalOpen.value = false
}

async function handleSubmit() {
  if (editId.value) {
    await useDirectus(
      updateItem('comm_links', editId.value as string, formData)
    )
  } else {
    await useDirectus(createItem('comm_links', formData))
  }

  handleCancel()
  await refresh()
}

definePageMeta({
  layout: 'ams',
  auth: true,
  access_level: 2,
})
</script>

<template>
  <div>
    <!-- TODO: ADD TABLE -->
    <AMSPageHeader
      icon="i-lucide-newspaper"
      title="Comm-Link"
      description="Lese und Verwalte interne Artikel von Mitgliedern der ArisCorp."
    >
      <UButton
        @click="modalOpen = true"
        label="Comm-Link erstellen"
        icon="i-lucide-circle-plus"
        variant="subtle"
      />
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
        v-if="userAL >= 5"
        v-model="shortFilter"
        indicator="hidden"
        variant="amsSpaced"
        orientation="horizontal"
        default-value="all"
        value-key="key"
        :items="shortFilterOptions"
      />
      <URadioGroup
        v-model="filteredStatus"
        indicator="hidden"
        variant="amsSpaced"
        orientation="horizontal"
        default-value="all"
        value-key="key"
        :items="statusFilterOptions"
      >
        <template #label="{ item }">
          <span class="items-center flex"
            ><UIcon :name="item.icon" class="size-4 mr-1" />
            {{ item.label }}</span
          >
        </template>
      </URadioGroup>
    </div>
    <UModal
      v-model:open="modalOpen"
      :fullscreen="true"
      :ui="{
        content:
          'bg-(--ui-bg-muted)/50 backdrop-blur-xs divide-(--ui-primary)/20',
      }"
    >
      <template #header>
        <h3 class="font-bold">
          Comm-Link {{ editId ? 'bearbeiten' : 'erstellen' }}
        </h3>
      </template>
      <template #body>
        <UForm :state="formData" :schema="commLinkSchema">
          <div class="flex flex-wrap-reverse">
            <UCard variant="ams" class="w-full lg:hidden px-4 mt-4">
              <template #default>
                <div class="flex justify-between space-x-2">
                  <UButton
                    @click="handleCancel"
                    variant="subtle"
                    color="error"
                    type="button"
                    label="Abbrechen"
                    class="flex-1 flex justify-center"
                  />
                  <UButton
                    @click="handleSubmit"
                    variant="subtle"
                    type="submit"
                    label="Speichern"
                    class="flex-1 flex justify-center"
                  />
                  <UButton
                    v-if="editId"
                    @click="handleSubmit"
                    variant="outline"
                    type="submit"
                    color="error"
                    icon="i-lucide-trash-2"
                    class="w-fit flex justify-center"
                  />
                </div>
              </template>
            </UCard>
            <div class="lg:w-2/3 w-full px-4">
              <UFormField name="content">
                <UiEditor v-model="formData.content" />
              </UFormField>
            </div>
            <div class="w-full lg:w-1/3 px-4 mb-4 lg:mb-0 lg:px-0">
              <UCard variant="ams" :ui="{ body: '!pt-2' }">
                <template #header>
                  <div class="prose prose-invert">
                    <h3>Details</h3>
                  </div>
                </template>
                <template #default>
                  <div class="space-y-4">
                    <UFormField name="status" label="Status">
                      <USelectMenu
                        v-model="formData.status"
                        :items="statusOptions"
                        value-key="value"
                        label-key="label"
                        variant="ams"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField name="name" label="Titel">
                      <UInput
                        v-model="formData.name"
                        highlight
                        placeholder="z.B. Monthly Report April 2955"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField name="channel" label="Channel">
                      <USelectMenu
                        v-model="formData.channel"
                        variant="ams"
                        value-key="id"
                        label-key="name"
                        :items="channels"
                        placeholder="z.B. Monthly Report"
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                </template>
              </UCard>
              <UCard variant="ams" class="hidden lg:block mt-4">
                <template #default>
                  <div class="flex justify-between space-x-2">
                    <UButton
                      @click="handleCancel"
                      variant="subtle"
                      color="error"
                      type="button"
                      label="Abbrechen"
                      class="flex-1 flex justify-center"
                    />
                    <UButton
                      @click="handleSubmit"
                      variant="subtle"
                      type="submit"
                      label="Speichern"
                      class="flex-1 flex justify-center"
                    />
                    <UButton
                      v-if="editId"
                      @click="handleSubmit"
                      variant="outline"
                      type="submit"
                      color="error"
                      icon="i-lucide-trash-2"
                      class="w-fit flex justify-center"
                    />
                  </div>
                </template>
              </UCard>
            </div>
          </div>
        </UForm>
      </template>
    </UModal>
    <div class="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <AMSUiCommLinkCard
        v-for="item in filteredCommLinks"
        :data="item"
        :key="item.id"
        @select="handleSelection"
      />
    </div>
  </div>
</template>

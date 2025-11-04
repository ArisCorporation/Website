<script setup lang="ts">
import { z } from 'zod'
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types' // Import for UForm event
import type { CommLink, CommLinkChannel, DirectusFile } from '~~/types'

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

const { data, refresh, pending } = useAsyncData<CommLink[]>(
  'ams:comm-links',
  async () => {
    return (await useDirectus(
      readItems('comm_links', {
        fields: [
          'id',
          'status',
          'name',
          'content',
          'date_created',
          'date_published',
          {
            banner: ['id', 'type'],
          },
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
          status: { _neq: 'archived' },
        },
        limit: -1,
        sort: ['-date_created'],
      })
    )) as CommLink[]
  }
)

const { data: channels } = await useAsyncData<CommLinkChannel[]>(
  'ams:comm-link-channels-all', // Changed key to avoid potential conflicts if another 'ams:comm-link-channels' exists
  async () =>
    await useDirectus(
      readItems('comm_link_channels', {
        fields: ['*'],
        limit: -1,
        sort: ['name'],
      })
    )
)

const searchInput = ref('')
const formRef = ref() // Use ref() for template refs
const modalOpen = ref(false)

const librarySlideover = ref(false)
const bannerInput = ref<DirectusFile | null | undefined>(null)
const bannerUploading = ref(false)

const filteredCommLinks = computed<CommLink[]>(() => {
  if (!data.value) return []

  let items = data.value

  // Filter by personal
  if (shortFilter.value === 'personal') {
    items = items.filter((item) => item.user_created?.id === userId.value)
  }

  // Filter by status
  if (filteredStatus.value !== 'all' && filteredStatus.value) {
    items = items.filter((item) => item.status === filteredStatus.value)
  }

  return searchItems<CommLink>( // Assuming searchItems is globally available or imported
    items,
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
  name: z
    .string()
    .min(1, 'Titel ist erforderlich')
    .max(70, 'Titel ist zu lang')
    .trim(),
  status: z.enum(['draft', 'published'], {
    message: 'Status ist erforderlich',
  }),
  banner: z.string().min(1, 'Banner ist erforderlich').optional(),
  channel: z.string().min(1, 'Channel ist erforderlich'),
  content: z.string().min(10, 'Inhalt ist erforderlich'),
})

type CommLinkForm = z.output<typeof commLinkSchema>

const formData = reactive<Partial<CommLinkForm>>({
  name: '',
  status: 'draft',
  banner: '',
  channel: '',
  content: '',
})

watch(
  () => bannerInput.value?.id,
  (id) => {
    formData.banner = id ?? '' // immer ein String
  },
  { immediate: true } // direkt beim Start einmal ausführen
)

const editId = ref<string | null>(null)

function handleSelection(commLink: CommLink): void {
  formData.name = commLink.name as string
  // Ensure status is one of the valid options, default to 'draft' if not
  formData.status = ['draft', 'published'].includes(commLink.status as string)
    ? (commLink.status as 'draft' | 'published')
    : 'draft'
  formData.banner = commLink.banner ? getAssetId(commLink.banner) : '' // Use getAssetId if banner is an ID, or directly if it's a URL
  bannerInput.value =
    typeof commLink.banner === 'string'
      ? { id: commLink.banner }
      : commLink.banner
  formData.channel = (commLink.channel as CommLinkChannel)?.id
  formData.content = commLink.content as string

  editId.value = commLink.id
  modalOpen.value = true
}

function handleCancel(): void {
  modalOpen.value = false
  formData.name = ''
  formData.status = 'draft'
  formData.banner = ''
  formData.channel = ''
  formData.content = ''
  editId.value = null
}

async function onError(event: FormErrorEvent): Promise<void> {
  if (event?.errors?.[0]?.id) {
    const element = document.getElementById(event.errors[0].id)
    element?.focus()
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

async function onFormSubmit(
  event: FormSubmitEvent<CommLinkForm>
): Promise<void> {
  try {
    if (editId.value) {
      await useDirectus(
        updateItem('comm_links', editId.value as string, event.data)
      )
    } else {
      await useDirectus(createItem('comm_links', event.data))
    }
    handleCancel()
    await refresh()
  } catch (error) {
    console.error('Error submitting comm-link:', error)
    // Consider adding user-facing error notification here
  }
}

async function handleDelete(): Promise<void> {
  if (!editId.value) return // Guard clause
  try {
    await useDirectus(
      updateItem('comm_links', editId.value as string, {
        status: 'archived',
      })
    )
    handleCancel()
    await refresh()
  } catch (error) {
    console.error('Error deleting comm-link:', error)
    // Consider adding user-facing error notification here
  }
}

async function handleBannerUpload(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    bannerUploading.value = true
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'c558dbe9-3f85-4c86-bdac-7b4988cde5c5')

    const response = await useDirectus(uploadFiles(form))

    if (response?.id) {
      formData.banner = getAssetId(response.id)
      bannerUploading.value = false
    }
  } catch (error) {
    console.error('Error uploading banner:', error)
    // Consider adding user-facing error notification here
  }
}

function handleFileSelect(file: DirectusFile) {
  console.log(file)
  formData.banner = getAssetId(file)
  librarySlideover.value = false
}

definePageMeta({
  layout: 'ams',
  auth: true,
  access_level: 2,
})
</script>

<template>
  <div>
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

    <!-- Loading state for initial data fetch -->
    <div v-if="pending && !data" class="flex justify-center items-center h-64">
      <UProgress animation="carousel" />
    </div>
    <template v-else>
      <UInput
        v-model="searchInput"
        highlight
        variant="outline"
        icon="i-lucide-search"
        placeholder="Name, Channel, Autor suchen..."
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
            <span class="items-center flex">
              <UIcon :name="item.icon" class="size-4 mr-1" />
              {{ item.label }}
            </span>
          </template>
        </URadioGroup>
      </div>

      <UModal
        @update:open="(value) => value === false && handleCancel()"
        v-model:open="modalOpen"
        :title="`Comm-Link ${editId ? 'bearbeiten' : 'erstellen'}`"
        :fullscreen="true"
        :ui="{
          content:
            'bg-(--ui-bg-muted)/50 backdrop-blur-xs divide-(--ui-primary)/20',
        }"
      >
        <template #body>
          <UForm
            ref="formRef"
            :state="formData"
            :schema="commLinkSchema"
            @submit="onFormSubmit"
            @error="onError"
          >
            <template #default>
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
                        :loading="formRef?.loading"
                        variant="subtle"
                        type="submit"
                        label="Speichern"
                        class="flex-1 flex justify-center"
                      />
                      <UButton
                        v-if="editId"
                        @click="handleDelete"
                        variant="outline"
                        type="button"
                        color="error"
                        icon="i-lucide-trash-2"
                        class="w-fit flex justify-center"
                      />
                    </div>
                  </template>
                </UCard>
                <div class="lg:w-2/3 w-full px-4 relative">
                  <UFormField name="content" id="contentField">
                    <UiEditor v-model="formData.content" />
                    <template #error="{ error }">
                      <span
                        class="absolute bottom-6 ml-2 text-red-500 text-sm"
                        >{{ error }}</span
                      >
                    </template>
                  </UFormField>
                </div>
                <div
                  class="w-full lg:w-1/3 px-4 mb-4 lg:mb-0 lg:px-0 space-y-4"
                >
                  <UCard variant="ams" :ui="{ body: '!pt-2' }">
                    <template #header>
                      <div class="prose prose-invert">
                        <h3>Banner</h3>
                      </div>
                    </template>
                    <template #default>
                      <div class="space-y-4">
                        <UFormField name="banner" id="bannerField">
                          <AMSGlobalFileDrawer
                            v-model="bannerInput"
                            upload-folder-id="c558dbe9-3f85-4c86-bdac-7b4988cde5c5"
                          />
                        </UFormField>
                      </div>
                    </template>
                  </UCard>
                  <UCard variant="ams" :ui="{ body: '!pt-2' }">
                    <template #header>
                      <div class="prose prose-invert">
                        <h3>Details</h3>
                      </div>
                    </template>
                    <template #default>
                      <div class="space-y-4">
                        <UFormField
                          name="status"
                          label="Status"
                          id="statusField"
                        >
                          <USelectMenu
                            v-model="formData.status"
                            :items="statusOptions"
                            value-key="value"
                            label-key="label"
                            variant="ams"
                            class="w-full"
                          />
                        </UFormField>
                        <UFormField name="name" label="Titel" id="nameField">
                          <UInput
                            v-model="formData.name"
                            highlight
                            placeholder="z.B. Monthly Report April 2955"
                            class="w-full"
                          />
                        </UFormField>
                        <UFormField
                          name="channel"
                          label="Channel"
                          id="channelField"
                        >
                          <USelectMenu
                            v-model="formData.channel"
                            variant="ams"
                            value-key="id"
                            label-key="name"
                            :items="channels ?? []"
                            placeholder="z.B. Monthly Report"
                            class="w-full"
                          />
                        </UFormField>
                      </div>
                    </template>
                  </UCard>
                  <UCard variant="ams" class="hidden lg:block">
                    <template #default>
                      <div class="flex justify-between space-x-2">
                        <UButton
                          @click="handleCancel"
                          variant="subtle"
                          color="error"
                          type="button"
                          label="Abbrechen"
                          class="flex-1 flex justify-center"
                          size="xl"
                        />
                        <UButton
                          :loading="formRef?.loading"
                          variant="subtle"
                          type="submit"
                          label="Speichern"
                          class="flex-1 flex justify-center"
                          size="xl"
                        />
                        <UButton
                          v-if="editId"
                          @click="handleDelete"
                          variant="outline"
                          type="button"
                          color="error"
                          icon="i-lucide-trash-2"
                          class="w-fit flex justify-center"
                          size="xl"
                        />
                      </div>
                    </template>
                  </UCard>
                </div>
              </div>
            </template>
          </UForm>
        </template>
      </UModal>

      <div
        v-if="!filteredCommLinks.length && !pending"
        class="text-center py-10 text-gray-500"
      >
        Keine Comm-Links gefunden, die den aktuellen Filtern entsprechen.
      </div>
      <div
        v-else
        class="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
      >
        <AMSUiCommLinkCard
          v-for="item in filteredCommLinks"
          :data="item"
          :key="item.id"
          @select="handleSelection"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DirectusFile } from '~~/types'

const emit = defineEmits<{
  'selected:file': [DirectusFile]
}>()

const props = defineProps<{
  uploadFolderId?: string
}>()

const model = defineModel<DirectusFile | null | undefined>()

type UploadedFilePlaceholder = {
  __placeholder: true
  id: string
  name: string
  size: number
  type?: string | null
  previewUrl?: string
}

type UploadEntry = File | UploadedFilePlaceholder
type UploadModelValue = UploadEntry | UploadEntry[] | null

const uploadModel = ref<UploadModelValue>(null)
const librarySlideover = ref(false)
const uploading = ref(false)
const selectedFileLoaded = ref(false)
const toast = useToast()

const selectedFile = computed(() => model.value ?? null)

const selectedFilePreview = computed(() =>
  selectedFile.value ? getAssetId(selectedFile.value) : ''
)

const selectedFileIsImage = computed(() =>
  Boolean(selectedFile.value?.type?.startsWith('image'))
)

function resolveDirectusFileName(
  file: DirectusFile | null | undefined
): string {
  if (!file) {
    return ''
  }

  return (
    file.filename_download || file.title || file.filename_disk || file.id || ''
  )
}

const selectedFileName = computed(() =>
  resolveDirectusFileName(selectedFile.value)
)

function createObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

const isBrowserFile = (value: unknown): value is File =>
  typeof File !== 'undefined' && value instanceof File

const isUploadedPlaceholder = (
  value: unknown
): value is UploadedFilePlaceholder =>
  Boolean(
    value &&
      typeof value === 'object' &&
      '__placeholder' in (value as Record<string, unknown>)
  )

function createPlaceholderFromDirectus(
  file: DirectusFile
): UploadedFilePlaceholder {
  const rawSize = Number(file.filesize ?? 0)

  return {
    __placeholder: true,
    id: file.id,
    name: resolveDirectusFileName(file) || file.id,
    size: Number.isFinite(rawSize) ? rawSize : 0,
    type: file.type ?? null,
    previewUrl:
      file.type?.startsWith('image') && file.id ? getAssetId(file) : undefined,
  }
}

function updateUploadPreview(file: DirectusFile | null) {
  if (!file) {
    uploadModel.value = null
    return
  }

  const placeholder = createPlaceholderFromDirectus(file)

  if (
    isUploadedPlaceholder(uploadModel.value) &&
    uploadModel.value.id === placeholder.id &&
    uploadModel.value.previewUrl === placeholder.previewUrl
  ) {
    return
  }

  uploadModel.value = placeholder
}

watch(
  () => uploadModel.value,
  async (value) => {
    if (!value) {
      if (model.value) {
        model.value = null
      }
      return
    }

    if (Array.isArray(value) && value.length === 0) {
      if (model.value) {
        model.value = null
      }
      return
    }

    const entries = Array.isArray(value) ? value : [value]
    const filesToUpload = entries.filter(isBrowserFile)

    if (!filesToUpload.length) {
      return
    }

    for (const file of filesToUpload) {
      await uploadFile(file)
    }
  }
)

watch(
  () => model.value,
  (file) => {
    selectedFileLoaded.value = false
    updateUploadPreview(file ?? null)
  },
  { immediate: true }
)

async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  if (props.uploadFolderId) {
    formData.append('folder', props.uploadFolderId)
  }

  try {
    uploading.value = true

    const response = await useDirectus(uploadFiles(formData))
    const uploadedFile = Array.isArray(response) ? response[0] : response

    if (!uploadedFile || typeof uploadedFile !== 'object') {
      throw new Error('Ungültige Upload-Antwort erhalten')
    }

    handleFileSelect(uploadedFile as DirectusFile)
    toast.add({
      title: 'Upload abgeschlossen',
      description: `${file.name} wurde erfolgreich hochgeladen.`,
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    console.error('Fehler beim Hochladen der Datei:', error)
    toast.add({
      title: 'Upload fehlgeschlagen',
      description: 'Bitte versuchen Sie es erneut.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    uploading.value = false
  }
}

function handleFileSelect(file: DirectusFile) {
  model.value = file
  updateUploadPreview(file)
  emit('selected:file', file)
  librarySlideover.value = false
}
</script>

<template>
  <div>
    <UFileUpload
      v-model="uploadModel"
      icon="i-lucide-image"
      label="Ziehen Sie Ihre Bilder hierher"
      description="SVG, PNG, JPG oder GIF"
      color="primary"
      :interactive="false"
      :disabled="uploading"
      class="size-full aspect-24/9 transition-all"
      :ui="{
        base: 'hover:border-primary transition-all',
      }"
    >
      <template #file-leading="{ file }">
        <div
          class="size-full overflow-hidden rounded-lg"
          :class="[selectedFileLoaded ? 'bg-black' : 'bg-(--ui-bg-muted)/30']"
        >
          <USkeleton v-if="!selectedFileLoaded" class="size-full" />
          <NuxtImg
            v-if="isUploadedPlaceholder(file) && file.previewUrl"
            :src="model?.id"
            alt=""
            class="size-full object-cover"
            width="1500px"
            @load="selectedFileLoaded = true"
          />
          <div v-else class="flex h-full w-full items-center justify-center">
            <UIcon name="i-lucide-file" class="size-6 text-(--ui-primary)" />
          </div>
        </div>
      </template>
      <template #actions="{ open }">
        <UButton
          label="Bild hochladen"
          icon="i-lucide-upload"
          variant="outline"
          :loading="uploading"
          @click="open()"
        />
        <USlideover
          v-model:open="librarySlideover"
          :ui="{
            header: 'p-0!',
            content:
              'max-w-5xl ring-(--ui-primary)/10 divide-(--ui-primary)/10',
          }"
        >
          <UButton
            icon="i-lucide-folder-open"
            label="Datei Bibliothek"
            variant="subtle"
          />
          <template #body>
            <UiFileLibrary
              :all-types="false"
              @selected:file="handleFileSelect"
            />
          </template>
        </USlideover>
      </template>
    </UFileUpload>

    <!-- <div v-if="selectedFile" class="mt-4 space-y-3">
      <div
        v-if="selectedFileIsImage && selectedFilePreview"
        class="aspect-[24/9] w-full overflow-hidden rounded-lg border border-(--ui-primary)/15 bg-(--ui-bg-muted)/40"
      >
        <NuxtImg
          :src="selectedFilePreview"
          :alt="selectedFileName || 'Ausgewähltes Bild'"
          class="size-full object-cover"
        />
      </div>
      <div
        v-else
        class="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-(--ui-primary)/30 bg-(--ui-bg-muted)/30 text-(--ui-text-muted)"
      >
        <UIcon name="i-lucide-file" class="size-8 text-(--ui-primary)" />
        <span class="text-sm">Keine Vorschau verfügbar</span>
      </div>
      <div class="flex items-center justify-between text-sm text-(--ui-text-muted)">
        <span class="truncate">
          {{ selectedFileName || 'Bild ausgewählt' }}
        </span>
        <UBadge
          v-if="selectedFile?.type"
          color="primary"
          variant="subtle"
          class="uppercase text-[10px] tracking-wide"
        >
          {{ selectedFile.type }}
        </UBadge>
      </div>
    </div>

    <UFileUpload class="w-96 min-h-48" :ui="{ file: '' }">
      <template #file-leading="{ file }">
        <UAvatar
          :as="{ img: 'img' }"
          :src="createObjectUrl(file)"
          class="size-full rounded-lg"
        />
      </template>
      <template #file-trailing="{ file }">
        <UButton
          icon="i-lucide-x"
          color="primary"
          variant="outline"
          size="sm"
          class="absolute -translate-x-1/2 -translate-y-1/2 bg-elevated"
        />
      </template> -->
    <!-- <template #file="{ file }">
        <div class="p-4 rounded">
          <p class="font-medium">{{ file.name }}</p>
          <img :src="createObjectUrl(file)" />
          <p class="text-sm text-gray-600">
            Größe: {{ (file.size / 1024).toFixed(2) }} KB
          </p>
        </div>
      </template> -->
    <!-- </UFileUpload> -->
  </div>
</template>

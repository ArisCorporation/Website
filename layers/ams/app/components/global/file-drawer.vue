<script setup lang="ts">
import type { DirectusFile } from '~~/types'

const emit = defineEmits<{
  'selected:file': [DirectusFile]
}>()

const props = defineProps<{
  uploadFolderId?: string
}>()

const model = defineModel<DirectusFile | null | undefined>()

const uploadModel = ref<File | null>(null)
const librarySlideover = ref(false)
const uploading = ref(false)
const toast = useToast()
let processedFiles = new WeakSet<File>()

const selectedFile = computed(() => model.value ?? null)

const selectedFilePreview = computed(() =>
  selectedFile.value ? getAssetId(selectedFile.value) : ''
)

const selectedFileIsImage = computed(() =>
  Boolean(selectedFile.value?.type?.startsWith('image'))
)

const selectedFileName = computed(() => {
  if (!selectedFile.value) {
    return ''
  }

  return (
    selectedFile.value.filename_download ||
    selectedFile.value.title ||
    selectedFile.value.filename_disk ||
    selectedFile.value.id ||
    ''
  )
})

const isBrowserFile = (value: unknown): value is File =>
  typeof File !== 'undefined' && value instanceof File

function createObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

watch(
  () => uploadModel.value,
  async (value) => {
    if (Array.isArray(value) && value.length === 0) {
      processedFiles = new WeakSet<File>()
      model.value = null
      return
    }

    if (!value) {
      processedFiles = new WeakSet<File>()
      return
    }

    const files = Array.isArray(value) ? value : [value]
    const pendingUploads = files.filter(
      (entry) => isBrowserFile(entry) && !processedFiles.has(entry)
    )

    for (const file of pendingUploads) {
      processedFiles.add(file)
      await uploadFile(file)
    }
  }
)

watch(
  () => model.value,
  (file, previous) => {
    if (!file && previous) {
      uploadModel.value = null
      processedFiles = new WeakSet<File>()
    }
  }
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

    handleFileSelect(uploadedFile as DirectusFile, { fromUpload: true })
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

function handleFileSelect(
  file: DirectusFile,
  { fromUpload = false }: { fromUpload?: boolean } = {}
) {
  if (!fromUpload) {
    uploadModel.value = null
    processedFiles = new WeakSet<File>()
  }

  model.value = file
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
        <div class="size-full overflow-hidden rounded-lg bg-(--ui-bg-muted)/30">
          <img
            v-if="file?.type?.startsWith?.('image')"
            :src="createObjectUrl(file)"
            :alt="file.name"
            class="size-full object-cover"
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

    <div v-if="selectedFile" class="mt-4 space-y-3">
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
      <div
        class="flex items-center justify-between text-sm text-(--ui-text-muted)"
      >
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
  </div>
</template>

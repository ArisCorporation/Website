<script setup lang="ts">
import type { DirectusFile } from '~~/types'

const emit = defineEmits<{
  'selected:file': [DirectusFile]
}>()

const model = defineModel<File | File[] | null | undefined>()
const librarySlideover = ref(false)
const uploading = ref(false)
const toast = useToast()

function createObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

watch(
  () => model.value,
  async (value) => {
    if (!value || uploading.value) {
      return
    }

    const files = Array.isArray(value) ? value : [value]

    for (const file of files) {
      await uploadFile(file)
    }

    model.value = null
  }
)

async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

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
  emit('selected:file', file)
  librarySlideover.value = false
}
</script>

<template>
  <UFileUpload
    v-model="model"
    icon="i-lucide-image"
    label="Ziehen Sie Ihre Bilder hierher"
    description="SVG, PNG, JPG oder GIF"
    color="primary"
    :interactive="false"
    :disabled="uploading"
    class="size-full aspect-[24/9] transition-all"
    :ui="{
      base: 'hover:border-primary transition-all',
    }"
  >
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
          header: '!p-0',
          content: 'max-w-5xl ring-(--ui-primary)/10 divide-(--ui-primary)/10',
        }"
      >
        <UButton
          icon="i-lucide-folder-open"
          label="Datei Bibliothek"
          variant="subtle"
        />
        <template #body>
          <UiFileLibrary :all-types="false" @selected:file="handleFileSelect" />
        </template>
      </USlideover>
    </template>
  </UFileUpload>
  <UFileUpload class="w-96 min-h-48" :ui="{ file: 'test56' }">
    <template #file="{ file }">
      <div class="p-4 rounded">
        <p class="font-medium">{{ file.name }}</p>
        <img :src="createObjectUrl(file)" />
        <p class="text-sm text-gray-600">
          Größe: {{ (file.size / 1024).toFixed(2) }} KB
        </p>
      </div>
    </template>
  </UFileUpload>
</template>

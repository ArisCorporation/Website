<script setup lang="ts">
import type { DirectusFile } from '~~/types'

const profileEdit = useUserProfileEditStore()
const authStore = useAuthStore()

const fileInputRef = useTemplateRef('fileInputRef')
const showCropperModal = ref(false)
const imageToCropSrc = ref<string | null>(null)
let selectedFileForUpload: File | null = null

interface TitleOption {
  label: string
  value: string | null
}
interface GenderOption {
  label: string
  value: string | null
}

const titleOptions = reactive<TitleOption[]>([
  { label: 'Kein Titel', value: null },
  { label: 'Dr.', value: 'Dr.' },
  { label: 'Dr. Med.', value: 'Dr. Med.' },
  { label: 'Prof. Med.', value: 'Prof. Med.' },
  { label: 'Dipl.', value: 'Dipl.' },
  { label: 'Dipl. Ing.', value: 'Dipl. Ing.' },
])

const genderOptions = reactive<GenderOption[]>([
  { label: 'Männlich', value: 'male' },
  { label: 'Weiblich', value: 'female' },
])

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (!file.type.startsWith('image/')) {
      // Handle non-image file selection (e.g., show an error)
      console.error('Selected file is not an image.')
      return
    }
    selectedFileForUpload = file
    imageToCropSrc.value = URL.createObjectURL(file)
    showCropperModal.value = true
    // Reset file input to allow selecting the same file again if needed
    target.value = ''
  }
}

async function handleCropComplete(croppedImageBlob: Blob) {
  if (!selectedFileForUpload || !croppedImageBlob) return

  showCropperModal.value = false
  const fileName = selectedFileForUpload.name // Use original file name or generate a new one

  try {
    const formData = new FormData()
    formData.append('file', croppedImageBlob, fileName)
    formData.append(
      'title',
      `Avatar for ${profileEdit.formData.first_name || 'user'}`
    )
    // You might want to specify a folder in Directus if you have one for avatars
    // formData.append('folder', 'YOUR_AVATAR_FOLDER_UUID');

    const uploadedFile = await useDirectus(uploadFiles(formData))
    profileEdit.formData.avatar = uploadedFile.id // Assuming avatar stores the file ID
  } catch (error) {
    console.error('Error uploading avatar:', error)
    // Handle upload error (e.g., show a notification to the user)
  } finally {
    if (imageToCropSrc.value) {
      URL.revokeObjectURL(imageToCropSrc.value)
      imageToCropSrc.value = null
    }
    selectedFileForUpload = null
  }
}

function handleCropCancel() {
  showCropperModal.value = false
  if (imageToCropSrc.value) {
    URL.revokeObjectURL(imageToCropSrc.value)
    imageToCropSrc.value = null
  }
  selectedFileForUpload = null
}
</script>

<template>
  <UCard variant="ams" class="animated-border">
    <template #header>
      <div class="prose-h4:my-0 prose-p:my-0">
        <h4>Persönliche Daten</h4>
        <p class="text-xs pt-1 text-(--ui-text-muted)">Deine Identität</p>
      </div>
    </template>
    <template #default>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField
          label="Vorname"
          required
          name="first_name"
          size="xs"
          class="w-full"
        >
          <UInput
            v-model="profileEdit.formData.first_name"
            highlight
            size="md"
            placeholder="Chris"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Zweiter Vorname"
          name="middle_name"
          hint="Optional"
          size="xs"
          class="w-full"
        >
          <UInput
            v-model="profileEdit.formData.middle_name"
            highlight
            size="md"
            placeholder="Chris"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Nachname"
          name="last_name"
          hint="Optional"
          size="xs"
          class="w-full"
        >
          <UInput
            v-model="profileEdit.formData.last_name"
            highlight
            size="md"
            placeholder="Roberts"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Benutzername" name="slug" size="xs" class="w-full">
          <UInput
            :model-value="
              `${profileEdit.formData.first_name}${
                profileEdit.formData.middle_name
                  ? '.' + profileEdit.formData.middle_name
                  : ''
              }${
                profileEdit.formData.last_name
                  ? '.' + profileEdit.formData.last_name
                  : ''
              }`.toLowerCase()
            "
            disabled
            highlight
            size="md"
            placeholder="chris.roberts"
            class="w-full"
          />
        </UFormField>
        <!-- TODO: Add Avatar function -->
        <UFormField label="Avatar" name="avatar" size="xs" class="w-full">
          <UInput
            ref="fileInputRef"
            highlight
            size="md"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
          <UButton
            icon="i-lucide-camera"
            label="Avatar ändern"
            variant="outline"
            @click="fileInputRef?.inputRef?.click()"
          />
        </UFormField>
        <AMSPagesProfileImageCropperModal
          v-if="showCropperModal && imageToCropSrc"
          :image-url="imageToCropSrc"
          :aspect-ratio="270 / 320"
          @cropped="handleCropComplete"
          @cancel="handleCropCancel"
          @close="handleCropCancel"
        />
        <UFormField
          label="Titel"
          hint="Optional"
          name="title"
          size="xs"
          class="w-full"
        >
          <USelectMenu
            v-model="profileEdit.formData.title"
            :items="titleOptions"
            variant="ams"
            size="md"
            placeholder="z.B. Dr. Med."
            value-key="value"
            label-key="label"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Passwort" name="password" size="xs" class="w-full">
          <UInput
            v-model="profileEdit.formData.password"
            highlight
            size="md"
            placeholder="************"
            type="password"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="RSI Handle"
          name="rsi_handle"
          size="xs"
          class="w-full"
        >
          <UInput
            v-model="profileEdit.formData.rsi_handle"
            highlight
            size="md"
            placeholder="chris_roberts"
            class="w-full"
          />
        </UFormField>
      </div>
    </template>
  </UCard>
</template>

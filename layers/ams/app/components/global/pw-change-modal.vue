<script setup lang="ts">
import { useToast } from '#imports'
import { updateMe } from '@directus/sdk'

const props = withDefaults(defineProps<{ open?: boolean }>(), { open: true })
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const formData = reactive({ password: '' })
const saving = ref(false)
const errorMessage = ref<string | null>(null)

const modalOpen = computed({
  get: () => props.open,
  set: (val: boolean) => {
    if (!val) emit('close')
  },
})

const pwRules = {
  min: (v: string) => v.length >= 8,
  upper: (v: string) => /[A-Z]/.test(v),
  lower: (v: string) => /[a-z]/.test(v),
  number: (v: string) => /[0-9]/.test(v),
}

const pwValid = computed(
  () =>
    pwRules.min(formData.password) &&
    pwRules.upper(formData.password) &&
    pwRules.lower(formData.password) &&
    pwRules.number(formData.password)
)

function firstPwError(): string | null {
  const v = formData.password
  if (!pwRules.min(v)) return 'Mindestens 8 Zeichen'
  if (!pwRules.upper(v)) return 'Mindestens ein Großbuchstabe'
  if (!pwRules.lower(v)) return 'Mindestens ein Kleinbuchstabe'
  if (!pwRules.number(v)) return 'Mindestens eine Zahl'
  return null
}

async function onSubmit() {
  errorMessage.value = null
  if (!pwValid.value) {
    errorMessage.value = firstPwError()
    return
  }

  try {
    saving.value = true
    // Update current user's password and clear temporary flag in one request
    await useDirectus(
      updateMe({
        password: formData.password,
        temporary_password: false,
      })
    )

    // Refresh auth store so layout condition (temporary_password) updates
    const authStore = useAuthStore()
    await authStore.refreshCurrentUser()
    useToast().add({
      title: 'Passwort aktualisiert',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    emit('success')
    emit('close')
  } catch (err: any) {
    // Attempt to extract a meaningful error message from Directus
    const directusErrors =
      err?.errors || err?.data?.errors || err?.response?._data?.errors
    const message =
      directusErrors?.[0]?.message ||
      err?.message ||
      'Unbekannter Fehler beim Aktualisieren.'
    errorMessage.value = message
    useToast().add({
      title: 'Fehler',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <UModal v-model:open="modalOpen" :dismissible="false">
    <template #content>
      <UCard variant="amsModal">
        <template #header><h2>Neues Passwort festlegen</h2></template>
        <template #default>
          <UForm :state="formData" class="space-y-3" @submit="onSubmit">
            <UFormField name="password" label="Passwort">
              <UInput
                v-model="formData.password"
                type="password"
                autocomplete="new-password"
                class="w-full"
              />
              <template #help>
                <div
                  class="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5"
                >
                  <div
                    :class="
                      pwRules.min(formData.password)
                        ? 'text-green-600 dark:text-green-400'
                        : ''
                    "
                  >
                    • Mindestens 8 Zeichen
                  </div>
                  <div
                    :class="
                      pwRules.upper(formData.password)
                        ? 'text-green-600 dark:text-green-400'
                        : ''
                    "
                  >
                    • Mindestens ein Großbuchstabe
                  </div>
                  <div
                    :class="
                      pwRules.lower(formData.password)
                        ? 'text-green-600 dark:text-green-400'
                        : ''
                    "
                  >
                    • Mindestens ein Kleinbuchstabe
                  </div>
                  <div
                    :class="
                      pwRules.number(formData.password)
                        ? 'text-green-600 dark:text-green-400'
                        : ''
                    "
                  >
                    • Mindestens eine Zahl
                  </div>
                </div>
              </template>
            </UFormField>
            <UButton
              type="submit"
              :loading="saving"
              :disabled="!pwValid || saving"
              variant="subtle"
              class="w-full justify-center"
            >
              Speichern
            </UButton>
          </UForm>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useToast } from '#imports'
import type { DirectusRole } from '~~/types'

const emit = defineEmits<{
  (e: 'added'): void
}>()

const isOpen = ref(false)
const isLoading = ref(false)

const form = reactive({
  title: null as string | null,
  first_name: '',
  middle_name: '' as string | null,
  last_name: '' as string | null,
  role: '' as string | null,
  discord_id: '' as string | null,
  send_discord_dm: true,
})

const titleOptions = reactive([
  { label: 'Kein Titel', value: null },
  { label: 'Dr.', value: 'Dr.' },
  { label: 'Dr. Med.', value: 'Dr. Med.' },
  { label: 'Prof. Med.', value: 'Prof. Med.' },
  { label: 'Dipl.', value: 'Dipl.' },
  { label: 'Dipl. Ing.', value: 'Dipl. Ing.' },
])

const roleOptions = reactive([
  { id: '1de3fee4-090e-40fa-ad12-c0bf6c48f8dd', label: 'Vorstand' },
  { id: '35715c93-a203-46d6-8ae8-122e726eabaa', label: 'Freier Mitarbeiter' },
  { id: '58566123-599f-4bd8-a1ac-ce25372d284b', label: 'Anwärter' },
  { id: 'cd587d88-0ccd-4189-a2c2-46a3bbfc3c04', label: 'Mitarbeiter' },
])

const { data: discordUserList, pending: discordUserListPending } = useAsyncData(
  'global:discord_users',
  () => $fetch('/api/ams/getDiscordUser')
)

const loginUsername = computed(() => {
  const parts = [form.first_name, form.middle_name, form.last_name]
    .filter(Boolean)
    .map((p) => String(p).trim())
    .filter((p) => p.length > 0)
  return parts.join('.').toLowerCase().replace(/\s/g, '')
})

const loginEmail = computed(() => `${loginUsername.value}@ariscorp.de`)
const fullName = computed(() =>
  [form.first_name, form.middle_name, form.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
)

function generateTempPassword(length = 12) {
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const nums = '0123456789'
  const all = lower + upper + nums
  // ensure at least one of each category
  const req = [
    lower[Math.floor(Math.random() * lower.length)],
    upper[Math.floor(Math.random() * upper.length)],
    nums[Math.floor(Math.random() * nums.length)],
  ]
  for (let i = req.length; i < length; i++) {
    req.push(all[Math.floor(Math.random() * all.length)])
  }
  // shuffle
  for (let i = req.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[req[i], req[j]] = [req[j], req[i]]
  }
  return req.join('')
}

function openSlideover() {
  isOpen.value = true
}

function closeSlideover() {
  isOpen.value = false
}

async function handleCreate() {
  if (!form.first_name || !form.role || !form.discord_id) {
    useToast().add({
      title: 'Pflichtfelder fehlen',
      description: 'Vorname, Position und Discord-Benutzer sind erforderlich.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  isLoading.value = true
  try {
    const tempPw = generateTempPassword(12)
    const payload: any = {
      first_name: form.first_name,
      middle_name: form.middle_name || null,
      last_name: form.last_name || null,
      title: form.title,
      email: loginEmail.value,
      role: form.role, // role id
      status: 'active',
      temporary_password: true,
      password: tempPw,
      discord_id: form.discord_id || null,
    }

    await useDirectus(createItems('directus_users', payload))

    if (form.send_discord_dm && form.discord_id) {
      const created_date = new Date()
      await useFetch(
        'https://studio.ariscorp.de/flows/trigger/5a39f82d-6037-4db9-a948-837219ac7cd4',
        {
          method: 'POST',
          body: {
            discord_id: form.discord_id,
            name: fullName.value,
            created_ts: created_date.toISOString(),
            username: loginUsername.value,
            password: tempPw,
          },
        }
      )
    }

    useToast().add({
      title: 'Mitglied erstellt',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    emit('added')
    closeSlideover()
    // reset form
    form.title = null
    form.first_name = ''
    form.middle_name = null
    form.last_name = null
    form.role = null
    form.discord_id = null
    form.send_discord_dm = true
  } catch (err: any) {
    console.error('Create member failed:', err)
    const message =
      err?.errors?.[0]?.message ||
      err?.data?.message ||
      err?.response?._data?.message ||
      err?.message ||
      'Unbekannter Fehler beim Erstellen.'
    useToast().add({
      title: 'Fehler',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <USlideover
    v-model:open="isOpen"
    :ui="{
      content: 'max-w-xl ring-(--ui-primary)/10 divide-(--ui-primary)/10',
    }"
  >
    <template #default>
      <slot :openSlideover="openSlideover" />
    </template>
    <template #header>
      <h3 class="!my-0">Neues Mitglied hinzufügen</h3>
    </template>
    <template #body>
      <div class="space-y-4">
        <UCard variant="ams">
          <div class="flex flex-col gap-4">
            <UFormField label="Titel" name="title" size="xs" class="w-full">
              <USelectMenu
                v-model="form.title"
                :items="titleOptions"
                variant="ams"
                size="md"
                placeholder="z.B. Dr. Med."
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Vorname"
              name="first_name"
              required
              size="xs"
              class="w-full"
            >
              <UInput
                v-model="form.first_name"
                highlight
                size="md"
                placeholder="Chris"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Zweiter Vorname"
              name="middle_name"
              size="xs"
              class="w-full"
            >
              <UInput
                v-model="form.middle_name"
                highlight
                size="md"
                placeholder="Rob"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Nachname"
              name="last_name"
              size="xs"
              class="w-full"
            >
              <UInput
                v-model="form.last_name"
                highlight
                size="md"
                placeholder="Roberts"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Position"
              name="role"
              required
              size="xs"
              class="w-full"
            >
              <USelectMenu
                v-model="form.role"
                :items="roleOptions"
                variant="ams"
                size="md"
                value-key="id"
                label-key="label"
                placeholder="z.B. Mitarbeiter"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Discord Benutzer"
              name="discord_user"
              required
              size="xs"
              class="w-full"
            >
              <USelectMenu
                v-model="form.discord_id"
                :items="
                  discordUserList?.sort((a, b) =>
                    a.label.localeCompare(b.label)
                  )
                "
                variant="ams"
                size="md"
                placeholder="Discord Benutzer"
                class="w-full"
                label-key="label"
                value-key="id"
                :loading="discordUserListPending"
              >
                <template #leading>
                  <img
                    v-if="form.discord_id"
                    :src="
                      discordUserList?.find((e) => e.id === form.discord_id)
                        ?.profile_image
                    "
                    class="size-5 rounded-full object-cover mr-2"
                  />
                  <USkeleton v-else class="size-5 rounded-full mr-2" />
                </template>
                <template #item-leading="{ item }">
                  <img
                    :src="item.profile_image"
                    class="size-5 rounded-full object-cover mr-2"
                  />
                </template>
              </USelectMenu>
            </UFormField>
            <UFormField
              label="Benutzername"
              name="username"
              size="xs"
              class="w-full"
            >
              <UInput :model-value="loginUsername" disabled class="w-full" />
            </UFormField>
            <UFormField
              label="Vollständiger Name"
              name="full_name"
              size="xs"
              class="w-full"
            >
              <UInput :model-value="fullName" disabled class="w-full" />
            </UFormField>
            <div>
              <UCheckbox
                v-model="form.send_discord_dm"
                label="Zugangsdaten via Discord senden"
              />
              <p class="text-xs text-(--ui-text-muted) mt-1">
                Es wird ein temporäres Passwort generiert und mit dem
                Benutzernamen an den ausgewählten Discord-Benutzer gesendet.
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </template>
    <template #footer>
      <div class="ml-auto items-center space-x-4 flex">
        <UButton @click="isOpen = false" variant="outline" label="Abbrechen" />
        <UButton
          :loading="isLoading"
          :disabled="isLoading || !form.first_name || !form.role || !form.discord_id"
          @click="handleCreate"
          icon="i-lucide-check"
          trailing
          label="Mitglied erstellen"
        />
      </div>
    </template>
  </USlideover>
</template>

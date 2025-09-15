<script setup lang="ts">
import { some } from 'lodash'

const store = useUserProfileEditStore()

const roleOptions = reactive([
  { label: 'Rekrutierung', value: 'recruitment' },
  { label: 'Marketing & Presse', value: 'marketing_and_press' },
  { label: 'Inhaltsersteller', value: 'content_writer' },
])

const { data: departments } = useLazyAsyncData(
  'global:simple_departments',
  () =>
    useDirectus(
      readItems('departments', {
        limit: -1,
        fields: ['*'],
        sort: ['name'],
      })
    )
)

const { data: discordUserList, pending: discordUserListPending } = useAsyncData(
  'global:discord_users',
  () => $fetch('/api/ams/getDiscordUser')
)

// const activeRoles = computed(() => {
//   const roles = store.formData.roles

//   if (store?.formData?.head_of_department) roles?.push('hod')

//   return roles
// })
</script>

<template>
  <UCard variant="ams" class="animated-border">
    <template #header>
      <div class="prose-h4:my-0 prose-p:my-0">
        <h4>Orga Informationen</h4>
        <p class="text-xs pt-1 text-(--ui-text-muted)">
          Organisationsbezogene Daten
        </p>
      </div>
    </template>
    <template #default>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField
          label="Primäre Abteilung"
          name="department"
          size="xs"
          class="w-full"
        >
          <div class="w-full flex gap-x-2">
            <UButton
              v-if="store.formData.primary_department"
              @click="store.formData.primary_department = null"
              icon="i-lucide-x"
              variant="subtle"
            />
            <USelectMenu
              v-model="store.formData.primary_department"
              :items="departments"
              variant="ams"
              size="md"
              value-key="id"
              label-key="name"
              placeholder="z.B. Logistik"
              class="flex-1"
            />
          </div>
        </UFormField>
        <UFormField
          label="Rollen"
          name="roles"
          size="xs"
          class="w-full prose-p:my-0"
        >
          <div class="flex flex-wrap">
            <UCheckbox
              disabled
              v-model="store.formData.head_of_department"
              label="Abteilungsleiter"
              class="mr-2 mt-auto translate-y-2"
            />
            <UCheckboxGroup
              v-model="store.formData.roles"
              value-key="value"
              disabled
              orientation="horizontal"
              :items="roleOptions"
              class="translate-y-2"
            />
          </div>
        </UFormField>
        <UFormField
          label="Sekundäre Abteilung"
          name="department"
          size="xs"
          class="w-full"
        >
          <div class="w-full flex gap-x-2">
            <UButton
              v-if="store.formData.secondary_department"
              @click="store.formData.secondary_department = null"
              icon="i-lucide-x"
              variant="subtle"
            />
            <USelectMenu
              v-model="store.formData.secondary_department"
              :items="departments"
              variant="ams"
              size="md"
              value-key="id"
              label-key="name"
              placeholder="z.B. Logistik"
              class="w-full"
            />
          </div>
        </UFormField>
        <UFormField
          label="Discord Benutzer"
          name="discord_user"
          size="xs"
          class="w-full"
        >
          <USelectMenu
            v-model="store.formData.discord_id"
            :items="
              discordUserList?.sort((a, b) => a.label.localeCompare(b.label))
            "
            variant="ams"
            size="md"
            placeholder="Discord Benutzer"
            class="w-full"
            label-key="label"
            value-key="id"
            :loading="discordUserListPending"
          >
            <template #leading="">
              <img
                v-if="store.formData.discord_id"
                :src="
                  discordUserList?.find(
                    (e) => e.id === store.formData.discord_id
                  )?.profile_image
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
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type {
  Company,
  Department,
  DirectusRole,
  DirectusUser,
  Ship,
  ShipModule,
  UserHangar,
} from '~~/types'

import { useToast } from '#imports'
import type { FormSubmitEvent } from '@nuxt/ui'
import {
  userProfileSchema,
  useUserProfileEditStore,
} from '@/stores/ams/profile-edit-store'

const props = defineProps<{ data: DirectusUser[]; search: string }>()
const emit = defineEmits(['refreshData'])

const expanded = ref({})

// Admin edit modal state
const showEditModal = ref(false)
const selectedUser = ref<DirectusUser | null>(null)
const profileEdit = useUserProfileEditStore()
const toast = useToast()

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UCheckbox = resolveComponent('UCheckbox')
const columns: TableColumn<DirectusUser>[] = [
  // {
  //   id: 'select',
  //   header: ({ table }) =>
  //     h(UCheckbox, {
  //       modelValue: table.getIsSomePageRowsSelected()
  //         ? 'indeterminate'
  //         : table.getIsAllPageRowsSelected(),
  //       'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
  //         table.toggleAllPageRowsSelected(!!value),
  //       'aria-label': 'Select all',
  //     }),
  //   cell: ({ row }) =>
  //     h(UCheckbox, {
  //       modelValue: row.getIsSelected(),
  //       'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
  //         row.toggleSelected(!!value),
  //       'aria-label': 'Select row',
  //     }),
  // },
  {
    accessorKey: 'avatar',
    header: '',
    meta: {
      class: {
        td: 'py-0 pr-0',
      },
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => `${getUserLabel(row.original) ?? ''}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const color = {
        active: 'success' as const,
        archived: 'error' as const,
        suspended: 'error' as const,
      }[row.original.status.toLowerCase() as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        getUserStatusLabel(row.original.status)
      )
    },
  },
  {
    accessorKey: 'role',
    header: 'Position',
    cell: ({ row }) => {
      const color = {
        administrator: 'warning' as const,
        administration: 'warning' as const,
        employee: 'primary' as const,
        freelancer: 'primary' as const,
        candidate: 'secondary' as const,
      }[(row.original.role as DirectusRole).name.toLowerCase() as string]

      return h(
        UBadge,
        { class: 'capitalize', variant: 'subtle', color },
        () => (row.original.role as DirectusRole)?.label
      )
    },
  },
  {
    accessorKey: 'department',
    header: 'Abteilung',
    cell: ({ row }) =>
      `${(row.original.primary_department as Department)?.name ?? ''}`,
  },
  {
    accessorKey: 'head_of_department',
    header: 'Abteilungsleiter',
    cell: ({ row }) => {
      const color = {
        true: 'primary' as const,
        false: 'secondary' as const,
      }[String(row.original.head_of_department)]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.original.head_of_department ? 'Ja' : 'Nein'
      )
    },
  },
  {
    id: 'actions',
  },
]

async function archive_user(id: string) {
  await useDirectus(
    updateUser(id, {
      status: 'archived',
    })
  )

  emit('refreshData')
}

async function unlock_user(id: string) {
  await useDirectus(
    updateUser(id, {
      status: 'active',
    })
  )

  emit('refreshData')
}

async function openEditProfile(user: DirectusUser) {
  // Fetch full user details for editing
  const fullUser = (await useDirectus(
    readUser(user.id, { fields: ['*'] })
  )) as DirectusUser
  selectedUser.value = fullUser
  profileEdit.initFormForUser(fullUser)
  showEditModal.value = true
}

function closeEditProfile() {
  showEditModal.value = false
  selectedUser.value = null
  profileEdit.clearApiValidationErrors()
  profileEdit.clearSubmitError()
}

async function handleAdminEditSubmit(event: FormSubmitEvent<any>) {
  if (!selectedUser.value) return
  const ok = await profileEdit.submitUserProfile(
    event.data,
    selectedUser.value.id
  )
  if (ok) {
    toast.add({
      title: 'Profil aktualisiert',
      color: 'green',
      icon: 'i-lucide-circle-check',
    })
    closeEditProfile()
    emit('refreshData')
  } else {
    toast.add({
      title: 'Aktualisierung fehlgeschlagen',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
  }
}

function getDropdownActions(user: DirectusUser): DropdownMenuItem[][] {
  return [
    [
      // {
      //   label: 'Copy user Id',
      //   icon: 'i-lucide-copy',
      //   onSelect: () => {
      //     // copy(user.id.toString())
      //     // toast.add({
      //     //   title: 'User ID copied to clipboard!',
      //     //   color: 'success',
      //     //   icon: 'i-lucide-circle-check',
      //     // })
      //   },
      // },
      {
        label: 'Biografie',
        avatar: {
          src: getAssetId(user.avatar),
        },
        to: `/ams/employees/${user.id}`,
        class: 'active:scale-95 transition',
      },
      {
        label: 'Hangar',
        icon: 'i-fluent-home-garage-24-regular',
        to: `/ams/hangar/${user.id}`,
        class: 'active:scale-95 transition',
      },
    ],
    [
      {
        label: 'Profil editieren',
        icon: 'i-lucide-edit',
        onSelect: () => openEditProfile(user),
        class: 'active:scale-95 transition',
      },
      {
        label: 'Hangar editieren',
        icon: 'i-lucide-edit',
        onSelect: () => console.log('test'),
        class: 'active:scale-95 transition',
      },
    ],
    [
      {
        label: 'Freischalten',
        icon: 'i-lucide-trash',
        color: 'success',
        onSelect: () => unlock_user(user.id),
      },
      {
        label: 'Archivieren',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => archive_user(user.id),
      },
    ],
  ]
}
</script>

<template>
  <div class="rounded-md border border-(--ui-primary)/20 overflow-hidden">
    <UTable
      ref="teamsUiTableRef"
      :columns="columns"
      :data="data"
      :ui="{
        thead:
          'bg-(--ui-primary)/5 hover:bg-(--ui-primary)/15 [&>tr]:after:bg-(--ui-primary)/20',
        th: ' text-(--ui-primary)',
        tbody: 'divide-(--ui-primary)/20',
        tr: 'hover:bg-(--ui-primary)/5',
        td: 'text-(--ui-text)',
      }"
      class="h-xl"
    >
      <template #avatar-cell="{ row }">
        <NuxtImg
          :src="
            row.original.avatar
              ? getAssetId(row.original.avatar)
              : '88adb941-f746-405d-bcc4-c2804fb48e33'
          "
          class="rounded size-8 object-cover aspect-square"
        />
      </template>
      <template #actions-cell="{ row }">
        <UDropdownMenu :items="getDropdownActions(row.original)">
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="neutral"
            variant="ghost"
            aria-label="Actions"
          />
        </UDropdownMenu>
      </template>
    </UTable>
  </div>

  <!-- Admin: Edit user profile modal -->
  <UModal
    v-model:open="showEditModal"
    @close="closeEditProfile"
    :ui="{ content: 'max-w-full overflow-y-auto' }"
  >
    <template #content>
      <UCard variant="amsModal">
        <template #header>
          <h2>
            {{
              selectedUser
                ? `Profil bearbeiten: ${getUserLabel(selectedUser)}`
                : 'Profil bearbeiten'
            }}
          </h2>
        </template>
        <template #default>
          <UForm
            :schema="userProfileSchema"
            :state="profileEdit.formData"
            class="space-y-6"
            @submit="handleAdminEditSubmit"
            @keydown.enter.prevent="() => {}"
          >
            <div class="space-y-6">
              <AMSPagesProfilePersonalDetails :show-avatar-upload="false" />
              <AMSPagesProfileOrgaData />
              <AMSPagesProfileBaseData />
              <AMSPagesProfileBiography />
            </div>
            <UAlert
              v-if="profileEdit.getSubmitError"
              color="red"
              variant="subtle"
              :description="profileEdit.getSubmitError"
              class="mt-4"
              icon="i-lucide-alert-triangle"
              :close-button="{
                icon: 'i-lucide-x',
                color: 'red',
                variant: 'link',
                padded: false,
              }"
              @close="profileEdit.clearSubmitError()"
            />
            <UAlert
              v-if="profileEdit.getApiFieldErrorMessages.length > 0"
              color="orange"
              variant="subtle"
              title="Validierungsfehler vom Server"
              class="mt-4"
              icon="i-lucide-alert-circle"
              :close-button="{
                icon: 'i-lucide-x',
                color: 'orange',
                variant: 'link',
                padded: false,
              }"
              @close="profileEdit.clearApiValidationErrors()"
            >
              <template #description>
                <ul class="list-disc list-inside">
                  <li
                    v-for="(
                      error, index
                    ) in profileEdit.getApiFieldErrorMessages"
                    :key="index"
                  >
                    <strong>{{ error.path }}:</strong> {{ error.message }}
                  </li>
                </ul>
              </template>
            </UAlert>
            <div class="flex justify-end gap-2 pt-2">
              <UButton type="submit" :loading="profileEdit.isSubmitting"
                >Speichern</UButton
              >
            </div>
          </UForm>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              color="gray"
              variant="outline"
              @click="closeEditProfile"
              >Abbrechen</UButton
            >
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

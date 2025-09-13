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
  adminUserProfileSchema,
  useUserProfileEditStore,
} from '@/stores/ams/profile-edit-store'

const props = defineProps<{ data: DirectusUser[]; search: string }>()
const emit = defineEmits(['refreshData'])

const expanded = ref({})

// Admin edit modal state
const showEditModal = ref(false)
const showBioModal = ref(false)
const showHangarModal = ref(false)
const showOrgaModal = ref(false)
const selectedUser = ref<DirectusUser | null>(null)
const orgaSelectedUser = ref<DirectusUser | null>(null)
const profileEdit = useUserProfileEditStore()
const toast = useToast()
const authStore = useAuthStore()
const { currentUserId } = storeToRefs(authStore)

// Admin avatar change helpers
const adminAvatarFileInputRef = useTemplateRef('adminAvatarFileInputRef')
const selectedAvatarUser = ref<DirectusUser | null>(null)
const showAvatarCropper = ref(false)
const imageToCropSrc = ref<string | null>(null)
let selectedFileForAvatar: File | null = null

// Orga edit state
const orgaForm = reactive<{
  role: string | null
  roles: Array<'recruitment' | 'marketing_and_press' | 'content_writer'>
  head_of_department: boolean
  departmentId: string | null
  departmentName: string | null
}>({
  role: null,
  roles: [],
  head_of_department: false,
  departmentId: null,
  departmentName: null,
})
const VORSTAND_ROLE_ID = '1de3fee4-090e-40fa-ad12-c0bf6c48f8dd'
const ADMIN_ROLE_ID = 'bc712fc8-ce4f-4427-b431-4942eaaedaa6'
const orgaRoleOptions = reactive([
  { id: VORSTAND_ROLE_ID, label: 'Vorstand' },
  { id: '35715c93-a203-46d6-8ae8-122e726eabaa', label: 'Freier Mitarbeiter' },
  { id: '58566123-599f-4bd8-a1ac-ce25372d284b', label: 'Anwärter' },
  { id: 'cd587d88-0ccd-4189-a2c2-46a3bbfc3c04', label: 'Mitarbeiter' },
  { id: ADMIN_ROLE_ID, label: 'Administrator' },
])
const canGrantAdmin = computed(
  () => authStore.currentUser?.role?.id === ADMIN_ROLE_ID
)
const filteredOrgaRoleOptions = computed(() => {
  if (canGrantAdmin.value) return orgaRoleOptions
  const base = orgaRoleOptions.filter((o) => o.id !== ADMIN_ROLE_ID)
  // If current selection is admin (editing existing admin), include for display
  if (orgaForm.role === ADMIN_ROLE_ID)
    base.push({ id: ADMIN_ROLE_ID, label: 'Administrator' })
  return base
})
const orgaRolesOptions = reactive([
  { label: 'Rekrutierung', value: 'recruitment' },
  { label: 'Marketing & Presse', value: 'marketing_and_press' },
  { label: 'Inhaltsersteller', value: 'content_writer' },
])
const existingHodUser = ref<DirectusUser | null>(null)
const isInitializingOrga = ref(false)

async function openEditOrga(user: DirectusUser) {
  const fullUser = (await useDirectus(
    readUser(user.id, {
      fields: [
        'id',
        'head_of_department',
        { role: ['id', 'label'] },
        'roles',
        { primary_department: ['id', 'name'] },
      ],
    })
  )) as DirectusUser
  isInitializingOrga.value = true
  orgaSelectedUser.value = fullUser
  const initRole = (fullUser.role as any)?.id || null
  const initRoles = ((fullUser.roles as any) || []) as Array<
    'recruitment' | 'marketing_and_press' | 'content_writer'
  >
  const initHod = !!fullUser.head_of_department
  const dept = fullUser.primary_department as any
  const initDeptId = typeof dept === 'string' ? dept : dept?.id || null
  const initDeptName = typeof dept === 'string' ? null : dept?.name || null
  // Reset form completely before assigning
  Object.assign(orgaForm, {
    role: initRole,
    roles: initRoles,
    head_of_department: initHod,
    departmentId: initDeptId,
    departmentName: initDeptName,
  })
  previousRoleId.value = null
  existingHodUser.value = null
  if (initDeptId && initHod) await checkExistingHod(initDeptId, fullUser.id)
  showOrgaModal.value = true
  isInitializingOrga.value = false
}

async function checkExistingHod(departmentId: string, excludeUserId?: string) {
  const result = (await useDirectus(
    readUsers({
      limit: 1,
      filter: {
        primary_department: { _eq: departmentId },
        head_of_department: { _eq: true },
        ...(excludeUserId ? { id: { _neq: excludeUserId } } : {}),
      },
      fields: [
        'id',
        'first_name',
        'middle_name',
        'last_name',
        { primary_department: ['id', 'name'] },
      ],
    })
  )) as DirectusUser[]
  existingHodUser.value = result?.[0] || null
}

function closeEditOrga() {
  showOrgaModal.value = false
  orgaSelectedUser.value = null
  existingHodUser.value = null
  previousRoleId.value = null
  Object.assign(orgaForm, {
    role: null,
    roles: [],
    head_of_department: false,
    departmentId: null,
    departmentName: null,
  })
}

// Track previous role to restore after HoD toggled off
const previousRoleId = ref<string | null>(null)
watch(
  () => orgaForm.head_of_department,
  async (isHod) => {
    if (isInitializingOrga.value) return
    if (isHod) {
      if (orgaForm.role && orgaForm.role !== VORSTAND_ROLE_ID)
        previousRoleId.value = orgaForm.role
      orgaForm.role = VORSTAND_ROLE_ID
      if (orgaForm.departmentId && orgaSelectedUser.value)
        await checkExistingHod(orgaForm.departmentId, orgaSelectedUser.value.id)
    } else {
      if (previousRoleId.value && previousRoleId.value !== VORSTAND_ROLE_ID)
        orgaForm.role = previousRoleId.value
    }
  }
)

async function saveOrgaChanges() {
  if (!orgaSelectedUser.value) return
  // If trying to set HoD true, check conflict
  if (orgaForm.head_of_department && orgaForm.departmentId) {
    await checkExistingHod(orgaForm.departmentId, orgaSelectedUser.value.id)
  }
  if (existingHodUser.value && orgaForm.head_of_department) {
    toast.add({
      title: 'Abteilungsleiter existiert',
      description: `${getUserLabel(
        existingHodUser.value
      )} ist bereits Abteilungsleiter in ${orgaForm.departmentName}.`,
      color: 'warning',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }
  try {
    if (orgaForm.role === ADMIN_ROLE_ID && !canGrantAdmin.value) {
      toast.add({
        title: 'Nicht berechtigt',
        description:
          'Nur Administratoren können die Administrator-Rolle zuweisen.',
        color: 'error',
        icon: 'i-lucide-shield-off',
      })
      return
    }
    await useDirectus(
      updateUser(orgaSelectedUser.value.id, {
        role: orgaForm.role,
        roles: orgaForm.roles as any,
        head_of_department: orgaForm.head_of_department,
      })
    )
    toast.add({
      title: 'Orga-Daten aktualisiert',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    emit('refreshData')
    closeEditOrga()
  } catch (err) {
    console.error('Save Orga error:', err)
    toast.add({
      title: 'Fehler beim Speichern',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  }
}

async function switchHeadOfDepartment() {
  if (
    !orgaSelectedUser.value ||
    !orgaForm.departmentId ||
    !existingHodUser.value
  )
    return
  try {
    await useDirectus(
      updateUser(existingHodUser.value.id, { head_of_department: false })
    )
    await useDirectus(
      updateUser(orgaSelectedUser.value.id, {
        head_of_department: true,
        role: orgaForm.role,
        roles: orgaForm.roles as any,
      })
    )
    toast.add({
      title: 'Abteilungsleiter gewechselt',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    emit('refreshData')
    closeEditOrga()
  } catch (err) {
    console.error('Switch HoD error:', err)
    toast.add({
      title: 'Fehler beim Wechsel',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  }
}

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

async function openEditBiography(user: DirectusUser) {
  const fullUser = (await useDirectus(
    readUser(user.id, { fields: ['*'] })
  )) as DirectusUser
  selectedUser.value = fullUser
  profileEdit.initFormForUser(fullUser)
  showBioModal.value = true
}

function closeEditBiography() {
  showBioModal.value = false
  selectedUser.value = null
  profileEdit.clearApiValidationErrors()
  profileEdit.clearSubmitError()
}

// Admin: Hangar editing
const selectedUserIdRef = ref<string | number | undefined>(undefined)
const { data: selectedUserHangar, refresh: refreshSelectedUserHangar } =
  await useFetchAMSHangar(selectedUserIdRef)

async function openEditHangar(user: DirectusUser) {
  selectedUser.value = user
  selectedUserIdRef.value = user.id
  showHangarModal.value = true
}

function closeEditHangar() {
  showHangarModal.value = false
  selectedUser.value = null
}

async function handleAdminBiographySubmit(event: FormSubmitEvent<any>) {
  if (!selectedUser.value) return
  const ok = await profileEdit.submitUserProfile(
    event.data,
    selectedUser.value.id
  )
  if (ok) {
    toast.add({
      title: 'Biografie aktualisiert',
      color: 'green',
      icon: 'i-lucide-circle-check',
    })
    closeEditBiography()
    emit('refreshData')
  } else {
    toast.add({
      title: 'Aktualisierung fehlgeschlagen',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
  }
}

// Admin: Avatar actions
function openAdminAvatarPicker(user: DirectusUser) {
  selectedAvatarUser.value = user
  // Trigger hidden file input
  adminAvatarFileInputRef?.value?.inputRef?.click?.()
}

function onAdminAvatarFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  const file = target.files[0]
  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Ungültige Datei',
      description: 'Bitte ein Bild wählen.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    target.value = ''
    return
  }
  selectedFileForAvatar = file
  imageToCropSrc.value = URL.createObjectURL(file)
  showAvatarCropper.value = true
  // reset input so same file can be chosen again
  target.value = ''
}

async function onAdminAvatarCropped(croppedImageBlob: Blob) {
  if (
    !selectedAvatarUser.value ||
    !croppedImageBlob ||
    !selectedFileForAvatar
  ) {
    onAdminAvatarCropCancel()
    return
  }
  try {
    const formData = new FormData()
    formData.append('file', croppedImageBlob, selectedFileForAvatar.name)
    formData.append(
      'title',
      `Avatar for ${getUserLabel(selectedAvatarUser.value) || 'user'}`
    )
    const uploadedFile = await useDirectus(uploadFiles(formData))
    await useDirectus(
      updateUser(selectedAvatarUser.value.id, { avatar: uploadedFile.id })
    )
    toast.add({
      title: 'Avatar aktualisiert',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    emit('refreshData')
  } catch (err) {
    console.error('Admin avatar upload failed:', err)
    toast.add({
      title: 'Fehler beim Avatar-Upload',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    onAdminAvatarCropCancel()
  }
}

function onAdminAvatarCropCancel() {
  showAvatarCropper.value = false
  if (imageToCropSrc.value) URL.revokeObjectURL(imageToCropSrc.value)
  imageToCropSrc.value = null
  selectedFileForAvatar = null
}

async function removeUserAvatar(user: DirectusUser) {
  try {
    await useDirectus(updateUser(user.id, { avatar: null }))
    toast.add({
      title: 'Avatar entfernt',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    emit('refreshData')
  } catch (err) {
    console.error('Admin avatar remove failed:', err)
    toast.add({
      title: 'Fehler beim Entfernen',
      color: 'error',
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
        label: 'Hangar editieren',
        icon: 'i-lucide-edit',
        onSelect: () => openEditHangar(user),
        class: 'active:scale-95 transition',
      },
      {
        label: 'Orga-Daten editieren',
        icon: 'i-lucide-briefcase',
        onSelect: () => openEditOrga(user),
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
        label: 'Biografie editieren',
        icon: 'i-lucide-edit',
        onSelect: () => openEditBiography(user),
        class: 'active:scale-95 transition',
      },
    ],
    [
      {
        label: 'Avatar ändern',
        icon: 'i-lucide-camera',
        onSelect: () => openAdminAvatarPicker(user),
        class: 'active:scale-95 transition',
      },
      {
        label: 'Avatar entfernen',
        icon: 'i-lucide-trash-2',
        color: 'error',
        onSelect: () => removeUserAvatar(user),
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

  <!-- Hidden input for admin avatar selection -->
  <UInput
    ref="adminAvatarFileInputRef"
    type="file"
    accept="image/*"
    class="hidden"
    @change="onAdminAvatarFileChange"
  />

  <!-- Admin: Avatar cropper modal -->
  <AMSPagesProfileImageCropperModal
    :image-url="imageToCropSrc"
    :aspect-ratio="270 / 320"
    :open="showAvatarCropper && imageToCropSrc ? true : false"
    @cropped="onAdminAvatarCropped"
    @cancel="onAdminAvatarCropCancel"
    @close="onAdminAvatarCropCancel"
  />

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
            :schema="adminUserProfileSchema"
            :state="profileEdit.formData"
            class="space-y-6"
            @submit="handleAdminEditSubmit"
            @keydown.enter.prevent="() => {}"
          >
            <div class="space-y-6">
              <AMSPagesProfilePersonalDetails
                :show-avatar-upload="false"
                :show-password-change="selectedUser?.id === currentUserId"
                :target-user-id="selectedUser?.id"
                :delete-old-avatar-file-on-change="false"
              />
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

  <!-- Admin: Edit user hangar modal -->
  <UModal
    v-model:open="showHangarModal"
    @close="closeEditHangar"
    :ui="{ content: 'max-w-6xl overflow-y-auto' }"
  >
    <template #content>
      <UCard variant="amsModal">
        <template #header>
          <div class="flex items-center justify-between">
            <h2>
              {{
                selectedUser
                  ? `Hangar bearbeiten: ${getUserLabel(selectedUser)}`
                  : 'Hangar bearbeiten'
              }}
            </h2>
            <AMSPagesHangarAddSlideover
              :user-id="selectedUser?.id"
              @added="refreshSelectedUserHangar"
            >
              <template #default="{ openSlideover }">
                <UButton
                  @click="openSlideover"
                  label="Schiffe hinzufügen"
                  icon="i-lucide-circle-plus"
                  variant="subtle"
                />
              </template>
            </AMSPagesHangarAddSlideover>
          </div>
        </template>
        <template #default>
          <div
            v-if="selectedUserHangar?.length"
            class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          >
            <AMSUiShipCard
              v-for="item in selectedUserHangar"
              :key="item.id"
              mode="hangar-item"
              :data="item"
              :fleetMode="false"
              :forceExpanded="false"
              :refresh-override="refreshSelectedUserHangar"
              @updated="refreshSelectedUserHangar"
            />
          </div>
          <div v-else class="text-center text-(--ui-text-muted)">
            Kein Hangar-Inhalt vorhanden.
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              color="gray"
              variant="outline"
              @click="closeEditHangar"
              >Schließen</UButton
            >
          </div>
        </template>
      </UCard>
    </template>
  </UModal>

  <!-- Admin: Edit orga modal -->
  <UModal
    v-model:open="showOrgaModal"
    @close="closeEditOrga"
    :ui="{ content: 'max-w-xl overflow-y-auto' }"
  >
    <template #content>
      <UCard variant="amsModal">
        <template #header>
          <h2>
            {{
              orgaSelectedUser
                ? `Orga-Daten: ${getUserLabel(orgaSelectedUser)}`
                : 'Orga-Daten'
            }}
          </h2>
        </template>
        <template #default>
          <div class="space-y-4">
            <UForm
              :state="orgaForm"
              class="space-y-4"
              @submit.prevent="saveOrgaChanges"
            >
              <UFormField
                label="Primäre Abteilung"
                name="department"
                size="xs"
                class="w-full"
              >
                <UInput
                  :model-value="orgaForm.departmentName || '—'"
                  disabled
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Position" name="role" size="xs" class="w-full">
                <USelectMenu
                  v-model="orgaForm.role"
                  :items="filteredOrgaRoleOptions"
                  variant="ams"
                  size="md"
                  value-key="id"
                  label-key="label"
                  placeholder="z.B. Mitarbeiter"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Rollen"
                name="roles"
                size="xs"
                class="w-full prose-p:my-0"
              >
                <UCheckboxGroup
                  v-model="orgaForm.roles"
                  value-key="value"
                  orientation="horizontal"
                  :items="orgaRolesOptions"
                  class="translate-y-2"
                />
              </UFormField>
              <UFormField name="head_of_department" size="xs" class="w-full">
                <div class="flex items-center justify-between">
                  <label class="text-sm text-(--ui-text-muted)"
                    >Abteilungsleiter</label
                  >
                  <USwitch v-model="orgaForm.head_of_department" size="xl" />
                </div>
              </UFormField>
              <UAlert
                v-if="existingHodUser && orgaForm.head_of_department"
                color="warning"
                variant="subtle"
                title="In dieser Abteilung existiert bereits ein Leiter"
                icon="i-lucide-alert-triangle"
                class="mt-2"
              >
                <template #description>
                  <div class="space-y-2">
                    <p>
                      Aktueller Leiter:
                      <strong>{{ getUserLabel(existingHodUser) }}</strong>
                      <span v-if="orgaForm.departmentName">
                        ({{ orgaForm.departmentName }})</span
                      >
                    </p>
                    <div class="flex gap-2">
                      <UButton
                        color="warning"
                        variant="subtle"
                        @click="switchHeadOfDepartment"
                        >Leiter wechseln</UButton
                      >
                    </div>
                  </div>
                </template>
              </UAlert>
              <UAlert
                v-if="orgaForm.role === ADMIN_ROLE_ID"
                color="warning"
                variant="subtle"
                title="Administrator-Rolle ausgewählt"
                icon="i-lucide-alert-triangle"
                class="mt-2"
                :description="'Diese Rolle gewährt umfassende Berechtigungen. Bitte mit Vorsicht zuweisen.'"
              />
              <div class="flex justify-end gap-2 pt-2">
                <UButton
                  type="submit"
                  :disabled="!!(existingHodUser && orgaForm.head_of_department)"
                  >Speichern</UButton
                >
              </div>
            </UForm>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              color="gray"
              variant="outline"
              @click="closeEditOrga"
              >Schließen</UButton
            >
          </div>
        </template>
      </UCard>
    </template>
  </UModal>

  <!-- Admin: Edit biography modal -->
  <UModal
    v-model:open="showBioModal"
    @close="closeEditBiography"
    :ui="{ content: 'max-w-full overflow-y-auto' }"
  >
    <template #content>
      <UCard variant="amsModal">
        <template #header>
          <h2>
            {{
              selectedUser
                ? `Biografie bearbeiten: ${getUserLabel(selectedUser)}`
                : 'Biografie bearbeiten'
            }}
          </h2>
        </template>
        <template #default>
          <UForm
            :schema="adminUserProfileSchema"
            :state="profileEdit.formData"
            class="space-y-6"
            @submit="handleAdminBiographySubmit"
            @keydown.enter.prevent="() => {}"
          >
            <AMSPagesProfileBiography />
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
              @click="closeEditBiography"
              >Abbrechen</UButton
            >
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

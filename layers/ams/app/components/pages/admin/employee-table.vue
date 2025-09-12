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

const props = defineProps<{ data: DirectusUser[]; search: string }>()
const emit = defineEmits(['refreshData'])

const expanded = ref({})

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
        onSelect: () => console.log('test'),
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
</template>

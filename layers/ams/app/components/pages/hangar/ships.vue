<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useSortable } from '@vueuse/integrations/useSortable.mjs'
import type { Company, Department, Ship, UserHangar } from '~~/types'

const props = defineProps<{ data: UserHangar[] }>()

const store = useAMSCalculatorStore()
const { crews } = storeToRefs(store)
const expanded = ref({ 1: false })
const editSlideover = ref<boolean>(false)

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const columns: TableColumn<UserHangar>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : '',
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => `${row.getValue('name')}`,
  },
  {
    accessorKey: 'model',
    header: 'Modell',
    cell: ({ row }) => `${(row.original.ship_id as Ship).name}`,
  },
  {
    accessorKey: 'manufacturer',
    header: 'Hersteller',
    cell: ({ row }) =>
      `${((row.original.ship_id as Ship).manufacturer as Company).name}`,
  },
  {
    accessorKey: 'visibility',
    header: 'Sichtbarkeit',
    cell: ({ row }) => {
      const color = {
        public: 'success' as const,
        internal: 'primary' as const,
        private: 'neutral' as const,
      }[row.getValue('visibility') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.getValue('visibility')
      )
    },
  },
  {
    accessorKey: 'group',
    header: 'Zuordnung',
    cell: ({ row }) => {
      const color = {
        ariscorp: 'primary' as const,
        private: 'neutral' as const,
      }[row.getValue('group') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.getValue('group')
      )
    },
  },
  {
    accessorKey: 'department',
    header: 'Abteilung',
    cell: ({ row }) => `${(row.original.department as Department)?.name ?? ''}`,
  },
  {
    id: 'actions',
  },
]
</script>

<template>
  <div class="rounded-md border border-(--ui-primary)/20 overflow-hidden">
    <UTable
      ref="teamsUiTableRef"
      v-model:expanded="expanded"
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
      <template #model-cell="{ row }">
        <NuxtLink
          :to="`/ships/${(row.original.ship_id as Ship).slug}`"
          class="hover:text-(--ui-primary) transition-color duration-300 hover:text-shadow-xs hover:text-shadow-primary"
          >{{ (row.original.ship_id as Ship).name }}</NuxtLink
        >
      </template>
      <template #actions-cell="{ row }">
        <AMSPagesHangarShipEdit :item="row.original">
          <template #default="{ open }">
            <UButton
              @click="open"
              variant="ghost"
              icon="i-lucide-square-pen"
              class="ml-auto"
            />
          </template>
        </AMSPagesHangarShipEdit>
        <UButton
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          class="ml-auto"
        />
      </template>
      <template #expanded="{ row }">
        <pre>{{ row.original }}</pre>
      </template>
    </UTable>
  </div>
</template>

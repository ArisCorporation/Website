<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type {
  Company,
  Department,
  DirectusUser,
  ShipHull,
  ShipModule,
  ShipVariant,
  UserHangar,
} from '~~/types'
import {
  buildActiveTableFilters,
  buildTableFilterOptions,
} from '../../../utils/table-filter'

const authStore = useAuthStore()

const props = defineProps<{
  data: UserHangar[]
  search: string
  sorting: { id: string; desc: boolean }[]
}>()
const emit = defineEmits<{
  (e: 'update:sorting', value: { id: string; desc: boolean }[]): void
}>()

const sortingModel = computed({
  get: () => props.sorting,
  set: (value) => emit('update:sorting', value),
})

const expanded = ref({})
const columnFilters = reactive({
  name: '',
  model: '',
  buy_status: '',
  visibility: '',
  owner: '',
  department: '',
})
type FleetFilterKey = keyof typeof columnFilters
const fleetFilterKeys = Object.keys(columnFilters) as FleetFilterKey[]

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const AMSUiTableSortFilterHeader = resolveComponent('AMSUiTableSortFilterHeader')

const filterLabels: Record<FleetFilterKey, string> = {
  name: 'Name',
  model: 'Modell',
  buy_status: 'Kaufstatus',
  visibility: 'Sichtbarkeit',
  owner: 'Besitzer',
  department: 'Abteilung',
}

const filterGetters: Record<FleetFilterKey, (item: UserHangar) => string> = {
  name: (item) => item.name?.trim() ?? '',
  model: (item) => (item.ship as ShipVariant)?.name?.trim() ?? '',
  buy_status: (item) => item.buy_status?.trim() ?? '',
  visibility: (item) => item.visibility?.trim() ?? '',
  owner: (item) => getUserLabel(item.user as DirectusUser)?.trim() ?? '',
  department: (item) => (item.department as Department)?.name?.trim() ?? '',
}

const filterOptions = computed<Record<FleetFilterKey, { label: string; value: string }[]>>(() => ({
  name: buildTableFilterOptions(props.data ?? [], (item) => {
    const value = filterGetters.name(item)
    return value ? { label: value, value } : null
  }),
  model: buildTableFilterOptions(props.data ?? [], (item) => {
    const value = filterGetters.model(item)
    return value ? { label: value, value } : null
  }),
  buy_status: buildTableFilterOptions(props.data ?? [], (item) => {
    const value = item.buy_status?.trim() ?? ''
    return value
      ? { label: getBuyStatusLabel(item.buy_status) ?? value, value }
      : null
  }),
  visibility: buildTableFilterOptions(props.data ?? [], (item) => {
    const value = filterGetters.visibility(item)
    return value ? { label: value, value } : null
  }),
  owner: buildTableFilterOptions(props.data ?? [], (item) => {
    const value = filterGetters.owner(item)
    return value ? { label: value, value } : null
  }),
  department: buildTableFilterOptions(props.data ?? [], (item) => {
    const value = filterGetters.department(item)
    return value ? { label: value, value } : null
  }),
}))

const filteredData = computed(() =>
  (props.data ?? []).filter((item) =>
    fleetFilterKeys.every((key) => {
      const selectedValue = columnFilters[key]
      return !selectedValue || filterGetters[key](item) === selectedValue
    })
  )
)

const activeFilters = computed(() =>
  buildActiveTableFilters({
    filters: columnFilters,
    labels: filterLabels,
    options: filterOptions.value,
  })
)

function clearFilter(key: FleetFilterKey | string) {
  columnFilters[key as FleetFilterKey] = ''
}

function clearAllFilters() {
  for (const key of fleetFilterKeys) {
    columnFilters[key] = ''
  }
}

function sortableHeader(key: FleetFilterKey, label: string) {
  return ({ column }: { column: any }) =>
    h(AMSUiTableSortFilterHeader, {
      label,
      column,
      items: filterOptions.value[key],
      modelValue: columnFilters[key],
      'onUpdate:modelValue': (value: string) => {
        columnFilters[key] = value
      },
    })
}

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
    accessorKey: 'store-image',
    header: '',
    meta: {
      class: {
        td: 'p-0',
      },
    },
  },
  {
    accessorKey: 'name',
    header: sortableHeader('name', 'Name'),
    enableSorting: true,
    cell: ({ row }) => `${row.original.name ?? ''}`,
  },
  {
    accessorKey: 'model',
    header: sortableHeader('model', 'Modell'),
    enableSorting: true,
    cell: ({ row }) => `${(row.original.ship as ShipVariant).name}`,
  },
  {
    accessorKey: 'manufacturer',
    header: 'Hersteller',
    cell: ({ row }) =>
      `${(((row.original.ship as ShipVariant).hull as ShipHull)?.manufacturer as Company)?.name ?? ''}`,
  },
  {
    accessorKey: 'buy_status',
    header: sortableHeader('buy_status', 'Kaufstatus'),
    enableSorting: true,
    cell: ({ row }) => {
      const color = {
        pledged: 'success' as const,
        in_game: 'warning' as const,
        planned: 'neutral' as const,
      }[row.getValue('buy_status') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        getBuyStatusLabel(row.getValue('buy_status'))
      )
    },
  },
  {
    accessorKey: 'visibility',
    header: sortableHeader('visibility', 'Sichtbarkeit'),
    enableSorting: true,
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
    accessorKey: 'owner',
    header: sortableHeader('owner', 'Besitzer'),
    enableSorting: true,
    cell: ({ row }) =>
      `${getUserLabel(row.original.user as DirectusUser) ?? ''}`,
  },
  {
    accessorKey: 'department',
    header: sortableHeader('department', 'Abteilung'),
    enableSorting: true,
    cell: ({ row }) => `${(row.original.department as Department)?.name ?? ''}`,
  },
]

watch(props, () => {
  expanded.value = {}
})
</script>

<template>
  <AMSUiTableShell
    :filters="activeFilters"
    @clear="clearFilter"
    @clear-all="clearAllFilters"
  >
    <UTable
      ref="teamsUiTableRef"
      v-model:expanded="expanded"
      v-model:sorting="sortingModel"
      :columns="columns"
      :data="filteredData"
      class="h-xl"
    >
      <template #store-image-cell="{ row }">
        <NuxtImg
          :src="getAssetId((row.original.ship as ShipVariant).thumbnail)"
          class="rounded size-8 object-cover aspect-square"
        />
      </template>
      <template #model-cell="{ row }">
        <NuxtLink
          :to="`/ships/${((row.original.ship as ShipVariant).hull as ShipHull)?.slug ?? ''}`"
          class="hover:text-(--ui-primary) transition-color duration-300 hover:text-shadow-xs hover:text-shadow-primary"
          >{{ (row.original.ship as ShipVariant).name }}</NuxtLink
        >
      </template>
      <template #expanded="{ row }">
        <div class="flex gap-4">
          <div class="w-1/2">
            <NuxtImg
              :src="getAssetId((row.original.ship as ShipVariant)?.thumbnail)"
              class="w-full rounded h-auto aspect-video object-cover"
            />
          </div>
          <div class="w-1/2 text-base">
            <h2 class="text-2xl font-bold">
              {{ (row.original.ship as ShipVariant)?.name }}
            </h2>
            <p class="text-(--ui-text-muted) mb-4">
              {{ (row.original.ship as ShipVariant)?.stats?.role ?? 'N/A' }} -
              {{
                (((row.original.ship as ShipVariant)?.hull as ShipHull)
                  ?.manufacturer as Company)?.name
              }}
            </p>
            <h2 class="text-(--ui-primary) text-xl font-semibold">
              Schiffsdetails
            </h2>
            <div class="grid grid-cols-2 gap-y-2">
              <div>
                <p class="text-(--ui-text-muted)">Schiffsname</p>
                <p class="p-0 font-normal text-white">
                  {{ row.original?.name ? row.original?.name : 'N/A' }}
                </p>
              </div>
              <div>
                <p class="text-(--ui-text-muted)">Kaufstatus</p>
                <p class="p-0 font-normal text-white">
                  {{
                    row.original?.buy_status
                      ? getBuyStatusLabel(row.original?.buy_status)
                      : 'N/A'
                  }}
                </p>
              </div>
              <div v-if="row.original.active_module">
                <p class="text-(--ui-text-muted)">Aktives Modul</p>
                <UBadge
                  :label="(row.original.active_module as ShipModule)?.name"
                  variant="subtle"
                  class="mr-2"
                />
              </div>
            </div>
            <h4 class="text-(--ui-primary) font-medium mt-2">
              Spezifikationen
            </h4>
            <div class="grid grid-cols-2 gap-y-2">
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Hersteller</p>
                <UButton
                  variant="link"
                  color="neutral"
                  :to="`/verseexkurs/companies/${(((row.original.ship as ShipVariant)?.hull as ShipHull)?.manufacturer as Company)?.slug ?? ''}`"
                  class="p-0 font-normal text-white"
                >
                  <p class="text-base">
                    {{
                      (((row.original.ship as ShipVariant)?.hull as ShipHull)
                        ?.manufacturer as Company)?.name ?? 'N/A'
                    }}
                  </p>
                </UButton>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Crew</p>
                <p class="p-0 font-normal text-white">
                  {{ (row.original.ship as ShipVariant)?.stats?.crew ?? 'N/A' }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Länge</p>
                <p class="p-0 font-normal text-white">
                  {{
                    (row.original.ship as ShipVariant)?.stats?.dimensions?.length
                      ? (row.original.ship as ShipVariant)?.stats?.dimensions?.length + 'm'
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Breite</p>
                <p class="p-0 font-normal text-white">
                  {{
                    (row.original.ship as ShipVariant)?.stats?.dimensions?.width
                      ? (row.original.ship as ShipVariant)?.stats?.dimensions?.width + 'm'
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Höhe</p>
                <p class="p-0 font-normal text-white">
                  {{
                    (row.original.ship as ShipVariant)?.stats?.dimensions?.height
                      ? (row.original.ship as ShipVariant)?.stats?.dimensions?.height + 'm'
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Gewicht</p>
                <p class="p-0 font-normal text-white">
                  {{
                    (row.original.ship as ShipVariant)?.stats?.mass
                      ? formatCurrency(((row.original.ship as ShipVariant)?.stats?.mass ?? 0) / 1000) +
                        ' Tonnen'
                      : 'N/A'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTable>
  </AMSUiTableShell>
</template>

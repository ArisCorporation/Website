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

const authStore = useAuthStore()

const props = defineProps<{ data: UserHangar[]; search: string }>()

const expanded = ref({})

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
    header: 'Name',
    cell: ({ row }) => `${row.original.name ?? ''}`,
  },
  {
    accessorKey: 'model',
    header: 'Modell',
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
    header: 'Kaufstatus',
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
    accessorKey: 'owner',
    header: 'Besitzer',
    cell: ({ row }) =>
      `${getUserLabel(row.original.user as DirectusUser) ?? ''}`,
  },
  {
    accessorKey: 'department',
    header: 'Abteilung',
    cell: ({ row }) => `${(row.original.department as Department)?.name ?? ''}`,
  },
]

watch(props, () => {
  expanded.value = {}
})
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-(--ui-primary)/15 bg-[linear-gradient(180deg,rgba(10,16,30,0.72)_0%,rgba(4,9,22,0.96)_100%)] shadow-[0_20px_48px_-32px_rgba(0,255,232,0.35)] backdrop-blur-sm"
  >
    <UTable
      ref="teamsUiTableRef"
      v-model:expanded="expanded"
      :columns="columns"
      :data="data"
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
  </div>
</template>

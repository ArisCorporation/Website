<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type {
  Company,
  Department,
  Ship,
  ShipModule,
  UserHangar,
} from '~~/types'

type EntityWithId = { id?: unknown }
const isEntityWithId = <T extends EntityWithId>(value: unknown): value is T =>
  typeof value === 'object' && value !== null && 'id' in value

const getShip = (item: UserHangar): Ship | null =>
  isEntityWithId<Ship>(item.ship_id) ? item.ship_id : null
const getManufacturer = (ship: Ship | null): Company | null =>
  isEntityWithId<Company>(ship?.manufacturer) ? ship.manufacturer : null
const getDepartment = (item: UserHangar): Department | null =>
  isEntityWithId<Department>(item.department) ? item.department : null
const getActiveModule = (item: UserHangar): ShipModule | null =>
  isEntityWithId<ShipModule>(item.active_module) ? item.active_module : null
const getShipModules = (ship: Ship | null) =>
  Array.isArray(ship?.modules)
    ? ship.modules.filter((module): module is ShipModule =>
        isEntityWithId<ShipModule>(module)
      )
    : []

const props = defineProps<{ data: UserHangar[]; search: string }>()

const expanded = ref<Record<string, boolean>>({})

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
    cell: ({ row }) => `${row.getValue('name')}`,
  },
  {
    accessorKey: 'model',
    header: 'Modell',
    cell: ({ row }) => getShip(row.original)?.name ?? '',
  },
  {
    accessorKey: 'manufacturer',
    header: 'Hersteller',
    cell: ({ row }) =>
      getManufacturer(getShip(row.original))?.name ?? '',
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
    cell: ({ row }) => `${getDepartment(row.original)?.name ?? ''}`,
  },
  {
    id: 'actions',
  },
]
watch(
  () => props.data,
  () => {
    expanded.value = {}
  }
)
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
      <template #store-image-cell="{ row }">
        <NuxtImg
          :src="getAssetId(getShip(row.original)?.store_image)"
          class="rounded size-8 object-cover aspect-square"
        />
      </template>
      <template #model-cell="{ row }">
        <NuxtLink
          :to="`/ships/${getShip(row.original)?.slug}`"
          class="hover:text-(--ui-primary) transition-color duration-300 hover:text-shadow-xs hover:text-shadow-primary"
          >{{ getShip(row.original)?.name }}</NuxtLink
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
          @click="removeHangarItem(row.original.id)"
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          class="ml-auto"
        />
      </template>
      <template #expanded="{ row }">
        <div v-if="getShip(row.original)" class="flex gap-4">
          <div class="w-1/2">
            <NuxtImg
              :src="getAssetId(getShip(row.original)?.store_image)"
              class="w-full rounded h-auto aspect-video object-cover"
            />
          </div>
          <div class="w-1/2 text-base">
            <h2 class="text-2xl font-bold">
              {{ getShip(row.original)?.name ?? 'N/A' }}
            </h2>
            <p class="text-(--ui-text-muted) mb-4">
              {{ getMainFocusLabel(getShip(row.original)?.focuses) }} -
              {{ getManufacturer(getShip(row.original))?.name ?? 'N/A' }}
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
                <p class="text-(--ui-text-muted)">Aktives Modul</p>
                <p class="p-0 font-normal text-white">
                  {{
                    row.original.active_module &&
                    getShipModules(getShip(row.original)).length
                      ? getActiveModule(row.original)?.name
                      : 'N/A'
                  }}
                </p>
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
                  :to="`/verseexkurs/companies/${getManufacturer(getShip(row.original))?.slug}`"
                  class="p-0 font-normal text-white"
                >
                  <p class="text-base">
                    {{
                      getManufacturer(getShip(row.original))?.name ?? 'N/A'
                    }}
                  </p>
                </UButton>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Crew</p>
                <p class="p-0 font-normal text-white">
                  {{ getShip(row.original)?.crew_min ?? 'N/A' }}
                  -
                  {{ getShip(row.original)?.crew_max ?? 'N/A' }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Länge</p>
                <p class="p-0 font-normal text-white">
                  {{
                    getShip(row.original)?.length
                      ? getShip(row.original)?.length + 'm'
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Breite</p>
                <p class="p-0 font-normal text-white">
                  {{
                    getShip(row.original)?.beam
                      ? getShip(row.original)?.beam + 'm'
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Höhe</p>
                <p class="p-0 font-normal text-white">
                  {{
                    getShip(row.original)?.height
                      ? getShip(row.original)?.height + 'm'
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Gewicht</p>
                <p class="p-0 font-normal text-white">
                  {{
                    getShip(row.original)?.mass
                      ? formatCurrency(getShip(row.original)?.mass / 1000) +
                        ' Tonnen'
                      : 'N/A'
                  }}
                </p>
              </div>
            </div>
            <div
              v-if="getShipModules(getShip(row.original)).length"
              class="mt-4"
            >
              <p class="text-(--ui-primary)">Module</p>
              <UBadge
                v-for="module in getShipModules(getShip(row.original))"
                :key="module.id"
                :label="module.name"
                variant="subtle"
                class="mr-2"
              />
            </div>
            <!-- TODO: ADD PAINTS -->
            <!-- <div v-if="getShipModules(getShip(row.original)).length" class="mt-4">
              <p class="text-(--ui-primary)">Module</p>
              <UBadge
                v-for="module in getShipModules(getShip(row.original))"
                :key="module.id"
                :label="module.name"
                variant="subtle"
                class="mr-2"
              />
            </div> -->
          </div>
        </div>
        <div v-else class="p-4 text-sm text-(--ui-text-muted)">
          Keine Schiffsdaten verfügbar.
        </div>
      </template>
    </UTable>
  </div>
</template>

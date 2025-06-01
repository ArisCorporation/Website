<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type {
  Company,
  Department,
  Ship,
  ShipModule,
  UserHangar,
} from '~~/types'

const props = defineProps<{ data: UserHangar[]; search: string }>()

const expanded = ref()

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

watch(props, () => {
  expanded.value = {}
})
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
          :src="getAssetId((row.original.ship_id as Ship).store_image)"
          class="rounded size-8 object-cover aspect-square"
        />
      </template>
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
          @click="removeHangarItem(row.original.id)"
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          class="ml-auto"
        />
      </template>
      <template #expanded="{ row }">
        <div class="flex gap-4">
          <div class="w-1/2">
            <NuxtImg
              :src="getAssetId(row.original.ship_id?.store_image)"
              class="w-full rounded h-auto aspect-video object-cover"
            />
          </div>
          <div class="w-1/2 text-base">
            <h2 class="text-2xl font-bold">
              {{ row.original.ship_id?.name }}
            </h2>
            <p class="text-(--ui-text-muted) mb-4">
              {{ getMainFocusLabel(row.original.ship_id?.focuses) }} -
              {{ row.original.ship_id?.manufacturer?.name }}
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
                    row.original?.ship_id?.modules?.length
                      ? (row.original.active_module as ShipModule)?.name
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
                  :to="`/verseexkurs/companies/${row.original.ship_id?.manufacturer?.slug}`"
                  class="p-0 font-normal text-white"
                >
                  <p class="text-base">
                    {{ row.original.ship_id?.manufacturer?.name ?? 'N/A' }}
                  </p>
                </UButton>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Crew</p>
                <p class="p-0 font-normal text-white">
                  {{ row.original.ship_id?.crew_min ?? 'N/A' }}
                  -
                  {{ row.original.ship_id?.crew_max ?? 'N/A' }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Länge</p>
                <p class="p-0 font-normal text-white">
                  {{
                    row.original.ship_id?.length
                      ? row.original.ship_id?.length + 'm'
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Breite</p>
                <p class="p-0 font-normal text-white">
                  {{
                    row.original.ship_id?.beam
                      ? row.original.ship_id?.beam + 'm'
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Höhe</p>
                <p class="p-0 font-normal text-white">
                  {{
                    row.original.ship_id?.height
                      ? row.original.ship_id?.height + 'm'
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="w-1/2">
                <p class="text-(--ui-text-muted)">Gewicht</p>
                <p class="p-0 font-normal text-white">
                  {{
                    row.original.ship_id?.mass
                      ? formatCurrency(row.original.ship_id?.mass / 1000) +
                        ' Tonnen'
                      : 'N/A'
                  }}
                </p>
              </div>
            </div>
            <div
              v-if="(row.original.ship_id as Ship)?.modules?.length"
              class="mt-4"
            >
              <p class="text-(--ui-primary)">Module</p>
              <UBadge
                v-for="module in ((row.original.ship_id as Ship)?.modules as ShipModule[])"
                :key="module.id"
                :label="module.name"
                variant="subtle"
                class="mr-2"
              />
            </div>
            <!-- TODO: ADD PAINTS -->
            <!-- <div class="mt-4">
              <p class="text-(--ui-primary)">Module</p>
              <UBadge
                v-for="module in ((row.original.ship_id as Ship)?.modules as ShipModule[])"
                :key="module.id"
                :label="module.name"
                variant="subtle"
                class="mr-2"
              />
            </div> -->
          </div>
        </div>
      </template>
    </UTable>
  </div>
</template>

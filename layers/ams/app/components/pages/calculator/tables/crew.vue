<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useSortable } from '@vueuse/integrations/useSortable.mjs'
import type { Crew } from '~~/types'
import type { Ship } from '~~/types'

const props = defineProps<{ ships: Ship[] }>()

const store = useAMSCalculatorStore()
const { crews } = storeToRefs(store)

const UButton = resolveComponent('UButton')
const columns: TableColumn<Crew>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `${row.getValue('id')}`,
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'ship',
    header: 'Schiff',
  },
  {
    id: 'delete',
  },
]

useSortable('.crew-tbody', crews.value, {
  animation: 150,
  group: {
    name: 'crews',
    pull: false,
    put: true,
  },
  sort: false,
})

const shipItems = computed(() =>
  props.ships.map((ship) => ({
    label: ship.name ?? 'Unbenanntes Schiff',
    value: ship.id,
  }))
)
</script>

<template>
  <AMSUiTableShell>
    <UTable
      ref="teamsUiTableRef"
      :columns="columns"
      :data="crews"
      :ui="{ tbody: 'crew-tbody' }"
      class="max-h-80"
    >
      <template #name-cell="{ row }">
        <UInput highlight v-model="row.original.name" />
      </template>
      <template #ship-cell="{ row }">
        <USelectMenu
          v-model="crews.find((c) => c.id === row.original.id)!.ship"
          :items="shipItems"
          variant="ams"
          value-key="value"
          label-key="label"
          class="w-48"
        />
      </template>
      <template #delete-cell="{ row }">
        <UButton
          @click="store.removeCrew(row.original.id)"
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          class="ml-auto"
        />
      </template>
    </UTable>
  </AMSUiTableShell>
  <UButton
    @click="store.addCrew"
    variant="outline"
    label="Crew hinzufügen"
    icon="i-lucide-plus"
    class="w-full justify-center"
  />
</template>

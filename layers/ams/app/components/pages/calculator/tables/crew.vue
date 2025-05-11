<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { useSortable } from '@vueuse/integrations/useSortable.mjs'
import type { Crew } from '@@/types/ams-calculator'

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
</script>

<template>
  <div class="rounded-md border border-(--ui-primary)/20 overflow-hidden">
    <UTable
      ref="teamsUiTableRef"
      :columns="columns"
      :data="crews"
      :ui="{
        thead:
          'bg-(--ui-primary)/5 hover:bg-(--ui-primary)/15 [&>tr]:after:bg-(--ui-primary)/20',
        th: ' text-(--ui-primary)',
        tbody: 'divide-(--ui-primary)/20 crew-tbody',
        tr: 'hover:bg-(--ui-primary)/5',
        td: 'text-(--ui-text)',
      }"
    >
      <template #name-cell="{ row }">
        <UInput highlight v-model="row.original.name" />
      </template>
      <template #ship-cell="{ row }">
        <UInput highlight v-model="row.original.ship" />
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
  </div>
  <UButton
    @click="store.addCrew"
    variant="outline"
    label="Crew hinzufügen"
    icon="i-lucide-plus"
    class="w-full justify-center"
  />
</template>

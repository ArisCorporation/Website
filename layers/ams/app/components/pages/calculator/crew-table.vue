<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { useSortable } from '@vueuse/integrations/useSortable.mjs'
import type { Crew } from '@@/types/ams-calculator'

const props = defineProps<{ data: Crew[] }>()

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
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(UButton, {
          icon: 'i-lucide-trash-2',
          color: 'error',
          variant: 'ghost',
          class: 'ml-auto',
          'aria-label': 'Crew Löschen',
        })
      )
    },
  },
]

useSortable('.crew-tbody', props.data, {
  animation: 150,
  group: {
    name: 'crews',
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
      :data="data"
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
    </UTable>
  </div>
  <UButton
    variant="outline"
    label="Crew hinzufügen"
    icon="i-lucide-plus"
    class="w-full justify-center"
  />
</template>

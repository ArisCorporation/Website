<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

type Income = {
  id: string
  name: string
  sum: number
  worker: string
}

const data = reactive<Income[]>([
  {
    id: '1',
    name: 'Quantanium',
    sum: 250000,
    worker: 'Thomas Blakeney',
  },
  {
    id: '2',
    name: 'Bexalit',
    sum: 10000,
    worker: 'Thomas Blakeney',
  },
])

const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const columns: TableColumn<Income>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'sum',
    header: 'Einnahme',
  },
  {
    accessorKey: 'worker',
    header: 'Mitarbeiter',
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
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-md border border-(--ui-primary)/20 overflow-hidden">
      <UTable
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
      >
        <template #name-cell="{ row }">
          <UInput highlight v-model="row.original.name" />
        </template>
        <template #sum-cell="{ row }">
          <AMSPagesCalculatorCurrencyInput v-model="row.original.sum" />
        </template>
        <template #worker-cell="{ row }">
          <UInput highlight v-model="row.original.worker" />
        </template>
      </UTable>
    </div>
    <UButton
      variant="outline"
      label="Einnahme hinzufügen"
      icon="i-lucide-plus"
      class="w-full justify-center"
    />
    <div
      class="flex justify-between items-center px-4 py-2 bg-(--ui-bg-muted)/50 rounded-md border border-(--ui-primary)/20"
    >
      <span class="font-medium">Gesamt:</span>
      <span class="font-bold text-green-400 flex">
        {{ formatCurrency(260000) }}
        <UIcon name="i-lucide-currency" class="my-auto ml-1" />
      </span>
    </div>
  </div>
</template>

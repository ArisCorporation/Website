<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

type Expense = {
  id: string
  name: string
  sum: number
  worker: string
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE').format(amount)
}

const UButton = resolveComponent('UButton')
const columns: TableColumn<Expense>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'sum',
    header: 'Ausgabe',
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

const data: Expense[] = [
  {
    id: '1',
    name: 'Treibstoff',
    sum: 10000,
    worker: 'Thomas Blakeney',
  },
  {
    id: '2',
    name: 'Missionskosten',
    sum: 25000,
    worker: 'Thomas Blakeney',
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
      label="Ausgabe hinzufügen"
      icon="i-lucide-plus"
      class="w-full justify-center"
    />
    <div
      class="flex justify-between items-center px-4 py-2 bg-(--ui-bg-muted)/50 rounded-md border border-(--ui-primary)/20"
    >
      <span class="font-medium">Gesamt:</span>
      <span class="font-bold text-red-400 flex">
        {{ formatCurrency(35000) }}
        <UIcon name="i-lucide-currency" class="my-auto ml-1" />
      </span>
    </div>
  </div>
</template>

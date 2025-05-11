<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Transfer } from '@@/types/ams-calculator'

const store = useAMSCalculatorStore()
const { expenses, workers } = storeToRefs(store)

const UButton = resolveComponent('UButton')
const columns: TableColumn<Transfer>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'amount',
    header: 'Ausgabe',
  },
  {
    accessorKey: 'worker',
    header: 'Mitarbeiter',
  },
  {
    id: 'delete',
  },
]
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-md border border-(--ui-primary)/20 overflow-hidden">
      <UTable
        :columns="columns"
        :data="expenses"
        :ui="{
          thead:
            'bg-(--ui-primary)/5 hover:bg-(--ui-primary)/15 [&>tr]:after:bg-(--ui-primary)/20',
          th: ' text-(--ui-primary)',
          tbody: 'divide-(--ui-primary)/20',
          tr: 'hover:bg-(--ui-primary)/5',
          td: 'text-(--ui-text)',
        }"
        class="max-h-80"
      >
        <template #name-cell="{ row }">
          <UInput highlight v-model="row.original.name" />
        </template>
        <template #amount-cell="{ row }">
          <AMSPagesCalculatorCurrencyInput v-model="row.original.amount" />
        </template>
        <template #worker-cell="{ row }">
          <UInput highlight v-model="row.original.worker" inputmode="numeric" />
        </template>
        <template #delete-cell="{ row }">
          <UButton
            @click="store.removeExpense(row.original.id)"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            class="ml-auto"
          />
        </template>
      </UTable>
    </div>
    <UButton
      @click="store.addExpense"
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
        {{
          formatCurrency(
            expenses.reduce((acc, curr) => acc + (curr.amount ?? 0), 0)
          )
        }}
        <UIcon name="i-lucide-currency" class="my-auto ml-1" />
      </span>
    </div>
  </div>
</template>

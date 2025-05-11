<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { CalculatedPayout } from '@@/types/ams-calculator'

const store = useAMSCalculatorStore()
const { distribution, workers, expenses } = storeToRefs(store)

const columns: TableColumn<CalculatedPayout>[] = [
  {
    accessorKey: 'worker',
    header: 'Mitarbeiter',
  },
  {
    accessorKey: 'expenses',
    header: 'Ausgaben',
    cell: ({ row }) =>
      formatCurrency(
        expenses.value
          .filter((e) => e.worker === row.original.workerId)
          .reduce((a, b) => a + (b.amount ?? 0), 0)
      ),
  },
  {
    accessorKey: 'share',
    header: 'Betrag',
    cell: ({ row }) => formatCurrency(row.original.finalGrossPayout),
  },
  {
    accessorKey: 'percentage',
    header: 'Anteil',
    cell: ({ row }) =>
      `${formatCurrency(row.original.percentageOfTotalGrossRawIncome)}%`,
  },
]
</script>

<template>
  <div class="rounded-md border border-(--ui-primary)/20 overflow-hidden">
    <UTable
      :columns="columns"
      :data="distribution?.payouts"
      :ui="{
        thead:
          'bg-(--ui-primary)/5 hover:bg-(--ui-primary)/15 [&>tr]:after:bg-(--ui-primary)/20',
        th: ' text-(--ui-primary)',
        tbody: 'divide-(--ui-primary)/20 worker-tbody',
        tr: 'hover:bg-(--ui-primary)/5',
        td: 'text-(--ui-text)',
      }"
      class="max-h-80"
    />
  </div>
  <div class="flex space-x-4">
    <!-- Todo: onclick actions -->
    <UButton
      variant="outline"
      icon="i-lucide-save"
      label="In AMS speichern"
      disabled
    />
    <UButton
      variant="outline"
      icon="i-lucide-download"
      label="Als PDF exportieren"
      disabled
    />
    <UButton
      variant="outline"
      icon="i-lucide-save"
      label="In Zwischenablage kopieren"
      disabled
    />
  </div>
</template>

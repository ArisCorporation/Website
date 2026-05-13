<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { CalculatedPayout, CalculatorUserOption } from '~~/types'

defineProps<{ users: CalculatorUserOption[] }>()

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
  <div
    class="overflow-hidden rounded-2xl border border-(--ui-primary)/15 bg-[linear-gradient(180deg,rgba(10,16,30,0.72)_0%,rgba(4,9,22,0.96)_100%)] shadow-[0_20px_48px_-32px_rgba(0,255,232,0.35)] backdrop-blur-sm"
  >
    <UTable
      :columns="columns"
      :data="distribution?.payouts"
      class="max-h-80"
    >
      <template #worker-cell="{ row }">
        {{
          amsCalculatorGetItemLabel(
            workers.find((w) => w.id === row.original.workerId),
            users
          )
        }}
      </template>
    </UTable>
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

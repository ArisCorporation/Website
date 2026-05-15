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
  <AMSUiTableShell>
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
  </AMSUiTableShell>
  <div class="flex space-x-4">
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

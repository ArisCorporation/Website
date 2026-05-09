<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DirectusUser, Transfer, Worker } from '~~/types'

const props = defineProps<{ users: DirectusUser[] }>()

const store = useAMSCalculatorStore()
const { expenses, workers } = storeToRefs(store)

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

function transformWorkers(workers: Worker[]) {
  return workers.map((w) => {
    const label = amsCalculatorGetItemLabel(w, props.users)
    return {
      ...w,
      label,
    }
  })
}
</script>

<template>
  <div class="space-y-6">
    <div
      class="overflow-hidden rounded-2xl border border-(--ui-primary)/15 bg-[linear-gradient(180deg,rgba(10,16,30,0.72)_0%,rgba(4,9,22,0.96)_100%)] shadow-[0_20px_48px_-32px_rgba(0,255,232,0.35)] backdrop-blur-sm"
    >
      <UTable
        :columns="columns"
        :data="expenses"
        class="max-h-80"
      >
        <template #name-cell="{ row }">
          <UInput highlight v-model="row.original.name" />
        </template>
        <template #amount-cell="{ row }">
          <AMSPagesCalculatorCurrencyInput v-model="row.original.amount" />
        </template>
        <template #worker-cell="{ row }">
          <!-- @vue-ignore -->
          <USelectMenu
            v-model="expenses.find((i) => i.id === row.original.id)!.worker"
            :items="transformWorkers(workers)"
            variant="ams"
            value-key="id"
            class="w-48"
          />
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

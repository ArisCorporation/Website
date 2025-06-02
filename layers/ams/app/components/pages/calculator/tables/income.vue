<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DirectusUser, Transfer, Worker } from '~~/types'

const props = defineProps<{ users: DirectusUser[] }>()

const store = useAMSCalculatorStore()
const { incomes, workers } = storeToRefs(store)

const columns: TableColumn<Transfer>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'amount',
    header: 'Einnahme',
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
    <div class="rounded-md border border-(--ui-primary)/20 overflow-hidden">
      <UTable
        :columns="columns"
        :data="incomes"
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
          <!-- @vue-ignore -->
          <USelectMenu
            v-model="incomes.find((i) => i.id === row.original.id)!.worker"
            :items="transformWorkers(workers)"
            variant="ams"
            value-key="id"
            class="w-48"
          />
        </template>
        <template #delete-cell="{ row }">
          <UButton
            @click="store.removeIncome(row.original.id)"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            class="ml-auto"
          />
        </template>
      </UTable>
    </div>
    <UButton
      @click="store.addIncome"
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
        {{
          formatCurrency(
            incomes.reduce((acc, curr) => acc + (curr.amount ?? 0), 0)
          )
        }}
        <UIcon name="i-lucide-currency" class="my-auto ml-1" />
      </span>
    </div>
  </div>
</template>

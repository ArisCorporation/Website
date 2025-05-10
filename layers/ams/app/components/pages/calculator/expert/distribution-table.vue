<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Distribution } from '@@/types/ams-calculator'

defineProps<{ distributions: Distribution[] }>()

const columns: TableColumn<Distribution>[] = [
  {
    accessorKey: 'worker',
    header: 'Mitarbeiter',
  },
  {
    accessorKey: 'expenses',
    header: 'Ausgaben',
  },
  {
    accessorKey: 'share',
    header: 'Betrag',
  },
  {
    accessorKey: 'percentage',
    header: 'Anteil',
  },
]
</script>

<template>
  <div class="rounded-md border border-(--ui-primary)/20 overflow-hidden">
    <UTable
      :columns="columns"
      :data="distributions"
      :ui="{
        thead:
          'bg-(--ui-primary)/5 hover:bg-(--ui-primary)/15 [&>tr]:after:bg-(--ui-primary)/20',
        th: ' text-(--ui-primary)',
        tbody: 'divide-(--ui-primary)/20 worker-tbody',
        tr: 'hover:bg-(--ui-primary)/5',
        td: 'text-(--ui-text)',
      }"
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

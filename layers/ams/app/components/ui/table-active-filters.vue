<script setup lang="ts">
import type { TableActiveFilter } from '../../utils/table-filter'

defineProps<{
  items: TableActiveFilter[]
}>()

const emit = defineEmits<{
  clear: [key: string]
  'clear-all': []
}>()
</script>

<template>
  <div
    v-if="items.length"
    class="flex flex-wrap items-center gap-2 border-b border-(--ui-primary)/10 px-4 py-3"
  >
    <span
      class="text-[10px] font-medium uppercase tracking-[0.24em] text-(--ui-text-muted)"
    >
      Aktive Filter
    </span>

    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full border border-(--ui-primary)/20 bg-(--ui-primary)/10 px-2.5 py-1 text-xs text-white transition-colors hover:border-(--ui-primary)/40 hover:bg-(--ui-primary)/18"
      :title="`${item.label}: ${item.displayValue} entfernen`"
      @click="emit('clear', item.key)"
    >
      <span class="text-(--ui-text-muted)">{{ item.label }}:</span>
      <span>{{ item.displayValue }}</span>
      <UIcon name="i-lucide-x" class="size-3 shrink-0 text-(--ui-primary)" />
    </button>

    <button
      type="button"
      class="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-[11px] text-(--ui-text-muted) transition-colors hover:border-(--ui-primary)/20 hover:text-white"
      @click="emit('clear-all')"
    >
      Alle löschen
    </button>
  </div>
</template>

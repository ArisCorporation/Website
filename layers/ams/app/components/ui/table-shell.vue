<script setup lang="ts">
import type { TableActiveFilter } from '../../utils/table-filter'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    filters?: TableActiveFilter[]
    variant?: 'default' | 'panel'
  }>(),
  {
    filters: () => [],
    variant: 'default',
  }
)

const emit = defineEmits<{
  clear: [key: string]
  'clear-all': []
}>()

const attrs = useAttrs()

const rootClass = computed(() =>
  props.variant === 'panel'
    ? 'overflow-hidden rounded-[calc(var(--ui-radius)*4.5)] border border-(--ui-primary)/15 bg-[linear-gradient(180deg,rgba(10,16,30,0.72)_0%,rgba(4,9,22,0.96)_100%)] shadow-[0_20px_48px_-32px_rgba(0,255,232,0.35)] backdrop-blur-sm'
    : 'overflow-hidden rounded-2xl border border-(--ui-primary)/15 bg-[linear-gradient(180deg,rgba(10,16,30,0.72)_0%,rgba(4,9,22,0.96)_100%)] shadow-[0_20px_48px_-32px_rgba(0,255,232,0.35)] backdrop-blur-sm'
)
</script>

<template>
  <div v-bind="attrs" :class="rootClass">
    <AMSUiTableActiveFilters
      v-if="filters.length"
      :items="filters"
      @clear="emit('clear', $event)"
      @clear-all="emit('clear-all')"
    />

    <slot />
  </div>
</template>

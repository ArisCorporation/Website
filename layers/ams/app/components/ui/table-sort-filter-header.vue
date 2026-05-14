<script setup lang="ts">
import type { TableFilterOption } from '../../utils/table-filter'

const props = withDefaults(
  defineProps<{
    label: string
    column?: any
    items: TableFilterOption[]
    modelValue?: string
    sortable?: boolean
  }>(),
  {
    modelValue: '',
    sortable: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const ALL_VALUE = '__all__'

const hasActiveFilter = computed(() => props.modelValue.trim().length > 0)
const isSortable = computed(
  () => props.sortable && typeof props.column?.toggleSorting === 'function'
)
const selectedLabel = computed(
  () =>
    props.items.find((item) => item.value === props.modelValue)?.label ?? 'Alle'
)

const selectItems = computed<TableFilterOption[]>(() => [
  {
    label: 'Alle',
    value: ALL_VALUE,
  },
  ...props.items,
])

const selectModel = computed({
  get: () => (hasActiveFilter.value ? props.modelValue : ALL_VALUE),
  set: (value: string) => {
    emit('update:modelValue', value === ALL_VALUE ? '' : value)
  },
})

const sortIcon = computed(() => {
  if (!isSortable.value || !props.column?.getIsSorted?.()) {
    return 'i-lucide-chevrons-up-down'
  }

  return props.column.getIsSorted() === 'asc'
    ? 'i-lucide-chevron-up'
    : 'i-lucide-chevron-down'
})

const filterPlaceholder = computed(() => `${props.label} filtern…`)
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      type="button"
      class="flex h-6 items-center gap-1 text-xs leading-none font-medium uppercase tracking-wider text-(--ui-primary) transition-colors"
      :class="isSortable ? 'hover:text-white' : 'cursor-default'"
      :disabled="!isSortable"
      @click="isSortable ? column.toggleSorting() : undefined"
    >
      <span>{{ label }}</span>
      <UIcon
        v-if="isSortable"
        :name="sortIcon"
        class="size-3 shrink-0"
      />
    </button>

    <USelectMenu
      v-model="selectModel"
      :items="selectItems"
      label-key="label"
      value-key="value"
      :search-input="{ placeholder: filterPlaceholder, variant: 'outline' }"
      :trailing="false"
      :disabled="!items.length"
      :title="
        hasActiveFilter
          ? `${label} gefiltert: ${selectedLabel}`
          : `${label} filtern`
      "
      :class="
        hasActiveFilter
          ? 'bg-(--ui-primary)/12 text-(--ui-primary)'
          : 'bg-(--ui-bg)/35 text-(--ui-text-muted) hover:bg-(--ui-primary)/8 hover:text-white'
      "
      :ui="{
        base: 'inline-flex size-6 min-w-6 items-center justify-center rounded-md border border-(--ui-primary)/15 px-0 transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        content: 'min-w-56',
        leading: 'hidden',
        trailing: 'hidden',
      }"
    >
      <template #default>
        <span class="flex size-full items-center justify-center">
          <UIcon name="i-lucide-list-filter" class="size-3.5 shrink-0" />
        </span>
      </template>
    </USelectMenu>
  </div>
</template>

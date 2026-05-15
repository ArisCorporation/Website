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
const filterOpen = ref(false)
const filterSearch = ref('')

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

const sortIcon = computed(() => {
  if (!isSortable.value || !props.column?.getIsSorted?.()) {
    return 'i-lucide-chevrons-up-down'
  }

  return props.column.getIsSorted() === 'asc'
    ? 'i-lucide-chevron-up'
    : 'i-lucide-chevron-down'
})

const filterPlaceholder = computed(() => `${props.label} filtern…`)
const filteredItems = computed(() => {
  const query = filterSearch.value.trim().toLowerCase()

  if (!query) return selectItems.value

  return selectItems.value.filter((item) =>
    item.label.toLowerCase().includes(query)
  )
})

function selectFilter(value: string) {
  emit('update:modelValue', value === ALL_VALUE ? '' : value)
  filterOpen.value = false
  filterSearch.value = ''
}

watch(filterOpen, (open) => {
  if (!open) filterSearch.value = ''
})
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

    <UPopover
      v-model:open="filterOpen"
      :content="{ side: 'bottom', align: 'start', sideOffset: 10 }"
      :title="
        hasActiveFilter
          ? `${label} gefiltert: ${selectedLabel}`
          : `${label} filtern`
      "
      :ui="{
        content: 'w-64 rounded-xl border border-(--ui-primary)/15 bg-[linear-gradient(180deg,rgba(10,16,30,0.98)_0%,rgba(4,9,22,0.98)_100%)] p-2 shadow-[0_20px_48px_-32px_rgba(0,255,232,0.35)] backdrop-blur-sm',
      }"
    >
      <button
        type="button"
        :disabled="!items.length"
        :class="
          hasActiveFilter
            ? 'bg-(--ui-primary)/12 text-(--ui-primary)'
            : 'bg-(--ui-bg)/35 text-(--ui-text-muted) hover:bg-(--ui-primary)/8 hover:text-white'
        "
        class="inline-flex size-6 min-w-6 items-center justify-center rounded-md border border-(--ui-primary)/15 px-0 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      >
        <UIcon name="i-lucide-list-filter" class="size-3.5 shrink-0" />
      </button>

      <template #content>
        <div class="space-y-2">
          <UInput
            v-model="filterSearch"
            :placeholder="filterPlaceholder"
            icon="i-lucide-search"
            size="sm"
            variant="outline"
            autofocus
          />

          <div class="max-h-64 overflow-y-auto">
            <button
              v-for="item in filteredItems"
              :key="item.value"
              type="button"
              class="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-white transition-colors hover:bg-(--ui-primary)/10"
              :class="
                (item.value === ALL_VALUE && !hasActiveFilter) ||
                item.value === modelValue
                  ? 'bg-(--ui-primary)/12'
                  : ''
              "
              @click="selectFilter(item.value)"
            >
              <span class="truncate">{{ item.label }}</span>
              <UIcon
                v-if="
                  (item.value === ALL_VALUE && !hasActiveFilter) ||
                  item.value === modelValue
                "
                name="i-lucide-check"
                class="size-3.5 shrink-0 text-(--ui-primary)"
              />
            </button>

            <div
              v-if="!filteredItems.length"
              class="px-2.5 py-3 text-sm text-(--ui-text-muted)"
            >
              Keine Filter gefunden
            </div>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>

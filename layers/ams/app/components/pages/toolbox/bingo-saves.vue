<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import {
  buildActiveTableFilters,
  buildTableFilterOptions,
} from '../../../utils/table-filter'

type BingoBoardSaveSummary = {
  id: string
  name: string
  createdAt: string
  collectionName: string
  activeCount: number
  completedLineCount: number
  playableCells: number
}

const props = defineProps<{
  saves: BingoBoardSaveSummary[]
}>()

const emit = defineEmits<{
  (e: 'save', name?: string): void
  (e: 'load', id: string): void
  (e: 'delete', id: string): void
  (e: 'clear'): void
}>()

const sorting = ref<{ id: string; desc: boolean }[]>([])
const columnFilters = reactive({
  name: '',
  collectionName: '',
  activeCount: '',
  completedLineCount: '',
  createdAt: '',
})
type BingoFilterKey = keyof typeof columnFilters
const bingoFilterKeys = Object.keys(columnFilters) as BingoFilterKey[]

const AMSUiTableSortFilterHeader = resolveComponent('AMSUiTableSortFilterHeader')

const filterLabels: Record<BingoFilterKey, string> = {
  name: 'Spiel',
  collectionName: 'Kollektion',
  activeCount: 'Fortschritt',
  completedLineCount: 'Bingo',
  createdAt: 'Gespeichert',
}

const nameInput = ref('')

function submitSave() {
  emit('save', nameInput.value)
  nameInput.value = ''
}

const hasSaves = computed(() => props.saves.length > 0)

function formatDate(value: string) {
  return new Date(value).toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const filterGetters: Record<BingoFilterKey, (item: BingoBoardSaveSummary) => string> = {
  name: (item) => item.name.trim(),
  collectionName: (item) => item.collectionName.trim(),
  activeCount: (item) => `${item.activeCount} / ${item.playableCells}`,
  completedLineCount: (item) => `${item.completedLineCount}`,
  createdAt: (item) => formatDate(item.createdAt),
}

const filterOptions = computed<
  Record<BingoFilterKey, { label: string; value: string }[]>
>(() => ({
  name: buildTableFilterOptions(props.saves, (item) => {
    const value = filterGetters.name(item)
    return value ? { label: value, value } : null
  }),
  collectionName: buildTableFilterOptions(props.saves, (item) => {
    const value = filterGetters.collectionName(item)
    return value ? { label: value, value } : null
  }),
  activeCount: buildTableFilterOptions(props.saves, (item) => {
    const value = filterGetters.activeCount(item)
    return value ? { label: value, value } : null
  }),
  completedLineCount: buildTableFilterOptions(props.saves, (item) => {
    const value = filterGetters.completedLineCount(item)
    return value ? { label: value, value } : null
  }),
  createdAt: buildTableFilterOptions(props.saves, (item) => {
    const value = filterGetters.createdAt(item)
    return value ? { label: value, value } : null
  }),
}))

const filteredSaves = computed(() =>
  props.saves.filter((item) =>
    bingoFilterKeys.every((key) => {
      const selectedValue = columnFilters[key]
      return !selectedValue || filterGetters[key](item) === selectedValue
    })
  )
)

const activeFilters = computed(() =>
  buildActiveTableFilters({
    filters: columnFilters,
    labels: filterLabels,
    options: filterOptions.value,
  })
)

function clearFilter(key: BingoFilterKey | string) {
  columnFilters[key as BingoFilterKey] = ''
}

function clearAllFilters() {
  for (const key of bingoFilterKeys) {
    columnFilters[key] = ''
  }
}

function sortableHeader(key: BingoFilterKey, label: string) {
  return ({ column }: { column: any }) =>
    h(AMSUiTableSortFilterHeader, {
      label,
      column,
      items: filterOptions.value[key],
      modelValue: columnFilters[key],
      'onUpdate:modelValue': (value: string) => {
        columnFilters[key] = value
      },
    })
}

const columns: TableColumn<BingoBoardSaveSummary>[] = [
  {
    accessorKey: 'name',
    header: sortableHeader('name', 'Spiel'),
    enableSorting: true,
    meta: {
      class: {
        td: 'min-w-[15rem] whitespace-normal',
      },
    },
  },
  {
    accessorKey: 'collectionName',
    header: sortableHeader('collectionName', 'Kollektion'),
    enableSorting: true,
    meta: {
      class: {
        td: 'min-w-[10rem] whitespace-normal',
      },
    },
  },
  {
    accessorKey: 'activeCount',
    header: sortableHeader('activeCount', 'Fortschritt'),
    enableSorting: true,
  },
  {
    accessorKey: 'completedLineCount',
    header: sortableHeader('completedLineCount', 'Bingo'),
    enableSorting: true,
  },
  {
    accessorKey: 'createdAt',
    header: sortableHeader('createdAt', 'Gespeichert'),
    enableSorting: true,
  },
  {
    id: 'actions',
    header: 'Aktionen',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right',
      },
    },
  },
]
</script>

<template>
  <section
    class="rounded-[28px] border border-white/12 bg-[linear-gradient(155deg,rgba(9,15,32,0.82),rgba(4,9,22,0.92))] p-5 sm:p-6 space-y-5 text-white"
  >
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Vergangene Spiele</h2>
      <p class="text-sm text-white/65">
        Bewahre Layout und Fortschritt deiner Bingo-Runden lokal auf diesem
        Gerät und setze sie später fort.
      </p>
    </div>

    <form
      class="flex flex-col gap-3 sm:flex-row sm:items-center"
      @submit.prevent="submitSave"
    >
      <UButton
        type="submit"
        color="primary"
        icon="i-lucide-save"
        class="sm:self-stretch sm:px-6"
      >
        Speichern
      </UButton>
    </form>

    <div v-if="hasSaves" class="space-y-4">
      <div
        class="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_40px_-32px_rgba(0,255,232,0.45)]"
      >
        <AMSUiTableActiveFilters
          :items="activeFilters"
          @clear="clearFilter"
          @clear-all="clearAllFilters"
        />

        <UTable
          v-model:sorting="sorting"
          :columns="columns"
          :data="filteredSaves"
        >
          <template #name-cell="{ row }">
            <div class="flex flex-col gap-1">
              <span class="font-semibold text-white/90">{{ row.original.name }}</span>
              <span class="text-xs text-white/60">
                {{ row.original.playableCells }} Felder + Freifeld
              </span>
            </div>
          </template>

          <template #collectionName-cell="{ row }">
            <span class="text-sm text-white/75">
              {{ row.original.collectionName }}
            </span>
          </template>

          <template #activeCount-cell="{ row }">
            <UBadge
              variant="outline"
              color="neutral"
              size="sm"
              icon="i-lucide-grid-2x2"
              :label="`${row.original.activeCount} / ${row.original.playableCells}`"
              class="uppercase tracking-[0.18em]"
            />
          </template>

          <template #completedLineCount-cell="{ row }">
            <UBadge
              variant="soft"
              :color="row.original.completedLineCount > 0 ? 'primary' : 'neutral'"
              size="sm"
              :icon="
                row.original.completedLineCount > 0
                  ? 'i-lucide-party-popper'
                  : 'i-lucide-minus'
              "
              :label="`${row.original.completedLineCount}`"
              class="uppercase tracking-[0.18em]"
            />
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-sm text-white/65">
              {{ formatDate(row.original.createdAt) }}
            </span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex flex-wrap items-center justify-end gap-2">
              <UButton
                size="sm"
                color="primary"
                variant="soft"
                icon="i-lucide-play"
                @click="emit('load', row.original.id)"
              >
                Laden
              </UButton>
              <UButton
                size="sm"
                color="neutral"
                variant="ghost"
                icon="i-lucide-trash-2"
                @click="emit('delete', row.original.id)"
              >
                Entfernen
              </UButton>
            </div>
          </template>
        </UTable>
      </div>
      <div class="flex justify-end">
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-lucide-trash"
          @click="emit('clear')"
        >
          Alle löschen
        </UButton>
      </div>
    </div>
    <div
      v-else
      class="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/70"
    >
      Noch keine Spiele gespeichert. Vergib oben einen Namen oder nutze den
      Schnellzugriff, um dein aktuelles Bingo zu sichern.
    </div>
  </section>
</template>

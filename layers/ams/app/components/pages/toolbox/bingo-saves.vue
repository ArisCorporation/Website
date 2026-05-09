<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

/**
 * Overview of stored bingo rounds with quick actions.
 *
 * Lists existing saves, provides load/delete controls and allows new entries.
 */
/** Metadata exposed to the saves table rows. */
type BingoBoardSaveSummary = {
  id: string
  name: string
  createdAt: string
  collectionName: string
  activeCount: number
  completedLineCount: number
  playableCells: number
}

/** Saves to display inside the table. */
const props = defineProps<{
  saves: BingoBoardSaveSummary[]
}>()

/** Emits higher-level actions to the page (save, load, delete, clear). */
const emit = defineEmits<{
  (e: 'save', name?: string): void
  (e: 'load', id: string): void
  (e: 'delete', id: string): void
  (e: 'clear'): void
}>()

const columns: TableColumn<BingoBoardSaveSummary>[] = [
  {
    accessorKey: 'name',
    header: 'Spiel',
    meta: {
      class: {
        td: 'min-w-[15rem] whitespace-normal',
      },
    },
  },
  {
    accessorKey: 'collectionName',
    header: 'Kollektion',
    meta: {
      class: {
        td: 'min-w-[10rem] whitespace-normal',
      },
    },
  },
  {
    accessorKey: 'activeCount',
    header: 'Fortschritt',
  },
  {
    accessorKey: 'completedLineCount',
    header: 'Bingo',
  },
  {
    accessorKey: 'createdAt',
    header: 'Gespeichert',
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

/** Holds the optional name entered for a new save. */
const nameInput = ref('')

/** Submit handler that forwards the chosen name to the parent. */
function submitSave() {
  emit('save', nameInput.value)
  nameInput.value = ''
}

/** Quick helper used to toggle the table state. */
const hasSaves = computed(() => props.saves.length > 0)

/** Format the stored timestamp for the table view. */
function formatDate(value: string) {
  return new Date(value).toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
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
        <UTable :columns="columns" :data="props.saves">
          <template #name-cell="{ row }">
            <div class="flex flex-col gap-1">
              <span class="font-semibold text-white/90">{{ row.original.name }}</span>
              <span class="text-xs text-white/60">
                {{ row.original.playableCells }} Felder + Freifeld
              </span>
            </div>
          </template>

          <template #collectionName-cell="{ row }">
            <span class="text-sm text-white/75">{{
              row.original.collectionName
            }}</span>
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

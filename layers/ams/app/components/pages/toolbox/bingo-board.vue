<script setup lang="ts">
/**
 * Interactive bingo board grid.
 *
 * Renders 5x5 cells, highlights completed lines and emits toggle events.
 */
type BingoCell = {
  id: string
  label: string
  active: boolean
  isFree?: boolean
}

/** Cells to render plus indices for completed line styling. */
const props = defineProps<{
  board: BingoCell[]
  completedCellIndices: Set<number>
}>()

const emit = defineEmits<{
  (e: 'toggle', index: number): void
}>()

/** Bubble up board toggle requests to the parent page. */
const handleToggle = (index: number) => {
  emit('toggle', index)
}
</script>

<template>
  <div class="-mx-2 overflow-x-auto pb-2 sm:mx-0 sm:overflow-visible sm:pb-0">
    <div
      class="grid min-w-[720px] grid-cols-5 gap-2 p-2 text-[10px] font-medium leading-tight text-slate-200 sm:min-w-0 sm:gap-3 sm:p-3 sm:text-[12px] sm:leading-snug lg:gap-4 lg:p-4 lg:text-sm"
    >
      <button
        v-for="(cell, index) in props.board"
        :key="cell.id"
        type="button"
        class="group relative flex min-h-[120px] w-full flex-col items-start justify-between gap-3 overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(155deg,rgba(9,15,32,0.96),rgba(4,9,22,0.82))] px-4 py-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] sm:min-h-[150px] sm:px-5 sm:py-6"
        :class="[
          cell.active
            ? 'border-[rgba(0,226,207,0.4)] bg-[linear-gradient(160deg,rgba(8,16,26,0.94),rgba(0,226,207,0.18))] text-white shadow-[0_16px_38px_-24px_rgba(0,226,207,0.5)] saturate-110'
            : 'hover:border-(--ui-primary)/35 hover:bg-[linear-gradient(165deg,rgba(10,18,36,0.9),rgba(6,13,28,0.84))] hover:shadow-[0_18px_36px_-24px_rgba(0,255,232,0.4)]',
          props.completedCellIndices.has(index)
            ? 'outline outline-2 outline-offset-[-4px] outline-(--ui-primary)/70'
            : '',
        ]"
        @click="handleToggle(index)"
      >
        <div class="relative z-10 flex w-full flex-col gap-3">
          <div class="flex items-start justify-between gap-3">
            <span
              class="text-[9px] font-semibold uppercase tracking-[0.32em] text-(--ui-primary)/60 sm:text-[10px] lg:text-[11px]"
              :class="
                cell.active
                  ? 'text-white/90 drop-shadow-[0_0_10px_rgba(0,226,207,0.45)]'
                  : ''
              "
            >
              {{ cell.isFree ? 'Freifeld' : 'AMS' }}
            </span>
            <span
              v-if="cell.active && !cell.isFree"
              class="flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(0,226,207,0.4)] bg-[rgba(0,226,207,0.22)] text-white shadow-[0_8px_18px_rgba(0,226,207,0.28)] transition-transform duration-200 group-hover:scale-110 sm:h-7 sm:w-7"
            >
              <UIcon name="i-lucide-check" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>
          <div class="w-full space-y-2 text-left">
            <p
              class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[12px] font-medium leading-6 tracking-tight text-white/85 transition-all duration-200 sm:text-[15px] lg:text-[16px]"
              :class="
                cell.active
                  ? 'border-[rgba(0,226,207,0.4)] bg-[rgba(0,226,207,0.12)] text-white shadow-[0_8px_24px_rgba(0,226,207,0.18)]'
                  : ''
              "
            >
              {{ cell.label }}
            </p>
            <span
              v-if="cell.isFree"
              class="inline-flex items-center gap-2 rounded-full border border-(--ui-primary)/30 bg-(--ui-primary)/10 px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.28em] text-(--ui-primary)/70 sm:text-[9px] lg:text-[10px]"
            >
              <UIcon name="i-lucide-infinity" class="h-3 w-3" />
              Immer aktiv
            </span>
          </div>
        </div>
        <span
          class="pointer-events-none absolute inset-0 z-0 rounded-2xl border border-white/10 opacity-0 transition-opacity duration-200"
          :class="
            cell.active
              ? 'opacity-35 border-[rgba(0,226,207,0.35)]'
              : 'group-hover:opacity-45'
          "
        />
        <span
          class="pointer-events-none absolute inset-x-6 top-[14px] z-0 h-px bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 transition-opacity duration-200"
          :class="cell.active ? 'opacity-70' : 'group-hover:opacity-40'"
        />
      </button>
    </div>
  </div>
</template>

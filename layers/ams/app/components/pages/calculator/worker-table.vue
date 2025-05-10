<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { useSortable } from '@vueuse/integrations/useSortable.mjs'
import type { MoveEvent, SortableEvent } from 'sortablejs'
import type { Worker, Crew } from '@@/types/ams-calculator'

const props = defineProps<{ workers: Worker[]; crews: Crew[] }>()

const currentCrew = ref<Crew | null>(null)

const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const columns: TableColumn<Worker>[] = [
  {
    id: 'handle',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'crew',
    header: 'Crew',
  },
  {
    accessorKey: 'external',
    header: 'Extern',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-left' },
        h(UCheckbox, {
          'aria-label': 'Extern',
        })
      )
    },
  },
  {
    accessorKey: 'manager',
    header: 'Manager',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-left' },
        h(UCheckbox, {
          'aria-label': 'Manager',
        })
      )
    },
  },
  {
    id: 'delete',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(UButton, {
          icon: 'i-lucide-trash-2',
          color: 'error',
          variant: 'ghost',
          class: 'ml-auto',
          'aria-label': 'Crew Löschen',
        })
      )
    },
  },
]

useSortable('.worker-tbody', props.workers, {
  animation: 150,
  group: {
    name: 'worker',
    pull: 'clone', // Wichtig: Klonen beim Ziehen aus der Tabelle
    put: false, // Verhindert, dass externe Elemente hier abgelegt werden können (per SortableJS)
  },
  sort: false,
  onMove: (event: MoveEvent) => {
    if (!event.related?.parentElement?.children) return

    // Crew auswählen, wenn ein User über eine Crew-Zeile gezogen wird
    const crewIndex = Array.from(event.related.parentElement.children).indexOf(
      event.related
    )
    const crew = props.crews[crewIndex]
    if (crew) currentCrew.value = crew

    return false // Verhindert DOM-Manipulation in der Crew-Liste
  },
  onEnd: (event: SortableEvent) => {
    if (event.oldIndex === undefined) return

    const draggedWorker = props.workers[event.oldIndex]

    // Prüfen, ob ein Ziel-Crew durch die CrewTable-Komponente gesetzt wurde
    if (draggedWorker && currentCrew.value) {
      // Der event.to Check ist schwierig über Komponenten hinweg,
      // wir verlassen uns darauf, dass potentialDropTargetCrew nur gesetzt wird,
      // wenn der Drag tatsächlich über der Crew-Tabelle ist.
      console.log(
        `WorkerTable: Drop detected for ${draggedWorker.name} on potential crew ${currentCrew.value.name}`
      )
      // TODO: set worker to crew
      // emit('assign-worker-to-crew', {
      //   worker: draggedWorker,
      //   crew: potentialDropTargetCrew.value,
      // })
    }

    // Geteilten Zustand immer zurücksetzen
    if (currentCrew) currentCrew.value = null
  },
})
</script>

<template>
  <div class="rounded-md border border-(--ui-primary)/20 overflow-hidden">
    <UTable
      :columns="columns"
      :data="workers"
      :ui="{
        thead:
          'bg-(--ui-primary)/5 hover:bg-(--ui-primary)/15 [&>tr]:after:bg-(--ui-primary)/20',
        th: ' text-(--ui-primary)',
        tbody: 'divide-(--ui-primary)/20 worker-tbody',
        tr: 'hover:bg-(--ui-primary)/5',
        td: 'text-(--ui-text)',
      }"
    >
      <template #handle-cell="{ row }">
        <UIcon name="i-lucide-grip-vertical" />
      </template>
      <template #name-cell="{ row }">
        <UInput highlight v-model="row.original.name" />
      </template>
      <template #crew-cell="{ row }">
        <UBadge
          variant="subtle"
          :label="row.original.crew"
          class="rounded-full"
        />
      </template>
    </UTable>
  </div>
  <UButton
    variant="outline"
    label="Mitarbeiter hinzufügen"
    icon="i-lucide-plus"
    class="w-full justify-center"
  />
  <div
    ref="customDragPreviewElementRef"
    class="absolute top-[-100000px] px-2 py-3 bg-(--ui-bg-muted)/20 border border-(--ui-primary)/10 backdrop-blur-xs z-[999] pointer-events-none shadow"
  >
    <div style="display: flex; align-items: center; gap: 8px">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0, 255, 255, 0.15);
        "
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div style="display: flex; flex-direction: column; gap: 2px">
        <div style="font-weight: 600">Thomas Blakeney</div>
        <div style="font-size: 11px; opacity: 0.7">Cargo</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useSortable } from '@vueuse/integrations/useSortable.mjs'
import type { MoveEvent, SortableEvent } from 'sortablejs'
import type { Worker, Crew } from '~~/types'
import type { DirectusUser } from '~~/types'

const props = defineProps<{ users: DirectusUser[] }>()
console.log(props.users)
const store = useAMSCalculatorStore()
const { workers, crews, settings } = storeToRefs(store)

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
  },
  {
    accessorKey: 'manager',
    header: 'Manager',
  },
  {
    id: 'delete',
  },
]

useSortable('.worker-tbody', workers.value, {
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
    const crew = crews.value[crewIndex]
    if (crew) currentCrew.value = crew

    return false // Verhindert DOM-Manipulation in der Crew-Liste
  },
  onEnd: (event: SortableEvent) => {
    if (event.oldIndex === undefined) return

    const draggedWorker = workers.value[event.oldIndex]

    // Prüfen, ob ein Ziel-Crew durch die CrewTable-Komponente gesetzt wurde
    if (draggedWorker && currentCrew.value) {
      // Der event.to Check ist schwierig über Komponenten hinweg,
      // wir verlassen uns darauf, dass potentialDropTargetCrew nur gesetzt wird,
      // wenn der Drag tatsächlich über der Crew-Tabelle ist.

      // Get Worker refference
      const workerRef = workers.value.find((w) => w.id === draggedWorker.id)

      // Set new Crew for Worker
      if (workerRef) workerRef.crew = currentCrew.value.id
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
        tr: 'hover:bg-(--ui-primary)/5 group cursor-grab active:cursor-grabbing',
        td: 'text-(--ui-text)',
      }"
      class="max-h-80"
    >
      <template #handle-cell="{ row }">
        <div
          class="group-hover:bg-(--ui-primary)/10 size-8 flex rounded-md -mx-2"
        >
          <UIcon
            name="i-lucide-grip-vertical"
            class="m-auto size-4 group-hover:text-(--ui-primary)"
          />
        </div>
      </template>
      <template #name-cell="{ row }">
        <UInput
          v-if="row.original.external"
          highlight
          v-model="row.original.external_name"
        />
        <USelectMenu
          v-else
          v-model="workers.find((w) => w.id === row.original.id)!.internal_id"
          :items="users"
          variant="ams"
          value-key="id"
          class="w-48"
        />
      </template>
      <template #crew-cell="{ row }">
        <UBadge
          variant="subtle"
          :color="row.original.external ? 'secondary' : 'primary'"
          :label="
            (crews.find((c) => c.id === row.original.crew)?.name ?? 'N/A') +
            (row.original.external ? ' (extern)' : '')
          "
          class="rounded-full"
        />
      </template>
      <template #external-cell="{ row }">
        <UCheckbox
          v-model="workers.find((w) => w.id === row.original.id)!.external"
        />
      </template>
      <template #manager-cell="{ row }">
        <UCheckbox
          @click="() => (settings.manager = row.original.id)"
          :model-value="settings.manager === row.original.id"
          :disabled="settings.manager === row.original.id"
        />
      </template>
      <template #delete-cell="{ row }">
        <UButton
          @click="store.removeWorker(row.original.id)"
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          class="ml-auto"
        />
      </template>
    </UTable>
  </div>
  <UButton
    @click="store.addWorker"
    variant="outline"
    label="Mitarbeiter hinzufügen"
    icon="i-lucide-plus"
    class="w-full justify-center"
  />
  <!-- todo: drag window -->
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

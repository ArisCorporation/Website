<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useSortable } from '@vueuse/integrations/useSortable.mjs'
import type { MoveEvent, SortableEvent } from 'sortablejs'
import type { CalculatorUserOption, Worker, Crew } from '~~/types'

const props = defineProps<{ users: CalculatorUserOption[] }>()

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
    pull: 'clone',
    put: false,
  },
  sort: false,
  onMove: (event: MoveEvent) => {
    if (!event.related?.parentElement?.children) return

    const crewIndex = Array.from(event.related.parentElement.children).indexOf(
      event.related
    )
    const crew = crews.value[crewIndex]
    if (crew) currentCrew.value = crew

    return false
  },
  onEnd: (event: SortableEvent) => {
    if (event.oldIndex === undefined) return

    const draggedWorker = workers.value[event.oldIndex]

    if (draggedWorker && currentCrew.value) {
      const workerRef = workers.value.find((w) => w.id === draggedWorker.id)

      if (workerRef) workerRef.crew = currentCrew.value.id
    }

    if (currentCrew) currentCrew.value = null
  },
})
</script>

<template>
  <AMSUiTableShell>
    <UTable
      :columns="columns"
      :data="workers"
      :ui="{
        tbody: 'worker-tbody',
        tr: 'group cursor-grab active:cursor-grabbing',
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
  </AMSUiTableShell>
  <UButton
    @click="store.addWorker"
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

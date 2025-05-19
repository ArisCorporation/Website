<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useSortable } from '@vueuse/integrations/useSortable.mjs'
import type { Ships } from '~~/types'

defineProps<{ ships: Ships[] }>()

const store = useAMSCalculatorStore()
const { crews } = storeToRefs(store)
const expanded = ref({ 1: true })
const editSlideover = ref<boolean>(false)

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const columns: TableColumn<Ships>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : '',
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => `Custom name`,
  },
  {
    accessorKey: 'model',
    header: 'Modell',
    cell: ({ row }) => `${row.getValue('name')}`,
  },
  {
    accessorKey: 'manufacturer',
    header: 'Hersteller',
    cell: ({ row }) => `${row.getValue('manufacturer')?.name}`,
  },
  {
    accessorKey: 'visibility',
    header: 'Sichtbarkeit',
    cell: ({ row }) => {
      const color = {
        public: 'success' as const,
        internal: 'primary' as const,
        private: 'neutral' as const,
      }[row.getValue('visibility') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.getValue('visibility')
      )
    },
  },
  {
    accessorKey: 'allocation',
    header: 'Zuordnung',
    cell: ({ row }) => {
      const color = {
        ariscorp: 'primary' as const,
        private: 'neutral' as const,
      }[row.getValue('allocation') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.getValue('allocation')
      )
    },
  },
  {
    accessorKey: 'department',
    header: 'Abteilung',
  },
  {
    id: 'actions',
  },
]
</script>

<template>
  <div class="rounded-md border border-(--ui-primary)/20 overflow-hidden">
    <UTable
      ref="teamsUiTableRef"
      v-model:expanded="expanded"
      :columns="columns"
      :data="ships"
      :ui="{
        thead:
          'bg-(--ui-primary)/5 hover:bg-(--ui-primary)/15 [&>tr]:after:bg-(--ui-primary)/20',
        th: ' text-(--ui-primary)',
        tbody: 'divide-(--ui-primary)/20',
        tr: 'hover:bg-(--ui-primary)/5',
        td: 'text-(--ui-text)',
      }"
      class="h-xl"
    >
      <template #actions-cell="{ row }">
        <USlideover
          v-model:open="editSlideover"
          :ui="{
            header: '!p-0',
            content: 'ring-(--ui-primary)/10 divide-(--ui-primary)/10',
          }"
        >
          <UButton variant="ghost" icon="i-lucide-square-pen" class="ml-auto" />
          <template #header>
            <div class="relative aspect-[26/9] overflow-hidden">
              <NuxtImg
                :src="row.original.store_image"
                class="h-full not-prose w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </template>
          <template #body>
            <UForm>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Schiffsname" class="col-span-2">
                  <UInput variant="ghost" highlight class="w-full" />
                </UFormField>
                <UFormField label="Seriennummer">
                  <UInput variant="ghost" highlight class="w-full" />
                </UFormField>
                <UFormField label="Paint">
                  <UInput variant="ghost" highlight class="w-full" />
                </UFormField>
              </div>
            </UForm>
          </template>
          <template #footer>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <UButton
                @click="() => (editSlideover = false)"
                label="Schließen"
                variant="outline"
                color="error"
                size="lg"
                class="w-full justify-center"
              />
              <UButton
                label="Speichern"
                variant="outline"
                color="success"
                size="lg"
                class="w-full justify-center"
              />
            </div>
          </template>
        </USlideover>
        <UButton
          @click="store.removeCrew(row.original.id)"
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          class="ml-auto"
        />
      </template>
      <template #expanded="{ row }">
        <pre>{{ row.original }}</pre>
      </template>
    </UTable>
  </div>
</template>

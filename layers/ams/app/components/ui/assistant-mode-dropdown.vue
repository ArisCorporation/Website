<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const props = withDefaults(
  defineProps<{
    assistantActive: boolean
    extraItems?: DropdownMenuItem[]
  }>(),
  {
    extraItems: () => [],
  }
)

const emit = defineEmits<{
  'toggle-mode': []
}>()

const items = computed<DropdownMenuItem[]>(() => [
  {
    label: 'Aktionen',
    type: 'label',
  },
  {
    type: 'separator',
  },
  {
    onSelect: () => emit('toggle-mode'),
    slot: 'mode',
  },
  ...props.extraItems,
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{
      align: 'start',
      side: 'bottom',
      sideOffset: 8,
    }"
    :ui="{
      content: 'w-48 ring-(--ui-primary)/20 bg-(--ui-bg-muted)',
      separator: 'bg-(--ui-primary)/10',
    }"
  >
    <UButton label="Optionen" icon="i-lucide-menu" variant="outline" />
    <template #mode-label>
      {{ assistantActive ? 'Expertenmodus' : 'Assistenten-Modus' }}
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { SelectMenuItem, RadioGroupItem } from '@nuxt/ui'

const divisionOptions = reactive<SelectMenuItem[]>([
  { label: 'UEE Army', value: 'army' },
  { label: 'UEE Marine', value: 'marines' },
  { label: 'UEE Navy', value: 'navy' },
])

const dismissalOptions = reactive<RadioGroupItem[]>([
  { label: 'Ehrenhaft', value: 'honorably' },
  { label: 'Unehrenhaft', value: 'dishonorably' },
])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <UFormField label="Division" name="division" size="xs" class="w-full">
      <USelectMenu
        indicator="hidden"
        orientation="horizontal"
        variant="ams"
        size="md"
        :items="divisionOptions"
        class="prose-p:my-0 w-48"
      />
    </UFormField>
    <UFormField label="Entlassung" name="dismissal" size="xs" class="w-full">
      <URadioGroup
        indicator="hidden"
        variant="table"
        orientation="horizontal"
        :items="dismissalOptions"
        class="prose-p:my-0"
      />
    </UFormField>
    <UFormField
      label="Dienstzeitraum"
      name="military_range"
      size="xs"
      class="w-full col-span-2"
    >
      <div class="flex gap-x-2">
        <UFormField
          label="Von"
          name="military_range_from"
          size="xs"
          class="w-1/2 shrink"
        >
          <UInput highlight size="md" class="w-full mb-1" placeholder="12" />
          <UInput highlight size="md" class="w-full" placeholder="2939" />
        </UFormField>
        <UFormField
          label="Bis"
          name="military_range_to"
          size="xs"
          class="w-1/2 shrink"
        >
          <UInput highlight size="md" class="w-full mb-1" placeholder="12" />
          <UInput highlight size="md" class="w-full" placeholder="2945" />
        </UFormField>
      </div>
    </UFormField>
    <UFormField
      label="Wieso wurdest du entlassen?"
      name="dismissal_reason"
      size="xs"
      class="w-full col-span-2"
    >
      <UTextarea
        :rows="12"
        class="w-full"
        :ui="{
          base: 'ring-(--ui-primary)/20 bg-transparent',
        }"
      />
    </UFormField>
  </div>
</template>

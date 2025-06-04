<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui'

const store = useUserProfileEditStore()

const schools = reactive<SelectMenuItem[]>([
  { label: 'University of Mentor (UM)', value: 'um' },
  { label: 'Astravin University at Cestulus (AUC)', value: 'auc' },
  { label: 'Fujin Technical College (FTC)', value: 'ftc' },
  {
    label:
      'University of Persei Analytical Research and Quantification (UPARQ)',
    value: 'uparq',
  },
  { label: 'Quazi-Institut für Xenologische Studien (QIXS)', value: 'qixs' },
])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <UFormField
      label="Welche Hochschulbildung hast du absolviert?"
      name="education_name"
      size="xs"
      class="w-full"
    >
      <UInput
        v-model="store.formData.education_name"
        highlight
        size="md"
        placeholder="z.B. z.B. Medizinstudium mit Schwerpunkt auf Neurochirurgie"
        class="w-full"
      />
    </UFormField>
    <UFormField
      label="Hochschule"
      name="education_place"
      class="w-full"
      size="xs"
    >
      <USelectMenu
        v-model="store.formData.education_place"
        indicator="hidden"
        orientation="horizontal"
        variant="ams"
        size="md"
        :items="schools"
        value-key="value"
        class="prose-p:my-0 w-full max-w-xl"
      />
    </UFormField>
    <UFormField
      label="Bildungszeitraum"
      name="education_range"
      size="xs"
      class="w-full col-span-2"
    >
      <div class="flex gap-x-2">
        <UFormField
          label="Von"
          name="education_range_from"
          size="xs"
          class="w-1/2 shrink"
        >
          <UFormField name="education_from_month" :ui="{ error: '!mt-0' }">
            <UInput
              v-model="store.formData.education_from_month"
              type="number"
              highlight
              size="md"
              class="w-full mb-1"
              placeholder="z.B. z.B. 12"
            />
          </UFormField>
          <UFormField name="education_from_year" :ui="{ error: '!mt-0' }">
            <UInput
              v-model="store.formData.education_from_year"
              type="number"
              highlight
              size="md"
              class="w-full"
              placeholder="z.B. z.B. 2939"
            />
          </UFormField>
        </UFormField>
        <UFormField
          label="Bis"
          name="education_range_to"
          size="xs"
          class="w-1/2 shrink"
        >
          <UFormField name="education_to_month" :ui="{ error: '!mt-0' }">
            <UInput
              v-model="store.formData.education_to_month"
              type="number"
              highlight
              size="md"
              class="w-full mb-1"
              placeholder="z.B. z.B. 12"
            />
          </UFormField>
          <UFormField name="education_to_year" :ui="{ error: '!mt-0' }">
            <UInput
              v-model="store.formData.education_to_year"
              type="number"
              highlight
              size="md"
              class="w-full"
              placeholder="z.B. z.B. 2945"
            />
          </UFormField>
        </UFormField>
      </div>
    </UFormField>
  </div>
</template>

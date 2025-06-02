<script setup lang="ts">
const profileEdit = useUserProfileEditStore()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <UFormField
      label="Größe"
      hint="in CM"
      name="height"
      size="xs"
      class="w-full"
    >
      <UInput
        v-model="profileEdit.formData.height"
        highlight
        size="md"
        placeholder="z.B. 182"
        type="number"
        class="w-full"
      />
    </UFormField>
    <UFormField
      label="Gewicht"
      hint="in KG"
      name="weight"
      size="xs"
      class="w-full"
    >
      <UInput
        v-model="profileEdit.formData.weight"
        highlight
        size="md"
        placeholder="z.B. 85"
        type="number"
        class="w-full"
      />
    </UFormField>
    <UFormField label="Haarfarbe" name="hair_color" size="xs" class="w-full">
      <UInput
        v-model="profileEdit.formData.hair_color"
        highlight
        size="md"
        placeholder="z.B. Blond"
        class="w-full"
      />
    </UFormField>
    <UFormField label="Augenfarbe" name="eye_color" size="xs" class="w-full">
      <UInput
        v-model="profileEdit.formData.eye_color"
        highlight
        size="md"
        placeholder="z.B. Blau/Grau"
        class="w-full"
      />
    </UFormField>
    <UFormField
      label="Medizinisch relevante Informationen?"
      name="medical_information"
      size="xs"
      class="w-full col-span-2"
    >
      <UTextarea
        v-model="profileEdit.formData.medical_informations"
        :rows="12"
        class="w-full"
        :ui="{
          base: 'ring-(--ui-primary)/20 bg-transparent',
        }"
      />
    </UFormField>
  </div>
</template>

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
        placeholder="182"
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
        placeholder="85"
        class="w-full"
      />
    </UFormField>
    <UFormField label="Haarfarbe" name="hair_color" size="xs" class="w-full">
      <UInput
        v-model="profileEdit.formData.hair_color"
        highlight
        size="md"
        placeholder="Blond"
        class="w-full"
      />
    </UFormField>
    <UFormField label="Augenfarbe" name="eye_color" size="xs" class="w-full">
      <UInput
        v-model="profileEdit.formData.eye_color"
        highlight
        size="md"
        placeholder="Blau/Grau"
        class="w-full"
      />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isExporting: boolean
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'export'): void
  (e: 'shuffle'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton
      color="primary"
      icon="i-lucide-save"
      @click="emit('save')"
    >
      Spiel speichern
    </UButton>
    <UButton
      color="primary"
      variant="subtle"
      icon="i-lucide-image-down"
      :loading="isExporting"
      @click="emit('export')"
    >
      Als Bild exportieren
    </UButton>
    <UButton
      color="primary"
      variant="outline"
      icon="i-lucide-shuffle"
      @click="emit('shuffle')"
    >
      Neu mischen
    </UButton>
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-rotate-ccw"
      @click="emit('reset')"
    >
      Zurücksetzen
    </UButton>
  </div>
</template>

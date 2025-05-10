<script setup lang="ts">
defineProps<{
  totalSteps: number
  currentStep: number
}>()
</script>

<template>
  <div class="flex items-center space-x-2 mb-6">
    <div
      v-for="(step, index) in Array.from({ length: totalSteps })"
      :key="index"
      class="h-2 rounded-full transition-all duration-300"
      :class="[
        index < currentStep
          ? 'bg-(--ui-primary) w-8'
          : index === currentStep
          ? 'bg-(--ui-primary)/70 w-12 animate-pulse'
          : 'bg-(--ui-primary)/20 w-8',
      ]"
    ></div>
  </div>
</template>

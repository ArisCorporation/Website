<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon: string
}>()
</script>

<template>
  <!-- <div class="mb-6 md:mb-8">
    <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-white">
      {{ title }}
    </h1>
    <p class="text-muted-foreground">{{ description }}</p>
  </div> -->

  <div class="flex items-center justify-between mb-6 md:mb-8">
    <div class="flex items-center space-x-4">
      <UIcon :name="icon" class="h-8 w-8 text-(--ui-primary)" />
      <div class="prose-p:my-0">
        <h1 class="text-2xl font-bold tracking-tight mb-0">{{ title }}</h1>
        <p class="text-muted-foreground">
          {{ description }}
        </p>
      </div>
    </div>
    <div v-if="$slots" class="flex items-center space-x-2">
      <slot />
    </div>
  </div>
</template>

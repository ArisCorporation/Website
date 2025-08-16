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
    <div v-if="$slots.default" class="flex items-center space-x-2">
      <slot />
    </div>
    <div>
      <video
        autoplay
        loop
        playbackspeed="0.2"
        src="https://studio.ariscorp.de/assets/fcb6b51a-c3b4-44b0-888d-2462f4197e55"
        class="w-72 h-12 object-cover"
      />
    </div>
  </div>
</template>

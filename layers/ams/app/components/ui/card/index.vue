<script setup lang="ts">
defineProps<{ animated?: boolean }>()
</script>

<template>
  <div
    class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-elevated)/10 backdrop-blur-xs transition-all duration-300 hover:shadow-primary-md"
    :class="{ animated: 'animated-border' }"
  >
    <slot />
  </div>
</template>

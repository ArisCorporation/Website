<script setup lang="ts">
defineProps(['fullscreen_toggle', 'fullscreen_state']);
</script>

<template>
  <UButton
    :icon="fullscreen_state ? 'i-mdi-fullscreen-exit' : 'i-mdi-fullscreen'"
    size="xs"
    :variant="fullscreen_state ? 'solid' : 'ghost'"
    :color="fullscreen_state ? 'primary' : 'white'"
    @click="fullscreen_toggle"
  />
</template>

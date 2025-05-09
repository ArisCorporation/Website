<script setup lang="ts">
defineProps<{animated?: boolean}>()
</script>

<template>
  <div class="rounded-lg border border-(--ui-primary)/10 bg-[rgb(10, 10, 15)] text-[hsl(0 0% 98%)] shadow-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,232,0.15)]" :class="{animated: 'animated-border'}">
    <slot />
  </div>
</template>
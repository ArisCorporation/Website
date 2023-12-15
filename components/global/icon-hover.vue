<script setup lang="ts">
defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: false,
    default: 'full',
  },
});
</script>

<template>
  <div class="relative aspect-square" :class="'w-' + size + ' h-' + size">
    <Icon class="absolute top-0 left-0 z-10 w-full h-full fill-white peer" :name="name" />
    <Icon
      class="absolute top-0 left-0 w-full h-full opacity-0 transition-peer blur fill-aris-400 peer-hover:opacity-100"
      :name="name"
    />
  </div>
</template>

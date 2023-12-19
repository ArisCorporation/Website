<script setup lang="ts">
defineProps({
  src: {
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
  <div class="relative aspect-square group" :class="'w-' + size + ' h-' + size">
    <NuxtImg class="absolute top-0 left-0 z-10 w-full h-full fill-white" :src="src" />
    <NuxtImg
      class="absolute top-0 left-0 w-full h-full opacity-0 transition-peer blur img-primary group-hover:opacity-75"
      :src="src"
    />
  </div>
</template>

<!-- filter: invert(100%) invert(95%) sepia(67%) saturate(2509%) hue-rotate(89deg) brightness(107%) contrast(101%); -->
<style scoped lang="postcss">
.img-primary {
  filter: invert(100%) invert(77%) sepia(100%) saturate(699%) hue-rotate(98deg) brightness(104%) contrast(101%)
    blur(5px);
}
</style>

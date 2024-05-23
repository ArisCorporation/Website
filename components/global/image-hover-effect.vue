<script setup lang="ts">
defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    required: false,
  },
});
</script>

<template>
  <div class="relative aspect-[1/1] group">
    <NuxtImg
      :src="src"
      :alt="alt"
      :placeholder="[16, 16, 1, 5]"
      class="absolute top-0 left-0 z-10 w-full h-full fill-white"
    />
    <NuxtImg
      :src="src"
      :placeholder="[16, 16, 1, 5]"
      :alt="alt + ' - Glow-Effect'"
      class="absolute top-0 left-0 w-full h-full opacity-0 transition-peer blur img-primary group-hover:opacity-75"
    />
  </div>
</template>

<!-- filter: invert(100%) invert(95%) sepia(67%) saturate(2509%) hue-rotate(89deg) brightness(107%) contrast(101%); -->
<!-- before: blur(5px) -->
<style scoped>
.img-primary {
  filter: invert(100%) invert(77%) sepia(100%) saturate(699%) hue-rotate(98deg) brightness(104%) contrast(101%)
    blur(8px);
}
</style>

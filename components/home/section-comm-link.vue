<script setup lang="ts">
defineProps({
  data: {
    type: Array as PropType<ICommLink[]>,
    required: true,
  },
});
</script>

<template>
  <div class="mt-16">
    <div class="flex w-full">
      <h1><span class="text-primary-400">ArisCorp</span> Comm-Link</h1>
      <NuxtLink to="/comm-link" class="mt-auto ml-auto text-tbase hover:text-secondary animate-link hover:brightness-85"
        >Alle Comm-Links</NuxtLink
      >
    </div>
    <hr class="mt-0" />
    <div class="comm-link-grid">
      <CommLinkCard v-for="(commLink, index) in data" :key="commLink.id" :data="commLink" :size="index == 0 ? 3 : 1" />
    </div>
  </div>
</template>

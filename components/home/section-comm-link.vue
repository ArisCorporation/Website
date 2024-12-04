<script setup lang="ts">
defineProps({
  data: {
    type: null,
    required: true,
  },
});
</script>

<template>
  <div class="mt-16">
    <div class="flex w-full">
      <h1><span class="text-aris-400">ArisCorp</span> Comm-Link</h1>
      <NuxtLink
        to="/comm-link"
        class="mt-auto ml-auto text-neutral-200 hover:text-industrial-400 animate-link hover:brightness-85"
        >Alle Comm-Links</NuxtLink
      >
    </div>
    <hr class="mt-0" />
    <div class="comm-link-grid">
      <CommLinkCard v-for="(commLink, index) in data" :key="commLink.id" :data="commLink" :size="index == 0 ? 3 : 1" />
    </div>
  </div>
</template>

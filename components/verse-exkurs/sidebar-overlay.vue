<script setup lang="ts">
const VeStore = useVeStore();
</script>

<template>
  <div v-if="VeStore.MobileSidebar" class="fixed inset-0 z-30 bg-bprimary/50" @click="VeStore.ToggleMobileSidebar" />
</template>

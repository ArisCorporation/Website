<script setup lang="ts">
defineProps({
  state: {
    type: Boolean,
    required: true,
  },
});
</script>

<template>
  <div v-if="state" class="fixed inset-0 z-30 bg-bprimary/50" />
</template>

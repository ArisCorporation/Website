<script setup>
const triggerError = () => {
  throw new Error('Nuxt Button Error');
};
</script>

<template>
  <SentryTestButton @click="triggerError" />
</template>

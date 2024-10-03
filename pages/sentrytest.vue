<script setup lang="ts">
function throwError() {
  throw new Error('Sentry Error');
}
</script>
<template>
  <div>
    <button @click="throwError">Throw</button>
  </div>
</template>

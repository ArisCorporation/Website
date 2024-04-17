<script setup>
const config = useRuntimeConfig();
console.log(config);
function throwError() {
  throw new Error('Sentry Error');
}
</script>

<template>
  <div>
    <h1>TEST PAGE</h1>
    <button @click="throwError">Throw error</button>
  </div>
</template>

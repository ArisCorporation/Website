<script setup lang="ts">
defineProps({
  error: {
    type: Object,
    default: null,
  },
});

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <div>
    <div class="pt-16 text-center">
      <h1 class="uppercase text-aris-400">Status Code: {{ error.statusCode }}</h1>
      <h2 class="uppercase text-industrial-400">{{ error.statusMessage }}</h2>
    </div>
    <div class="pt-12 mx-auto text-center">
      <button
        class="p-2 transition rounded-full text-bg-600 hover:cursor-pointer hover:bg-industrial-400/50 hover:no-underline bg-industrial-400"
        @click="handleError"
      >
        Take me Back on Course!
      </button>
    </div>
  </div>
</template>

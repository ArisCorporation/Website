<script setup lang="ts">
defineProps<{
  title: string,
  description: string
}>()
</script>


<template>
  <div class="mb-6 md:mb-8">
    <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-white">{{title}}</h1>
    <p class="text-muted-foreground">{{description}}</p>
  </div>
</template>
<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <!-- Context Menu for images and variant + color property -->
  <UButton
    icon="i-fa6-solid-image"
    size="xs"
    :variant="editor?.isActive('image') ? 'solid' : 'ghost'"
    :color="editor?.isActive('image') ? 'primary' : 'white'"
  />
  <!-- @click="setImage" -->
</template>

<script setup lang="ts">
defineProps(['editor', 'openLibrary']);
</script>

<template>
  <!-- Context Menu for videos and variant + color property -->
  <UButton
    icon="i-fa6-solid-film"
    size="xs"
    :variant="editor?.isActive('video') ? 'solid' : 'ghost'"
    :color="editor?.isActive('video') ? 'primary' : 'white'"
    @click="openLibrary"
  />
  <!-- @click="setVideo" -->
</template>

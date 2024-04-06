<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    @click="editor?.chain().focus().undo().run()"
    icon="i-fa6-solid-rotate-left"
    size="xs"
    variant="ghost"
    color="white"
  />
</template>

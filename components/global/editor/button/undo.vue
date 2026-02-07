<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-rotate-left"
    size="xs"
    variant="ghost"
    color="white"
    @click="editor?.chain().focus().undo().run()"
  />
</template>

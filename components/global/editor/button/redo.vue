<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    @click="editor?.chain().focus().redo().run()"
    icon="i-fa6-solid-rotate-right"
    size="xs"
    variant="ghost"
    color="white"
  />
</template>

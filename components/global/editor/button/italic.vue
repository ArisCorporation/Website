<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-italic"
    size="xs"
    :variant="editor?.isActive('italic') ? 'solid' : 'ghost'"
    :color="editor?.isActive('italic') ? 'primary' : 'white'"
    @click="editor.chain().focus().toggleItalic().run()"
  />
</template>

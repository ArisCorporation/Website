<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-bold"
    size="xs"
    :variant="editor?.isActive('bold') ? 'solid' : 'ghost'"
    :color="editor?.isActive('bold') ? 'primary' : 'white'"
    @click="editor.chain().focus().toggleBold().run()"
  />
</template>

<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-align-left"
    size="xs"
    :variant="editor?.isActive({ textAlign: 'left' }) ? 'solid' : 'ghost'"
    :color="editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'white'"
    @click="editor.chain().focus().setTextAlign('left').run()"
  />
</template>

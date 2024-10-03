<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-align-right"
    size="xs"
    :variant="editor?.isActive({ textAlign: 'right' }) ? 'solid' : 'ghost'"
    :color="editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'white'"
    @click="editor.chain().focus().setTextAlign('right').run()"
  />
</template>

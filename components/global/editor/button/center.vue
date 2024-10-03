<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-align-center"
    size="xs"
    :variant="editor?.isActive({ textAlign: 'center' }) ? 'solid' : 'ghost'"
    :color="editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'white'"
    @click="editor.chain().focus().setTextAlign('center').run()"
  />
</template>

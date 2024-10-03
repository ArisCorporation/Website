<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-align-justify"
    size="xs"
    :variant="editor?.isActive({ textAlign: 'justify' }) ? 'solid' : 'ghost'"
    :color="editor?.isActive({ textAlign: 'justify' }) ? 'primary' : 'white'"
    @click="editor.chain().focus().setTextAlign('justify').run()"
  />
</template>

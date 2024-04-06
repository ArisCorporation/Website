<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-strikethrough"
    size="xs"
    :variant="editor?.isActive('strike') ? 'solid' : 'ghost'"
    :color="editor?.isActive('strike') ? 'primary' : 'white'"
    @click="editor.chain().focus().toggleStrike().run()"
  />
</template>

<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-quote-right"
    size="xs"
    :variant="editor?.isActive('blockquote') ? 'solid' : 'ghost'"
    :color="editor?.isActive('blockquote') ? 'primary' : 'white'"
    @click="editor.chain().focus().toggleBlockquote().run()"
  />
</template>

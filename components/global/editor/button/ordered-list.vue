<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-list-ol"
    size="xs"
    :variant="editor?.isActive('orderedList') ? 'solid' : 'ghost'"
    :color="editor?.isActive('orderedList') ? 'primary' : 'white'"
    @click="editor.chain().focus().toggleOrderedList().run()"
  />
</template>

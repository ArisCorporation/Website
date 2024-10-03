<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-lucide-remove-formatting"
    size="xs"
    variant="ghost"
    color="white"
    @click="editor?.chain().focus().setParagraph().unsetAllMarks().run()"
  />
</template>

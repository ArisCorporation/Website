<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-radix-icons-divider-horizontal"
    size="xs"
    variant="ghost"
    color="white"
    @click="editor?.chain().focus().setHorizontalRule().run()"
  />
</template>

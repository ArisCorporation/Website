<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-underline"
    size="xs"
    :variant="editor?.isActive('underline') ? 'solid' : 'ghost'"
    :color="editor?.isActive('underline') ? 'primary' : 'white'"
    @click="editor.chain().focus().toggleUnderline().run()"
  />
</template>

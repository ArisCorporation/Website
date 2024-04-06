<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-list"
    size="xs"
    :variant="editor?.isActive('bulletList') ? 'solid' : 'ghost'"
    :color="editor?.isActive('bulletList') ? 'primary' : 'white'"
    @click="editor.chain().focus().toggleBulletList().run()"
  />
</template>

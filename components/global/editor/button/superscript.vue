<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-superscript"
    size="xs"
    :variant="editor?.isActive('superscript') ? 'solid' : 'ghost'"
    :color="editor?.isActive('superscript') ? 'primary' : 'white'"
    @click="editor.chain().focus().unsetSubscript().toggleSuperscript().run()"
  />
</template>

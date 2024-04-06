<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UButton
    icon="i-fa6-solid-subscript"
    size="xs"
    :variant="editor?.isActive('subscript') ? 'solid' : 'ghost'"
    :color="editor?.isActive('subscript') ? 'primary' : 'white'"
    @click="editor.chain().focus().unsetSuperscript().toggleSubscript().run()"
  />
</template>

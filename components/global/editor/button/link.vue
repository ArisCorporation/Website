<script setup lang="ts">
defineProps(['editor']);

function setLink() {
  const previousUrl = unref(editor)?.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === '') {
    unref(editor)?.chain().focus().extendMarkRange('link').unsetLink().run();

    return;
  }

  // update link
  unref(editor)?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}
</script>

<template>
  <UButton
    icon="i-fa6-solid-link"
    size="xs"
    :variant="editor?.isActive('link') ? 'solid' : 'ghost'"
    :color="editor?.isActive('link') ? 'primary' : 'white'"
    @click="setLink"
  />
</template>

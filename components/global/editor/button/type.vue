<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UDropdown
    :items="[
      [
        {
          label: 'Überschrift 1',
          click: () => {
            unref(editor)?.chain().focus().setHeading({ level: 2 }).run();
          },
          disabled: editor.isActive('heading', { level: 2 }),
        },
        {
          label: 'Überschrift 2',
          click: () => {
            unref(editor)?.chain().focus().setHeading({ level: 3 }).run();
          },
          disabled: editor.isActive('heading', { level: 3 }),
        },
        {
          label: 'Überschrift 3',
          click: () => {
            unref(editor)?.chain().focus().setHeading({ level: 4 }).run();
          },
          disabled: editor.isActive('heading', { level: 4 }),
        },
        {
          label: 'Überschrift 4',
          click: () => {
            unref(editor)?.chain().focus().setHeading({ level: 5 }).run();
          },
          disabled: editor.isActive('heading', { level: 5 }),
        },
      ],
      [
        {
          label: 'Text',
          click: () => {
            unref(editor)?.chain().focus().setParagraph().run();
          },
          disabled: editor.isActive('paragraph'),
        },
      ],
    ]"
    :popper="{ placement: 'bottom-start' }"
  >
    <UButton
      color="white"
      :label="
        editor.isActive('heading')
          ? 'Überschrift ' +
            (editor.isActive('heading', { level: 2 })
              ? '1'
              : editor.isActive('heading', { level: 3 })
                ? '2'
                : editor.isActive('heading', { level: 4 })
                  ? '3'
                  : editor.isActive('heading', { level: 5 }) && '4')
          : 'Text'
      "
      trailing-icon="i-heroicons-chevron-down-20-solid"
    />
  </UDropdown>
</template>

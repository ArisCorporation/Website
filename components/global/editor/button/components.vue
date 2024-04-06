<script setup lang="ts">
defineProps(['editor']);
</script>

<template>
  <UDropdown
    :items="[
      [
        {
          label: 'Rahmen',
          click: () => {
            unref(editor)?.commands.insertContent(`<div data-type='panel'><p>Rahmen ohne Hintergrund</p></div>`);
          },
        },
        {
          label: 'Rahmen mit Hintergrund',
          click: () => {
            unref(editor)?.commands.insertContent(`<div data-type='panel-with-bg'><p>Rahmen mit Hintergrund</p></div>`);
          },
        },
      ],
    ]"
    :popper="{ placement: 'bottom-end' }"
  >
    <UButton color="white" label="Objekte" trailing-icon="i-heroicons-chevron-down-20-solid" />
  </UDropdown>
</template>

<script setup lang="ts">
const { readSingleton } = useDirectusItems();

const { content: credits } = await readSingleton('credits', {
  query: {
    fields: ['content'],
  },
});

if (!credits) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

definePageMeta({
  layout: 'default',
});
useHead({
  title: 'Credits',
});
</script>

<template>
  <Editor :model-value="credits" read-only />
</template>

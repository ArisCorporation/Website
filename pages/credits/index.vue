<script setup lang="ts">
const { getSingletonItem } = useDirectusItems();
const { data } = await useAsyncData(
  'credits',
  () =>
    getSingletonItem({
      collection: 'credits',
      params: {
        fields: ['text'],
      },
    }),
  {
    transform: (data) => data.text,
  },
);

if (!data.value) {
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
  <div v-html="data" />
</template>

<script setup lang="ts">
const { getItemById } = useDirectusItems();
const { $preview } = useNuxtApp();
const route = useRoute();

if ($preview) {
  const { data: ship } = await useAsyncData('ship', () =>
    getItemById({
      collection: 'ships',
      id: route.params.id as string,
      params: {
        fields: ['*'],
      },
    }),
  );
}

const { data: ship } = await useAsyncData('ship', () =>
  getItemById({
    collection: 'ships',
    id: route.params.id as string,
    params: {
      fields: ['*'],
    },
  }),
);
</script>

<template>
  <div>{{ ship?.id }}</div>
  <div>{{ ship?.name }}</div>
</template>

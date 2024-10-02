<script setup lang="ts">
definePageMeta({
  path: '/shipexkurs',
  layout: 'ship-exkurs',
  middleware: () => {
    return navigateTo({
      path: '/ams/login',
      query: {
        redirect: '/shipexkurs/ships',
      },
    });
  },
});
</script>

<template>
  <div>Index</div>
</template>

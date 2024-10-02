<script setup lang="ts">
definePageMeta({
  path: '/shipexkurs',
  layout: 'ship-exkurs',
  middleware: () => {
    return navigateTo({
      path: '/shipexkurs/ships',
    });
  },
});
</script>

<template>
  <div>Index</div>
</template>

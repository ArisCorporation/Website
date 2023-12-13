<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: false,
    default: null,
  },
  isList: {
    type: Boolean,
    required: false,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    required: false,
    default: false,
  },
  third: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
<template>
  <div :class="{ 'basis-full': fullWidth, 'basis-1/3': third, 'basis-1/2': !fullWidth && !third }">
    <p class="pt-1 text-sm">{{ title }}:</p>
    <ul v-if="isList" className="p-0 text-primary pl-6">
      <li v-for="(item, index) in content.split(', ')" :key="index" class="marker:text-secondary">{{ item }}</li>
    </ul>
    <NuxtLink v-else-if="link" :to="link">
      <p>{{ content || 'N/A' }}</p>
    </NuxtLink>
    <p v-else class="text-primary">{{ content || 'N/A' }}</p>
  </div>
</template>

<style scoped lang="postcss">
li {
  @apply pb-1;
}
</style>

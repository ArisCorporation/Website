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
  <div :class="{ 'col-span-6': fullWidth, 'col-span-2': third, 'col-span-3': !fullWidth && !third }">
    <p class="pt-1 text-sm">{{ title }}:</p>
    <template v-if="content">
      <ul v-if="isList" className="p-0 pl-6">
        <li v-for="(item, index) in content.split(', ')" :key="index" class="marker:text-secondary text-primary">
          {{ item }}
        </li>
      </ul>
      <NuxtLink v-else-if="link" :to="link">
        <p>{{ content }}</p>
      </NuxtLink>
      <p v-else class="text-primary">{{ content }}</p>
    </template>
    <p v-else class="text-primary">N/A</p>
  </div>
</template>

<style scoped lang="postcss">
li {
  @apply pb-1;
}
</style>

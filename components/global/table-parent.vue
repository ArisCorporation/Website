<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: false,
    default: null,
  },
});
</script>

<template>
  <DefaultPanel>
    <div class="grid px-4 py-3 xl:grid-cols-4 bg-bprimary">
      <p v-if="title" class="grid-cols-4 xl:grid-cols-1 text-secondary">{{ title }}</p>
      <div class="col-span-4 xl:col-span-3">
        <div class="grid grid-cols-6 gap-x-2">
          <slot />
        </div>
      </div>
    </div>
  </DefaultPanel>
</template>

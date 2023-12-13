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
    <div class="flex flex-wrap px-4 py-3 bg-bprimary">
      <p v-if="title" class="basis-full xl:basis-1/4 text-secondary">{{ title }}</p>
      <div class="basis-full xl:basis-3/4">
        <div class="flex flex-wrap">
          <slot />
        </div>
      </div>
    </div>
  </DefaultPanel>
</template>

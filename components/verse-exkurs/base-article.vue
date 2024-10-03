<script setup lang="ts">
defineProps({
  banner: {
    type: String,
    required: false,
  },
});
</script>

<template>
  <div>
    <div v-if="$slots.title || banner">
      <h1 v-if="$slots.title" class="text-center">
        <slot name="title" />
      </h1>
      <DefaultPanel v-if="banner">
        <NuxtImg :src="banner" :placeholder="[16, 16, 1, 5]" class="object-cover w-full mx-auto max-h-96" />
      </DefaultPanel>
      <hr />
    </div>
    <slot />
  </div>
</template>

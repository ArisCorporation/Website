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
  <HeadlessDisclosure>
    <HeadlessDisclosureButton class="block py-2">
      <h1>
        <span v-if="title" className="text-white">{{ title }}</span>
        <slot v-else name="title" />
        <Icon
          name="material-symbols:arrow-back-ios-new-rounded"
          class="-rotate-180 transition-default ui-open:-rotate-90"
        />
      </h1>
    </HeadlessDisclosureButton>
    <HeadlessTransitionRoot
      enter="transition ease duration-500 transform"
      enter-from="opacity-0 -translate-y-2"
      enter-to="opacity-100 translate-y-0"
      leave="transition ease duration-300 transform"
      leave-from="opacity-100 translate-y-0"
      leave-to="opacity-0 -translate-y-2"
    >
      <HeadlessDisclosurePanel>
        <slot />
      </HeadlessDisclosurePanel>
    </HeadlessTransitionRoot>
  </HeadlessDisclosure>
</template>

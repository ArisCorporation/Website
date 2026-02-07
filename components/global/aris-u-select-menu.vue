<script setup lang="ts">
const props = defineProps({
  actionIcons: {
    type: Boolean,
    required: false,
    default: true,
  },
  noItemText: {
    type: String,
    required: false,
    default: 'Keine Eintrag ausgeählt',
  },
  emptyItemText: {
    type: String,
    required: false,
    default: 'Keine Eintrag ausgeählt',
  },
  modelValue: {
    type: null,
  },
  initialValue: {
    type: null,
    default: null,
  },
});
const emit = defineEmits(['update:modelValue']);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});
</script>
<template>
  <div class="relative">
    <USelectMenu
      v-model="value"
      v-bind="[$attr, $props]"
      :ui="
        formData.title || initialFormdata.title
          ? {
              leading: {
                padding: {
                  xl: 'ps-10',
                },
              },
            }
          : { leading: { padding: { xl: 'hidden' } } }
      "
    >
      <template v-if="value || initialValue" #leading />
      <template #label>
        <span v-if="value">{{ value }}</span>
        <span v-else>{{ noItemText }}</span>
      </template>
      <template #option="{ option }">
        <span v-if="option">{{ option }}</span>
        <span v-else>{{ emptyItemText }}</span>
      </template>
    </USelectMenu>
    <template v-if="value || initialValue">
      <button
        v-if="(value === initialValue) !== null"
        class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
        @click="value = null"
      >
        <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
      </button>
      <button v-else class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit" @click="value = initialValue">
        <UIcon name="i-heroicons-arrow-uturn-left" class="my-auto transition opacity-75 hover:opacity-100" />
      </button>
    </template>
  </div>
</template>

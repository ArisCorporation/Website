<script setup lang="ts">
const props = defineProps(['modelValue', 'options', 'horizontal']);
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
  <div :class="{ 'gap-x-4 flex flex-wrap': horizontal }">
    <div v-for="option in options" :key="option.value" class="relative cursor-pointer">
      <URadio
        v-bind="option"
        v-model="value"
        :ui="{
          strategy: 'override',
          base: 'relative w-4 h-4 transition border-2 rounded appearance-none cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed',
          background: value == option.value ? ' bg-bsecondary' : 'bg-bprimary',
          border: 'border border-bsecondary',
          ring: 'focus-within:ring-1 focus-within:ring-primary-400',
          form: '',
        }"
      />
      <div
        class="absolute pointer-events-none top-[3px] transition-default left-px"
        :class="'text-' + (option.color || 'white')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="3"
          stroke="currentColor"
          class="h-3.5 w-3.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            :stroke-dasharray="[value == option.value ? '1px 1px' : '0px 1px']"
            :class="{ 'opacity-0': value != option.value }"
            class="transition-all duration-300"
            pathLength="1"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

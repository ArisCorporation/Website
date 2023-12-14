<script setup lang="ts">
defineProps({
  color: {
    type: String,
    required: false,
    default: 'primary-400',
  },
  noAnimation: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<template>
  <button
    v-motion
    :variants="!noAnimation ? $config.public.mbutton : {}"
    class="relative inline-block w-fit transition border-2 cursor-pointer p-2px group rounded-[10px] after:-bottom-2px after:absolute after:bg-bsecondary after:h-2px after:left-4 after:right-4 before:-top-2px before:absolute before:bg-bsecondary before:box-border before:h-2px before:left-4 before:right-4 bg-bprimary text-inherit"
    :class="'border-' + color"
  >
    <div
      class="box-border p-2 overflow-hidden text-center rounded-md transition-group group-hover:bg-btertiary whitespace-nowrap text-ellipsis"
      :class="'group-hover:text-' + color"
    >
      <p class="p-0"><slot /></p>
    </div>
  </button>
</template>

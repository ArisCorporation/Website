<script setup lang="ts">
defineProps({
  bg: {
    type: String,
    required: false,
    default: 'bsecondary',
  },
  color: {
    type: String,
    required: false,
    default: 'primary',
  },
  overflow: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<template>
  <div class="wrapper">
    <div class="panel" :class="['bg-' + bg, 'border-' + color]">
      <div class="panel-inner" :class="{ 'overflow-clip': !overflow }">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.wrapper {
  @apply relative box-border p-[2px] border-2 border-solid border-dark-gray rounded-3xl before:absolute before:-top-[2px] before:right-20 before:left-20 before:h-[2px] before:bg-btertiary before:box-border after:absolute after:right-20 after:left-20 after:-bottom-[2px] after:h-[2px] after:bg-btertiary after:box-border;
}
.panel {
  @apply relative min-h-[40px] border-[3px] border-solid border-opacity-90 rounded-[20px] before:absolute before:-top-[3px] before:right-10 before:left-10 before:h-1 before:bg-btertiary before:rounded-b-[1px] before:box-border after:absolute after:-bottom-[3px] after:right-10 after:left-10 after:h-1 after:bg-btertiary after:rounded-t-[1px] after:box-border;
}
.panel-inner {
  @apply rounded-2xl box-border;
}
</style>

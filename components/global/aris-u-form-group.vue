<script setup lang="ts">
defineProps({
  input: {
    type: Boolean,
    required: false,
    default: false,
  },
});
// const formgroupUi = {
//   strategy: 'override',
//   container: 'relative w-full max-w-[303px]',
//   wrapper: 'flex justify-between h-fit w-full',
//   label: { wrapper: 'flex content-center items-center justify-between mr-4' },
// };
const formgroupUi = {
  strategy: 'override',
  label: {
    wrapper: 'flex content-center items-center',
    base: 'block font-medium text-neutral-200',
    required: "after:content-['*'] after:ms-0.5 after:text-red-500 dark:after:text-red-400",
  },
};
</script>

<template>
  <UFormGroup :ui="formgroupUi">
    <slot />
    <template v-if="$slots.description" #description>
      <slot name="description" />
    </template>
    <template v-if="$slots.help" #help>
      <slot name="help" />
    </template>
    <template v-if="$slots.hint" #hint>
      <UPopover mode="hover">
        <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
        <template #panel>
          <div class="p-1 text-xs text-left text-neutral-200/60 whitespace-break-spaces">
            <slot name="hint" />
          </div>
        </template>
      </UPopover>
    </template>
  </UFormGroup>
</template>

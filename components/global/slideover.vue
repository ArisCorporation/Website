<script setup lang="ts">
const state = defineModel<boolean>();
const modalStore = useModalStore();

const props = defineProps<{ modelValue: any; big?: boolean }>();
const hasVModel = computed(() => props.modelValue !== undefined);

const open = computed<boolean>({
  get(): boolean {
    return hasVModel?.value ? state?.value : modalStore.isSlideOpen;
  },
  set(value: boolean) {
    if (hasVModel?.value) {
      state.value = value;
    } else {
      modalStore.isSlideOpen = value;
    }
  },
});
</script>

<template>
  <USlideover
    v-model="open"
    :ui="{
      strategy: 'override',
      width:
        'w-screen ' +
        (modalStore.big || big ? 'max-w-full lg:max-w-3xl 2xl:max-w-4xl' : 'max-w-full sm:max-w-[532px] xl:max-w-xl'),
    }"
  >
    <UButton
      variant="soft"
      color="gray"
      icon="i-heroicons-x-mark-20-solid"
      size="2xl"
      square
      class="absolute top-4 -left-12 animate-link"
      :ui="{
        rounded: 'rounded-full',
        square: {
          '2xl': 'p-1',
        },
      }"
      @click="open = false"
    />
    <!-- <div class="flex-1 p-4 scrollbar-gray-thin"> -->
    <slot name="slideCard">
      <div class="flex-1 overflow-y-scroll">
        <UCard
          class="flex flex-col flex-1 h-full overflow-y-scroll scrollbar-gray-thin"
          :ui="{
            body: { base: `flex-1 ${$slots.slideHeader ? '' : big ? 'lg:!border-t-0' : 'sm:!border-t-0'}` },
            background: 'bg-bg-800',
            ring: '',
            divide: 'divide-y divide-btertiary',
            header: {
              base: `${$slots.slideHeader ? '' : big ? 'lg:hidden' : 'sm:hidden'}`,
              background: '',
              padding: `${$slots.slideHeader ? 'py-5' : 'py-2'}`,
            },
          }"
        >
          <template #header>
            <div class="flex px-4 sm:px-6" :class="[big ? 'lg:hidden' : 'sm:hidden']">
              <UButton
                variant="soft"
                color="gray"
                icon="i-heroicons-x-mark-20-solid"
                size="sm"
                square
                class="ml-2 animate-link"
                :ui="{
                  rounded: 'rounded-full',
                  square: {
                    '2xl': 'p-0.5',
                  },
                }"
                @click="open = false"
              />
            </div>
            <hr class="w-full h-px bg-bg-400" :class="[big ? 'lg:hidden' : 'sm:hidden']" />
            <!-- TODO: Styling -->
            <!-- <button
              class="absolute flex items-center w-8 h-8 cursor-pointer focus:outline-none"
              @click="modalStore.closeSlide"
            >
              <Icon
                name="heroicons:x-circle"
                class="w-full h-full transition rounded-full bg-black/75 hover:bg-black text-neutral-200 hover:text-white"
              />
            </button> -->
            <div class="px-4 sm:px-6">
              <slot name="slideHeader" />
            </div>
          </template>
          <slot name="slideContent" />
          <template v-if="$slots.slideFooter" #footer>
            <slot name="slideFooter" />
          </template>
        </UCard>
      </div>
    </slot>
  </USlideover>
</template>

<script setup lang="ts">
const modalStore = useModalStore();
</script>

<template>
  <USlideover
    :ui="{
      strategy: 'override',
      width: 'w-screen ' + modalStore.big ? 'max-w-full md:max-w-3xl 2xl:max-w-4xl' : 'max-w-[532px] xl:max-w-xl',
    }"
    v-model="modalStore.isSlideOpen"
  >
    <!-- <div class="flex-1 p-4 scrollbar-gray-thin"> -->
    <slot name="slideCard">
      <div class="flex-1 overflow-y-scroll">
        <UCard
          class="flex flex-col flex-1 h-full overflow-y-scroll scrollbar-gray-thin"
          :ui="{
            body: { base: 'flex-1' },
            background: 'bg-bprimary',
            ring: '',
            divide: 'divide-y divide-btertiary',
          }"
        >
          <template #header>
            <button
              @click="modalStore.closeSlide"
              class="absolute flex items-center w-8 h-8 cursor-pointer focus:outline-none"
            >
              <Icon
                name="heroicons:x-circle"
                class="w-full h-full transition rounded-full bg-black/75 hover:bg-black text-tbase hover:text-white"
              />
            </button>
            <slot name="slideHeader" />
          </template>
          <slot name="slideContent" />
          <template #footer>
            <slot name="slideFooter" />
          </template>
        </UCard>
      </div>
    </slot>
  </USlideover>
</template>

<script setup lang="ts">
const props = defineProps({
  padding: {
    type: Boolean,
    required: false,
    default: false,
  },
});
const modalStore = useState<{
    isModalOpen: boolean
      isSlideOpen: boolean
      title: string
      data: any
      type: string
      hideXButton: boolean
      hideCloseButton: boolean
      agreeAction: any
      big: boolean
      locked: boolean
  }>('modalStore')

const closeModal = () => {
  closeModal();
};
</script>

<template>
  <HeadlessTransitionRoot appear :show="modalStore.isModalOpen" as="template">
    <HeadlessDialog as="div" class="relative z-50" @close="closeModal">
      <HeadlessTransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </HeadlessTransitionChild>
      <div class="fixed inset-0 overflow-y-auto" :class="{ 'pt-20': padding }">
        <div class="flex items-center justify-center min-h-full p-4 text-center">
          <HeadlessTransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <HeadlessDialogPanel class="w-full" :class="[modalStore.big ? 'max-w-4xl' : 'max-w-2xl']">
              <DefaultPanel overflow>
                <div class="px-4 pt-2 pb-6">
                  <button v-if="!modalStore.hideXButton" type="button" class="absolute top-1 left-1" @click="modalStore?.closeAction">
                    <Icon
                      name="heroicons:x-circle"
                      class="w-6 h-6 text-white transition opacity-50 hover:opacity-100"
                    />
                  </button>
                  <HeadlessDialogTitle v-if="modalStore.title" as="h3" class="text-white">{{ modalStore.title }}</HeadlessDialogTitle>
                  <div class="mt-2">
                    <slot name="content" :close="closeModal" />
                  </div>

                  <div v-if="!modalStore.hideCloseButton || modalStore.agreeAction" class="mt-4">
                    <button
                      v-if="!modalStore.hideCloseButton"
                      type="button"
                      class="inline-flex justify-center px-4 py-2 text-sm font-medium text-black transition-all duration-100 border border-transparent rounded-md opacity-75 hover:duration-200 bg-danger hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      @click="closeModal"
                    >
                      Schließen!
                    </button>
                    <!-- v-motion
                      :variants="$config.public.mbutton" -->
                    <button
                      v-if="modalStore.agreeAction"
                      type="button"
                      class="inline-flex justify-center px-4 py-2 text-sm font-medium text-black transition-all duration-100 border border-transparent rounded-md opacity-75 hover:duration-200 bg-success hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      @click="modalStore.agreeAction"
                    >
                      Schließen!
                    </button>
                  </div>
                </div>
              </DefaultPanel>
            </HeadlessDialogPanel>
          </HeadlessTransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </HeadlessTransitionRoot>
</template>

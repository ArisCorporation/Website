<script setup lang="ts">
const modalStore = useModalStore();
const { isOpen, title, settings } = storeToRefs(modalStore);

const closeModal = () => {
  modalStore.closeModalTest();
};
</script>

<template>
  <HeadlessTransitionRoot appear :show="isOpen" as="template">
    <HeadlessDialog as="div" class="relative z-10" @close="closeModal">
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
      <div class="fixed inset-0 overflow-y-auto">
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
            <HeadlessDialogPanel class="w-full max-w-2xl">
              <DefaultPanel>
                <div class="bg-[#222] px-4 pb-4">
                  <button v-if="!settings.hideXButton" type="button" class="absolute top-1 left-1" @click="closeAction">
                    <Icon
                      name="heroicons:x-circle"
                      class="w-6 h-6 text-white transition opacity-50 hover:opacity-100"
                    />
                  </button>
                  <HeadlessDialogTitle v-if="title" as="h3" class="text-white">{{ title }}</HeadlessDialogTitle>
                  <div class="mt-2">
                    <slot name="content" :close="closeModal" />
                  </div>

                  <div class="mt-4">
                    <button
                      v-if="!settings.hideCloseButton"
                      v-motion
                      :variants="$config.public.mbutton"
                      type="button"
                      class="inline-flex justify-center px-4 py-2 text-sm font-medium text-black transition-all duration-100 border border-transparent rounded-md opacity-75 hover:duration-200 bg-danger hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      @click="closeAction"
                    >
                      Schließen!
                    </button>
                    <button
                      v-if="settings.agreeAction"
                      v-motion
                      :variants="$config.public.mbutton"
                      type="button"
                      class="inline-flex justify-center px-4 py-2 text-sm font-medium text-black transition-all duration-100 border border-transparent rounded-md opacity-75 hover:duration-200 bg-success hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      @click="settings.agreeAction"
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

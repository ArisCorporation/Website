<script setup lang="ts">
const props = defineProps<{ editor: any }>();
const modalOpen = ref<boolean>(false);
const linkInput = ref<string>('');
const initalLinkInput = ref<string>('');

function openLinkModal() {
  linkInput.value = unref(props.editor)?.getAttributes('link').href;
  initalLinkInput.value = unref(props.editor)?.getAttributes('link').href;
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  linkInput.value = '';
}

function setLink(link: string) {
  const url = unref(link);
  closeModal();

  // empty
  if (url === '') {
    unref(props.editor)?.chain().focus().extendMarkRange('link').unsetLink().run();

    return;
  }

  // update link
  unref(props.editor)?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}
</script>

<template>
  <div>
    <UModal v-model="modalOpen" :ui="{ background: 'rounded-xl backdrop-blur-sm bg-bprimary/60' }">
      <div class="p-4">
        <UButton
          variant="soft"
          color="gray"
          icon="i-heroicons-x-mark-20-solid"
          size="2xl"
          square
          class="absolute -top-8 -left-12 animate-link"
          :ui="{
            rounded: 'rounded-full',
            square: {
              '2xl': 'p-1',
            },
          }"
          @click="modalOpen = false"
        />
        <UFormGroup label="Link" name="link">
          <div class="relative">
            <UInput
              v-model="linkInput"
              placeholder="https://"
              size="xl"
              :ui="{
                strategy: 'override',
                color: {
                  white: {
                    outline:
                      'bg-bprimary bg-opacity-60 shadow-sm ring-1 ring-inset ring-bsecondary focus:ring-2 focus:ring-primary',
                  },
                },
                variant: {
                  outline:
                    'bg-bprimary bg-opacity-60 shadow-sm ring-1 ring-inset ring-bsecondary focus:ring-2 focus:ring-primary',
                },
              }"
              :icon="
                linkInput || initalLinkInput
                  ? linkInput === initalLinkInput
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
            />
            <template v-if="linkInput || initalLinkInput">
              <button
                v-if="linkInput === initalLinkInput"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3.5 h-fit"
                @click="linkInput = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="my-auto transition opacity-75 size-6 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3.5 h-fit"
                @click="linkInput = initalLinkInput"
              >
                <UIcon
                  name="i-heroicons-arrow-uturn-left"
                  class="my-auto transition opacity-75 size-6 hover:opacity-100"
                />
              </button>
            </template>
          </div>
        </UFormGroup>
        <ButtonDefault class="w-full mt-8" @click="setLink(linkInput)"> Speichern </ButtonDefault>
      </div>
    </UModal>
    <UButton
      icon="i-fa6-solid-link"
      size="xs"
      :variant="editor?.isActive('link') ? 'solid' : 'ghost'"
      :color="editor?.isActive('link') ? 'primary' : 'white'"
      @click="openLinkModal"
    />
  </div>
</template>

<style scoped lang="postcss">
.glass-bg {
  background: radial-gradient(50% 49.92% at 50% 50.08%, rgba(17, 17, 17, 0.5) 0%, rgba(17, 17, 17, 0.6) 100%);
}
</style>

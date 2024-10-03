<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: false,
    default: null,
  },
  panelClasses: {
    type: String,
    required: false,
    default: '',
  },
  innerClasses: {
    type: String,
    required: false,
    default: '',
  },
  bg: {
    type: String,
    required: false,
    default: 'secondary',
  },
});
</script>

<template>
  <DefaultPanel :panel-classes="panelClasses" :inner-classes="innerClasses" :bg="bg">
    <div class="grid px-4 py-3 xl:grid-cols-4 bg-bprimary">
      <p
        v-if="title"
        class="max-w-full col-span-4 p-0 uppercase break-words xl:col-start-1 xl:col-span-1 text-secondary hyphens-auto"
        lang="de"
      >
        {{ title }}
      </p>
      <div class="col-span-4 xl:col-start-2 xl:col-span-3">
        <div class="grid grid-cols-6 gap-x-2">
          <slot />
        </div>
      </div>
    </div>
    <!-- <div class="w-full px-4 py-3 xl:flex bg-bprimary">
      <p v-if="title" class="w-full p-0 uppercase truncate xl:w-fit text-secondary">
        {{ title }}
      </p>
      <div class="w-full ml-auto xl:w-3/4">
        <div class="grid grid-cols-6 gap-x-2">
          <slot />
        </div>
      </div>
    </div> -->
  </DefaultPanel>
</template>

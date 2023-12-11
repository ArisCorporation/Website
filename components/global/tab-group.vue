<script setup lang="ts">
const { title, tablist, between, markdown, hideHr } = defineProps({
  title: {
    type: String,
    required: false,
    default: null,
  },
  tablist: {
    type: Array as PropType<ITab[]>,
    required: true,
  },
  between: {
    type: Boolean,
    required: false,
    default: false,
  },
  markdown: {
    type: Boolean,
    required: false,
    default: false,
  },
  hideHr: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<template>
  <HeadlessTabGroup as="div" class="mt-16">
    <h1 v-if="title" class="uppercase">{{ title }}</h1>
    <HeadlessTabList>
      <hr v-if="!hideHr" />
      <slot name="tablist">
        <div :class="{ 'justify-between': between }" class="flex flex-wrap w-full">
          <HeadlessTab
            v-for="tab in tablist"
            v-slot="{ selected }"
            :key="tab.header"
            class="m-1 outline-none sm:p-1 md:p-3 focus-visible:outline-none"
          >
            <h1
              class="uppercase transition-all duration-200 ease-in-out hover:opacity-75 hover:duration-300"
              :class="{ 'text-primary': selected, 'opacity-50': !selected }"
            >
              {{ tab.header }}
            </h1>
          </HeadlessTab>
        </div>
      </slot>
      <hr />
    </HeadlessTabList>
    <HeadlessTabPanels>
      <slot name="tabcontent">
        <HeadlessTabPanel
          v-for="tab in tablist"
          :key="tab.header"
          class="w-full p-4 mx-auto xl:max-w-full"
          :class="{ 'prose max-w-none prose-invert': !tab.component }"
        >
          <ContentRenderer v-if="markdown" :value="tab.content" />
          <div v-else-if="tab.content" class="text-center" v-html="tab.content" />
          <component :is="tab.component" v-else-if="tab.component" :data="tab.componentData" />
        </HeadlessTabPanel>
      </slot>
    </HeadlessTabPanels>
  </HeadlessTabGroup>
</template>

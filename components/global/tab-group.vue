<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: false,
    default: null,
  },
  tablist: {
    type: null,
    required: false,
    default: [],
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
  store: {
    type: null,
    required: true,
  },
  change: {
    type: null,
    required: true,
  },
  smallHeader: {
    type: Boolean,
    required: false,
    default: false,
  },
  noMargin: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const changeTab = (index: number) => {
  props.change(index);
};
</script>

<template>
  <HeadlessTabGroup as="div" :class="{ 'mt-16': !noMargin }" :selected-index="store" @change="changeTab">
    <h1 v-if="title" class="uppercase">
      {{ title }}
    </h1>
    <HeadlessTabList>
      <hr v-if="!hideHr" />
      <slot name="tablist">
        <div :class="{ 'justify-between': between }" class="flex flex-wrap w-full">
          <HeadlessTab v-for="tab in tablist" :key="tab.header" class="m-1 sm:p-1 md:p-3 !outline-none animate-link">
            <h1
              class="m-0 uppercase transition-all duration-200 ease-in-out hover:opacity-75 hover:duration-300"
              :class="{
                'text-primary-400': store === tablist.indexOf(tab),
                'opacity-50': store !== tablist.indexOf(tab),
                'text-xl': smallHeader,
              }"
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
          <div v-if="markdown" :value="tab.content" />
          <Editor v-else-if="tab.content" :model-value="tab.content" read-only class="xl:max-w-[90%] mx-auto" />
          <component :is="tab.component" v-else-if="tab.component" :data="tab.componentData" />
          <slot v-else-if="tab.slot" :name="tab.slot" />
        </HeadlessTabPanel>
      </slot>
    </HeadlessTabPanels>
  </HeadlessTabGroup>
</template>

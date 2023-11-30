<script setup lang="ts">
interface Tab {
  id: string
  header: string
  content: any
  component: string
  componentData: any
}

defineProps({
  title: {
    type: String,
    required: false,
  },
  tabs: {
    type: Array<Tab>,
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
})
</script>

<template>
  <HeadlessTabGroup as="div" class="mt-16">
    <h1 v-if="title" class="uppercase">{{ title }}</h1>
    <HeadlessTabList>
      <hr />
      <div
        :class="{ 'justify-between': between }"
        class="w-full flex flex-wrap"
      >
        <HeadlessTab
          v-slot="{ selected }"
          v-for="tab in tabs"
          :key="tab.header"
          class="focus-visible:outline-none p-3 m-1 outline-none"
        >
          <h1
            class="text-base sm:text-lg md:text-xl lg:text-3xl xl:text-4xl uppercase hover:opacity-75 transition-all duration-200 hover:duration-300 ease-in-out"
            :class="{ 'text-primary': selected, 'opacity-50': !selected }"
          >
            {{ tab.header }}
          </h1>
        </HeadlessTab>
      </div>
      <hr />
    </HeadlessTabList>
    <HeadlessTabPanels>
      <HeadlessTabPanel
        v-for="tab in tabs"
        :key="tab.header"
        class="p-4 mx-auto xl:max-w-full w-full"
        :class="{ 'prose max-w-none prose-invert': !tab.component }"
      >
        <ContentRenderer v-if="markdown" :value="tab.content" />
        <div v-else-if="tab.content" v-html="tab.content" class="text-center" />
        <component
          v-else-if="tab.component"
          :data="tab.componentData"
          :is="tab.component"
        />
      </HeadlessTabPanel>
    </HeadlessTabPanels>
  </HeadlessTabGroup>
</template>

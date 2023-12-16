<script setup lang="ts">
const props = defineProps({
  tablist: {
    type: Array as PropType<{ id: string; header: string; date: string; content: any }[]>,
    required: true,
  },
  store: {
    type: null,
    required: true,
  },
  change: {
    type: null,
    required: true,
  },
});

const changeTab = (index: number) => {
  props.change(index);
};
</script>

<template>
  <HeadlessTabGroup as="div" class="w-full xl:flex xl:space-x-6" :selected-index="store" @change="changeTab">
    <HeadlessTabList as="ul" class="w-full py-2 pl-0 list-none xl:min-w-[384px] xl:mr-12">
      <DefaultPanel bg="bprimary">
        <slot name="tablist">
          <HeadlessTab v-for="tab in tablist" v-slot="{ selected }" :key="tab.header" as="template">
            <li
              class="flex justify-between w-full p-2 my-2 ml-0 space-x-4 list-none rounded-lg focus-visible:outline-none hover:cursor-pointer"
              :class="{ 'text-secondary': selected, 'opacity-75 hover:text-white': !selected }"
            >
              <span>{{ tab.header }}</span>
              <span class="hidden my-auto text-sm sm:block">{{ tab.date }}</span>
            </li>
          </HeadlessTab>
        </slot>
      </DefaultPanel>
    </HeadlessTabList>
    <HeadlessTabPanels>
      <slot name="tabcontent">
        <HeadlessTabPanel v-for="tab in tablist" :key="tab.header" class="px-4 xl:px-0">
          <h3>{{ tab.header }}</h3>
          <div class="prose prose-invert xl:max-w-[90%]" v-html="tab.content" />
        </HeadlessTabPanel>
      </slot>
    </HeadlessTabPanels>
  </HeadlessTabGroup>
</template>

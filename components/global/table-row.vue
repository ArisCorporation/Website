<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: null,
    required: false,
    default: null,
  },
  prefix: {
    type: String,
    required: false,
    default: null,
  },
  suffix: {
    type: String,
    required: false,
    default: null,
  },
  link: {
    type: String,
    required: false,
    default: null,
  },
  isList: {
    type: Boolean,
    required: false,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    required: false,
    default: false,
  },
  third: {
    type: Boolean,
    required: false,
    default: false,
  },
  click: {
    type: Function,
    required: false,
    default: null,
  },
  inline: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<template>
  <div :class="{ 'col-span-6': fullWidth, 'col-span-2': third, 'col-span-3': !fullWidth && !third }">
    <p v-if="title" class="pt-1 text-sm uppercase" :class="{ 'inline-block mr-1': inline }">{{ title }}:</p>
    <slot>
      <template v-if="content">
        <ul v-if="isList" class="p-0 pl-6">
          <li
            v-for="(item, index) in content.split(', ')"
            :key="index"
            class="marker:text-industrial-400 text-aris-400"
            :class="{ 'inline-block pr-1': inline }"
            @click="click"
          >
            {{ item }}
          </li>
        </ul>
        <NuxtLink v-else-if="link" :to="link" @click="click">
          <p class="animate-link" :class="{ 'inline-block pr-1': inline }">{{ prefix }} {{ content }} {{ suffix }}</p>
        </NuxtLink>
        <p v-else class="text-aris-4000" :class="{ 'inline-block pr-1': inline }" @click="click">
          {{ prefix }} {{ content }} {{ suffix }}
        </p>
      </template>
      <p v-else class="text-aris-4000">N/A</p>
    </slot>
  </div>
</template>

<style scoped lang="postcss">
li {
  @apply pb-1;
}
p {
  @apply p-0 w-fit;
}
</style>

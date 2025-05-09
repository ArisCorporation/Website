<script setup lang="ts">
const { path } = useRoute()

const props = defineProps<{
  label: string,
  link: string,
  icon: string
}>()

const active = computed(() => path.startsWith(props.link))
</script>

<template>
  <NuxtLink
    :to="link"
    class="group relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out "
    :class="[active ? 'bg-(--ui-primary)/10 text-(--ui-primary)' : 'text-gray-300 hover:bg-(--ui-primary)/5 hover:text-(--ui-primary)']"
  >
    <span v-if="active" class="absolute left-0 top-0 h-full w-1 bg-(--ui-primary) animate-pulse-glow" />
    <UIcon :name="icon" class="mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
    <!-- <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-grid "><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg> -->
    <span class="transition-colors duration-300">{{label}}</span>
  </NuxtLink>
</template>
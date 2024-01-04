<script setup lang="ts">
defineProps({
  hangarLink: {
    type: Boolean,
    required: false,
    default: false,
  },
  ams: {
    type: Boolean,
    required: false,
    default: false,
  },
  data: {
    type: Object as PropType<IMember>,
    required: true,
  },
  hidden: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<template>
  <Presence exit-before-enter>
    <Motion
      v-if="!hidden"
      :key="data.id"
      :initial="{ opacity: 0, y: -15 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: -15 }"
      :transition="{ duration: 0.5 }"
      class="relative w-full px-4 mb-4 text-center basis-1/2 lg:basis-1/3 xl:basis-1/4"
    >
      <div class="aspect-potrait mx-auto relative max-w-[270px] w-full group rounded-sm border-secondary border-b-2">
        <div class="absolute flex w-full h-full text-xs sm:text-base">
          <div class="z-20 m-auto opacity-0 group-hover:opacity-100 transition-short-group">
            <hr />
            <p>
              Position:
              <span class="text-secondary">{{ data.position?.position }}</span>
            </p>
            <template v-if="data.roles[0]">
              <hr />
              <p>&ldquo;{{ data.roles?.join(', ') }}&ldquo;</p>
            </template>
            <hr />
            <p class="flex justify-center space-x-4">
              <NuxtLink :to="ams ? data.biographyAmsLink : data.biographyLink">BIOGRAFIE</NuxtLink>
              <NuxtLink v-if="hangarLink" :to="data.hangarLink">HANGAR</NuxtLink>
            </p>
          </div>
        </div>
        <div class="absolute z-10 w-full h-full bg-black opacity-0 group-hover:opacity-50 transition-short-group" />
        <NuxtImg :alt="'Potrait von ' + data.fullName" :src="data.potrait" class="z-0 object-cover w-full h-full" />
      </div>
      <h4>{{ data.fullName }}</h4>
      <h6 class="pt-0 text-light-gray">{{ data.position?.position }}</h6>
    </Motion>
  </Presence>
</template>

<style scoped lang="postcss">
hr {
  @apply w-[100px] h-[2px] my-[2px] mx-auto;
}
p {
  @apply py-[10px] m-0;
}
</style>

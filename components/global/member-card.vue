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
});
</script>

<template>
  <div class="relative w-full px-4 mb-4 text-center basis-1/2 lg:basis-1/3 xl:basis-1/4">
    <div class="aspect-[270/320] mx-auto relative max-w-[270px] w-full group rounded-sm border-secondary border-b-2">
      <div class="absolute flex w-full h-full">
        <div class="z-20 m-auto opacity-0 group-hover:opacity-100 transition-short-group">
          <hr />
          <p>
            Position:
            <span class="text-secondary">{{ data.position }}</span>
          </p>
          <template v-if="data.roles[0]">
            <hr />
            <p>&ldquo;{{ data.roles?.join(', ') }}&ldquo;</p>
          </template>
          <hr />
          <p class="flex justify-center space-x-4">
            <NuxtLink :to="(ams ? '/ams/' : '/') + 'bigoraphy/' + data.slug">BIOGRAFIE</NuxtLink>
            <NuxtLink v-if="hangarLink" :to="'/ams/hangar/' + data.slug">HANGAR</NuxtLink>
          </p>
        </div>
      </div>
      <div class="absolute z-10 w-full h-full bg-black opacity-0 group-hover:opacity-50 transition-short-group" />
      <NuxtImg
        placeholder
        :alt="'Potrait von ' + data.fullName"
        :src="data.potrait || '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492'"
        class="z-0 w-full h-full"
      />
    </div>
    <h4>{{ data.fullName }}</h4>
    <h6 class="pt-0 text-light-gray">{{ data.position }}</h6>
  </div>
</template>

<style scoped lang="postcss">
hr {
  @apply w-[100px] h-[2px] my-[2px] mx-auto;
}
p {
  @apply py-[10px] m-0;
}
</style>

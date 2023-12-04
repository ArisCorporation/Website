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
    type: Object as PropType<Member>,
    required: false,
  },
});
</script>

<template>
  <div class="grid justify-center grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-y-12 gap-x-6">
    <template v-for="member in data.value" :key="member.id">
      <div class="aspect-[270/320] text-center relative max-w-[270px] w-full mx-auto bg-image group">
        <div class="absolute flex w-full h-full">
          <div class="z-20 m-auto opacity-0 group-hover:opacity-100 transition-short-group">
            <hr />
            <p class="m-0">
              Position:
              <span class="text-secondary">{{ member.position }}</span>
            </p>
            <template v-if="member.roles[0]">
              <hr />
              <p>“{{ member.roles?.join(', ') }}“</p>
            </template>
            <hr />
            <p class="flex justify-center space-x-4">
              <NuxtLink :to="(ams ? '/ams/' : '/') + 'bigoraphy/' + member.slug">BIOGRAFIE</NuxtLink>
              <NuxtLink v-if="hangarLink" :to="'/ams/hangar/' + member.slug">HANGAR</NuxtLink>
            </p>
          </div>
        </div>
        <div class="absolute z-10 w-full h-full bg-black opacity-0 group-hover:opacity-50 transition-short-group" />
        <NuxtImg :src="member.potrait || '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492'" class="z-0 w-full h-full" />
      </div>
    </template>
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

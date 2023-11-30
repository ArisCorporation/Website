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
})
</script>

<template>
  <div
    class="grid lg:grid-cols-4 grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-6 justify-center"
  >
    <template v-for="member in data.value" :key="member.id">
      <div
        class="aspect-[270/320] text-center flex relative max-w-[270px] w-full mx-auto bg-image group"
        :style="{
          backgroundImage: `url(${$config.public.fileBase}${
            member.potrait
              ? member.potrait
              : '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492'
          })`,
        }"
      >
        <div
          class="relative z-10 m-auto opacity-0 group-hover:opacity-100 transition-short-group"
        >
          <hr />
          <p class="m-0">
            Position: <span class="text-secondary">{{ member.position }}</span>
          </p>
          <template v-if="member.roles[0]">
            <hr />
            <p>“{{ member.roles?.join(', ') }}“</p>
          </template>
          <hr />
          <p class="flex space-x-4 justify-center">
            <NuxtLink :to="(ams ? '/ams/' : '/') + 'bigoraphy/' + member.slug"
              >BIOGRAFIE</NuxtLink
            >
            <NuxtLink :to="'/ams/hangar/' + member.slug" v-if="hangarLink"
              >HANGAR</NuxtLink
            >
          </p>
        </div>
        <div
          class="absolute w-full h-full bg-black opacity-0 group-hover:opacity-50 transition-short-group"
        />
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

<script setup lang="ts">
const { data, size } = defineProps({
  data: {
    type: Object as PropType<ICommLink>,
    required: true,
  },
  size: {
    type: Number,
    required: false,
    default: 3,
  },
});
</script>

<template>
  <NuxtLink
    :to="'/comm-link/transmission/' + data.id"
    class="relative block w-full col-span-1 p-3 border border-solid hover:no-underline h-80 border-primary border-opacity-20 group"
    :class="{
      'xl:col-span-2 xl:mx-0': size == 2,
      'md:col-span-2 lg:col-span-3 xl:col-span-3 md:mx-0': size == 3,
    }"
  >
    <div
      class="absolute top-0 left-0 z-20 w-full h-full p-3 text-center opacity-0 group-hover:opacity-100 transition-group"
    >
      <div class="flex w-full h-full bg-lines">
        <p
          class="pt-8 m-auto delay-300 opacity-0 text-primary group-hover:opacity-50 group-hover:pt-0 transition-group"
        >
          {{ data.description }}
        </p>
      </div>
    </div>
    <div class="absolute z-10 h-8 bg-no-repeat bg-type w-28 right-3 opacity-60">
      <div class="float-left w-3 h-4 mt-1 ml-10 mr-2 bg-center bg-no-repeat bg-post" />
      <span class="mt-1 text-xs italic capitalize text-primary">Post</span>
    </div>
    <div
      class="relative top-0 right-0 w-full h-3/5"
      :class="{ 'xl:p-3 xl:absolute xl:h-full': size == 2, 'md:p-3 md:absolute md:h-full': size == 3 }"
    >
      <NuxtImg
        class="object-fill object-center w-full h-full sm:object-cover"
        :src="data.storeImage"
        :alt="'Titelbild von dem Comm-Link: ' + data.title"
      />
    </div>
    <div
      class="relative right-0 w-full px-px h-fit"
      :class="{
        'xl:pb-3 xl:px-3 xl:absolute xl:bottom-0': size == 2,
        'md:pb-3 md:px-3 md:absolute md:bottom-0': size == 3,
      }"
    >
      <div
        class="flex w-full h-12"
        :class="{
          'xl:px-5 xl:bg-black xl:bg-opacity-80': size == 2,
          'md:px-5 md:bg-black md:bg-opacity-80': size == 3,
        }"
      >
        <div class="flex flex-wrap justify-between w-full my-auto text-xs text-primary">
          <div>
            <span class="opacity-50">Geposted: </span><span>{{ $dayjs().add(930, 'years').to(data.datePosted) }}</span>
          </div>
          <div>
            <span class="opacity-50">Channel: </span><span>{{ data.channel }}</span>
          </div>
        </div>
      </div>
    </div>
    <div
      class="z-10 flex w-full pl-px"
      :class="{
        'xl:left-0 xl:top-0 xl:p-3 xl:absolute xl:text-center xl:h-full': size == 2,
        'md:left-0 md:top-0 md:p-3 md:absolute md:text-center md:h-full': size == 3,
      }"
    >
      <h1
        class="text-base uppercase"
        :class="{ 'xl:m-auto xl:text-5xl': size == 2, 'md:m-auto md:text-5xl': size == 3 }"
      >
        {{ data.title }}
      </h1>
    </div>
  </NuxtLink>
</template>

<style scroped lang="postcss">
.bg-lines {
  background-image: url('https://robertsspaceindustries.com/rsi/static/images/bg-med-lines.png');
}
.bg-type {
  background-image: url('https://robertsspaceindustries.com/rsi/static/images/channel/hub-type-bg.png');
}
.bg-post {
  background-image: url(https://robertsspaceindustries.com/rsi/static/images/atom/type-post.png);
}
</style>

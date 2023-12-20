<script setup lang="ts">
const { getSingletonItem } = useDirectusItems();
const { data } = await useAsyncData(
  've-home',
  () =>
    getSingletonItem({
      collection: 'exkurs_index',
      params: {
        fields: ['text'],
      },
    }),
  {
    transform: (data) => data.text,
  },
);

// h-48 w-48

definePageMeta({
  path: '/VerseExkurs',
  layout: 'verse-exkurs',
});
</script>

<template>
  <div>
    <div class="prose prose-invert" v-html="data" />
    <div class="w-96 h-96"></div>
    <div class="flex flex-wrap justify-between gap-4 px-4 mx-auto mt-12 mb-8">
      <NuxtLink to="https://robertsspaceindustries.com/starmap" target="_blank">
        <IconHover name="IconsLogosArk" size="48" />
      </NuxtLink>
      <NuxtLink to="https://robertsspaceindustries.com/galactapedia" target="_blank">
        <IconHover name="IconsLogosGalactapedia" size="48" />
      </NuxtLink>
      <NuxtLink to="https://robertsspaceindustries.com/comm-link" target="_blank"
        ><IconHover name="IconsLogosRsiCommLink" size="48"
      /></NuxtLink>
      <NuxtLink to="https://robertsspaceindustries.com/roadmap" target="_blank"
        ><IconHover name="IconsLogosRoadmap" size="48"
      /></NuxtLink>
    </div>
  </div>
</template>

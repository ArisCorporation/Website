<script setup lang="ts">
const { readSingleton } = useDirectusItems();
const data = await readSingleton('verse_exkurs', {
  fields: ['content', 've_links', 'sources'],
});
console.log(data);

definePageMeta({
  path: '/verseexkurs',
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle>
    <div class="prose prose-invert" v-html="data.content" />
    <div class="mb-4">
      <ul class="divide-y divide-btertiary">
        <li v-for="link in data.ve_links" class="p-0 list-none">
          <NuxtLink
            :to="link.link.startsWith('/') ? link.link : '/verseexkurs/' + link.link"
            class="grid w-full grid-cols-12 my-2 py-2 !no-underline transition divide-x-2 cursor-pointer h-fit divide-btertiary hover:bg-bsecondary text-tbase"
          >
            <div class="flex items-center col-span-2">
              <NuxtImg
                :src="link.icon.split('.')[0]"
                :placeholder="[16, 16, 1, 5]"
                :alt="'Icon for ' + link.name"
                class="w-32 p-2 m-auto aspect-square"
              />
            </div>
            <div class="col-span-8">
              <div class="p-2">
                <h3 class="mb-2 text-aris-400">&quot;{{ link.name }}&quot;</h3>
                <p>{{ link.description }}</p>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div>
      <p>Sämtliche Inhalte des Verse Exkurses wurden aus Englischsprachigen Original Loreposts von:</p>
      <p>
        <NuxtLink target="_blank" to="https://robertsspaceindustries.com">RobertsSpaceIndustries.com</NuxtLink> von
        unserem Team ins Deutsche übersetzt.
      </p>
      <p>
        Als Referenz für unsere Inhalte geben wir folgende Quellen auf
        <NuxtLink target="_blank" to="https://robertsspaceindustries.com">RobertsSpaceIndustries.com</NuxtLink> an:
      </p>
    </div>
    <!-- w-1/3 h-1/3 -->
    <div class="flex flex-wrap justify-between gap-4 px-4 mx-auto mt-12 mb-8">
      <template v-for="source in data.sources">
        <NuxtLink :to="source.url" target="_blank" class="w-1/5 aspect-square">
          <ImageHoverEffect :src="source.icon" />
        </NuxtLink>
        <!-- {{ source }} -->
        <!-- <NuxtImg :src="source.icon.split('.')[0]" /> -->
      </template>
      <!-- <NuxtLink to="https://robertsspaceindustries.com/starmap" target="_blank">
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
      /></NuxtLink> -->
    </div>
  </VerseExkursBaseArticle>
</template>

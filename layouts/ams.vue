<script setup lang="ts">
const config = useRuntimeConfig();
const SidebarStore = useSidebarStore();
const user = useDirectusUser();

useSeoMeta({
  description:
    'Das hier, ist dass ArisCorp Management System der Astro Research and Industrial Service Corporation. Hier können die Mitglieder der ArisCorp auf viele verschiedene Tools und Programme zugreifen. Es ist der Zentrale Knotenpunkt für Mitglieder der ArisCorp.',
  ogTitle: 'Astro Research and Industrial Service Corporation',
  ogDescription:
    'Das hier, ist dass ArisCorp Management System der Astro Research and Industrial Service Corporation. Hier können die Mitglieder der ArisCorp auf viele verschiedene Tools und Programme zugreifen. Es ist der Zentrale Knotenpunkt für Mitglieder der ArisCorp.',
  ogImage: config.public.fileBase + '5021a418-1134-4fbe-ba4f-a243468d2d72',
  twitterDescription:
    'Das hier, ist dass ArisCorp Management System der Astro Research and Industrial Service Corporation. Hier können die Mitglieder der ArisCorp auf viele verschiedene Tools und Programme zugreifen. Es ist der Zentrale Knotenpunkt für Mitglieder der ArisCorp.',
  twitterImage: config.public.fileBase + '5021a418-1134-4fbe-ba4f-a243468d2d72',
  twitterCard: 'summary_large_image',
});

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - A.M.S. - Astro Research and Industrial Service Corporation`
      : 'A.M.S. - Astro Research and Industrial Service Corporation';
  },
});
</script>

<template>
  <div>
    <TheModal>
      <template #content>
        <slot name="modalContent" />
      </template>
    </TheModal>
    <AmsSidebar />
    <div class="flex flex-col justify-between flex-1 min-h-screen lg:ml-64">
      <SidebarOverlay :state="SidebarStore.MobileSidebar" @click="SidebarStore.ToggleMobileSidebar()" />
      <DevOnly>
        <div class="bg-black z-[99] pb-4 px-8">
          <h6>DEV TOOLS:</h6>
          <code class="block pb-2">User: {{ user }}</code>
        </div>
      </DevOnly>
      <div class="flex flex-wrap w-full px-4 mt-4">
        <Icon name="IconsLogosAmsBanner" class="w-1/4 aspect-[33/11] -mb-2 h-auto" />
        <div class="relative mt-auto ml-auto group">
          <div class="absolute right-0 justify-center hidden mt-2 text-center w-14 group-hover:flex">Hilfe</div>
        </div>
      </div>
      <hr class="my-2" />
      <div class="container min-h-screen px-4 mx-auto">
        <div class="mt-4">
          <slot />
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>

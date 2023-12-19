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
          <!-- <div>
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 24 24"
              class="transition-all duration-200 cursor-pointer w-14 h-14 text-white/75 hover:text-white hover:duration-300"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0V0z"></path>
              <path
                d="M19 2H5a2 2 0 00-2 2v14a2 2 0 002 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16h-4.83l-.59.59L12 20.17l-1.59-1.59-.58-.58H5V4h14v14zm-8-3h2v2h-2zm1-8c1.1 0 2 .9 2 2 0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4S8 6.79 8 9h2c0-1.1.9-2 2-2z"
              ></path>
            </svg>
          </div> -->
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

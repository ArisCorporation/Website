<script setup lang="ts">
const config = useRuntimeConfig();
const SidebarStore = useSidebarStore();
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
      <div class="container min-h-screen px-4 mx-auto">
        <SidebarOverlay :state="SidebarStore.MobileSidebar" @click="SidebarStore.ToggleMobileSidebar()" />
        <slot />
      </div>
      <Footer />
    </div>
  </div>
</template>

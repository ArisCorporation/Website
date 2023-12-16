<script setup lang="ts">
const SidebarStore = useSidebarStore();
useSeoMeta({
  description:
    'Das hier, ist die Informationsplattform der Astro Research and Industrial Service Corporation. Hier kann man alle Informationen über die Lore des Universums rund um das Spiel "Star Citizen" finden.',
  ogTitle: 'Astro Research and Industrial Service Corporation',
  ogDescription:
    'Das hier, ist die Informationsplattform der Astro Research and Industrial Service Corporation. Hier kann man alle Informationen über die Lore des Universums rund um das Spiel "Star Citizen" finden.',
  twitterDescription:
    'Das hier, ist die Informationsplattform der Astro Research and Industrial Service Corporation. Hier kann man alle Informationen über die Lore des Universums rund um das Spiel "Star Citizen" finden.',
  twitterCard: 'summary_large_image',
});

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - VerseExkurs - Astro Research and Industrial Service Corporation`
      : 'VerseExkurs - Astro Research and Industrial Service Corporation';
  },
});
</script>

<template>
  <div>
    <VerseExkursSidebar />
    <div class="flex flex-col justify-between flex-1 min-h-screen px-4 overflow-hidden lg:ml-64">
      <div class="container px-4 mx-auto">
        <SidebarOverlay :state="SidebarStore.MobileSidebar" @click="SidebarStore.ToggleMobileSidebar()" />
        <div class="mt-6">
          <slot />
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>

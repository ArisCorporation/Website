<script setup lang="ts">
const SidebarStore = useSidebarStore();

const sidebarItems = [
  // {
  // 	name: 'Home',
  // 	icon: 'heroicons:home-solid',
  // 	link: '',
  // },
  {
    name: 'Schiffe',
    icon: 'IconsNavigationFleet',
    link: '/ships',
  },
  // {
  //   name: 'Vergleich',
  //   icon: 'IconsNavigationFleet',
  //   link: '/comparison',
  // },
];

useSeoMeta({
  description:
    'Das hier, ist die Schiffsplattform der Astro Research and Industrial Service Corporation. Hier kannst du alles über die Schiffe im Universum von Star Citizen finden.',
  ogTitle: 'Astro Research and Industrial Service Corporation',
  ogDescription:
    'Das hier, ist die Schiffsplattform der Astro Research and Industrial Service Corporation. Hier kannst du alles über die Schiffe im Universum von Star Citizen finden.',
  twitterDescription:
    'Das hier, ist die Schiffsplattform der Astro Research and Industrial Service Corporation. Hier kannst du alles über die Schiffe im Universum von Star Citizen finden.',
  twitterCard: 'summary_large_image',
});

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - ShipExkurs - Astro Research and Industrial Service Corporation`
      : 'ShipExkurs - Astro Research and Industrial Service Corporation';
  },
});
</script>

<template>
  <div class="lg:grid lg:grid-cols-[16rem,_1fr]">
    <TheModal>
      <template #content>
        <slot name="modalContent" />
      </template>
    </TheModal>
    <Slideover>
      <template v-if="$slots.slideCard" #slideCard>
        <slot name="slideCard" />
      </template>
      <template v-if="$slots.slideHeader" #slideHeader>
        <slot name="slideHeader" />
      </template>
      <template v-if="$slots.slideContent" #slideContent>
        <slot name="slideContent" />
      </template>
      <template v-if="$slots.slideFooter" #slideFooter>
        <slot name="slideFooter" />
      </template>
    </Slideover>
    <Sidebar banner="IconsLogosSeBanner" base-url="/shipexkurs" :sidebar-items="sidebarItems" />
    <div id="sidebar-space" class="hidden lg:block" />
    <div class="flex flex-col justify-between flex-1 w-full max-w-full min-h-screen">
      <SidebarOverlay :state="SidebarStore.MobileSidebar" @click="SidebarStore.toggleMobileSidebar" />
      <div class="w-full min-h-screen px-4 mx-auto">
        <div class="mt-4">
          <slot />
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>

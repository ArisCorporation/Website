<script setup lang="ts">
const SidebarStore = useSidebarStore();

const sidebarItems = [
  {
    name: 'Home',
    icon: 'heroicons:home-solid',
    link: '',
  },
  {
    name: 'Zeitstrahl',
    icon: 'IconsNavigationTimeline',
    link: '/timeline',
  },
  {
    name: 'Ein Tag in der Geschichte',
    icon: 'ic:baseline-history-edu',
    link: '/one-day-in-history',
  },
  {
    name: 'UEE',
    icon: 'IconsNavigationUee',
    link: '/uee',
  },
  {
    name: 'ARK Starmap',
    icon: 'IconsNavigationStarmap',
    link: '/starmap',
  },
  {
    name: 'Alienrassen',
    icon: 'IconsNavigationAliens',
    link: '/aliens',
  },
  {
    name: 'Firmen',
    icon: 'IconsNavigationCompanies',
    link: '/companies',
  },
  {
    name: 'Fraktionen',
    icon: 'heroicons:user-group-solid',
    link: '/fractions',
  },
  {
    name: 'Technologie',
    icon: 'IconsNavigationTechnology',
    link: '/technology',
  },
  {
    name: 'Spectrum',
    icon: 'IconsNavigationSpectrum',
    link: '/spectrum',
  },
  {
    name: 'Literatur',
    icon: 'material-symbols:book-4-outline',
    link: '/literature',
  },
];

defineShortcuts({
  dead: {
    usingInput: true,
    handler: () => (useCookie('devtools').value = JSON.stringify(!JSON.parse(useCookie('devtools').value ?? 'false'))),
  },
});

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
    <Sidebar banner="IconsLogosVeBanner" base-url="/verseexkurs" :sidebar-items="sidebarItems" />
    <div id="sidebar-space" class="hidden lg:block" />
    <div class="flex flex-col justify-between flex-1 w-full max-w-full min-h-screen">
      <SidebarOverlay :state="SidebarStore.MobileSidebar" @click="SidebarStore.toggleMobileSidebar" />
      <DevOnly>
        <div v-if="JSON.parse(useCookie('devtools').value ?? 'false')" class="bg-black z-[99] pb-4 px-8">
          <h6>DEV TOOLS:</h6>
          <code class="block pb-2">User: {{ user }}</code>
        </div>
        <ButtonDefault
          class="w-fit"
          @click="useCookie('devtools').value = JSON.stringify(!JSON.parse(useCookie('devtools').value ?? 'false'))"
        >
          <Icon
            name="mdi-light:console"
            class="w-6 h-6"
            :class="{ 'text-primary': JSON.parse(useCookie('devtools').value ?? 'false') }"
          />
        </ButtonDefault>
      </DevOnly>
      <div class="container min-h-screen px-4 mx-auto">
        <div class="mt-4">
          <slot />
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>

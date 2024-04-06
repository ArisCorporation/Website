<script setup lang="ts">
const config = useRuntimeConfig();
const SidebarStore = useSidebarStore();
const { user, logout } = useDirectusAuth();
const router = useRouter();

const handleLogout = async () => {
  await logout();
  router.push('/');
};

const sidebarItems = [
  {
    name: 'Home',
    icon: 'heroicons:home-solid',
    link: '',
    level: 0,
  },
  {
    name: 'Flotte',
    icon: 'IconsNavigationFleet',
    link: '/fleet',
    level: 0,
  },
  {
    name: 'Mitarbeiter',
    icon: 'IconsNavigationMembers',
    link: '/employees',
    level: 0,
  },
  {
    name: 'Administration',
    icon: 'ri:admin-line',
    link: '/administration',
    level: 4,
  },
  {
    name: 'Toolbox',
    link: '/toolbox',
    level: 0,
  },
];

const sidebarUserItems = [
  {
    name: 'Mein Hangar',
    icon: 'IconsNavigationHangar',
    link: '/hangar',
  },
  {
    name: 'Mein Profil',
    icon: 'heroicons:user-20-solid',
    link: '/profile',
  },
  {
    name: 'Logout',
    icon: 'material-symbols:logout',
    action: handleLogout,
  },
];

defineShortcuts({
  dead: {
    usingInput: true,
    handler: () =>
      (useCookie('ams_devtools').value = JSON.stringify(!JSON.parse(useCookie('ams_devtools').value ?? 'true'))),
  },
});

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
  <div class="lg:grid lg:grid-cols-[16rem,_1fr]">
    <TheModal>
      <template #content>
        <slot name="modalContent" />
      </template>
    </TheModal>
    <USlideover v-model="useModalStore().isSlideOpen">
      <!-- <div class="flex-1 p-4 scrollbar-gray-thin"> -->
      <slot name="slideCard">
        <div class="flex-1 overflow-y-scroll">
          <UCard
            class="flex flex-col flex-1 h-full overflow-y-scroll scrollbar-gray-thin"
            :ui="{
              body: { base: 'flex-1' },
              background: 'bg-bprimary',
              ring: '',
              divide: 'divide-y divide-btertiary',
            }"
          >
            <template #header>
              <slot name="slideHeader" />
            </template>
            <slot name="slideContent" />
            <template #footer>
              <slot name="slideFooter" />
            </template>
          </UCard>
        </div>
      </slot>
    </USlideover>
    <Sidebar
      banner="IconsLogosAmsBanner"
      base-url="/ams"
      :sidebar-items="sidebarItems"
      :user-sidebar-items="sidebarUserItems"
    />
    <div id="sidebar-space" class="hidden lg:block" />
    <!-- lg:max-w-[calc(100vw-16rem)]  lg:ml-64 -->
    <div class="flex flex-col justify-between flex-1 w-full max-w-full min-h-screen">
      <SidebarOverlay :state="SidebarStore.MobileSidebar" @click="SidebarStore.toggleMobileSidebar" />

      <div v-if="JSON.parse(useCookie('ams_devtools').value ?? 'true')" class="bg-black z-[99] pb-4 px-8">
        <h6>DEV TOOLS:</h6>
        <code class="block pb-2">User: {{ user }}</code>
      </div>
      <DevOnly>
        <ButtonDefault
          class="w-fit"
          @click="
            useCookie('ams_devtools').value = JSON.stringify(!JSON.parse(useCookie('ams_devtools').value ?? 'true'))
          "
        >
          <Icon
            name="mdi-light:console"
            class="w-6 h-6"
            :class="{ 'text-primary': JSON.parse(useCookie('ams_devtools').value ?? 'true') }"
          />
        </ButtonDefault>
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

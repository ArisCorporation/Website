<script setup lang="ts">
const { logout } = useDirectusAuth();
const { push } = useRouter();

const SidebarStore = useSidebarStore();

const handleLogout = async () => {
  await logout();
  push('/');
};

const sidebarItems = [
  {
    name: 'Home',
    icon: 'heroicons:home-solid',
    link: '',
  },
  {
    name: 'Flotte',
    icon: 'IconsNavigationFleet',
    link: '/fleet',
  },
  {
    name: 'Mitarbeiter',
    icon: 'IconsNavigationMembers',
    link: '/uee',
  },
  {
    name: 'Admin',
    icon: 'ri:admin-line',
    link: '/admin',
  },
];

const userSidebarItems = [
  {
    name: 'Mein Hangar',
    icon: 'IconsNavigationHangar',
    link: '',
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
</script>

<template>
  <button
    aria-controls="default-sidebar"
    type="button"
    class="fixed inline-flex items-center p-2 mt-2 text-sm text-gray-500 rounded-lg w-fit ms-3 lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
    @click="SidebarStore.ToggleMobileSidebar()"
  >
    <span class="sr-only">Open sidebar</span>
    <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        clip-rule="evenodd"
        fill-rule="evenodd"
        d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
      ></path>
    </svg>
  </button>
  <aside
    id="default-sidebar"
    class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform lg:translate-x-0"
    :class="{ '-translate-x-full': !SidebarStore.MobileSidebar }"
    aria-label="Sidebar"
  >
    <div class="relative h-full pb-4 overflow-y-auto bg-bsecondary">
      <div class="flex w-full px-4">
        <Icon name="IconsLogosAmsBanner" class="w-3/4 mx-auto -mt-4 -mb-8 h-fit" />
      </div>
      <ul class="p-0 font-medium list-none basis-full">
        <li v-for="(item, i) in sidebarItems" :key="i" class="pb-0">
          <!-- class="relative flex items-center p-2 mx-3 rounded-lg hover:no-underline group hover:bg-bprimary before:transition-default" -->
          <NuxtLink
            :to="'/ams' + item.link"
            class="relative flex items-center p-2 mx-3 transition rounded-lg hover:no-underline group before:transition-default"
            :class="[
              (item.link ? $route.path.startsWith('/ams' + item.link) : $route.path === '/ams')
                ? 'text-white before:shadow-[2px_0_10px_rgba(36,86,130,.9)] before:rounded-r-sm before:w-1 before:h-4/5 before:top-[10%] before:absolute before:-left-3 before:bg-primary'
                : 'text-tbase/75 hover:text-white',
            ]"
          >
            <Icon
              :name="item.icon"
              class="w-6 h-6 transition-group"
              :class="[
                (item.link ? $route.path.startsWith('/ams' + item.link) : $route.path === '/ams')
                  ? 'text-white'
                  : 'text-tbase/75 group-hover:text-white',
              ]"
            />
            <span class="ms-3">{{ item.name }}</span>
            <!-- <span
                class="inline-flex items-center justify-center px-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-full ms-3 dark:bg-gray-700 dark:text-gray-300"
                >Pro</span
              > -->
            <!-- <span
                class="inline-flex items-center justify-center w-3 h-3 p-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full ms-3 dark:bg-blue-900 dark:text-blue-300"
                >3</span
              > -->
          </NuxtLink>
        </li>
      </ul>
      <ul class="absolute bottom-0 p-0 mt-auto space-y-2 font-medium list-none basis-full">
        <li v-for="(item, i) in userSidebarItems" :key="i" class="pb-0">
          <!-- class="relative flex items-center p-2 mx-3 rounded-lg hover:no-underline group hover:bg-bprimary before:transition-default" -->
          <NuxtLink
            v-if="item.link"
            :to="'/ams' + item.link"
            class="relative flex items-center p-2 mx-3 transition rounded-lg hover:no-underline group before:transition-default"
            :class="[
              (item.link ? $route.path.startsWith('/ams' + item.link) : $route.path === '/ams')
                ? 'text-white before:shadow-[2px_0_10px_rgba(36,86,130,.9)] before:rounded-r-sm before:w-1 before:h-4/5 before:top-[10%] before:absolute before:-left-3 before:bg-primary'
                : 'text-tbase/75 hover:text-white',
            ]"
          >
            <Icon
              :name="item.icon"
              class="w-6 h-6 transition-group"
              :class="[
                (item.link ? $route.path.startsWith('/ams' + item.link) : $route.path === '/ams')
                  ? 'text-white'
                  : 'text-tbase/75 group-hover:text-white',
              ]"
            />
            <span class="ms-3">{{ item.name }}</span>
          </NuxtLink>
          <button
            v-else
            class="relative flex items-center p-2 mx-3 transition rounded-lg hover:no-underline group"
            @click="item.action"
          >
            <Icon :name="item.icon" class="w-6 h-6 transition-group text-tbase/75 group-hover:text-white" />
            <span class="ms-3">{{ item.name }}</span>
          </button>
        </li>
        <li>
          <NuxtLink
            to="/"
            class="relative flex items-center p-2 mx-3 rounded-lg hover:no-underline text-tbase hover:text-white group"
          >
            <Icon name="IconsLogosAriscorp" class="w-6 h-6 transition duration-75 text-tbase group-hover:text-white" />
            <span class="ms-3">ArisCorp Homepage</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

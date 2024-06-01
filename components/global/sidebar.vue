<script setup lang="ts">
const user = transformUser(useDirectusAuth().readMe());
const SidebarStore = useSidebarStore();
const router = useRouter();

defineProps({
  baseUrl: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
    required: true,
  },
  sidebarItems: {
    type: Array<{ name: string; icon?: string; avatar?: string; link: string; level?: number }>,
    required: true,
  },
  userSidebarItems: {
    type: Array<{ name: string; icon?: string; avatar?: string; link: string }>,
    required: false,
    default: [],
  },
  permissionControl: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<template>
  <button
    aria-controls="default-sidebar"
    type="button"
    class="fixed z-40 inline-flex items-center p-2 mt-2 text-sm rounded-lg text-tbase hover:text-bprimary w-fit ms-3 lg:hidden focus:outline-none focus:ring-0 hover:bg-tbase"
    @click="SidebarStore.toggleMobileSidebar"
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
    class="fixed top-0 left-0 z-50 w-64 transition-transform h-[100dvh] lg:translate-x-0"
    :class="{ '-translate-x-full': !SidebarStore.MobileSidebar }"
    aria-label="Sidebar"
  >
    <div class="relative h-full pb-4 overflow-y-auto bg-bsecondary">
      <div class="flex w-full px-4">
        <Icon :name="banner" class="w-3/4 px-4 mx-auto -mt-0.5 -mb-0.5 h-auto" />
      </div>
      <ul class="p-0 font-medium list-none basis-full">
        <li v-for="(item, i) in sidebarItems" :key="i" class="pb-0">
          <template v-if="item.name !== 'Mein Hangar' && item.name !== 'Flotte'">
            <!-- class="relative flex items-center p-2 mx-3 rounded-lg hover:no-underline group hover:bg-bprimary before:transition-default" -->
            <NuxtLink
              v-if="permissionControl ? user.position.access_level >= item.level : true"
              :to="baseUrl + item.link"
              class="relative flex items-center p-2 mx-3 transition-colors duration-200 rounded-lg animate-link hover:no-underline group before:transition-default w-fit"
              :class="[
                (item.link ? $route.path.startsWith(baseUrl + item.link) : $route.path === baseUrl)
                  ? 'text-white before:shadow-[2px_0_10px_rgba(36,86,130,.9)] before:rounded-r-sm before:w-1 before:h-4/5 before:top-[10%] before:absolute before:-left-3 before:bg-primary'
                  : 'text-tbase/75 hover:text-white',
              ]"
              @click="SidebarStore.mobileSidebarOff"
            >
              <Icon
                v-if="item.icon"
                :name="item.icon"
                class="w-6 h-6 transition-colors duration-200"
                :class="[
                  (item.link ? $route.path.startsWith(baseUrl + item.link) : $route.path === baseUrl)
                    ? 'text-white'
                    : 'text-tbase/75 group-hover:text-white',
                ]"
              />
              <UAvatar
                v-if="item.avatar"
                :src="$config.fileBase && item.avatar"
                class="w-6 h-6 transition-colors duration-200"
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
          </template>
          <template v-else>
            <!-- <a
            v-if="permissionControl ? user.position.access_level >= item.level : true"
            :href="baseUrl + item.link"
            class="relative flex items-center p-2 mx-3 transition-colors duration-200 rounded-lg animate-link hover:no-underline group before:transition-default w-fit"
            :class="[
              (item.link ? $route.path.startsWith(baseUrl + item.link) : $route.path === baseUrl)
                ? 'text-white before:shadow-[2px_0_10px_rgba(36,86,130,.9)] before:rounded-r-sm before:w-1 before:h-4/5 before:top-[10%] before:absolute before:-left-3 before:bg-primary'
                : 'text-tbase/75 hover:text-white',
            ]"
            @click="SidebarStore.mobileSidebarOff"
          >
            <Icon
              :name="item.icon"
              class="w-6 h-6 transition-colors duration-200"
              :class="[
                (item.link ? $route.path.startsWith(baseUrl + item.link) : $route.path === baseUrl)
                  ? 'text-white'
                  : 'text-tbase/75 group-hover:text-white',
              ]"
            />
            <span class="ms-3">{{ item.name }}</span>
          </a> -->
            <button
              v-if="permissionControl ? user.position.access_level >= item.level : true"
              class="relative flex items-center p-2 mx-3 transition-colors duration-200 rounded-lg animate-link hover:no-underline group before:transition-default w-fit"
              :class="[
                (item.link ? $route.path.startsWith(baseUrl + item.link) : $route.path === baseUrl)
                  ? 'text-white before:shadow-[2px_0_10px_rgba(36,86,130,.9)] before:rounded-r-sm before:w-1 before:h-4/5 before:top-[10%] before:absolute before:-left-3 before:bg-primary'
                  : 'text-tbase/75 hover:text-white',
              ]"
              @click="() => useRouter().replace(baseUrl + item.link + '/r')"
            >
              <Icon
                :name="item.icon"
                class="w-6 h-6 transition-colors duration-200"
                :class="[
                  (item.link ? $route.path.startsWith(baseUrl + item.link) : $route.path === baseUrl)
                    ? 'text-white'
                    : 'text-tbase/75 group-hover:text-white',
                ]"
              />
              <span class="ms-3">{{ item.name }}z</span>
            </button>
          </template>
        </li>
      </ul>
      <ul class="absolute bottom-0 p-0 mt-auto space-y-2 font-medium list-none basis-full">
        <li v-for="(item, i) in userSidebarItems" :key="i" class="pb-0">
          <template v-if="item.name !== 'Mein Hangar' && item.name !== 'Flotte'">
            <!-- class="relative flex items-center p-2 mx-3 rounded-lg hover:no-underline group hover:bg-bprimary before:transition-default" -->
            <NuxtLink
              v-if="item.link"
              :to="baseUrl + item.link"
              class="relative flex items-center p-2 mx-3 transition-colors duration-200 rounded-lg animate-link hover:no-underline group before:transition-default w-fit"
              :class="[
                (item.link ? $route.path.startsWith(baseUrl + item.link) : $route.path === baseUrl)
                  ? 'text-white before:shadow-[2px_0_10px_rgba(36,86,130,.9)] before:rounded-r-sm before:w-1 before:h-4/5 before:top-[10%] before:absolute before:-left-3 before:bg-primary'
                  : 'text-tbase/75 hover:text-white',
              ]"
              @click="SidebarStore.mobileSidebarOff"
            >
              <Icon
                v-if="item.icon"
                :name="item.icon"
                class="w-6 h-6 transition-group"
                :class="[
                  (item.link ? $route.path.startsWith(baseUrl + item.link) : $route.path === baseUrl)
                    ? 'text-white'
                    : 'text-tbase/75 group-hover:text-white',
                ]"
              />
              <UAvatar v-else-if="item.avatar" :src="item.avatar" size="xs" class="transition-colors duration-200" />
              <span class="ms-3">{{ item.name }}</span>
            </NuxtLink>
            <button
              v-else
              class="relative flex items-center p-2 mx-3 transition rounded-lg hover:no-underline group text-tbase/75 hover:text-white"
              @click="item.action"
            >
              <Icon :name="item.icon" class="w-6 h-6 transition-group text-tbase/75 group-hover:text-white" />
              <span class="ms-3">{{ item.name }}</span>
            </button>
          </template>
          <template v-else>
            <a
              v-if="permissionControl ? user.position.access_level >= item.level : true"
              :href="baseUrl + item.link"
              class="relative flex items-center p-2 mx-3 transition-colors duration-200 rounded-lg animate-link hover:no-underline group before:transition-default w-fit"
              :class="[
                (item.link ? $route.path.startsWith(baseUrl + item.link) : $route.path === baseUrl)
                  ? 'text-white before:shadow-[2px_0_10px_rgba(36,86,130,.9)] before:rounded-r-sm before:w-1 before:h-4/5 before:top-[10%] before:absolute before:-left-3 before:bg-primary'
                  : 'text-tbase/75 hover:text-white',
              ]"
              @click="SidebarStore.mobileSidebarOff"
            >
              <Icon
                :name="item.icon"
                class="w-6 h-6 transition-colors duration-200"
                :class="[
                  (item.link ? $route.path.startsWith(baseUrl + item.link) : $route.path === baseUrl)
                    ? 'text-white'
                    : 'text-tbase/75 group-hover:text-white',
                ]"
              />
              <span class="ms-3">{{ item.name }}</span>
            </a>
          </template>
        </li>
        <li>
          <NuxtLink
            to="/"
            class="relative flex items-center p-2 mx-3 rounded-lg hover:no-underline text-tbase hover:text-white group animate-link"
            @click="SidebarStore.mobileSidebarOff"
          >
            <Icon name="IconsLogosAriscorp" class="w-6 h-6 transition duration-200 text-tbase group-hover:text-white" />
            <span class="ms-3">ArisCorp Homepage</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

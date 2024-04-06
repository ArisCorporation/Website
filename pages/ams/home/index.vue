<script setup lang="ts">
const modalStore = useModalStore();
const user = transformUser(useDirectusAuth().user?.value);

const indexItems = [
  {
    name: 'Mein Profil',
    link: '/profile',
    icon: '1bc449a2-c0ea-422f-9da5-7d83e5e083b1',
    released: true,
    level: 0,
  },
  {
    name: 'Mein Hangar',
    link: '/hangar',
    icon: 'cb114fb9-3af3-48ba-a435-3d74b0b8b254',
    released: true,
    level: 0,
  },
  {
    name: 'Nachrichten',
    link: '/messages',
    icon: 'e4398951-ffdf-4fd8-a538-d6f4df38d417',
    released: false,
    level: 0,
  },
  {
    name: 'Ereignis Planer',
    link: '/calendar',
    icon: 'bd281169-dbcf-4a8b-ad52-7d1184874ea6',
    released: false,
    level: 0,
  },
  {
    name: 'Beitrags-Editor',
    link: '/posts',
    icon: '01fe30b0-f90f-4cb9-b215-350f3ca8089a',
    released: false,
    level: 0,
  },
  {
    name: 'ArisCorp Mitarbeiter',
    link: '/employees',
    icon: '60a50490-aba3-444e-8244-8fc425c7ceba',
    released: true,
    level: 0,
  },
  {
    name: 'ArisCorp Flotte',
    link: '/fleet',
    icon: 'cfa2c2ab-0559-47f3-9067-d25ee8955f5d',
    released: true,
    level: 3,
  },
  {
    name: 'Abteilungsboards',
    link: '/departments',
    icon: '8cf91577-c8ae-438a-9556-fafab8008752',
    released: false,
    level: 0,
  },
  {
    name: 'Missionsplaner',
    link: '/planer',
    icon: 'aeded9e1-6c2c-4f78-a4d1-251ac26a7bc3',
    released: false,
    level: 3,
  },
  {
    name: 'Missionsboard',
    link: '/missions',
    icon: '1351ed99-17b2-4979-b6bc-af26a7433255',
    released: false,
    level: 0,
  },
  {
    name: 'Administration',
    link: '/admin',
    icon: '096e2ade-9486-4103-8317-e9f463fe84b0',
    released: true,
    level: 4,
  },
];

definePageMeta({
  middleware: 'auth',
  path: '/ams',
  layout: false,
});
</script>

<template>
  <NuxtLayout name="ams">
    <div>
      <div
        class="grid max-w-6xl grid-cols-2 mx-auto mb-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-6"
      >
        <NuxtLink
          v-for="item in indexItems"
          :key="item.name"
          :to="user.position.access_level >= item.level && item.released ? '/ams' + item.link : null"
          class="w-full h-fit aspect-[1/1] relative flex transition hover:scale-105 active:scale-95 group cursor-pointer text-center text-tbase hover:no-underline"
        >
          <div
            class="block w-full h-full bg-image rounded-xl peer group-hover:opacity-40 transition-group"
            :class="{ 'opacity-40': user.position.access_level < item.level || !item.released }"
            :style="{ backgroundImage: `url(${$config.public.fileBase + item.icon})` }"
          />
          <div class="absolute bottom-0 z-10 flex w-full h-full mt-1 transition-group">
            <div class="mx-auto mt-[100%] transition-group group-hover:mt-[45%]">
              <div class="group-hover:hidden contents">
                <p class="p-0 text-sm">{{ item.name }}</p>
              </div>
              <div class="hidden group-hover:contents">
                <p v-if="user.position.access_level >= item.level && item.released" class="p-0 text-sm text-white">
                  {{ item.name }}
                </p>
                <p v-else-if="!item.released" class="p-0 text-white/80">Bald verfügbar...</p>
                <p
                  v-else-if="user.position.access_level < item.level"
                  class="p-0 text-md redacted-small"
                  data-text="[ KEIN ZUGRIFF ]"
                >
                  [ KEIN ZUGRIFF ]
                </p>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

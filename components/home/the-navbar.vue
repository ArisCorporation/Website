<script setup lang="ts">
const mobileMenu = ref(false);
const route = useRoute();

const homeItems = [
  {
    name: 'Mitarbeiter',
    icon: 'IconsNavbarMembers',
    hash: 'our',
    action: {
      tabGroup: 'our',
      tabIndex: 0,
    },
  },
  {
    name: 'Flotte',
    icon: 'IconsNavbarFleet',
    hash: 'our',
    action: {
      tabGroup: 'our',
      tabIndex: 1,
    },
  },
  {
    name: 'Abteilungen',
    icon: 'IconsNavbarDepartments',
    hash: 'our',
    action: {
      tabGroup: 'our',
      tabIndex: 2,
    },
  },
  {
    name: 'Comm-Link',
    icon: 'IconsNavbarCommLink',
    hash: 'comm-link',
  },
  {
    name: 'Rekrutierung',
    icon: 'IconsNavbarRecruitment',
    hash: 'recruitment',
  },
  {
    name: 'Partner',
    icon: 'IconsNavbarPartner',
    hash: 'partners',
  },
];
const bannerItems = [
  {
    name: 'ShipExkurs',
    icon: 'IconsNavbarShipexkurs',
    link: '/shipexkurs/ships',
  },
  {
    name: 'VerseExkurs',
    icon: 'IconsNavbarVerseexkurs',
    link: '/verseexkurs',
  },
  {
    name: 'ArisCorp Management System',
    icon: 'IconsNavbarAms',
    link: '/ams',
  },
];

const homepageTabsStore = useHomepageTabsStore();

function toggleMenu() {
  mobileMenu.value = !mobileMenu.value;
}

function handleHomeButton(item: any) {
  if (item.action) {
    if (item.action.tabGroup === 'our') {
      homepageTabsStore.setOurTab(item.action.tabIndex);
    }
    if (item.action.tabGroup === 'aris') {
      homepageTabsStore.setArisTab(item.action.tabIndex);
    }
  }
  toggleMenu();
}
</script>

<template>
  <nav class="fixed top-0 z-50 w-full h-auto bg-black/80 md:bg-black/80 print:hidden">
    <div
      class="flex flex-wrap items-center justify-between w-full h-full p-2 mx-auto max-w-[1280px] md:flex-nowrap md:px-4"
    >
      <NuxtLink to="/" class="flex w-auto h-16 lg:h-20 aspect-[1/1] animate-link">
        <UIcon name="IconsNavbarAriscorp" class="w-full h-full" />
        <span class="sr-only">ArisCorp</span>
      </NuxtLink>
      <button
        class="inline-flex items-center justify-center w-10 h-10 p-2 text-sm bg-transparent rounded-lg md:hidden hover:bg-neutral-100 focus:outline-none focus:ring-0 animate-link"
        @click="toggleMenu"
      >
        <span class="sr-only">Open main menu</span>
        <UIcon name="ci:hamburger-lg" class="m-auto" size="1.5rem" />
      </button>
      <div
        id="navbar-default"
        class="justify-between w-full md:w-fit md:contents"
        :class="{ hidden: !mobileMenu, block: mobileMenu }"
      >
        <ul
          class="flex flex-col w-full p-4 mt-0 mb-0 font-medium list-none border rounded-lg md:w-fit md:space-x-8 md:p-0 border-industrial-400 bg-bg-600 md:flex-row md:mt-0 md:border-0 md:bg-transparent"
        >
          <li v-for="item in homeItems" :key="item.name" class="relative w-full my-auto md:w-fit">
            <UTooltip
              :ui="{ strategy: 'override', container: 'z-20 group opacity-0 md:opacity-100' }"
              :popper="{ arrow: true, offsetDistance: 12 }"
              class="w-full"
              :text="item.name"
            >
              <NuxtLink
                :to="'/#' + item.hash"
                class="block px-3 py-2 rounded md:p-0 md:border-0 not-active md:animate-link"
                :class="{
                  active: route.hash == item.hash,
                  'not-active': route.hash != item.hash,
                }"
                @click="() => handleHomeButton(item)"
              >
                <span class="block md:hidden w-fit animate-link">{{ item.name }}</span>
                <span class="hidden md:block"
                  ><UIcon :name="item.icon" hover class="w-12 h-auto aspect-[1/1] lg:w-16 opacity-50 hover:opacity-100"
                /></span>
              </NuxtLink>
            </UTooltip>
          </li>
        </ul>
        <ul
          class="flex flex-col w-full p-4 mt-0 mb-0 font-medium list-none border rounded-lg md:w-fit md:space-x-8 md:p-0 border-industrial-400 bg-bg-600 md:flex-row md:mt-0 md:border-0 md:bg-transparent"
        >
          <li v-for="item in bannerItems" :key="item.name" class="relative w-full my-auto md:w-fit">
            <UTooltip
              :ui="{ strategy: 'override', container: 'z-20 group opacity-0 md:opacity-100' }"
              :popper="{ arrow: true, offsetDistance: 12 }"
              class="w-full"
              :text="item.name"
            >
              <NuxtLink
                :to="'/#' + item.hash"
                class="block px-3 py-2 rounded md:p-0 md:border-0 not-active md:animate-link"
                :class="{
                  active: route.hash == item.hash,
                  'not-active': route.hash != item.hash,
                }"
                @click="() => handleHomeButton(item)"
              >
                <span class="block md:hidden w-fit animate-link">{{ item.name }}</span>
                <span class="hidden md:block"
                  ><UIcon
                    :name="item.icon"
                    hover
                    class="h-auto"
                    :class="[item.icon === 'IconsNavbarAms' ? ' w-20 lg:w-24' : ' w-14 lg:w-20']"
                /></span>
              </NuxtLink>
            </UTooltip>
          </li>
        </ul>
        <!-- <ul
          class="flex flex-col w-full p-4 mt-0 mb-0 font-medium list-none border rounded-lg md:w-fit md:space-x-8 md:p-0 border-industrial-400 bg-bg-600 md:flex-row md:mt-0 md:border-0 md:bg-transparent"
        >
          <li v-for="item in bannerItems" :key="item.name" class="relative w-full my-auto group md:w-fit">
            <NuxtLink
              :to="item.link"
              class="block px-3 py-2 rounded md:p-0 md:border-0 not-active md:animate-link"
              @click="toggleMenu"
            >
              <span class="block md:hidden w-fit animate-link">{{ item.name }}</span>
              <span class="hidden md:block"
                >
                <UIcon
                  name="IconsNavbarMembers"
                  hover
                  class="h-auto"
                  :class="[item.icon === 'IconsLogosAmsBanner' ? ' w-20 lg:w-24' : ' w-14 lg:w-20']"
              />
            </span>
            </NuxtLink>
            <div class="tooltip">
              {{ item.name }}
            </div>
          </li>
        </ul> -->
      </div>
    </div>
  </nav>
</template>

<style lang="postcss" scoped>
li {
  @apply p-0;
}
a {
  @apply text-white no-underline;
}
.navigation-logo {
  @apply w-auto h-full;
}
.navigation-icon {
  @apply lg:w-14 w-10 h-auto;
}
.navigation-banner {
  @apply lg:w-24 w-14 h-auto;
}

.active {
  @apply md:text-aris-400 text-bg-800 text-aris-400 hover:text-aris-400/75 hover:md:bg-transparent md:bg-transparent;
}
.not-active {
  @apply hover:bg-bg-800d:hover:bg-transparent;
}
.tooltip {
  @apply hidden md:block;
}
</style>

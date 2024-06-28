<script setup lang="ts">
const mobileMenu = ref(false);
const route = useRoute();

const homeItems = [
  {
    name: 'Mitarbeiter',
    icon: 'IconsNavigationMembers',
    hash: 'our',
    action: {
      tabGroup: 'our',
      tabIndex: 0,
    },
  },
  {
    name: 'Flotte',
    icon: 'IconsNavigationFleet',
    hash: 'our',
    action: {
      tabGroup: 'our',
      tabIndex: 1,
    },
  },
  {
    name: 'Abteilungen',
    icon: 'IconsNavigationDepartments',
    hash: 'our',
    action: {
      tabGroup: 'our',
      tabIndex: 2,
    },
  },
  {
    name: 'Comm-Link',
    icon: 'IconsNavigationCommLink',
    hash: 'comm-link',
  },
  {
    name: 'Rekrutierung',
    icon: 'IconsNavigationRecruitment',
    hash: 'recruitment',
  },
  {
    name: 'Partner',
    icon: 'IconsNavigationPartner',
    hash: 'partners',
  },
];
const bannerItems = [
  {
    name: 'ShipExkurs',
    icon: 'IconsLogosSeBanner',
    link: '/shipexkurs',
  },
  {
    name: 'VerseExkurs',
    icon: 'IconsLogosVeBanner',
    link: '/verseexkurs',
  },
  {
    name: 'ArisCorp Management System',
    icon: 'IconsLogosAmsBanner',
    link: '/ams',
  },
];

const homepageTabs = useState<{
	selectedArisTab: number
	selectedOurTab: number
	selectedOurFleetTab: number
	selectedOurDepartmentTab: number
}>('homepageTabsStore')

function toggleMenu() {
  mobileMenu.value = !mobileMenu.value;
}

function handleHomeButton(item: any) {
  if (item.action) {
    if (item.action.tabGroup === 'our') {
      homepageTabs.value.selectedOurTab = item.action.tabIndex;
    }
    if (item.action.tabGroup === 'aris') {
      homepageTabs.value.selectedArisTab = item.action.tabIndex;
    }
  }
  toggleMenu();
}
</script>

<template>
  <nav class="fixed top-0 z-50 w-full h-auto bg-black/80 md:bg-black/80 print:hidden">
    <div
      class="flex flex-wrap items-center justify-between w-full h-full max-w-screen-xl p-2 mx-auto md:flex-nowrap md:px-4"
    >
      <NuxtLink to="/" class="flex w-auto h-16 lg:h-20 aspect-[1/1] animate-link">
        <Icon name="IconsLogosAriscorp" class="w-full h-full" />
        <span class="sr-only">ArisCorp</span>
      </NuxtLink>
      <button
        class="inline-flex items-center justify-center w-10 h-10 p-2 text-sm rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-0 hover:bg-transparent animate-link"
        @click="toggleMenu"
      >
        <span class="sr-only">Open main menu</span>
        <Icon name="ci:hamburger-lg" class="m-auto" size="1.5rem" />
      </button>
      <div
        id="navbar-default"
        class="justify-between w-full md:w-fit md:contents"
        :class="{ hidden: !mobileMenu, block: mobileMenu }"
      >
        <ul
          class="flex flex-col w-full p-4 mt-4 mb-0 font-medium list-none border rounded-lg md:w-fit md:space-x-8 md:p-0 border-secondary bg-bsecondary md:flex-row md:mt-0 md:border-0 md:bg-transparent"
        >
          <li v-for="item in homeItems" :key="item.name" class="relative w-full my-auto md:w-fit">
            <UTooltip
              :ui="{ strategy: 'override', container: 'z-20 group opacity-0 md:opacity-100' }"
              class="w-full"
              :text="item.name"
              :popper="{ arrow: true, offsetDistance: 12 }"
            >
              <NuxtLink
                :to="'/#' + item.hash"
                class="block px-3 py-2 rounded md:p-0 md:border-0 not-active animate-link"
                :class="{
                  active: route.hash == item.hash,
                  'not-active': route.hash != item.hash,
                }"
                @click="() => handleHomeButton(item)"
              >
                <span class="block md:hidden">{{ item.name }}</span>
                <span class="hidden md:block"><Icon :name="item.icon" hover class="w-12 h-auto lg:w-16" /></span>
              </NuxtLink>
            </UTooltip>
          </li>
        </ul>
        <ul
          class="flex flex-col w-full p-4 mt-4 mb-0 font-medium list-none border rounded-lg md:w-fit md:space-x-8 md:p-0 border-secondary bg-bsecondary md:flex-row md:mt-0 md:border-0 md:bg-transparent"
        >
          <li v-for="item in bannerItems" :key="item.name" class="relative w-full my-auto group md:w-fit">
            <NuxtLink
              @click="toggleMenu"
              :to="item.link"
              class="block px-3 py-2 rounded md:p-0 md:border-0 not-active animate-link"
            >
              <span class="block md:hidden">{{ item.name }}</span>
              <span class="hidden md:block"
                ><Icon
                  :name="item.icon"
                  hover
                  class="h-auto"
                  :class="[item.icon === 'IconsLogosAmsBanner' ? '-my-6 w-20 lg:w-24' : 'w-14 lg:w-20']"
              /></span>
            </NuxtLink>
            <div class="tooltip">
              {{ item.name }}
            </div>
          </li>
        </ul>
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
  @apply md:text-primary-400 text-bprimary bg-primary-400 hover:bg-primary-400/75 hover:md:bg-transparent md:bg-transparent;
}
.not-active {
  @apply hover:bg-bprimary md:hover:bg-transparent;
}
.tooltip {
  @apply hidden md:block;
}
</style>

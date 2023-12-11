<script setup lang="ts">
const mobileMenu = useState('mobileMenu', () => false);
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
    link: '/ShipExkurs',
  },
  {
    name: 'VerseExkurs',
    icon: 'IconsLogosVeBanner',
    link: '/VerseExkurs',
  },
  {
    name: 'A.M.S.',
    icon: 'IconsLogosAmsBanner',
    link: '/ams',
  },
];

const homepageTabsStore = useHomepageTabsStore();
function handleHomeButton(item: any) {
  if (item.action) {
    if (item.action.tabGroup === 'our') {
      homepageTabsStore.setOurTab(item.action.tabIndex);
    }
    if (item.action.tabGroup === 'aris') {
      homepageTabsStore.setArisTab(item.action.tabIndex);
    }
  }
}

function handleBurgerMenu() {
  mobileMenu.value = !mobileMenu.value;
}
</script>

<template>
  <nav class="fixed top-0 z-50 w-full h-fit bg-black/80 md:bg-black/80 print:hidden">
    <div
      class="flex flex-wrap items-center justify-between w-full h-full max-w-screen-xl p-2 mx-auto md:flex-nowrap md:px-4"
    >
      <div class="flex w-auto h-16 lg:h-20 aspect-square">
        <Icon name="IconsLogosAriscorp" class="w-full h-full" />
        <span class="sr-only">ArisCorp</span>
      </div>
      <button
        class="inline-flex items-center justify-center w-10 h-10 p-2 text-sm rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-0"
        @click="handleBurgerMenu"
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
          <li v-for="item in homeItems" :key="item.name" class="w-full my-auto md:w-fit">
            <!-- TODO: add tab index to active class -->
            <NuxtLink
              :to="'/#' + item.hash"
              class="block px-3 py-2 rounded md:p-0 md:border-0 not-active"
              :class="{
                active: route.hash == item.hash,
                'not-active': route.hash != item.hash,
              }"
              @click="() => handleHomeButton(item)"
            >
              <span class="block md:hidden">{{ item.name }}</span>
              <span class="hidden md:block"><Icon :name="item.icon" hover class="w-12 h-auto md:w-14 lg:w-16" /></span>
            </NuxtLink>
          </li>
        </ul>
        <ul
          class="flex flex-col w-full p-4 mt-4 mb-0 font-medium list-none border rounded-lg md:w-fit md:space-x-8 md:p-0 border-secondary bg-bsecondary md:flex-row md:mt-0 md:border-0 md:bg-transparent"
        >
          <li v-for="item in bannerItems" :key="item.name" class="w-full my-auto md:w-fit">
            <NuxtLink :to="item.link" class="block px-3 py-2 rounded md:p-0 md:border-0 not-active">
              <span class="block md:hidden">{{ item.name }}</span>
              <span class="hidden md:block"><Icon :name="item.icon" hover class="h-auto w-14 md:w-16 lg:w-20" /></span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style lang="postcss" scoped>
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
  @apply md:text-primary text-bprimary bg-primary hover:bg-primary/75 hover:md:bg-transparent md:bg-transparent;
}
.not-active {
  @apply hover:bg-bprimary md:hover:bg-transparent;
}
</style>

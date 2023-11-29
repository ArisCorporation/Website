<script setup lang="ts">
const mobileMenu = useState('mobileMenu', () => false)
const route = useRoute()

const homeItems = [
  {
    'name': 'Mitarbeiter',
    'icon': 'IconsNavigationMembers',
    'hash': 'our',
    'action': {
      'tabGroup': 'our',
      'tabIndex': 0
    }
  },
  {
    'name': 'Flotte',
    'icon': 'IconsNavigationFleet',
    'hash': 'our',
    'action': {
      'tabGroup': 'our',
      'tabIndex': 1
    }
  },
  {
    'name': 'Abteilungen',
    'icon': 'IconsNavigationDepartments',
    'hash': 'our',
    'action': {
      'tabGroup': 'our',
      'tabIndex': 2
    }
  },
  {
    'name': 'Comm-Link',
    'icon': 'IconsNavigationCommLink',
    'hash': 'comm-link'
  },
  {
    'name': 'Rekrutierung',
    'icon': 'IconsNavigationRecruitment',
    'hash': 'recruitment'
  },
  {
    'name': 'Partner',
    'icon': 'IconsNavigationPartner',
    'hash': 'partner'
  },
]
const bannerItems = [
  {
    'name': 'ShipExkurs',
    'icon': 'IconsLogosSeBanner',
    'link': '/ShipExkurs'
  },
  {
    'name': 'VerseExkurs',
    'icon': 'IconsLogosVeBanner',
    'link': '/VerseExkurs'
  },
  {
    'name': 'A.M.S.',
    'icon': 'IconsLogosAmsBanner',
    'link': '/ams'
  },
]

function handleHomeButton(item: any) {
  if(item.action){
  } else {
    return
  }
}

function handleBurgerMenu() {
  mobileMenu.value = !mobileMenu.value
}
</script>

<template>
  <nav class="fixed top-0 z-10 h-fit w-full bg-black/80 md:bg-black/30 print:hidden">
    <div class="w-full max-w-screen-xl flex md:flex-nowrap flex-wrap items-center justify-between mx-auto p-2 md:px-4 h-full">
      <div class="flex h-16 lg:h-20 w-auto aspect-square">
       <Icon name="IconsLogosAriscorp" class="h-full w-full" />
        <span class="sr-only">ArisCorp</span>
      </div>
      <button @click="handleBurgerMenu" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-0">
        <span class="sr-only">Open main menu</span>
        <Icon name="ci:hamburger-lg" class="m-auto" size="1.5rem" />
      </button>
      <div class="md:w-fit w-full md:contents justify-between" :class="{'hidden': !mobileMenu, 'block': mobileMenu}" id="navbar-default">
        <ul class="w-full md:w-fit md:space-x-8 font-medium flex flex-col p-4 md:p-0 mt-4 border border-secondary rounded-lg bg-bsecondary md:flex-row md:mt-0 md:border-0 md:bg-transparent">
          <li v-for="item in homeItems" :key="item.name" class="my-auto w-full md:w-fit">
            <!-- TODO: add tab index to active class -->
            <NuxtLink :to="'/#' + item.hash" class="block py-2 px-3 rounded md:p-0 md:border-0 not-active" :class="{'active': route.hash == item.hash, 'not-active': route.hash != item.hash}">
              <span class="block md:hidden">{{item.name}}</span>
              <span class="hidden md:block"><Icon :name="item.icon" hover class="w-12 md:w-14 lg:w-16 h-auto" /></span>
            </NuxtLink>
          </li>
        </ul>
        <ul class="w-full md:w-fit md:space-x-8 font-medium flex flex-col p-4 md:p-0 mt-4 border border-secondary rounded-lg bg-bsecondary md:flex-row md:mt-0 md:border-0 md:bg-transparent">
          <li v-for="item in bannerItems" :key="item.name" class="my-auto w-full md:w-fit">
            <NuxtLink :to="item.link" class="block py-2 px-3 rounded md:p-0 md:border-0 not-active">
              <span class="block md:hidden">{{item.name}}</span>
              <span class="hidden md:block"><Icon :name="item.icon" hover class="w-14 md:w-16 lg:w-20 h-auto" /></span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style lang="postcss" scoped>
.navigation-logo {
  @apply w-auto h-full
}
.navigation-icon {
  @apply lg:w-14 w-10 h-auto
}
.navigation-banner {
  @apply lg:w-24 w-14 h-auto
}

.active{
  @apply md:text-primary text-bprimary bg-primary hover:bg-primary/75 hover:md:bg-transparent md:bg-transparent
}
.not-active{
  @apply hover:bg-bprimary md:hover:bg-transparent
}
</style>
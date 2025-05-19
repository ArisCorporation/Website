<script setup lang="ts">
interface baseElement {
  label: string
}
interface separatorElement extends baseElement {
  type: 'separator'
}
interface linkElement extends baseElement {
  type: 'link'
  link: string
  icon: string
  exact: boolean
}

type sidebarElement = separatorElement | linkElement

const sidebarItems: sidebarElement[] = [
  {
    label: 'Mitglied',
    type: 'separator',
  },
  {
    label: 'Dashboard',
    link: '/ams',
    icon: 'i-lucide-layout-grid',
    exact: true,
    type: 'link',
  },
  {
    label: 'My Profile',
    link: '/ams/profile',
    icon: 'i-lucide-user',
    exact: false,
    type: 'link',
  },
  {
    label: 'My Hangar',
    link: '/ams/hangar',
    icon: 'i-fluent-home-garage-24-regular',
    exact: false,
    type: 'link',
  },
  {
    label: 'Comm-Link',
    link: '/ams/comm-link',
    icon: 'i-lucide-newspaper',
    exact: false,
    type: 'link',
  },
  {
    label: 'Nachrichten',
    link: '/ams/messages',
    icon: 'i-lucide-message-square',
    exact: false,
    type: 'link',
  },
  {
    label: 'Organisation',
    type: 'separator',
  },
  {
    label: 'Mitarbeiter',
    link: '/ams/employees',
    icon: 'i-lucide-users-round',
    exact: false,
    type: 'link',
  },
  {
    label: 'Flotte',
    link: '/ams/fleet',
    icon: 'i-material-symbols-transportation-outline',
    exact: true,
    type: 'link',
  },
  {
    label: 'Flottenstatistiken',
    link: '/ams/fleet-stats',
    icon: 'i-lucide-bar-chart-3',
    exact: true,
    type: 'link',
  },
  {
    label: 'Anteilsrechner',
    link: '/ams/calculator',
    icon: 'i-lucide-calculator',
    exact: false,
    type: 'link',
  },
  {
    label: 'VerseExkurs Editor',
    link: '/ams/verse-exkurs-editor',
    icon: 'i-lucide-book-text',
    exact: false,
    type: 'link',
  },
  {
    label: 'Verwaltung',
    link: '/ams/admin',
    icon: 'i-lucide-shield-check',
    exact: false,
    type: 'link',
  },
]
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-(--ui-primary)/10 bg-(--ui-bg-muted)/90 backdrop-blur-xs lg:block"
  >
    <div class="flex h-full flex-col">
      <!-- Header -->
      <div class="flex h-16 items-center px-4">
        <NuxtLink
          to="/ams"
          class="flex items-center gap-2 transition-all duration-300 hover:scale-105"
        >
          <span class="text-xl font-bold tracking-wider text-white"
            >ArisCorp</span
          >
          <span class="text-(--ui-primary) ml-2">AMS</span>
        </NuxtLink>
      </div>
      <!-- Separator -->
      <div class="shrink-0 h-[1px] w-full bg-(--ui-primary)/10" />
      <!-- Content -->
      <nav class="flex-1 space-y-1 px-2 py-4">
        <template v-for="item in sidebarItems">
          <AMSUiSidebarLink
            v-if="item.type === 'link'"
            :label="item.label"
            :link="item.link"
            :icon="item.icon"
            :exact="item.exact"
          />
          <USeparator
            v-else-if="item.type === 'separator'"
            color="ams"
            :label="item.label"
            class="mt-8"
          />
        </template>
      </nav>
      <!-- Footer -->
      <div class="p-4">
        <div
          class="rounded-lg border border-(--ui-primary)/20 bg-(--ui-bg-muted)/50 p-4 transition-all duration-300 hover:border-(--ui-primary)/30 hover:shadow-primary-xs"
        >
          <div class="flex flex-col space-y-3">
            <div class="flex items-center gap-3 prose-img:my-0">
              <div
                class="flex shrink-0 overflow-hidden rounded-full h-12 w-12 border border-(--ui-primary)/20 ring-1 ring-(--ui-primary)/10"
              >
                <NuxtImg
                  class="size-full object-cover"
                  alt="Thomas Blakeney"
                  src="31733e00-f4ff-4ebf-9499-668508d6c0fc"
                />
              </div>
              <div class="flex-1 not-prose">
                <p class="text-sm font-medium text-white">Thomas Blakeney</p>
                <p class="text-xs text-(--ui-primary)">
                  Chief of Logistics Department
                </p>
              </div>
            </div>
            <UButton
              variant="outline"
              icon="i-lucide-log-out"
              class="h-9 px-3 text-sm text-gray-300 hover:text-(--ui-primary) flex justify-center"
            >
              Logout
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style>
/*  after:ease-in-out */
.button-pulse {
  @apply relative overflow-hidden after:rounded-[inherit] after:opacity-0 after:bg-[#00ffe81a] after:transition-opacity after:duration-300 after:absolute;
}
</style>

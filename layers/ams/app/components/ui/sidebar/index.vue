<script setup lang="ts">
const navlinks = [
  {
    label: 'Dashboard',
    link: '/ams',
    icon: 'i-material-symbols-grid-view-outline-rounded',
  },
  {
    label: 'My Profile',
    link: '/profile',
    icon: 'i-material-symbols-person-outline',
  },
  {
    label: 'My Hangar',
    link: '/hangar',
    icon: 'i-fluent-home-garage-24-regular',
  },
  {
    label: 'Comm-Link',
    link: '/comm-link',
    icon: 'i-material-symbols-contract-edit-outline',
  },
  {
    label: 'Nachrichten',
    link: '/messages',
    icon: 'i-material-symbols-chat-bubble-outline',
  },
  {
    label: 'Mitarbeiter',
    link: '/employees',
    icon: 'i-material-symbols-groups-outline',
  },
  {
    label: 'Flotte',
    link: '/fleet',
    icon: 'i-material-symbols-transportation-outline',
  },
  {
    label: 'Flottenstatistiken',
    link: '/fleet-stats',
    icon: 'i-material-symbols-bar-chart-4-bars-rounded',
  },
  {
    label: 'Anteilsrechner',
    link: '/calculator',
    icon: 'i-material-symbols-calculate-outline-rounded',
  },
  {
    label: 'VerseExkurs Editor',
    link: '/verse-exkurs-editor',
    icon: 'i-material-symbols-book-2-outline',
  },
  {
    label: 'Verwaltung',
    link: '/admin',
    icon: 'i-material-symbols-admin-panel-settings-outline',
  },
]
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-(--ui-primary)/10 bg-[rgb(10 10 15 / 0.9)]/90 backdrop-blur-sm lg:block"
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
        <AMSUiSidebarLink
          v-for="link in navlinks"
          :label="link.label"
          :link="link.link"
          :icon="link.icon"
        />
      </nav>
      <!-- Footer -->
      <div class="p-4">
        <div
          class="rounded-lg border border-(--ui-primary)/20 bg-[rgb(10 10 15)]/50 p-4 transition-all duration-300 hover:border-(--ui-primary)/30 hover:shadow-[0_0_10px_rgba(0,255,232,0.1)]"
        >
          <div class="flex flex-col space-y-3">
            <div class="flex items-center gap-3">
              <span
                class="relative flex shrink-0 overflow-hidden rounded-full h-12 w-12 border border-(--ui-primary)/20 ring-1 ring-(--ui-primary)/10"
                ><img
                  class="aspect-square h-full w-full"
                  alt="Thomas Blakeney"
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/military-lieutenant-vosQl5wOXAJ1icON8N1G8KRwLgBLC6.png"
              /></span>
              <div class="flex-1">
                <p class="text-sm font-medium text-white">Thomas Blakeney</p>
                <p class="text-xs text-(--ui-primary)">
                  Chief of Logistics Department
                </p>
              </div>
            </div>
            <button
              class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-transparent hover:border-(--ui-primary)/50 hover:shadow-[0_0_10px_rgba(0,255,232,0.15)] active:scale-95 h-9 rounded-md px-3 w-full border-(--ui-primary)/20 text-gray-300 hover:bg-(--ui-primary)/10 hover:text-(--ui-primary) transition-all duration-300"
            >
            <UIcon name="i-lucide-log-out" class="size-4 mr-2" />
              Logout
            </button>
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

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { DirectusRole } from '~~/types'

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)
const router = useRouter()
const mobileOpen = ref(false)

// ─── Types ────────────────────────────────────────────────────────────────────

interface separatorElement {
  type: 'separator'
  label: string
}

interface linkElement {
  type: 'link'
  label: string
  link: string
  icon: string
  exact: boolean
}

type sidebarElement = separatorElement | linkElement

// ─── Items ────────────────────────────────────────────────────────────────────

const sidebarItems = computed<sidebarElement[]>(() => {
  const userAccessLevel = (currentUser.value?.role as DirectusRole | undefined)?.access_level

  function linkVisible(link: string): boolean {
    const resolved = router.resolve(link)
    if (!resolved.matched.length) return false
    const pageAL = resolved.meta?.access_level as number | undefined
    if (pageAL === undefined) return true
    return typeof userAccessLevel === 'number' && userAccessLevel >= pageAL
  }

  const allItems: sidebarElement[] = [
    { type: 'separator', label: 'Mitglied' },
    { type: 'link', label: 'Dashboard', link: '/ams', icon: 'i-lucide-layout-grid', exact: true },
    { type: 'link', label: 'My Profile', link: '/ams/profile', icon: 'i-lucide-user', exact: false },
    { type: 'link', label: 'My Hangar', link: '/ams/hangar', icon: 'i-fluent-home-garage-24-regular', exact: false },
    { type: 'link', label: 'Comm-Link', link: '/ams/comm-link', icon: 'i-lucide-newspaper', exact: false },
    { type: 'link', label: 'Nachrichten', link: '/ams/messages', icon: 'i-lucide-message-square', exact: false },
    { type: 'separator', label: 'Organisation' },
    { type: 'link', label: 'Mitarbeiter', link: '/ams/employees', icon: 'i-lucide-users-round', exact: false },
    { type: 'link', label: 'Flotte', link: '/ams/fleet', icon: 'i-material-symbols-transportation-outline', exact: false },
    { type: 'link', label: 'Anteilsrechner', link: '/ams/calculator', icon: 'i-lucide-calculator', exact: false },
    { type: 'link', label: 'Kalender', link: '/ams/calendar', icon: 'i-lucide-calendar-range', exact: false },
    { type: 'link', label: 'Verwaltung', link: '/ams/admin', icon: 'i-lucide-shield-check', exact: false },
    { type: 'separator', label: 'Abteilungen' },
    { type: 'link', label: 'Logistics', link: '/ams/departments/logistics', icon: 'i-lucide-package', exact: false },
    { type: 'separator', label: 'Anderes' },
    { type: 'link', label: 'Toolbox', link: '/ams/toolbox', icon: 'i-lucide-tool-case', exact: false },
  ]

  return allItems.filter((item): boolean => {
    if (item.type === 'separator') return true
    return linkVisible(item.link)
  })
})
</script>

<template>
  <div>
    <!-- Mobile header -->
    <header
      class="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-(--ui-primary)/10 bg-(--ui-bg-muted)/95 px-4 backdrop-blur-sm lg:hidden"
    >
      <NuxtLink to="/" class="flex items-center gap-2">
        <div class="rounded bg-(--ui-primary)/20 p-1 transition-all duration-300 hover:bg-(--ui-primary)/30 hover:shadow-[0_0_10px_rgba(0,255,232,0.3)]">
          <UIcon name="i-lucide-rocket" class="h-6 w-6 text-(--ui-primary)" />
        </div>
        <span class="text-xl font-bold tracking-wider text-white">
          ArisCorp<span class="text-(--ui-primary)"> AMS</span>
        </span>
      </NuxtLink>
      <UButton @click="mobileOpen = true" variant="ghost" icon="i-lucide-menu" class="size-fit" />
    </header>

    <!-- Mobile overlay -->
    <div
      v-if="mobileOpen"
      @click="mobileOpen = false"
      class="fixed inset-0 z-50 bg-(--ui-bg-muted)/50 backdrop-blur-xs lg:hidden"
    >
      <div
        class="fixed inset-y-0 left-0 z-50 w-64 border-r border-(--ui-primary)/10 bg-(--ui-bg-muted)"
        @click.stop
      >
        <div class="flex h-full flex-col">
          <div class="flex h-16 items-center px-4">
            <NuxtLink to="/ams" class="flex items-center gap-2">
              <span class="text-xl font-bold tracking-wider text-white">ArisCorp</span>
              <span class="text-(--ui-primary) ml-2">AMS</span>
            </NuxtLink>
          </div>
          <div class="shrink-0 h-[1px] w-full bg-(--ui-primary)/10" />
          <nav class="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            <template v-for="item in sidebarItems" :key="item.type === 'link' ? item.link : item.label">
              <USeparator v-if="item.type === 'separator'" color="ams" :label="item.label" class="mt-8 first:mt-0" />
              <AMSUiSidebarLink v-else-if="item.type === 'link'" :label="item.label" :link="item.link" :icon="item.icon" :exact="item.exact" @click="mobileOpen = false" />
            </template>
          </nav>
          <!-- Footer -->
          <div class="p-4">
            <div class="rounded-lg border border-(--ui-primary)/20 bg-(--ui-bg-muted)/50 p-4">
              <div class="flex flex-col space-y-3">
                <div class="flex items-center gap-3 prose-img:my-0">
                  <div class="flex shrink-0 overflow-hidden rounded-full h-12 w-12 border border-(--ui-primary)/20 ring-1 ring-(--ui-primary)/10">
                    <NuxtImg class="size-full object-cover" :src="getAssetId(currentUser?.avatar) ?? '88adb941-f746-405d-bcc4-c2804fb48e33'" />
                  </div>
                  <div class="flex-1 not-prose min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ getUserLabel(currentUser) }}</p>
                    <p v-if="currentUser?.primary_department" class="text-xs text-(--ui-primary) truncate">
                      {{ currentUser.head_of_department ? 'Chief of ' : '' }}{{ (currentUser.primary_department as any)?.name }} Department
                    </p>
                  </div>
                </div>
                <UButton @click="authStore.logoutAndRedirect()" variant="outline" icon="i-lucide-log-out" class="h-9 px-3 text-sm text-gray-300 hover:text-(--ui-primary) flex justify-center">
                  Logout
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop sidebar -->
    <aside class="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-(--ui-primary)/10 bg-(--ui-bg-muted)/90 backdrop-blur-xs lg:block">
      <div class="flex h-full flex-col">
        <div class="flex h-16 items-center px-4">
          <NuxtLink to="/ams" class="flex items-center gap-2 transition-all duration-300 hover:scale-105">
            <span class="text-xl font-bold tracking-wider text-white">ArisCorp</span>
            <span class="text-(--ui-primary) ml-2">AMS</span>
          </NuxtLink>
        </div>
        <div class="shrink-0 h-[1px] w-full bg-(--ui-primary)/10" />
        <nav class="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          <template v-for="item in sidebarItems" :key="item.type === 'link' ? item.link : item.label">
            <USeparator v-if="item.type === 'separator'" color="ams" :label="item.label" class="mt-8 first:mt-0" />
            <AMSUiSidebarLink v-else-if="item.type === 'link'" :label="item.label" :link="item.link" :icon="item.icon" :exact="item.exact" />
          </template>
        </nav>
        <!-- Footer -->
        <div class="p-4">
          <div class="rounded-lg border border-(--ui-primary)/20 bg-(--ui-bg-muted)/50 p-4 transition-all duration-300 hover:border-(--ui-primary)/30 hover:shadow-primary-xs">
            <div class="flex flex-col space-y-3">
              <div class="flex items-center gap-3 prose-img:my-0">
                <div class="flex shrink-0 overflow-hidden rounded-full h-12 w-12 border border-(--ui-primary)/20 ring-1 ring-(--ui-primary)/10">
                  <NuxtImg class="size-full object-cover" :src="getAssetId(currentUser?.avatar) ?? '88adb941-f746-405d-bcc4-c2804fb48e33'" />
                </div>
                <div class="flex-1 not-prose min-w-0">
                  <p class="text-sm font-medium text-white truncate">{{ getUserLabel(currentUser) }}</p>
                  <p v-if="currentUser?.primary_department" class="text-xs text-(--ui-primary) truncate">
                    {{ currentUser.head_of_department ? 'Chief of ' : '' }}{{ (currentUser.primary_department as any)?.name }} Department
                  </p>
                </div>
              </div>
              <div class="flex w-full gap-x-2">
                <UTooltip text="Zurück zur Homepage">
                  <UButton to="https://ariscorp.de" variant="outline" icon="i-lucide-house" size="lg" class="text-gray-300" />
                </UTooltip>
                <UButton @click="authStore.logoutAndRedirect()" variant="outline" icon="i-lucide-log-out" class="h-9 px-3 text-sm text-gray-300 hover:text-(--ui-primary) flex-1 flex justify-center">
                  Logout
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style>
.button-pulse {
  @apply relative overflow-hidden after:rounded-[inherit] after:opacity-0 after:bg-[#00ffe81a] after:transition-opacity after:duration-300 after:absolute;
}
</style>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth' // Pfad ggf. anpassen
import type { DirectusRole } from '~~/types'
const authStore = useAuthStore()

const { currentUser } = storeToRefs(authStore)

const router = useRouter()

const mobileOpen = ref(false)

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

const sidebarItems = computed<sidebarElement[]>(() => {
  const items: sidebarElement[] = [
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
      exact: false,
      type: 'link',
    },
    {
      label: 'Anteilsrechner',
      link: '/ams/calculator',
      icon: 'i-lucide-calculator',
      exact: false,
      type: 'link',
    },
    // {
    //   label: 'VerseExkurs Editor',
    //   link: '/ams/verse-exkurs-editor',
    //   icon: 'i-lucide-book-text',
    //   exact: false,
    //   type: 'link',
    // },
    {
      label: 'Verwaltung',
      link: '/ams/admin',
      icon: 'i-lucide-shield-check',
      exact: false,
      type: 'link',
    },
    {
      label: 'Anderes',
      type: 'separator',
    },
    {
      label: 'Toolbox',
      link: '/ams/toolbox',
      icon: 'i-lucide-tool-case',
      exact: false,
      type: 'link',
    },
  ]

  return items.filter((item: sidebarElement): boolean => {
    if (item.type === 'separator') {
      return true // Separatoren immer anzeigen
    }

    // Ab hier ist item.type === 'link'
    const resolvedRoute = router.resolve(item.link)

    // 1. Die Route muss existieren und auflösbar sein
    if (!resolvedRoute.matched.length) {
      return false
    }

    const pageAccessLevel = resolvedRoute.meta?.access_level as
      | number
      | undefined

    // 2. Wenn die Seite keine spezifische Zugriffsebene erfordert, anzeigen
    if (pageAccessLevel === undefined) {
      return true
    }

    // 3. Die Seite erfordert eine spezifische Zugriffsebene.
    //    Benutzer muss eine Rolle und eine ausreichende Zugriffsebene haben.
    const userAccessLevel = (
      currentUser.value?.role as DirectusRole | undefined
    )?.access_level

    // Prüfen, ob userAccessLevel eine Zahl ist und größer/gleich der pageAccessLevel
    return (
      typeof userAccessLevel === 'number' && userAccessLevel >= pageAccessLevel
    )
  })
})
</script>

<template>
  <div>
    <header
      class="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-(--ui-primary)/10 bg-(--ui-bg-muted)/95 px-4 backdrop-blur-sm lg:hidden"
    >
      <NuxtLink to="/" class="flex items-center gap-2">
        <div
          class="rounded bg-(--ui-primary)/20 p-1 transition-all duration-300 hover:bg-(--ui-primary)/30 hover:shadow-[0_0_10px_rgba(0,255,232,0.3)]"
        >
          <!-- TODO: ARISCORP LOGO -->
          <UIcon name="i-lucide-rocket" class="h-6 w-6 text-(--ui-primary)" />
        </div>
        <span class="text-xl font-bold tracking-wider text-white">
          ArisCorp<span class="text-(--ui-primary)"> AMS</span>
        </span>
      </NuxtLink>
      <UButton
        @click="mobileOpen = true"
        variant="ghost"
        icon="i-lucide-menu"
        class="size-fit transition-all duration-300"
      />
    </header>
    <div
      v-if="mobileOpen"
      @click="mobileOpen = false"
      class="fixed inset-0 z-50 bg-(--ui-bg-muted)/50 backdrop-blur-xs lg:hidden"
    >
      <div
        class="fixed inset-y-0 left-0 z-50 w-64 border-r border-(--ui-primary)/10 bg-(--ui-bg-muted) lg:hidden"
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
                class="mt-8 first:mt-0"
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
                      :src="
                        getAssetId(currentUser?.avatar) ??
                        '88adb941-f746-405d-bcc4-c2804fb48e33'
                      "
                    />
                  </div>
                  <div class="flex-1 not-prose">
                    <p class="text-sm font-medium text-white">
                      {{ getUserLabel(currentUser) }}
                    </p>
                    <!-- TODO: ADD DEPARTMENT OR HEAD OF DEPARTMENT LABEL -->
                    <p
                      v-if="currentUser?.primary_department"
                      class="text-xs text-(--ui-primary)"
                    >
                      {{ currentUser.head_of_department ? 'Chief of ' : ''
                      }}{{ currentUser.primary_department?.name }} Department
                    </p>
                  </div>
                </div>
                <UButton
                  @click="authStore.logoutAndRedirect()"
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
      </div>
    </div>
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
              class="mt-8 first:mt-0"
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
                    :src="
                      getAssetId(currentUser?.avatar) ??
                      '88adb941-f746-405d-bcc4-c2804fb48e33'
                    "
                  />
                </div>
                <div class="flex-1 not-prose">
                  <p class="text-sm font-medium text-white">
                    {{ getUserLabel(currentUser) }}
                  </p>
                  <!-- TODO: ADD DEPARTMENT OR HEAD OF DEPARTMENT LABEL -->
                  <p
                    v-if="currentUser?.primary_department"
                    class="text-xs text-(--ui-primary)"
                  >
                    {{ currentUser.head_of_department ? 'Chief of ' : ''
                    }}{{ currentUser.primary_department?.name }} Department
                  </p>
                </div>
              </div>
              <div class="flex w-full gap-x-2">
                <UTooltip text="Zurück zur Homepage">
                  <UButton
                    to="https://ariscorp.de"
                    variant="outline"
                    icon="i-lucide-house"
                    size="lg"
                    class="text-gray-300"
                  />
                </UTooltip>
                <UButton
                  @click="authStore.logoutAndRedirect()"
                  variant="outline"
                  icon="i-lucide-log-out"
                  class="h-9 px-3 text-sm text-gray-300 hover:text-(--ui-primary) flex-1 flex justify-center"
                >
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
/*  after:ease-in-out */
.button-pulse {
  @apply relative overflow-hidden after:rounded-[inherit] after:opacity-0 after:bg-[#00ffe81a] after:transition-opacity after:duration-300 after:absolute;
}
</style>

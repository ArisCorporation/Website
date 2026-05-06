<script setup lang="ts">
import { deleteItem, updateItem } from '@directus/sdk'

const route = useRoute()
const { data: mission, refresh } = await useFetchAMSMission(route.params.id as string)

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)
const toast = useToast()

const isPlanner = computed(
  () =>
    mission.value?.user_created?.id === currentUser.value?.id ||
    ((currentUser.value?.role as any)?.access_level ?? 0) >= 3,
)

const myRegistration = computed(() =>
  mission.value?.registrations?.find((r: any) => r.user?.id === currentUser.value?.id),
)

const signupModalOpen = ref(false)
const signupTarget = ref<{
  type: 'flex' | 'flex_team' | 'position'
  team?: any
  position?: any
} | null>(null)

function openSignup(type: 'flex' | 'flex_team' | 'position', team?: any, position?: any) {
  signupTarget.value = { type, team, position }
  signupModalOpen.value = true
}

async function unregister() {
  const reg = myRegistration.value
  if (!reg) return
  try {
    if (reg.type === 'position' && reg.position?.id) {
      await useDirectus(
        updateItem('ams_mission_positions' as any, reg.position.id, { status: 'open', assigned_user: null }),
      )
    }
    await useDirectus(deleteItem('ams_mission_registrations' as any, reg.id))
    toast.add({ title: 'Abgemeldet', color: 'success', icon: 'i-lucide-user-minus' })
    await refresh()
  } catch {
    toast.add({ title: 'Fehler', color: 'error', icon: 'i-lucide-alert-triangle' })
  }
}

async function setTentative() {
  const reg = myRegistration.value
  if (!reg) return
  try {
    await useDirectus(updateItem('ams_mission_registrations' as any, reg.id, { status: 'tentative' }))
    toast.add({ title: 'Unter Vorbehalt gesetzt', color: 'success', icon: 'i-lucide-clock' })
    await refresh()
  } catch {
    toast.add({ title: 'Fehler', color: 'error', icon: 'i-lucide-alert-triangle' })
  }
}

async function updateRegistrationStatus(id: string, status: 'approved' | 'rejected') {
  try {
    await useDirectus(updateItem('ams_mission_registrations' as any, id, { status }))

    const reg = mission.value?.registrations?.find((r: any) => r.id === id)
    if (status === 'approved' && reg?.position?.id) {
      await useDirectus(
        updateItem('ams_mission_positions' as any, reg.position.id, {
          status: 'filled',
          assigned_user: reg.user?.id,
        }),
      )
    } else if (status === 'rejected' && reg?.position?.id) {
      await useDirectus(
        updateItem('ams_mission_positions' as any, reg.position.id, { status: 'open' }),
      )
    }

    toast.add({
      title: status === 'approved' ? 'Genehmigt' : 'Abgelehnt',
      color: status === 'approved' ? 'success' : 'error',
      icon: status === 'approved' ? 'i-lucide-check' : 'i-lucide-x',
    })
    await refresh()
  } catch {
    toast.add({ title: 'Fehler', color: 'error', icon: 'i-lucide-alert-triangle' })
  }
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  mining: { label: 'Bergbau', icon: 'i-lucide-pickaxe', color: 'text-yellow-400' },
  combat: { label: 'Kampf', icon: 'i-lucide-sword', color: 'text-red-400' },
  cargo: { label: 'Fracht', icon: 'i-lucide-package', color: 'text-blue-400' },
  exploration: { label: 'Erkundung', icon: 'i-lucide-telescope', color: 'text-purple-400' },
  rescue: { label: 'Rettung', icon: 'i-lucide-heart-pulse', color: 'text-green-400' },
  patrol: { label: 'Patrouille', icon: 'i-lucide-shield', color: 'text-orange-400' },
  event: { label: 'Event', icon: 'i-lucide-star', color: 'text-pink-400' },
  other: { label: 'Sonstiges', icon: 'i-lucide-circle-dot', color: 'text-gray-400' },
}

const ROLE_LABELS: Record<string, string> = {
  pilot: 'Pilot', co_pilot: 'Co-Pilot', mining_operator: 'Mining Operator',
  cargo_operator: 'Cargo Operator', turret_operator: 'Turret Operator',
  engineer: 'Ingenieur', medic: 'Medic', scout: 'Aufklärer',
  passenger: 'Passagier', other: 'Sonstiges',
}

const typeConf = computed(() => TYPE_CONFIG[mission.value?.mission_type] ?? TYPE_CONFIG.other)

const formattedDate = computed(() => {
  if (!mission.value?.planned_date) return 'Datum offen'
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(mission.value.planned_date))
})

const myRegStatusColor = computed(() => {
  if (!myRegistration.value) return 'neutral'
  const s = myRegistration.value.status
  if (s === 'approved') return 'success'
  if (s === 'rejected') return 'error'
  if (s === 'tentative') return 'info'
  return 'warning'
})

const myRegStatusLabel = computed(() => {
  if (!myRegistration.value) return ''
  const s = myRegistration.value.status
  if (s === 'approved') return 'Angenommen'
  if (s === 'rejected') return 'Abgelehnt'
  if (s === 'tentative') return 'Unter Vorbehalt'
  return 'Ausstehend'
})

const myRegTypeLabel = computed(() => {
  const r = myRegistration.value
  if (!r) return ''
  if (r.type === 'flex') return 'Flex-Anmeldung (gesamte Mission)'
  if (r.type === 'flex_team') return `Flex in Team: ${r.team?.name}`
  return `Position: ${ROLE_LABELS[r.position?.role] ?? r.position?.role}`
})

const pendingRegistrations = computed(() =>
  (mission.value?.registrations ?? []).filter((r: any) => r.status === 'pending'),
)

const regStatusLabel: Record<string, string> = {
  pending: 'Ausstehend',
  approved: 'OK',
  tentative: 'Vorbehalt',
  rejected: 'Abgelehnt',
}

const regStatusColor: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  tentative: 'info',
  rejected: 'error',
}

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div v-if="mission">
    <AMSPageHeader
      :icon="typeConf.icon"
      :title="mission.title"
      :description="`${typeConf.label} &bull; ${formattedDate}`"
    >
      <UButton
        v-if="isPlanner"
        :to="`/ams/missions/create?edit=${mission.id}`"
        icon="i-lucide-pencil"
        variant="outline"
        label="Bearbeiten"
      />
    </AMSPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div
          v-if="mission.description"
          class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 p-5 prose prose-invert max-w-none text-sm"
          v-html="mission.description"
        />

        <AMSPagesMissionsTeamView
          :teams="mission.teams"
          :my-registration="myRegistration"
          :is-planner="isPlanner"
          :mission-status="mission.status"
          @signup-flex-team="(team) => openSignup('flex_team', team)"
          @signup-position="(team, pos) => openSignup('position', team, pos)"
          @refresh="refresh"
        />
      </div>

      <div class="space-y-4">
        <div class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 p-5 space-y-3">
          <h3 class="text-xs font-semibold text-(--ui-primary) uppercase tracking-wider">
            Mission Info
          </h3>
          <div class="flex items-center gap-2 text-sm">
            <UIcon name="i-lucide-user" class="h-4 w-4 text-(--ui-primary)/60 shrink-0" />
            <span class="text-(--ui-muted-foreground) shrink-0">Planner:</span>
            <span class="text-white truncate">
              {{ mission.user_created?.first_name }} {{ mission.user_created?.last_name }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <UIcon name="i-lucide-users" class="h-4 w-4 text-(--ui-primary)/60 shrink-0" />
            <span class="text-(--ui-muted-foreground) shrink-0">Anmeldungen:</span>
            <span class="text-white">
              {{ mission.registrations?.length ?? 0
              }}{{ mission.max_members ? ` / ${mission.max_members}` : '' }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <UIcon name="i-lucide-layers" class="h-4 w-4 text-(--ui-primary)/60 shrink-0" />
            <span class="text-(--ui-muted-foreground) shrink-0">Teams:</span>
            <span class="text-white">{{ mission.teams?.length ?? 0 }}</span>
          </div>
          <div v-if="(mission as any).location" class="flex items-start gap-2 text-sm">
            <UIcon name="i-lucide-map-pin" class="h-4 w-4 text-(--ui-primary)/60 shrink-0 mt-0.5" />
            <div>
              <span class="text-(--ui-muted-foreground) block text-xs">Treffpunkt</span>
              <span class="text-white">{{ (mission as any).location }}</span>
            </div>
          </div>
          <div v-if="(mission as any).start_location" class="flex items-start gap-2 text-sm">
            <UIcon name="i-lucide-navigation" class="h-4 w-4 text-(--ui-primary)/60 shrink-0 mt-0.5" />
            <div>
              <span class="text-(--ui-muted-foreground) block text-xs">Startort</span>
              <span class="text-white">{{ (mission as any).start_location }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 p-5">
          <h3 class="text-xs font-semibold text-(--ui-primary) uppercase tracking-wider mb-3">
            Mein Status
          </h3>
          <div v-if="myRegistration" class="space-y-3">
            <div class="flex items-center gap-2">
              <UBadge :color="(myRegStatusColor as any)" variant="subtle" size="lg">
                {{ myRegStatusLabel }}
              </UBadge>
            </div>
            <p class="text-xs text-(--ui-muted-foreground)">{{ myRegTypeLabel }}</p>
            <p v-if="myRegistration.note" class="text-xs text-(--ui-muted-foreground) italic border-t border-(--ui-primary)/10 pt-2">
              "{{ myRegistration.note }}"
            </p>
            <div v-if="mission.status === 'active' && myRegistration.status !== 'rejected'" class="flex flex-col gap-2 pt-1 border-t border-(--ui-primary)/10">
              <UButton
                v-if="myRegistration.status !== 'tentative'"
                size="xs"
                color="warning"
                variant="outline"
                icon="i-lucide-clock"
                label="Unter Vorbehalt"
                class="w-full justify-center"
                @click="setTentative"
              />
              <UButton
                size="xs"
                color="error"
                variant="outline"
                icon="i-lucide-user-minus"
                label="Abmelden"
                class="w-full justify-center"
                @click="unregister"
              />
            </div>
          </div>
          <div v-else-if="mission.status === 'active'" class="space-y-3">
            <p class="text-sm text-(--ui-muted-foreground)">
              Du bist noch nicht angemeldet.
            </p>
            <UButton
              icon="i-lucide-user-plus"
              label="Flex anmelden"
              variant="outline"
              class="w-full justify-center"
              @click="openSignup('flex')"
            />
          </div>
          <p v-else class="text-sm text-(--ui-muted-foreground)">
            Anmeldung derzeit nicht möglich.
          </p>
        </div>

        <div
          v-if="isPlanner && mission.registrations?.length"
          class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 p-5"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-(--ui-primary) uppercase tracking-wider">
              Anmeldungen
            </h3>
            <UBadge v-if="pendingRegistrations.length" color="warning" variant="subtle" size="xs">
              {{ pendingRegistrations.length }} ausstehend
            </UBadge>
          </div>

          <div class="space-y-2">
            <div
              v-for="reg in mission.registrations"
              :key="reg.id"
              class="flex items-center justify-between gap-2 py-2 border-b border-(--ui-primary)/10 last:border-0"
            >
              <div class="flex items-center gap-2 min-w-0">
                <NuxtImg
                  class="h-7 w-7 rounded-full object-cover shrink-0"
                  :src="getAssetId(reg.user?.avatar) ?? '88adb941-f746-405d-bcc4-c2804fb48e33'"
                  :alt="getUserLabel(reg.user)"
                />
                <div class="min-w-0">
                  <p class="text-xs font-medium text-white truncate">
                    {{ getUserLabel(reg.user) }}
                  </p>
                  <p class="text-xs text-(--ui-muted-foreground)">
                    {{
                      reg.type === 'flex'
                        ? 'Flex'
                        : reg.type === 'flex_team'
                          ? `Flex – ${reg.team?.name}`
                          : `${ROLE_LABELS[reg.position?.role] ?? reg.position?.role}`
                    }}
                  </p>
                </div>
              </div>

              <div v-if="reg.status === 'pending'" class="flex gap-1 shrink-0">
                <UTooltip text="Genehmigen">
                  <UButton
                    size="xs"
                    color="success"
                    variant="ghost"
                    icon="i-lucide-check"
                    @click="updateRegistrationStatus(reg.id, 'approved')"
                  />
                </UTooltip>
                <UTooltip text="Ablehnen">
                  <UButton
                    size="xs"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-x"
                    @click="updateRegistrationStatus(reg.id, 'rejected')"
                  />
                </UTooltip>
              </div>
              <UBadge
                v-else
                :color="(regStatusColor[reg.status] ?? 'neutral') as any"
                variant="subtle"
                size="xs"
              >
                {{ regStatusColor[reg.status] ? regStatusLabel[reg.status] : reg.status }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AMSPagesMissionsSignupModal
      v-model:open="signupModalOpen"
      :mission-id="mission.id"
      :target="signupTarget"
      @registered="refresh"
    />
  </div>

  <div v-else class="flex items-center justify-center py-24">
    <div class="text-center">
      <UIcon name="i-lucide-alert-circle" class="h-12 w-12 text-(--ui-muted-foreground) mx-auto mb-3" />
      <p class="text-(--ui-muted-foreground)">Mission nicht gefunden.</p>
      <UButton to="/ams/missions" variant="ghost" icon="i-lucide-arrow-left" label="Zurück" class="mt-4" />
    </div>
  </div>
</template>

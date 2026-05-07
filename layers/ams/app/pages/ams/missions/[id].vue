<script setup lang="ts">
import { createItem, deleteItem, updateItem } from '@directus/sdk'

const route = useRoute()
const { data: mission, refresh } = await useFetchAMSMission(route.params.id as string)

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)
const toast = useToast()
const currentTimestamp = ref(Date.now())
let currentTimestampInterval: ReturnType<typeof setInterval> | null = null

const isPlanner = computed(
  () =>
    mission.value?.user_created?.id === currentUser.value?.id ||
    ((currentUser.value?.role as any)?.access_level ?? 0) >= 3,
)

const myRegistration = computed(() =>
  mission.value?.registrations?.find((r: any) => r.user?.id === currentUser.value?.id),
)

const shareToDiscordLoading = ref(false)
const signupModalOpen = ref(false)
const signupTarget = ref<{
  type: 'flex' | 'flex_team' | 'position'
  team?: any
  position?: any
} | null>(null)

async function shareToDiscord() {
  if (!mission.value || shareToDiscordLoading.value) return

  shareToDiscordLoading.value = true
  try {
    const result = await $fetch<{ message?: string }>(`/api/ams/missions/${mission.value.id}/share-discord`, {
      method: 'POST',
    })

    toast.add({
      title: 'Auf Discord geteilt',
      description: result.message || 'Das Event wurde erfolgreich auf Discord geteilt.',
      color: 'success',
      icon: 'i-lucide-send',
    })
  } catch (error: any) {
    toast.add({
      title: 'Discord Share fehlgeschlagen',
      description: error?.data?.statusMessage || 'Das Event konnte nicht auf Discord geteilt werden.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    shareToDiscordLoading.value = false
  }
}

async function syncDiscordShare(silent = true) {
  if (!mission.value) return

  try {
    await $fetch(`/api/ams/missions/${mission.value.id}/sync-discord`, {
      method: 'POST',
    })
  } catch (error: any) {
    console.error('Discord mission sync failed', error)

    if (!silent) {
      toast.add({
        title: 'Discord-Embed nicht aktualisiert',
        description: error?.data?.statusMessage || 'Die bestehende Discord-Nachricht konnte nicht aktualisiert werden.',
        color: 'warning',
        icon: 'i-lucide-alert-triangle',
      })
    }
  }
}

async function handleMissionSignupRegistered() {
  await syncDiscordShare()
  await refresh()
}

function openSignup(type: 'flex' | 'flex_team' | 'position', team?: any, position?: any) {
  if (!missionCanRegister.value) {
    toast.add({
      title: missionHasStarted.value ? 'Mission läuft bereits' : 'Anmeldung geschlossen',
      description: signupClosedMessage.value,
      color: 'warning',
      icon: 'i-lucide-ban',
    })
    return
  }

  signupTarget.value = { type, team, position }
  signupModalOpen.value = true
}

async function signupTentative() {
  if (!currentUser.value || !mission.value) return
  if (!missionCanRegister.value) {
    toast.add({
      title: missionHasStarted.value ? 'Mission läuft bereits' : 'Anmeldung geschlossen',
      description: signupClosedMessage.value,
      color: 'warning',
      icon: 'i-lucide-ban',
    })
    return
  }

  try {
    await useDirectus(
      createItem('ams_mission_registrations' as any, {
        mission: mission.value.id,
        user: currentUser.value.id,
        type: 'flex',
        team: null,
        position: null,
        status: 'tentative',
        note: null,
      }),
    )
    toast.add({ title: 'Unter Vorbehalt angemeldet', color: 'success', icon: 'i-lucide-clock' })
    await syncDiscordShare()
    await refresh()
  } catch {
    toast.add({ title: 'Fehler', color: 'error', icon: 'i-lucide-alert-triangle' })
  }
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
    await syncDiscordShare()
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
    await syncDiscordShare()
    await refresh()
  } catch {
    toast.add({ title: 'Fehler', color: 'error', icon: 'i-lucide-alert-triangle' })
  }
}

function findMissionPosition(positionId?: string) {
  if (!positionId) return null
  return (mission.value?.teams ?? [])
    .flatMap((team: any) => team.ships ?? [])
    .flatMap((ship: any) => ship.positions ?? [])
    .find((position: any) => position.id === positionId) ?? null
}

function getRegistrationTypeLabel(reg: any) {
  if (reg.type === 'flex') return 'Flex-Anmeldung'
  if (reg.type === 'flex_team') return `Flex – ${reg.team?.name}`
  return ROLE_LABELS[reg.position?.role] ?? reg.position?.role
}

function canResetRejectedRegistration(reg: any) {
  if (reg.status !== 'rejected') return false
  if (!reg.position?.id) return true

  const position = findMissionPosition(reg.position.id)
  return position?.status === 'open'
}

function getRejectedResetHint(reg: any) {
  if (!reg.position?.id) return 'Anfrage wieder auf ausstehend setzen'

  const position = findMissionPosition(reg.position.id)

  if (!position) return 'Position nicht gefunden'
  if (position.status !== 'open') {
    return 'Die Position ist inzwischen wieder vergeben oder bereits erneut angefragt.'
  }

  return 'Anfrage wieder auf ausstehend setzen'
}

async function updateRegistrationStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
  const reg = mission.value?.registrations?.find((item: any) => item.id === id)
  if (!reg) return

  if (status === 'pending' && reg.position?.id && !canResetRejectedRegistration(reg)) {
    toast.add({
      title: 'Widerruf nicht möglich',
      description: getRejectedResetHint(reg),
      color: 'warning',
      icon: 'i-lucide-rotate-ccw',
    })
    return
  }

  try {
    await useDirectus(updateItem('ams_mission_registrations' as any, id, { status }))

    if (status === 'approved' && reg?.position?.id) {
      await useDirectus(
        updateItem('ams_mission_positions' as any, reg.position.id, {
          status: 'filled',
          assigned_user: reg.user?.id,
        }),
      )
    } else if (status === 'rejected' && reg?.position?.id) {
      await useDirectus(
        updateItem('ams_mission_positions' as any, reg.position.id, {
          status: 'open',
          assigned_user: null,
        }),
      )
    } else if (status === 'pending' && reg?.position?.id) {
      await useDirectus(
        updateItem('ams_mission_positions' as any, reg.position.id, {
          status: 'pending',
          assigned_user: null,
        }),
      )
    }

    const statusFeedback = {
      approved: {
        title: 'Genehmigt',
        description: 'Die Anmeldung ist bestätigt.',
        color: 'success',
        icon: 'i-lucide-check',
      },
      rejected: {
        title: 'Abgelehnt',
        description: 'Die Anmeldung wurde abgelehnt.',
        color: 'error',
        icon: 'i-lucide-x',
      },
      pending: {
        title: 'Wieder geöffnet',
        description: 'Die Anmeldung ist wieder ausstehend.',
        color: 'warning',
        icon: 'i-lucide-rotate-ccw',
      },
    } as const

    toast.add({
      title: statusFeedback[status].title,
      description: statusFeedback[status].description,
      color: statusFeedback[status].color as any,
      icon: statusFeedback[status].icon,
    })
    await syncDiscordShare()
    await refresh()
  } catch {
    toast.add({ title: 'Fehler', color: 'error', icon: 'i-lucide-alert-triangle' })
  }
}

const DEFAULT_TYPE_CONFIG = { label: 'Sonstiges', icon: 'i-lucide-circle-dot', color: 'text-gray-400' }

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  mining: { label: 'Bergbau', icon: 'i-lucide-pickaxe', color: 'text-yellow-400' },
  combat: { label: 'Kampf', icon: 'i-lucide-sword', color: 'text-red-400' },
  cargo: { label: 'Fracht', icon: 'i-lucide-package', color: 'text-blue-400' },
  exploration: { label: 'Erkundung', icon: 'i-lucide-telescope', color: 'text-purple-400' },
  rescue: { label: 'Rettung', icon: 'i-lucide-heart-pulse', color: 'text-green-400' },
  patrol: { label: 'Patrouille', icon: 'i-lucide-shield', color: 'text-orange-400' },
  event: { label: 'Event', icon: 'i-lucide-star', color: 'text-pink-400' },
  other: DEFAULT_TYPE_CONFIG,
}

const ROLE_LABELS: Record<string, string> = {
  pilot: 'Pilot', co_pilot: 'Co-Pilot', mining_operator: 'Mining Operator',
  cargo_operator: 'Cargo Operator', turret_operator: 'Turret Operator',
  engineer: 'Ingenieur', medic: 'Medic', scout: 'Aufklärer',
  passenger: 'Passagier', other: 'Sonstiges',
}

const typeConf = computed((): { label: string, icon: string, color: string } => {
  const missionType = mission.value?.mission_type as keyof typeof TYPE_CONFIG | undefined
  return (missionType && TYPE_CONFIG[missionType]) || DEFAULT_TYPE_CONFIG
})

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

const approvedRegistrationsCount = computed(() =>
  (mission.value?.registrations ?? []).filter((r: any) => r.status === 'approved').length,
)

const tentativeRegistrationsCount = computed(() =>
  (mission.value?.registrations ?? []).filter((r: any) => r.status === 'tentative').length,
)

const rejectedRegistrationsCount = computed(() =>
  (mission.value?.registrations ?? []).filter((r: any) => r.status === 'rejected').length,
)

const DEFAULT_STATUS_CONFIG = { label: 'Entwurf', color: 'neutral' }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: DEFAULT_STATUS_CONFIG,
  active: { label: 'Aktiv', color: 'success' },
  cancelled: { label: 'Abgebrochen', color: 'error' },
  completed: { label: 'Abgeschlossen', color: 'info' },
  archived: { label: 'Archiviert', color: 'neutral' },
}

const statusConf = computed((): { label: string, color: string } => {
  const missionStatus = mission.value?.status as keyof typeof STATUS_CONFIG | undefined
  return (missionStatus && STATUS_CONFIG[missionStatus]) || DEFAULT_STATUS_CONFIG
})

const openPositionsCount = computed(() =>
  (mission.value?.teams ?? [])
    .flatMap((t: any) => t.ships ?? [])
    .flatMap((s: any) => s.positions ?? [])
    .filter((p: any) => p.status === 'open').length,
)

const allPositions = computed(() =>
  (mission.value?.teams ?? [])
    .flatMap((team: any) => team.ships ?? [])
    .flatMap((ship: any) => ship.positions ?? []),
)

const filledPositionsCount = computed(() =>
  allPositions.value.filter((position: any) => position.status === 'filled').length,
)

const pendingPositionsCount = computed(() =>
  allPositions.value.filter((position: any) => position.status === 'pending').length,
)

const teamCount = computed(() => mission.value?.teams?.length ?? 0)
const registrationCount = computed(() => mission.value?.registrations?.length ?? 0)

const missionStartTimestamp = computed(() => {
  if (!mission.value?.planned_date) return null

  const parsedDate = new Date(mission.value.planned_date).getTime()
  return Number.isFinite(parsedDate) ? parsedDate : null
})

const missionHasStarted = computed(() => {
  if (missionStartTimestamp.value === null) return false
  return missionStartTimestamp.value <= currentTimestamp.value
})

const missionCanRegister = computed(() => mission.value?.status === 'active' && !missionHasStarted.value)

const canManageOwnRegistration = computed(() => mission.value?.status === 'active')

const signupClosedMessage = computed(() => {
  if (missionHasStarted.value) {
    return 'Die Mission läuft bereits. Neue Anmeldungen sind nicht mehr möglich.'
  }

  return 'Anmeldung derzeit nicht möglich.'
})

const missionPlannerLabel = computed(() => {
  if (!mission.value?.user_created) return 'Unbekannt'
  return getUserLabel(mission.value.user_created)
})

const participationStateLabel = computed(() => {
  if (myRegistration.value) return myRegStatusLabel.value
  if (missionHasStarted.value) return 'Mission läuft'
  return missionCanRegister.value ? 'Anmeldung offen' : 'Anmeldung geschlossen'
})

const participationStateColor = computed(() => {
  if (myRegistration.value) return myRegStatusColor.value
  if (missionHasStarted.value) return 'warning'
  return missionCanRegister.value ? 'success' : 'neutral'
})

const sortedRegistrations = computed(() => {
  const statusOrder: Record<string, number> = {
    pending: 0,
    approved: 1,
    tentative: 2,
    rejected: 3,
  }

  return [...(mission.value?.registrations ?? [])].sort((a: any, b: any) => {
    const statusDelta = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
    if (statusDelta !== 0) return statusDelta

    return getUserLabel(a.user).localeCompare(getUserLabel(b.user), 'de')
  })
})

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

onMounted(() => {
  currentTimestampInterval = setInterval(() => {
    currentTimestamp.value = Date.now()
  }, 15000)
})

onBeforeUnmount(() => {
  if (!currentTimestampInterval) return
  clearInterval(currentTimestampInterval)
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
        :loading="shareToDiscordLoading"
        icon="i-lucide-send"
        variant="outline"
        label="Discord teilen"
        @click="shareToDiscord"
      />
      <UButton
        v-if="isPlanner"
        :to="`/ams/missions/create?edit=${mission.id}`"
        icon="i-lucide-pencil"
        variant="outline"
        label="Bearbeiten"
      />
    </AMSPageHeader>

    <div class="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,20rem)]">
      <div class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 p-4 ring-1 ring-inset ring-white/5">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge :color="(statusConf.color as any)" variant="subtle" size="sm">
            {{ statusConf.label }}
          </UBadge>
          <UBadge color="primary" variant="soft" size="sm">
            {{ typeConf.label }}
          </UBadge>
          <UBadge :color="(participationStateColor as any)" variant="outline" size="sm">
            {{ participationStateLabel }}
          </UBadge>
        </div>

        <div class="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5">
            <p class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-text-muted)">
              Start
            </p>
            <p class="mt-1 text-sm font-medium text-white">
              {{ formattedDate }}
            </p>
          </div>
          <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5">
            <p class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-text-muted)">
              Planner
            </p>
            <p class="mt-1 text-sm font-medium text-white">
              {{ missionPlannerLabel }}
            </p>
          </div>
          <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5">
            <p class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-text-muted)">
              Treffpunkt
            </p>
            <p class="mt-1 text-sm font-medium text-white">
              {{ (mission as any).location || 'Noch offen' }}
            </p>
          </div>
          <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5">
            <p class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-text-muted)">
              Startort
            </p>
            <p class="mt-1 text-sm font-medium text-white">
              {{ (mission as any).start_location || 'Noch offen' }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
        <div class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 px-3 py-3 ring-1 ring-inset ring-white/5">
          <p class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)">
            Anmeldungen
          </p>
          <p class="mt-1.5 text-xl font-semibold text-white">
            {{ registrationCount }}<span v-if="mission.max_members" class="text-sm text-(--ui-text-muted)">/{{ mission.max_members }}</span>
          </p>
        </div>
        <div class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 px-3 py-3 ring-1 ring-inset ring-white/5">
          <p class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)">
            Offen
          </p>
          <p class="mt-1.5 text-xl font-semibold text-(--ui-primary)">
            {{ openPositionsCount }}
          </p>
        </div>
        <div class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 px-3 py-3 ring-1 ring-inset ring-white/5">
          <p class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)">
            Bestätigt
          </p>
          <p class="mt-1.5 text-xl font-semibold text-white">
            {{ approvedRegistrationsCount }}
          </p>
        </div>
        <div class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 px-3 py-3 ring-1 ring-inset ring-white/5">
          <p class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)">
            Teams
          </p>
          <p class="mt-1.5 text-xl font-semibold text-white">
            {{ teamCount }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,20rem)]">
      <div class="space-y-4">
        <div
          v-if="mission.description"
          class="overflow-hidden rounded-2xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 ring-1 ring-inset ring-white/5"
        >
          <div class="flex items-center justify-between gap-3 border-b border-(--ui-primary)/10 px-4 py-3">
            <div>
              <p class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-primary)/75">
                Briefing
              </p>
              <h2 class="mt-1 text-base font-semibold text-white">
                Missionsbeschreibung
              </h2>
            </div>
            <UBadge color="neutral" variant="subtle" size="sm">
              Kompakt
            </UBadge>
          </div>
          <div
            class="prose prose-sm prose-invert max-w-none px-4 py-4 text-sm"
            v-html="mission.description"
          />
        </div>

        <div class="overflow-hidden rounded-2xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 ring-1 ring-inset ring-white/5">
          <div class="flex flex-col gap-2 border-b border-(--ui-primary)/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-primary)/75">
                Crew Board
              </p>
              <h2 class="mt-1 text-base font-semibold text-white">
                Teams, Schiffe und Rollen
              </h2>
            </div>

            <div class="flex flex-wrap gap-2 text-xs">
              <UBadge color="primary" variant="subtle" size="sm">
                {{ openPositionsCount }} offen
              </UBadge>
              <UBadge v-if="pendingPositionsCount" color="warning" variant="subtle" size="sm">
                {{ pendingPositionsCount }} in Prüfung
              </UBadge>
              <UBadge v-if="filledPositionsCount" color="info" variant="subtle" size="sm">
                {{ filledPositionsCount }}/{{ allPositions.length }} besetzt
              </UBadge>
            </div>
          </div>

          <div class="p-4">
            <AMSPagesMissionsTeamView
              :teams="mission.teams"
              :registrations="mission.registrations"
              :my-registration="myRegistration"
              :is-planner="isPlanner"
              :signup-open="missionCanRegister"
              @signup-flex-team="(team) => openSignup('flex_team', team)"
              @signup-position="(team, pos) => openSignup('position', team, pos)"
              @refresh="refresh"
            />
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="relative z-10 rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg)/95 p-4 shadow-[0_18px_40px_rgba(3,8,15,0.28)] ring-1 ring-inset ring-white/5 backdrop-blur-sm xl:sticky xl:top-4 xl:bg-(--ui-bg)/92">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-primary)/75">
                Teilnahme
              </p>
              <h3 class="mt-1 text-base font-semibold text-white">
                {{ myRegistration ? 'Dein Status' : 'Eintragen' }}
              </h3>
            </div>
            <UBadge :color="(participationStateColor as any)" variant="subtle" size="sm">
              {{ participationStateLabel }}
            </UBadge>
          </div>

          <div v-if="myRegistration" class="mt-4 space-y-3">
            <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3">
              <p class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)">
                Anmeldung
              </p>
              <p class="mt-1.5 text-sm font-medium text-white">
                {{ myRegTypeLabel }}
              </p>
              <p v-if="myRegistration.note" class="mt-2 text-xs italic text-(--ui-text-muted)">
                "{{ myRegistration.note }}"
              </p>
            </div>

            <div
              v-if="canManageOwnRegistration && myRegistration.status !== 'rejected'"
              class="grid gap-2 sm:grid-cols-2 xl:grid-cols-1"
            >
              <UButton
                v-if="myRegistration.status !== 'tentative'"
                size="sm"
                color="warning"
                variant="outline"
                icon="i-lucide-clock"
                label="Unter Vorbehalt"
                class="w-full justify-center"
                @click="setTentative"
              />
              <UButton
                size="sm"
                color="error"
                variant="outline"
                icon="i-lucide-user-minus"
                label="Abmelden"
                class="w-full justify-center"
                @click="unregister"
              />
            </div>

            <UAlert
              v-if="myRegistration.status === 'rejected'"
              color="error"
              variant="subtle"
              icon="i-lucide-ban"
              title="Anfrage abgelehnt"
              description="Der Mission Planner kann die Ablehnung wieder auf ausstehend setzen."
            />
          </div>

          <div v-else-if="missionCanRegister" class="mt-4 space-y-3">
            <p class="text-sm leading-6 text-(--ui-text-muted)">
              Flex direkt anmelden oder unten gezielt eine feste Rolle anfragen.
            </p>
            <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <UButton
                icon="i-lucide-user-plus"
                label="Flex anmelden"
                variant="subtle"
                class="w-full justify-center"
                @click="openSignup('flex')"
              />
              <UButton
                icon="i-lucide-clock"
                label="Unter Vorbehalt"
                color="warning"
                variant="outline"
                class="w-full justify-center"
                @click="signupTentative"
              />
            </div>
            <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5 text-xs text-(--ui-text-muted)">
              Feste Rollen laufen immer zuerst über eine Freigabe.
            </div>
          </div>

          <UAlert
            v-else
            class="mt-4"
            :title="missionHasStarted ? 'Mission läuft bereits' : 'Anmeldung geschlossen'"
            :description="signupClosedMessage"
            :color="(missionHasStarted ? 'warning' : 'neutral') as any"
            variant="subtle"
            :icon="missionHasStarted ? 'i-lucide-ban' : 'i-lucide-lock'"
          />
        </div>

        <div class="rounded-2xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 p-4 ring-1 ring-inset ring-white/5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-primary)/75">
                Snapshot
              </p>
              <h3 class="mt-1 text-base font-semibold text-white">
                Lagebild
              </h3>
            </div>
            <UBadge color="neutral" variant="subtle" size="sm">
              Aktuell
            </UBadge>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3">
              <p class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)">
                Rollen
              </p>
              <p class="mt-1.5 text-lg font-semibold text-white">
                {{ filledPositionsCount }}/{{ allPositions.length }}
              </p>
            </div>
            <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3">
              <p class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)">
                Ausstehend
              </p>
              <p class="mt-1.5 text-lg font-semibold text-white">
                {{ pendingRegistrations.length }}
              </p>
            </div>
            <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3">
              <p class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)">
                Vorbehalt
              </p>
              <p class="mt-1.5 text-lg font-semibold text-white">
                {{ tentativeRegistrationsCount }}
              </p>
            </div>
            <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3">
              <p class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)">
                Abgelehnt
              </p>
              <p class="mt-1.5 text-lg font-semibold text-white">
                {{ rejectedRegistrationsCount }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="isPlanner && mission.registrations?.length"
          class="rounded-2xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 p-4 ring-1 ring-inset ring-white/5"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-primary)/75">
                Planner Queue
              </p>
              <h3 class="mt-1 text-base font-semibold text-white m-0!">
                Anmeldungen
              </h3>
            </div>
            <div class="flex flex-wrap gap-2">
              <UBadge v-if="pendingRegistrations.length" color="warning" variant="subtle" size="sm">
                {{ pendingRegistrations.length }} ausstehend
              </UBadge>
              <UBadge v-if="rejectedRegistrationsCount" color="error" variant="subtle" size="sm">
                {{ rejectedRegistrationsCount }} abgelehnt
              </UBadge>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <div
              v-for="reg in sortedRegistrations"
              :key="reg.id"
              class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3"
            >
              <div class="flex items-start gap-2.5">
                <NuxtImg
                  class="h-8 w-8 rounded-full object-cover shrink-0"
                  :src="getAssetId(reg.user?.avatar) ?? '88adb941-f746-405d-bcc4-c2804fb48e33'"
                  :alt="getUserLabel(reg.user)"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-white">
                        {{ getUserLabel(reg.user) }}
                      </p>
                      <p class="mt-0.5 truncate text-xs text-(--ui-text-muted)">
                        {{ getRegistrationTypeLabel(reg) }}
                      </p>
                    </div>
                    <UBadge
                      :color="(regStatusColor[reg.status] ?? 'neutral') as any"
                      variant="subtle"
                      size="xs"
                      class="shrink-0"
                    >
                      {{ regStatusColor[reg.status] ? regStatusLabel[reg.status] : reg.status }}
                    </UBadge>
                  </div>

                  <p v-if="reg.note" class="mt-2 text-xs italic text-(--ui-text-muted)">
                    "{{ reg.note }}"
                  </p>

                  <div v-if="reg.status === 'pending'" class="mt-2 flex flex-wrap gap-2">
                    <UButton
                      size="xs"
                      color="success"
                      variant="outline"
                      icon="i-lucide-check"
                      label="Genehmigen"
                      @click="updateRegistrationStatus(reg.id, 'approved')"
                    />
                    <UButton
                      size="xs"
                      color="error"
                      variant="outline"
                      icon="i-lucide-x"
                      label="Ablehnen"
                      @click="updateRegistrationStatus(reg.id, 'rejected')"
                    />
                  </div>

                  <div v-else-if="reg.status === 'rejected'" class="mt-2">
                    <UTooltip :text="getRejectedResetHint(reg)">
                      <UButton
                        size="xs"
                        color="warning"
                        variant="ghost"
                        icon="i-lucide-rotate-ccw"
                        label="Widerrufen"
                        :disabled="!canResetRejectedRegistration(reg)"
                        @click="updateRegistrationStatus(reg.id, 'pending')"
                      />
                    </UTooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AMSPagesMissionsSignupModal
      v-model:open="signupModalOpen"
      :mission-id="mission.id"
      :target="signupTarget"
      :signup-allowed="missionCanRegister"
      :signup-closed-message="signupClosedMessage"
      @registered="handleMissionSignupRegistered"
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

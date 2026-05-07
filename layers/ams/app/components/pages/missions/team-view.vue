<script setup lang="ts">
const props = defineProps<{
  teams: any[]
  registrations?: any[]
  myRegistration: any
  isPlanner: boolean
  signupOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'signupFlexTeam', team: any): void
  (e: 'signupPosition', team: any, position: any): void
  (e: 'refresh'): void
}>()

const ROLE_LABELS: Record<string, string> = {
  pilot: 'Pilot',
  co_pilot: 'Co-Pilot',
  mining_operator: 'Mining Operator',
  cargo_operator: 'Cargo Operator',
  turret_operator: 'Turret Operator',
  engineer: 'Ingenieur',
  medic: 'Medic',
  scout: 'Aufklärer',
  passenger: 'Passagier',
  other: 'Sonstiges',
}

const ROLE_ORDER = [
  'pilot',
  'co_pilot',
  'mining_operator',
  'cargo_operator',
  'turret_operator',
  'engineer',
  'medic',
  'scout',
  'passenger',
  'other',
]

const canSignup = computed(
  () => props.signupOpen && !props.myRegistration,
)

const activeRegistrations = computed(() =>
  (props.registrations ?? []).filter((registration: any) => registration.status !== 'rejected'),
)

const missionFlexRegistrations = computed(() =>
  sortRegistrations(activeRegistrations.value.filter((registration: any) => registration.type === 'flex')),
)

const positionRegistrations = computed(() => {
  const grouped = new Map<string, any[]>()

  for (const registration of activeRegistrations.value) {
    const positionId = registration.position?.id
    if (!positionId) continue

    const existing = grouped.get(positionId) ?? []
    existing.push(registration)
    grouped.set(positionId, existing)
  }

  const statusOrder: Record<string, number> = {
    pending: 0,
    tentative: 1,
    approved: 2,
  }

  for (const registrations of grouped.values()) {
    registrations.sort((a: any, b: any) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99))
  }

  return grouped
})

function sortRegistrations(registrations: any[]) {
  const statusOrder: Record<string, number> = {
    pending: 0,
    tentative: 1,
    approved: 2,
  }

  return [...registrations].sort((a: any, b: any) => {
    const statusDelta = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
    if (statusDelta !== 0) return statusDelta

    return getUserLabel(a.user).localeCompare(getUserLabel(b.user), 'de')
  })
}

function getTeamShipCount(team: any) {
  return team.ships?.length ?? 0
}

function getTeamOpenPositions(team: any) {
  return (team.ships ?? [])
    .flatMap((ship: any) => ship.positions ?? [])
    .filter((position: any) => getEffectivePositionState(position) === 'open').length
}

function getTeamPendingPositions(team: any) {
  return (team.ships ?? [])
    .flatMap((ship: any) => ship.positions ?? [])
    .filter((position: any) => getEffectivePositionState(position) === 'pending').length
}

function getShipName(ship: any) {
  return ship.hangar_id?.name || ship.hangar_id?.ship?.name || 'Unbekanntes Schiff'
}

function getTeamDepartmentLabel(team: any) {
  if (!team?.department) return null
  return typeof team.department === 'object' ? team.department?.name ?? null : team.department
}

function getShipMeta(ship: any) {
  const manufacturer = ship.hangar_id?.ship?.hull?.manufacturer?.name
  const hull = ship.hangar_id?.ship?.hull?.name
  const owner = ship.hangar_id?.user?.first_name
    ? `${ship.hangar_id.user.first_name} ${ship.hangar_id.user.last_name ?? ''}`.trim()
    : null

  return [manufacturer, hull, owner ? `Besatzung: ${owner}` : null]
    .filter(Boolean)
    .join(' • ')
}

function getShipOpenPositions(ship: any) {
  return (ship.positions ?? []).filter((position: any) => getEffectivePositionState(position) === 'open').length
}

function getRoleOrder(role?: string) {
  const index = ROLE_ORDER.indexOf(role ?? '')
  return index === -1 ? ROLE_ORDER.length : index
}

function getSortedPositions(ship: any) {
  return [...(ship.positions ?? [])].sort((a: any, b: any) => {
    const orderDelta = getRoleOrder(a.role) - getRoleOrder(b.role)
    if (orderDelta !== 0) return orderDelta

    return (ROLE_LABELS[a.role] ?? a.role ?? '').localeCompare(ROLE_LABELS[b.role] ?? b.role ?? '', 'de')
  })
}

function hasMyTeamFlex(team: any) {
  return props.myRegistration?.type === 'flex_team' && props.myRegistration?.team?.id === team.id
}

function getTeamFlexRegistrations(team: any) {
  return sortRegistrations(
    activeRegistrations.value.filter(
      (registration: any) => registration.type === 'flex_team' && registration.team?.id === team.id,
    ),
  )
}

function getRelevantPositionRegistration(pos: any) {
  const registrations = positionRegistrations.value.get(pos.id) ?? []
  if (!registrations.length) return null

  const assignedUserId = pos.assigned_user?.id

  if (assignedUserId) {
    const assignedRegistration = registrations.find(
      (registration: any) =>
        registration.user?.id === assignedUserId &&
        ['approved', 'tentative'].includes(registration.status),
    )

    if (assignedRegistration) return assignedRegistration
  }

  return registrations[0]
}

function getEffectivePositionState(pos: any) {
  const registration = getRelevantPositionRegistration(pos)

  if (registration?.status === 'tentative') return 'tentative'
  if (registration?.status === 'pending') return 'pending'
  if (registration?.status === 'approved' || pos.status === 'filled') return 'filled'
  return 'open'
}

function getPositionStatusLabel(pos: any) {
  const state = getEffectivePositionState(pos)

  if (state === 'filled') return 'Besetzt'
  if (state === 'pending') return 'Anfrage'
  if (state === 'tentative') return 'Vorbehalt'
  return 'Offen'
}

function getPositionStatusColor(pos: any) {
  const state = getEffectivePositionState(pos)

  if (state === 'filled') return 'info'
  if (state === 'pending') return 'warning'
  if (state === 'tentative') return 'warning'
  return canSignup.value ? 'primary' : 'neutral'
}

function getPositionOccupantLabel(pos: any) {
  const registration = getRelevantPositionRegistration(pos)

  if (registration?.user) {
    if (registration.status === 'pending') return `${getUserLabel(registration.user)} angefragt`
    if (registration.status === 'tentative') return `${getUserLabel(registration.user)} unter Vorbehalt`
    return getUserLabel(registration.user)
  }

  if (pos.assigned_user) {
    return getUserLabel(pos.assigned_user)
  }

  if (canSignup.value) return 'Klicken zum Anfragen'
  return 'Noch frei'
}

function getPositionTextClass(pos: any) {
  const state = getEffectivePositionState(pos)

  if (state === 'pending') return 'text-yellow-300/80'
  if (state === 'tentative') return 'text-amber-300/80'
  if (state === 'filled') return 'text-(--ui-text-muted)'
  return canSignup.value ? 'text-(--ui-primary)/80' : 'text-(--ui-text-muted)'
}

function getRegistrationStatusLabel(registration: any) {
  if (registration.status === 'pending') return 'Anfrage'
  if (registration.status === 'tentative') return 'Vorbehalt'
  return null
}

function getRegistrationStatusColor(registration: any) {
  if (registration.status === 'pending') return 'warning'
  if (registration.status === 'tentative') return 'warning'
  return 'neutral'
}

function positionClasses(pos: any) {
  const state = getEffectivePositionState(pos)

  if (state === 'filled') {
    return 'border-(--ui-info)/18 bg-(--ui-info)/6'
  }

  if (state === 'pending') {
    return 'border-yellow-500/18 bg-yellow-500/6'
  }

  if (state === 'tentative') {
    return 'border-amber-500/18 bg-amber-500/6'
  }

  if (canSignup.value) {
    return 'border-(--ui-primary)/22 bg-(--ui-primary)/6 cursor-pointer hover:border-(--ui-primary)/42 hover:bg-(--ui-primary)/12'
  }

  return 'border-(--ui-border)/20 bg-(--ui-bg-muted)/30'
}

function handlePositionClick(team: any, pos: any) {
  if (getEffectivePositionState(pos) === 'open' && canSignup.value) {
    emit('signupPosition', team, pos)
  }
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="myRegistration?.type === 'flex' || myRegistration?.type === 'flex_team'"
      class="rounded-xl border border-(--ui-primary)/12 bg-(--ui-bg)/70 px-3.5 py-3 ring-1 ring-inset ring-white/5"
    >
      <div class="flex items-start gap-2.5">
        <UIcon name="i-lucide-badge-info" class="mt-0.5 h-4 w-4 shrink-0 text-(--ui-primary)" />
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-(--ui-primary)/75">
            Dein Flex-Status
          </p>
          <p class="mt-1 text-sm text-white">
            <template v-if="myRegistration.type === 'flex'">
              Du bist aktuell als Flex für die gesamte Mission eingetragen.
            </template>
            <template v-else>
              Du bist aktuell als Team-Flex für {{ myRegistration.team?.name || 'dieses Team' }} eingetragen.
            </template>
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="missionFlexRegistrations.length"
      class="rounded-xl border border-(--ui-primary)/12 bg-(--ui-bg)/70 px-3.5 py-3 ring-1 ring-inset ring-white/5"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-(--ui-primary)/75">
            Mission-Flex
          </p>
          <p class="mt-1 text-[11px] text-(--ui-text-muted)">
            Direkt für die Mission eingetragene Teilnehmer
          </p>
        </div>
        <UBadge color="primary" variant="subtle" size="sm">
          {{ missionFlexRegistrations.length }}
        </UBadge>
      </div>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <div
          v-for="registration in missionFlexRegistrations"
          :key="registration.id"
          class="inline-flex max-w-full items-center gap-2 rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 px-2 py-1.5"
        >
          <NuxtImg
            class="h-4 w-4 shrink-0 rounded-full object-cover"
            :src="getAssetId(registration.user?.avatar) ?? '88adb941-f746-405d-bcc4-c2804fb48e33'"
            :alt="getUserLabel(registration.user)"
          />
          <span class="truncate text-xs text-white">
            {{ getUserLabel(registration.user) }}
          </span>
          <UBadge
            v-if="getRegistrationStatusLabel(registration)"
            :color="(getRegistrationStatusColor(registration) as any)"
            variant="subtle"
            size="xs"
          >
            {{ getRegistrationStatusLabel(registration) }}
          </UBadge>
        </div>
      </div>
    </div>

    <div
      v-if="!teams?.length"
      class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/30 p-5 text-center text-(--ui-muted-foreground)"
    >
      <UIcon name="i-lucide-users" class="mx-auto mb-2 h-10 w-10 opacity-30" />
      <p>Noch keine Teams für diese Mission erstellt.</p>
    </div>

    <div
      v-for="team in teams"
      :key="team.id"
      class="overflow-hidden rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 ring-1 ring-inset ring-white/5"
    >
      <div
        class="flex flex-col gap-2 border-b border-(--ui-primary)/10 bg-linear-to-r from-(--ui-primary)/7 via-transparent to-transparent px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" class="h-3.5 w-3.5 text-(--ui-primary)" />
            <h3 class="m-0! text-sm font-semibold text-white">{{ team.name }}</h3>
            <UBadge v-if="hasMyTeamFlex(team)" color="primary" variant="subtle" size="xs">
              Dein Team-Flex
            </UBadge>
          </div>
          <p v-if="team.description" class="mt-1 truncate text-[11px] text-(--ui-text-muted)">
            {{ team.description }}
          </p>
          <div
            v-if="getTeamDepartmentLabel(team)"
            class="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md border border-(--ui-primary)/10 bg-(--ui-bg)/55 px-2 py-1"
          >
            <UIcon name="i-lucide-building-2" class="h-3 w-3 shrink-0 text-(--ui-primary)/80" />
            <span class="truncate text-[11px] font-medium text-(--ui-text-highlighted)">
              Fokus: {{ getTeamDepartmentLabel(team) }}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ getTeamShipCount(team) }} Schiffe
          </UBadge>
          <UBadge :color="(getTeamOpenPositions(team) ? 'primary' : 'neutral') as any" variant="subtle" size="sm">
            {{ getTeamOpenPositions(team) }} offen
          </UBadge>
          <UBadge v-if="getTeamPendingPositions(team)" color="warning" variant="subtle" size="sm">
            {{ getTeamPendingPositions(team) }} Anfrage
          </UBadge>
          <UButton
            v-if="canSignup"
            size="xs"
            variant="outline"
            icon="i-lucide-user-plus"
            label="Flex"
            @click="$emit('signupFlexTeam', team)"
          />
        </div>
      </div>

      <div
        v-if="getTeamFlexRegistrations(team).length"
        class="border-b border-(--ui-primary)/8 bg-(--ui-bg)/50 px-3.5 py-2.5"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-(--ui-text-muted)">
            Team-Flex
          </p>
          <div class="flex flex-wrap gap-1.5">
            <div
              v-for="registration in getTeamFlexRegistrations(team)"
              :key="registration.id"
              class="inline-flex max-w-full items-center gap-2 rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 px-2 py-1.5"
            >
              <NuxtImg
                class="h-4 w-4 shrink-0 rounded-full object-cover"
                :src="getAssetId(registration.user?.avatar) ?? '88adb941-f746-405d-bcc4-c2804fb48e33'"
                :alt="getUserLabel(registration.user)"
              />
              <span class="truncate text-xs text-white">
                {{ getUserLabel(registration.user) }}
              </span>
              <UBadge
                v-if="getRegistrationStatusLabel(registration)"
                :color="(getRegistrationStatusColor(registration) as any)"
                variant="subtle"
                size="xs"
              >
                {{ getRegistrationStatusLabel(registration) }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>

      <div class="divide-y divide-(--ui-primary)/8">
        <div
          v-if="!team.ships?.length"
          class="px-3.5 py-4 text-center text-sm text-(--ui-muted-foreground)"
        >
          Keine Schiffe zugewiesen.
        </div>

        <div
          v-for="ship in team.ships"
          :key="ship.id"
          class="grid gap-3 px-3.5 py-3 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-(--ui-primary)/10 bg-(--ui-bg)/60"
              >
                <NuxtImg
                  v-if="ship.hangar_id?.ship?.thumbnail?.id"
                  :src="ship.hangar_id.ship.thumbnail.id"
                  class="h-7 w-12 object-contain"
                />
                <UIcon v-else name="i-lucide-ship-wheel" class="h-4 w-4 text-(--ui-text-muted)" />
              </div>

              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-white">
                  {{ getShipName(ship) }}
                </p>
                <p class="mt-0.5 truncate text-[11px] text-(--ui-text-muted)">
                  {{ getShipMeta(ship) || 'Keine zusätzlichen Schiffsdaten' }}
                </p>
                <div class="mt-1.5 flex flex-wrap gap-1.5">
                  <UBadge color="neutral" variant="subtle" size="xs">
                    {{ ship.positions?.length ?? 0 }} Rollen
                  </UBadge>
                  <UBadge :color="(getShipOpenPositions(ship) ? 'primary' : 'neutral') as any" variant="subtle" size="xs">
                    {{ getShipOpenPositions(ship) }} offen
                  </UBadge>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="ship.positions?.length"
            class="flex flex-wrap gap-1.5"
          >
            <div
              v-for="pos in getSortedPositions(ship)"
              :key="pos.id"
              class="min-w-[10.5rem] max-w-full rounded-lg border px-2.5 py-2 transition-all"
              :class="positionClasses(pos)"
              @click="handlePositionClick(team, pos)"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-xs font-semibold leading-5 text-white">
                  {{ ROLE_LABELS[pos.role] ?? pos.role }}
                </p>
                <UBadge :color="(getPositionStatusColor(pos) as any)" variant="subtle" size="xs">
                  {{ getPositionStatusLabel(pos) }}
                </UBadge>
              </div>

              <p class="mt-1.5 truncate text-[11px]" :class="getPositionTextClass(pos)">
                {{ getPositionOccupantLabel(pos) }}
              </p>
            </div>
          </div>
          <p v-else class="text-xs text-(--ui-text-muted)">
            Keine Positionen definiert.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  teams: any[]
  myRegistration: any
  isPlanner: boolean
  missionStatus: string
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

const canSignup = computed(
  () => props.missionStatus === 'active' && !props.myRegistration,
)

function positionClasses(pos: any) {
  if (pos.status === 'filled') return 'border-(--ui-info)/30 bg-(--ui-info)/5'
  if (pos.status === 'pending') return 'border-yellow-500/30 bg-yellow-500/5'
  if (canSignup.value) return 'border-(--ui-primary)/30 bg-(--ui-primary)/5 cursor-pointer hover:bg-(--ui-primary)/15'
  return 'border-(--ui-border)/20 bg-(--ui-bg-muted)/30'
}

function handlePositionClick(team: any, pos: any) {
  if (pos.status === 'open' && canSignup.value) {
    emit('signupPosition', team, pos)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="!teams?.length"
      class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/30 p-8 text-center text-(--ui-muted-foreground)"
    >
      <UIcon name="i-lucide-users" class="h-10 w-10 mx-auto mb-2 opacity-30" />
      <p>Noch keine Teams für diese Mission erstellt.</p>
    </div>

    <div
      v-for="team in teams"
      :key="team.id"
      class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 overflow-hidden"
    >
      <div
        class="flex items-center justify-between px-5 py-3 border-b border-(--ui-primary)/10 bg-(--ui-primary)/5"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-users" class="h-4 w-4 text-(--ui-primary)" />
          <h3 class="font-semibold text-white">{{ team.name }}</h3>
          <span v-if="team.description" class="text-xs text-(--ui-muted-foreground) hidden sm:block">
            – {{ team.description }}
          </span>
        </div>
        <UButton
          v-if="canSignup"
          size="xs"
          variant="ghost"
          icon="i-lucide-user-plus"
          label="Flex im Team"
          @click="$emit('signupFlexTeam', team)"
        />
      </div>

      <div class="p-4 space-y-5">
        <div
          v-if="!team.ships?.length"
          class="text-sm text-(--ui-muted-foreground) text-center py-3"
        >
          Keine Schiffe zugewiesen.
        </div>

        <div v-for="ship in team.ships" :key="ship.id">
          <div class="flex items-center gap-3 mb-2">
            <NuxtImg
              v-if="ship.hangar_id?.ship?.thumbnail?.id"
              :src="ship.hangar_id.ship.thumbnail.id"
              class="h-8 w-16 object-contain shrink-0"
            />
            <div>
              <p class="text-sm font-semibold text-white">
                {{ ship.hangar_id?.name || ship.hangar_id?.ship?.name || 'Unbekanntes Schiff' }}
              </p>
              <p class="text-xs text-(--ui-muted-foreground)">
                <span v-if="ship.hangar_id?.ship?.hull?.manufacturer?.name">
                  {{ ship.hangar_id.ship.hull.manufacturer.name }}
                </span>
                <span v-if="ship.hangar_id?.ship?.hull?.name">
                  {{ ' ' + ship.hangar_id.ship.hull.name }}
                </span>
                <span
                  v-if="ship.hangar_id?.user?.first_name"
                  class="ml-1 text-(--ui-primary)/60"
                >
                  &bull; {{ ship.hangar_id.user.first_name }} {{ ship.hangar_id.user.last_name }}
                </span>
              </p>
            </div>
          </div>

          <div
            v-if="ship.positions?.length"
            class="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-2"
          >
            <div
              v-for="pos in ship.positions"
              :key="pos.id"
              class="rounded border p-2.5 transition-all"
              :class="positionClasses(pos)"
              @click="handlePositionClick(team, pos)"
            >
              <p class="text-xs font-medium text-white truncate">
                {{ ROLE_LABELS[pos.role] ?? pos.role }}
              </p>
              <div v-if="pos.assigned_user" class="flex items-center gap-1 mt-1">
                <NuxtImg
                  :src="getAssetId(pos.assigned_user.avatar) ?? '88adb941-f746-405d-bcc4-c2804fb48e33'"
                  class="h-4 w-4 rounded-full object-cover shrink-0"
                  :alt="pos.assigned_user.first_name"
                />
                <span class="text-xs text-(--ui-muted-foreground) truncate">
                  {{ pos.assigned_user.first_name }}
                </span>
              </div>
              <p
                v-else-if="pos.status === 'open'"
                class="text-xs text-(--ui-primary)/60 mt-0.5"
              >
                Offen
              </p>
              <p v-else-if="pos.status === 'pending'" class="text-xs text-yellow-400/60 mt-0.5">
                Ausstehend
              </p>
            </div>
          </div>
          <p v-else class="text-xs text-(--ui-muted-foreground) pl-2">
            Keine Positionen definiert.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

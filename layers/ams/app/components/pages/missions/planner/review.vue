<script setup lang="ts">
import type {
  MissionPlannerForm,
  MissionPlannerPositionType,
  MissionPlannerTeamDraft,
} from '~~/types'

const props = defineProps<{
  form: MissionPlannerForm
  plannedDateSummary: string
  missionTypeLabel: string
  statusLabel: string
  teams: MissionPlannerTeamDraft[]
  totalDraftPrimarySummary: string
  totalDraftSecondarySummary: string
  totalDraftPositionsHint: string
  assignedUserTypeConflict: {
    positionType: MissionPlannerPositionType
    userLabel: string
  } | null
  loading: boolean
  isEditing: boolean
  cancelTo: string
}>()

const emit = defineEmits<{
  save: []
}>()

const shipCount = computed(() =>
  props.teams.reduce((total, team) => total + team.ships.length, 0)
)

const assignedPositionCount = computed(() =>
  props.teams.reduce(
    (total, team) =>
      total +
      team.ships.reduce(
        (shipTotal, ship) =>
          shipTotal + ship.positions.filter((position) => !!position.assigned_user).length,
        0
      ),
    0
  )
)

const teamCountLabel = computed(() =>
  `${props.teams.length} Team${props.teams.length === 1 ? '' : 's'}`
)

const shipCountLabel = computed(() =>
  `${shipCount.value} Schiff${shipCount.value === 1 ? '' : 'e'}`
)

const durationLabel = computed(() => {
  const rawValue = props.form.duration_hours.trim()
  return rawValue ? `${rawValue} Std.` : 'Nicht gesetzt'
})

const submitLabel = computed(() =>
  props.isEditing ? 'Änderungen speichern' : 'Mission erstellen'
)

const conflictLabel = computed(() =>
  props.assignedUserTypeConflict?.positionType === 'secondary'
    ? 'Sekundär'
    : 'Primär'
)
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 lg:grid-cols-2">
      <UCard variant="ams">
        <template #header>
          <h2>Mission</h2>
        </template>
        <div class="space-y-3 text-sm">
          <div class="flex items-start justify-between gap-4">
            <span class="text-(--ui-text-muted)">Titel</span>
            <span class="text-right text-white">
              {{ form.title.trim() || 'Unbenannt' }}
            </span>
          </div>
          <div class="flex items-start justify-between gap-4">
            <span class="text-(--ui-text-muted)">Typ</span>
            <span class="text-right text-white">{{ missionTypeLabel }}</span>
          </div>
          <div class="flex items-start justify-between gap-4">
            <span class="text-(--ui-text-muted)">Status</span>
            <span class="text-right text-white">{{ statusLabel }}</span>
          </div>
          <div class="flex items-start justify-between gap-4">
            <span class="text-(--ui-text-muted)">Dauer</span>
            <span class="text-right text-white">{{ durationLabel }}</span>
          </div>
          <div class="flex items-start justify-between gap-4">
            <span class="text-(--ui-text-muted)">Treffpunkt</span>
            <span class="text-right text-white">
              {{ form.start_location.trim() || 'Nicht gesetzt' }}
            </span>
          </div>
          <div class="flex items-start justify-between gap-4">
            <span class="text-(--ui-text-muted)">Missionsort</span>
            <span class="text-right text-white">
              {{ form.location.trim() || 'Nicht gesetzt' }}
            </span>
          </div>
          <div class="flex items-start justify-between gap-4">
            <span class="text-(--ui-text-muted)">Termin</span>
            <span class="text-right text-white">{{ plannedDateSummary }}</span>
          </div>
          <div class="space-y-1">
            <p class="text-(--ui-text-muted)">Beschreibung</p>
            <p class="rounded-lg bg-(--ui-bg-muted)/40 px-3 py-2 text-white">
              {{ form.description.trim() || 'Keine Beschreibung hinterlegt.' }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard variant="ams">
        <template #header>
          <h2>Struktur</h2>
        </template>
        <div class="space-y-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/35 p-3">
              <p class="text-[0.65rem] uppercase tracking-[0.24em] text-(--ui-text-muted)">
                Teams
              </p>
              <p class="mt-2 text-lg font-semibold text-white">
                {{ teamCountLabel }}
              </p>
            </div>
            <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/35 p-3">
              <p class="text-[0.65rem] uppercase tracking-[0.24em] text-(--ui-text-muted)">
                Schiffe
              </p>
              <p class="mt-2 text-lg font-semibold text-white">
                {{ shipCountLabel }}
              </p>
            </div>
            <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/35 p-3">
              <p class="text-[0.65rem] uppercase tracking-[0.24em] text-(--ui-text-muted)">
                Primär
              </p>
              <p class="mt-2 text-lg font-semibold text-white">
                {{ totalDraftPrimarySummary }}
              </p>
            </div>
            <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/35 p-3">
              <p class="text-[0.65rem] uppercase tracking-[0.24em] text-(--ui-text-muted)">
                Sekundär
              </p>
              <p class="mt-2 text-lg font-semibold text-white">
                {{ totalDraftSecondarySummary }}
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/35 p-3">
            <p class="text-[0.65rem] uppercase tracking-[0.24em] text-(--ui-text-muted)">
              Zuweisungen
            </p>
            <p class="mt-2 text-lg font-semibold text-white">
              {{ assignedPositionCount }} Positionen belegt
            </p>
            <p class="mt-2 text-xs text-(--ui-text-muted)">
              {{ totalDraftPositionsHint }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <UAlert
      v-if="assignedUserTypeConflict"
      title="Doppelte Rollenart"
      icon="i-lucide-users"
      color="error"
      variant="subtle"
    >
      <template #description>
        <p class="text-sm text-(--ui-text-muted)">
          {{ assignedUserTypeConflict.userLabel }} ist mehrfach auf
          {{ conflictLabel }}-Positionen gesetzt.
        </p>
      </template>
    </UAlert>
    <UAlert
      v-else
      title="Bereit zum Speichern"
      icon="i-lucide-circle-check"
      color="success"
      variant="subtle"
    >
      <template #description>
        <p class="text-sm text-(--ui-text-muted)">
          Prüfe die Zusammenfassung und speichere danach die Mission.
        </p>
      </template>
    </UAlert>

    <div class="flex flex-col gap-2 sm:flex-row sm:justify-between">
      <UButton
        :to="cancelTo"
        variant="ghost"
        label="Abbrechen"
        class="justify-center"
      />
      <UButton
        :loading="loading"
        icon="i-lucide-save"
        :label="submitLabel"
        class="justify-center"
        @click="emit('save')"
      />
    </div>
  </div>
</template>

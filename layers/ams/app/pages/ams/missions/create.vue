<script setup lang="ts">
import { createItem, deleteItem, updateItem } from '@directus/sdk'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const editId = computed(() => route.query.edit as string | undefined)
const isEditing = computed(() => !!editId.value)

const { data: fleet } = await useFetchAMSFleet()
const { data: employees } = await useFetchAMSEmployees()

const ROLE_OPTIONS = [
  { label: 'Pilot', value: 'pilot' },
  { label: 'Co-Pilot', value: 'co_pilot' },
  { label: 'Mining Operator', value: 'mining_operator' },
  { label: 'Cargo Operator', value: 'cargo_operator' },
  { label: 'Turret Operator', value: 'turret_operator' },
  { label: 'Ingenieur', value: 'engineer' },
  { label: 'Medic', value: 'medic' },
  { label: 'Aufklärer', value: 'scout' },
  { label: 'Passagier', value: 'passenger' },
  { label: 'Sonstiges', value: 'other' },
]

const TYPE_OPTIONS = [
  { label: 'Bergbau', value: 'mining' },
  { label: 'Kampf', value: 'combat' },
  { label: 'Fracht', value: 'cargo' },
  { label: 'Erkundung', value: 'exploration' },
  { label: 'Rettung', value: 'rescue' },
  { label: 'Patrouille', value: 'patrol' },
  { label: 'Event', value: 'event' },
  { label: 'Sonstiges', value: 'other' },
]

const STATUS_OPTIONS = [
  { label: 'Entwurf', value: 'draft' },
  { label: 'Aktiv (Anmeldungen offen)', value: 'active' },
  { label: 'Abgebrochen', value: 'cancelled' },
  { label: 'Abgeschlossen', value: 'completed' },
]

interface PositionDraft {
  id?: string
  role: string
  assigned_user: any | null
  status: string
}

interface ShipDraft {
  id?: string
  hangar_id: any | null
  positions: PositionDraft[]
}

interface TeamDraft {
  id?: string
  name: string
  description: string
  ships: ShipDraft[]
}

const form = reactive({
  title: '',
  mission_type: 'mining',
  status: 'draft',
  planned_date: '',
  description: '',
  max_members: 0,
  location: '',
  start_location: '',
})

const teams = ref<TeamDraft[]>([])

const originalIds = ref<{ teams: string[]; ships: string[]; positions: string[] }>({
  teams: [],
  ships: [],
  positions: [],
})

if (editId.value) {
  const { data: existing } = await useFetchAMSMission(editId.value)
  if (existing.value) {
    form.title = existing.value.title
    form.mission_type = existing.value.mission_type
    form.status = existing.value.status
    form.planned_date = existing.value.planned_date
      ? existing.value.planned_date.slice(0, 16)
      : ''
    form.description = existing.value.description ?? ''
    form.max_members = existing.value.max_members ?? 0
    form.location = (existing.value as any).location ?? ''
    form.start_location = (existing.value as any).start_location ?? ''
    teams.value = (existing.value.teams ?? []).map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? '',
      ships: (t.ships ?? []).map((s: any) => ({
        id: s.id,
        hangar_id: (fleet.value ?? []).find(
          (h: any) => h.id === (typeof s.hangar_id === 'object' ? s.hangar_id?.id : s.hangar_id)
        ) ?? null,
        positions: (s.positions ?? []).map((p: any) => ({
          id: p.id,
          role: p.role,
          assigned_user: p.assigned_user ?? null,
          status: p.status,
        })),
      })),
    }))

    originalIds.value = {
      teams: teams.value.map(t => t.id).filter(Boolean) as string[],
      ships: teams.value.flatMap(t => t.ships).map(s => s.id).filter(Boolean) as string[],
      positions: teams.value
        .flatMap(t => t.ships)
        .flatMap(s => s.positions)
        .map(p => p.id)
        .filter(Boolean) as string[],
    }
  }
}

const fleetOptions = computed(() =>
  [...(fleet.value ?? [])]
    .sort((a, b) => {
      const aLabel = a.ship?.hull?.name ?? a.ship?.name ?? ''
      const bLabel = b.ship?.hull?.name ?? b.ship?.name ?? ''
      return aLabel.localeCompare(bLabel)
    })
    .map((h: any) => {
      const hullLabel = h.ship?.hull
        ? `${h.ship.hull.manufacturer?.name ? h.ship.hull.manufacturer.name + ' ' : ''}${h.ship.hull.name ?? ''}`.trim()
        : h.ship?.name ?? ''
      const ownerName = h.user
        ? [h.user.first_name, h.user.last_name].filter(Boolean).join(' ')
        : null
      return {
        label: h.name ? `${h.ship?.name ?? ''} - ${h.name}` : h.ship?.name,
        description: [hullLabel, ownerName].filter(Boolean).join(' • '),
        value: h,
        id: h.id,
      }
    }),
)

const employeeOptions = computed(() =>
  (employees.value ?? []).map((u: any) => ({
    label: getUserLabel(u),
    value: u,
    id: u.id,
  })),
)

function addTeam() {
  teams.value.push({ name: `Team ${teams.value.length + 1}`, description: '', ships: [] })
}

function removeTeam(i: number) {
  teams.value.splice(i, 1)
}

function addShip(team: TeamDraft) {
  team.ships.push({ hangar_id: null, positions: [] })
}

function removeShip(team: TeamDraft, i: number) {
  team.ships.splice(i, 1)
}

function addPosition(ship: ShipDraft) {
  ship.positions.push({ role: 'pilot', assigned_user: null, status: 'open' })
}

function removePosition(ship: ShipDraft, i: number) {
  ship.positions.splice(i, 1)
}

const loading = ref(false)

async function save() {
  if (!form.title.trim()) {
    toast.add({ title: 'Titel erforderlich', color: 'error', icon: 'i-lucide-alert-triangle' })
    return
  }

  loading.value = true
  try {
    const missionPayload = {
      title: form.title,
      mission_type: form.mission_type,
      status: form.status,
      planned_date: form.planned_date || null,
      description: form.description || null,
      max_members: form.max_members || 0,
      location: form.location || null,
      start_location: form.start_location || null,
    }

    let missionId: string

    if (isEditing.value && editId.value) {
      await useDirectus(updateItem('ams_missions' as any, editId.value, missionPayload))
      missionId = editId.value
    } else {
      const result = await useDirectus(createItem('ams_missions' as any, missionPayload)) as any
      missionId = result.id
    }

    const currentTeamIds: string[] = []
    const currentShipIds: string[] = []
    const currentPositionIds: string[] = []

    for (const team of teams.value) {
      let teamId: string

      if (team.id) {
        await useDirectus(
          updateItem('ams_mission_teams' as any, team.id, {
            name: team.name,
            description: team.description || null,
          }),
        )
        teamId = team.id
        currentTeamIds.push(teamId)
      } else {
        const t = await useDirectus(
          createItem('ams_mission_teams' as any, {
            mission: missionId,
            name: team.name,
            description: team.description || null,
          }),
        ) as any
        teamId = t.id
      }

      for (const ship of team.ships) {
        if (!ship.hangar_id) continue
        const hangarId = typeof ship.hangar_id === 'object' ? (ship.hangar_id as any).id : ship.hangar_id
        let shipId: string

        if (ship.id) {
          await useDirectus(
            updateItem('ams_mission_team_ships' as any, ship.id, { hangar_id: hangarId }),
          )
          shipId = ship.id
          currentShipIds.push(shipId)
        } else {
          const s = await useDirectus(
            createItem('ams_mission_team_ships' as any, { team: teamId, hangar_id: hangarId }),
          ) as any
          shipId = s.id
        }

        for (const pos of ship.positions) {
          const assignedUserId =
            pos.assigned_user && typeof pos.assigned_user === 'object'
              ? pos.assigned_user.id
              : pos.assigned_user ?? null

          const posPayload = {
            role: pos.role,
            assigned_user: assignedUserId,
            status: assignedUserId ? 'filled' : 'open',
          }

          if (pos.id) {
            await useDirectus(updateItem('ams_mission_positions' as any, pos.id, posPayload))
            currentPositionIds.push(pos.id)
          } else {
            await useDirectus(
              createItem('ams_mission_positions' as any, { team_ship: shipId, ...posPayload }),
            )
          }
        }
      }
    }

    if (isEditing.value) {
      const removedPositions = originalIds.value.positions.filter(id => !currentPositionIds.includes(id))
      const removedShips = originalIds.value.ships.filter(id => !currentShipIds.includes(id))
      const removedTeams = originalIds.value.teams.filter(id => !currentTeamIds.includes(id))

      for (const id of removedPositions) {
        await useDirectus(deleteItem('ams_mission_positions' as any, id))
      }
      for (const id of removedShips) {
        await useDirectus(deleteItem('ams_mission_team_ships' as any, id))
      }
      for (const id of removedTeams) {
        await useDirectus(deleteItem('ams_mission_teams' as any, id))
      }
    }

    toast.add({
      title: isEditing.value ? 'Mission aktualisiert' : 'Mission erstellt',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    router.push(`/ams/missions/${missionId}`)
  } catch (e) {
    console.error(e)
    toast.add({
      title: 'Fehler beim Speichern',
      description: 'Bitte versuche es erneut.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: 'ams',
  auth: true,
  access_level: 2,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-rocket"
      :title="isEditing ? 'Mission bearbeiten' : 'Neue Mission erstellen'"
      :description="isEditing ? 'Ändere die Details und Teams.' : 'Plane eine neue Operation.'"
    >
      <UButton
        to="/ams/missions"
        variant="ghost"
        icon="i-lucide-arrow-left"
        label="Zurück"
      />
    </AMSPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
      <!-- Teams & Schiffe – Hauptbereich -->
      <div class="lg:col-span-2 space-y-4">
        <div class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-(--ui-primary)/10 bg-(--ui-primary)/5">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layers" class="h-4 w-4 text-(--ui-primary)" />
              <h2 class="text-sm font-semibold text-(--ui-primary) uppercase tracking-wider m-0!">Teams & Schiffe</h2>
            </div>
            <UButton
              size="sm"
              variant="outline"
              icon="i-lucide-plus"
              label="Team hinzufügen"
              @click="addTeam"
            />
          </div>

          <div class="p-5 space-y-4">
            <div v-if="!teams.length" class="text-center py-10 text-(--ui-muted-foreground) text-sm">
              <UIcon name="i-lucide-users" class="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Noch keine Teams. Klicke auf "Team hinzufügen".</p>
            </div>

            <div
              v-for="(team, ti) in teams"
              :key="ti"
              class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg)/50 overflow-hidden"
            >
              <!-- Team Header -->
              <div class="flex items-center gap-3 px-4 py-3 bg-(--ui-primary)/5 border-b border-(--ui-primary)/10">
                <span class="text-xs font-bold text-(--ui-primary)/50 w-5 text-center shrink-0">{{ ti + 1 }}</span>
                <UInput
                  v-model="team.name"
                  placeholder="Team Name"
                  variant="ghost"
                  class="flex-1 font-semibold"
                />
                <UInput
                  v-model="team.description"
                  placeholder="Beschreibung (optional)"
                  variant="ghost"
                  class="flex-1 hidden sm:block text-sm text-(--ui-muted-foreground)"
                />
                <UButton
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  @click="removeTeam(ti)"
                />
              </div>

              <!-- Schiffe -->
              <div class="divide-y divide-(--ui-primary)/5">
                <div v-if="!team.ships.length" class="px-4 py-3 text-sm text-(--ui-muted-foreground) text-center">
                  Kein Schiff zugewiesen.
                </div>

                <div
                  v-for="(ship, si) in team.ships"
                  :key="si"
                  class="px-4 py-3 space-y-3"
                >
                  <!-- Schiff auswählen -->
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-rocket" class="h-4 w-4 text-(--ui-primary)/50 shrink-0" />
                    <USelectMenu
                      v-model="ship.hangar_id"
                      :items="fleetOptions"
                      value-key="value"
                      label-key="label"
                      placeholder="Schiff aus der Flotte wählen…"
                      class="flex-1"
                      searchable
                    />
                    <UButton
                      size="xs"
                      color="error"
                      variant="ghost"
                      icon="i-lucide-x"
                      @click="removeShip(team, si)"
                    />
                  </div>

                  <!-- Positionen -->
                  <div v-if="ship.positions.length" class="ml-6 space-y-2">
                    <div
                      v-for="(pos, pi) in ship.positions"
                      :key="pi"
                      class="flex items-center gap-2"
                    >
                      <USelectMenu
                        v-model="pos.role"
                        :items="ROLE_OPTIONS"
                        value-key="value"
                        label-key="label"
                        class="w-40 shrink-0"
                      />
                      <USelectMenu
                        v-model="pos.assigned_user"
                        :items="employeeOptions"
                        value-key="value"
                        label-key="label"
                        placeholder="Direkt zuweisen (optional)"
                        class="flex-1"
                        searchable
                        clearable
                      />
                      <UButton
                        size="xs"
                        color="error"
                        variant="ghost"
                        icon="i-lucide-minus"
                        @click="removePosition(ship, pi)"
                      />
                    </div>
                  </div>

                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-plus"
                    label="Position hinzufügen"
                    class="ml-6"
                    @click="addPosition(ship)"
                  />
                </div>
              </div>

              <!-- Schiff hinzufügen -->
              <div class="px-4 py-2 border-t border-(--ui-primary)/5 bg-(--ui-bg-muted)/20">
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-plus"
                  label="Schiff hinzufügen"
                  @click="addShip(team)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details Sidebar -->
      <div class="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <div class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 p-5 space-y-4">
          <h2 class="text-xs font-semibold text-(--ui-primary) uppercase tracking-wider mt-0!">Mission Details</h2>

          <UFormField label="Titel" required>
            <UInput v-model="form.title" placeholder="z.B. Operation Silberstern" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Typ">
              <USelectMenu
                v-model="form.mission_type"
                :items="TYPE_OPTIONS"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Status">
              <USelectMenu
                v-model="form.status"
                :items="STATUS_OPTIONS"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Datum & Uhrzeit">
            <UInput v-model="form.planned_date" type="datetime-local" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Treffpunkt">
              <UInput v-model="form.location" placeholder="Port Olisar…" class="w-full" />
            </UFormField>
            <UFormField label="Startort">
              <UInput v-model="form.start_location" placeholder="Lorville…" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Max. Teilnehmer" hint="0 = unbegrenzt">
            <UInput v-model.number="form.max_members" type="number" min="0" class="w-full" />
          </UFormField>

          <UFormField label="Beschreibung">
            <UTextarea
              v-model="form.description"
              placeholder="Ziele, Regeln, Infos…"
              :rows="4"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="flex flex-col gap-2">
          <UButton
            :loading="loading"
            icon="i-lucide-save"
            :label="isEditing ? 'Änderungen speichern' : 'Mission erstellen'"
            class="w-full justify-center"
            @click="save"
          />
          <UButton to="/ams/missions" variant="ghost" label="Abbrechen" class="w-full justify-center" />
        </div>
      </div>
    </div>
  </div>
</template>

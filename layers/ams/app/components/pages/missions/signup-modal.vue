<script setup lang="ts">
import { createItem, updateItem } from '@directus/sdk'
import { getMissionRoleLabel, getMissionRoleSort, shipHasMissionRoles } from '~~/app/utils/ams-mission-roles'

const props = defineProps<{
  open: boolean
  missionId: string
  target: { type: 'flex' | 'flex_team' | 'position'; team?: any; ship?: any; position?: any } | null
  signupAllowed: boolean
  signupClosedMessage: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'registered'): void
}>()

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)
const toast = useToast()

const note = ref('')
const loading = ref(false)

const POSITION_TYPE_BADGE_LABELS = {
  primary: 'Primär',
  secondary: 'Sekundär',
} as const

function normalizePositionType(value?: string | null) {
  return value === 'secondary' ? 'secondary' : 'primary'
}

function getShipRoleSource() {
  return props.target?.ship?.hangar_id?.ship ?? null
}

function shouldUseShipPositionSort(positionType?: string | null) {
  return shipHasMissionRoles(
    getShipRoleSource(),
    normalizePositionType(positionType),
  )
}

function shouldPairShipPositionsBySort() {
  return (
    shouldUseShipPositionSort('primary') &&
    shouldUseShipPositionSort('secondary')
  )
}

function getPositionPairSort(position?: any) {
  if (!shouldUseShipPositionSort(position?.position_type)) {
    return null
  }

  if (typeof position?.sort === 'number') {
    return position.sort
  }

  return getMissionRoleSort(
    position?.role,
    getShipRoleSource(),
    normalizePositionType(position?.position_type),
  )
}

function compareShipPositionsByPairSort(left: any, right: any) {
  const leftSort = getPositionPairSort(left)
  const rightSort = getPositionPairSort(right)

  if (leftSort !== rightSort) {
    if (leftSort == null) return 1
    if (rightSort == null) return -1
    return leftSort - rightSort
  }

  const leftLabel = getMissionRoleLabel(
    left?.role,
    getShipRoleSource(),
    normalizePositionType(left?.position_type),
  )
  const rightLabel = getMissionRoleLabel(
    right?.role,
    getShipRoleSource(),
    normalizePositionType(right?.position_type),
  )

  return leftLabel.localeCompare(rightLabel, 'de')
}

function getSortedShipPositionsByType(shipPositions: any[], positionType: 'primary' | 'secondary') {
  const positions = shipPositions.filter(
    (position: any) => normalizePositionType(position.position_type) === positionType,
  )

  if (!shouldUseShipPositionSort(positionType)) {
    return positions
  }

  return [...positions].sort(compareShipPositionsByPairSort)
}

const modalOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const typeLabel = computed(() => {
  if (!props.target) return ''
  if (props.target.type === 'flex') return 'Flex-Anmeldung (gesamte Mission)'
  if (props.target.type === 'flex_team')
    return `Flex-Anmeldung im Team: ${props.target.team?.name}`
  const roleLabel = getMissionRoleLabel(
    props.target.position?.role,
    props.target.ship?.hangar_id?.ship ?? null,
    normalizePositionType(props.target.position?.position_type),
  )
  const positionTypeLabel =
    POSITION_TYPE_BADGE_LABELS[normalizePositionType(props.target.position?.position_type)]
  return `${positionTypeLabel}: ${roleLabel}${props.target.team ? ` (${props.target.team.name})` : ''}`
})

const requiresApproval = computed(() => props.target?.type === 'position')

async function submit() {
  if (!props.target || !currentUser.value) return
  if (!props.signupAllowed) {
    toast.add({
      title: 'Anmeldung geschlossen',
      description: props.signupClosedMessage,
      color: 'warning',
      icon: 'i-lucide-ban',
    })
    return
  }

  loading.value = true
  try {
    await useDirectus(
      createItem('ams_mission_registrations' as any, {
        mission: props.missionId,
        user: currentUser.value.id,
        type: props.target.type,
        team: props.target.team?.id ?? null,
        position: props.target.position?.id ?? null,
        status: requiresApproval.value ? 'pending' : 'approved',
        note: note.value || null,
      }),
    )

    if (props.target.type === 'position' && props.target.position?.id) {
      await useDirectus(
        updateItem('ams_mission_positions' as any, props.target.position.id, {
          status: 'pending',
        }),
      )
    }

    // Auto-Anmeldung für gekoppelte sekundäre Position (gleicher Rollen-Sort)
    if (
      props.target.type === 'position' &&
      normalizePositionType(props.target.position?.position_type) === 'primary'
    ) {
      const primarySort = shouldPairShipPositionsBySort()
        ? getPositionPairSort(props.target.position)
        : null
      const shipPositions: any[] = props.target.ship?.positions ?? []
      const secondaryPositions = getSortedShipPositionsByType(shipPositions, 'secondary')

      let openSecondary: any = null
      if (primarySort != null) {
        openSecondary =
          secondaryPositions.find(
            (p: any) =>
              getPositionPairSort(p) === primarySort && p.status === 'open',
          ) ?? null
      } else {
        // Fallback for default roles: pair by index
        const primaryPositions = getSortedShipPositionsByType(shipPositions, 'primary')
        const primaryIndex = primaryPositions.findIndex(
          (p: any) => p.id === props.target?.position?.id,
        )
        if (primaryIndex !== -1) {
          const candidate = secondaryPositions[primaryIndex]
          openSecondary = candidate?.status === 'open' ? candidate : null
        }
      }
      if (openSecondary) {
        await useDirectus(
          createItem('ams_mission_registrations' as any, {
            mission: props.missionId,
            user: currentUser.value.id,
            type: 'position',
            team: props.target.team?.id ?? null,
            position: openSecondary.id,
            status: 'pending',
            note: null,
          }),
        )
        await useDirectus(
          updateItem('ams_mission_positions' as any, openSecondary.id, {
            status: 'pending',
          }),
        )
      }
    }

    toast.add({
      title: 'Angemeldet!',
      description: requiresApproval.value
        ? 'Deine Anfrage wird vom Mission Planner geprüft.'
        : 'Du bist erfolgreich angemeldet.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    emit('registered')
    modalOpen.value = false
    note.value = ''
  } catch {
    toast.add({
      title: 'Fehler',
      description: 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    loading.value = false
  }
}

watch(
  () => props.open,
  (v) => { if (!v) note.value = '' },
)
</script>

<template>
  <UModal v-model:open="modalOpen" title="Mission: Anmelden">
    <template #content>
      <UCard variant="amsModal">
        <template #header>
          <h2 class="text-lg font-bold">Mission: Anmelden</h2>
        </template>
        <template #default>
          <div class="space-y-4">
            <div class="rounded-lg border border-(--ui-primary)/20 bg-(--ui-primary)/5 p-3">
              <p class="text-sm font-medium text-white">{{ typeLabel }}</p>
            </div>

            <UFormField label="Anmerkung (optional)">
              <UTextarea
                v-model="note"
                placeholder="Kurze Nachricht an den Mission Planner..."
                :rows="3"
                class="w-full"
              />
            </UFormField>

            <UAlert
              v-if="requiresApproval"
              color="warning"
              variant="subtle"
              icon="i-lucide-clock"
              title="Genehmigung erforderlich"
              description="Die Anmeldung auf eine feste Position muss vom Mission Planner genehmigt werden."
            />

            <UAlert
              v-if="!signupAllowed"
              color="warning"
              variant="subtle"
              icon="i-lucide-ban"
              title="Anmeldung geschlossen"
              :description="signupClosedMessage"
            />

            <div class="flex justify-end gap-2 pt-1">
              <UButton variant="ghost" @click="modalOpen = false">Abbrechen</UButton>
              <UButton
                :disabled="!signupAllowed"
                :loading="loading"
                icon="i-lucide-user-plus"
                label="Anmelden"
                @click="submit"
              />
            </div>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

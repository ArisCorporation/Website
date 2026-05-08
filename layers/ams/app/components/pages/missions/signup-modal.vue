<script setup lang="ts">
import { createItem, updateItem } from '@directus/sdk'
import { getMissionRoleLabel } from '~~/app/utils/ams-mission-roles'

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

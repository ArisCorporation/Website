<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { MissionPlannerForm } from '~~/types'
import UInputTime from '~/components/UInputTime.vue'

const form = defineModel<MissionPlannerForm>('form', { required: true })
const plannedCalendarDate = defineModel<DateValue | undefined>(
  'plannedCalendarDate',
  { required: true }
)
const plannedTime = defineModel<string>('plannedTime', { required: true })

const props = withDefaults(
  defineProps<{
    section?: 'all' | 'basics' | 'planning'
    typeOptions: Array<{ label: string; value: string }>
    statusOptions: Array<{ label: string; value: string }>
    plannedDateSummary: string
    plannedCalendarUi: Record<string, string>
    plannedTimeDefaultValue: string
    totalDraftPrimarySummary: string
    totalDraftSecondarySummary: string
    totalDraftPositionsHint: string
    showActions?: boolean
    loading?: boolean
    submitLabel?: string
    cancelTo?: string
    splitDateTime?: boolean
  }>(),
  {
    section: 'all',
    showActions: false,
    loading: false,
    submitLabel: 'Speichern',
    cancelTo: '/ams/missions',
    splitDateTime: false,
  }
)

const emit = defineEmits<{
  save: []
}>()

const plannedDateModel = computed<DateValue | undefined>({
  get: () => plannedCalendarDate.value,
  set: (value) => {
    plannedCalendarDate.value = value

    if (value && !plannedTime.value) {
      plannedTime.value = props.plannedTimeDefaultValue
    }
  },
})

function clearPlannedDate() {
  plannedCalendarDate.value = undefined
  plannedTime.value = ''
}

const showBasics = computed(
  () => props.section === 'all' || props.section === 'basics'
)
const showPlanning = computed(
  () => props.section === 'all' || props.section === 'planning'
)
const showDuration = computed(
  () => props.section === 'all' || props.section === 'planning'
)
const showRoleSummary = computed(() => props.section === 'all')
const cardTitle = computed(() => {
  switch (props.section) {
    case 'basics':
      return 'Basisdaten'
    case 'planning':
      return 'Termin & Details'
    default:
      return 'Mission Details'
  }
})
</script>

<template>
  <div class="space-y-4">
    <div
      class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 p-5 space-y-4"
    >
      <h2
        class="mt-0! text-xs font-semibold uppercase tracking-wider text-(--ui-primary)"
      >
        {{ cardTitle }}
      </h2>

      <template v-if="showBasics">
        <UFormField label="Titel" required>
          <UInput
            v-model="form.title"
            placeholder="z.B. Operation Silberstern"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Typ">
            <USelectMenu
              v-model="form.mission_type"
              :items="typeOptions"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Status">
            <USelectMenu
              v-model="form.status"
              :items="statusOptions"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Treffpunkt">
            <UInput
              v-model="form.start_location"
              placeholder="Port Olisar…"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Missionsort">
            <UInput
              v-model="form.location"
              placeholder="Lorville…"
              class="w-full"
            />
          </UFormField>
        </div>

      </template>

      <template v-if="showPlanning">
        <div
          v-if="showDuration || showRoleSummary"
          :class="
            showDuration && showRoleSummary ? 'grid grid-cols-2 gap-3' : 'space-y-3'
          "
        >
          <UFormField
            v-if="showDuration"
            label="Vorr. Dauer"
            hint="in Stunden, z.B. 1,5"
            required
          >
            <UInput
              v-model="form.duration_hours"
              inputmode="decimal"
              placeholder="z.B. 2,5"
              class="w-full"
            />
          </UFormField>

          <div
            v-if="showRoleSummary"
            class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5"
          >
            <p
              class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-text-muted)"
            >
              Rollenübersicht
            </p>
            <p class="mt-1 text-sm font-medium text-white">
              Primär {{ totalDraftPrimarySummary }}
            </p>
            <p class="mt-1 text-sm font-medium text-white">
              Sekundär {{ totalDraftSecondarySummary }}
            </p>
            <p class="mt-1 text-xs text-(--ui-text-muted)">
              {{ totalDraftPositionsHint }}
            </p>
          </div>
        </div>

        <UFormField label="Beschreibung">
          <UTextarea
            v-model="form.description"
            placeholder="Ziele, Regeln, Infos…"
            :rows="4"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Datum & Uhrzeit">
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-(--ui-text-muted)">
                {{ plannedDateSummary }}
              </p>
              <UButton
                v-if="plannedCalendarDate"
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                label="Leeren"
                @click="clearPlannedDate"
              />
            </div>

            <div
              :class="
                splitDateTime
                  ? 'grid gap-3 md:grid-cols-2'
                  : 'space-y-3'
              "
            >
              <div
                class="relative overflow-hidden rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-white/5 backdrop-blur-sm"
              >
                <div
                  aria-hidden="true"
                  class="pointer-events-none absolute inset-x-6 top-0 h-20 rounded-full bg-(--ui-primary)/10 blur-3xl not-prose"
                />
                <UCalendar
                  v-model="plannedDateModel"
                  :week-starts-on="1"
                  calendar-label="Missionsdatum"
                  size="xs"
                  variant="outline"
                  class="relative w-full not-prose!"
                  :ui="plannedCalendarUi"
                />
              </div>

              <div
                v-if="splitDateTime"
                class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-white/5 backdrop-blur-sm"
              >
                <p
                  class="mb-3 text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-text-muted)"
                >
                  Uhrzeit
                </p>
                <UInputTime
                  v-model="plannedTime"
                  :hour-cycle="24"
                  :default-value="plannedTimeDefaultValue"
                  class="w-full"
                  :disabled="!plannedCalendarDate"
                />
              </div>

              <UInputTime
                v-else
                v-model="plannedTime"
                :hour-cycle="24"
                :default-value="plannedTimeDefaultValue"
                class="w-full"
                :disabled="!plannedCalendarDate"
              />
            </div>
          </div>
        </UFormField>
      </template>
    </div>

    <div v-if="showActions" class="flex flex-col gap-2">
      <UButton
        :loading="loading"
        icon="i-lucide-save"
        :label="submitLabel"
        class="w-full justify-center"
        @click="emit('save')"
      />
      <UButton
        :to="cancelTo"
        variant="ghost"
        label="Abbrechen"
        class="w-full justify-center"
      />
    </div>
  </div>
</template>

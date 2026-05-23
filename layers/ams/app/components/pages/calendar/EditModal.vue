<script setup lang="ts">
import { CalendarDate, Time, today, getLocalTimeZone } from '@internationalized/date'
import type { CalendarEvent } from '../../../pages/ams/calendar/index.vue'

const props = defineProps<{
  open: boolean
  event: CalendarEvent | null
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  updated: []
  deleted: []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

// ─── Options ───────────────────────────────────────────────────────────────────

const RECURRENCE_UNITS = [
  { label: 'Nicht wiederholen', value: '' },
  { label: 'Tage', value: 'days' },
  { label: 'Wochen', value: 'weeks' },
  { label: 'Monate', value: 'months' },
]

const PRESET_COLORS = [
  { label: 'Teal', value: '#00e2cf' },
  { label: 'Blau', value: '#3b82f6' },
  { label: 'Lila', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Rot', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Gelb', value: '#eab308' },
  { label: 'Grün', value: '#22c55e' },
]

// ─── Form state ────────────────────────────────────────────────────────────────

function parseDateStr(str: string): CalendarDate {
  const [y, m, d] = str.slice(0, 10).split('-').map(Number)
  return new CalendarDate(y, m, d)
}

function parseTimeStr(str: string, fallback: string): Time {
  const [fh, fm] = fallback.split(':').map(Number)
  if (!str.includes('T')) return new Time(fh, fm)
  const [h, m] = str.slice(11, 16).split(':').map(Number)
  return new Time(h, m)
}

function addHour(t: Time): Time {
  return new Time(Math.min(t.hour + 1, 23), t.minute)
}

function makeDefault(event: CalendarEvent | null) {
  if (!event) {
    const t = today(getLocalTimeZone())
    return {
      name: '',
      all_day: false,
      startDate: t as CalendarDate | null,
      startTime: new Time(19, 0) as Time | null,
      endDate: t as CalendarDate | null,
      endTime: new Time(20, 0) as Time | null,
      description: '',
      location: '',
      department: '',
      color: '#00e2cf',
      tagsInput: '',
      recurrenceUnit: '',
      recurrenceInterval: 1,
      recurrenceEnd: null as CalendarDate | null,
    }
  }
  const startTime = parseTimeStr(event.start, '19:00')
  const endTime = parseTimeStr(event.end, '20:00')
  return {
    name: event.name,
    all_day: event.all_day,
    startDate: parseDateStr(event.start) as CalendarDate | null,
    startTime: startTime as Time | null,
    endDate: parseDateStr(event.end) as CalendarDate | null,
    endTime: endTime as Time | null,
    description: event.description ?? '',
    location: event.location ?? '',
    department: event.department ?? '',
    color: event.color ?? '#00e2cf',
    tagsInput: event.tags ?? '',
    recurrenceUnit: event.recurrence ?? '',
    recurrenceInterval: event.recurrence_interval ?? 1,
    recurrenceEnd: event.recurrence_end ? parseDateStr(event.recurrence_end) as CalendarDate | null : null as CalendarDate | null,
  }
}

const form = shallowReactive(makeDefault(null))
const loading = ref(false)
const deleteLoading = ref(false)
const confirmDelete = ref(false)
const error = ref<string | null>(null)
const startDateOpen = ref(false)
const endDateOpen = ref(false)
const recurrenceEndOpen = ref(false)

watch(() => props.open, (open) => {
  if (open && props.event) {
    Object.assign(form, makeDefault(props.event))
    error.value = null
    confirmDelete.value = false
  }
})

watch(() => form.all_day, (allDay) => {
  if (!allDay) {
    if (!form.startTime) form.startTime = new Time(19, 0)
    if (!form.endTime) {
      form.endTime = addHour(form.startTime)
    } else {
      const startMins = form.startTime.hour * 60 + form.startTime.minute
      const endMins = form.endTime.hour * 60 + form.endTime.minute
      if (endMins <= startMins) form.endTime = addHour(form.startTime)
    }
  }
})

const dateFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

function formatCalDate(date: CalendarDate | null): string {
  if (!date) return 'Datum wählen'
  return dateFmt.format(new Date(date.year, date.month - 1, date.day))
}

// ─── Submit ────────────────────────────────────────────────────────────────────

async function handleSubmit() {
  if (loading.value || !props.event) return
  if (!form.name.trim()) { error.value = 'Titel ist erforderlich.'; return }
  if (!form.startDate || !form.endDate) { error.value = 'Start- und Enddatum sind erforderlich.'; return }

  const p = (n: number) => String(n).padStart(2, '0')
  const startIso = form.all_day
    ? `${form.startDate.toString()}T00:00:00`
    : `${form.startDate.toString()}T${p(form.startTime!.hour)}:${p(form.startTime!.minute)}:00`
  const endIso = form.all_day
    ? `${form.endDate.toString()}T23:59:59`
    : `${form.endDate.toString()}T${p(form.endTime!.hour)}:${p(form.endTime!.minute)}:00`

  if (new Date(endIso) <= new Date(startIso)) {
    error.value = 'Endzeit muss nach der Startzeit liegen.'
    return
  }

  const tags = form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean).join(',')

  error.value = null
  loading.value = true
  try {
    await $fetch(`/api/proxy/items/calendar/${props.event.id}`, {
      method: 'PATCH',
      body: {
        name: form.name.trim(),
        start: startIso,
        end: endIso,
        all_day: form.all_day,
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        department: form.department.trim() || null,
        color: form.color || null,
        tags: tags || null,
        recurrence: form.recurrenceUnit || null,
        recurrence_interval: form.recurrenceUnit ? (form.recurrenceInterval || 1) : null,
        recurrence_end: form.recurrenceUnit && form.recurrenceEnd ? form.recurrenceEnd.toString() : null,
      },
    })
    emit('updated')
    isOpen.value = false
  } catch (e: unknown) {
    error.value = `Termin konnte nicht gespeichert werden: ${e instanceof Error ? e.message : 'Unbekannter Fehler.'}`
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (deleteLoading.value || !props.event) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/proxy/items/calendar/${props.event.id}`, { method: 'DELETE' })
    emit('deleted')
    isOpen.value = false
  } catch (e: unknown) {
    error.value = `Termin konnte nicht gelöscht werden: ${e instanceof Error ? e.message : 'Unbekannter Fehler.'}`
  } finally {
    deleteLoading.value = false
    confirmDelete.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      content: 'max-w-2xl bg-(--ui-bg-muted)/90 backdrop-blur-md border border-(--ui-border)',
      header: 'border-b border-(--ui-border) pb-3',
    }"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <p class="text-[0.6rem] uppercase tracking-widest text-(--ui-text-muted)">Termin bearbeiten</p>
          <h3 class="text-lg font-bold text-(--ui-text-highlighted)">{{ event?.name }}</h3>
        </div>
        <template v-if="!confirmDelete">
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            title="Termin löschen"
            @click="confirmDelete = true"
          />
        </template>
        <template v-else>
          <div class="flex items-center gap-2">
            <p class="text-xs text-(--ui-text-muted)">Wirklich löschen?</p>
            <UButton size="xs" color="error" :loading="deleteLoading" @click="handleDelete">Ja, löschen</UButton>
            <UButton size="xs" color="neutral" variant="ghost" @click="confirmDelete = false">Abbrechen</UButton>
          </div>
        </template>
      </div>
    </template>

    <template #body>
      <form class="space-y-4" @submit.prevent="handleSubmit">

        <!-- Title -->
        <UFormField label="Titel" required>
          <UInput v-model="form.name" placeholder="z.B. Operation Horizon" autocomplete="off" class="w-full" />
        </UFormField>

        <!-- All-day toggle -->
        <div class="flex items-center justify-between rounded-lg border border-(--ui-border) px-3 py-2.5">
          <div>
            <p class="text-sm font-medium text-(--ui-text)">Ganztägig</p>
            <p class="text-xs text-(--ui-text-muted)">Kein bestimmter Startzeitpunkt</p>
          </div>
          <USwitch v-model="form.all_day" color="primary" />
        </div>

        <!-- Date / Time -->
        <div class="grid gap-3 sm:grid-cols-2">
          <UFormField label="Startdatum" required>
            <UPopover v-model:open="startDateOpen">
              <UButton
                variant="outline"
                color="neutral"
                icon="i-lucide-calendar"
                trailing
                class="w-full justify-between font-normal"
              >
                {{ formatCalDate(form.startDate) }}
              </UButton>
              <template #content>
                <UCalendar
                  :model-value="form.startDate ?? undefined"
                  :week-starts-on="1"
                  class="p-2"
                  @update:model-value="(v) => { form.startDate = v as CalendarDate; startDateOpen = false }"
                />
              </template>
            </UPopover>
          </UFormField>
          <UFormField v-if="!form.all_day" label="Startzeit">
            <UInputTime v-model="form.startTime" :hour-cycle="24" granularity="minute" class="w-full" />
          </UFormField>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <UFormField label="Enddatum" required>
            <UPopover v-model:open="endDateOpen">
              <UButton
                variant="outline"
                color="neutral"
                icon="i-lucide-calendar"
                trailing
                class="w-full justify-between font-normal"
              >
                {{ formatCalDate(form.endDate) }}
              </UButton>
              <template #content>
                <UCalendar
                  :model-value="form.endDate ?? undefined"
                  :week-starts-on="1"
                  class="p-2"
                  @update:model-value="(v) => { form.endDate = v as CalendarDate; endDateOpen = false }"
                />
              </template>
            </UPopover>
          </UFormField>
          <UFormField v-if="!form.all_day" label="Endzeit">
            <UInputTime v-model="form.endTime" :hour-cycle="24" granularity="minute" class="w-full" />
          </UFormField>
        </div>

        <!-- Location + Department -->
        <div class="grid gap-3 sm:grid-cols-2">
          <UFormField label="Ort">
            <UInput v-model="form.location" placeholder="z.B. Everus Harbor – Hangar 02" autocomplete="off" class="w-full" />
          </UFormField>
          <UFormField label="Abteilung">
            <UInput v-model="form.department" placeholder="z.B. Sicherheit" autocomplete="off" class="w-full" />
          </UFormField>
        </div>

        <!-- Description -->
        <UFormField label="Beschreibung">
          <UTextarea
            v-model="form.description"
            placeholder="Kurzer Überblick über Ziel und Ablauf …"
            :rows="3"
            spellcheck="false"
            class="w-full"
          />
        </UFormField>

        <!-- Color picker -->
        <UFormField label="Farbe">
          <div class="flex flex-wrap gap-2 mt-1">
            <button
              v-for="preset in PRESET_COLORS"
              :key="preset.value"
              type="button"
              class="size-7 rounded-full border-2 transition-transform hover:scale-110"
              :style="{
                backgroundColor: preset.value,
                borderColor: form.color === preset.value ? preset.value : 'transparent',
                outline: form.color === preset.value ? `2px solid ${preset.value}` : 'none',
                outlineOffset: '2px',
              }"
              :title="preset.label"
              @click="form.color = preset.value"
            />
          </div>
        </UFormField>

        <!-- Tags -->
        <UFormField label="Tags" hint="Komma-getrennt">
          <UInput v-model="form.tagsInput" placeholder="z.B. Einsatz, Flug, Training" autocomplete="off" class="w-full" />
        </UFormField>

        <!-- Recurrence -->
        <div class="space-y-3">
          <UFormField label="Wiederholung">
            <div class="flex items-center gap-2">
              <span class="text-sm text-(--ui-text-muted) shrink-0 w-6">Alle</span>
              <UInput
                v-model.number="form.recurrenceInterval"
                type="number"
                min="1"
                max="365"
                :disabled="!form.recurrenceUnit"
                class="w-20"
              />
              <select
                v-model="form.recurrenceUnit"
                class="flex-1 rounded-md border border-(--ui-border) bg-(--ui-bg) px-3 py-2 text-sm text-(--ui-text) focus:outline-none focus:ring-2 focus:ring-(--color-aris-500)/40 transition-shadow"
              >
                <option v-for="opt in RECURRENCE_UNITS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          </UFormField>
          <UFormField v-if="form.recurrenceUnit" label="Wiederholen bis" hint="Leer = unbegrenzt">
            <div class="flex items-center gap-2">
              <UPopover v-model:open="recurrenceEndOpen" class="flex-1">
                <UButton
                  variant="outline"
                  color="neutral"
                  icon="i-lucide-calendar"
                  trailing
                  class="w-full justify-between font-normal"
                >
                  {{ formatCalDate(form.recurrenceEnd) }}
                </UButton>
                <template #content>
                  <UCalendar
                    :model-value="form.recurrenceEnd ?? undefined"
                    :week-starts-on="1"
                    class="p-2"
                    @update:model-value="(v) => { form.recurrenceEnd = v as CalendarDate; recurrenceEndOpen = false }"
                  />
                </template>
              </UPopover>
              <UButton
                v-if="form.recurrenceEnd"
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                type="button"
                @click="form.recurrenceEnd = null"
              />
            </div>
          </UFormField>
        </div>

        <!-- Error -->
        <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-alert-triangle" :description="error" />

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-1">
          <UButton type="button" color="neutral" variant="subtle" @click="isOpen = false">Abbrechen</UButton>
          <UButton type="submit" :loading="loading">Änderungen speichern</UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>

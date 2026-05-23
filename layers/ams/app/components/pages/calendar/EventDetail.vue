<script setup lang="ts">
import type { CalendarEvent } from '../../../pages/ams/calendar/index.vue'

const props = defineProps<{
  event: CalendarEvent
  isSubscribed: boolean
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  subscribe: [eventId: string, action: 'subscribe' | 'unsubscribe']
  edit: [event: CalendarEvent]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const subscribing = ref(false)

async function toggleSubscribe() {
  subscribing.value = true
  try {
    const action = props.isSubscribed ? 'unsubscribe' : 'subscribe'
    emit('subscribe', props.event.id, action)
  } finally {
    subscribing.value = false
  }
}

// ─── Formatting ────────────────────────────────────────────────────────────────

const dtFmt = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const dateFmt = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function formatDate(iso: string, allDay: boolean): string {
  return allDay ? dateFmt.format(new Date(iso)) : dtFmt.format(new Date(iso))
}

function parseTags(tags: string | null): string[] {
  if (!tags) return []
  return tags.split(',').map((t) => t.trim()).filter(Boolean)
}

function eventColor(): string {
  return props.event.color ?? '#00e2cf'
}

const UNIT_LABELS: Record<string, [string, string]> = {
  // [singular (interval=1), plural (interval>1)]
  days: ['Täglich', 'Tage'],
  weeks: ['Wöchentlich', 'Wochen'],
  months: ['Monatlich', 'Monate'],
  years: ['Jährlich', 'Jahre'],
}

const recurrenceLabel = computed(() => {
  const unit = props.event.recurrence
  if (!unit) return ''
  const interval = props.event.recurrence_interval ?? 1
  const labels = UNIT_LABELS[unit]
  if (!labels) return unit
  return interval === 1 ? labels[0] : `Alle ${interval} ${labels[1]}`
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      content: 'max-w-lg bg-(--ui-bg-muted)/90 backdrop-blur-md border border-(--ui-border)',
      header: 'border-b border-(--ui-border) pb-3',
    }"
  >
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <!-- Color dot -->
          <div
            class="size-3 rounded-full shrink-0 mt-0.5"
            :style="{ backgroundColor: eventColor() }"
          />
          <div class="min-w-0">
            <p class="text-[0.6rem] uppercase tracking-widest text-(--ui-text-muted) mb-0.5">Termin</p>
            <h3 class="text-base font-bold text-(--ui-text-highlighted) leading-tight">
              {{ event.name }}
            </h3>
          </div>
        </div>
        <!-- Bell button -->
        <UButton
          :icon="isSubscribed ? 'i-lucide-bell' : 'i-lucide-bell-off'"
          :color="isSubscribed ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
          :loading="subscribing"
          :title="isSubscribed ? 'Abonnement beenden' : 'Termin abonnieren'"
          @click="toggleSubscribe"
        />
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Date / Time -->
        <div class="flex items-start gap-2.5">
          <UIcon name="i-lucide-clock" class="size-4 text-(--color-aris-500) shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-(--ui-text-highlighted)">
              {{ formatDate(event.start, event.all_day) }}
            </p>
            <p v-if="event.end && event.end !== event.start" class="text-sm text-(--ui-text-muted)">
              bis {{ formatDate(event.end, event.all_day) }}
            </p>
            <UBadge v-if="event.all_day" color="neutral" variant="soft" size="xs" class="mt-1">Ganztägig</UBadge>
          </div>
        </div>

        <!-- Location -->
        <div v-if="event.location" class="flex items-start gap-2.5">
          <UIcon name="i-lucide-map-pin" class="size-4 text-(--color-aris-500) shrink-0 mt-0.5" />
          <p class="text-sm text-(--ui-text)">{{ event.location }}</p>
        </div>

        <!-- Department -->
        <div v-if="event.department" class="flex items-start gap-2.5">
          <UIcon name="i-lucide-briefcase" class="size-4 text-(--color-aris-500) shrink-0 mt-0.5" />
          <p class="text-sm text-(--ui-text)">{{ event.department }}</p>
        </div>

        <!-- Description -->
        <div v-if="event.description" class="rounded-lg bg-(--ui-bg-elevated) border border-(--ui-border) p-3">
          <p class="text-sm text-(--ui-text-muted) leading-relaxed whitespace-pre-wrap">{{ event.description }}</p>
        </div>

        <!-- Recurrence -->
        <div v-if="event.recurrence" class="flex items-start gap-2.5">
          <UIcon name="i-lucide-repeat-2" class="size-4 text-(--color-aris-500) shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-(--ui-text)">{{ recurrenceLabel }}</p>
            <p v-if="event.recurrence_end" class="text-xs text-(--ui-text-muted)">
              bis {{ new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(event.recurrence_end)) }}
            </p>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="event.tags" class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="tag in parseTags(event.tags)"
            :key="tag"
            color="primary"
            variant="subtle"
            size="xs"
            class="uppercase tracking-wide"
          >
            {{ tag }}
          </UBadge>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between">
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="subtle"
          @click="isOpen = false; emit('edit', event)"
        >
          Bearbeiten
        </UButton>
        <UButton color="neutral" variant="subtle" @click="isOpen = false">Schließen</UButton>
      </div>
    </template>
  </UModal>
</template>

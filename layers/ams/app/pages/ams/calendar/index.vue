<script setup lang="ts">
export interface CalendarEvent {
  id: string
  name: string
  start: string
  end: string
  all_day: boolean
  color: string | null
  location: string | null
  department: string | null
  description: string | null
  tags: string | null
  status: 'published' | 'draft' | 'archived'
  recurrence: 'days' | 'weeks' | 'months' | 'years' | null
  recurrence_interval: number | null
  recurrence_end: string | null
  _recurring?: boolean // runtime-only: set by expandCalendarEvents for generated occurrences
}

definePageMeta({
  layout: 'ams',
  auth: true,
})

const authStore = useAuthStore()
const { currentUserId } = storeToRefs(authStore)

const view = ref<'month' | 'week'>('month')
const createModalOpen = ref(false)
const createModalStart = ref<string | undefined>(undefined)
const createModalEnd = ref<string | undefined>(undefined)
const editModalOpen = ref(false)
const editModalEvent = ref<CalendarEvent | null>(null)

const {
  data: eventsData,
  refresh: refreshEvents,
} = await useAsyncData<CalendarEvent[]>('ams:calendar-events', async () => {
  const res = await $fetch<{ data: CalendarEvent[] }>('/api/proxy/items/calendar', {
    query: {
      'filter[status][_eq]': 'published',
      fields: 'id,name,start,end,all_day,color,location,department,tags,description,status,recurrence,recurrence_interval,recurrence_end',
      limit: -1,
      sort: 'start',
    },
  })
  return res?.data ?? []
})

const {
  data: subscriptionsData,
  refresh: refreshSubscriptions,
} = await useAsyncData<string[]>('ams:calendar-subscriptions', async () => {
  if (!currentUserId.value) return []
  const res = await $fetch<{ data: Array<{ calendar_event: string }> }>(
    '/api/proxy/items/calendar_subscriptions',
    {
      query: {
        'filter[user][_eq]': currentUserId.value,
        fields: 'calendar_event',
        limit: -1,
      },
    },
  )
  return (res?.data ?? []).map((s) => s.calendar_event)
})

const events = computed<CalendarEvent[]>(() => eventsData.value ?? [])
const subscriptions = computed<string[]>(() => subscriptionsData.value ?? [])

async function handleSubscribe(eventId: string, action: 'subscribe' | 'unsubscribe') {
  await $fetch('/api/ams/calendar/subscribe', {
    method: 'POST',
    body: { eventId, action },
  })
  await refreshSubscriptions()
}

async function handleEventCreated() {
  createModalOpen.value = false
  await refreshEvents()
}

function handleEventEdit(event: CalendarEvent) {
  editModalEvent.value = event
  editModalOpen.value = true
}

async function handleEventUpdated() {
  await refreshEvents()
}

async function handleEventDeleted() {
  await refreshEvents()
}

function openCreateModal(prefill?: { start: string, end?: string } | string) {
  if (typeof prefill === 'string') {
    createModalStart.value = prefill
    createModalEnd.value = undefined
  } else {
    createModalStart.value = prefill?.start
    createModalEnd.value = prefill?.end
  }
  createModalOpen.value = true
}
</script>

<template>
  <div class="space-y-6">
    <AMSPageHeader
      icon="i-lucide-calendar-range"
      title="Kalender"
      description="Plane Einsätze, Trainings und Events der ArisCorp."
    >
      <div class="flex items-center gap-2">
        <div class="flex rounded-lg border border-(--ui-border) overflow-hidden">
          <button
            class="px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors"
            :class="view === 'month' ? 'bg-(--color-aris-500) text-black' : 'text-(--ui-text-muted) hover:text-(--ui-text) hover:bg-(--ui-bg-elevated)'"
            @click="view = 'month'"
          >
            Monat
          </button>
          <button
            class="px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors"
            :class="view === 'week' ? 'bg-(--color-aris-500) text-black' : 'text-(--ui-text-muted) hover:text-(--ui-text) hover:bg-(--ui-bg-elevated)'"
            @click="view = 'week'"
          >
            Woche
          </button>
        </div>
        <UButton
          icon="i-lucide-plus"
          size="sm"
          @click="openCreateModal()"
        >
          Termin
        </UButton>
      </div>
    </AMSPageHeader>

    <AMSPagesCalendarMonthView
      v-if="view === 'month'"
      :events="events"
      :subscriptions="subscriptions"
      :current-user-id="currentUserId ?? ''"
      @create="openCreateModal"
      @subscribe="handleSubscribe"
      @event-moved="refreshEvents"
      @edit="handleEventEdit"
    />

    <AMSPagesCalendarWeekView
      v-else
      :events="events"
      :subscriptions="subscriptions"
      :current-user-id="currentUserId ?? ''"
      @create="openCreateModal"
      @subscribe="handleSubscribe"
      @event-moved="refreshEvents"
      @edit="handleEventEdit"
    />

    <AMSPagesCalendarCreateModal
      v-model:open="createModalOpen"
      :prefill-start="createModalStart"
      :prefill-end="createModalEnd"
      @created="handleEventCreated"
    />

    <AMSPagesCalendarEditModal
      v-model:open="editModalOpen"
      :event="editModalEvent"
      @updated="handleEventUpdated"
      @deleted="handleEventDeleted"
    />
  </div>
</template>

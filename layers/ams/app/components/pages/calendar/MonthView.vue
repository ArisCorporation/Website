<script setup lang="ts">
import type { CalendarEvent } from '../../../pages/ams/calendar/index.vue'

const props = defineProps<{
  events: CalendarEvent[]
  subscriptions: string[]
  currentUserId: string
}>()

const emit = defineEmits<{
  create: [prefill: { start: string, end?: string }]
  'event-click': [event: CalendarEvent]
  subscribe: [eventId: string, action: 'subscribe' | 'unsubscribe']
  'event-moved': []
  edit: [event: CalendarEvent]
}>()

// ─── Navigation ────────────────────────────────────────────────────────────────

const today = new Date()
today.setHours(0, 0, 0, 0)

const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}
function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}
function goToday() {
  currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
}

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(currentMonth.value),
)

// ─── Grid ──────────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const gridDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const firstDay = new Date(year, month, 1)
  // Monday-based week: 0=Mon…6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7

  const lastDay = new Date(year, month + 1, 0)
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

  const days: Array<{
    date: Date
    dateKey: string
    day: number
    isCurrentMonth: boolean
    isToday: boolean
  }> = []

  for (let i = 0; i < totalCells; i++) {
    const d = new Date(year, month, 1 - startOffset + i)
    d.setHours(0, 0, 0, 0)
    const dateKey = toDateKey(d)
    days.push({
      date: d,
      dateKey,
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      isToday: d.getTime() === today.getTime(),
    })
  }
  return days
})

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Expanded events (recurring) ──────────────────────────────────────────────

const expandedEvents = computed(() => {
  const days = gridDays.value
  if (!days.length) return props.events
  const start = new Date(days[0].date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(days[days.length - 1].date)
  end.setHours(23, 59, 59, 999)
  return expandCalendarEvents(props.events, start, end)
})

// ─── Events per day (including multi-day spans) ─────────────────────────────

interface EventSlot {
  event: CalendarEvent
  startKey: string
  endKey: string
  spanDays: number
  startsHere: boolean
  lane: number
}

const eventSlotsByDay = computed(() => {
  const map = new Map<string, EventSlot[]>()

  // Sort events by start, then duration desc (longer first → stable lanes)
  const sorted = [...expandedEvents.value].sort((a, b) => {
    const diff = new Date(a.start).getTime() - new Date(b.start).getTime()
    if (diff !== 0) return diff
    return new Date(b.end).getTime() - new Date(a.end).getTime()
  })

  // Assign a lane per event across the grid
  const eventLanes = new Map<string, number>()
  const lanesByDay = new Map<string, number[]>() // dateKey → occupied lane indices

  function occupyLane(dateKey: string, lane: number) {
    const arr = lanesByDay.get(dateKey) ?? []
    arr.push(lane)
    lanesByDay.set(dateKey, arr)
  }

  function findFreeLane(startKey: string, endKey: string): number {
    let lane = 0
    while (true) {
      // Check if this lane is free for all days in range
      let d = new Date(`${startKey}T00:00:00`)
      const endD = new Date(`${endKey}T00:00:00`)
      let free = true
      while (d <= endD) {
        const key = toDateKey(d)
        const occupied = lanesByDay.get(key) ?? []
        if (occupied.includes(lane)) { free = false; break }
        d.setDate(d.getDate() + 1)
      }
      if (free) return lane
      lane++
    }
  }

  for (const event of sorted) {
    const startD = new Date(event.start)
    startD.setHours(0, 0, 0, 0)
    const endD = new Date(event.end)
    // For display: multi-day events end on the day before end if end is exactly midnight
    const endDisplay = new Date(endD)
    if (!event.all_day && endD.getHours() === 0 && endD.getMinutes() === 0) {
      endDisplay.setDate(endDisplay.getDate() - 1)
    }
    endDisplay.setHours(0, 0, 0, 0)

    const startKey = toDateKey(startD)
    const endKey = toDateKey(endDisplay < startD ? startD : endDisplay)

    const lane = findFreeLane(startKey, endKey)
    eventLanes.set(event.id, lane)

    // Mark lanes as occupied
    let d = new Date(startD)
    const endOcc = new Date(endDisplay < startD ? startD : endDisplay)
    while (d <= endOcc) {
      occupyLane(toDateKey(d), lane)
      d.setDate(d.getDate() + 1)
    }

    // Calculate span per week-row
    let cur = new Date(startD)
    while (cur <= endOcc) {
      const dayOfWeek = (cur.getDay() + 6) % 7 // 0=Mon
      const daysToEndOfWeek = 6 - dayOfWeek
      const daysToEventEnd = Math.round((endOcc.getTime() - cur.getTime()) / 86400000)
      const span = Math.min(daysToEndOfWeek, daysToEventEnd) + 1
      const curKey = toDateKey(cur)
      const startsHere = curKey === startKey

      const slot: EventSlot = {
        event,
        startKey,
        endKey,
        spanDays: span,
        startsHere,
        lane,
      }

      const arr = map.get(curKey) ?? []
      arr.push(slot)
      map.set(curKey, arr)

      // Jump to next Monday (end of this week row + 1)
      cur.setDate(cur.getDate() + daysToEndOfWeek + 1)
    }
  }

  // Sort each day's slots by lane
  for (const [key, slots] of map) {
    slots.sort((a, b) => a.lane - b.lane)
    map.set(key, slots)
  }

  return map
})

const MAX_VISIBLE_LANES = 3

function daySlots(dateKey: string) {
  return eventSlotsByDay.value.get(dateKey) ?? []
}

function visibleSlots(dateKey: string) {
  const slots = daySlots(dateKey)
  // Only show slots that START on this day, up to MAX_VISIBLE_LANES
  const starting = slots.filter((s) => s.startsHere)
  return starting.slice(0, MAX_VISIBLE_LANES)
}

function overflowCount(dateKey: string) {
  const slots = daySlots(dateKey)
  const starting = slots.filter((s) => s.startsHere)
  return Math.max(0, starting.length - MAX_VISIBLE_LANES)
}

// ─── Drag to create (multi-day range) ─────────────────────────────────────────

const dragStartKey = ref<string | null>(null)
const dragEndKey = ref<string | null>(null)
const isDragging = ref(false)

function startCellDrag(dateKey: string, e: PointerEvent) {
  if ((e.target as HTMLElement).closest('[data-event-pill]')) return
  e.preventDefault()
  isDragging.value = true
  dragStartKey.value = dateKey
  dragEndKey.value = dateKey
}

function onGridPointerMove(e: PointerEvent) {
  // Find the cell under the cursor (ignoring pointer-events)
  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
  const cell = el?.closest('[data-cell-key]') as HTMLElement | null

  if (moveDrag.value) {
    // Update move drag target
    if (cell?.dataset.cellKey) {
      moveDrag.value = { ...moveDrag.value, targetDateKey: cell.dataset.cellKey }
    }
    return
  }

  if (!isDragging.value) return
  if (cell?.dataset.cellKey) dragEndKey.value = cell.dataset.cellKey
}

function endCellDrag() {
  if (moveDrag.value) {
    commitMoveDrag()
    return
  }

  if (!isDragging.value || !dragStartKey.value) {
    isDragging.value = false
    return
  }
  isDragging.value = false
  const s = dragStartKey.value
  const e = dragEndKey.value ?? s
  dragStartKey.value = null
  dragEndKey.value = null

  const start = s <= e ? s : e
  const end = s <= e ? e : s
  emit('create', { start, end: start !== end ? end : undefined })
}

function isCellInDrag(dateKey: string): boolean {
  if (!isDragging.value || !dragStartKey.value || !dragEndKey.value) return false
  const lo = dragStartKey.value <= dragEndKey.value ? dragStartKey.value : dragEndKey.value
  const hi = dragStartKey.value <= dragEndKey.value ? dragEndKey.value : dragStartKey.value
  return dateKey >= lo && dateKey <= hi
}

onMounted(() => window.addEventListener('pointerup', endCellDrag))
onUnmounted(() => window.removeEventListener('pointerup', endCellDrag))

// ─── Drag to move ──────────────────────────────────────────────────────────────

interface MonthMoveDrag {
  event: CalendarEvent
  targetDateKey: string | null
}

const moveDrag = ref<MonthMoveDrag | null>(null)

function onPillPointerDown(e: PointerEvent, event: CalendarEvent, originDateKey: string) {
  e.stopPropagation()
  e.preventDefault()
  if (event._recurring) return
  moveDrag.value = { event, targetDateKey: originDateKey }
}

async function commitMoveDrag() {
  if (!moveDrag.value) return
  const { event, targetDateKey } = moveDrag.value
  moveDrag.value = null

  if (!targetDateKey) return

  const originalDateKey = event.start.slice(0, 10)
  if (targetDateKey === originalDateKey) return

  let newStart: string
  let newEnd: string

  if (event.all_day) {
    // Keep same duration in days
    const origStart = new Date(`${event.start.slice(0, 10)}T00:00:00`)
    const origEnd = new Date(`${event.end.slice(0, 10)}T00:00:00`)
    const durationDays = Math.round((origEnd.getTime() - origStart.getTime()) / 86400000)

    const newStartDate = new Date(`${targetDateKey}T00:00:00`)
    const newEndDate = new Date(newStartDate.getTime() + durationDays * 86400000)

    newStart = toDateKey(newStartDate)
    newEnd = toDateKey(newEndDate)
  } else {
    // Preserve original time, move to new date
    const originalTime = event.start.slice(11, 16) // HH:MM
    const endTime = event.end.slice(11)             // HH:MM:SS... or full ISO tail

    const origStartMs = new Date(event.start).getTime()
    const origEndMs = new Date(event.end).getTime()
    const durationMs = origEndMs - origStartMs

    const newStartDt = new Date(`${targetDateKey}T${originalTime}:00`)
    const newEndDt = new Date(newStartDt.getTime() + durationMs)

    newStart = newStartDt.toISOString()
    newEnd = newEndDt.toISOString()
  }

  await $fetch(`/api/proxy/items/calendar/${event.id}`, {
    method: 'PATCH',
    body: {
      start: newStart,
      end: newEnd,
    },
  })
  emit('event-moved')
}

function isMoveTarget(dateKey: string): boolean {
  return moveDrag.value !== null && moveDrag.value.targetDateKey === dateKey
}

// ─── Event Detail ─────────────────────────────────────────────────────────────

const detailEvent = ref<CalendarEvent | null>(null)
const detailOpen = ref(false)

function openDetail(event: CalendarEvent) {
  detailEvent.value = event
  detailOpen.value = true
  emit('event-click', event)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function eventColor(event: CalendarEvent): string {
  return event.color ?? '#00e2cf'
}

function eventBg(event: CalendarEvent): string {
  return `${eventColor(event)}26`
}

function isSubscribed(eventId: string): boolean {
  return props.subscriptions.includes(eventId)
}

const dtFmt = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const dateFmt = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function formatEventDate(event: CalendarEvent) {
  if (event.all_day) {
    return dateFmt.format(new Date(event.start))
  }
  return dtFmt.format(new Date(event.start))
}

function parseTags(tags: string | null): string[] {
  if (!tags) return []
  return tags.split(',').map((t) => t.trim()).filter(Boolean)
}
</script>

<template>
  <div class="rounded-xl border border-(--ui-border) bg-(--ui-bg-muted)/60 backdrop-blur-sm overflow-hidden">
    <!-- Header / Navigation -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-(--ui-border)">
      <div class="flex items-center gap-3">
        <button
          class="p-1.5 rounded-md hover:bg-(--ui-bg-elevated) text-(--ui-text-muted) hover:text-(--ui-text) transition-colors"
          @click="prevMonth"
        >
          <UIcon name="i-lucide-chevron-left" class="size-4" />
        </button>
        <h2 class="text-base font-semibold text-(--ui-text-highlighted) tracking-tight capitalize min-w-40 text-center">
          {{ monthLabel }}
        </h2>
        <button
          class="p-1.5 rounded-md hover:bg-(--ui-bg-elevated) text-(--ui-text-muted) hover:text-(--ui-text) transition-colors"
          @click="nextMonth"
        >
          <UIcon name="i-lucide-chevron-right" class="size-4" />
        </button>
      </div>
      <button
        class="px-3 py-1 text-xs font-medium rounded-md border border-(--ui-border) text-(--ui-text-muted) hover:border-(--color-aris-500)/40 hover:text-(--color-aris-500) transition-colors"
        @click="goToday"
      >
        Heute
      </button>
    </div>

    <!-- Day Name Header -->
    <div class="grid grid-cols-7 border-b border-(--ui-border)">
      <div
        v-for="name in DAY_NAMES"
        :key="name"
        class="py-2 text-center text-[0.65rem] font-semibold uppercase tracking-widest text-(--ui-text-muted)"
      >
        {{ name }}
      </div>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-7" @pointermove="onGridPointerMove">
      <div
        v-for="(cell, idx) in gridDays"
        :key="cell.dateKey"
        :data-cell-key="cell.dateKey"
        class="relative min-h-28 border-b border-r border-(--ui-border) last:border-r-0 p-1 group select-none transition-colors"
        :class="[
          !cell.isCurrentMonth ? 'opacity-40' : '',
          (idx + 1) % 7 === 0 ? 'border-r-0' : '',
          idx >= gridDays.length - 7 ? 'border-b-0' : '',
          moveDrag ? 'cursor-grabbing' : 'cursor-crosshair',
          isMoveTarget(cell.dateKey)
            ? 'ring-2 ring-inset ring-(--color-aris-500)'
            : isCellInDrag(cell.dateKey)
              ? 'bg-(--color-aris-500)/10 ring-1 ring-inset ring-(--color-aris-500)/30'
              : 'hover:bg-(--ui-bg-elevated)/40',
        ]"
        @pointerdown="startCellDrag(cell.dateKey, $event)"
      >
        <!-- Day number -->
        <div class="flex justify-end mb-1">
          <span
            class="inline-flex items-center justify-center size-6 rounded-full text-xs font-semibold transition-colors"
            :class="[
              cell.isToday
                ? 'bg-(--color-aris-500) text-black'
                : 'text-(--ui-text-muted) group-hover:text-(--ui-text)',
            ]"
          >
            {{ cell.day }}
          </span>
        </div>

        <!-- Event pills -->
        <div class="flex flex-col gap-0.5">
          <template v-for="slot in visibleSlots(cell.dateKey)" :key="slot.event.id + cell.dateKey">
            <button
              data-event-pill
              class="relative w-full text-left rounded px-1.5 py-0.5 text-[0.65rem] font-medium truncate leading-tight transition-opacity hover:opacity-80"
              :class="[
                moveDrag?.event.id === slot.event.id ? 'opacity-40 cursor-grabbing' : 'cursor-grab',
              ]"
              :style="{
                color: eventColor(slot.event),
                backgroundColor: eventBg(slot.event),
                borderLeft: `2px solid ${eventColor(slot.event)}`,
              }"
              @pointerdown.stop="onPillPointerDown($event, slot.event, cell.dateKey)"
              @click.stop="!moveDrag && openDetail(slot.event)"
            >
              <span v-if="slot.startsHere" class="flex items-center gap-1 min-w-0">
                <UIcon v-if="slot.event._recurring" name="i-lucide-repeat-2" class="size-2.5 shrink-0 opacity-70" />
                <span class="truncate">{{ slot.event.name }}</span>
              </span>
              <span v-else class="opacity-60">↳ {{ slot.event.name }}</span>
            </button>
          </template>

          <!-- +N more -->
          <button
            v-if="overflowCount(cell.dateKey) > 0"
            data-event-pill
            class="text-[0.6rem] text-(--ui-text-muted) hover:text-(--ui-primary) px-1.5 py-0.5 text-left transition-colors"
            @pointerdown.stop
            @click.stop="emit('create', { start: cell.dateKey })"
          >
            +{{ overflowCount(cell.dateKey) }} weitere
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Event Detail Slideout -->
  <AMSPagesCalendarEventDetail
    v-if="detailEvent"
    v-model:open="detailOpen"
    :event="detailEvent"
    :is-subscribed="isSubscribed(detailEvent.id)"
    @subscribe="(id, action) => emit('subscribe', id, action)"
    @edit="(event) => emit('edit', event)"
  />
</template>

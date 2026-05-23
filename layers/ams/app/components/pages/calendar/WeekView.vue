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

// ─── Constants ─────────────────────────────────────────────────────────────────
const HOUR_HEIGHT = 60 // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const GRID_HEIGHT = HOUR_HEIGHT * 24

// ─── Navigation ────────────────────────────────────────────────────────────────

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = (d.getDay() + 6) % 7 // 0=Mon
  d.setDate(d.getDate() - day)
  return d
}

const todayD = new Date()
todayD.setHours(0, 0, 0, 0)

const weekStart = ref<Date>(getMondayOf(new Date()))

function prevWeek() {
  const d = new Date(weekStart.value)
  d.setDate(d.getDate() - 7)
  weekStart.value = d
}
function nextWeek() {
  const d = new Date(weekStart.value)
  d.setDate(d.getDate() + 7)
  weekStart.value = d
}
function goToday() {
  weekStart.value = getMondayOf(new Date())
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const weekDays = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + i)
    return {
      date: d,
      dateKey: toDateKey(d),
      isToday: d.getTime() === todayD.getTime(),
      label: new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(d).replace('.', ''),
      dayNum: d.getDate(),
      monthLabel: new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short' }).format(d),
    }
  })
})

const weekLabel = computed(() => {
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  const fmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long' })
  return `${fmt.format(start.date)} – ${fmt.format(end.date)} ${end.date.getFullYear()}`
})

// ─── Expanded events (recurring) ──────────────────────────────────────────────

const expandedEvents = computed(() => {
  const start = new Date(weekStart.value)
  start.setHours(0, 0, 0, 0)
  const end = new Date(weekStart.value)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return expandCalendarEvents(props.events, start, end)
})

// ─── All-day events ────────────────────────────────────────────────────────────

const allDayEvents = computed(() => {
  const wStart = weekStart.value
  const wEnd = new Date(wStart)
  wEnd.setDate(wEnd.getDate() + 7)

  return expandedEvents.value.filter((e) => {
    if (e.all_day) {
      const s = new Date(e.start)
      s.setHours(0, 0, 0, 0)
      return s < wEnd && new Date(e.end) >= wStart
    }
    // Multi-day timed: spanning more than 1 full day
    const s = new Date(e.start)
    const en = new Date(e.end)
    const spanMs = en.getTime() - s.getTime()
    const spanDays = spanMs / 86400000
    return spanDays >= 1 && s < wEnd && en >= wStart
  })
})

function allDayEventStyle(event: CalendarEvent): { gridColumn: string; color: string; backgroundColor: string; borderLeft: string } {
  const wStart = weekStart.value

  const eStart = new Date(event.start)
  eStart.setHours(0, 0, 0, 0)
  const eEnd = new Date(event.end)
  eEnd.setHours(0, 0, 0, 0)

  const startOffset = Math.max(0, Math.round((eStart.getTime() - wStart.getTime()) / 86400000))
  const endOffset = Math.min(7, Math.round((eEnd.getTime() - wStart.getTime()) / 86400000) + 1)

  const col = `${startOffset + 1} / ${endOffset + 1}`
  const color = event.color ?? '#00e2cf'
  return {
    gridColumn: col,
    color,
    backgroundColor: `${color}26`,
    borderLeft: `2px solid ${color}`,
  }
}

// ─── Timed events ─────────────────────────────────────────────────────────────

interface TimedSlot {
  event: CalendarEvent
  top: number
  height: number
  continuesBefore: boolean
  continuesAfter: boolean
  column: number
  totalColumns: number
}

const timedSlotsByDay = computed(() => {
  const map = new Map<string, TimedSlot[]>()

  for (const day of weekDays.value) {
    const dayStart = new Date(day.date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const daySlots: TimedSlot[] = []

    for (const event of expandedEvents.value) {
      if (event.all_day) continue
      const eStart = new Date(event.start)
      const eEnd = new Date(event.end)
      const spanMs = eEnd.getTime() - eStart.getTime()
      const spanDays = spanMs / 86400000
      if (spanDays >= 1) continue // shown in all-day strip

      if (eEnd <= dayStart || eStart >= dayEnd) continue

      const segStart = eStart < dayStart ? dayStart : eStart
      const segEnd = eEnd > dayEnd ? dayEnd : eEnd

      const top = ((segStart.getTime() - dayStart.getTime()) / 3600000) * HOUR_HEIGHT
      const durationH = (segEnd.getTime() - segStart.getTime()) / 3600000
      const height = Math.max(durationH * HOUR_HEIGHT, HOUR_HEIGHT / 2)

      daySlots.push({
        event,
        top,
        height,
        continuesBefore: eStart < dayStart,
        continuesAfter: eEnd > dayEnd,
        column: 0,
        totalColumns: 1,
      })
    }

    // Resolve overlapping columns
    daySlots.sort((a, b) => a.top - b.top)
    const columns: number[] = []
    for (const slot of daySlots) {
      let col = 0
      while (true) {
        const overlaps = daySlots.some(
          (s) => s !== slot && s.column === col &&
            slot.top < s.top + s.height &&
            slot.top + slot.height > s.top,
        )
        if (!overlaps) break
        col++
      }
      slot.column = col
      columns.push(col)
    }
    const maxCol = columns.length ? Math.max(...columns) + 1 : 1
    for (const slot of daySlots) {
      slot.totalColumns = maxCol
    }

    map.set(day.dateKey, daySlots)
  }
  return map
})

// ─── Current time ─────────────────────────────────────────────────────────────

const nowTop = ref(0)

function updateNowTop() {
  const now = new Date()
  nowTop.value = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT
}

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  updateNowTop()
  timer = setInterval(updateNowTop, 60000)
  nextTick(() => {
    const el = document.querySelector('[data-week-grid-scroll]') as HTMLElement | null
    if (el) el.scrollTop = Math.max(0, nowTop.value - 100)
  })
  window.addEventListener('pointermove', onWindowPointerMoveForMove)
  window.addEventListener('pointerup', onWindowPointerUpForMove)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('pointermove', onWindowPointerMoveForMove)
  window.removeEventListener('pointerup', onWindowPointerUpForMove)
})

const isCurrentWeek = computed(() => {
  const monday = getMondayOf(new Date())
  return weekStart.value.getTime() === monday.getTime()
})

// ─── Drag to create ────────────────────────────────────────────────────────────

interface DragState {
  dateKey: string
  startMins: number
  currentMins: number
}

const drag = ref<DragState | null>(null)

function snapMins(raw: number): number {
  return Math.max(0, Math.min(23 * 60 + 45, Math.round(raw / 15) * 15))
}

function minsToHHMM(m: number): string {
  const clamped = Math.max(0, Math.min(1439, m))
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}

function minsFromEvent(e: PointerEvent): number {
  const col = e.currentTarget as HTMLElement
  const rect = col.getBoundingClientRect()
  const relY = Math.max(0, Math.min(GRID_HEIGHT, e.clientY - rect.top))
  return snapMins((relY / HOUR_HEIGHT) * 60)
}

function onColPointerDown(e: PointerEvent, dateKey: string) {
  if ((e.target as HTMLElement).closest('[data-cal-event]')) return
  e.preventDefault()
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  const mins = minsFromEvent(e)
  drag.value = { dateKey, startMins: mins, currentMins: mins }
}

function onColPointerMove(e: PointerEvent) {
  if (!drag.value) return
  drag.value = { ...drag.value, currentMins: minsFromEvent(e) }
}

function onColPointerUp(e: PointerEvent) {
  if (!drag.value) return
  const { dateKey, startMins, currentMins } = drag.value
  drag.value = null

  const start = Math.min(startMins, currentMins)
  const end = Math.max(startMins, currentMins)
  const startStr = `${dateKey}T${minsToHHMM(start)}`
  const endStr = `${dateKey}T${minsToHHMM(end - start < 15 ? start + 60 : end)}`
  emit('create', { start: startStr, end: endStr })
}

const dragOverlay = computed(() => {
  if (!drag.value) return null
  const { startMins, currentMins } = drag.value
  const lo = Math.min(startMins, currentMins)
  const hi = Math.max(startMins, currentMins)
  return {
    top: lo / 60 * HOUR_HEIGHT,
    height: Math.max((hi - lo) / 60 * HOUR_HEIGHT, 4),
    startLabel: minsToHHMM(lo),
    endLabel: minsToHHMM(hi),
  }
})

// ─── Drag to move ──────────────────────────────────────────────────────────────

interface MoveDrag {
  event: CalendarEvent
  originDateKey: string
  originStartMins: number
  durationMins: number
  currentDateKey: string
  currentStartMins: number
  cursorOffsetMins: number // how far into the event the pointer landed
}

const moveDrag = ref<MoveDrag | null>(null)
const wasDragging = ref(false)

function onEventPointerDown(e: PointerEvent, slot: TimedSlot, dateKey: string) {
  e.stopPropagation()
  e.preventDefault()
  if (slot.event._recurring) return
  wasDragging.value = false

  const colEl = (e.currentTarget as HTMLElement).closest('[data-day-col]') as HTMLElement | null
  if (!colEl) return

  const rect = colEl.getBoundingClientRect()
  const relY = Math.max(0, e.clientY - rect.top)
  const clickMins = (relY / HOUR_HEIGHT) * 60

  const eStart = new Date(slot.event.start)
  const eEnd = new Date(slot.event.end)
  const originStartMins = eStart.getHours() * 60 + eStart.getMinutes()
  const durationMins = Math.round((eEnd.getTime() - eStart.getTime()) / 60000)
  const cursorOffsetMins = clickMins - originStartMins

  moveDrag.value = {
    event: slot.event,
    originDateKey: dateKey,
    originStartMins,
    durationMins,
    currentDateKey: dateKey,
    currentStartMins: originStartMins,
    cursorOffsetMins: Math.max(0, Math.min(durationMins, cursorOffsetMins)),
  }
}

function onWindowPointerMoveForMove(e: PointerEvent) {
  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
  const colEl = el?.closest('[data-day-col]') as HTMLElement | null

  if (resizeDrag.value) {
    if (colEl) {
      const rect = colEl.getBoundingClientRect()
      const relY = Math.max(0, Math.min(GRID_HEIGHT, e.clientY - rect.top))
      const snapped = snapMins((relY / HOUR_HEIGHT) * 60)
      const rd = resizeDrag.value
      if (rd.edge === 'bottom') {
        resizeDrag.value = { ...rd, currentEndMins: Math.max(rd.currentStartMins + 15, snapped) }
      } else {
        resizeDrag.value = { ...rd, currentStartMins: Math.min(rd.currentEndMins - 15, snapped) }
      }
      wasDragging.value = true
    }
    return
  }

  if (!moveDrag.value) return

  if (colEl) {
    const dateKey = colEl.dataset.dayCol as string
    const rect = colEl.getBoundingClientRect()
    const relY = Math.max(0, Math.min(GRID_HEIGHT, e.clientY - rect.top))
    const rawMins = (relY / HOUR_HEIGHT) * 60
    const newStart = snapMins(rawMins - moveDrag.value.cursorOffsetMins)
    moveDrag.value = { ...moveDrag.value, currentDateKey: dateKey, currentStartMins: newStart }
    wasDragging.value = true
  }
}

function onWindowPointerUpForMove() {
  if (resizeDrag.value) { commitResizeDrag(); wasDragging.value = false; return }
  if (moveDrag.value) { commitMoveDrag(); wasDragging.value = false }
}

function toLocalISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

async function commitMoveDrag() {
  if (!moveDrag.value) return
  const { event, currentDateKey, currentStartMins, durationMins, originDateKey, originStartMins } = moveDrag.value
  moveDrag.value = null

  // No-op if nothing changed
  if (currentDateKey === originDateKey && currentStartMins === originStartMins) return

  const newStart = new Date(`${currentDateKey}T${minsToHHMM(currentStartMins)}:00`)
  const newEnd = new Date(newStart.getTime() + durationMins * 60000)

  await $fetch(`/api/proxy/items/calendar/${event.id}`, {
    method: 'PATCH',
    body: {
      start: toLocalISO(newStart),
      end: toLocalISO(newEnd),
    },
  })
  emit('event-moved')
}

function cancelMoveDrag() {
  moveDrag.value = null
}

function cancelAllDrags() {
  drag.value = null
  moveDrag.value = null
  resizeDrag.value = null
  wasDragging.value = false
}

// ─── Drag to resize ────────────────────────────────────────────────────────────

interface ResizeDrag {
  event: CalendarEvent
  dateKey: string
  edge: 'top' | 'bottom'
  originalStartMins: number
  originalEndMins: number
  currentStartMins: number
  currentEndMins: number
}

const resizeDrag = ref<ResizeDrag | null>(null)

function onResizePointerDown(e: PointerEvent, slot: TimedSlot, dateKey: string, edge: 'top' | 'bottom') {
  e.stopPropagation()
  e.preventDefault()
  if (slot.event._recurring) return
  const eStart = new Date(slot.event.start)
  const eEnd = new Date(slot.event.end)
  const startMins = eStart.getHours() * 60 + eStart.getMinutes()
  const endMins = eEnd.getHours() * 60 + eEnd.getMinutes()
  resizeDrag.value = {
    event: slot.event,
    dateKey,
    edge,
    originalStartMins: startMins,
    originalEndMins: endMins,
    currentStartMins: startMins,
    currentEndMins: endMins,
  }
}

const resizeGhost = computed(() => {
  if (!resizeDrag.value) return null
  const { currentStartMins, currentEndMins, dateKey } = resizeDrag.value
  return {
    dateKey,
    top: currentStartMins / 60 * HOUR_HEIGHT,
    height: Math.max((currentEndMins - currentStartMins) / 60 * HOUR_HEIGHT, HOUR_HEIGHT / 2),
    startLabel: minsToHHMM(currentStartMins),
    endLabel: minsToHHMM(currentEndMins),
  }
})

async function commitResizeDrag() {
  if (!resizeDrag.value) return
  const { event, dateKey, currentStartMins, currentEndMins, originalStartMins, originalEndMins } = resizeDrag.value
  resizeDrag.value = null
  if (currentStartMins === originalStartMins && currentEndMins === originalEndMins) return
  const newStart = new Date(`${dateKey}T${minsToHHMM(currentStartMins)}:00`)
  const newEnd = new Date(`${dateKey}T${minsToHHMM(currentEndMins)}:00`)
  await $fetch(`/api/proxy/items/calendar/${event.id}`, {
    method: 'PATCH',
    body: { start: toLocalISO(newStart), end: toLocalISO(newEnd) },
  })
  emit('event-moved')
}

const moveGhostByDay = computed(() => {
  if (!moveDrag.value) return new Map<string, { top: number; height: number; startLabel: string }>()
  const { currentDateKey, currentStartMins, durationMins } = moveDrag.value
  const map = new Map<string, { top: number; height: number; startLabel: string }>()
  map.set(currentDateKey, {
    top: currentStartMins / 60 * HOUR_HEIGHT,
    height: Math.max(durationMins / 60 * HOUR_HEIGHT, HOUR_HEIGHT / 2),
    startLabel: minsToHHMM(currentStartMins),
  })
  return map
})

// ─── Detail ────────────────────────────────────────────────────────────────────

const detailEvent = ref<CalendarEvent | null>(null)
const detailOpen = ref(false)

function openDetail(event: CalendarEvent) {
  detailEvent.value = event
  detailOpen.value = true
  emit('event-click', event)
}

function isSubscribed(id: string): boolean {
  return props.subscriptions.includes(id)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function eventColor(event: CalendarEvent): string {
  return event.color ?? '#00e2cf'
}

function slotStyle(slot: TimedSlot): Record<string, string> {
  const pct = 100 / slot.totalColumns
  const color = eventColor(slot.event)
  const isDimmed = moveDrag.value?.event.id === slot.event.id || resizeDrag.value?.event.id === slot.event.id
  return {
    top: `${slot.top}px`,
    height: `${slot.height}px`,
    left: `${slot.column * pct + 0.5}%`,
    width: `${pct - 1}%`,
    color,
    backgroundColor: `${color}22`,
    borderLeft: `2px solid ${color}`,
    opacity: isDimmed ? '0.4' : '1',
  }
}

const timeFmt = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' })

function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso))
}

</script>

<template>
  <div class="rounded-xl border border-(--ui-border) bg-(--ui-bg-muted)/60 backdrop-blur-sm overflow-clip flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-(--ui-border) shrink-0">
      <div class="flex items-center gap-3">
        <button
          class="p-1.5 rounded-md hover:bg-(--ui-bg-elevated) text-(--ui-text-muted) hover:text-(--ui-text) transition-colors"
          @click="prevWeek"
        >
          <UIcon name="i-lucide-chevron-left" class="size-4" />
        </button>
        <span class="text-sm font-semibold text-(--ui-text-highlighted) min-w-52 text-center">
          {{ weekLabel }}
        </span>
        <button
          class="p-1.5 rounded-md hover:bg-(--ui-bg-elevated) text-(--ui-text-muted) hover:text-(--ui-text) transition-colors"
          @click="nextWeek"
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

    <!-- Scrollable body: day headers (sticky) + all-day strip + time grid all share the same width -->
    <div
      data-week-grid-scroll
      class="overflow-y-auto flex-1"
      style="max-height: 600px; scrollbar-gutter: stable"
    >
      <!-- Day headers (sticky) -->
      <div
        class="grid border-b border-(--ui-border) sticky top-0 z-20 bg-(--ui-bg-muted)"
        style="grid-template-columns: 52px repeat(7, 1fr)"
      >
        <div class="border-r border-(--ui-border)" />
        <div
          v-for="day in weekDays"
          :key="day.dateKey"
          class="py-2 text-center border-r border-(--ui-border) last:border-r-0"
        >
          <p class="text-[0.65rem] uppercase tracking-widest font-semibold text-(--ui-text-muted)">{{ day.label }}</p>
          <span
            class="inline-flex items-center justify-center size-7 rounded-full text-sm font-bold mt-0.5 transition-colors"
            :class="day.isToday ? 'bg-(--color-aris-500) text-black' : 'text-(--ui-text-highlighted)'"
          >
            {{ day.dayNum }}
          </span>
        </div>
      </div>

      <!-- All-day strip -->
      <div
        v-if="allDayEvents.length > 0"
        class="border-b border-(--ui-border)"
        style="grid-template-columns: 52px repeat(7, 1fr); display: grid"
      >
        <div class="py-1 px-2 border-r border-(--ui-border) flex items-start justify-end">
          <span class="text-[0.55rem] uppercase tracking-widest text-(--ui-text-muted) mt-1">ganztg.</span>
        </div>
        <div class="col-span-7 relative py-1 px-1">
          <div class="grid gap-0.5" style="grid-template-columns: repeat(7, 1fr)">
            <template v-for="event in allDayEvents" :key="event.id">
              <button
                class="rounded px-1.5 py-0.5 text-[0.65rem] font-medium truncate text-left transition-opacity hover:opacity-80"
                :style="allDayEventStyle(event)"
                @click="openDetail(event)"
              >
                {{ event.name }}
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Time grid -->
      <div class="grid relative" style="grid-template-columns: 52px repeat(7, 1fr)">
        <!-- Hour labels column -->
        <div class="relative border-r border-(--ui-border)" :style="{ height: `${GRID_HEIGHT}px` }">
          <div
            v-for="hour in HOURS"
            :key="`label-${hour}`"
            class="absolute right-2 text-[0.6rem] text-(--ui-text-muted) tabular-nums select-none"
            :style="{ top: `${hour * HOUR_HEIGHT - 7}px` }"
          >
            {{ String(hour).padStart(2, '0') }}:00
          </div>
        </div>

        <!-- Day columns -->
        <div
          v-for="day in weekDays"
          :key="day.dateKey"
          :data-day-col="day.dateKey"
          class="relative border-r border-(--ui-border) last:border-r-0 select-none"
          :class="[
            resizeDrag ? 'cursor-ns-resize' : moveDrag ? 'cursor-grabbing' : (drag ? 'cursor-ns-resize' : 'cursor-crosshair'),
          ]"
          :style="{ height: `${GRID_HEIGHT}px` }"
          @pointerdown="onColPointerDown($event, day.dateKey)"
          @pointermove="onColPointerMove"
          @pointerup="onColPointerUp"
          @pointercancel="cancelAllDrags()"
        >
          <!-- Hour lines -->
          <div
            v-for="hour in HOURS"
            :key="`guide-${hour}`"
            class="absolute left-0 right-0 border-t pointer-events-none"
            :class="hour === 0 ? 'border-(--ui-border)' : 'border-(--ui-border)/40'"
            :style="{ top: `${hour * HOUR_HEIGHT}px` }"
          />

          <!-- Half-hour lines -->
          <div
            v-for="hour in HOURS"
            :key="`half-${hour}`"
            class="absolute left-0 right-0 border-t border-dashed border-(--ui-border)/20 pointer-events-none"
            :style="{ top: `${hour * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }"
          />

          <!-- Drag selection overlay (create) -->
          <div
            v-if="drag?.dateKey === day.dateKey && dragOverlay"
            class="absolute left-0.5 right-0.5 z-30 rounded pointer-events-none"
            :style="{
              top: `${dragOverlay.top}px`,
              height: `${dragOverlay.height}px`,
              backgroundColor: '#00e2cf22',
              border: '1.5px solid #00e2cf88',
            }"
          >
            <span class="text-[0.6rem] font-semibold px-1 leading-tight text-[#00e2cf] block truncate">
              {{ dragOverlay.startLabel }} – {{ dragOverlay.endLabel }}
            </span>
          </div>

          <!-- Move ghost overlay -->
          <div
            v-if="moveGhostByDay.has(day.dateKey)"
            class="absolute left-0.5 right-0.5 z-40 rounded pointer-events-none"
            :style="{
              top: `${moveGhostByDay.get(day.dateKey)!.top}px`,
              height: `${moveGhostByDay.get(day.dateKey)!.height}px`,
              backgroundColor: '#00e2cf33',
              border: '2px solid #00e2cf',
            }"
          >
            <span class="text-[0.6rem] font-semibold px-1 leading-tight text-[#00e2cf] block truncate">
              {{ moveGhostByDay.get(day.dateKey)!.startLabel }}
            </span>
          </div>

          <!-- Resize ghost overlay -->
          <div
            v-if="resizeGhost?.dateKey === day.dateKey"
            class="absolute left-0.5 right-0.5 z-40 rounded pointer-events-none"
            :style="{
              top: `${resizeGhost.top}px`,
              height: `${resizeGhost.height}px`,
              backgroundColor: '#00e2cf33',
              border: '2px solid #00e2cf',
            }"
          >
            <span class="text-[0.6rem] font-semibold px-1 leading-tight text-[#00e2cf] block truncate">
              {{ resizeGhost.startLabel }} – {{ resizeGhost.endLabel }}
            </span>
          </div>

          <!-- Current time indicator -->
          <div
            v-if="isCurrentWeek && day.isToday"
            class="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
            :style="{ top: `${nowTop}px` }"
          >
            <div class="size-2 rounded-full bg-red-500 -ml-1 shrink-0" />
            <div class="h-px flex-1 bg-red-500" />
          </div>

          <!-- Timed events -->
          <div
            v-for="slot in timedSlotsByDay.get(day.dateKey) ?? []"
            :key="slot.event.id"
            data-cal-event
            class="absolute z-10 rounded px-1.5 py-1 text-left overflow-hidden transition-opacity group/pill"
            :class="(moveDrag?.event.id === slot.event.id || resizeDrag?.event.id === slot.event.id) ? 'cursor-grabbing' : slot.event._recurring ? 'cursor-default hover:opacity-80' : 'cursor-grab hover:opacity-80'"
            :style="slotStyle(slot)"
            @pointerdown.stop="onEventPointerDown($event, slot, day.dateKey)"
            @click.stop="!wasDragging && openDetail(slot.event)"
          >
            <!-- Top resize handle -->
            <div
              v-if="!slot.continuesBefore"
              class="absolute inset-x-0 top-0 h-2 cursor-ns-resize z-20 flex items-start justify-center opacity-0 group-hover/pill:opacity-100 transition-opacity"
              @pointerdown.stop="onResizePointerDown($event, slot, day.dateKey, 'top')"
            >
              <div class="w-6 h-0.5 rounded-full bg-current mt-0.5 opacity-70" />
            </div>
            <p class="text-[0.65rem] font-semibold leading-tight truncate flex items-center gap-1">
              <UIcon v-if="slot.event._recurring" name="i-lucide-repeat-2" class="size-2.5 shrink-0 opacity-70" />
              {{ slot.event.name }}
            </p>
            <p v-if="!slot.continuesBefore" class="text-[0.6rem] opacity-70 mt-0.5">
              {{ formatTime(slot.event.start) }}
            </p>
            <p v-if="slot.height > 40 && slot.event.location" class="text-[0.6rem] opacity-60 mt-0.5 truncate">
              <UIcon name="i-lucide-map-pin" class="size-2.5 inline -mt-0.5" />
              {{ slot.event.location }}
            </p>
            <!-- Bottom resize handle -->
            <div
              v-if="!slot.continuesAfter"
              class="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize z-20 flex items-end justify-center opacity-0 group-hover/pill:opacity-100 transition-opacity"
              @pointerdown.stop="onResizePointerDown($event, slot, day.dateKey, 'bottom')"
            >
              <div class="w-6 h-0.5 rounded-full bg-current mb-0.5 opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Event Detail -->
  <AMSPagesCalendarEventDetail
    v-if="detailEvent"
    v-model:open="detailOpen"
    :event="detailEvent"
    :is-subscribed="isSubscribed(detailEvent.id)"
    @subscribe="(id, action) => emit('subscribe', id, action)"
    @edit="(event) => emit('edit', event)"
  />
</template>

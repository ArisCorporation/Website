<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, today } from '@internationalized/date'

interface CalendarEvent {
  id: string
  title: string
  summary: string
  location: string
  department: string
  start: string
  end: string
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  tags: string[]
}

const mockEvents: CalendarEvent[] = [
  {
    id: 'mission-atlas',
    title: 'Operation Atlas – Aufklärungsflug',
    summary:
      'Abendliches Aufklärungsmanöver rund um MicroTech, Fokus auf Kopfgeldziele und Signalaufklärung.',
    location: 'Everus Harbor – Briefing Room 02',
    department: 'Sicherheit',
    start: '2025-10-02T19:30:00Z',
    end: '2025-10-02T21:00:00Z',
    status: 'confirmed',
    tags: ['Einsatz', 'Flight Ops'],
  },
  {
    id: 'training-logistics',
    title: 'Logistiktraining – Hull C',
    summary:
      'Schwerpunkt auf Landeprotokollen, Security-Escorts und Koordination mit ATC.',
    location: 'Area18 – Frachtdeck',
    department: 'Logistik',
    start: '2025-10-05T17:00:00Z',
    end: '2025-10-05T19:30:00Z',
    status: 'planned',
    tags: ['Training', 'Crew'],
  },
  {
    id: 'event-gala',
    title: 'ArisCorp Gala – Mitgliederversammlung',
    summary:
      'Interne Informationsveranstaltung mit Projektupdates und Q&A mit dem Vorstand.',
    location: 'Orison – Voyager Bar',
    department: 'Kommunikation',
    start: '2025-10-12T18:00:00Z',
    end: '2025-10-12T21:30:00Z',
    status: 'confirmed',
    tags: ['Community', 'Vorstand'],
  },
  {
    id: 'mission-safeguard',
    title: 'Einsatz Safeguard – Handelskonvoi',
    summary:
      'Sicherheitseskorte für einen gemischten Konvoi zwischen Crusader und Hurston.',
    location: 'Port Olisar – Hangar 04',
    department: 'Sicherheit',
    start: '2025-10-18T20:15:00Z',
    end: '2025-10-18T23:45:00Z',
    status: 'planned',
    tags: ['Einsatz', 'Escort'],
  },
  {
    id: 'training-medical',
    title: 'Medic Response Workshop',
    summary:
      'Medizinisches Einsatztraining inkl. Evakuierungssimulationen und Triagen-Übungen.',
    location: 'New Babbage – Clinic Deck',
    department: 'Medizin',
    start: '2025-10-20T18:30:00Z',
    end: '2025-10-20T20:00:00Z',
    status: 'planned',
    tags: ['Training', 'Support'],
  },
  {
    id: 'operation-harvest',
    title: 'Operation Harvest – Bergungsmission',
    summary:
      'Koordinierte Salvage-Operation an verlassenen Wracks, Fokus auf Teamwork und Materialausbeute.',
    location: 'Daymar – Site Delta',
    department: 'Industrie',
    start: '2025-10-24T16:00:00Z',
    end: '2025-10-24T20:30:00Z',
    status: 'planned',
    tags: ['Industrie', 'Salvage'],
  },
  {
    id: 'briefing-quarterly',
    title: 'Quartalsbriefing Vorstand',
    summary:
      'Strategischer Ausblick, Roadmap-Anpassungen und Feedbackrunde mit Abteilungsleitern.',
    location: 'Everus Harbor – Konferenzraum 1',
    department: 'Vorstand',
    start: '2025-10-28T18:00:00Z',
    end: '2025-10-29T19:33:00Z',
    status: 'planned',
    tags: ['Management'],
  },
]

const { data: eventsData } = await useAsyncData<CalendarEvent[]>(
  'ams:calendar-events',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return mockEvents
  }
)

const events = computed<CalendarEvent[]>(() => eventsData.value ?? [])

const selectedDate = ref<DateValue | undefined>(today(getLocalTimeZone()))

const eventsByDay = computed(() => {
  const map = new Map<string, CalendarEvent[]>()

  for (const event of events.value) {
    const dayKey = event.start.slice(0, 10)
    if (!map.has(dayKey)) {
      map.set(dayKey, [])
    }
    map.get(dayKey)!.push(event)
  }

  for (const [, list] of map) {
    list.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    )
  }

  return map
})

const highlightedDates = computed(
  () => new Set(Array.from(eventsByDay.value.keys()))
)

const selectedDateKey = computed(() => selectedDate.value?.toString())

const selectedDayEvents = computed(() => {
  if (!selectedDateKey.value) {
    return []
  }
  return eventsByDay.value.get(selectedDateKey.value) ?? []
})

const upcomingEvents = computed(() => {
  const now = new Date()
  return events.value
    .filter((event) => new Date(event.start) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5)
})

const calendarView = ref<'month' | 'week' | 'year'>('month')

const calendarViewOptions = [
  { label: 'Monat', value: 'month', icon: 'i-lucide-calendar-days' },
  { label: 'Woche', value: 'week', icon: 'i-lucide-calendar-clock' },
  { label: 'Jahr', value: 'year', icon: 'i-lucide-calendar' },
] as const

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
})

const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
})

const dayMonthFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
})

const weekRangeFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
})

const weekDayShortFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
})

const weekDayFullFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
})

const weekDayDateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
})

const monthLabelFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
})

const statusMeta = {
  planned: { label: 'Geplant', color: 'amber' },
  confirmed: { label: 'Bestätigt', color: 'primary' },
  'in-progress': { label: 'Live', color: 'sky' },
  completed: { label: 'Abgeschlossen', color: 'green' },
  cancelled: { label: 'Abgesagt', color: 'red' },
} as const

const selectedDayLabel = computed(() => {
  if (!selectedDateKey.value) {
    return 'Kein Datum ausgewählt'
  }

  const date = new Date(`${selectedDateKey.value}T00:00:00`)
  return dateFormatter.format(date)
})

function formatTimeRange(event: CalendarEvent) {
  const start = new Date(event.start)
  const end = new Date(event.end)
  return `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`
}

function formatDayMonth(date: string | Date) {
  const value = typeof date === 'string' ? new Date(date) : date
  return dayMonthFormatter.format(value)
}

const isDateHighlightable = (date: DateValue) =>
  highlightedDates.value.has(date.toString())

function getEventsForDay(date: DateValue) {
  return eventsByDay.value.get(date.toString()) ?? []
}

function formatEventsTooltip(events: CalendarEvent[]) {
  return events
    .map((event) => `${event.title} (${formatTimeRange(event)})`)
    .join('\n')
}

function parseDateKey(key: string) {
  return new Date(`${key}T00:00:00Z`)
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getISOWeek(date: Date) {
  const tmp = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7)
}

const calendarVariant = computed(() =>
  calendarView.value === 'year' ? 'subtle' : 'outline'
)

const calendarSize = computed(() =>
  calendarView.value === 'year' ? 'sm' : 'lg'
)

const calendarMonthCount = computed(() =>
  calendarView.value === 'year' ? 12 : 1
)

const calendarWeekStartsOn = computed(() => 1)

const currentISOWeek = computed(() => {
  if (!selectedDateKey.value) {
    return null
  }
  const date = parseDateKey(selectedDateKey.value)
  return getISOWeek(date)
})

const calendarHeadingLabel = computed(() => {
  if (calendarView.value === 'year') {
    return 'Monatsübersicht'
  }
  if (currentISOWeek.value !== null) {
    return `KW ${currentISOWeek.value}`
  }
  return undefined
})

const calendarUi = computed(() => {
  if (calendarView.value === 'year') {
    return {
      root: 'space-y-3',
      header:
        'rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/60 px-3 py-3 text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)',
      heading:
        'text-sm font-semibold tracking-tight text-(--ui-text-highlighted)',
      body: 'grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3',
      grid: 'space-y-2 w-full rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/40 p-3',
      gridRow: 'grid grid-cols-7 gap-1 place-items-center items-stretch w-full',
      headCell:
        'text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-(--ui-text-muted)/70',
      cell: 'text-xs flex',
      cellTrigger:
        'w-full h-full flex rounded-md bg-transparent border-0 p-0 focus-visible:outline-none focus-visible:ring-0',
    }
  }

  if (calendarView.value === 'month') {
    return {
      root: 'space-y-3',
      header:
        'rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/60 px-3 py-3 text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)',
      heading:
        'text-base font-semibold tracking-tight text-(--ui-text-highlighted)',
      grid: 'space-y-3 w-full',
      gridRow: 'grid grid-cols-7 gap-3 w-full items-stretch',
      headCell:
        'text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-(--ui-text-muted)/70 text-center',
      cell: 'text-sm flex w-full h-full',
      cellTrigger:
        'w-full h-full flex rounded-lg bg-transparent border-0 p-0 focus-visible:outline-none focus-visible:ring-0',
    }
  }

  return {
    root: 'space-y-3',
    header:
      'rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/60 px-3 py-3 text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)',
    heading:
      'text-base font-semibold tracking-tight text-(--ui-text-highlighted)',
    grid: 'space-y-2 w-full',
    gridRow: 'grid grid-cols-7 gap-2 items-stretch w-full',
    headCell:
      'text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-(--ui-text-muted)/70',
    cell: 'text-sm flex w-full',
    cellTrigger:
      'w-full h-full flex rounded-md bg-transparent border-0 p-0 focus-visible:outline-none focus-visible:ring-0',
  }
})

const selectedWeekRange = computed(() => {
  if (!selectedDateKey.value) {
    return null
  }

  const reference = parseDateKey(selectedDateKey.value)
  const day = reference.getUTCDay()
  const offset = (day + 6) % 7
  const start = new Date(reference)
  start.setUTCDate(reference.getUTCDate() - offset)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)

  return { start, end }
})

const selectedWeekLabel = computed(() => {
  if (!selectedWeekRange.value) {
    return 'Keine Woche ausgewählt'
  }

  const { start, end } = selectedWeekRange.value
  const startLabel = weekDayDateFormatter.format(start)
  const endLabel = weekDayDateFormatter.format(end)
  const isoWeek = getISOWeek(start)

  return `KW ${isoWeek} · ${startLabel} – ${endLabel}`
})

const selectedWeekDays = computed(() => {
  if (!selectedWeekRange.value) {
    return []
  }

  const days = []
  const { start } = selectedWeekRange.value

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + i)
    const key = formatDateKey(date)
    const weekday = weekDayFullFormatter.format(date)
    const shortLabel = weekDayShortFormatter
      .format(date)
      .replace('.', '')
      .slice(0, 2)
      .toUpperCase()
    const dateLabel = weekDayDateFormatter.format(date)

    const rawEvents = eventsByDay.value.get(key) ?? []
    const detailedEvents = rawEvents.map((event) => {
      const startDate = new Date(event.start)
      const endDate = new Date(event.end)
      const startMinutes = startDate.getHours() * 60 + startDate.getMinutes()
      const endMinutes = endDate.getHours() * 60 + endDate.getMinutes()
      const durationMinutes = Math.max(endMinutes - startMinutes, 30)
      const top = (startMinutes / 60) * WEEK_HOUR_HEIGHT
      const height = Math.max(
        (durationMinutes / 60) * WEEK_HOUR_HEIGHT,
        WEEK_HOUR_HEIGHT / 2
      )

      return {
        ...event,
        timeRange: formatTimeRange(event),
        layout: {
          top,
          height,
        },
      }
    })

    days.push({
      key,
      label: dateLabel,
      shortLabel,
      weekday,
      date,
      isToday: todayKey.value === key,
      events: detailedEvents,
      eventCount: rawEvents.length,
    })
  }

  return days.sort((a, b) => a.date.getTime() - b.date.getTime())
})

const totalWeekEvents = computed(() =>
  selectedWeekDays.value.reduce((total, day) => total + day.eventCount, 0)
)

const selectedYear = computed(() => {
  if (selectedDateKey.value) {
    return Number.parseInt(selectedDateKey.value.slice(0, 4), 10)
  }

  return new Date().getUTCFullYear()
})

const yearOverview = computed(() => {
  const year = selectedYear.value

  const months = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthDate = new Date(Date.UTC(year, monthIndex, 1))
    const monthEvents = events.value
      .filter((event) => {
        const eventDate = new Date(event.start)
        return (
          eventDate.getUTCFullYear() === year &&
          eventDate.getUTCMonth() === monthIndex
        )
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    const now = new Date()
    const nextEvent = monthEvents.find(
      (event) => new Date(event.start).getTime() >= now.getTime()
    )

    return {
      monthIndex,
      label: monthLabelFormatter.format(monthDate),
      events: monthEvents,
      count: monthEvents.length,
      nextEvent,
    }
  })

  return months
})

const totalYearEvents = computed(() =>
  yearOverview.value.reduce((total, month) => total + month.count, 0)
)

const hasYearEvents = computed(() =>
  yearOverview.value.some((month) => month.count > 0)
)

function isDateInSelectedWeek(date: DateValue) {
  if (calendarView.value !== 'week' || !selectedWeekRange.value) {
    return false
  }

  const value = parseDateKey(date.toString())
  const { start, end } = selectedWeekRange.value
  return value.getTime() >= start.getTime() && value.getTime() <= end.getTime()
}

const todayKey = computed(() => today(getLocalTimeZone()).toString())

const daySizeClasses = computed(() =>
  calendarView.value === 'year' ? 'size-8 text-xs' : 'size-9 text-sm'
)

const dayDotSizeClasses = computed(() =>
  calendarView.value === 'year' ? 'mt-1 h-1 w-1' : 'mt-1 h-1.5 w-1.5'
)

const WEEK_HOUR_HEIGHT = 64
const WEEK_HEADER_HEIGHT = 68
const WEEK_GRID_HEIGHT = WEEK_HOUR_HEIGHT * 24
const weekHourLabels = computed(() =>
  Array.from({ length: 24 }, (_, hour) => `${hour.toString().padStart(2, '0')}:00`)
)
const weekHourGuides = Array.from({ length: 25 }, (_, index) => index)

function isSelectedDate(date: DateValue) {
  return selectedDateKey.value === date.toString()
}

function isTodayDate(date: DateValue) {
  return todayKey.value === date.toString()
}

function hasEventsForDay(date: DateValue) {
  return highlightedDates.value.has(date.toString())
}

function getDayClasses(date: DateValue, hasEvents: boolean) {
  if (calendarView.value === 'month') {
    const classes = [
      'flex h-24 w-full flex-col justify-between rounded-lg border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 p-3 text-left text-(--ui-text-muted) transition-colors duration-200',
      'hover:border-(--ui-primary)/30 hover:bg-(--ui-primary)/8',
    ]

    if (isSelectedDate(date)) {
      classes.push(
        'border-(--ui-primary) bg-(--ui-primary)/15 text-(--ui-text-highlighted) shadow-[0_0_18px_rgba(0,255,232,0.25)]'
      )
    } else if (isTodayDate(date)) {
      classes.push('border-(--ui-primary)/35 text-(--ui-text-highlighted)')
    } else if (hasEvents) {
      classes.push('border-(--ui-primary)/25 text-(--ui-text-highlighted)')
    }

    return classes
  }

  const classes = [
    'relative flex flex-col items-center justify-center rounded-lg font-semibold transition-colors duration-200 border border-transparent',
    daySizeClasses.value,
    calendarView.value === 'year' ? 'gap-0.5' : 'gap-1',
    'text-(--ui-text-muted)',
  ]

  let hoverClass = 'hover:bg-(--ui-primary)/12'

  if (isSelectedDate(date)) {
    classes.push(
      'bg-(--ui-primary) text-black border-(--ui-primary) shadow-[0_0_18px_rgba(0,255,232,0.25)] hover:bg-(--ui-primary)'
    )
    hoverClass = ''
  } else if (calendarView.value === 'week' && isDateInSelectedWeek(date)) {
    classes.push(
      'bg-(--ui-primary)/15 text-(--ui-text-highlighted) border-(--ui-primary)/30'
    )
  } else if (isTodayDate(date)) {
    classes.push('border-(--ui-primary)/45 text-(--ui-text-highlighted)')
  } else if (hasEvents) {
    classes.push(
      'bg-(--ui-primary)/8 text-(--ui-primary) border-(--ui-primary)/25'
    )
  }

  if (hoverClass) {
    classes.push(hoverClass)
  }

  return classes
}

function getDayDotClasses(date: DateValue, hasEvents: boolean) {
  if (calendarView.value === 'month') {
    const classes = [
      'mt-2 h-1 w-6 rounded-full bg-(--ui-primary) transition-opacity duration-200',
    ]

    if (hasEvents) {
      classes.push(isSelectedDate(date) ? 'opacity-100 bg-black' : 'opacity-80')
    } else {
      classes.push('opacity-0')
    }

    return classes
  }

  const classes = [
    'block rounded-full transition-opacity duration-200 bg-(--ui-primary)',
    dayDotSizeClasses.value,
  ]

  if (hasEvents) {
    if (isSelectedDate(date)) {
      classes.push('opacity-100 bg-black')
    } else {
      classes.push('opacity-100')
    }
  } else {
    classes.push('opacity-0')
  }

  return classes
}

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div class="space-y-6">
    <AMSPageHeader
      icon="i-lucide-calendar-range"
      title="Kalender"
      description="Plane Einsätze, Trainings und Events der ArisCorp."
    />

    <div
      class="grid gap-6 xl:grid-cols-[360px,1fr] 2xl:grid-cols-[400px,1fr] items-start"
    >
      <UCard variant="ams" class="animated-border relative overflow-hidden">
        <template #header>
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span
                class="text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
              >
                Übersicht
              </span>
              <UBadge
                v-if="events.length"
                color="primary"
                variant="subtle"
                size="xs"
                class="uppercase tracking-wide bg-(--ui-primary)/15 text-(--ui-primary)"
              >
                {{ events.length }} Termine
              </UBadge>
              <UBadge
                v-if="currentISOWeek !== null"
                color="neutral"
                variant="soft"
                size="xs"
                class="uppercase tracking-wide"
              >
                KW {{ currentISOWeek }}
              </UBadge>
            </div>

            <URadioGroup
              v-model="calendarView"
              :items="calendarViewOptions"
              value-key="value"
              indicator="hidden"
              variant="amsSpaced"
              orientation="horizontal"
              class="w-full"
            >
              <template #label="{ item }">
                <span
                  class="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em]"
                >
                  <UIcon
                    :name="item.icon"
                    class="size-3.5 text-(--ui-primary)"
                  />
                  {{ item.label }}
                </span>
              </template>
            </URadioGroup>
          </div>
        </template>

        <div v-if="calendarView === 'week'" class="overflow-x-auto">
          <div
            class="grid min-w-[1200px] grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-4"
          >
            <div>
              <div :style="{ height: `${WEEK_HEADER_HEIGHT}px` }" />
              <div class="relative" :style="{ height: `${WEEK_GRID_HEIGHT}px` }">
                <div
                  v-for="(label, index) in weekHourLabels"
                  :key="`hour-label-${label}`"
                  class="absolute right-3 translate-y-[-50%] text-[0.65rem] uppercase tracking-wide text-(--ui-text-muted)"
                  :style="{ top: `${index * WEEK_HOUR_HEIGHT}px` }"
                >
                  {{ label }}
                </div>
              </div>
            </div>

            <div
              v-for="day in selectedWeekDays"
              :key="day.key"
              class="rounded-2xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 backdrop-blur-sm transition duration-300 hover:border-(--ui-primary)/35"
              :class="[day.isToday ? 'border-(--ui-primary)/35 shadow-[0_0_18px_rgba(0,255,232,0.15)]' : '']"
            >
              <div
                class="flex items-center justify-between gap-2 border-b border-(--ui-primary)/10 px-4 py-3"
                :class="[day.isToday ? 'bg-(--ui-primary)/10 text-(--ui-text-highlighted)' : '']"
              >
                <div class="space-y-1">
                  <p class="text-xs uppercase tracking-wide text-(--ui-text-muted)">
                    {{ day.weekday }}
                  </p>
                  <p class="text-lg font-semibold text-(--ui-text-highlighted)">
                    {{ day.label }}
                  </p>
                </div>
                <UBadge
                  color="primary"
                  variant="soft"
                  size="xs"
                  class="uppercase tracking-wide"
                >
                  {{ day.eventCount }}
                </UBadge>
              </div>

              <div class="relative" :style="{ height: `${WEEK_GRID_HEIGHT}px` }">
                <div
                  v-for="guide in weekHourGuides"
                  :key="`overview-guide-${guide}`"
                  class="absolute left-0 right-0 border-t border-(--ui-primary)/12"
                  :style="{ top: `${guide * WEEK_HOUR_HEIGHT}px` }"
                />

                <div
                  v-if="!day.events.length"
                  class="absolute left-3 right-3 top-1/2 -translate-y-1/2 rounded-lg border border-dashed border-(--ui-primary)/25 bg-(--ui-bg-muted)/50 px-3 py-2 text-center text-xs uppercase tracking-wide text-(--ui-text-muted)"
                >
                  Keine Events
                </div>

                <div
                  v-for="event in day.events"
                  :key="event.id"
                  class="absolute left-3 right-3 rounded-lg border border-(--ui-primary)/25 bg-(--ui-primary)/10/50 p-3 text-left shadow-[0_0_12px_rgba(0,255,232,0.15)]"
                  :style="{
                    top: `${event.layout.top}px`,
                    height: `${event.layout.height}px`,
                  }"
                >
                  <p class="text-[0.65rem] uppercase tracking-wide text-(--ui-primary)">
                    {{ event.timeRange }}
                  </p>
                  <p class="mt-1 text-sm font-semibold text-(--ui-text-highlighted)">
                    {{ event.title }}
                  </p>
                  <div
                    class="mt-2 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-wide text-(--ui-text-muted)"
                  >
                    <span class="inline-flex items-center gap-1.5">
                      <UIcon
                        name="i-lucide-map-pin"
                        class="size-3 text-(--ui-primary)"
                      />
                      {{ event.location }}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <UIcon
                        name="i-lucide-briefcase"
                        class="size-3 text-(--ui-primary)"
                      />
                      {{ event.department }}
                    </span>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-wide">
                    <UBadge
                      v-for="tag in event.tags"
                      :key="`${event.id}-${tag}`"
                      color="primary"
                      variant="subtle"
                      size="xs"
                      class="uppercase tracking-wide text-(--ui-text-muted)"
                    >
                      {{ tag }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="relative space-y-5">
          <div
            aria-hidden="true"
            class="pointer-events-none absolute -top-24 right-[-5rem] h-60 w-60 rounded-full bg-(--ui-primary)/25 blur-3xl opacity-60"
          />
          <div
            class="relative rounded-2xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 p-3 sm:p-4 backdrop-blur-sm ring-1 ring-inset ring-(--ui-primary)/15"
          >
            <UCalendar
              v-model="selectedDate"
              :is-date-highlightable="isDateHighlightable"
              :number-of-months="calendarMonthCount"
              :variant="calendarVariant"
              :size="calendarSize"
              :week-starts-on="calendarWeekStartsOn"
              :calendar-label="calendarHeadingLabel"
              class="w-full"
              :ui="calendarUi"
            >
              <template #heading="{ value }">
                <span
                  v-if="calendarView === 'year'"
                  class="text-xs font-semibold uppercase tracking-wide text-(--ui-text-highlighted)"
                >
                  {{ value }}
                </span>
                <span v-else>{{ value }}</span>
              </template>
              <template #day="{ day }">
                <UTooltip
                  v-if="hasEventsForDay(day)"
                  :text="formatEventsTooltip(getEventsForDay(day))"
                  :content="{ side: 'top' }"
                >
                  <span :class="getDayClasses(day, true)">
                    <span
                      :class="[
                        calendarView === 'month'
                          ? 'text-sm font-semibold tracking-tight'
                          : 'text-sm font-semibold',
                      ]"
                    >
                      {{ day.day }}
                    </span>
                    <span :class="getDayDotClasses(day, true)" />
                  </span>
                </UTooltip>
                <span v-else :class="getDayClasses(day, false)">
                  <span
                    :class="[
                      calendarView === 'month'
                        ? 'text-sm font-semibold tracking-tight'
                        : 'text-sm font-semibold',
                    ]"
                  >
                    {{ day.day }}
                  </span>
                  <span :class="getDayDotClasses(day, false)" />
                </span>
              </template>
            </UCalendar>
          </div>
          <p class="text-xs text-(--ui-text-muted)">
            Hervorgehobene Tage enthalten mindestens ein geplantes Event.
          </p>
        </div>
      </UCard>

      <div class="space-y-6">
        <template v-if="calendarView === 'month'">
          <UCard variant="ams" class="animated-border relative overflow-hidden">
            <template #header>
              <div
                class="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap"
              >
                <div class="space-y-1">
                  <p
                    class="text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
                  >
                    Ausgewählter Tag
                  </p>
                  <p class="text-lg font-semibold text-(--ui-text-highlighted)">
                    {{ selectedDayLabel }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge
                    v-if="currentISOWeek !== null"
                    color="neutral"
                    variant="soft"
                    size="xs"
                    class="uppercase tracking-wide"
                  >
                    KW {{ currentISOWeek }}
                  </UBadge>
                  <UBadge
                    color="neutral"
                    variant="soft"
                    size="sm"
                    class="shrink-0 uppercase tracking-wide"
                  >
                    {{ selectedDayEvents.length }}
                    {{ selectedDayEvents.length === 1 ? 'Event' : 'Events' }}
                  </UBadge>
                </div>
              </div>
            </template>

            <ul v-if="selectedDayEvents.length" class="space-y-4">
              <li
                v-for="event in selectedDayEvents"
                :key="event.id"
                class="group rounded-xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 p-5 backdrop-blur-sm transition duration-300 hover:border-(--ui-primary)/35 hover:shadow-[0_0_24px_rgba(0,255,232,0.18)]"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="space-y-2 text-left">
                    <p
                      class="text-sm font-semibold leading-tight text-(--ui-text-highlighted) tracking-tight"
                    >
                      {{ event.title }}
                    </p>
                    <span class="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-(--ui-primary)">
                      <UIcon name="i-lucide-clock" class="size-3" />
                      {{ formatTimeRange(event) }}
                    </span>
                  </div>
                  <UBadge
                    :color="statusMeta[event.status].color"
                    variant="subtle"
                    size="xs"
                    class="uppercase tracking-wide"
                  >
                    {{ statusMeta[event.status].label }}
                  </UBadge>
                </div>
                <div class="mt-3 flex flex-wrap gap-2 text-[0.7rem] uppercase tracking-wide text-(--ui-text-muted)">
                  <UBadge
                    v-for="tag in event.tags"
                    :key="tag"
                    color="primary"
                    variant="subtle"
                    size="xs"
                    class="uppercase tracking-wide text-(--ui-text-muted)"
                  >
                    {{ tag }}
                  </UBadge>
                </div>
              </li>
            </ul>
            <p v-else class="text-sm text-(--ui-text-muted)">
              Keine Events für diesen Tag geplant. Wähle einen hervorgehobenen
              Tag, um Details zu sehen.
            </p>
          </UCard>
        </template>

        <template v-else-if="calendarView === 'week'">
          <UCard variant="ams" class="animated-border relative overflow-hidden">
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="space-y-1">
                  <p
                    class="text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
                  >
                    Ausgewählte Woche
                  </p>
                  <p class="text-lg font-semibold text-(--ui-text-highlighted)">
                    {{ selectedWeekLabel }}
                  </p>
                </div>
                <UBadge
                  color="neutral"
                  variant="soft"
                  size="sm"
                  class="uppercase tracking-wide"
                >
                  {{ totalWeekEvents }}
                  {{ totalWeekEvents === 1 ? 'Event' : 'Events' }}
                </UBadge>
              </div>
            </template>

            <div v-if="selectedWeekDays.length" class="space-y-4">
              <div
                v-for="day in selectedWeekDays"
                :key="day.key"
                class="rounded-xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 p-4 backdrop-blur-sm transition duration-300 hover:border-(--ui-primary)/30"
                :class="[day.isToday ? 'border-(--ui-primary)/35 shadow-[0_0_12px_rgba(0,255,232,0.2)]' : '']"
              >
                <div class="flex items-center justify-between gap-2 border-b border-(--ui-primary)/10 pb-3">
                  <div>
                    <p class="text-xs uppercase tracking-wide text-(--ui-text-muted)">
                      {{ day.weekday }}
                    </p>
                    <p class="text-sm font-semibold text-(--ui-text-highlighted)">
                      {{ day.label }}
                    </p>
                  </div>
                  <UBadge color="primary" variant="soft" size="xs" class="uppercase tracking-wide">
                    {{ day.eventCount }}
                  </UBadge>
                </div>

                <ul v-if="day.events.length" class="mt-3 space-y-3">
                  <li
                    v-for="event in day.events"
                    :key="event.id"
                    class="rounded-lg border border-(--ui-primary)/20 bg-(--ui-bg-muted)/50 p-3 transition duration-200 hover:border-(--ui-primary)/35"
                  >
                    <div class="flex flex-wrap items-start justify-between gap-2 text-[0.65rem] uppercase tracking-wide text-(--ui-text-muted)">
                      <span class="inline-flex items-center gap-1 text-(--ui-primary)">
                        <UIcon name="i-lucide-clock" class="size-3" />
                        {{ event.timeRange }}
                      </span>
                      <UBadge
                        :color="statusMeta[event.status].color"
                        variant="soft"
                        size="xs"
                        class="uppercase tracking-wide"
                      >
                        {{ statusMeta[event.status].label }}
                      </UBadge>
                    </div>
                    <p class="mt-2 text-sm font-semibold text-(--ui-text-highlighted)">
                      {{ event.title }}
                    </p>
                    <div class="mt-3 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-wide text-(--ui-text-muted)">
                      <span class="inline-flex items-center gap-1.5">
                        <UIcon name="i-lucide-map-pin" class="size-3 text-(--ui-primary)" />
                        {{ event.location }}
                      </span>
                      <span class="inline-flex items-center gap-1.5">
                        <UIcon name="i-lucide-briefcase" class="size-3 text-(--ui-primary)" />
                        {{ event.department }}
                      </span>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-wide">
                      <UBadge
                        v-for="tag in event.tags"
                        :key="`${event.id}-${tag}`"
                        color="primary"
                        variant="subtle"
                        size="xs"
                        class="uppercase tracking-wide text-(--ui-text-muted)"
                      >
                        {{ tag }}
                      </UBadge>
                    </div>
                  </li>
                </ul>
                <p v-else class="mt-3 text-xs uppercase tracking-wide text-(--ui-text-muted)">
                  Keine Events geplant.
                </p>
              </div>
            </div>
            <p v-else class="text-sm text-(--ui-text-muted)">
              Keine Woche ausgewählt.
            </p>
          </UCard>
        </template>

        <template v-else>
          <UCard variant="ams" class="animated-border relative overflow-hidden">
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="space-y-1">
                  <p
                    class="text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
                  >
                    Jahresübersicht
                  </p>
                  <p class="text-lg font-semibold text-(--ui-text-highlighted)">
                    {{ selectedYear }}
                  </p>
                </div>
                <UBadge
                  color="neutral"
                  variant="soft"
                  size="sm"
                  class="uppercase tracking-wide"
                >
                  {{ totalYearEvents }}
                  {{ totalYearEvents === 1 ? 'Event' : 'Events' }}
                </UBadge>
                <UBadge
                  v-if="currentISOWeek !== null"
                  color="neutral"
                  variant="soft"
                  size="xs"
                  class="uppercase tracking-wide"
                >
                  KW {{ currentISOWeek }}
                </UBadge>
              </div>
            </template>

            <div
              v-if="hasYearEvents"
              class="space-y-3 max-h-[32rem] overflow-y-auto pr-1"
            >
              <template v-for="month in yearOverview" :key="month.monthIndex">
                <div
                  v-if="month.count"
                  class="rounded-xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 p-5 backdrop-blur-sm transition duration-300 hover:border-(--ui-primary)/30"
                >
                  <div
                    class="flex flex-wrap items-center justify-between gap-2"
                  >
                    <div class="flex items-center gap-2">
                      <UIcon
                        name="i-lucide-calendar-days"
                        class="size-4 text-(--ui-primary)"
                      />
                      <span
                        class="text-sm font-semibold text-(--ui-text-highlighted)"
                      >
                        {{ month.label }}
                      </span>
                    </div>
                    <UBadge
                      color="neutral"
                      variant="soft"
                      size="xs"
                      class="uppercase tracking-wide"
                    >
                      {{ month.count }}
                      {{ month.count === 1 ? 'Event' : 'Events' }}
                    </UBadge>
                  </div>

                  <div
                    v-if="month.nextEvent"
                    class="mt-3 space-y-2 text-xs text-(--ui-text-muted)"
                  >
                    <div
                      class="flex items-center gap-2 text-sm font-semibold text-(--ui-text-highlighted)"
                    >
                      <UIcon
                        name="i-lucide-star"
                        class="size-4 text-(--ui-primary)"
                      />
                      {{ month.nextEvent.title }}
                    </div>
                    <div
                      class="flex flex-wrap items-center gap-3 text-[0.7rem] uppercase tracking-wide"
                    >
                      <span class="inline-flex items-center gap-1.5">
                        <UIcon
                          name="i-lucide-calendar-clock"
                          class="size-3 text-(--ui-primary)"
                        />
                        {{ formatDayMonth(month.nextEvent.start) }}
                      </span>
                      <span class="inline-flex items-center gap-1.5">
                        <UIcon
                          name="i-lucide-clock"
                          class="size-3 text-(--ui-primary)"
                        />
                        {{ formatTimeRange(month.nextEvent) }}
                      </span>
                      <span class="inline-flex items-center gap-1.5">
                        <UIcon
                          name="i-lucide-map-pin"
                          class="size-3 text-(--ui-primary)"
                        />
                        {{ month.nextEvent.location }}
                      </span>
                    </div>
                  </div>
                  <p v-else class="mt-3 text-xs text-(--ui-text-muted)">
                    Keine Events geplant.
                  </p>
                </div>
              </template>
            </div>
            <p v-else class="text-sm text-(--ui-text-muted)">
              Für {{ selectedYear }} sind noch keine Events erfasst.
            </p>
          </UCard>
        </template>

        <UCard variant="ams" class="animated-border relative overflow-hidden">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <p
                  class="text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
                >
                  Ausblick
                </p>
                <p class="text-lg font-semibold text-(--ui-text-highlighted)">
                  Demnächst anstehend
                </p>
              </div>
              <UBadge
                color="primary"
                variant="soft"
                size="xs"
                class="uppercase tracking-wide"
              >
                Top 5
              </UBadge>
            </div>
          </template>

          <ul v-if="upcomingEvents.length" class="space-y-4">
            <li
              v-for="event in upcomingEvents"
              :key="event.id"
              class="group rounded-xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 p-5 backdrop-blur-sm transition duration-300 hover:border-(--ui-primary)/35 hover:shadow-[0_0_24px_rgba(0,255,232,0.18)]"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-2 text-left">
                  <p
                    class="text-sm font-semibold leading-tight text-(--ui-text-highlighted) tracking-tight"
                  >
                    {{ event.title }}
                  </p>
                  <div
                    class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--ui-text-muted)/90"
                  >
                    <span class="inline-flex items-center gap-1.5">
                      <UIcon
                        name="i-lucide-calendar-days"
                        class="size-3 text-(--ui-primary)"
                      />
                      {{ formatDayMonth(event.start) }}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <UIcon
                        name="i-lucide-clock"
                        class="size-3 text-(--ui-primary)"
                      />
                      {{ formatTimeRange(event) }}
                    </span>
                  </div>
                </div>
                <UBadge
                  :color="statusMeta[event.status].color"
                  variant="soft"
                  size="xs"
                  class="uppercase tracking-wide"
                >
                  {{ statusMeta[event.status].label }}
                </UBadge>
              </div>
              <div
                v-if="event.tags.length"
                class="mt-4 flex flex-wrap gap-2 text-xs"
              >
                <UBadge
                  v-for="tag in event.tags"
                  :key="tag"
                  color="primary"
                  variant="subtle"
                  size="xs"
                  class="uppercase tracking-wide text-(--ui-text-muted)"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </li>
          </ul>
          <p v-else class="text-sm text-(--ui-text-muted)">
            Keine zukünftigen Events geplant.
          </p>
        </UCard>
      </div>
    </div>
  </div>
</template>

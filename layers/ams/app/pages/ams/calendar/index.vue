<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventDropArg,
  EventResizeDoneArg,
  EventContentArg,
} from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import multiMonthPlugin from '@fullcalendar/multimonth'
import type { DateClickArg } from '@fullcalendar/interaction'

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

interface CreateCalendarEventInput {
  id?: string
  title: string
  summary: string
  location: string
  department: string
  start: string | Date
  end: string | Date
  status?: CalendarEvent['status']
  tags?: string[]
}

const mockEvents: CalendarEvent[] = [
  {
    id: 'mission-atlas',
    title: 'Operation Atlas – Aufklärungsflug',
    summary:
      'Abendliches Aufklärungsmanöver rund um MicroTech, Fokus auf Kopfgeldziele und Signalaufklärung.',
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
      'Sicherheitseskorte für einen gemischten Konvoi zwischen Crusader und Hurston.',
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
      'Medizinisches Einsatztraining inkl. Evakuierungssimulationen und Triagen-Übungen.',
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

function resolveDateInput(value: string | Date, field: 'start' | 'end') {
  if (value instanceof Date) {
    const timestamp = value.getTime()
    if (Number.isNaN(timestamp)) {
      throw new Error(`Ungültiges Datum für ${field}`)
    }
    return new Date(timestamp)
  }

  let isoString = value.trim()

  if (!isoString.length) {
    throw new Error(`Ungültiges Datum für ${field}`)
  }

  const hasTimezone = /([+-]\d{2}:\d{2}|z)$/i.test(isoString)
  if (!hasTimezone) {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(isoString)) {
      isoString = `${isoString}:00`
    }
    isoString = `${isoString}Z`
  }

  const date = new Date(isoString)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Ungültiges Datum für ${field}`)
  }

  return date
}

function normalizeTags(tags: string[] = []) {
  return Array.from(
    new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0))
  )
}

function generateEventId(title: string, startDate: Date) {
  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const timestampPart = startDate.getTime().toString(36)
  const randomPart = Math.random().toString(36).slice(2, 6)

  return `${slug || 'event'}-${timestampPart}-${randomPart}`
}

async function createCalendarEvent(
  input: CreateCalendarEventInput
): Promise<CalendarEvent> {
  const startDate = resolveDateInput(input.start, 'start')
  const endDate = resolveDateInput(input.end, 'end')

  if (endDate.getTime() <= startDate.getTime()) {
    throw new Error('Endzeit muss nach der Startzeit liegen')
  }

  const event: CalendarEvent = {
    id: input.id ?? generateEventId(input.title, startDate),
    title: input.title.trim(),
    summary: input.summary.trim(),
    location: input.location.trim(),
    department: input.department.trim(),
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    status: input.status ?? 'planned',
    tags: normalizeTags(input.tags),
  }

  const currentEvents = eventsData.value ?? []
  eventsData.value = [...currentEvents, event]

  return event
}

async function updateCalendarEventTime(
  eventId: string,
  updates: { start?: Date; end?: Date }
): Promise<CalendarEvent | null> {
  const list = eventsData.value ?? []
  const index = list.findIndex((event) => event.id === eventId)

  if (index === -1) {
    return null
  }

  const existing = list[index]
  const startDate =
    updates.start instanceof Date
      ? new Date(updates.start)
      : new Date(existing.start)
  const endDate =
    updates.end instanceof Date ? new Date(updates.end) : new Date(existing.end)

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate.getTime() <= startDate.getTime()
  ) {
    return null
  }

  const updated: CalendarEvent = {
    ...existing,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  }

  const next = [...list]
  next.splice(index, 1, updated)
  eventsData.value = next

  return updated
}

type CreateEventFormState = {
  title: string
  summary: string
  location: string
  department: string
  start: string
  end: string
  status: CalendarEvent['status']
  tagsInput: string
}

const createEventModalOpen = ref(false)
const createEventLoading = ref(false)
const createEventError = ref<string | null>(null)

const defaultCreateEventFormState = (): CreateEventFormState => ({
  title: '',
  summary: '',
  location: '',
  department: '',
  start: '',
  end: '',
  status: 'planned',
  tagsInput: '',
})

const createEventForm = reactive<CreateEventFormState>(
  defaultCreateEventFormState()
)

function resetCreateEventForm() {
  Object.assign(createEventForm, defaultCreateEventFormState())
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`
}

function parseDateKey(key: string) {
  return new Date(`${key}T00:00:00`)
}

function formatDateTimeLocal(date: Date) {
  const target = new Date(date)
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(
    target.getDate()
  )}T${pad(target.getHours())}:${pad(target.getMinutes())}`
}

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

function startOfWeek(date: Date) {
  const result = startOfDay(date)
  const day = result.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  result.setDate(result.getDate() + diff)
  return result
}

function endOfWeek(date: Date) {
  const result = startOfWeek(date)
  result.setDate(result.getDate() + 6)
  return endOfDay(result)
}

function getISOWeek(date: Date) {
  const tmp = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const calendarView = ref<'month' | 'week' | 'year'>('month')
const calendarDate = ref(new Date())
const selectedDateKey = ref(formatDateKey(new Date()))
const jumpToDate = ref(selectedDateKey.value)

const calendarPlugins = [
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin,
  multiMonthPlugin,
] as const

const calendarViewMap = {
  month: 'dayGridMonth',
  week: 'timeGridWeek',
  year: 'multiMonthYear',
} as const

const weekRangeFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
})

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
})

const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
})

const monthLabelFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
})

const weekdayLabelFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
})

const monthYearLabelFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
})

const statusMeta = {
  planned: { label: 'Geplant', color: 'amber' },
  confirmed: { label: 'Bestätigt', color: 'primary' },
  'in-progress': { label: 'Live', color: 'sky' },
  completed: { label: 'Abgeschlossen', color: 'green' },
  cancelled: { label: 'Abgesagt', color: 'red' },
} as const

const calendarViewOptions = [
  { label: 'Monat', value: 'month', icon: 'i-lucide-calendar-days' },
  { label: 'Woche', value: 'week', icon: 'i-lucide-calendar-clock' },
  { label: 'Jahr', value: 'year', icon: 'i-lucide-calendar' },
] as const

const statusFilterOptions = Object.entries(statusMeta).map(
  ([value, meta]) => ({
    value: value as CalendarEvent['status'],
    label: meta.label,
    color: meta.color,
  })
)

const searchTerm = ref('')
const activeStatusFilters = ref<CalendarEvent['status'][]>([])
const activeDepartmentFilters = ref<string[]>([])
const filtersOpen = ref(false)

const normalizedSearchTerm = computed(() => searchTerm.value.trim().toLowerCase())

const filtersActive = computed(
  () =>
    normalizedSearchTerm.value.length > 0 ||
    activeStatusFilters.value.length > 0 ||
    activeDepartmentFilters.value.length > 0
)

const departmentOptions = computed(() => {
  const departments = new Set<string>()
  for (const event of events.value) {
    const department = event.department.trim()
    if (department.length) {
      departments.add(department)
    }
  }
  return Array.from(departments).sort((a, b) => a.localeCompare(b, 'de'))
})

const departmentFilterItems = computed(() =>
  departmentOptions.value.map((department) => ({
    label: department,
    value: department,
  }))
)

const visibleEvents = computed(() => {
  const term = normalizedSearchTerm.value
  const statusFilters = activeStatusFilters.value
  const departmentFilters = activeDepartmentFilters.value

  return events.value.filter((event) => {
    if (statusFilters.length && !statusFilters.includes(event.status)) {
      return false
    }

    if (departmentFilters.length && !departmentFilters.includes(event.department)) {
      return false
    }

    if (term) {
      const haystack = [
        event.title,
        event.summary,
        event.location,
        event.department,
        statusMeta[event.status]?.label,
        event.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(term)) {
        return false
      }
    }

    return true
  })
})

const visibleEventCount = computed(() => visibleEvents.value.length)
const activeFiltersCount = computed(
  () =>
    (normalizedSearchTerm.value.length ? 1 : 0) +
    activeStatusFilters.value.length +
    activeDepartmentFilters.value.length
)

const highlightedDates = computed(() => {
  const days = new Set<string>()

  for (const event of visibleEvents.value) {
    const startDate = new Date(event.start)
    const endDate = new Date(event.end)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      continue
    }

    const endMarker = new Date(endDate.getTime() - 1)
    const cursor = startOfDay(startDate)

    while (cursor.getTime() <= endMarker.getTime()) {
      days.add(formatDateKey(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  return days
})

const eventsByDay = computed(() => {
  const map = new Map<string, CalendarEvent[]>()

  for (const event of visibleEvents.value) {
    const startDate = new Date(event.start)
    const endDate = new Date(event.end)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      continue
    }

    const dayCursor = startOfDay(startDate)
    const endMarker = new Date(endDate.getTime() - 1)

    while (dayCursor.getTime() <= endMarker.getTime()) {
      const key = formatDateKey(dayCursor)
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(event)
      dayCursor.setDate(dayCursor.getDate() + 1)
    }
  }

  for (const [, list] of map) {
    list.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    )
  }

  return map
})

const selectedDayEvents = computed(() => {
  return eventsByDay.value.get(selectedDateKey.value) ?? []
})

const selectedDayDate = computed(() => parseDateKey(selectedDateKey.value))

const selectedDayWeekday = computed(() =>
  weekdayLabelFormatter.format(selectedDayDate.value)
)

const selectedDayMonthLabel = computed(() =>
  monthYearLabelFormatter.format(selectedDayDate.value)
)

const selectedDayDayNumber = computed(() =>
  selectedDayDate.value.getDate().toString().padStart(2, '0')
)

const selectedDayIsoWeek = computed(() => getISOWeek(selectedDayDate.value))

const selectedDayPrimaryEvent = computed(() => selectedDayEvents.value[0] ?? null)
const selectedDayAdditionalEvents = computed(() =>
  selectedDayEvents.value.slice(1)
)

const upcomingEvents = computed(() => {
  const now = new Date()
  return visibleEvents.value
    .filter((event) => new Date(event.start).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5)
})

const totalEvents = computed(() => events.value.length)
const currentISOWeek = computed(() => getISOWeek(calendarDate.value))

const selectedDayLabel = computed(() => {
  if (!selectedDateKey.value) {
    return 'Kein Datum ausgewählt'
  }

  const date = parseDateKey(selectedDateKey.value)
  return dateFormatter.format(date)
})

const calendarHeadingLabel = computed(() => {
  if (calendarView.value === 'month') {
    return monthLabelFormatter.format(calendarDate.value)
  }

  if (calendarView.value === 'week') {
    const start = startOfWeek(calendarDate.value)
    const end = endOfWeek(calendarDate.value)
    return `${weekRangeFormatter.format(start)} – ${weekRangeFormatter.format(
      end
    )}`
  }

  return calendarDate.value.getFullYear().toString()
})

const fullCalendarEvents = computed(() =>
  visibleEvents.value.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    extendedProps: {
      status: event.status,
      location: event.location,
      department: event.department,
      summary: event.summary,
      tags: event.tags,
    },
  }))
)

function toggleStatusFilter(status: CalendarEvent['status']) {
  const index = activeStatusFilters.value.indexOf(status)
  if (index === -1) {
    activeStatusFilters.value = [...activeStatusFilters.value, status]
    return
  }

  activeStatusFilters.value = [
    ...activeStatusFilters.value.slice(0, index),
    ...activeStatusFilters.value.slice(index + 1),
  ]
}

function toggleDepartmentFilter(department: string) {
  const index = activeDepartmentFilters.value.indexOf(department)
  if (index === -1) {
    activeDepartmentFilters.value = [...activeDepartmentFilters.value, department]
    return
  }

  activeDepartmentFilters.value = [
    ...activeDepartmentFilters.value.slice(0, index),
    ...activeDepartmentFilters.value.slice(index + 1),
  ]
}

function resetFilters() {
  searchTerm.value = ''
  activeStatusFilters.value = []
  activeDepartmentFilters.value = []
  filtersOpen.value = false
}

function selectEvent(event: CalendarEvent) {
  const eventStart = new Date(event.start)
  if (Number.isNaN(eventStart.getTime())) {
    return
  }

  const dateKey = formatDateKey(eventStart)
  if (dateKey !== selectedDateKey.value) {
    selectedDateKey.value = dateKey
  }
}

watch(jumpToDate, (value) => {
  if (!value || value === selectedDateKey.value) {
    return
  }

  const date = parseDateKey(value)
  if (!Number.isNaN(date.getTime())) {
    selectedDateKey.value = formatDateKey(date)
  }
})

watch(selectedDateKey, (key) => {
  jumpToDate.value = key
})

const statusClassMap: Record<CalendarEvent['status'], string> = {
  planned: 'is-status-planned',
  confirmed: 'is-status-confirmed',
  'in-progress': 'is-status-in-progress',
  completed: 'is-status-completed',
  cancelled: 'is-status-cancelled',
}

function getCalendarApi() {
  return calendarRef.value?.getApi() ?? null
}

function handleDatesSet(payload: DatesSetArg) {
  calendarDate.value = payload.view.currentStart
}

function handleDateSelect(payload: DateSelectArg) {
  selectedDateKey.value = formatDateKey(payload.start)

  createEventForm.start = formatDateTimeLocal(payload.start)
  const end = payload.end ?? new Date(payload.start.getTime() + 60 * 60 * 1000)
  createEventForm.end = formatDateTimeLocal(end)
  createEventModalOpen.value = true

  payload.view.calendar.unselect()
}

function handleEventClick(payload: EventClickArg) {
  if (payload.event.start) {
    selectedDateKey.value = formatDateKey(payload.event.start)
  }
}

async function handleEventDrop(payload: EventDropArg) {
  const { event } = payload
  const start = event.start
  const end = event.end ?? event.start

  if (!start || !end) {
    payload.revert()
    return
  }

  const updated = await updateCalendarEventTime(event.id, {
    start,
    end,
  })

  if (!updated) {
    payload.revert()
    return
  }

  selectedDateKey.value = formatDateKey(start)
}

async function handleEventResize(payload: EventResizeDoneArg) {
  const { event } = payload
  const start = event.start
  const end = event.end

  if (!start || !end) {
    payload.revert()
    return
  }

  const updated = await updateCalendarEventTime(event.id, {
    start,
    end,
  })

  if (!updated) {
    payload.revert()
  }
}

function renderEventContent(arg: EventContentArg) {
  const timeText = arg.timeText
  const title = arg.event.title

  return {
    html: `
      <div class="ams-fc-event">
        <span class="ams-fc-event-time">${timeText}</span>
        <span class="ams-fc-event-title">${title}</span>
      </div>
    `,
  }
}

function handleDateClick(payload: DateClickArg) {
  selectedDateKey.value = formatDateKey(payload.date)
}

const calendarOptions = computed(() => ({
  plugins: calendarPlugins,
  initialView: calendarViewMap[calendarView.value],
  initialDate: parseDateKey(selectedDateKey.value),
  headerToolbar: false,
  height: 'auto',
  expandRows: true,
  dayMaxEventRows: 4,
  selectable: true,
  selectMirror: true,
  editable: true,
  droppable: false,
  eventDurationEditable: true,
  slotMinTime: '00:00:00',
  slotMaxTime: '24:00:00',
  allDaySlot: false,
  firstDay: 1,
  locale: 'de',
  events: fullCalendarEvents.value,
  eventContent: renderEventContent,
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
  slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
  dayHeaderFormat: { weekday: 'short', day: '2-digit', month: 'short' },
  multiMonthMaxColumns: 3,
  multiMonthMinWidth: 220,
  dayCellClassNames: (arg: { date: Date }) => {
    const classes = ['ams-calendar-day-cell']
    const dayKey = formatDateKey(arg.date)

    if (highlightedDates.value.has(dayKey)) {
      classes.push('has-events')
    }

    if (dayKey === selectedDateKey.value) {
      classes.push('is-selected')
    }

    return classes
  },
  eventClassNames: (arg: { event: { extendedProps: { status?: string } } }) => {
    const status = arg.event.extendedProps.status as
      | CalendarEvent['status']
      | undefined
    const classes = ['ams-calendar-event']
    if (status && statusClassMap[status]) {
      classes.push(statusClassMap[status])
    }
    return classes
  },
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  dateClick: handleDateClick,
  datesSet: handleDatesSet,
}))

function goToToday() {
  const api = getCalendarApi()
  if (!api) {
    return
  }
  api.today()
  selectedDateKey.value = formatDateKey(new Date())
}

function goToPrev() {
  const api = getCalendarApi()
  if (!api) {
    return
  }
  api.prev()
}

function goToNext() {
  const api = getCalendarApi()
  if (!api) {
    return
  }
  api.next()
}

async function handleCreateEventSubmit() {
  if (createEventLoading.value) {
    return
  }

  if (
    !createEventForm.title.trim() ||
    !createEventForm.summary.trim() ||
    !createEventForm.location.trim() ||
    !createEventForm.department.trim() ||
    !createEventForm.start ||
    !createEventForm.end
  ) {
    createEventError.value = 'Bitte fülle alle Pflichtfelder aus.'
    return
  }

  createEventError.value = null
  createEventLoading.value = true

  try {
    const tags = createEventForm.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const event = await createCalendarEvent({
      title: createEventForm.title,
      summary: createEventForm.summary,
      location: createEventForm.location,
      department: createEventForm.department,
      start: createEventForm.start,
      end: createEventForm.end,
      status: createEventForm.status,
      tags,
    })

    const dateKey = event.start.slice(0, 10)
    selectedDateKey.value = dateKey
    createEventModalOpen.value = false
  } catch (error) {
    createEventError.value =
      error instanceof Error
        ? error.message
        : 'Unbekannter Fehler beim Erstellen des Termins.'
  } finally {
    createEventLoading.value = false
  }
}

watch(createEventModalOpen, (isOpen) => {
  if (isOpen) {
    const baseKey = selectedDateKey.value || formatDateKey(new Date())
    const baseDate = parseDateKey(baseKey)

    if (!createEventForm.start) {
      const start = new Date(baseDate)
      start.setHours(19, 0, 0, 0)
      createEventForm.start = formatDateTimeLocal(start)
    }

    if (!createEventForm.end) {
      const end = new Date(baseDate)
      end.setHours(20, 0, 0, 0)
      createEventForm.end = formatDateTimeLocal(end)
    }

    return
  }

  createEventLoading.value = false
  createEventError.value = null
  resetCreateEventForm()
})

watch(calendarView, (view) => {
  const api = getCalendarApi()
  if (!api) {
    return
  }

  const target = calendarViewMap[view]
  if (api.view.type !== target) {
    api.changeView(target, parseDateKey(selectedDateKey.value))
  }
})

watch(selectedDateKey, (key) => {
  const api = getCalendarApi()
  if (!api) {
    return
  }

  const date = parseDateKey(key)
  if (!Number.isNaN(date.getTime())) {
    api.gotoDate(date)
  }
})

onMounted(() => {
  const api = getCalendarApi()
  if (api) {
    api.changeView(
      calendarViewMap[calendarView.value],
      parseDateKey(selectedDateKey.value)
    )
  }
})

definePageMeta({
  layout: 'ams',
})
</script>

<template>
  <div class="space-y-6">
    <AMSPageHeader
      icon="i-lucide-calendar-range"
      title="Kalender"
      description="Plane Einsätze, Trainings und Events der ArisCorp."
    />

    <UModal
      v-model:open="createEventModalOpen"
      :ui="{
        content:
          'max-w-2xl bg-(--ui-bg-muted)/80 backdrop-blur-md border border-(--ui-primary)/15',
        header: 'border-b border-(--ui-primary)/10 pb-3',
        body: 'py-5',
      }"
    >
      <template #header>
        <div class="space-y-1">
          <p
            class="text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
          >
            Neuer Termin
          </p>
          <p class="text-lg font-semibold text-(--ui-text-highlighted)">
            Einsatz planen
          </p>
        </div>
      </template>
      <template #body>
        <form class="space-y-4" @submit.prevent="handleCreateEventSubmit">
          <div class="grid gap-4">
            <UFormField label="Titel" size="xs" required>
              <UInput
                v-model="createEventForm.title"
                placeholder="z. B. Operation Horizon"
                autocomplete="off"
              />
            </UFormField>
            <UFormField label="Kurzbeschreibung" size="xs" required>
              <UTextarea
                v-model="createEventForm.summary"
                rows="3"
                spellcheck="false"
                placeholder="Kurzer Überblick über Ziel und Ablauf."
              />
            </UFormField>
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField label="Start" size="xs" required>
                <UInput
                  v-model="createEventForm.start"
                  type="datetime-local"
                  autocomplete="off"
                />
              </UFormField>
              <UFormField label="Ende" size="xs" required>
                <UInput
                  v-model="createEventForm.end"
                  type="datetime-local"
                  autocomplete="off"
                />
              </UFormField>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField label="Ort" size="xs" required>
                <UInput
                  v-model="createEventForm.location"
                  placeholder="z. B. Everus Harbor – Hangar 02"
                  autocomplete="off"
                />
              </UFormField>
              <UFormField label="Abteilung" size="xs" required>
                <UInput
                  v-model="createEventForm.department"
                  placeholder="z. B. Sicherheit"
                  autocomplete="off"
                />
              </UFormField>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField label="Status" size="xs" required>
                <USelectMenu
                  v-model="createEventForm.status"
                  :items="Object.entries(statusMeta).map(([value, meta]) => ({
                    value: value as CalendarEvent['status'],
                    label: meta.label,
                  }))"
                  value-key="value"
                  label-key="label"
                  variant="ams"
                  size="md"
                  placeholder="Status wählen"
                />
              </UFormField>
              <UFormField label="Tags" size="xs">
                <UInput
                  v-model="createEventForm.tagsInput"
                  placeholder="z. B. Einsatz, Flug"
                  autocomplete="off"
                />
              </UFormField>
            </div>
          </div>
          <UAlert
            v-if="createEventError"
            color="red"
            variant="subtle"
            icon="i-lucide-alert-triangle"
            :description="createEventError"
          />
          <div class="flex justify-end gap-2 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="subtle"
              @click="createEventModalOpen = false"
            >
              Abbrechen
            </UButton>
            <UButton type="submit" :loading="createEventLoading">
              Termin speichern
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <div
      class="grid gap-6 xl:grid-cols-[360px,1fr] 2xl:grid-cols-[400px,1fr] items-start"
    >
      <UCard variant="ams" class="animated-border relative overflow-hidden">
        <template #header>
          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
                >
                  Übersicht
                </span>
                <UBadge
                  v-if="totalEvents"
                  color="primary"
                  variant="subtle"
                  size="xs"
                  class="uppercase tracking-wide bg-(--ui-primary)/15 text-(--ui-primary)"
                >
                  {{
                    filtersActive
                      ? visibleEventCount + ' von ' + totalEvents + ' Terminen'
                      : totalEvents + ' Termine'
                  }}
                </UBadge>
                <UBadge
                  color="neutral"
                  variant="soft"
                  size="xs"
                  class="uppercase tracking-wide"
                >
                  KW {{ currentISOWeek }}
                </UBadge>
              </div>
              <p
                class="text-[0.65rem] uppercase tracking-[0.3em] text-(--ui-text-muted)"
              >
                {{
                  filtersActive
                    ? activeFiltersCount === 1
                      ? '1 Filter aktiv'
                      : activeFiltersCount + ' Filter aktiv'
                    : 'Keine Filter aktiv'
                }}
              </p>
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

        <div class="space-y-5">
          <div
            class="rounded-2xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 p-5 backdrop-blur-sm"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="space-y-1">
                <p
                  class="text-[0.6rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
                >
                  Ausgewählter Tag
                </p>
                <p class="text-xl font-semibold text-(--ui-text-highlighted)">
                  {{ selectedDayWeekday }}
                </p>
                <p class="text-xs uppercase tracking-wide text-(--ui-text-muted)">
                  {{ selectedDayMonthLabel }}
                </p>
              </div>
              <div
                class="flex flex-col items-center justify-center rounded-xl border border-(--ui-primary)/35 bg-(--ui-primary)/10 px-4 py-3 text-(--ui-text-highlighted)"
              >
                <span class="text-4xl font-semibold leading-none">
                  {{ selectedDayDayNumber }}
                </span>
                <span
                  class="mt-2 text-[0.6rem] uppercase tracking-[0.35em] text-(--ui-primary)"
                >
                  KW {{ selectedDayIsoWeek }}
                </span>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span class="text-xs uppercase tracking-wide text-(--ui-text-muted)">
                {{ selectedDayEvents.length }}
                {{ selectedDayEvents.length === 1 ? 'Termin' : 'Termine' }}
              </span>
              <div class="flex flex-wrap items-center gap-2">
                <UButton
                  size="xs"
                  color="primary"
                  variant="soft"
                  icon="i-lucide-plus"
                  class="uppercase tracking-wide"
                  :disabled="createEventLoading"
                  @click="createEventModalOpen = true"
                >
                  Termin anlegen
                </UButton>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="subtle"
                  class="uppercase tracking-wide"
                  @click="goToToday"
                >
                  Heute
                </UButton>
              </div>
            </div>

            <div
              v-if="selectedDayPrimaryEvent as primaryEvent"
              class="mt-5 space-y-3 rounded-xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/70 p-4"
            >
              <p
                class="text-[0.6rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
              >
                Nächster Termin
              </p>
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-2 text-left">
                  <p class="text-sm font-semibold text-(--ui-text-highlighted)">
                    {{ primaryEvent.title }}
                  </p>
                  <div class="space-y-1 text-xs uppercase tracking-wide">
                    <span
                      class="inline-flex items-center gap-1.5 text-(--ui-primary)"
                    >
                      <UIcon name="i-lucide-clock" class="size-3" />
                      {{ timeFormatter.format(new Date(primaryEvent.start)) }}
                      –
                      {{ timeFormatter.format(new Date(primaryEvent.end)) }}
                    </span>
                    <span
                      class="inline-flex items-center gap-1.5 text-(--ui-text-muted)"
                    >
                      <UIcon name="i-lucide-map-pin" class="size-3" />
                      {{ primaryEvent.location }}
                    </span>
                  </div>
                </div>
                <UBadge
                  :color="statusMeta[primaryEvent.status].color"
                  variant="soft"
                  size="xs"
                  class="uppercase tracking-wide"
                >
                  {{ statusMeta[primaryEvent.status].label }}
                </UBadge>
              </div>
              <p class="text-xs text-(--ui-text-muted)">
                {{ primaryEvent.summary }}
              </p>
              <div
                v-if="primaryEvent.tags.length"
                class="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-(--ui-text-muted)"
              >
                <UBadge
                  v-for="tag in primaryEvent.tags"
                  :key="tag"
                  color="primary"
                  variant="subtle"
                  size="xs"
                  class="uppercase tracking-wide text-(--ui-text-muted)"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>

            <div v-if="selectedDayAdditionalEvents.length" class="mt-5 space-y-2">
              <p
                class="text-[0.6rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
              >
                Weitere Termine
              </p>
              <ul class="space-y-2">
                <li
                  v-for="event in selectedDayAdditionalEvents"
                  :key="event.id"
                  class="group cursor-pointer rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/60 px-4 py-3 transition duration-200 hover:border-(--ui-primary)/35 hover:bg-(--ui-primary)/8"
                  @click="selectEvent(event)"
                >
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="space-y-1 text-left">
                      <p
                        class="text-xs font-semibold uppercase tracking-wide text-(--ui-text-highlighted)"
                      >
                        {{ event.title }}
                      </p>
                      <span
                        class="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wide text-(--ui-primary)"
                      >
                        <UIcon name="i-lucide-clock" class="size-3" />
                        {{ timeFormatter.format(new Date(event.start)) }} –
                        {{ timeFormatter.format(new Date(event.end)) }}
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
                </li>
              </ul>
            </div>

            <p
              v-else-if="!selectedDayPrimaryEvent"
              class="mt-6 text-xs text-(--ui-text-muted)"
            >
              {{
                filtersActive
                  ? 'Keine Termine unter den aktuellen Filtern. Passe die Filter an oder lege einen neuen Termin an.'
                  : 'Für diesen Tag sind noch keine Termine geplant. Nutze „Termin anlegen“ oder wähle ein anderes Datum.'
              }}
            </p>
          </div>

          <div class="space-y-3">
            <p
              class="text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
            >
              Bevorstehende Events
            </p>
            <ul v-if="upcomingEvents.length" class="space-y-3">
              <li
                v-for="event in upcomingEvents"
                :key="event.id"
                class="group cursor-pointer rounded-xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 p-4 backdrop-blur-sm transition duration-300 hover:border-(--ui-primary)/35 hover:shadow-[0_0_18px_rgba(0,255,232,0.18)]"
                @click="selectEvent(event)"
              >
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="space-y-1">
                    <p
                      class="text-sm font-semibold text-(--ui-text-highlighted)"
                    >
                      {{ event.title }}
                    </p>
                    <span
                      class="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-(--ui-primary)"
                    >
                      <UIcon name="i-lucide-clock" class="size-3" />
                      {{ timeFormatter.format(new Date(event.start)) }} –
                      {{ timeFormatter.format(new Date(event.end)) }}
                    </span>
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
                  class="mt-2 flex flex-wrap items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-(--ui-text-muted)"
                >
                  <span class="inline-flex items-center gap-1.5">
                    <UIcon name="i-lucide-map-pin" class="size-3" />
                    {{ event.location }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <UIcon name="i-lucide-building" class="size-3" />
                    {{ event.department }}
                  </span>
                </div>
                <p class="mt-2 text-xs text-(--ui-text-muted)">
                  {{ event.summary }}
                </p>
              </li>
            </ul>
            <p v-else class="text-xs text-(--ui-text-muted)">
              {{
                filtersActive
                  ? 'Keine zukünftigen Events entsprechen den aktiven Filtern.'
                  : 'Keine zukünftigen Events geplant.'
              }}
            </p>
          </div>
        </div>
      </UCard>

      <div class="space-y-6">
        <UCard variant="ams" class="animated-border relative overflow-hidden">
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p
                  class="text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
                >
                  Kalenderansicht
                </p>
                <p class="text-lg font-semibold text-(--ui-text-highlighted)">
                  {{ calendarHeadingLabel }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  variant="subtle"
                  color="neutral"
                  size="xs"
                  icon="i-lucide-chevron-left"
                  @click="goToPrev"
                />
                <UButton
                  variant="subtle"
                  color="neutral"
                  size="xs"
                  icon="i-lucide-chevron-right"
                  @click="goToNext"
                />
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <div
              class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
            >
              <UInput
                v-model="searchTerm"
                highlight
                variant="outline"
                icon="i-lucide-search"
                placeholder="Titel, Ort oder Tags durchsuchen..."
                autocomplete="off"
                size="lg"
                class="w-full lg:max-w-md"
              />
              <div class="flex flex-wrap items-center gap-2">
                <UButton
                  size="xs"
                  color="neutral"
                  :variant="filtersOpen ? 'soft' : 'subtle'"
                  icon="i-lucide-sliders-horizontal"
                  class="uppercase tracking-wide"
                  @click="filtersOpen = !filtersOpen"
                >
                  Filter
                  <span
                    v-if="activeFiltersCount"
                    class="ml-1 text-[0.6rem] tracking-[0.35em]"
                  >
                    {{ activeFiltersCount }}
                  </span>
                </UButton>
                <UInput
                  v-model="jumpToDate"
                  type="date"
                  variant="outline"
                  size="xs"
                  class="w-full min-w-[160px] lg:w-auto"
                />
              </div>
            </div>

            <div
              v-if="filtersOpen"
              class="space-y-4 rounded-2xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 p-4 backdrop-blur-sm"
            >
              <div
                class="flex flex-wrap items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.3em]"
              >
                <span class="text-(--ui-text-muted)">
                  {{
                    filtersActive
                      ? visibleEventCount === 1
                        ? '1 Termin entspricht den Filtern'
                        : visibleEventCount + ' Termine entsprechen den Filtern'
                      : 'Keine Filter aktiv'
                  }}
                </span>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="subtle"
                  class="uppercase tracking-wide"
                  @click="resetFilters"
                >
                  Filter zurücksetzen
                </UButton>
              </div>

              <div class="space-y-2">
                <p class="text-xs uppercase tracking-wide text-(--ui-text-muted)">
                  Status
                </p>
                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-for="option in statusFilterOptions"
                    :key="option.value"
                    size="xs"
                    :color="
                      activeStatusFilters.includes(option.value)
                        ? option.color
                        : 'neutral'
                    "
                    :variant="
                      activeStatusFilters.includes(option.value)
                        ? 'soft'
                        : 'subtle'
                    "
                    class="uppercase tracking-wide"
                    @click="toggleStatusFilter(option.value)"
                  >
                    {{ option.label }}
                  </UButton>
                </div>
              </div>

              <div
                v-if="departmentOptions.length"
                class="space-y-2"
              >
                <p class="text-xs uppercase tracking-wide text-(--ui-text-muted)">
                  Abteilungen
                </p>
                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-for="department in departmentOptions"
                    :key="department"
                    size="xs"
                    color="primary"
                    :variant="
                      activeDepartmentFilters.includes(department)
                        ? 'soft'
                        : 'subtle'
                    "
                    class="uppercase tracking-wide"
                    @click="toggleDepartmentFilter(department)"
                  >
                    {{ department }}
                  </UButton>
                </div>
              </div>
            </div>

            <UAlert
              v-if="!visibleEventCount && filtersActive"
              color="neutral"
              variant="subtle"
              icon="i-lucide-filter-x"
              description="Keine Termine entsprechen den aktiven Filtern. Passen Sie die Filter an oder setzen Sie sie zurück."
            />

            <div
              class="relative rounded-2xl border border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 p-3 sm:p-4 backdrop-blur-sm ring-1 ring-inset ring-(--ui-primary)/15"
            >
              <ClientOnly>
                <FullCalendar
                  ref="calendarRef"
                  :options="calendarOptions"
                  class="ams-full-calendar"
                />
                <template #fallback>
                  <div class="h-[640px] animate-pulse rounded-xl bg-black/10" />
                </template>
              </ClientOnly>
            </div>
          </div>
        </UCard>

        <UCard variant="ams" class="animated-border relative overflow-hidden">
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p
                  class="text-[0.65rem] uppercase tracking-[0.35em] text-(--ui-text-muted)"
                >
                  Events am {{ selectedDayLabel }}
                </p>
                <p class="text-lg font-semibold text-(--ui-text-highlighted)">
                  {{ selectedDayEvents.length }}
                  {{ selectedDayEvents.length === 1 ? 'Termin' : 'Termine' }}
                </p>
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
                  <span
                    class="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-(--ui-primary)"
                  >
                    <UIcon name="i-lucide-clock" class="size-3" />
                    {{ timeFormatter.format(new Date(event.start)) }} –
                    {{ timeFormatter.format(new Date(event.end)) }}
                  </span>
                  <span
                    class="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wide text-(--ui-text-muted)"
                  >
                    <UIcon name="i-lucide-map-pin" class="size-3" />
                    {{ event.location }}
                  </span>
                  <span
                    class="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wide text-(--ui-text-muted)"
                  >
                    <UIcon name="i-lucide-building" class="size-3" />
                    {{ event.department }}
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
              <div
                class="mt-3 flex flex-wrap gap-2 text-[0.7rem] uppercase tracking-wide text-(--ui-text-muted)"
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
              <p class="mt-3 text-xs text-(--ui-text-muted)">
                {{ event.summary }}
              </p>
            </li>
          </ul>
          <p v-else class="text-sm text-(--ui-text-muted)">
            {{
              filtersActive
                ? 'Keine Events für diesen Tag unter den aktiven Filtern. Passe die Filter an oder lege einen neuen Termin an.'
                : 'Keine Events für diesen Tag geplant. Wähle ein Datum mit Markierung oder lege einen neuen Termin an.'
            }}
          </p>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ams-full-calendar {
  --ams-event-bg: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  --ams-event-border: color-mix(in srgb, var(--ui-primary) 25%, transparent);
  --ams-event-text: var(--ui-text-highlighted);
}

:deep(.fc) {
  --fc-border-color: rgba(0, 255, 232, 0.15);
  --fc-page-bg-color: transparent;
  --fc-neutral-bg-color: transparent;
  --fc-neutral-text-color: var(--ui-text-muted);
  --fc-list-event-hover-bg-color: rgba(0, 255, 232, 0.08);
  font-family: inherit;
  color: var(--ui-text-muted);
}

:deep(.fc .fc-scrollgrid) {
  border-radius: 1.25rem;
  border: 1px solid rgba(0, 255, 232, 0.12);
  background-color: color-mix(in srgb, var(--ui-bg-muted) 82%, transparent);
  overflow: hidden;
  backdrop-filter: blur(8px);
}

:deep(.fc .fc-daygrid-day-frame),
:deep(.fc .fc-multimonth-day) {
  border-radius: 0.9rem;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease,
    box-shadow 0.2s ease;
}

:deep(.fc .ams-calendar-day-cell .fc-daygrid-day-frame),
:deep(.fc .ams-calendar-day-cell .fc-multimonth-day-frame) {
  padding: 0.6rem;
}

:deep(.fc .ams-calendar-day-cell.has-events .fc-daygrid-day-top::after),
:deep(.fc .ams-calendar-day-cell.has-events .fc-multimonth-day-top::after) {
  content: '';
  display: block;
  margin-top: 0.35rem;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ui-primary) 80%, transparent);
}

:deep(.fc .ams-calendar-day-cell.is-selected .fc-daygrid-day-frame),
:deep(.fc .ams-calendar-day-cell.is-selected .fc-multimonth-day-frame) {
  border-color: var(--ui-primary);
  background-color: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  box-shadow: 0 0 18px rgba(0, 255, 232, 0.25);
}

:deep(.fc .fc-daygrid-day-number),
:deep(.fc .fc-multimonth-day-number) {
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

:deep(.fc .fc-daygrid-day:hover .fc-daygrid-day-frame),
:deep(.fc .fc-multimonth-day:hover .fc-multimonth-day-frame) {
  border-color: rgba(0, 255, 232, 0.25);
  background-color: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}

:deep(.fc .fc-day-today .fc-daygrid-day-frame),
:deep(.fc .fc-day-today .fc-multimonth-day-frame) {
  border-color: rgba(0, 255, 232, 0.45);
  background-color: color-mix(in srgb, var(--ui-primary) 16%, transparent);
}

:deep(.fc .fc-timegrid-slot) {
  height: 4.5rem;
}

:deep(.fc .ams-calendar-event) {
  background-color: var(--ams-event-bg);
  border: 1px solid var(--ams-event-border);
  border-radius: 0.75rem;
  padding: 0.5rem 0.65rem;
  box-shadow: 0 0 12px rgba(0, 255, 232, 0.15);
  overflow: hidden;
}

:deep(.fc .ams-calendar-event.is-status-confirmed) {
  border-color: color-mix(in srgb, var(--ui-primary) 75%, transparent);
}

:deep(.fc .ams-calendar-event.is-status-planned) {
  border-color: rgba(245, 158, 11, 0.35);
}

:deep(.fc .ams-calendar-event.is-status-in-progress) {
  border-color: rgba(14, 165, 233, 0.35);
}

:deep(.fc .ams-calendar-event.is-status-completed) {
  border-color: rgba(34, 197, 94, 0.35);
}

:deep(.fc .ams-calendar-event.is-status-cancelled) {
  border-color: rgba(239, 68, 68, 0.35);
  opacity: 0.85;
}

:deep(.fc .ams-calendar-event:hover) {
  border-color: var(--ui-primary);
  background-color: color-mix(in srgb, var(--ui-primary) 22%, transparent);
}

:deep(.fc .ams-fc-event) {
  display: grid;
  gap: 0.2rem;
  color: var(--ams-event-text);
  text-transform: uppercase;
  font-size: 0.62rem;
  letter-spacing: 0.22em;
}

:deep(.fc .ams-fc-event-title) {
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

:deep(.fc .ams-fc-event-time) {
  color: var(--ui-primary);
  font-weight: 600;
  letter-spacing: 0.24em;
}

:deep(.fc .fc-multimonth) {
  gap: 1.5rem;
}

:deep(.fc .fc-multimonth-title) {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.7rem;
  color: var(--ui-text-muted);
}
</style>

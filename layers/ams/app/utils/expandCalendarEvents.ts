import type { CalendarEvent } from '../pages/ams/calendar/index.vue'

export function expandCalendarEvents(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): CalendarEvent[] {
  const result: CalendarEvent[] = []
  const rangeStartMs = rangeStart.getTime()
  const rangeEndMs = rangeEnd.getTime()

  for (const event of events) {
    if (!event.recurrence) {
      result.push(event)
      continue
    }

    const origStart = new Date(event.start)
    const origEnd = new Date(event.end)
    const durationMs = origEnd.getTime() - origStart.getTime()
    const interval = event.recurrence_interval ?? 1
    const recEndMs = event.recurrence_end
      ? new Date(`${event.recurrence_end}T23:59:59.999Z`).getTime()
      : Infinity

    const cursor = new Date(origStart)
    let safety = 0

    while (safety < 730) {
      safety++
      const cursorMs = cursor.getTime()
      if (cursorMs > rangeEndMs || cursorMs > recEndMs) break

      const occEndMs = cursorMs + durationMs
      if (occEndMs >= rangeStartMs) {
        result.push({
          ...event,
          start: cursor.toISOString(),
          end: new Date(occEndMs).toISOString(),
          _recurring: true,
        })
      }

      advanceCursor(cursor, event.recurrence, interval)
    }
  }

  return result
}

function advanceCursor(cursor: Date, unit: string, interval: number): void {
  switch (unit) {
    case 'days':
      cursor.setUTCDate(cursor.getUTCDate() + interval)
      break
    case 'weeks':
      cursor.setUTCDate(cursor.getUTCDate() + 7 * interval)
      break
    case 'months':
      cursor.setUTCMonth(cursor.getUTCMonth() + interval)
      break
    case 'years':
      cursor.setUTCFullYear(cursor.getUTCFullYear() + interval)
      break
    // legacy values (pre-migration)
    case 'daily':
      cursor.setUTCDate(cursor.getUTCDate() + 1)
      break
    case 'weekly':
      cursor.setUTCDate(cursor.getUTCDate() + 7)
      break
    case 'biweekly':
      cursor.setUTCDate(cursor.getUTCDate() + 14)
      break
    case 'monthly':
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
      break
    case 'yearly':
      cursor.setUTCFullYear(cursor.getUTCFullYear() + 1)
      break
  }
}

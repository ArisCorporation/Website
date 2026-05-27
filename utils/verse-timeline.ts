export const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000

export const ZOOM_LEVELS = ['era', 'century', 'decade', 'year'] as const
export type ZoomLevel = (typeof ZOOM_LEVELS)[number]

export const ZOOM_LABELS: Record<ZoomLevel, string> = {
  era: 'Ären',
  century: 'Jahrhunderte',
  decade: 'Jahrzehnte',
  year: 'Jahre',
}

const HALF_RANGE_MS: Record<ZoomLevel, number> = {
  era: 800 * MS_PER_YEAR,
  century: 100 * MS_PER_YEAR,
  decade: 20 * MS_PER_YEAR,
  year: 3 * MS_PER_YEAR,
}

export function getViewRange(zoom: ZoomLevel, centerMs: number) {
  const half = HALF_RANGE_MS[zoom]
  return { startMs: centerMs - half, endMs: centerMs + half }
}

export function dateToX(dateMs: number, startMs: number, endMs: number, width: number): number {
  const span = endMs - startMs
  if (span === 0) return width / 2
  return ((dateMs - startMs) / span) * width
}

export function getMsPerPx(zoom: ZoomLevel, width: number): number {
  return (HALF_RANGE_MS[zoom] * 2) / width
}

export function getTickMarks(zoom: ZoomLevel, startMs: number, endMs: number, width: number) {
  const spanYears = (endMs - startMs) / MS_PER_YEAR
  let style: 'centuries' | 'decades' | 'years' | 'months'
  if (spanYears > 200) style = 'centuries'
  else if (spanYears > 30) style = 'decades'
  else if (spanYears > 4) style = 'years'
  else style = 'months'

  const ticks: Array<{ x: number; label: string; major: boolean }> = []
  const startDate = new Date(startMs)
  const endDate = new Date(endMs)

  if (style === 'centuries') {
    const sy = Math.floor(startDate.getFullYear() / 10) * 10
    for (let y = sy; y <= endDate.getFullYear() + 10; y += 10) {
      const x = dateToX(new Date(y, 0, 1).getTime(), startMs, endMs, width)
      if (x < -2 || x > width + 2) continue
      const major = y % 100 === 0
      ticks.push({ x, label: major ? String(y) : y % 50 === 0 ? String(y) : '', major })
    }
  } else if (style === 'decades') {
    const sy = Math.floor(startDate.getFullYear() / 10) * 10
    for (let y = sy; y <= endDate.getFullYear() + 1; y++) {
      const x = dateToX(new Date(y, 0, 1).getTime(), startMs, endMs, width)
      if (x < -2 || x > width + 2) continue
      const major = y % 10 === 0
      ticks.push({ x, label: major ? String(y) : '', major })
    }
  } else if (style === 'years') {
    for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
      const x = dateToX(new Date(y, 0, 1).getTime(), startMs, endMs, width)
      if (x < -2 || x > width + 2) continue
      ticks.push({ x, label: String(y), major: true })
    }
  } else {
    let d = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    while (d <= endDate) {
      const x = dateToX(d.getTime(), startMs, endMs, width)
      if (x >= -2 && x <= width + 2) {
        const major = d.getMonth() === 0
        const label = major ? String(d.getFullYear()) : d.toLocaleString('de-DE', { month: 'short' })
        ticks.push({ x, label, major })
      }
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    }
  }
  return ticks
}

function seededHash(str: string): number {
  let h = 0
  for (const c of str) h = Math.imul(31, h) + c.charCodeAt(0) | 0
  return (h >>> 0) / 4294967295
}

export interface VTLDate {
  year: number
  month?: number
  day?: number
  until_now?: boolean
}

export interface VTLItem {
  id: string
  title: string
  date: number // ms
  endDate?: number // ms — only for range items
  category: string
  color: string
  isRange: boolean
  start_date: VTLDate
  end_date?: VTLDate
  description?: string
  banner?: string
  link?: string | null
}

export interface VTLLanedItem extends VTLItem {
  above: boolean
  lane: number
  connRand: number
}

export interface VTLRenderedItem extends VTLLanedItem {
  x: number
  cardX: number
  cardY: number
  connY1: number
  connY2: number
}

export interface VTLRangeItem extends VTLItem {
  _row: number
  startX: number
  endX: number
  barY: number
}

// Greedy interval-graph colouring: assign each range item the lowest row that doesn't conflict
export function assignRangeRows(items: VTLItem[]): Array<VTLItem & { _row: number }> {
  const ranges = items.filter((i) => i.isRange).sort((a, b) => a.date - b.date)
  const rowEnds: number[] = []
  return ranges.map((item) => {
    const s = item.date
    const e = item.endDate ?? s + 500 * MS_PER_YEAR
    let row = rowEnds.findIndex((end) => end <= s)
    if (row === -1) {
      row = rowEnds.length
      rowEnds.push(e)
    } else {
      rowEnds[row] = e
    }
    return { ...item, _row: row }
  })
}

// Assign above/below lanes to point items — same logic as LifeGlance
export function assignLanes(items: VTLItem[], maxLane: number, cardTimeSpanMs: number): VTLLanedItem[] {
  const points = items.filter((i) => !i.isRange).sort((a, b) => a.date - b.date)
  const placed: { above: VTLLanedItem[]; below: VTLLanedItem[] } = { above: [], below: [] }

  return points.map((m, i) => {
    const above = i % 2 === 0
    const side = above ? 'above' : 'below'
    const laneRand = seededHash(String(m.id))
    const connRand = seededHash(String(m.id) + '~conn')

    const hasConflict = (l: number) =>
      cardTimeSpanMs > 0 && placed[side].some((p) => p.lane === l && Math.abs(p.date - m.date) < cardTimeSpanMs)

    const preferLane = maxLane >= 1 && laneRand < 0.55 ? 1 : 0
    let lane = preferLane
    if (hasConflict(lane)) {
      lane = 0
      while (lane < maxLane && hasConflict(lane)) lane++
    }

    const item: VTLLanedItem = { ...m, above, lane, connRand }
    placed[side].push(item)
    return item
  })
}

export function formatVTLDate(d: VTLDate): string {
  if (d.day != null && d.month != null) {
    return new Date(d.year, d.month, d.day).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  if (d.month != null) {
    return new Date(d.year, d.month, 1).toLocaleDateString('de-DE', {
      month: 'long',
      year: 'numeric',
    })
  }
  return `${d.year} CE`
}

export function formatVTLRange(item: VTLItem): string {
  const start = formatVTLDate(item.start_date)
  if (!item.end_date) return start
  if (item.end_date.until_now) return `${start} – heute`
  return `${start} – ${formatVTLDate(item.end_date)}`
}

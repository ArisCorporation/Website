<script setup lang="ts">
import {
  type VTLItem,
  type ZoomLevel,
  ZOOM_LEVELS,
  MS_PER_YEAR,
  getViewRange,
  dateToX,
  getTickMarks,
  assignLanes,
  formatVTLDate,
} from '~/utils/verse-timeline'

// ── Constants (rem-proportional, B = 16px base) ──────────────────────────────
const B = 16

const CARD_W     = Math.round(B * 8.75)   // 140
const CONN_LEN   = Math.round(B * 1.8)    // 29
const TOP_PAD    = Math.round(B * 0.65)   // 10
const TITLE_LH   = Math.round(B * 0.90)   // 14
const SEC_GAP    = Math.round(B * 0.45)   // 7
const META_LH    = Math.round(B * 0.73)   // 12
const BOT_PAD    = Math.round(B * 0.40)   // 6
const CARD_H1    = TOP_PAD + META_LH + SEC_GAP + META_LH + META_LH + BOT_PAD         // 3 rows
const CARD_H2    = TOP_PAD + META_LH + TITLE_LH + SEC_GAP + META_LH + META_LH + BOT_PAD // 3 rows + 2nd title line
const CARD_STEP  = CARD_H2 + Math.round(B * 0.55)
const MAX_CONN   = Math.round(CONN_LEN * 1.6)
const TITLE_CHARS = Math.floor((CARD_W - 20) / (B * 0.6 * 0.50)) // ~29

const CH_ROW_H   = Math.round(B * 0.62)  // 10
const CH_ROW_GAP = 2
const CH_BAND_PAD = 4
const TOP_RESERVE = 16

// ── Category colors ───────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  epoch:              '#eaa75f',
  company_founding:   '#dc2626',
  verse_timeline:     '#1d4ed8',
  ariscorp_timeline:  '#00ffe8',
  one_day_in_history: '#16a34a',
}

// ── Props / emits ─────────────────────────────────────────────────────────────
const props = defineProps<{
  items: VTLItem[]
  zoom: ZoomLevel
  centerMs: number
  selectedId?: string | null
  activeFilter?: string | null
}>()

const emit = defineEmits<{
  select: [item: VTLItem]
  pan: [centerMs: number]
  zoom: [level: ZoomLevel]
}>()

// ── Container size ────────────────────────────────────────────────────────────
const wrapRef = ref<HTMLDivElement | null>(null)
const svgW = ref(800)
const svgH = ref(400)

onMounted(() => {
  const ro = new ResizeObserver(([entry]) => {
    svgW.value = entry.contentRect.width || 800
    svgH.value = entry.contentRect.height || 400
  })
  if (wrapRef.value) {
    ro.observe(wrapRef.value)
    svgW.value = wrapRef.value.clientWidth || 800
    svgH.value = wrapRef.value.clientHeight || 400
  }
  onUnmounted(() => ro.disconnect())
})

// ── Layout geometry ───────────────────────────────────────────────────────────
const axisY = computed(() => Math.round(svgH.value * 0.50))

const visibleItems = computed(() =>
  props.activeFilter
    ? props.items.filter((i) => i.category === props.activeFilter)
    : props.items,
)

// Epoch/range items → chapter bands
const epochsWithRows = computed(() => {
  const sorted = visibleItems.value.filter((i) => i.isRange).sort((a, b) => a.date - b.date)
  const rowEnds: number[] = []
  return sorted.map((item) => {
    const s = item.date
    const e = item.endDate ?? s + 500 * MS_PER_YEAR
    let row = rowEnds.findIndex((end) => end <= s)
    if (row === -1) { row = rowEnds.length; rowEnds.push(e) }
    else rowEnds[row] = e
    return { ...item, _row: row }
  })
})

const chapterBandH = computed(() => {
  const rows = epochsWithRows.value.length > 0
    ? Math.max(...epochsWithRows.value.map((e) => e._row)) + 1
    : 0
  return rows > 0
    ? CH_BAND_PAD + rows * CH_ROW_H + (rows - 1) * CH_ROW_GAP + CH_BAND_PAD
    : 0
})

// above-axis milestone connect point
const msAxisY = computed(() => axisY.value - chapterBandH.value)

const maxLane = computed(() =>
  Math.max(0, Math.floor((msAxisY.value - MAX_CONN - CARD_H2 - TOP_RESERVE) / CARD_STEP)),
)

// ── View + ticks ──────────────────────────────────────────────────────────────
const viewRange = computed(() => getViewRange(props.zoom, props.centerMs))

const ticks = computed(() =>
  getTickMarks(props.zoom, viewRange.value.startMs, viewRange.value.endMs, svgW.value),
)

const msPerPx = computed(() => {
  const { startMs, endMs } = viewRange.value
  return svgW.value > 0 ? (endMs - startMs) / svgW.value : 1
})

// ── Lane assignment ───────────────────────────────────────────────────────────
const laned = computed(() =>
  assignLanes(visibleItems.value, maxLane.value, msPerPx.value * CARD_W),
)

// ── Rendered epoch bands ──────────────────────────────────────────────────────
const renderedEpochs = computed(() => {
  const { startMs, endMs } = viewRange.value
  return epochsWithRows.value.map((item) => ({
    ...item,
    startX: dateToX(item.date, startMs, endMs, svgW.value),
    endX: dateToX(item.endDate ?? endMs, startMs, endMs, svgW.value),
  }))
})

// ── Rendered point cards ──────────────────────────────────────────────────────
function wrapTitle(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text]
  const words = text.split(' ')
  let line1 = ''
  let line2 = ''
  for (const word of words) {
    const candidate = line1 ? line1 + ' ' + word : word
    if (!line1 || candidate.length <= maxChars) {
      line1 = candidate
    } else if (!line2) {
      line2 = word.length > maxChars ? word.slice(0, maxChars - 1) + '…' : word
    } else {
      const c2 = line2 + ' ' + word
      if (c2.length <= maxChars) {
        line2 = c2
      } else {
        if (line2.length < maxChars - 1)
          line2 = line2 + ' ' + word.slice(0, maxChars - line2.length - 2) + '…'
        break
      }
    }
  }
  return line2 ? [line1, line2] : [line1]
}

const renderedCards = computed(() => {
  const { startMs, endMs } = viewRange.value
  const ay = axisY.value
  const msy = msAxisY.value
  const h = svgH.value
  const w = svgW.value

  return laned.value.flatMap((m) => {
    const x = dateToX(m.date, startMs, endMs, w)
    if (x < -(CARD_W + 10) || x > w + CARD_W + 10) return []

    const connLen = CONN_LEN + Math.round((m.connRand ?? 0) * CONN_LEN * 0.6)
    const titleLines = wrapTitle(m.title, TITLE_CHARS)
    const cardH = titleLines.length > 1 ? CARD_H2 : CARD_H1

    let cardY: number, connY1: number, connY2: number
    if (m.above) {
      cardY  = msy - connLen - m.lane * CARD_STEP - cardH
      cardY  = Math.max(TOP_RESERVE, cardY)
      connY1 = msy - 4
      connY2 = cardY + cardH
    } else {
      cardY  = ay + connLen + m.lane * CARD_STEP
      cardY  = Math.min(h - cardH - 10, cardY)
      connY1 = ay + 4
      connY2 = cardY
    }

    const cardX = Math.max(4, Math.min(x - CARD_W / 2, w - CARD_W - 4))
    const yT1   = cardY + TOP_PAD + META_LH
    const yT2   = yT1 + TITLE_LH
    const yMeta = (titleLines.length > 1 ? yT2 : yT1) + SEC_GAP + META_LH
    const yCat  = yMeta + META_LH

    return [{
      ...m,
      x,
      cardX,
      cardY,
      cardH,
      connY1,
      connY2,
      titleLines,
      yT1,
      yT2,
      yMeta,
      yCat,
    }]
  })
})

// ── Drag to pan ───────────────────────────────────────────────────────────────
let _dragX = 0
let _dragCenter = 0
const isDragging = ref(false)

function onPointerDown(e: PointerEvent) {
  if ((e.target as Element)?.closest('.tl-card')) return
  isDragging.value = true
  _dragX = e.clientX
  _dragCenter = props.centerMs
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const dx = e.clientX - _dragX
  emit('pan', _dragCenter - dx * msPerPx.value)
}

function onPointerUp() {
  isDragging.value = false
}

// ── Wheel: pinch-zoom (ctrlKey) / shift+wheel → zoom; plain scroll → pan ──────
let _wheelAcc = 0

function onWheel(e: WheelEvent) {
  if (e.ctrlKey || e.shiftKey) {
    _wheelAcc += e.deltaY
    if (Math.abs(_wheelAcc) > 60) {
      const dir = _wheelAcc > 0 ? -1 : 1 // up/pinch-in = zoom in
      const idx = ZOOM_LEVELS.indexOf(props.zoom)
      const next = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, idx + dir))
      if (next !== idx) emit('zoom', ZOOM_LEVELS[next])
      _wheelAcc = 0
    }
  } else {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    emit('pan', props.centerMs + delta * msPerPx.value)
  }
}

// ── Color helper ──────────────────────────────────────────────────────────────
function cc(cat: string) {
  return CAT_COLORS[cat] ?? '#888'
}
</script>

<template>
  <div
    ref="wrapRef"
    class="tl-wrap"
    :class="{ 'is-dragging': isDragging }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel.prevent="onWheel"
  >
    <svg
      :viewBox="`0 0 ${svgW} ${svgH}`"
      font-size="1rem"
      style="display: block; width: 100%; height: 100%; user-select: none; overflow: visible"
    >
      <defs>
        <linearGradient id="tl-left" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#0F1117" stop-opacity="1" />
          <stop offset="1" stop-color="#0F1117" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="tl-right" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#0F1117" stop-opacity="0" />
          <stop offset="1" stop-color="#0F1117" stop-opacity="1" />
        </linearGradient>
      </defs>

      <!-- Tick marks -->
      <g pointer-events="none">
        <template v-for="(tick, ti) in ticks" :key="ti">
          <line
            :x1="tick.x" :y1="axisY - (tick.major ? 7 : 3)"
            :x2="tick.x" :y2="axisY + (tick.major ? 7 : 3)"
            :stroke="tick.major ? 'rgba(232,224,208,0.25)' : 'rgba(232,224,208,0.1)'"
            stroke-width="1"
          />
          <text
            v-if="tick.label"
            :x="tick.x" :y="axisY + 20"
            text-anchor="middle"
            :fill="tick.major ? 'rgba(232,224,208,0.35)' : 'rgba(232,224,208,0.18)'"
            :font-size="tick.major ? '0.69em' : '0.56em'"
            font-family="inherit"
          >{{ tick.label }}</text>
        </template>
      </g>

      <!-- Axis line -->
      <line
        :x1="0" :y1="axisY" :x2="svgW" :y2="axisY"
        stroke="rgba(232,224,208,0.18)" stroke-width="1"
        pointer-events="none"
      />

      <!-- Chapter band (epoch / range items) -->
      <g v-if="chapterBandH > 0" pointer-events="none">
        <rect :x="0" :y="msAxisY" :width="svgW" :height="chapterBandH"
          fill="rgba(232,224,208,0.016)" />
        <line :x1="0" :y1="msAxisY" :x2="svgW" :y2="msAxisY"
          stroke="rgba(232,224,208,0.08)" stroke-width="1" />

        <template v-for="ep in renderedEpochs" :key="ep.id">
          <rect
            v-if="Math.min(svgW, ep.endX) > Math.max(0, ep.startX)"
            :x="Math.max(0, ep.startX)"
            :y="msAxisY + CH_BAND_PAD + ep._row * (CH_ROW_H + CH_ROW_GAP)"
            :width="Math.min(svgW, ep.endX) - Math.max(0, ep.startX)"
            :height="CH_ROW_H"
            :fill="cc(ep.category)"
            fill-opacity="0.18"
            :stroke="cc(ep.category)"
            stroke-opacity="0.32"
            stroke-width="0.5"
            rx="2"
          />
          <!-- Left edge accent -->
          <rect
            v-if="ep.startX >= 0 && ep.startX < svgW"
            :x="ep.startX"
            :y="msAxisY + CH_BAND_PAD + ep._row * (CH_ROW_H + CH_ROW_GAP)"
            width="2" :height="CH_ROW_H"
            :fill="cc(ep.category)" opacity="0.85" rx="1"
          />
          <!-- Label -->
          <text
            v-if="ep.endX - ep.startX > svgW * 0.07"
            :x="(Math.max(0, ep.startX) + Math.min(svgW, ep.endX)) / 2"
            text-anchor="middle"
            :y="msAxisY + CH_BAND_PAD + ep._row * (CH_ROW_H + CH_ROW_GAP) + Math.round(CH_ROW_H * 0.73)"
            :fill="cc(ep.category)"
            font-size="0.45em"
            font-family="inherit"
            opacity="0.9"
          >{{ ep.title }}</text>
        </template>
      </g>

      <!-- Milestone cards -->
      <g>
        <g
          v-for="m in renderedCards"
          :key="m.id"
          class="tl-card"
          style="cursor: pointer"
          @click.stop="emit('select', m)"
        >
          <!-- Axis dot + connector (not in scale group so they stay on axis) -->
          <circle
            :cx="m.x" :cy="m.above ? msAxisY : axisY"
            :r="m.id === selectedId ? 5.5 : 3.5"
            :fill="cc(m.category)"
            :opacity="m.id === selectedId ? 1 : 0.85"
          />
          <line
            :x1="m.x" :y1="m.connY1"
            :x2="m.x" :y2="m.connY2"
            :stroke="cc(m.category)"
            :stroke-width="m.id === selectedId ? 1.5 : 1"
            :opacity="m.id === selectedId ? 0.6 : 0.3"
          />

          <!-- Highlight glow behind card -->
          <rect
            v-if="m.id === selectedId"
            :x="m.cardX - 4" :y="m.cardY - 4"
            :width="CARD_W + 8" :height="m.cardH + 8"
            :fill="cc(m.category)"
            opacity="0.12"
          />

          <!-- Card body -->
          <rect
            :x="m.cardX" :y="m.cardY"
            :width="CARD_W" :height="m.cardH"
            fill="rgba(13,15,22,0.96)"
            :stroke="cc(m.category)"
            :stroke-opacity="m.id === selectedId ? 0.9 : 0.35"
            :stroke-width="m.id === selectedId ? 1.5 : 1"
            :style="m.id === selectedId ? `filter: drop-shadow(0 0 7px ${cc(m.category)}99)` : ''"
          />
          <!-- Left-edge accent bar -->
          <rect
            :x="m.cardX" :y="m.cardY"
            width="3" :height="m.cardH"
            :fill="cc(m.category)" opacity="0.85"
          />

          <!-- Title line 1 -->
          <text
            :x="m.cardX + 10" :y="m.yT1"
            fill="rgba(232,224,208,0.95)"
            font-size="0.6em" font-family="inherit" font-weight="bold"
          >{{ m.titleLines[0] }}</text>
          <!-- Title line 2 (if wraps) -->
          <text
            v-if="m.titleLines[1]"
            :x="m.cardX + 10" :y="m.yT2"
            fill="rgba(232,224,208,0.95)"
            font-size="0.6em" font-family="inherit" font-weight="bold"
          >{{ m.titleLines[1] }}</text>

          <!-- Date -->
          <text
            :x="m.cardX + 10" :y="m.yMeta"
            fill="rgba(232,224,208,0.45)"
            font-size="0.52em" font-family="inherit"
          >{{ formatVTLDate(m.start_date) }}</text>

          <!-- Category label -->
          <text
            :x="m.cardX + 10" :y="m.yCat"
            :fill="cc(m.category)"
            font-size="0.52em" font-family="inherit" opacity="0.75"
          >{{ m.category.replace(/_/g, ' ') }}</text>
        </g>
      </g>

      <!-- Edge fades -->
      <rect x="0" y="0" width="70" height="100%" fill="url(#tl-left)" pointer-events="none" />
      <rect :x="svgW - 70" y="0" width="70" height="100%" fill="url(#tl-right)" pointer-events="none" />
    </svg>
  </div>
</template>

<style scoped>
.tl-wrap {
  width: 100%;
  flex: 1;
  min-height: 0;
  cursor: grab;
  overflow: hidden;
  position: relative;
}
.tl-wrap.is-dragging {
  cursor: grabbing;
}
</style>

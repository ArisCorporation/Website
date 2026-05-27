<script setup lang="ts">
import { type VTLItem, type ZoomLevel, MS_PER_YEAR, getViewRange } from '~/utils/verse-timeline'

const H = 52
const AXIS_Y = 22

const CAT_COLORS: Record<string, string> = {
  epoch:              '#eaa75f',
  company_founding:   '#dc2626',
  verse_timeline:     '#1d4ed8',
  ariscorp_timeline:  '#00ffe8',
  one_day_in_history: '#16a34a',
}

const props = defineProps<{
  items: VTLItem[]
  zoom: ZoomLevel
  centerMs: number
  activeFilter?: string | null
}>()

const emit = defineEmits<{ pan: [centerMs: number] }>()

// ── Container sizing ──────────────────────────────────────────────────────────
const wrapRef = ref<HTMLDivElement | null>(null)
const svgW = ref(0)

onMounted(() => {
  if (wrapRef.value) svgW.value = wrapRef.value.clientWidth
  const ro = new ResizeObserver(([e]) => { svgW.value = e.contentRect.width })
  if (wrapRef.value) ro.observe(wrapRef.value)
  onUnmounted(() => ro.disconnect())
})

// ── Filtered items ────────────────────────────────────────────────────────────
const visibleItems = computed(() =>
  props.activeFilter
    ? props.items.filter((i) => i.category === props.activeFilter)
    : props.items,
)

// ── Full data range ───────────────────────────────────────────────────────────
const mapRange = computed(() => {
  if (!visibleItems.value.length) {
    const now = Date.now()
    return { mapStart: now - 50 * MS_PER_YEAR, mapEnd: now + 50 * MS_PER_YEAR, mapSpan: 100 * MS_PER_YEAR }
  }
  const starts = visibleItems.value.map((i) => i.date)
  const ends   = visibleItems.value.map((i) => i.endDate ?? i.date)
  const dataMin = Math.min(...starts)
  const dataMax = Math.max(...ends)
  const span = Math.max(dataMax - dataMin, MS_PER_YEAR)
  const pad = span * 0.06
  const mapStart = dataMin - pad
  const mapEnd   = dataMax + pad
  return { mapStart, mapEnd, mapSpan: mapEnd - mapStart }
})

function msToX(ms: number) {
  const { mapStart, mapSpan } = mapRange.value
  return ((ms - mapStart) / mapSpan) * svgW.value
}
function xToMs(x: number) {
  const { mapStart, mapSpan } = mapRange.value
  return mapStart + (x / svgW.value) * mapSpan
}

// ── Viewport rect ─────────────────────────────────────────────────────────────
const viewport = computed(() => {
  const { startMs, endMs } = getViewRange(props.zoom, props.centerMs)
  return {
    x: Math.max(0, msToX(startMs)),
    x2: Math.min(svgW.value, msToX(endMs)),
  }
})

// ── Epoch bands (below axis) ──────────────────────────────────────────────────
const epochBands = computed(() =>
  visibleItems.value
    .filter((i) => i.isRange)
    .map((i) => ({
      ...i,
      x1: msToX(i.date),
      x2: msToX(i.endDate ?? i.date + MS_PER_YEAR),
      color: CAT_COLORS[i.category] ?? '#888',
    }))
    .filter((e) => e.x2 > e.x1 && e.x2 > 0 && e.x1 < svgW.value),
)

// ── Point dots ────────────────────────────────────────────────────────────────
const dots = computed(() =>
  visibleItems.value
    .filter((i) => !i.isRange)
    .map((i) => ({ id: i.id, x: msToX(i.date), color: CAT_COLORS[i.category] ?? '#888' }))
    .filter((d) => d.x >= -3 && d.x <= svgW.value + 3),
)

// ── Drag / click ──────────────────────────────────────────────────────────────
let _startX = 0
let _startCenter = 0
let _moved = false
const _dragging = ref(false)

function onPointerDown(e: PointerEvent) {
  _dragging.value = true
  _startX = e.clientX
  _startCenter = props.centerMs
  _moved = false
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!_dragging.value) return
  const dx = e.clientX - _startX
  if (Math.abs(dx) > 3) _moved = true
  if (_moved) {
    // drag right → later in time → centerMs increases
    emit('pan', _startCenter + (dx / svgW.value) * mapRange.value.mapSpan)
  }
}

function onPointerUp(e: PointerEvent) {
  if (!_dragging.value) return
  _dragging.value = false
  if (!_moved) {
    const rect = wrapRef.value?.getBoundingClientRect()
    if (rect) emit('pan', xToMs(e.clientX - rect.left))
  }
}
</script>

<template>
  <div
    ref="wrapRef"
    class="minimap"
    :class="{ 'is-dragging': _dragging }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <svg
      v-if="svgW > 0"
      :viewBox="`0 0 ${svgW} ${H}`"
      style="display: block; width: 100%; height: 100%"
    >
      <!-- Epoch bands -->
      <rect
        v-for="ep in epochBands"
        :key="ep.id"
        :x="Math.max(0, ep.x1)"
        :y="H - 12"
        :width="Math.min(svgW, ep.x2) - Math.max(0, ep.x1)"
        height="4"
        :fill="ep.color"
        opacity="0.5"
        rx="1"
      />

      <!-- Axis line -->
      <line
        :x1="0" :y1="AXIS_Y" :x2="svgW" :y2="AXIS_Y"
        stroke="rgba(232,224,208,0.08)" stroke-width="1"
      />

      <!-- Viewport highlight rect -->
      <rect
        v-if="viewport.x2 > viewport.x"
        :x="viewport.x"
        y="2"
        :width="Math.max(2, viewport.x2 - viewport.x)"
        :height="H - 4"
        fill="rgba(200,169,110,0.08)"
        stroke="#C8A96E"
        stroke-width="1"
        stroke-opacity="0.32"
        rx="2"
      />

      <!-- Item dots -->
      <circle
        v-for="d in dots"
        :key="d.id"
        :cx="d.x"
        :cy="AXIS_Y"
        r="2"
        :fill="d.color"
        opacity="0.6"
      />
    </svg>
  </div>
</template>

<style scoped>
.minimap {
  width: 100%;
  height: 52px;
  flex-shrink: 0;
  cursor: pointer;
  background: rgba(5, 8, 18, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  user-select: none;
}
.minimap.is-dragging {
  cursor: grabbing;
}
</style>

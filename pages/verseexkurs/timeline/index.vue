<script setup lang="ts">
import {
  type VTLItem,
  type ZoomLevel,
  ZOOM_LEVELS,
  ZOOM_LABELS,
  MS_PER_YEAR,
  getViewRange,
  formatVTLRange,
} from '~/utils/verse-timeline'

const { directus, readItems, readUsers } = useCMS()

const { data: rawItems } = await useAsyncData('TIMELINE:ITEMS', () =>
  directus.request(
    readItems('timeline_items', {
      fields: [
        'id',
        'title',
        'dates',
        'category',
        'description',
        'banner',
        'linked_item.collection',
        'linked_item.item:systems.slug',
        'linked_item.item:companies.slug',
        'linked_item.item:literature_categories.slug',
        'linked_item.item:fractions.slug',
        'linked_item.item:spectrum_categories.slug',
        'linked_item.item:ships.slug',
        'linked_item.item:directus_users.slug',
        'linked_item.item:spectrum_threads.slug',
        'linked_item.item:spectrum_threads.category.slug',
      ] as any,
      limit: -1,
    }),
  ),
)

const { data: users } = await useAsyncData(
  'TIMELINE:USERS',
  () =>
    directus.request(
      readUsers({
        fields: [
          'id',
          'first_name',
          'last_name',
          'title',
          'slug',
          'avatar',
          'birthdate',
          'birthplace.name',
        ] as any,
        filter: { birthdate: { _nnull: true }, hidden: { _eq: false } },
        limit: -1,
      }),
    ),
  { transform: (data) => data.map((u: any) => transformUser(u)) },
)

if (!rawItems.value || !users.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  })
}

// ── Category metadata ─────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  epoch:              '#eaa75f',
  company_founding:   '#dc2626',
  verse_timeline:     '#1d4ed8',
  ariscorp_timeline:  '#00ffe8',
  one_day_in_history: '#16a34a',
}

const CAT_LABELS: Record<string, string> = {
  epoch:              'Epochen',
  company_founding:   'Firmengründungen',
  verse_timeline:     'Verse',
  ariscorp_timeline:  'ArisCorp',
  one_day_in_history: 'Ein Tag in der Geschichte',
}

// ── Linked item → URL ─────────────────────────────────────────────────────────
function resolveLink(item: any): string | null {
  const li = item.linked_item?.[0]
  if (!li) return null
  switch (li.collection) {
    case 'systems':             return `/verseexkurs/starmap/${li.item?.slug}`
    case 'companies':           return `/verseexkurs/companies/${li.item?.slug}`
    case 'literature_categories': return `/verseexkurs/literatures/${li.item?.slug}`
    case 'fractions':           return `/verseexkurs/fractions/${li.item?.slug}`
    case 'spectrum_categories': return `/verseexkurs/spectrum/${li.item?.slug}`
    case 'ships':               return `/shipexkurs/ships/${li.item?.slug}`
    case 'spectrum_threads':    return `/verseexkurs/spectrum/${li.item?.category?.slug}/${li.item?.slug}`
    default:                    return null
  }
}

// ── Transform raw CMS items → VTLItem[] ──────────────────────────────────────
const vtlItems = computed<VTLItem[]>(() => {
  const result: VTLItem[] = []

  for (const item of rawItems.value ?? []) {
    const startDate = (item.dates as any[]).find((d) => d.type === 'start')
    const endDate   = (item.dates as any[]).find((d) => d.type === 'end')
    if (!startDate) continue

    const startMs = new Date(startDate.year, startDate.month ?? 0, startDate.day ?? 1).getTime()
    let endMs: number | undefined
    if (endDate) {
      endMs = endDate.until_now
        ? Date.now() + 930 * MS_PER_YEAR
        : new Date(endDate.year, endDate.month ?? 0, endDate.day ?? 1).getTime()
    }

    result.push({
      id:         String(item.id),
      title:      item.title,
      date:       startMs,
      endDate:    endMs,
      category:   item.category,
      color:      CAT_COLORS[item.category] ?? '#888',
      isRange:    !!endMs,
      start_date: { year: startDate.year, month: startDate.month, day: startDate.day },
      end_date:   endDate
        ? { year: endDate.year, month: endDate.month, day: endDate.day, until_now: endDate.until_now }
        : undefined,
      description: item.description,
      banner:      item.banner,
      link:        resolveLink(item),
    })
  }

  // Member birthdays
  for (const user of users.value ?? []) {
    if (!user.birthdate) continue
    const d    = new Date(user.birthdate)
    const name: string = user.full_name ?? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    result.push({
      id:         String(user.id),
      title:      `${name}${name.endsWith('s') ? "'" : "'s"} Geburtstag`,
      date:       d.getTime(),
      category:   'ariscorp_timeline',
      color:      '#00ffe8',
      isRange:    false,
      start_date: { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() },
      description: `${name} wurde am ${d.toLocaleDateString('de-DE')}${user.birthplace ? ` in ${user.birthplace.name}` : ''} geboren.`,
      banner:     user.avatar,
      link:       `/biography/${user.slug}`,
    })
  }

  return result.sort((a, b) => a.date - b.date)
})

// ── UI state ──────────────────────────────────────────────────────────────────
const zoom = ref<ZoomLevel>('decade')
const activeFilter = ref<string | null>(null)
const selectedItem = ref<VTLItem | null>(vtlItems.value[0] ?? null)

const _mid = vtlItems.value[Math.floor(vtlItems.value.length / 2)]
const centerMs = ref(_mid?.date ?? Date.now())

const categories = computed(() => [...new Set(vtlItems.value.map((i) => i.category))])

// ── Actions ───────────────────────────────────────────────────────────────────
function selectItem(item: VTLItem) {
  selectedItem.value = item
}

function onPan(ms: number) {
  centerMs.value = ms
}

function setZoom(level: ZoomLevel) {
  zoom.value = level
}

function panLeft() {
  const { startMs, endMs } = getViewRange(zoom.value, centerMs.value)
  centerMs.value -= (endMs - startMs) * 0.35
}

function panRight() {
  const { startMs, endMs } = getViewRange(zoom.value, centerMs.value)
  centerMs.value += (endMs - startMs) * 0.35
}

function selectPrev() {
  const filtered = activeFilter.value
    ? vtlItems.value.filter((i) => i.category === activeFilter.value)
    : vtlItems.value
  const idx = filtered.findIndex((i) => i.id === selectedItem.value?.id)
  if (idx > 0) selectItem(filtered[idx - 1])
}

function selectNext() {
  const filtered = activeFilter.value
    ? vtlItems.value.filter((i) => i.category === activeFilter.value)
    : vtlItems.value
  const idx = filtered.findIndex((i) => i.id === selectedItem.value?.id)
  if (idx < filtered.length - 1) selectItem(filtered[idx + 1])
}

definePageMeta({ layout: false })
</script>

<template>
  <NuxtLayout name="verse-exkurs">
    <div class="tl-page">
      <!-- ── Detail panel ─────────────────────────────────────────────────── -->
      <div class="tl-detail">
        <template v-if="selectedItem">
          <!-- Navigation arrows -->
          <button class="tl-detail-prev-btn tl-detail-prev-btn--left" @click="selectPrev">
            <UIcon name="i-heroicons-chevron-left-16-solid" class="size-6" />
          </button>
          <button class="tl-detail-prev-btn tl-detail-prev-btn--right" @click="selectNext">
            <UIcon name="i-heroicons-chevron-right-16-solid" class="size-6" />
          </button>

          <div class="tl-detail__inner">
            <div class="tl-detail__left">
              <p
                class="tl-detail__date"
                :style="{ color: CAT_COLORS[selectedItem.category] ?? '#888' }"
              >
                {{ formatVTLRange(selectedItem) }}
                <span class="tl-detail__cat">
                  · {{ CAT_LABELS[selectedItem.category] ?? selectedItem.category }}
                </span>
              </p>
              <h1 class="tl-detail__title">{{ selectedItem.title }}</h1>
              <div class="tl-detail__desc">
                <Editor
                  v-if="selectedItem.description"
                  :model-value="selectedItem.description"
                  read-only
                  class="text-justify"
                />
                <div v-if="selectedItem.link" class="mt-3 animate-link w-fit">
                  <NuxtLink :to="selectedItem.link">Mehr lesen</NuxtLink>
                </div>
              </div>
            </div>
            <div v-if="selectedItem.banner" class="tl-detail__image">
              <NuxtImg
                :src="selectedItem.banner"
                class="object-cover w-full h-full"
              />
            </div>
          </div>
        </template>
      </div>

      <!-- ── Controls ────────────────────────────────────────────────────── -->
      <div class="tl-controls">
        <!-- Category filter -->
        <div class="tl-filters">
          <button
            class="tl-chip"
            :class="{ active: activeFilter === null }"
            @click="activeFilter = null"
          >Alle</button>
          <button
            v-for="cat in categories"
            :key="cat"
            class="tl-chip"
            :class="{ active: activeFilter === cat }"
            :style="activeFilter === cat
              ? { borderColor: CAT_COLORS[cat] ?? '#888', color: CAT_COLORS[cat] ?? '#888' }
              : {}"
            @click="activeFilter = activeFilter === cat ? null : cat"
          >
            {{ CAT_LABELS[cat] ?? cat }}
          </button>
        </div>

        <!-- Zoom level + pan buttons -->
        <div class="tl-nav">
          <div class="tl-zoom-tabs">
            <button
              v-for="lvl in ZOOM_LEVELS"
              :key="lvl"
              class="tl-zoom-tab"
              :class="{ active: zoom === lvl }"
              @click="setZoom(lvl)"
            >{{ ZOOM_LABELS[lvl] }}</button>
          </div>
          <div class="tl-nav-sep" />
          <button class="tl-nav-btn" @click="panLeft">
            <UIcon name="i-heroicons-chevron-double-left-solid" class="size-4" />
          </button>
          <button class="tl-nav-btn" @click="panRight">
            <UIcon name="i-heroicons-chevron-double-right-solid" class="size-4" />
          </button>
        </div>
      </div>

      <!-- ── Canvas ──────────────────────────────────────────────────────── -->
      <div class="tl-canvas-area">
        <VerseExkursTimelineCanvas
          :items="vtlItems"
          :zoom="zoom"
          :center-ms="centerMs"
          :selected-id="selectedItem?.id ?? null"
          :active-filter="activeFilter"
          @select="selectItem"
          @pan="onPan"
          @zoom="setZoom"
        />
        <VerseExkursTimelineMinimap
          :items="vtlItems"
          :zoom="zoom"
          :center-ms="centerMs"
          :active-filter="activeFilter"
          @pan="onPan"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.tl-page {
  display: flex;
  flex-direction: column;
  /* cancel layout's mt-4 and px-4 container padding */
  min-height: 100vh;
  max-height: 100vh;
  margin-top: -1rem;
  margin-left: -1rem;
  margin-right: -1rem;
  overflow: hidden;
  background: #0a0f1a;
}

/* ── Detail panel ───────────────────────────────────────────────────────────── */
.tl-detail {
  position: relative;
  flex: 0 0 auto;
  min-height: 200px;
  max-height: 38vh;
  padding: 1.1rem 2.75rem 0.75rem;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, rgba(10,15,26,0.95) 0%, rgba(10,15,26,0.85) 100%);
}

.tl-detail-prev-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.3;
  transition: opacity 0.15s;
  padding: 0.35rem;
  border-radius: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(232, 224, 208, 0.8);
}
.tl-detail-prev-btn:hover { opacity: 1; background: rgba(255,255,255,0.06); }
.tl-detail-prev-btn--left  { left: 0.5rem; }
.tl-detail-prev-btn--right { right: 0.5rem; }

.tl-detail__inner {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  height: 100%;
  overflow: hidden;
}

.tl-detail__left {
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tl-detail__date {
  font-size: 0.8rem;
  margin: 0 0 0.2rem;
}

.tl-detail__cat {
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.75rem;
}

.tl-detail__title {
  font-size: 1.4rem;
  line-height: 1.2;
  margin: 0 0 0.5rem;
  color: rgba(232, 224, 208, 0.95);
}

.tl-detail__desc {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.tl-detail__image {
  width: 180px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  max-height: 100%;
}

/* ── Controls ───────────────────────────────────────────────────────────────── */
.tl-controls {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
}

.tl-filters {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  flex: 1;
}

.tl-chip {
  font-size: 0.72rem;
  padding: 0.18rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.45);
  background: transparent;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  white-space: nowrap;
}
.tl-chip:hover,
.tl-chip.active {
  border-color: rgba(255, 255, 255, 0.45);
  color: rgba(255, 255, 255, 0.9);
}

.tl-nav {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.tl-nav-sep {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 0.1rem;
}

.tl-zoom-tabs {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 2px;
}

.tl-zoom-tab {
  font-size: 0.68rem;
  padding: 0.15rem 0.55rem;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
}
.tl-zoom-tab:hover {
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.06);
}
.tl-zoom-tab.active {
  background: rgba(200, 169, 110, 0.15);
  color: #C8A96E;
}

.tl-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.tl-nav-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.2);
}

/* ── Canvas area ────────────────────────────────────────────────────────────── */
.tl-canvas-area {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #0F1117;
  display: flex;
  flex-direction: column;
}
</style>

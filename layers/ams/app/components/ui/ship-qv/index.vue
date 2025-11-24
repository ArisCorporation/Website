<script setup lang="ts">
import type {
  Company,
  Ship,
  ShipPaint,
  ShipRating,
  ShipsLoaner,
  ShipsVariant,
} from '~~/types'

type QuickViewItemValue = string | number | Array<string | number>
type QuickViewItem = {
  label: string
  value: QuickViewItemValue
  slider?: number
  link?: string | null
}
type QuickViewRow = {
  columns?: 2 | 3
  items: QuickViewItem[]
}
type QuickViewCardTable = {
  title: string
  icon: string
  rows?: QuickViewRow[]
}
type QuickViewCard = QuickViewCardTable | { tabs: QuickViewCardTable[] }

type QuickViewTab = {
  label: string
  slot: string
  cards: QuickViewCard[]
  disabled?: boolean
}

type EntityWithId = { id?: unknown }
const isEntityWithId = <T extends EntityWithId>(value: unknown): value is T =>
  typeof value === 'object' && value !== null && 'id' in value

const resolveShip = (value: unknown): Ship | null =>
  isEntityWithId<Ship>(value) ? value : null
const resolveCompany = (value: unknown): Company | null =>
  isEntityWithId<Company>(value) ? value : null
const resolveShipRating = (value: unknown): ShipRating | null =>
  isEntityWithId<ShipRating>(value) ? value : null

const props = defineProps<{ ship?: Ship | null }>()
const currentShip = computed<Ship | null>(() => resolveShip(props.ship))
const manufacturer = computed(() =>
  resolveCompany(currentShip.value?.manufacturer)
)
const rating = computed(() => resolveShipRating(currentShip.value?.rating))

const formatNumberWithUnit = (
  value?: number | null,
  unit?: string,
  fractionDigits = 0
) =>
  typeof value === 'number'
    ? `${value.toLocaleString('de-DE', {
        maximumFractionDigits: fractionDigits,
      })}${unit ? ` ${unit}` : ''}`
    : 'N/A'
const formatMeters = (value?: number | null) =>
  formatNumberWithUnit(value, 'm', 1)
const formatScu = (value?: number | null) => formatNumberWithUnit(value, 'SCU')
const formatSpeed = (value?: number | null) =>
  formatNumberWithUnit(value, 'm/s')
const formatMass = (value?: number | null) =>
  typeof value === 'number'
    ? `${(value / 1000).toLocaleString('de-DE', {
        maximumFractionDigits: 1,
      })} Tonnen`
    : 'N/A'
const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})
const formatCurrencyValue = (value?: number | null) =>
  typeof value === 'number' ? currencyFormatter.format(value) : 'N/A'

const crewLabel = computed(() => {
  const min = currentShip.value?.crew_min
  const max = currentShip.value?.crew_max
  if (min !== null && min !== undefined) {
    return `${min} - ${max ?? '?'}`
  }
  if (max !== null && max !== undefined) return `${min ?? '?'} - ${max}`
  return 'N/A'
})

const sizeLabel = computed(() => {
  if (currentShip.value?.size_label) return currentShip.value.size_label
  if (currentShip.value?.size)
    return String(currentShip.value.size).toUpperCase()
  return 'N/A'
})

const manufacturerName = computed(() => manufacturer.value?.name ?? 'N/A')
const manufacturerSlug = computed(() => manufacturer.value?.slug ?? null)

const loanerName = computed(() => {
  const loaners = currentShip.value?.loaners
  if (!Array.isArray(loaners)) return 'N/A'
  const loanerShip = resolveShip(
    loaners.find((loaner): loaner is ShipsLoaner =>
      isEntityWithId<ShipsLoaner>(loaner)
    )?.loaner_id
  )
  return loanerShip?.name ?? 'N/A'
})

const variantShips = computed<Ship[]>(() => {
  const variants = currentShip.value?.variants
  if (!Array.isArray(variants)) return []
  return variants
    .filter((variant): variant is ShipsVariant =>
      isEntityWithId<ShipsVariant>(variant)
    )
    .map((variant) => resolveShip(variant.variant_id))
    .filter((variant): variant is Ship => Boolean(variant))
})

const paints = computed<ShipPaint[]>(() => {
  const list = currentShip.value?.paints
  if (!Array.isArray(list)) return []
  return list.filter((paint): paint is ShipPaint =>
    isEntityWithId<ShipPaint>(paint)
  )
})

const descriptionText = computed(
  () =>
    currentShip.value?.description?.trim() || 'Keine Beschreibung vorhanden.'
)
const historyText = computed(() => currentShip.value?.history?.trim() || '')
const ratingText = computed(
  () => rating.value?.introduction?.trim() || 'Keine Bewertung hinterlegt.'
)
const commercialText = computed(() =>
  currentShip.value?.commercial_video_id ||
  (Array.isArray(currentShip.value?.commercials) &&
    currentShip.value.commercials?.length)
    ? 'Commercial verfügbar.'
    : 'Keine Commercial hinterlegt.'
)

const leftTabs = [
  { label: 'Beschreibung', slot: 'description' },
  { label: 'Commercial', slot: 'commercial' },
  { label: 'Bewertung', slot: 'rating' },
]

const dataCards = computed<QuickViewCard[]>(() => {
  const ship = currentShip.value
  return [
    {
      tabs: [
        {
          title: 'Basis Daten',
          icon: 'i-lucide-user',
          rows: [
            {
              columns: 3,
              items: [
                {
                  label: 'Hersteller',
                  value: manufacturerName.value,
                  link: manufacturerSlug.value
                    ? `/verseexkurs/companies/${manufacturerSlug.value}`
                    : null,
                },
                { label: 'Modell', value: ship?.name ?? 'N/A' },
                { label: 'Loaner', value: loanerName.value },
              ],
            },
            {
              columns: 2,
              items: [
                {
                  label: 'Rolle',
                  value: ship?.focuses?.length
                    ? getMainFocusLabel(ship.focuses)
                    : 'N/A',
                },
                {
                  label: 'Größe',
                  value: sizeLabel.value,
                },
              ],
            },
          ],
        },
        {
          title: 'Kapazität',
          icon: 'i-lucide-package',
          rows: [
            {
              columns: 2,
              items: [
                { label: 'Crew', value: crewLabel.value },
                { label: 'Fracht', value: formatScu(ship?.cargo) },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Pledge',
      icon: 'i-lucide-wallet',
      rows: [
        {
          columns: 3,
          items: [
            {
              label: 'Pledge',
              value: formatCurrencyValue(ship?.pledge_price),
            },
            { label: 'Warbond', value: formatCurrencyValue(ship?.price) },
            {
              label: 'Originalpreis',
              value: formatCurrencyValue(ship?.price),
            },
          ],
        },
      ],
    },
    {
      title: 'Spezifikationen',
      icon: 'i-lucide-activity-square',
      rows: [
        {
          columns: 3,
          items: [
            { label: 'Länge', value: formatMeters(ship?.length) },
            { label: 'Breite', value: formatMeters(ship?.beam) },
            { label: 'Höhe', value: formatMeters(ship?.height) },
          ],
        },
        {
          columns: 3,
          items: [
            {
              label: 'SCM Geschwindigkeit',
              value: formatSpeed(ship?.speed_scm),
              slider: ship?.speed_max ?? undefined,
            },
            {
              label: 'Nav Geschwindigkeit',
              value: formatSpeed(ship?.speed_max),
            },
            {
              label: 'Masse',
              value: formatMass(ship?.mass),
            },
          ],
        },
      ],
    },
    {
      title: 'Entwicklung',
      icon: 'i-lucide-flask-conical',
      rows: [
        {
          columns: 3,
          items: [
            { label: 'Angekündigt', value: ship?.production_note ?? 'N/A' },
            { label: 'Flight-Ready', value: ship?.live_patch ?? 'N/A' },
            { label: 'Patch Version', value: ship?.p4k_version ?? 'N/A' },
          ],
        },
      ],
    },
  ]
})

const variantCards = computed<QuickViewCard[]>(() =>
  variantShips.value.length
    ? [
        {
          title: 'Varianten',
          icon: 'i-lucide-layers',
          rows: [
            {
              columns: 2,
              items: variantShips.value.map((variant) => ({
                label: variant.name ?? 'Variante',
                value: variant.name ?? 'N/A',
              })),
            },
          ],
        },
      ]
    : []
)

const paintsCards = computed<QuickViewCard[]>(() =>
  paints.value.length
    ? [
        {
          title: 'Paints',
          icon: 'i-lucide-droplets',
          rows: [
            {
              columns: 2,
              items: paints.value.map((paint) => ({
                label: paint.name ?? 'Paint',
                value: paint.name ?? 'N/A',
              })),
            },
          ],
        },
      ]
    : []
)

const quickViewTabs = computed<QuickViewTab[]>(() => [
  { label: 'Daten', slot: 'data', cards: dataCards.value },
  {
    label: 'Varianten',
    slot: 'variants',
    cards: variantCards.value,
    disabled: !variantCards.value.length,
  },
  {
    label: 'Paints',
    slot: 'paints',
    cards: paintsCards.value,
    disabled: !paintsCards.value.length,
  },
])

const rightTabs = computed(() =>
  quickViewTabs.value.map((tab) => ({
    label: tab.label,
    slot: tab.slot,
    disabled: tab.disabled ?? false,
  }))
)
</script>

<template>
  <div class="grid grid-cols-12 size-full flex-1 p-2 gap-x-4">
    <div class="col-span-7 space-y-2 m-2">
      <NuxtImg
        :src="
          currentShip?.store_image
            ? getAssetId(currentShip.store_image)
            : '7c2783d5-5e37-44bd-a085-2494b354792a'
        "
        class="w-full h-auto rounded-lg shadow-lg object-cover border border-primary/10"
      />
      <UCard variant="ams" :ui="{ body: 'sm:p-4' }">
        <UTabs
          :items="leftTabs"
          size="xs"
          :ui="{
            list: 'border border-(--ui-primary)/10 bg-(--ui-bg-muted)/70',
            indicator: 'bg-(--ui-primary)/10',
            trigger: 'data-[state=active]:text-(--ui-primary)',
          }"
        >
          <template #description>
            <div class="space-y-2 text-sm leading-relaxed">
              <!-- <p class="text-(--ui-text) whitespace-pre-line">
                {{ descriptionText }}
              </p> -->
              <UiEditor :model-value="descriptionText" read-only />
            </div>
          </template>
          <template #commercial>
            <div class="space-y-3 text-sm leading-relaxed">
              <p class="text-(--ui-text-muted)">{{ commercialText }}</p>
              <div
                v-if="currentShip?.store_url || currentShip?.sales_url"
                class="flex gap-2"
              >
                <UButton
                  v-if="currentShip?.store_url"
                  size="xs"
                  color="primary"
                  variant="solid"
                  :to="currentShip.store_url"
                  target="_blank"
                  icon="i-lucide-external-link"
                >
                  Pledge Store
                </UButton>
                <UButton
                  v-if="currentShip?.sales_url"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  :to="currentShip.sales_url"
                  target="_blank"
                  icon="i-lucide-play-circle"
                >
                  Commercial ansehen
                </UButton>
              </div>
            </div>
          </template>
          <template #rating>
            <div class="space-y-2 text-sm leading-relaxed">
              <p class="text-(--ui-text) whitespace-pre-line">
                {{ ratingText }}
              </p>
              <div
                v-if="rating?.ratings?.length"
                class="grid grid-cols-2 gap-2 text-xs font-mono uppercase"
              >
                <div
                  v-for="item in rating.ratings"
                  :key="item.category"
                  class="flex items-center justify-between rounded border border-(--ui-primary)/15 bg-(--ui-bg-muted)/40 px-2 py-1"
                >
                  <span class="text-(--ui-text-muted)">
                    {{ item.category.replaceAll('_', ' ') }}
                  </span>
                  <UBadge
                    :label="item.grade.replaceAll('_', ' ')"
                    size="xs"
                    variant="subtle"
                  />
                </div>
              </div>
            </div>
          </template>
        </UTabs>
      </UCard>
    </div>
    <div class="col-span-5">
      <UTabs
        :items="rightTabs"
        size="xs"
        :ui="{
          list: 'border border-(--ui-primary)/10 bg-(--ui-bg-muted)/70',
          indicator: 'bg-(--ui-primary)/10',
          trigger: 'data-[state=active]:text-(--ui-primary)',
        }"
      >
        <template v-for="tab in quickViewTabs" :key="tab.slot" #[tab.slot]>
          <div v-if="tab.cards.length" class="space-y-4">
            <UCard
              v-for="card in tab.cards"
              :key="JSON.stringify(card)"
              variant="ams"
              :ui="{
                header: 'p-4 sm:px-4',
                body: 'sm:py-4 sm:pt-1 sm:px-4',
              }"
            >
              <template v-if="!card?.tabs" #header>
                <div class="flex items-center gap-2 ams-card-title">
                  <UIcon :name="card.icon" class="size-4" />
                  <h2 class="text-sm">{{ card.title }}</h2>
                </div>
              </template>
              <template #default>
                <div class="">
                  <AMSUiShipQvTable
                    v-if="!card?.tabs && card.rows"
                    v-bind="card"
                  />
                  <template v-else>
                    <UTabs
                      :items="
                        card.tabs.map((tab) => ({
                          label: tab.title,
                          icon: tab.icon,
                          slot: tab.title,
                        }))
                      "
                      size="xs"
                      variant="link"
                    >
                      <template
                        v-for="tab in card.tabs"
                        :key="tab.title"
                        #[tab.title]
                      >
                        <AMSUiShipQvTable v-bind="tab" />
                      </template>
                    </UTabs>
                  </template>
                </div>
              </template>
            </UCard>
          </div>
          <div v-else class="text-sm text-(--ui-text-muted)">
            Keine Daten vorhanden.
          </div>
        </template>
      </UTabs>
    </div>
  </div>
</template>

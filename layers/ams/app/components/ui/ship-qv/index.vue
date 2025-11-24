<script setup lang="ts">
import type { Ship } from '~~/types'

type QuickViewItemValue = string | number | Array<string | number>
type QuickViewItem = {
  label: string
  value: QuickViewItemValue
  slider?: number
  link?: string | null
}
type QuickViewRow = {
  // Controls whether the row is rendered with 2 or 3 columns.
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

const props = defineProps<{ ship?: Ship | null }>()
const ship = computed(() => props.ship ?? null)

const leftTabs = [
  { label: 'Beschreibung', slot: 'description' },
  { label: 'Commercial', slot: 'commercial' },
  { label: 'Bewertung', slot: 'rating' },
]

const formatMeters = (value?: number | null) =>
  value || value === 0 ? `${value.toLocaleString('de-DE')} m` : 'N/A'

const formatScu = (value?: number | null) =>
  value || value === 0 ? `${value} SCU` : 'N/A'

const formatCurrencyValue = (value?: number | null) =>
  value || value === 0 ? `${value}$` : 'N/A'

const crewLabel = computed(() => {
  const min = ship.value?.crew_min
  const max = ship.value?.crew_max
  if (min || max) return `${min ?? '?'} - ${max ?? '?'}`
  return 'N/A'
})

const sizeLabel = computed(() => {
  if (ship.value?.size_label) return ship.value.size_label
  if (ship.value?.size) return String(ship.value.size).toUpperCase()
  return 'N/A'
})

const manufacturerName = computed(() => {
  const value = ship.value?.manufacturer
  if (value && typeof value !== 'string') return value.name ?? 'N/A'
  return 'N/A'
})

const manufacturerSlug = computed(() => {
  const value = ship.value?.manufacturer
  if (value && typeof value !== 'string') return value.slug ?? null
  return null
})

const loanerName = computed(() => {
  const loaners = ship.value?.loaners
  if (Array.isArray(loaners) && loaners[0] && typeof loaners[0] === 'object') {
    const loanerShip = (loaners[0] as any)?.loaner_id as Ship | undefined
    if (loanerShip && typeof loanerShip !== 'string') {
      return loanerShip.name ?? 'N/A'
    }
  }
  return 'N/A'
})

const dataCards = computed<QuickViewCard[]>(() => [
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
              { label: 'Modell', value: ship.value?.name ?? 'N/A' },
              { label: 'Loaner', value: loanerName.value },
            ],
          },
          {
            columns: 2,
            items: [
              {
                label: 'Rolle',
                value: ship.value?.focuses?.length
                  ? getMainFocusLabel(ship.value.focuses)
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
              { label: 'Fracht', value: formatScu(ship.value?.cargo) },
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
            value: formatCurrencyValue(ship.value?.pledge_price),
          },
          { label: 'Warbond', value: formatCurrencyValue(ship.value?.price) },
          {
            label: 'Originalpreis',
            value: formatCurrencyValue(ship.value?.price),
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
          { label: 'Länge', value: formatMeters(ship.value?.length) },
          { label: 'Breite', value: formatMeters(ship.value?.beam) },
          { label: 'Höhe', value: formatMeters(ship.value?.height) },
        ],
      },
      {
        columns: 3,
        items: [
          {
            label: 'SCM Geschwindigkeit',
            value: 200,
            slider: 600,
          },
          {
            label: 'Nav Geschwindigkeit',
            value: ship.value?.speed_max ?? 'N/A',
          },
          {
            label: 'Masse',
            value:
              ship.value?.mass || ship.value?.mass === 0
                ? `${(ship.value.mass / 1000).toLocaleString('de-DE')} Tonnen`
                : 'N/A',
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
          { label: 'Angekündigt', value: ship.value?.production_note ?? 'N/A' },
          { label: 'Flight-Ready', value: ship.value?.live_patch ?? 'N/A' },
          { label: 'Patch Version', value: ship.value?.p4k_version ?? 'N/A' },
        ],
      },
    ],
  },
])

const variantCards = computed<QuickViewCard[]>(() => {
  const variants = ship.value?.variants
  if (!Array.isArray(variants) || !variants.length) return []

  const variantNames = variants
    .map((variant: any) => variant?.variant_id as Ship | undefined)
    .filter((v): v is Ship => !!v && typeof v !== 'string')

  if (!variantNames.length) return []

  return [
    {
      title: 'Varianten',
      icon: 'i-lucide-layers',
      rows: [
        {
          columns: 2,
          items: variantNames.map((variant) => ({
            label: variant.name ?? 'Variante',
            value: variant.name ?? 'N/A',
          })),
        },
      ],
    },
  ]
})

const paintsCards = computed<QuickViewCard[]>(() => {
  const paints = ship.value?.paints
  if (!Array.isArray(paints) || !paints.length) return []

  return [
    {
      title: 'Paints',
      icon: 'i-lucide-droplets',
      rows: [
        {
          columns: 2,
          items: paints.map((paint: any) => ({
            label: paint?.name ?? 'Paint',
            value: paint?.name ?? 'N/A',
          })),
        },
      ],
    },
  ]
})

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
          ship?.store_image
            ? getAssetId(ship.store_image)
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
            <span class="text-sm"
              >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum
              accumsan dictum sapien sit praesent sit enim justo proin
              consectetur felis litora. Venenatis a magnis mollis tellus et ac
              etiam nunc proin vehicula fusce euismod. Scelerisque blandit donec
              sociosqu sollicitudin mollis egestas vehicula nullam porttitor
              felis velit nullam. Senectus vestibulum cum sociosqu euismod sem
              ullamcorper auctor pulvinar pharetra nisl lorem nunc.</span
            >
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

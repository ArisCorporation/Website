<script setup lang="ts">
// import { getShortCompanyName } from '~/utils'
import type { UserHangar } from '~~/types'

const props = defineProps<{ data: UserHangar[] | null }>()

const colorPalette = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#06b6d4',
  '#ef4444',
  '#84cc16',
  '#d946ef',
  '#f97316',
  '#14b8a6',
]

function processChartData(
  fleetData: UserHangar[] | null,
  groupBy: (ship: UserHangar) => string | undefined
) {
  if (!fleetData) return { data: [], labels: [] }

  const counts = new Map<string, number>()
  fleetData.forEach((ship) => {
    const key = groupBy(ship)
    if (key) {
      counts.set(key, (counts.get(key) || 0) + 1)
    }
  })

  const sortedData = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const chartData = sortedData.map((entry) => entry[1])
  const chartLabels = sortedData.map((entry, index) => ({
    name: entry[0],
    color: colorPalette[index % colorPalette.length],
  }))

  return { data: chartData, labels: chartLabels }
}

const shipsByManufacturer = computed(() =>
  processChartData(props.data, (ship) =>
    getCompanyCode(ship.ship_id?.manufacturer)
  )
)
const shipsBySize = computed(() =>
  processChartData(props.data, (ship) => getSizeLetter(ship.ship_id?.size))
)
const shipsByClassification = computed(() =>
  processChartData(props.data, (ship) =>
    getShipClassLabel(ship.ship_id?.classification)
  )
)
const shipsByProductionStatus = computed(() =>
  processChartData(props.data, (ship) =>
    getShipProductionLabel(ship.ship_id?.production_status)
  )
)
const shipsByDepartment = computed(() =>
  processChartData(props.data, (ship) => ship.department?.name)
)
</script>

<template>
  <div v-if="data" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
    <UCard variant="ams" class="w-full col-span-2">
      <template #header>
        <h2 class="text-xl font-bold">Schiffe nach Abteilung</h2>
      </template>
      <div class="flex h-full items-center bigDonut px-8 space-x-6">
        <DonutChart
          :data="shipsByDepartment.data"
          :labels="shipsByDepartment.labels"
          :height="400"
          :radius="0"
          :arcWidth="50"
          :hideLegend="true"
          class=""
        >
          <template #tooltip="{ values }">
            <div
              class="bg-(--ui-bg-muted) flex p-2 text-center divide-x space-x-1 justify-center rounded text-(--ui-text) border border-(--border-color)"
              :style="[
                {
                  'border-color':
                    shipsByDepartment.labels[values?.index]?.color,
                },
              ]"
            >
              <div class="w-fit pr-1 text-primary">
                {{ values?.data }}
              </div>
              <div class="col-span-4">
                {{ shipsByDepartment.labels[values?.index]?.name }}
              </div>
            </div>
          </template>
          <div class="absolute text-center">
            <div class="font-semibold">Abteilung</div>
          </div>
        </DonutChart>
        <div class="w-full">
          <ul class="divide-y divide-(--ui-bg-accented) text-sm">
            <li
              v-for="(label, index) in shipsByDepartment.labels"
              :key="label.name"
              class="marker:text-(--dot-color) list-none pl-3 before:h-5 before:bg-(--dot-color) my-0 -mt-2 py-2 before:absolute w-full justify-between flex before:top-0 before:bottom-0 before:my-auto before:left-0 relative before:w-1"
              :style="[{ '--dot-color': label.color }]"
            >
              <span>{{ label.name }}</span>
              <span>{{ shipsByDepartment.data[index] }}</span>
            </li>
          </ul>
        </div>
      </div>
    </UCard>
    <UCard variant="ams" class="w-full">
      <template #header>
        <h2 class="text-xl font-bold">Schiffe nach Hersteller</h2>
      </template>
      <div class="flex">
        <DonutChart
          :data="shipsByManufacturer.data"
          :labels="shipsByManufacturer.labels"
          :height="300"
          :radius="0"
          :arcWidth="40"
          :hideLegend="true"
        >
          <template #tooltip="{ values }">
            <div
              class="bg-(--ui-bg-muted) flex p-2 text-center divide-x space-x-1 justify-center rounded text-(--ui-text) border border-(--border-color)"
              :style="[
                {
                  'border-color':
                    shipsByManufacturer.labels[values?.index]?.color,
                },
              ]"
            >
              <div class="w-fit pr-1 text-primary">
                {{ values?.data }}
              </div>
              <div class="col-span-4">
                {{ shipsByManufacturer.labels[values?.index]?.name }}
              </div>
            </div>
          </template>
          <div class="absolute text-center">
            <div class="font-semibold">Hersteller</div>
          </div>
        </DonutChart>
        <div class="w-full">
          <ul class="divide-y divide-(--ui-bg-accented) text-xs">
            <li
              v-for="(label, index) in shipsByManufacturer.labels"
              :key="label.name"
              class="marker:text-(--dot-color) list-none pl-2 before:h-5 before:bg-(--dot-color) my-0 -mt-2 py-2 before:absolute w-full justify-between flex before:top-0 before:bottom-0 before:my-auto before:left-0 relative before:w-[1.5px]"
              :style="[{ '--dot-color': label.color }]"
            >
              <span>{{ label.name }}</span>
              <span>{{ shipsByManufacturer.data[index] }}</span>
            </li>
          </ul>
        </div>
      </div>
    </UCard>
    <UCard variant="ams" class="w-full">
      <template #header>
        <h2 class="text-xl font-bold">Schiffe nach Klassifizierung</h2>
      </template>
      <div class="flex h-full items-center">
        <DonutChart
          :data="shipsByClassification.data"
          :labels="shipsByClassification.labels"
          :height="300"
          :radius="0"
          :arcWidth="40"
          :hideLegend="true"
        >
          <template #tooltip="{ values }">
            <div
              class="bg-(--ui-bg-muted) flex p-2 text-center divide-x space-x-1 justify-center rounded text-(--ui-text) border border-(--border-color)"
              :style="[
                {
                  'border-color':
                    shipsByClassification.labels[values?.index]?.color,
                },
              ]"
            >
              <div class="w-fit pr-1 text-primary">
                {{ values?.data }}
              </div>
              <div class="col-span-4">
                {{ shipsByClassification.labels[values?.index]?.name }}
              </div>
            </div>
          </template>
          <div class="absolute text-center">
            <div class="font-semibold">Klassifizierung</div>
          </div>
        </DonutChart>
        <div class="w-full">
          <ul class="divide-y divide-(--ui-bg-accented) text-xs">
            <li
              v-for="(label, index) in shipsByClassification.labels"
              :key="label.name"
              class="marker:text-(--dot-color) list-none pl-2 before:h-5 before:bg-(--dot-color) my-0 -mt-2 py-2 before:absolute w-full justify-between flex before:top-0 before:bottom-0 before:my-auto before:left-0 relative before:w-[1.5px]"
              :style="[{ '--dot-color': label.color }]"
            >
              <span>{{ label.name }}</span>
              <span>{{ shipsByClassification.data[index] }}</span>
            </li>
          </ul>
        </div>
      </div>
    </UCard>
    <UCard variant="ams" class="w-full">
      <template #header>
        <h2 class="text-xl font-bold">Schiffe nach Größe</h2>
      </template>
      <div class="flex h-full items-center">
        <DonutChart
          :data="shipsBySize.data"
          :labels="shipsBySize.labels"
          :height="300"
          :radius="0"
          :arcWidth="40"
          :hideLegend="true"
        >
          <template #tooltip="{ values }">
            <div
              class="bg-(--ui-bg-muted) flex p-2 text-center divide-x space-x-1 justify-center rounded text-(--ui-text) border border-(--border-color)"
              :style="[
                {
                  'border-color': shipsBySize.labels[values?.index]?.color,
                },
              ]"
            >
              <div class="w-fit pr-1 text-primary">
                {{ values?.data }}
              </div>
              <div class="col-span-4">
                {{ shipsBySize.labels[values?.index]?.name }}
              </div>
            </div>
          </template>
          <div class="absolute text-center">
            <div class="font-semibold">Größe</div>
          </div>
        </DonutChart>
        <div class="w-full">
          <ul class="divide-y divide-(--ui-bg-accented) text-xs">
            <li
              v-for="(label, index) in shipsBySize.labels"
              :key="label.name"
              class="marker:text-(--dot-color) list-none pl-2 before:h-5 before:bg-(--dot-color) my-0 -mt-2 py-2 before:absolute w-full justify-between flex before:top-0 before:bottom-0 before:my-auto before:left-0 relative before:w-[1.5px]"
              :style="[{ '--dot-color': label.color }]"
            >
              <span>{{ label.name }}</span>
              <span>{{ shipsBySize.data[index] }}</span>
            </li>
          </ul>
        </div>
      </div>
    </UCard>
    <UCard variant="ams" class="w-full">
      <template #header>
        <h2 class="text-xl font-bold">Schiffe nach Produktionsstatus</h2>
      </template>
      <div class="flex h-full items-center">
        <DonutChart
          :data="shipsByProductionStatus.data"
          :labels="shipsByProductionStatus.labels"
          :height="300"
          :radius="0"
          :arcWidth="40"
          :hideLegend="true"
        >
          <template #tooltip="{ values }">
            <div
              class="bg-(--ui-bg-muted) flex p-2 text-center divide-x space-x-1 justify-center rounded text-(--ui-text) border border-(--border-color)"
              :style="[
                {
                  'border-color':
                    shipsByProductionStatus.labels[values?.index]?.color,
                },
              ]"
            >
              <div class="w-fit pr-1 text-primary">
                {{ values?.data }}
              </div>
              <div class="col-span-4">
                {{ shipsByProductionStatus.labels[values?.index]?.name }}
              </div>
            </div>
          </template>
          <div class="absolute text-center">
            <div class="font-semibold">Produktionsstatus</div>
          </div>
        </DonutChart>
        <div class="w-full">
          <ul class="divide-y divide-(--ui-bg-accented) text-xs">
            <li
              v-for="(label, index) in shipsByProductionStatus.labels"
              :key="label.name"
              class="marker:text-(--dot-color) list-none pl-2 before:h-5 before:bg-(--dot-color) my-0 -mt-2 py-2 before:absolute w-full justify-between flex before:top-0 before:bottom-0 before:my-auto before:left-0 relative before:w-[1.5px]"
              :style="[{ '--dot-color': label.color }]"
            >
              <span>{{ label.name }}</span>
              <span>{{ shipsByProductionStatus.data[index] }}</span>
            </li>
          </ul>
        </div>
      </div>
    </UCard>
  </div>
</template>

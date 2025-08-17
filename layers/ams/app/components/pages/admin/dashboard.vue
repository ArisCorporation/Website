<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DirectusUser } from '~~/types'
import { DonutChart, LineChart, CurveType, LegendPosition } from 'nuxt-charts'
import type { BulletLegendItemInterface } from '@unovis/ts'

// Fetch employee data
const { data: employees, pending } = await useFetchAMSEmployees()

// Time range filter
const timeRange = ref('all') // 'month', 'year', 'all'

const filteredEmployees = computed(() => {
  if (!employees.value) return []
  const now = new Date()
  if (timeRange.value === 'month') {
    const lastMonth = new Date(new Date().setMonth(now.getMonth() - 1))
    return employees.value.filter(e => e.date_created && new Date(e.date_created) > lastMonth)
  }
  if (timeRange.value === 'year') {
    const lastYear = new Date(new Date().setFullYear(now.getFullYear() - 1))
    return employees.value.filter(e => e.date_created && new Date(e.date_created) > lastYear)
  }
  return employees.value
})

const colorPalette = [
  '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4',
  '#ef4444', '#84cc16', '#d946ef', '#f97316', '#14b8a6',
]

// --- Chart Data Processing ---

function processGroupedData(data: DirectusUser[], groupBy: (item: DirectusUser) => string | undefined) {
  if (!data) return { data: [], labels: [] }

  const counts = new Map<string, number>()
  data.forEach((item) => {
    const key = groupBy(item)
    if (key) {
      counts.set(key, (counts.get(key) || 0) + 1)
    }
  })

  const sortedData = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const chartData = sortedData.map(entry => entry[1])
  const chartLabels = sortedData.map((entry, index) => ({
    name: entry[0],
    color: colorPalette[index % colorPalette.length],
  }))

  return { data: chartData, labels: chartLabels }
}

const employeesByRole = computed(() =>
  processGroupedData(filteredEmployees.value, (e) => e.role?.name)
)

const employeesByDepartment = computed(() =>
  processGroupedData(filteredEmployees.value, (e) => e.primary_department?.name)
)

const employeesOverTime = computed(() => {
  if (!filteredEmployees.value) return []

  const counts = new Map<string, number>()
  filteredEmployees.value.forEach(e => {
    if (e.date_created) {
      const date = new Date(e.date_created)
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      counts.set(month, (counts.get(month) || 0) + 1)
    }
  })

  const sortedMonths = [...counts.keys()].sort()
  let cumulative = 0
  const chartData = sortedMonths.map(month => {
    cumulative += counts.get(month) || 0
    return { date: month, employees: cumulative }
  })

  return chartData
})

const lineChartCategories: Record<string, BulletLegendItemInterface> = {
  employees: { name: 'Mitarbeiter', color: '#3b82f6' },
}

const xFormatter = (i: number): string | number => `${employeesOverTime.value[i]?.date}`

</script>

<template>
  <div v-if="pending">
    <p>Loading...</p>
  </div>
  <div v-else class="space-y-8">
    <div class="flex justify-end space-x-2">
       <UButton @click="timeRange = 'month'" :variant="timeRange === 'month' ? 'solid' : 'outline'">Last Month</UButton>
       <UButton @click="timeRange = 'year'" :variant="timeRange === 'year' ? 'solid' : 'outline'">Last Year</UButton>
       <UButton @click="timeRange = 'all'" :variant="timeRange === 'all' ? 'solid' : 'outline'">All Time</UButton>
    </div>

    <UCard variant="ams" class="w-full">
      <template #header>
        <h2 class="text-xl font-bold">Mitarbeiter über Zeit</h2>
      </template>
      <LineChart
        :data="employeesOverTime"
        :height="400"
        y-label="Mitarbeiter"
        :x-num-ticks="6"
        :y-num-ticks="5"
        :categories="lineChartCategories"
        :x-formatter="xFormatter"
        :y-grid-line="true"
        :curve-type="CurveType.Linear"
        :legend-position="LegendPosition.Top"
        :hide-legend="false"
      />
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <UCard variant="ams" class="w-full">
        <template #header>
          <h2 class="text-xl font-bold">Mitarbeiter nach Rolle</h2>
        </template>
        <div class="flex h-full items-center px-8 space-x-6">
          <DonutChart
            :data="employeesByRole.data"
            :labels="employeesByRole.labels"
            :height="300"
            :radius="0"
            :arc-width="40"
            :hide-legend="true"
          >
            <template #tooltip="{ values }">
              <div
                class="bg-[--ui-bg-muted] flex p-2 text-center divide-x space-x-1 justify-center rounded text-[--ui-text] border"
                :style="[{ 'border-color': employeesByRole.labels[values?.index]?.color }]"
              >
                <div class="w-fit pr-1 text-primary">{{ values?.data }}</div>
                <div class="col-span-4 pl-1">{{ employeesByRole.labels[values?.index]?.name }}</div>
              </div>
            </template>
            <div class="absolute text-center">
              <div class="font-semibold">Rolle</div>
            </div>
          </DonutChart>
          <div class="w-full">
            <ul class="divide-y divide-[--ui-bg-accented] text-sm">
              <li
                v-for="(label, index) in employeesByRole.labels"
                :key="label.name"
                class="list-none pl-3 before:h-5 before:bg-[--dot-color] my-0 -mt-2 py-2 before:absolute w-full justify-between flex before:top-0 before:bottom-0 before:my-auto before:left-0 relative before:w-1"
                :style="[{ '--dot-color': label.color }]"
              >
                <span>{{ label.name }}</span>
                <span>{{ employeesByRole.data[index] }}</span>
              </li>
            </ul>
          </div>
        </div>
      </UCard>

      <UCard variant="ams" class="w-full">
        <template #header>
          <h2 class="text-xl font-bold">Mitarbeiter nach Abteilung</h2>
        </template>
         <div class="flex h-full items-center px-8 space-x-6">
          <DonutChart
            :data="employeesByDepartment.data"
            :labels="employeesByDepartment.labels"
            :height="300"
            :radius="0"
            :arc-width="40"
            :hide-legend="true"
          >
            <template #tooltip="{ values }">
              <div
                class="bg-[--ui-bg-muted] flex p-2 text-center divide-x space-x-1 justify-center rounded text-[--ui-text] border"
                :style="[{ 'border-color': employeesByDepartment.labels[values?.index]?.color }]"
              >
                <div class="w-fit pr-1 text-primary">{{ values?.data }}</div>
                <div class="col-span-4 pl-1">{{ employeesByDepartment.labels[values?.index]?.name }}</div>
              </div>
            </template>
            <div class="absolute text-center">
              <div class="font-semibold">Abteilung</div>
            </div>
          </DonutChart>
          <div class="w-full">
            <ul class="divide-y divide-[--ui-bg-accented] text-sm">
              <li
                v-for="(label, index) in employeesByDepartment.labels"
                :key="label.name"
                class="list-none pl-3 before:h-5 before:bg-[--dot-color] my-0 -mt-2 py-2 before:absolute w-full justify-between flex before:top-0 before:bottom-0 before:my-auto before:left-0 relative before:w-1"
                :style="[{ '--dot-color': label.color }]"
              >
                <span>{{ label.name }}</span>
                <span>{{ employeesByDepartment.data[index] }}</span>
              </li>
            </ul>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

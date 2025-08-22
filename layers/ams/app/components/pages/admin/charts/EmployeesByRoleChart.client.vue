<script lang="ts" setup>
import type { PropType } from 'vue'
import type { DirectusUser } from '~~/types'

const props = defineProps({
  users: {
    type: Array as PropType<DirectusUser[] | null>,
    required: true,
  },
})

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

function processDonutChartData(
  users: DirectusUser[] | null,
  groupBy: (user: DirectusUser) => string | string[] | undefined
) {
  if (!users) return { data: [], labels: [] }

  const counts = new Map<string, number>()
  users.forEach((user) => {
    const keys = groupBy(user)
    if (keys) {
      if (Array.isArray(keys)) {
        keys.forEach((key) => {
          counts.set(key, (counts.get(key) || 0) + 1)
        })
      } else {
        counts.set(keys, (counts.get(keys) || 0) + 1)
      }
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

const membersByRole = computed(() =>
  processDonutChartData(props.users, (user) => user.role?.label)
)
</script>

<template>
  <UCard variant="ams" class="w-full">
    <template #header>
      <h2 class="text-xl font-bold">Mitarbeiter nach Rolle</h2>
    </template>
    <div class="flex h-full items-center px-8 space-x-6">
      <DonutChart
        :data="membersByRole.data"
        :labels="membersByRole.labels"
        :height="300"
        :radius="0"
        :arcWidth="40"
        :hideLegend="true"
        class=""
      >
        <template #tooltip="{ values }">
          <div
            class="bg-(--ui-bg-muted) flex p-2 text-center divide-x space-x-1 justify-center rounded text-(--ui-text) border border-(--border-color)"
            :style="[
              {
                'border-color': membersByRole.labels[values?.index]?.color,
              },
            ]"
          >
            <div class="w-fit pr-1 text-primary">
              {{ values?.data }}
            </div>
            <div class="col-span-4">
              {{ membersByRole.labels[values?.index]?.name }}
            </div>
          </div>
        </template>
        <div class="absolute text-center">
          <div class="font-semibold">Rolle</div>
        </div>
      </DonutChart>
      <div class="w-full">
        <ul class="divide-y divide-(--ui-bg-accented) text-sm">
          <li
            v-for="(label, index) in membersByRole.labels"
            :key="label.name"
            class="marker:text-(--dot-color) list-none pl-3 before:h-5 before:bg-(--dot-color) my-0 -mt-2 py-2 before:absolute w-full justify-between flex before:top-0 before:bottom-0 before:my-auto before:left-0 relative before:w-1"
            :style="[{ '--dot-color': label.color }]"
          >
            <span>{{ label.name }}</span>
            <span>{{ membersByRole.data[index] }}</span>
          </li>
        </ul>
      </div>
    </div>
  </UCard>
</template>

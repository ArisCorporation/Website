<script lang="ts" setup>
import type { PropType } from 'vue'
import type { ProcessedChartData } from '~/stores/ams/admin-dashboard-store'

const props = defineProps({
  processedChartDataWithRevisions: {
    type: Array as PropType<ProcessedChartData[]>,
    required: true,
  },
  employeeTimelineLoading: {
    type: Boolean,
    required: true,
  },
})

const selectedFilter = ref<'6m' | '1y' | 'all'>('all')

const filteredChartData = computed(() => {
  const chartData = props.processedChartDataWithRevisions

  const now = new Date()
  let filtered = chartData

  if (selectedFilter.value === '6m') {
    const sixMonthsAgoDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const sixMonthsAgoKey = `${sixMonthsAgoDate.getFullYear()}-${(
      sixMonthsAgoDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}`

    filtered = chartData.filter((item) => {
      return item.dateKey >= sixMonthsAgoKey
    })
  } else if (selectedFilter.value === '1y') {
    const oneYearAgoDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
    const oneYearAgoKey = `${oneYearAgoDate.getFullYear()}-${(
      oneYearAgoDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}`

    filtered = chartData.filter((item) => {
      return item.dateKey >= oneYearAgoKey
    })
  }

  return filtered
})

const categories: Record<string, BulletLegendItemInterface> = {
  active: { name: 'Active Members', color: '#00ffe8' },
  archived: { name: 'Archived Members', color: '#ef4444' },
}

const xFormatter = (tick: number, _i?: number, _ticks?: number[]): string => {
  return filteredChartData.value[tick]?.month ?? ''
}
</script>

<template>
  <UCard variant="ams" class="w-full col-span-2">
    <template #header>
      <h2 class="text-xl font-bold">Mitarbeiter Anzahl</h2>
    </template>
    <div class="flex gap-2 mb-4">
      <UButton
        @click="selectedFilter = '6m'"
        :variant="selectedFilter === '6m' ? 'solid' : 'outline'"
      >
        Letzten 6 Monate
      </UButton>
      <UButton
        @click="selectedFilter = '1y'"
        :variant="selectedFilter === '1y' ? 'solid' : 'outline'"
      >
        Letztes Jahr
      </UButton>
      <UButton
        @click="selectedFilter = 'all'"
        :variant="selectedFilter === 'all' ? 'solid' : 'outline'"
      >
        Von Anfang an
      </UButton>
    </div>
    <LineChart
      v-if="!employeeTimelineLoading"
      :data="filteredChartData"
      :height="200"
      x-label="Time"
      y-label="Number of Members"
      :categories="categories"
      :y-num-ticks="4"
      :x-num-ticks="filteredChartData.length > 0 ? filteredChartData.length : 1"
      :x-formatter="xFormatter"
      :curve-type="CurveType.Basis"
      :legend-position="LegendPosition.Top"
      :hide-legend="false"
      :y-grid-line="true"
    />
    <div v-else class="w-full flex">
      <UIcon
        name="i-svg-spinners-bars-fade"
        class="size-12 mx-auto text-(--ui-primary)"
      />
    </div>
  </UCard>
</template>

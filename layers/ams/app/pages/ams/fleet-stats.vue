<script setup lang="ts">
// const { data } = useFetchAMSFleet()

const donutData = ref([35, 25, 20, 15, 5]) // Percentages

const marketShareLabels = [
  { name: 'Product A', color: '#3b82f6' }, // Blue
  { name: 'Product B', color: '#22c55e' }, // Green
  { name: 'Product C', color: '#f59e0b' }, // Amber
  { name: 'Product D', color: '#a855f7' }, // Purple
  { name: 'Other', color: '#06b6d4' }, // Cyan
]

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-bar-chart-3"
      title="Flottenstatistiken"
      description="Übersichtliche Analyse der ArisCorp Flotte."
    />
    <div>
      <div class="flex flex-wrap gap-4">
        <UCard variant="ams" class="w-fit">
          <template #header>
            <h2>Schiffe bei Hersteller</h2>
          </template>
          <template #default>
            <DonutChart
              :data="donutData"
              :height="300"
              :radius="0"
              :type="'full'"
              :labels="marketShareLabels"
            >
              <div class="absolute text-center">
                <div class="font-semibold">Label</div>
                <div class="text-muted">2 seconds ago</div>
              </div>
            </DonutChart>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

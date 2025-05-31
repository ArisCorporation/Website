<script setup lang="ts">
import type { ECSSRClientEventParams } from 'echarts/ssr/client/index'
import type { Company } from '~~/types'

const { data } = useFetchAMSFleet()
const manuacturerOptions = ref<ECOption>({
  tooltip: {
    trigger: 'item',
    textStyle: {
      color: 'var(--ui-text)',
      fontFamily: 'Orbitron',
    },
    backgroundColor: 'var(--ui-bg-muted)',
    name: 'label',
    formatter: (params) =>
      `<span>${params.seriesName}</span> <br /><div class="rounded-full max-h-2 max-w-2 size-2 mr-2" style="background-color: ${params.color}" />${params.name}`,
  },
  legend: {
    show: false,
    orient: 'horizontal',
    left: 'right',
    textStyle: {
      color: 'var(--ui-text)',
      fontFamily: 'Orbitron',
    },
  },
  series: [
    {
      name: 'Schiffe bei Hersteller',
      type: 'pie',
      radius: ['30%', '70%'],
      animation: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#111',
        borderWidth: 2,
      },
      data: [
        ...Object.entries(
          data.value?.reduce((acc, hangar) => {
            const manufacturer = JSON.stringify(
              hangar.ship_id?.manufacturer as Company
            )
            if (manufacturer) {
              acc[manufacturer] = (acc[manufacturer] || 0) + 1
            }
            return acc
          }, {} as Record<string, number>) || {}
        ).map(([manufacturer, value]) => ({
          name: JSON.parse(manufacturer)?.code,
          value,
          label: JSON.parse(manufacturer)?.name,
        })),
      ],
      label: {
        color: 'var(--ui-text )',
        fontFamily: 'Orbitron',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          color: '#00ffe8',
        },
      },
    },
  ],
})
const productionOptions = ref<ECOption>({
  tooltip: {
    trigger: 'item',
    textStyle: {
      color: 'var(--ui-text)',
      fontFamily: 'Orbitron',
    },
    backgroundColor: 'var(--ui-bg-muted)',
  },
  legend: {
    show: false,
    orient: 'horizontal',
    top: 'top',
    textStyle: {
      color: 'var(--ui-text)',
      fontFamily: 'Orbitron',
    },
  },
  series: [
    {
      name: 'Schiffe bei Produktionsstatus',
      type: 'pie',
      radius: ['30%', '70%'],
      animation: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#111',
        borderWidth: 2,
      },
      data: [
        ...Object.entries(
          data.value?.reduce((acc, hangar) => {
            const status =
              hangar.ship_id?.production_status === 'flight-ready'
                ? 'Flugfertig'
                : hangar.ship_id?.production_status === 'in-production'
                ? 'In Produktion'
                : 'Im Konzept'
            if (status) {
              acc[status] = (acc[status] || 0) + 1
            }
            return acc
          }, {} as Record<string, number>) || {}
        ).map(([name, value]) => ({ name, value })),
      ],
      label: {
        color: 'var(--ui-text )',
        fontFamily: 'Orbitron',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          color: '#00ffe8',
        },
      },
    },
  ],
})
const departmentOptions = ref<ECOption>({
  tooltip: {
    trigger: 'item',
    textStyle: {
      color: 'var(--ui-text)',
      fontFamily: 'Orbitron',
    },
    backgroundColor: 'var(--ui-bg-muted)',
  },
  legend: {
    show: false,
    orient: 'horizontal',
    top: 'top',
    left: 'right',
    textStyle: {
      color: 'var(--ui-text)',
      fontFamily: 'Orbitron',
    },
  },
  series: [
    {
      name: 'Schiffe bei Abteilung',
      type: 'pie',
      radius: ['30%', '70%'],
      animation: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#111',
        borderWidth: 2,
      },
      data: [
        ...Object.entries(
          data.value?.reduce((acc, hangar) => {
            const department = hangar.department?.name
            if (department) {
              acc[department] = (acc[department] || 0) + 1
            }
            return acc
          }, {} as Record<string, number>) || {}
        ).map(([name, value]) => ({ name, value })),
      ],
      label: {
        color: 'var(--ui-text )',
        fontFamily: 'Orbitron',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          color: '#00ffe8',
        },
      },
    },
  ],
})

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
            <VChart
              :option="manuacturerOptions"
              :init-options="{ height: 300, width: 394 }"
            />
          </template>
        </UCard>
        <UCard variant="ams" class="w-fit">
          <template #header>
            <h2>Schiffe bei Hersteller</h2>
          </template>
          <template #default>
            <VChart
              :option="productionOptions"
              :init-options="{ height: 300, width: 394 }"
            />
          </template>
        </UCard>
        <UCard variant="ams" class="w-fit">
          <template #header>
            <h2>Schiffe bei Abteilung</h2>
          </template>
          <template #default>
            <VChart
              :option="departmentOptions"
              :init-options="{ height: 300, width: 394 }"
            />
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

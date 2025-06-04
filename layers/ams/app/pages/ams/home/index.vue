<script setup lang="ts">
// Import SDK functions if not globally available or for clarity
import { readItems, readUsers } from '@directus/sdk'
import { computed } from 'vue'

// Helper function (kann außerhalb definiert oder bei Bedarf dupliziert werden)
const getOneMonthAgo = (): Date => {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date
}

// Helper function (kann außerhalb definiert oder bei Bedarf dupliziert werden)
const countItemsFromLastMonth = (
  items: Array<{ [key: string]: any }>,
  dateField: string
): number => {
  if (!items || items.length === 0) return 0
  const oneMonthAgo = getOneMonthAgo()
  return items.filter((item) => {
    const dateValue = item[dateField]
    return dateValue && new Date(dateValue) > oneMonthAgo
  }).length
}

const { data: fleetData } = await useAsyncData(
  'ams:dashboard-fleet',
  async () => {
    try {
      const fleet = await useDirectus(
        readItems('user_hangars', {
          fields: ['id', 'date_created', 'date_updated', 'deleted'],
          filter: {
            group: { _eq: 'ariscorp' },
          },
          limit: -1,
          sort: ['-date_created'],
        })
      )

      const active_fleet = fleet.filter((item) => !item.deleted)
      const deleted_fleet = fleet.filter((item) => item.deleted)

      return {
        fleetTotal: active_fleet.length, // Safe: fleet is guaranteed to be an array
        fleetLastMonth:
          countItemsFromLastMonth(active_fleet, 'date_created') -
          countItemsFromLastMonth(deleted_fleet, 'date_updated'),
      }
    } catch (err) {
      console.error('Error fetching fleet data:', err)
      throw err
    }
  }
)

const { data: employeesData } = await useAsyncData(
  'ams:dashboard-employees',
  async () => {
    try {
      const employees = await useDirectus(
        readUsers({
          fields: ['id', 'status', 'date_created', 'date_updated'],
          filter: {
            status: { _in: ['active', 'archived'] },
            api_account: { _eq: false },
          },
          limit: -1,
        })
      )

      const active_employees = employees.filter(
        (item) => item.status === 'active'
      )
      const deleted_employees = employees.filter(
        (item) => item.status === 'archived'
      )

      return {
        employeesTotal: active_employees.length,
        employeesLastMonth:
          countItemsFromLastMonth(active_employees, 'date_created') -
          countItemsFromLastMonth(deleted_employees, 'date_updated'),
      }
    } catch (err) {
      console.error('Error fetching employees data:', err)
      throw err
    }
  }
)

// Kombinieren der Daten für die Child-Komponente, falls diese eine einzelne Datenquelle erwartet
const dashboardData = computed(() => {
  return {
    fleetTotal: fleetData.value?.fleetTotal,
    fleetMonth: fleetData.value?.fleetLastMonth,
    employeesTotal: employeesData.value?.employeesTotal,
    employeesMonth: employeesData.value?.employeesLastMonth,
  }
})

definePageMeta({
  layout: 'ams',
  path: '/ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-layout-grid"
      title="Dashboard"
      description="Willkommen zurück, Commander. Hier ist deine persönliche Übersicht."
    />
    <AMSPagesDashboardTopGrid :data="dashboardData" />
    <AMSPagesDashboardBottomGrid />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'

const adminDashboardStore = useAdminDashboardStore()
const { allUsers, employeeTimelineLoading, processedChartDataWithRevisions } =
  storeToRefs(adminDashboardStore)

onMounted(() => {
  adminDashboardStore.fetchAllUsers()
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 mt-4">
    <AMSPagesAdminChartsEmployeeCountChart
      :processed-chart-data-with-revisions="processedChartDataWithRevisions"
      :employee-timeline-loading="employeeTimelineLoading"
    />
    <AMSPagesAdminChartsEmployeesByDepartmentChart :users="allUsers" />
    <AMSPagesAdminChartsEmployeesByRoleChart :users="allUsers" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// Fetch all employees and all hangar items
const { data: employees, pending: pendingEmployees } = await useFetchAMSEmployees()
const { data: allHangarItems, pending: pendingHangars } = await useFetchAllAMSHangars()

const pending = computed(() => pendingEmployees.value || pendingHangars.value)

// Calculate ship counts for each employee
const employeeShipCounts = computed(() => {
  if (!employees.value || !allHangarItems.value) return []

  const hangarCounts = new Map<string, number>()
  allHangarItems.value.forEach(item => {
    const userId = typeof item.user_id === 'string' ? item.user_id : item.user_id?.id
    if (userId) {
      hangarCounts.set(userId, (hangarCounts.get(userId) || 0) + 1)
    }
  })

  return employees.value.map(employee => ({
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`,
    ship_count: hangarCounts.get(employee.id) || 0,
  }))
})

const columns = [
  { key: 'name', label: 'Member Name' },
  { key: 'ship_count', label: 'Ship Count' },
  { key: 'actions', label: 'Actions' }
]

const selectedEmployeeId = ref<string | null>(null)

function viewHangar(employeeId: string) {
  selectedEmployeeId.value = employeeId
}

function goBack() {
  selectedEmployeeId.value = null
}
</script>

<template>
  <div>
    <div v-if="pending">
      <p>Loading data...</p>
    </div>
    <div v-else-if="!selectedEmployeeId">
      <UTable :rows="employeeShipCounts" :columns="columns">
        <template #actions-data="{ row }">
          <UButton @click="viewHangar(row.id)">View Hangar</UButton>
        </template>
      </UTable>
    </div>
    <div v-else>
      <UButton @click="goBack" class="mb-4">Back to List</UButton>
      <PagesAdminHangarDetail :employee-id="selectedEmployeeId" />
    </div>
  </div>
</template>

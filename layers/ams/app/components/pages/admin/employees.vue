<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DirectusUser } from '~~/types'

const { data: employees, pending, refresh } = await useFetchAMSEmployees()

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role.name', label: 'Role' },
  { key: 'actions', label: 'Actions' },
]

const isFormVisible = ref(false)
const editingEmployee = ref<DirectusUser | null>(null)
const isCreating = ref(false)

function addEmployee() {
  editingEmployee.value = null
  isCreating.value = true
  isFormVisible.value = true
}

function editEmployee(employee: DirectusUser) {
  editingEmployee.value = employee
  isCreating.value = false
  isFormVisible.value = true
}

async function removeEmployee(employeeId: string) {
  const { deleteUser } = useDirectus()
  try {
    if(confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      await deleteUser(employeeId)
      refresh()
    }
  } catch (error) {
    console.error('Failed to remove employee:', error)
  }
}

function onFormClose() {
  isFormVisible.value = false
  refresh()
}
</script>

<template>
  <div>
    <div v-if="pending">
      <p>Loading employees...</p>
    </div>
    <div v-else>
       <div class="flex justify-end mb-4">
        <UButton @click="addEmployee">Add Employee</UButton>
      </div>

      <UTable :rows="employees" :columns="columns">
        <template #name-data="{ row }">
          {{ row.first_name }} {{ row.last_name }}
        </template>
        <template #role.name-data="{ row }">
          {{ row.role?.name || 'N/A' }}
        </template>
        <template #actions-data="{ row }">
          <div class="space-x-2">
            <UButton size="sm" variant="outline" @click="editEmployee(row)">Edit</UButton>
            <UButton size="sm" color="red" variant="outline" @click="removeEmployee(row.id)">Remove</UButton>
          </div>
        </template>
      </UTable>

       <UModal v-model="isFormVisible">
         <PagesAdminEmployeeForm
            :employee="editingEmployee"
            :is-creating="isCreating"
            @close="onFormClose"
         />
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserHangar } from '~~/types'

const props = defineProps<{
  employeeId: string
}>()

const { data: hangarItems, pending, refresh } = await useFetchAMSHangar(ref(props.employeeId))

const columns = [
  { key: 'ship_id.name', label: 'Name' },
  { key: 'name', label: 'Model' },
  { key: 'serial', label: 'Serial Number' },
  { key: 'group', label: 'Group' },
  { key: 'visibility', label: 'Visibility' },
  { key: 'actions', label: 'Actions' },
]

const isFormVisible = ref(false)
const editingShip = ref<UserHangar | null>(null)

function addShip() {
  editingShip.value = null
  isFormVisible.value = true
}

function editShip(ship: UserHangar) {
  editingShip.value = ship
  isFormVisible.value = true
}

async function removeShip(shipId: number) {
  const { deleteItem } = useDirectus()
  try {
    await deleteItem('user_hangars', shipId)
    refresh()
  } catch (error) {
    console.error('Failed to remove ship:', error)
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
      <p>Loading hangar...</p>
    </div>
    <div v-else>
      <div class="flex justify-end mb-4">
        <UButton @click="addShip">Add Ship</UButton>
      </div>

      <UTable :rows="hangarItems" :columns="columns">
        <template #ship_id.name-data="{ row }">
          {{ row.ship_id?.name || 'N/A' }}
        </template>
        <template #actions-data="{ row }">
          <div class="space-x-2">
            <UButton size="sm" variant="outline" @click="editShip(row)">Edit</UButton>
            <UButton size="sm" color="red" variant="outline" @click="removeShip(row.id)">Remove</UButton>
          </div>
        </template>
      </UTable>

      <UModal v-model="isFormVisible">
        <PagesAdminHangarShipForm
          :ship="editingShip"
          :employee-id="employeeId"
          @close="onFormClose"
        />
      </UModal>
    </div>
  </div>
</template>

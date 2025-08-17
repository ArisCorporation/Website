<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UserHangar, Ship } from '~~/types'

const props = defineProps<{
  ship?: UserHangar | null
  employeeId: string
}>()

const emit = defineEmits(['close'])

const state = ref({
  ship_id: '',
  name: '',
  serial: '',
  group: 'private',
  visibility: 'hidden',
})

// Watch for changes in the ship prop to populate the form for editing
watch(() => props.ship, (newShip) => {
  if (newShip) {
    state.value = {
      ship_id: typeof newShip.ship_id === 'string' ? newShip.ship_id : newShip.ship_id?.id || '',
      name: newShip.name || '',
      serial: newShip.serial || '',
      group: newShip.group || 'private',
      visibility: newShip.visibility || 'hidden',
    }
  } else {
    // Reset for creation
    state.value = { ship_id: '', name: '', serial: '', group: 'private', visibility: 'hidden' }
  }
}, { immediate: true })

const groupOptions = ['ariscorp', 'private']
const visibilityOptions = ['public', 'internal', 'hidden']

async function handleSubmit() {
  const { createItem, updateItem } = useDirectus()
  const payload = {
    ...state.value,
    user_id: props.employeeId,
  }

  try {
    if (props.ship) {
      // Update existing ship
      await updateItem('user_hangars', props.ship.id, payload)
    } else {
      // Create new ship
      await createItem('user_hangars', payload)
    }
    emit('close')
  } catch (error) {
    console.error('Failed to save ship:', error)
    // Handle error (e.g., show a toast notification)
  }
}
</script>

<template>
  <div class="p-4">
    <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
      {{ ship ? 'Edit Ship' : 'Add Ship' }}
    </h3>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <UFormGroup label="Ship (ID)" name="ship_id">
        <!-- This should ideally be a searchable select component -->
        <UInput v-model="state.ship_id" placeholder="Enter Ship ID" />
      </UFormGroup>

      <UFormGroup label="Custom Name / Model" name="name">
        <UInput v-model="state.name" />
      </UFormGroup>

      <UFormGroup label="Serial Number" name="serial">
        <UInput v-model="state.serial" />
      </UFormGroup>

      <UFormGroup label="Group" name="group">
        <USelect v-model="state.group" :options="groupOptions" />
      </UFormGroup>

      <UFormGroup label="Visibility" name="visibility">
        <USelect v-model="state.visibility" :options="visibilityOptions" />
      </UFormGroup>

      <div class="flex justify-end space-x-2">
        <UButton type="button" color="gray" variant="ghost" @click="$emit('close')">Cancel</UButton>
        <UButton type="submit">Save</UButton>
      </div>
    </form>
  </div>
</template>

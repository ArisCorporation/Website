<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DirectusUser, DirectusRole } from '~~/types'

const props = defineProps<{
  employee?: DirectusUser | null
  isCreating: boolean
}>()

const emit = defineEmits(['close'])

const state = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  role: '',
  roles: [],
  discord_id: '',
  department_leader: false,
  // Add other fields for edit mode as needed
})

// --- Data Fetching for Select Menus ---
const { data: discordUserList, pending: discordUserListPending } = useAsyncData(
  'global:discord_users',
  () => $fetch('/api/ams/getDiscordUser')
)

const { data: roleList } = useAsyncData('directus:roles', () =>
  useDirectus(readRoles({ limit: -1 }))
)

// --- Form Logic ---

watch(() => props.employee, (newEmployee) => {
  if (newEmployee) {
    state.value = {
      first_name: newEmployee.first_name || '',
      middle_name: newEmployee.middle_name || '',
      last_name: newEmployee.last_name || '',
      email: newEmployee.email || '',
      role: typeof newEmployee.role === 'string' ? newEmployee.role : newEmployee.role?.id || '',
      roles: newEmployee.roles || [],
      discord_id: newEmployee.discord_id || '',
      department_leader: newEmployee.head_of_department || false,
    }
  } else {
    // Reset for creation
    state.value = { first_name: '', middle_name: '', last_name: '', email: '', role: '', roles: [], discord_id: '', department_leader: false }
  }
}, { immediate: true })


async function handleSubmit() {
  const { createUser, updateUser } = useDirectus()

  // Construct payload, ensuring role is just the ID
  const payload = {
      ...state.value,
      role: state.value.role, // should be an ID
  };

  try {
    if (props.isCreating) {
      // Creating a user requires a password.
      // For now, let's generate a temporary one.
      // In a real scenario, this should be handled more securely (e.g., email invitation).
      payload.password = Math.random().toString(36).slice(-8);
      await createUser(payload)
    } else if (props.employee) {
      await updateUser(props.employee.id, payload)
    }
    emit('close')
  } catch (error) {
    console.error('Failed to save employee:', error)
  }
}
</script>

<template>
  <div class="p-4">
    <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
      {{ isCreating ? 'Add Employee' : 'Edit Employee' }}
    </h3>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <UFormGroup label="First Name" name="first_name" required>
        <UInput v-model="state.first_name" />
      </UFormGroup>

      <UFormGroup label="Middle Name" name="middle_name">
        <UInput v-model="state.middle_name" />
      </UFormGroup>

      <UFormGroup label="Last Name" name="last_name" required>
        <UInput v-model="state.last_name" />
      </UFormGroup>

      <UFormGroup label="Email" name="email" required>
        <UInput v-model="state.email" type="email" />
      </UFormGroup>

      <UFormGroup label="Role" name="role" required>
        <USelectMenu
          v-model="state.role"
          :items="roleList"
          value-key="id"
          label-key="name"
        />
      </UFormGroup>

      <UFormGroup label="Discord User" name="discord_id">
        <USelectMenu
            v-model="state.discord_id"
            :items="discordUserList?.sort((a, b) => a.label.localeCompare(b.label))"
            placeholder="Select Discord User"
            label-key="label"
            value-key="id"
            :loading="discordUserListPending"
          >
             <template #leading>
              <img
                v-if="state.discord_id && discordUserList"
                :src="discordUserList.find(e => e.id === state.discord_id)?.profile_image"
                class="size-5 rounded-full object-cover mr-2"
              />
            </template>
            <template #item-leading="{ item }">
              <img :src="item.profile_image" class="size-5 rounded-full object-cover mr-2" />
            </template>
        </USelectMenu>
      </UFormGroup>

      <div v-if="!isCreating">
          <UFormGroup label="Secondary Roles" name="roles">
            <!-- Add logic for secondary roles if needed -->
          </UFormGroup>
          <UFormGroup label="Department Leader" name="department_leader">
              <UCheckbox v-model="state.department_leader" label="Is Department Leader" />
          </UFormGroup>
      </div>

      <div class="flex justify-end space-x-2">
        <UButton type="button" color="gray" variant="ghost" @click="$emit('close')">Cancel</UButton>
        <UButton type="submit">Save</UButton>
      </div>
    </form>
  </div>
</template>

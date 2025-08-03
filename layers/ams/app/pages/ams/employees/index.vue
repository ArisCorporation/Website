<script setup lang="ts">
import type { DirectusUser } from '~~/types'

const searchInput = ref('')

const { data, refresh } = await useFetchAMSEmployees()

const filteredEmployees = computed<DirectusUser[]>(() => {
  return searchItems<DirectusUser>(
    data.value ?? [],
    [
      'first_name',
      'middle_name',
      'last_name',
      'department.name',
      'leading_department.name',
      'role.label',
    ],
    searchInput.value
  )
})

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-users-round"
      title="Mitarbeiter"
      description="Übersicht aller Mitarbeiter der ArisCorp."
    />
    <UInput
      v-model="searchInput"
      highlight
      variant="outline"
      icon="i-lucide-search"
      placeholder="Name, Hersteller, Modell"
      size="lg"
      class="w-full mb-6"
    />
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4"
    >
      <AMSUiEmployeeCard
        v-for="employee in filteredEmployees"
        :key="employee.id"
        :data="employee"
      />
    </div>
  </div>
</template>

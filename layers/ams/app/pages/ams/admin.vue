<script setup lang="ts">
import type { TabsItem } from '#ui/types'

definePageMeta({
  layout: 'ams',
  auth: true,
})

const items: TabsItem[] = [
  {
    slot: 'dashboard',
    label: 'Dashboard',
  },
  {
    slot: 'hangars',
    label: 'Hangare',
  },
  {
    slot: 'employees',
    label: 'Mitarbeiter',
  },
]
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-shield-check"
      title="Verwaltungsbereich"
      description="Verwalte Mitarbeiter, Hangare und Rollen."
    />
    <div class="mt-8">
      <UTabs
        :items="items"
        :ui="{
          wrapper: 'flex items-start gap-8',
          list: {
            base: 'flex flex-col',
            width: 'w-48',
          },
        }"
      >
        <template #dashboard="{ item }">
          <PagesAdminDashboard />
        </template>

        <template #hangars="{ item }">
          <PagesAdminHangars />
        </template>

        <template #employees="{ item }">
          <PagesAdminEmployees />
        </template>
      </UTabs>
    </div>
  </div>
</template>

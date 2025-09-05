<script setup lang="ts">
definePageMeta({
  layout: 'ams',
  auth: true,
  access_level: 5,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-shield-check"
      title="Verwaltungsbereich"
      description="Verwalte Mitarbeiter, Hangare und Rollen."
    />
    <UTabs
      :items="[
        {
          label: 'Dashboard',
          slot: 'dashboard',
        },
        {
          label: 'Mitarbeiter',
          slot: 'employees',
        },
        {
          label: 'Abteilungen',
          slot: 'departments',
        },
      ]"
      class="w-full"
      :ui="{
        list: 'border border-(--ui-primary)/10 bg-(--ui-bg-muted)/70',
        indicator: 'bg-(--ui-primary)/10',
        trigger: 'data-[state=active]:text-(--ui-primary)',
      }"
    >
      <template #dashboard>
        <!-- <ClientOnly> -->
        <AMSPagesAdminDashboard />
        <!-- </ClientOnly> -->
      </template>
      <template #employees>
        <AMSPagesAdminEmployees />
      </template>
      <template #departments></template>
    </UTabs>
  </div>
</template>

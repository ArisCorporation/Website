<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const tabs = ref<TabsItem[]>([
  {
    label: 'Details',
    slot: 'details',
  },
  {
    label: 'Biografie',
    slot: 'biography',
  },
])

definePageMeta({
  layout: 'ams',
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-user"
      title="Profil"
      description="Verwalte deine persönlichen Details und Biografie."
    />
    <UTabs
      :items="tabs"
      class="w-full"
      :ui="{
        list: 'border border-(--ui-primary)/10 bg-(--ui-bg-muted)/70',
        indicator: 'bg-(--ui-primary)/10',
        trigger: 'data-[state=active]:text-(--ui-primary)',
      }"
    >
      <template #details>
        <div class="space-y-6">
          <!-- <UForm> -->
          <AMSPagesProfilePersonalDetails />
          <AMSPagesProfileOrgaData />
          <AMSPagesProfileBaseData />
          <!-- </UForm> -->
        </div>
      </template>
      <template #biography>
        <AMSPagesProfileBiography />
      </template>
    </UTabs>
  </div>
</template>

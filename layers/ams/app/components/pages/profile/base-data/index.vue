<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const tabs = ref<TabsItem[]>([
  {
    label: 'Basis Daten',
    slot: 'basics',
  },
  {
    label: 'Physik',
    slot: 'physics',
  },
  {
    label: 'Bürgerstatus',
    slot: 'citizenship',
  },
  {
    label: 'Details',
    slot: 'details',
  },
])

const tab = [
  {
    title: '',
    description: '',
    component: ''
  }
]

definePageMeta({
  layout: 'ams',
})
</script>

<template>
  <UCard variant="ams" class="animated-border">
    <UTabs
      :items="tabs"
      class="w-full"
      :ui="{
        list: 'border border-(--ui-primary)/10 bg-(--ui-bg-muted)/70',
        indicator: 'bg-(--ui-primary)/10',
        trigger: 'data-[state=active]:text-(--ui-primary)',
      }"
    >
      <template #basics>
        <div class="space-y-6">
          <UCard variant="ams" class="!shadow-none">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0">
                <h4>Basis Informationen</h4>
                <p class="text-xs pt-1 text-(--ui-text-muted)">
                  Basis Informationen zu der Person
                </p>
              </div>
            </template>
            <template #default>
              <AMSPagesProfileBaseDataBaseTab />
            </template>
          </UCard>
        </div>
      </template>
      <template #physics>
        <div class="space-y-6">
          <UCard variant="ams" class="!shadow-none">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0">
                <h4>Physische Informationen</h4>
                <p class="text-xs pt-1 text-(--ui-text-muted)">
                  Informationen zu deiner physik
                </p>
              </div>
            </template>
            <template #default>
              <AMSPagesProfileBaseDataPhysicsTab />
            </template>
          </UCard>
        </div>
      </template>
      <template #citizenship>
        <div class="space-y-6">
          <UCard variant="ams" class="!shadow-none">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0">
                <h4>Bürgerstatus</h4>
                <p class="text-xs pt-1 text-(--ui-text-muted)">
                  Hier kannst du dein Bürgerstatus festlegen
                </p>
              </div>
            </template>
            <template #default>
              <AMSPagesProfileBaseDataCitizenshipTab />
            </template>
          </UCard>
        </div>
      </template>
      <template #details>
        <div class="space-y-6">
          <UCard variant="ams" class="!shadow-none">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0">
                <h4>Detail Informationen</h4>
                <p class="text-xs pt-1 text-(--ui-text-muted)">
                  Details zu deiner Person und deinem Geschmack
                </p>
              </div>
            </template>
            <template #default>
              <AMSPagesProfileBaseDataDetailsTab />
            </template>
          </UCard>
        </div>
      </template>
    </UTabs>
  </UCard>
</template>

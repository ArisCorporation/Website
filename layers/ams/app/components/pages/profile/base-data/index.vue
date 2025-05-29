<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const store = useUserProfileEditStore()

const tabs = computed<TabsItem[]>(() => {
  const baseTab = {
    label: 'Basis Daten',
    slot: 'basics',
  }
  const physicsTab = {
    label: 'Physik',
    slot: 'physics',
  }
  const citizenshipTab = {
    label: 'Bürgerstatus',
    slot: 'citizenship',
  }
  const detailsTab = {
    label: 'Details',
    slot: 'details',
  }
  const tabList = [baseTab, physicsTab, citizenshipTab, detailsTab]

  if (store.formData.duty_state) {
    tabList.push({
      label: 'Militärdienst',
      slot: 'military',
    })
  }

  if (store.formData.education_state) {
    tabList.push({
      label: 'Hochschulausbildung',
      slot: 'education',
    })
  }

  return tabList
})

definePageMeta({
  layout: 'ams',
})
</script>

<template>
  <div class="space-y-72">
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
        <template #military>
          <div class="space-y-6">
            <UCard variant="ams" class="!shadow-none">
              <template #header>
                <div class="prose-h4:my-0 prose-p:my-0">
                  <h4>Militärdienst</h4>
                  <p class="text-xs pt-1 text-(--ui-text-muted)">
                    Informationen zu deinem Militärdienst
                  </p>
                </div>
              </template>
              <template #default>
                <AMSPagesProfileBaseDataMilitaryTab />
              </template>
            </UCard>
          </div>
        </template>
        <template #education>
          <div class="space-y-6">
            <UCard variant="ams" class="!shadow-none">
              <template #header>
                <div class="prose-h4:my-0 prose-p:my-0">
                  <h4>Hochschulausbildung</h4>
                  <p class="text-xs pt-1 text-(--ui-text-muted)">
                    Informationen zu deiner Hochschulausbildung
                  </p>
                </div>
              </template>
              <template #default>
                <AMSPagesProfileBaseDataEducationTab />
              </template>
            </UCard>
          </div>
        </template>
      </UTabs>
    </UCard>
  </div>
</template>

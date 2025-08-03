<script setup lang="ts">
import type { DirectusUser } from '~~/types'

const route = useRoute()

const employeeId = route.params.id as string
const dataId = computed(() => `ams:employee-${employeeId}`)

const { data } = await useAsyncData<DirectusUser>(dataId, async () => {
  return (await useDirectus(readUser(employeeId))) as DirectusUser
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
      :title="`Mitarbeiter / ${getUserLabel(data)}`"
      description="Übersicht aller Mitarbeiter der ArisCorp."
    />
    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-4 w-full">
        <UCard
          variant="ams"
          class="aspect-[270/320] overflow-clip"
          :ui="{
            header: '!p-0',
            root: 'flex flex-col relative',
            body: 'flex-1 !p-0',
          }"
        >
          <NuxtImg
            :src="getAssetId(data.avatar)"
            class="w-full h-full rounded object-cover group-hover:scale-105 transition-transform duration-300 not-prose"
          />
        </UCard>
      </div>
      <div class="col-span-8">
        <UCard variant="ams">
          <template #header>
            <div class="flex items-center justify-between ams-card-title">
              <h2>test</h2>
            </div>
          </template>
          <template #default> test </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

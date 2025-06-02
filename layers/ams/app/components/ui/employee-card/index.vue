<script setup lang="ts">
import type { DirectusUser } from '~~/types'

const props = defineProps<{ data: DirectusUser }>()

const memberSinceDate = computed(() => {
  if (!props.data.date_created) return 'N/A'
  const date = new Date(props.data.date_created)
  date.setFullYear(date.getFullYear() + 930)
  // Format to yyyy-mm-dd
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
})
</script>

<template>
  <NuxtLink :to="`/users/${data.id}`" class="">
    <UCard
      variant="ams"
      class="overflow-clip hover:scale-[1.02] duration-300 transition-transform ease-out group"
      :ui="{
        header: '!p-0',
        root: 'flex flex-col relative',
        body: 'flex-1 !p-0',
      }"
    >
      <template #default>
        <div class="flex flex-col space-y-1.5 relative p-0 not-prose">
          <div class="relative w-full aspect-[270/320] overflow-hidden">
            <NuxtImg
              :src="getAssetId(data.avatar)"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 not-prose"
            />
            <!-- <div
              class="absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-white shadow-lg bg-gray-500"
            ></div> -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            ></div>
            <div class="absolute bottom-0 left-0 right-0 p-3 text-white">
              <h3
                class="text-lg font-bold text-white group-hover:text-ariscorp-cyan transition-colors"
              >
                {{ getUserLabel(data) }}
              </h3>
              <!-- <p class="text-sm font-medium text-ariscorp-orange">Commander</p> -->
              <UBadge
                v-if="data.head_of_department"
                variant="outline"
                label="Abteilungsleiter"
              />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex items-center justify-between not-prose">
          <div>
            <p class="text-sm text-muted-foreground">
              {{ data.role?.label }}
            </p>
            <p class="text-[.6rem] text-muted-foreground mt-1">
              Mitglied seit {{ memberSinceDate }}
            </p>
          </div>
          <UTooltip
            v-if="!data.head_of_department && data.department"
            :text="`Abteilung: ${data?.primary_department?.name}`"
          >
            <NuxtImg
              :src="getAssetId(data.primary_department?.logo)"
              class="size-12 rounded-full"
            />
          </UTooltip>
          <UTooltip
            v-else-if="data.leading_department"
            :text="`Abteilungsleiter: ${data?.leading_department?.name}`"
          >
            <NuxtImg
              :src="getAssetId(data.leading_department?.logo)"
              class="size-12 animate-pulse-glow rounded-full"
            />
          </UTooltip>
        </div>
      </template>
    </UCard>
  </NuxtLink>
</template>

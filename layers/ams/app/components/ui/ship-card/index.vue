<script setup lang="ts">
import { computed, ref } from 'vue' // computed und ref importieren
import type { Ship, UserHangar } from '~~/types' // Pfad anpassen, falls nötig

type ShipProps = {
  mode: 'ship'
  data: Ship
  fleetMode: boolean
}

type HangarItemProps = {
  mode: 'hangar-item'
  data: UserHangar
  fleetMode: boolean
}

type ShipCardProps = ShipProps | HangarItemProps

const props = defineProps<ShipCardProps>()

const ship = computed<Ship>(() => {
  if (props.mode === 'ship') {
    return props.data
  }

  return props.data.ship_id as Ship
})

const hangarItem = computed<UserHangar | null>(() => {
  return props.mode === 'hangar-item' ? props.data : null
})
</script>

<template>
  <UCard
    variant="ams"
    class="hover:scale-[1.02] overflow-clip duration-300 translation-all ease-out group"
    :ui="{ header: '!p-0', root: 'flex flex-col', body: 'flex-1' }"
  >
    <template #header>
      <div class="relative aspect-[21/9] overflow-hidden">
        <div
          class="absolute inset-0 bg-gradient-to-t from-(--ui-bg-muted) to-transparent opacity-60 z-10 group-hover:translate-y-[100%] transition-all duration-300"
        />
        <NuxtImg
          :src="getAssetId(ship.store_image)"
          class="h-full not-prose w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <!-- <div class="absolute bottom-3 left-3 flex items-center space-x-2 z-20">
          <div
            class="flex items-center rounded-full bg-(--ui-bg-muted)/80 px-2 py-1 text-xs text-green-400 transition-all duration-300 group-hover:bg-(--ui-bg-muted)/90"
          >
            <UIcon name="i-lucide-shield-check" class="mr-1 h-3 w-3" />
            Operational
          </div>
        </div> -->
      </div>
    </template>
    <template #default>
      <div class="flex justify-between">
        <div>
          <NuxtLink :to="`/ships/${ship.slug}`" class="not-prose">
            <h3
              class="text-lg font-semibold text-white group-hover:text-shadow-primary group-hover:text-shadow-xs transition-all duration-300 hover:text-xl group-hover:text-(--ui-primary) !my-0"
            >
              {{ ship.name }}
            </h3>
          </NuxtLink>
          <p class="text-sm text-(--ui-text-muted) !my-0">
            {{ getMainFocusLabel(ship.focuses) }}
          </p>
        </div>
        <UTooltip
          v-if="mode === 'hangar-item' && fleetMode && hangarItem?.department"
          :text="`Abteilung: ${hangarItem?.department?.name}`"
        >
          <NuxtImg
            :src="getAssetId(hangarItem?.department?.logo)"
            class="size-12 !my-0"
          />
        </UTooltip>
      </div>
      <USeparator color="ams" class="my-2" />
      <div class="flex justify-between">
        <h3
          v-if="mode === 'hangar-item' && hangarItem?.name"
          class="text-lg italic font-semibold text-(--ui-primary) transition-colors duration-300 group-hover:text-(--ui-primary)/60 !my-0"
        >
          " {{ hangarItem.name }} "
        </h3>
        <UTooltip
          v-if="mode === 'hangar-item' && fleetMode"
          :text="`Besitzer: ${getUserLabel(hangarItem?.user_id)}`"
        >
          <NuxtImg
            :src="getAssetId(hangarItem?.user_id?.avatar)"
            class="w-12 h-auto aspect-[270/320] !my-0 ml-auto rounded"
          />
        </UTooltip>
      </div>
      <div v-if="false" class="mt-4 space-y-3 animate-fadeIn prose-p:my-0">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="text-(--ui-primary)">Manufacturer</p>
            <p class="text-white">{{ ship.manufacturer }}</p>
          </div>
          <div>
            <p class="text-(--ui-primary)">Crew Size</p>
            <p class="text-white">{{ ship.crew_min }}-{{ ship.crew_max }}</p>
          </div>
        </div>
        <div>
          <p class="text-(--ui-primary) text-sm">Specifications</p>
          <div class="grid grid-cols-3 gap-2 mt-1 text-xs">
            <div class="bg-(--ui-bg-muted)/60 rounded p-1 text-center">
              <p class="text-white">Length</p>
              <p class="text-(--ui-primary) font-mono">{{ ship.length }}m</p>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full gap-x-2">
        <AMSPagesHangarShipEdit v-if="hangarItem" :item="hangarItem">
          <template #default="{ open }">
            <UButton
              @click="open"
              variant="outline"
              label="Schiff bearbeiten"
              class="flex-1 justify-center"
            />
          </template>
        </AMSPagesHangarShipEdit>
        <UButton
          v-if="hangarItem"
          @click="removeHangarItem(hangarItem.id)"
          variant="outline"
          color="error"
          icon="i-lucide-trash-2"
          class="w-fit"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { DirectusUser, Ship, ShipModule, UserHangar } from '~~/types' // Pfad anpassen, falls nötig

const authStore = useAuthStore()

const expanded = ref(false)

type ShipProps = {
  mode: 'ship'
  data: Ship
  fleetMode: boolean
  forceExpanded: boolean
}

type HangarItemProps = {
  mode: 'hangar-item'
  data: UserHangar
  fleetMode: boolean
  forceExpanded: boolean
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

const editMode = computed<boolean>(() => {
  if (props.mode === 'ship') return false

  if (!props.fleetMode) return true

  if (authStore.currentUserAL >= 5) return true

  if (authStore.currentUserId === props.data.user_id?.id) return true

  return false
})
</script>

<template>
  <UCard
    variant="ams"
    class="overflow-clip hover:scale-[1.02] duration-300 transition-transform ease-out group"
    :class="[expanded || forceExpanded ? 'col-span-2 mr-6' : '']"
    :ui="{
      header: '!p-0 relative',
      root: 'flex flex-col relative',
      body: 'flex-1 !py-0',
    }"
  >
    <template #header>
      <div
        :class="[
          expanded || forceExpanded
            ? 'w-1/2 border-r border-r-(--ui-primary)/20'
            : '',
        ]"
        class="relative aspect-[21/9] overflow-hidden !mb-0"
      >
        <UButton
          v-if="!forceExpanded"
          icon="i-lucide-chevron-right"
          variant="subtle"
          @click="expanded = !expanded"
          class="absolute right-1 top-1 z-20"
          :class="[expanded || forceExpanded ? 'rotate-180' : 'rotate-0']"
        />
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
      <div
        v-if="expanded || forceExpanded"
        class="text-xs pl-2 w-1/2 prose-p:m-0 absolute right-0 top-0 h-full"
      >
        <h4 class="text-(--ui-primary) font-semibold">Schiffsdetails</h4>
        <div class="grid grid-cols-2 gap-y-2">
          <div>
            <p class="text-(--ui-text-muted)">Schiffsname</p>
            <p class="font-normal text-white">
              {{ hangarItem.name ? hangarItem.name : 'N/A' }}
            </p>
          </div>
          <div>
            <p class="text-(--ui-text-muted)">Kaufstatus</p>
            <p class="font-normal text-white">
              {{ getBuyStatusLabel(hangarItem.buy_status) ?? 'N/A' }}
            </p>
          </div>
          <div v-if="hangarItem.active_module">
            <p class="text-(--ui-text-muted)">Aktives Modul</p>
            <UBadge
              :label="(hangarItem.active_module as ShipModule)?.name"
              variant="subtle"
              class="mr-2"
            />
          </div>
        </div>
        <h4 class="text-(--ui-primary) font-medium mt-2">Spezifikationen</h4>
        <div class="grid grid-cols-2 gap-y-2">
          <div class="w-1/2">
            <p class="text-(--ui-text-muted)">Hersteller</p>
            <UButton
              variant="link"
              color="neutral"
              :to="`/verseexkurs/companies/${ship?.manufacturer?.slug}`"
              class="p-0 font-normal text-white"
            >
              <p class="text-xs">
                {{
                  ship?.manufacturer?.name
                    ? getCompanyCode(ship?.manufacturer)?.split(' ')[0]
                    : 'N/A'
                }}
              </p>
            </UButton>
          </div>
          <div class="w-1/2">
            <p class="text-(--ui-text-muted)">Crew</p>
            <p class="p-0 font-normal text-white">
              {{ ship?.crew_min ?? 'N/A' }}
              -
              {{ ship?.crew_max ?? 'N/A' }}
            </p>
          </div>
          <div class="w-1/2">
            <p class="text-(--ui-text-muted)">Länge</p>
            <p class="p-0 font-normal text-white">
              {{ ship?.length ? ship?.length + 'm' : 'N/A' }}
            </p>
          </div>
          <div class="w-1/2">
            <p class="text-(--ui-text-muted)">Breite</p>
            <p class="p-0 font-normal text-white">
              {{ ship?.beam ? ship?.beam + 'm' : 'N/A' }}
            </p>
          </div>
          <div class="w-1/2">
            <p class="text-(--ui-text-muted)">Höhe</p>
            <p class="p-0 font-normal text-white">
              {{ ship?.height ? ship?.height + 'm' : 'N/A' }}
            </p>
          </div>
          <div class="w-1/2">
            <p class="text-(--ui-text-muted)">Gewicht</p>
            <p class="p-0 font-normal text-white">
              {{
                ship?.mass
                  ? formatCurrency(ship?.mass / 1000) + ' Tonnen'
                  : 'N/A'
              }}
            </p>
          </div>
        </div>
      </div>
    </template>
    <template #default>
      <div
        :class="[
          expanded || forceExpanded
            ? 'w-1/2 pr-6 border-r border-r-(--ui-primary)/20'
            : '',
        ]"
        class="py-4"
      >
        <div class="flex justify-between">
          <div>
            <NuxtLink :to="`/ships/${ship.slug}`" class="not-prose">
              <h3
                class="text-lg w-fit font-semibold text-white group-hover:text-shadow-primary group-hover:text-shadow-xs transition-all duration-300 hover:text-xl group-hover:text-(--ui-primary) !my-0"
              >
                {{ ship.name }}
              </h3>
            </NuxtLink>
            <p class="text-sm text-(--ui-text-muted) !my-0">
              {{ getMainFocusLabel(ship.focuses) }}
            </p>
          </div>
          <UTooltip
            v-if="mode === 'hangar-item' && hangarItem?.department"
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
          <div>
            <h3
              v-if="mode === 'hangar-item' && hangarItem?.name"
              class="text-lg italic font-semibold text-(--ui-primary) transition-colors duration-300 group-hover:text-(--ui-primary)/60 !my-0"
            >
              " {{ hangarItem.name }} "
            </h3>
            <h3
              v-else
              class="text-lg italic font-semibold text-(--ui-text-muted) transition-colors duration-300 !my-0"
              aria-hidden="true"
            />
            <h3
              v-if="mode === 'hangar-item' && hangarItem?.buy_status"
              class="text-sm italic font-semibold text-(--ui-text-toned) transition-colors duration-300 group-hover:text-(--ui-text-dimmed) block !my-0"
            >
              {{ getBuyStatusLabel(hangarItem.buy_status) }}
            </h3>
          </div>
          <UTooltip
            v-if="mode === 'hangar-item' && fleetMode"
            :text="`Besitzer: ${getUserLabel(hangarItem?.user_id as DirectusUser)}`"
          >
            <NuxtImg
              :src="getAssetId(hangarItem?.user_id?.avatar)"
              class="w-12 h-auto aspect-[270/320] !my-0 ml-auto rounded"
            />
          </UTooltip>
        </div>
      </div>
    </template>
    <template v-if="editMode" #footer>
      <div class="flex w-full gap-x-2">
        <AMSPagesHangarShipEdit
          v-if="hangarItem"
          :item="hangarItem"
          :fleet-mode="fleetMode"
        >
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
          @click="removeHangarItem(hangarItem.id, fleetMode)"
          variant="outline"
          color="error"
          icon="i-lucide-trash-2"
          class="w-fit"
        />
      </div>
    </template>
  </UCard>
</template>

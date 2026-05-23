<script setup lang="ts">
import type {
  Company,
  ShipHull,
  ShipModule,
  ShipModuleSlot,
  ShipModulesGallery,
  ShipVariant,
  UserHangar,
} from '~~/types'

const props = defineProps<{ item: UserHangar; fleetMode: boolean }>()
const emit = defineEmits(['updated'])

const store = useHangarItemEditStore()
const authStore = useAuthStore()
const { formData } = storeToRefs(store)
const { currentUserId: userId } = storeToRefs(authStore)

const editSlideoverOpen = ref<boolean>(false)

const ship = computed<ShipVariant>(() => {
  return props.item.ship as ShipVariant
})

const shipHull = computed<ShipHull | undefined>(() => {
  const hull = (props.item.ship as ShipVariant)?.hull
  return typeof hull === 'object' ? (hull as ShipHull) : undefined
})

function handleEditOpen() {
  if (props.item) {
    slotsWithModules.value = []
    store.initForm(props.item)
    editSlideoverOpen.value = true
    fetchCompatibleModules()
  }
}

// TODO: Logik für handleEditSubmit implementieren
async function handleEditSubmit() {
  editSlideoverOpen.value = false

  await setTimeout(async () => {
    const ok = await store.submitHangarItem()

    const { refresh: refreshHangar } = await useFetchAMSHangar(userId)
    const { refresh: refreshFleet } = await useFetchAMSFleet()

    if (props.fleetMode) refreshFleet()
    else refreshHangar()

    if (ok) emit('updated')
  }, 300)
}

// Duplicate name check (orga-wide)
type NameConflictStatus = 'none' | 'other_model' | 'same_model'
const nameConflictStatus = ref<NameConflictStatus>('none')
const checkingName = ref(false)

async function checkNameConflict(name: string) {
  if (!name || !name.trim()) {
    nameConflictStatus.value = 'none'
    return
  }
  try {
    checkingName.value = true
    const results = (await useDirectus(
      readItems('user_hangars', {
        filter: {
          name: { _eq: name.trim() },
          deleted: { _eq: false },
          id: { _neq: props.item.id as any },
        },
        limit: -1,
        fields: ['id', 'ship.id', 'ship.hull.id'],
      })
    )) as UserHangar[]

    if (!results || results.length === 0) {
      nameConflictStatus.value = 'none'
      return
    }

    const currentHull = (props.item.ship as ShipVariant)?.hull
    const currentHullId = typeof currentHull === 'object' ? currentHull?.id : currentHull
    const sameModel = results.some((r: any) => {
      const hullId = r.ship?.hull?.id ?? r.ship?.hull
      return currentHullId && hullId && String(hullId) === String(currentHullId)
    })
    nameConflictStatus.value = sameModel ? 'same_model' : 'other_model'
  } catch (e) {
    // Fail open (no block)
    nameConflictStatus.value = 'none'
    console.error('Fehler bei Namensprüfung:', e)
  } finally {
    checkingName.value = false
  }
}

watch(
  () => formData.value.name,
  (val) => {
    if (!editSlideoverOpen.value) return
    checkNameConflict(String(val || ''))
  },
  { immediate: true }
)

const { data: departments } = useNuxtData('global:simple_departments')

const slotsWithModules = ref<ShipModuleSlot[]>([])

const moduleSlots = computed<ShipModuleSlot[]>(() =>
  slotsWithModules.value.length
    ? slotsWithModules.value
    : ((ship.value.module_slots as ShipModuleSlot[] | undefined)?.slice().sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)) ?? [])
)
const hasModuleSlots = computed(() =>
  ((ship.value.module_slots as ShipModuleSlot[] | undefined)?.length ?? 0) > 0
)

async function fetchCompatibleModules() {
  const slotIds = (ship.value.module_slots as ShipModuleSlot[] | undefined)?.map(s => s.id) ?? []
  if (!slotIds.length) return

  try {
    const junctionRows = await useDirectus(
      readItems('ship_module_slot_compatible_modules', {
        filter: { slot: { _in: slotIds } },
        fields: [
          'slot',
          { module: ['id', 'name', { gallery: ['directus_file_id', 'sort'] }, { manufacturer: ['name', 'code'] }] },
        ],
        limit: -1,
      })
    )

    const baseSlots = (ship.value.module_slots as ShipModuleSlot[])
      ?.slice()
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)) ?? []

    slotsWithModules.value = baseSlots.map(slot => ({
      ...slot,
      compatible_modules: junctionRows
        .filter((r: any) => (typeof r.slot === 'object' ? r.slot?.id : r.slot) === slot.id)
        .map((r: any) => r.module as ShipModule),
    }))
  } catch (e) {
    console.warn('Kompatible Module konnten nicht geladen werden (ggf. fehlende Permissions):', e)
  }
}

function getSlotModule(slotId: string): string | null {
  return formData.value.modules?.find(m => m.slot === slotId)?.module ?? null
}

function setSlotModule(slotId: string, moduleId: string | null) {
  const without = (formData.value.modules ?? []).filter(m => m.slot !== slotId)
  formData.value.modules = moduleId ? [...without, { slot: slotId, module: moduleId }] : without
}
</script>

<template>
  <USlideover
    v-model:open="editSlideoverOpen"
    :ui="{
      header: '!p-0',
      content: 'max-w-2xl ring-(--ui-primary)/10 divide-(--ui-primary)/10',
    }"
  >
    <template #default>
      <slot :open="handleEditOpen" />
    </template>
    <template #header>
      <div class="relative aspect-[26/9] overflow-hidden">
        <NuxtImg
          :src="getAssetId(ship.thumbnail)"
          class="h-full not-prose w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </template>
    <template #body>
      <!-- TODO: Add Form Details -->
      <div>
        <div class="space-y-4">
          <UCard variant="ams" class="!shadow-none" :ui="{ body: '!pt-0' }">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0 text-(--ui-primary)">
                <h4>Basis Informationen</h4>
              </div>
            </template>
            <template #default>
              <div class="grid grid-cols-1 gap-4">
                <UFormField size="sm" label="Schiffsname">
                  <UInput
                    v-model="formData.name"
                    highlight
                    variant="outline"
                    placeholder="z.B. Aris ONE"
                    size="md"
                    class="w-full"
                  />
                </UFormField>
                <UAlert
                  v-if="nameConflictStatus === 'other_model'"
                  color="warning"
                  variant="subtle"
                  title="Name bereits vergeben"
                  :description="'Dieser Name wird bereits für ein anderes Schiffsmodell in der Orga verwendet. Du kannst ihn trotzdem nutzen.'"
                  icon="i-lucide-alert-triangle"
                />
                <UAlert
                  v-if="nameConflictStatus === 'same_model'"
                  color="error"
                  variant="subtle"
                  title="Konflikt: Name mit gleichem Modell vorhanden"
                  :description="'Für dieses Schiffsmodell existiert der Name bereits in der Orga. Bitte wähle einen anderen Namen.'"
                  icon="i-lucide-x-circle"
                />
                <UFormField size="sm" label="Seriennummer">
                  <UInput
                    v-model="formData.serial"
                    highlight
                    variant="outline"
                    placeholder=""
                    size="md"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </template>
          </UCard>
          <UCard variant="ams" class="!shadow-none" :ui="{ body: '!pt-0' }">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0 text-(--ui-primary)">
                <h4>Zuordnung & Sichtbarkeit</h4>
              </div>
            </template>
            <template #default>
              <div class="grid grid-cols-1 gap-4">
                <UFormField size="sm" label="Zuordnung">
                  <URadioGroup
                    v-model="formData.group"
                    variant="card"
                    size="md"
                    class="w-full"
                    value-key="key"
                    :items="[
                      {
                        key: 'ariscorp',
                        label: 'ArisCorp',
                        icon: 'i-lucide-ship',
                      },
                      {
                        key: 'private',
                        label: 'Privat',
                        icon: 'i-lucide-lock',
                      },
                    ]"
                  >
                    <template #label="{ item }">
                      <span class="flex items-center space-x-2">
                        <UIcon :name="item.icon" class="size-4" />
                        <span>{{ item.label }}</span>
                      </span>
                    </template>
                  </URadioGroup>
                </UFormField>
                <UFormField
                  v-show="formData.group === 'ariscorp'"
                  size="sm"
                  label="Abteilung"
                >
                  <div class="w-full h-fit flex gap-x-2">
                    <UButton
                      v-if="formData.department"
                      @click="formData.department = null"
                      icon="i-lucide-x"
                      variant="subtle"
                      size="lg"
                    />
                    <USelectMenu
                      v-model="formData.department"
                      :items="departments"
                      variant="ams"
                      value-key="id"
                      label-key="name"
                      class="flex-1"
                      size="lg"
                    />
                  </div>
                </UFormField>
                <UFormField size="sm" label="Sichtbarkeit">
                  <URadioGroup
                    v-model="formData.visibility"
                    variant="card"
                    size="md"
                    class="w-full"
                    value-key="key"
                    :items="[
                      {
                        key: 'public',
                        label: 'Öffentlich',
                        icon: 'i-lucide-eye',
                      },
                      {
                        key: 'internal',
                        label: 'Intern',
                        icon: 'i-lucide-shield',
                      },
                      {
                        key: 'hidden',
                        label: 'Privat',
                        icon: 'i-lucide-eye-off',
                      },
                    ]"
                  >
                    <template #label="{ item }">
                      <span class="flex items-center space-x-2">
                        <UIcon :name="item.icon" class="size-4" />
                        <span>{{ item.label }}</span>
                      </span>
                    </template>
                  </URadioGroup>
                </UFormField>
              </div>
            </template>
          </UCard>
          <UCard variant="ams" class="!shadow-none" :ui="{ body: '!pt-0' }">
            <template #header>
              <div class="prose-h4:my-0 prose-p:my-0 text-(--ui-primary)">
                <h4>Kaufinformationen</h4>
              </div>
            </template>
            <template #default>
              <div class="grid grid-cols-1 gap-4">
                <UFormField size="sm" label="Kaufstatus">
                  <URadioGroup
                    v-model="formData.buy_status"
                    variant="card"
                    size="md"
                    class="w-full"
                    value-key="key"
                    :items="[
                      {
                        key: 'pledged',
                        label: 'Gepledged',
                        icon: 'i-lucide-dollar-sign',
                        description:
                          'Schiff wurde im pledge-store mit echtgeld gekauft.',
                      },
                      {
                        key: 'in_game',
                        label: 'In-Game',
                        icon: 'i-lucide-currency',
                        description:
                          'Schiff wurde im in-game mit aUEC gekauft.',
                      },
                      {
                        key: 'planned',
                        label: 'Geplant',
                        icon: 'i-lucide-notebook-text',
                        description: 'Schiff befindet sich vorerst in planung.',
                      },
                    ]"
                  >
                    <template #label="{ item }">
                      <span class="flex items-center space-x-2">
                        <UIcon :name="item.icon" class="size-4" />
                        <span>{{ item.label }}</span>
                      </span>
                    </template>
                  </URadioGroup>
                </UFormField>
              </div>
            </template>
          </UCard>
          <UCard
            variant="ams"
            class="!shadow-none group"
            :data-disabled="!hasModuleSlots"
            :ui="{ body: '!pt-0' }"
          >
            <template #header>
              <div
                class="prose-h4:my-0 prose-p:my-0 text-(--ui-primary) group-data-[disabled=true]:pb-3 group-data-[disabled=true]:text-(--ui-text)/60"
              >
                <h4>Modulare Schiffe</h4>
              </div>
            </template>
            <template v-if="hasModuleSlots" #default>
              <div class="grid grid-cols-1 gap-6">
                <div v-for="slot in moduleSlots" :key="slot.id">
                  <p class="text-sm font-medium mb-2">{{ slot.name }}</p>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      @click="setSlotModule(slot.id, null)"
                      class="flex text-left w-full p-3 hover:cursor-pointer text-xs rounded-md items-center gap-3 ring transition-all duration-300"
                      :class="[
                        getSlotModule(slot.id) === null
                          ? 'ring-(--ui-primary)'
                          : 'ring-(--ui-bg-accented) hover:ring-(--ui-primary)/50',
                      ]"
                    >
                      <div class="size-12 rounded-md bg-(--ui-bg-accented) flex items-center justify-center shrink-0">
                        <UIcon name="i-lucide-minus" class="size-5 text-(--ui-text-muted)" />
                      </div>
                      <span class="text-(--ui-text-muted)">Kein Modul</span>
                    </button>
                    <button
                      v-for="module in (slot.compatible_modules as ShipModule[])"
                      :key="module.id"
                      @click="setSlotModule(slot.id, module.id)"
                      class="flex text-left w-full p-3 hover:cursor-pointer text-xs rounded-md items-center gap-3 ring transition-all duration-300"
                      :class="[
                        getSlotModule(slot.id) === module.id
                          ? 'ring-(--ui-primary)'
                          : 'ring-(--ui-bg-accented) hover:ring-(--ui-primary)/50',
                      ]"
                    >
                      <NuxtImg
                        :src="getAssetId((module.gallery?.[0] as ShipModulesGallery)?.directus_file_id)"
                        class="size-12 object-cover rounded-md shrink-0"
                      />
                      <div class="flex-1 min-w-0">
                        <strong class="pb-0.5 block truncate">{{ module.name }}</strong>
                        <p class="!m-0 text-(--ui-text-muted) text-[.6rem]">
                          {{ module.manufacturer ? getCompanyCode(module.manufacturer as Company) : '' }}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </UCard>
          <!-- TODO IMPLEMENT PAINTS -->
          <UCard
            variant="ams"
            v-if="false"
            class="!shadow-none group"
            :ui="{ body: '!pt-0' }"
          >
            <template #header>
              <div
                class="prose-h4:my-0 prose-p:my-0 text-(--ui-primary) group-data-[disabled=true]:pb-3 group-data-[disabled=true]:text-(--ui-text)/60"
              >
                <h4>Paint</h4>
              </div>
            </template>
            <template #default>
              <div class="grid grid-cols-1 gap-4">
                <UFormField size="sm" label="Aktive Lackierung">
                  <div
                    class="flex w-full p-3 text-sm rounded-md items-center gap-4 ring ring-(--ui-primary)"
                  >
                    <NuxtImg
                      src="https://star-hangar.com/media/catalog/product/cache/1c6b3665116ed742072997bd2095a829/r/s/rsi_galaxy_piece_09_16x9.jpg"
                      class="size-12 object-cover rounded-md"
                    />
                    <div class="flex-1">
                      <strong class="block">Invictus Paint</strong>
                    </div>
                  </div>
                  <div
                    class="flex w-full mt-4 text-sm rounded-md items-center gap-4 ring ring-(--ui-primary)"
                  >
                    <NuxtImg
                      src="https://star-hangar.com/media/catalog/product/cache/1c6b3665116ed742072997bd2095a829/r/s/rsi_galaxy_piece_09_16x9.jpg"
                      class="size-20 object-cover rounded-l-md"
                    />
                    <div class="flex-1 p-3">
                      <strong class="block">Invictus Paint</strong>
                    </div>
                  </div>
                  <USeparator
                    variant="ams"
                    color="ams"
                    class="my-4"
                    label="Andere Paints"
                  />
                  <div class="flex p-px overflow-x-scroll pb-2 gap-2">
                    <div
                      class="flex flex-col hover:cursor-pointer min-w-28 max-w-28 h-36 text-sm rounded-md items-center ring ring-(--ui-bg-accented) transition-all duration-300 hover:ring-(--ui-primary)/50"
                    >
                      <NuxtImg
                        src="https://star-hangar.com/media/catalog/product/cache/1c6b3665116ed742072997bd2095a829/r/s/rsi_galaxy_piece_09_16x9.jpg"
                        class="h-28 w-full object-cover rounded-t-md"
                      />
                      <div class="flex-1 items-center flex">
                        <span class="block">Invictus Paint</span>
                      </div>
                    </div>
                  </div>
                </UFormField>
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <UButton
          @click="editSlideoverOpen = false"
          label="Schließen"
          variant="outline"
          color="error"
          size="lg"
          class="w-full justify-center"
        />
        <UButton
          @click="handleEditSubmit"
          label="Speichern"
          variant="outline"
          color="success"
          size="lg"
          class="w-full justify-center"
          :disabled="nameConflictStatus === 'same_model'"
        />
      </div>
    </template>
  </USlideover>
</template>

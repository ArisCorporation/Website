<script setup lang="ts">
import type { Company, ShipHull, ShipVariant, UserHangar } from '~~/types'

interface addItem {
  ship?: string
  name: string // Custom name for the ship in the hangar
  buy_status: 'pledged' | 'in_game' | 'planned'
  group: 'ariscorp' | 'private'
  visibility: 'public' | 'internal' | 'hidden'
}

const emit = defineEmits(['added'])

const store = useAuthStore()
const { currentUserId } = storeToRefs(store)

const props = withDefaults(defineProps<{ userId?: string | number }>(), {})
const targetUserId = computed(() => props.userId ?? currentUserId.value)

const isOpen = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const isDisabled = ref<boolean>(false)

const initialShipState = (): addItem => ({
  ship: undefined,
  name: '',
  buy_status: 'pledged',
  group: 'ariscorp',
  visibility: 'public',
})

const BUY_STATUS_ITEMS: Array<{
  label: string
  value: addItem['buy_status']
  icon: string
}> = [
  {
    label: 'Gepledged',
    value: 'pledged',
    icon: 'i-lucide-dollar-sign',
  },
  {
    label: 'In-Game',
    value: 'in_game',
    icon: 'i-lucide-currency',
  },
  {
    label: 'Geplant',
    value: 'planned',
    icon: 'i-lucide-notebook-text',
  },
]

const ships = ref<addItem[]>([initialShipState()])

// Name conflict checking per item
type NameConflictStatus = 'none' | 'other_model' | 'same_model'
const nameConflictStatuses = ref<NameConflictStatus[]>(['none'])

function ensureStatusSize() {
  while (nameConflictStatuses.value.length < ships.value.length)
    nameConflictStatuses.value.push('none')
  while (nameConflictStatuses.value.length > ships.value.length)
    nameConflictStatuses.value.pop()
}

watch(
  () => ships.value.length,
  () => ensureStatusSize()
)

async function checkItemNameConflict(index: number) {
  const item = ships.value[index]
  if (!item) return
  const n = (item.name || '').trim()
  // Only check for orga ships
  if (!n || item.group !== 'ariscorp') {
    nameConflictStatuses.value[index] = 'none'
    return
  }
  try {
    const results = (await useDirectus(
      readItems('user_hangars', {
        filter: {
          name: { _eq: n },
          deleted: { _eq: false },
          group: { _eq: 'ariscorp' },
        },
        fields: ['id', { ship: ['id'] }],
        limit: 5,
      })
    )) as UserHangar[]
    if (!results?.length) {
      nameConflictStatuses.value[index] = 'none'
      return
    }
    const sameModel = results.some((r: any) => {
      const s = r.ship as any
      const sid = typeof s === 'string' ? s : s?.id
      return item.ship && String(sid) === String(item.ship)
    })
    nameConflictStatuses.value[index] = sameModel ? 'same_model' : 'other_model'
  } catch (e) {
    console.error('Fehler bei Namensprüfung (add):', e)
    nameConflictStatuses.value[index] = 'none'
  }
}

watch(
  () => ships.value.map((s) => `${s.group}|${s.name}|${s.ship}`).join('||'),
  async () => {
    ensureStatusSize()
    await Promise.all(ships.value.map((_, i) => checkItemNameConflict(i)))
  },
  { immediate: true }
)

const hasBlockingNameConflict = computed(() =>
  nameConflictStatuses.value.some(
    (st, i) => st === 'same_model' && ships.value[i]?.group === 'ariscorp'
  )
)

const { data: shipList } = await useAsyncData('ams:add-modal-ships', () =>
  useDirectus(
    readItems('ship_variants', {
      fields: [
        'id',
        'name',
        'variant_code',
        'stats',
        { thumbnail: ['id'] },
        {
          hull: [
            'id',
            'name',
            'slug',
            { manufacturer: ['id', 'name', 'code'] },
          ],
        },
      ],
      sort: ['name'],
      limit: -1,
    })
  )
)

function getShip(item: addItem): ShipVariant | undefined {
  if (!shipList.value || !item.ship) {
    return undefined
  }
  return shipList.value.find((ship) => ship.id === item.ship) as ShipVariant
}

function getShipHull(item: addItem): ShipHull | undefined {
  const variant = getShip(item)
  return typeof variant?.hull === 'object' ? (variant.hull as ShipHull) : undefined
}

const canSubmit = computed(() => {
  if (ships.value.length === 0) return false
  // Ensure every ship entry has a model selected
  return ships.value.every((ship) => !!ship.ship)
})

function openSlideover() {
  // Reset to a single empty ship when opening, if it's empty or for a fresh start
  if (
    ships.value.length === 0 ||
    ships.value.every((s) => !s.ship && !s.name)
  ) {
    ships.value = [initialShipState()]
  }
  isOpen.value = true
}

function closeSlideover() {
  isOpen.value = false
  // Optionally reset the form fully when closing, or leave as is for re-opening
  // For this example, let's reset to the initial state for next use.
  ships.value = [initialShipState()]
}

function removeShipAt(index: number) {
  ships.value.splice(index, 1)
  nameConflictStatuses.value.splice(index, 1)
}

async function handleSubmit() {
  // if (!canSubmit.value) {
  //   // Optionally show a notification to the user
  //   console.warn('Submission prevented: Not all ship models are selected.')
  //   return
  // }

  isLoading.value = true
  try {
    // Ensure the payload matches UserHangar[] structure.
    // If addItem is not directly UserHangar, map it here.
    // For example, filter out ships with no ship if backend doesn't allow it,
    // though `canSubmit` should prevent this.
    const payload = ships.value
      .filter((ship) => !!ship.ship)
      .map((ship) =>
        ship.ship
          ? {
              ship: ship.ship,
              name: ship.name,
              buy_status: ship.buy_status,
              group: ship.group,
              visibility: ship.visibility,
              user: targetUserId.value,
            }
          : null
      )
      .filter(Boolean)

    await useDirectus(createItems('user_hangars', payload as UserHangar[])) // Assuming UserHangar is compatible
    emit('added') // Notify parent to refresh data
    closeSlideover()
  } catch (error) {
    console.error('Failed to add ships:', error)
    // TODO: Show user-friendly error notification (e.g., using UToast)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <USlideover
    v-model:open="isOpen"
    :ui="{
      content: 'max-w-xl ring-(--ui-primary)/10 divide-(--ui-primary)/10',
    }"
  >
    <template #default>
      <slot :openSlideover="openSlideover" />
    </template>
    <template #header>
      <h3 class="!my-0">Schiffe hinzufügen</h3>
    </template>
    <template #body>
      <!-- <UInput
            highlight
            variant="outline"
            icon="i-lucide-search"
            placeholder="Hersteller, Modell"
            size="lg"
            class="w-full mb-6"
          />
          <USeparator variant="ams" /> -->
      <div class="space-y-4">
        <UCard v-for="(item, index) in ships" :key="index" variant="ams">
          <div class="space-y-4">
            <div class="w-full flex justify-between">
              <p class="text-(--ui-primary)">Schiff {{ index + 1 }}</p>
              <UButton
                @click="removeShipAt(index)"
                icon="i-lucide-x"
                variant="outline"
                color="error"
              />
            </div>
            <UFormField label="Modell" required>
              <USelectMenu
                v-model="item.ship"
                variant="ams"
                :items="shipList"
                label-key="name"
                value-key="id"
                search-term=""
                class="w-full"
              />
            </UFormField>
            <UFormField label="Schiffsname" hint="Optional">
              <UInput
                v-model="item.name"
                highlight
                variant="outline"
                placeholder="Aris ONE"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Kaufstatus">
              <URadioGroup
                v-model="item.buy_status"
                indicator="hidden"
                variant="table"
                orientation="horizontal"
                size="sm"
                default-value="pledged"
                :items="BUY_STATUS_ITEMS"
                class="prose-p:my-0"
                :ui="{ item: 'p-2' }"
              >
                <template #label="{ item: buyStatusItem }">
                  <span class="flex items-center gap-2">
                    <UIcon :name="buyStatusItem.icon" class="size-4" />
                    <span>{{ buyStatusItem.label }}</span>
                  </span>
                </template>
              </URadioGroup>
            </UFormField>
            <UAlert
              v-if="
                nameConflictStatuses[index] === 'other_model' &&
                item.group === 'ariscorp' &&
                item.name
              "
              color="warning"
              variant="subtle"
              title="Name bereits vergeben"
              :description="'Dieser Name wird bereits für ein anderes Schiffsmodell in der Orga verwendet. Du kannst ihn trotzdem nutzen.'"
              icon="i-lucide-alert-triangle"
            />
            <UAlert
              v-if="
                nameConflictStatuses[index] === 'same_model' &&
                item.group === 'ariscorp' &&
                item.name
              "
              color="error"
              variant="subtle"
              title="Konflikt: Name mit gleichem Modell vorhanden"
              :description="'Für dieses Schiffsmodell existiert der Name bereits in der Orga. Bitte wähle einen anderen Namen.'"
              icon="i-lucide-x-circle"
            />
            <USeparator variant="ams" />
            <UFormField label="Zuordnung" required>
              <URadioGroup
                v-model="item.group"
                indicator="hidden"
                variant="table"
                orientation="horizontal"
                size="sm"
                default-value="ariscorp"
                :items="[
                  { label: 'ArisCorp', value: 'ariscorp' },
                  { label: 'Privat', value: 'private' },
                ]"
                class="prose-p:my-0"
                :ui="{ item: 'p-2' }"
              />
            </UFormField>
            <UFormField label="Sichtbarkeit">
              <URadioGroup
                v-model="item.visibility"
                indicator="hidden"
                variant="table"
                orientation="horizontal"
                size="sm"
                default-value="public"
                :items="[
                  { label: 'Öffentlich', value: 'public' },
                  { label: 'Intern', value: 'internal' },
                  { label: 'Privat', value: 'hidden' },
                ]"
                class="prose-p:my-0"
                :ui="{ item: 'p-2' }"
              />
            </UFormField>
            <div
              class="flex w-full p-3 text-sm rounded-md items-center gap-4 ring ring-(--ui-bg-accented)"
            >
              <NuxtImg
                v-if="item.ship"
                :src="getAssetId(getShip(item)?.thumbnail)"
                class="size-12 object-cover rounded-md"
              />
              <USkeleton v-else class="size-12 rounded-md" />
              <div v-if="item.ship" class="flex-1">
                <strong class="pb-1 block">{{
                  getShip(item)?.name ?? ''
                }}</strong>
                <p class="!m-0 text-(--ui-text-muted) text-xs">
                  <span
                    >{{
                      getShipHull(item) &&
                      getCompanyCode(getShipHull(item)?.manufacturer as Company)
                    }}
                    &bull;
                    {{
                      getShip(item)?.stats?.role ?? 'N/A'
                    }}</span
                  >
                </p>
              </div>
            </div>
          </div>
        </UCard>
        <UButton
          highlight
          @click="
            ships.push(initialShipState()),
              nameConflictStatuses.push('none')
          "
          variant="outline"
          label="Weiteres Schiff hinzufügen"
          icon="i-lucide-plus"
          size="lg"
          class="w-full justify-center mt-4 border-dashed !ring-none"
        />
      </div>
    </template>
    <template #footer>
      <div class="ml-auto items-center space-x-4 flex">
        <UButton @click="isOpen = false" variant="outline" label="Abbrechen" />
        <UButton
          :loading="isLoading"
          :disabled="isLoading || hasBlockingNameConflict"
          @click="handleSubmit"
          icon="i-lucide-check"
          trailing
          label="Zum Hangar hinzufügen"
        />
      </div>
    </template>
  </USlideover>
</template>

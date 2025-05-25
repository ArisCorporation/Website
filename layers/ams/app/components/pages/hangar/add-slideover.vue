<script setup lang="ts">
import type { Company, Ship, UserHangar } from '~~/types'

interface addItem {
  ship_id: string | null
  name: string // Custom name for the ship in the hangar
  group: 'ariscorp' | 'private'
  visibility: 'public' | 'internal' | 'hidden'
}

const emit = defineEmits(['added'])

const store = useAuthStore()
const { currentUserId: userId } = storeToRefs(store)

const isOpen = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const isDisabled = ref<boolean>(false)

const initialShipState = (): addItem => ({
  ship_id: null,
  name: '',
  group: 'ariscorp',
  visibility: 'public',
})

const ships = ref<addItem[]>([
  { ship_id: null, name: '', group: 'ariscorp', visibility: 'public' },
])

const { data: shipList } = await useAsyncData('ams:add-modal-ships', () =>
  useDirectus(
    readItems('ships', {
      fields: [
        'id',
        'name',
        'slug',
        'focuses',
        { store_image: ['id'] },
        { manufacturer: ['id', 'name', 'code'] },
      ],
      sort: ['name'],
      limit: -1,
    })
  )
)

function getShip(item: addItem): Ship | undefined {
  if (!shipList.value || !item.ship_id) {
    return undefined
  }
  return shipList.value.find((ship) => ship.id === item.ship_id) as Ship
}

const canSubmit = computed(() => {
  if (ships.value.length === 0) return false
  // Ensure every ship entry has a model selected
  return ships.value.every((ship) => !!ship.ship_id)
})

function openSlideover() {
  // Reset to a single empty ship when opening, if it's empty or for a fresh start
  if (
    ships.value.length === 0 ||
    ships.value.every((s) => !s.ship_id && !s.name)
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
    // For example, filter out ships with no ship_id if backend doesn't allow it,
    // though `canSubmit` should prevent this.
    const payload = ships.value
      .filter((ship) => !!ship.ship_id)
      .map((ship) =>
        ship.ship_id
          ? {
              ship_id: ship.ship_id,
              name: ship.name,
              group: ship.group,
              visibility: ship.visibility,
              user_id: userId.value,
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
                @click="ships.splice(index, 1)"
                icon="i-lucide-x"
                variant="outline"
                color="error"
              />
            </div>
            <UFormField label="Modell" required>
              <USelectMenu
                v-model="item.ship_id"
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
                v-if="item.ship_id"
                :src="getAssetId(getShip(item)?.store_image)"
                class="size-12 object-cover rounded-md"
              />
              <USkeleton v-else class="size-12 rounded-md" />
              <div v-if="item.ship_id" class="flex-1">
                <strong class="pb-1 block">{{ item.name ?? '' }}</strong>
                <p class="!m-0 text-(--ui-text-muted) text-xs">
                  <span
                    >{{
                      getShip(item) &&
                      getCompanyCode(getShip(item)?.manufacturer as Company)
                    }}
                    &bull;
                    {{
                      getShip(item) && getMainFocusLabel(getShip(item)?.focuses)
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
            ships.push({
              ship: null,
              name: '',
              group: 'ariscorp',
              visibility: 'public',
            })
          "
          variant="outlinedashed"
          label="Weiteres Schiff hinzufügen"
          icon="i-lucide-plus"
          size="lg"
          class="w-full justify-center mt-4 !ring-none"
        />
      </div>
    </template>
    <template #footer>
      <div class="ml-auto items-center space-x-4 flex">
        <UButton @click="isOpen = false" variant="outline" label="Abbrechen" />
        <UButton
          :loading="isLoading"
          @click="handleSubmit"
          icon="i-lucide-check"
          trailing
          label="Zum Hangar hinzufügen"
        />
      </div>
    </template>
  </USlideover>
</template>

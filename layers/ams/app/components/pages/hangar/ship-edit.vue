<script setup lang="ts">
import type {
  Company,
  Ship,
  ShipModule,
  ShipModulesGallery,
  UserHangar,
} from '~~/types'

const props = defineProps<{ item: UserHangar; fleetMode: boolean }>()

const store = useHangarItemEditStore()
const authStore = useAuthStore()
const { formData } = storeToRefs(store)
const { currentUserId: userId } = storeToRefs(authStore)

const editSlideoverOpen = ref<boolean>(false)

const ship = computed<Ship>(() => {
  return props.item.ship_id as Ship
})

function handleEditOpen() {
  if (props.item) {
    console.log(props.item)
    store.initForm(props.item)
    editSlideoverOpen.value = true
  }
}

// TODO: Logik für handleEditSubmit implementieren
async function handleEditSubmit() {
  editSlideoverOpen.value = false

  await setTimeout(async () => {
    await store.submitHangarItem()

    const { refresh: refreshHangar } = await useFetchAMSHangar(userId)
    const { refresh: refreshFleet } = await useFetchAMSFleet()

    if (props.fleetMode) refreshFleet()
    else refreshHangar()
  }, 300)
}

const { data: departments } = useLazyAsyncData(
  'global:simple_departments',
  () =>
    useDirectus(
      readItems('departments', {
        limit: -1,
        fields: ['id', 'name'],
        sort: ['name'],
      })
    )
)
</script>

<template>
  <USlideover
    v-model:open="editSlideoverOpen"
    :ui="{
      header: '!p-0',
      content: 'max-w-xl ring-(--ui-primary)/10 divide-(--ui-primary)/10',
    }"
  >
    <template #default>
      <slot :open="handleEditOpen" />
    </template>
    <template #header>
      <div class="relative aspect-[26/9] overflow-hidden">
        <NuxtImg
          :src="getAssetId(ship.store_image)"
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
                  <USelectMenu
                    v-model="formData.department"
                    :items="departments"
                    variant="ams"
                    value-key="id"
                    label-key="name"
                    class="w-full"
                    size="lg"
                  />
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
          <UCard
            variant="ams"
            class="!shadow-none group"
            :data-disabled="!ship.modules?.length"
            :ui="{ body: '!pt-0' }"
          >
            <template #header>
              <div
                class="prose-h4:my-0 prose-p:my-0 text-(--ui-primary) group-data-[disabled=true]:pb-3 group-data-[disabled=true]:text-(--ui-text)/60"
              >
                <h4>Modulare Schiffe</h4>
              </div>
            </template>
            <template v-if="ship.modules?.length" #default>
              <div class="grid grid-cols-1 gap-4">
                <UFormField size="sm" label="Aktives Modul">
                  <div
                    v-if="formData.active_module"
                    class="flex w-full p-3 text-sm rounded-md items-center gap-4 ring ring-(--ui-primary)"
                  >
                    <NuxtImg
                      :src="getAssetId(((ship.modules.find((e) => e?.id === formData.active_module) as ShipModule)?.gallery?.[0] as ShipModulesGallery)?.directus_file_id)"
                      class="size-12 object-cover rounded-md"
                    />
                    <div class="flex-1">
                      <strong class="pb-1 block">{{
                        (
                          ship.modules.find(
                            (e) => e?.id === formData.active_module
                          ) as ShipModule
                        ).name
                      }}</strong>
                      <p class="!m-0 text-(--ui-text-muted) text-xs">
                        <!-- TODO: ADD MULTI MODULE SELECTION -->
                        <!-- TODO IMPLEMENT MODULE FOCUS -->
                        <span
                          >{{
                            getCompanyCode(
                              (
                                ship.modules.find(
                                  (e) => e?.id === formData.active_module
                                ) as ShipModule
                              ).manufacturer as Company
                            )
                          }}
                          &bull; TBD</span
                        >
                      </p>
                    </div>
                  </div>
                  <div class="p-px">
                    <USeparator
                      variant="ams"
                      color="ams"
                      class="my-4"
                      label="Andere Module"
                    />
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="module in (ship.modules as ShipModule[])"
                        @click="() => (formData.active_module = module.id)"
                        :key="module.id"
                        class="flex text-left w-full p-3 hover:cursor-pointer text-xs rounded-md items-center gap-4 ring transition-all duration-300"
                        :class="[
                          formData.active_module === module.id
                            ? 'ring-(--ui-primary)'
                            : 'ring-(--ui-bg-accented) hover:ring-(--ui-primary)/50',
                        ]"
                      >
                        <NuxtImg
                          :src="
                                getAssetId(
                                  (module.gallery?.[0] as ShipModulesGallery)?.directus_file_id
                                )
                              "
                          class="size-12 object-cover rounded-md"
                        />
                        <div class="flex-1">
                          <strong class="pb-1 block">{{ module.name }}</strong>
                          <p class="!m-0 text-(--ui-text-muted) text-[.6rem]">
                            <span>
                              {{
                                getCompanyCode(module.manufacturer as Company)
                              }}
                              &bull; TBD
                            </span>
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </UFormField>
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
        />
      </div>
    </template>
  </USlideover>
</template>

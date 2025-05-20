<script setup lang="ts">
import type { Ships } from '~~/types'

defineProps<{ ship: Ships }>()

const modulesOpen = ref<boolean>(false)

const editSlideover = ref<boolean>(false)
</script>

<template>
  <UCard
    variant="ams"
    class="hover:scale-[1.02] overflow-clip duration-300 translation-all ease-out group"
    :ui="{ header: '!p-0' }"
  >
    <template #header>
      <div class="relative aspect-[21/9] overflow-hidden">
        <div
          class="absolute inset-0 bg-gradient-to-t from-(--ui-bg-muted) to-transparent opacity-40 z-10 group-hover:translate-y-[100%] transition-all duration-300"
        />
        <NuxtImg
          :src="ship.store_image"
          class="h-full not-prose w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div class="absolute bottom-3 left-3 flex items-center space-x-2 z-20">
          <div
            class="flex items-center rounded-full bg-(--ui-bg-muted)/80 px-2 py-1 text-xs text-green-400 transition-all duration-300 group-hover:bg-(--ui-bg-muted)/90"
          >
            <UIcon name="i-lucide-shield-check" class="mr-1 h-3 w-3" />
            Operational
          </div>
        </div>
      </div>
    </template>
    <template #default>
      <h3
        class="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-(--ui-primary) !my-0"
      >
        {{ ship.name }}
      </h3>
      <p class="text-sm text-(--ui-text-muted) !my-0">Modular</p>
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
      <USlideover
        v-model:open="editSlideover"
        :ui="{
          header: '!p-0',
          content: 'max-w-xl ring-(--ui-primary)/10 divide-(--ui-primary)/10',
        }"
      >
        <UButton
          variant="outline"
          icon="i-lucide-suqare-pen"
          label="Edit Ship"
          class="w-full border-(--ui-primary)/20 text-(--ui-primary) justify-center hover:bg-(--ui-primary)/10 hover:text-(--ui-primary)"
        />
        <template #header>
          <div class="relative aspect-[26/9] overflow-hidden">
            <NuxtImg
              :src="ship.store_image"
              class="h-full not-prose w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </template>
        <template #body>
          <UForm>
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
                        highlight
                        variant="outline"
                        placeholder="Aris ONE"
                        size="md"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField size="sm" label="Seriennummer">
                      <UInput
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
                    <UFormField size="sm" label="Abteilung">
                      <USelectMenu
                        variant="ams"
                        value-key="id"
                        label-key="name"
                        class="w-full"
                        size="lg"
                      />
                    </UFormField>
                    <UFormField size="sm" label="Sichtbarkeit">
                      <URadioGroup
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
                            key: 'private',
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
                :data-disabled="false"
                :ui="{ body: '!pt-0' }"
              >
                <template #header>
                  <div
                    class="prose-h4:my-0 prose-p:my-0 text-(--ui-primary) group-data-[disabled=true]:pb-3 group-data-[disabled=true]:text-(--ui-text)/60"
                  >
                    <h4>Modulare Schiffe</h4>
                  </div>
                </template>
                <template v-if="true" #default>
                  <div class="grid grid-cols-1 gap-4">
                    <UFormField size="sm" label="Aktives Modul">
                      <div
                        class="flex w-full p-3 text-sm rounded-md items-center gap-4 ring ring-(--ui-primary)"
                      >
                        <NuxtImg
                          src="https://robertsspaceindustries.com/i/dcfe3cd7af5bfd5992d9e9e2f04d1ee121d14e9c/resize(1000,1000,crop(2160,2160,0,0,ADdPNihJzmPbNuTnFsH1DqUeqBRpXdSXVVtgJTyDDgscGKrzJuoFjReseTgLyuqXhHu4sa49vY343BR5nY72m8f82))/75/rsi-modular-ship-promo-modules-refinery.webp"
                          class="size-12 object-cover rounded-md"
                        />
                        <div class="flex-1">
                          <strong class="pb-1 block">Frachtmodul</strong>
                          <p class="!m-0 text-(--ui-text-muted) text-xs">
                            <span>RSI &bull; Medium-Fracht</span>
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
                          <div
                            class="flex w-full p-3 hover:cursor-pointer text-xs rounded-md items-center gap-4 ring ring-(--ui-bg-accented) transition-all duration-300 hover:ring-(--ui-primary)/50"
                          >
                            <NuxtImg
                              src="https://robertsspaceindustries.com/i/dcfe3cd7af5bfd5992d9e9e2f04d1ee121d14e9c/resize(1000,1000,crop(2160,2160,0,0,ADdPNihJzmPbNuTnFsH1DqUeqBRpXdSXVVtgJTyDDgscGKrzJuoFjReseTgLyuqXhHu4sa49vY343BR5nY72m8f82))/75/rsi-modular-ship-promo-modules-refinery.webp"
                              class="size-8 object-cover rounded-md"
                            />
                            <div class="flex-1">
                              <strong class="pb-1 block">Frachtmodul</strong>
                              <p
                                class="!m-0 text-(--ui-text-muted) text-[.6rem]"
                              >
                                <span>RSI &bull; Medium-Fracht</span>
                              </p>
                            </div>
                          </div>
                          <div
                            class="flex w-full p-3 text-xs rounded-md items-center gap-4 ring ring-(--ui-bg-accented) transition-all duration-300 hover:ring-(--ui-primary)/50"
                          >
                            <NuxtImg
                              src="https://robertsspaceindustries.com/i/dcfe3cd7af5bfd5992d9e9e2f04d1ee121d14e9c/resize(1000,1000,crop(2160,2160,0,0,ADdPNihJzmPbNuTnFsH1DqUeqBRpXdSXVVtgJTyDDgscGKrzJuoFjReseTgLyuqXhHu4sa49vY343BR5nY72m8f82))/75/rsi-modular-ship-promo-modules-refinery.webp"
                              class="size-8 object-cover rounded-md"
                            />
                            <div class="flex-1">
                              <strong class="pb-1 block"
                                >Raffineriemodul</strong
                              >
                              <p
                                class="!m-0 text-(--ui-text-muted) text-[.6rem]"
                              >
                                <span>RSI &bull; Medium-Raffinerie</span>
                              </p>
                            </div>
                          </div>
                          <div
                            class="flex w-full p-3 text-xs rounded-md items-center gap-4 ring ring-(--ui-bg-accented) transition-all duration-300 hover:ring-(--ui-primary)/50"
                          >
                            <NuxtImg
                              src="https://robertsspaceindustries.com/i/dcfe3cd7af5bfd5992d9e9e2f04d1ee121d14e9c/resize(1000,1000,crop(2160,2160,0,0,ADdPNihJzmPbNuTnFsH1DqUeqBRpXdSXVVtgJTyDDgscGKrzJuoFjReseTgLyuqXhHu4sa49vY343BR5nY72m8f82))/75/rsi-modular-ship-promo-modules-refinery.webp"
                              class="size-8 object-cover rounded-md"
                            />
                            <div class="flex-1">
                              <strong class="pb-1 block">Medizinmodul</strong>
                              <p
                                class="!m-0 text-(--ui-text-muted) text-[.6rem]"
                              >
                                <span>RSI &bull; Medium-Medizin</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </UFormField>
                  </div>
                </template>
              </UCard>
              <UCard
                variant="ams"
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
          </UForm>
        </template>
        <template #footer>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <UButton
              @click="editSlideover = false"
              label="Schließen"
              variant="outline"
              color="error"
              size="lg"
              class="w-full justify-center"
            />
            <UButton
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
  </UCard>
</template>

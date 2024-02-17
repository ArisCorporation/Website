<script setup lang="ts">
const { readItems } = useDirectusItems();
const { params } = useRoute();
const modalStore = useModalStore();
const selectedMainTab = ref(0);
const modalData = ref();

// DATA
const dataRes = await readItems('systems', {
  fields: [
    'banner',
    'name',
    'content',
    'affiliation',
    'discover_year',
    'population',
    'economy',
    'danger_level',
    'orbit.collection',
    'orbit.object:stars.name',
    'orbit.object:stars.banner',
    'orbit.object:stars.size',
    'orbit.object:stars.type',
    'orbit.object:stars.content',
    'orbit.object:planets.name',
    'orbit.object:planets.astronomical_designation',
    'orbit.object:planets.banner',
    'orbit.object:planets.size',
    'orbit.object:planets.age',
    'orbit.object:planets.orbital_period',
    'orbit.object:planets.distance',
    'orbit.object:planets.type',
    'orbit.object:planets.habitable',
    'orbit.object:planets.fairchanceact',
    'orbit.object:planets.population',
    'orbit.object:planets.economy',
    'orbit.object:planets.danger_level',
    'orbit.object:planets.content',
    'orbit.object:planets.orbit.collection',
    'orbit.object:planets.orbit.object.name',
    'orbit.object:planets.orbit.object.astronomical_designation',
    'orbit.object:planets.orbit.object.banner',
    'orbit.object:planets.orbit.object.type',
    'orbit.object:asteroid_belts.name',
    'orbit.object:jumppoints.size',
    'orbit.object:jumppoints.systems.systems_id.name',
    'orbit.object:jumppoints.systems.systems_id.banner',
  ],
  filter: {
    status: 'published',
    slug: { _eq: params.slug },
  },
  limit: 1,
});

if (!dataRes[0]) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const data = computed(() => transformStarsystem(dataRes[0]));

// Tabs - Planet
const tabs = [
  {
    id: 0,
    header: 'Beschreibung',
  },
  {
    id: 1,
    header: 'Orbit',
  },
  {
    id: 2,
    header: 'Objekte',
  },
];

const openQuickView = (title: string, data?: any) => {
  modalStore.openModal(title, { big: true, hideCloseButton: true });
  modalData.value = data;
};

useHead({
  title: data.value.name,
});
definePageMeta({
  layout: false,
});
</script>
<template>
  <NuxtLayout name="verse-exkurs">
    <template #modalContent>
      <template v-if="modalData.type === 'star'">
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="modalData.data?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
            :placeholder="[16, 16, 1, 5]"
            class="w-full h-44"
            :class="{ 'object-cover': modalData.data?.banner }"
          />
        </DefaultPanel>
        <div class="min-h-[120px]">
          <TableParent title="Infobox" class="float-right w-full mt-6 mb-8 xl:ml-12 xl:float-right xl:w-1/2">
            <TableRow title="Typ" :content="modalData.data.type" />
            <TableRow title="Größe" :content="modalData.data.size" />
          </TableParent>
          <div v-html="modalData.data.content" />
        </div>
      </template>
      <template v-else-if="modalData.type === 'planet' || modalData.type === 'moon'">
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="modalData.data?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
            :placeholder="[16, 16, 1, 5]"
            class="w-full h-44"
            :class="{ 'object-cover': modalData.data?.banner }"
          />
        </DefaultPanel>
        <div class="min-h-[520px]">
          <TableParent title="Infobox" class="float-right w-full mt-6 mb-8 xl:ml-12 xl:float-right xl:w-1/2">
            <!-- :class="{ 'xl:w-1/2': modalData.data.content }" -->
            <TableHr><span class="text-xl">Astronomisch</span></TableHr>
            <TableRow title="Größe" :content="modalData.data.size" />
            <TableRow title="Alter" :content="modalData.data.age" />
            <TableRow title="Orbitale Umlaufzeit" :content="modalData.data.orbital_period" />
            <TableRow title="Distanz" :content="modalData.data.distance" />
            <TableRow title="Typ" :content="modalData.data.type" />
            <TableHr><span class="text-xl">Politik & Wirtschaft</span></TableHr>
            <TableRow title="Habitabel" :content="modalData.data.habitable ? 'Ja' : 'Nein'" />
            <TableRow title="Fairchanceact aktiv" :content="modalData.data.fairchanceact ? 'Ja' : 'Nein'" />
            <TableRow
              title="Bevölkerung"
              :content="modalData.data.population ? modalData.data.population + ' / 10' : ''"
            />
            <TableRow title="Wirtschaft" :content="modalData.data.economy ? modalData.data.economy + ' / 10' : ''" />
            <TableRow
              title="Gefahrenstufe"
              :content="modalData.data.danger_level ? modalData.data.economy + ' / 10' : ''"
            />
          </TableParent>
          <div v-html="modalData.data.content" />
        </div>
      </template>
      <template v-else-if="modalData.type === 'station'">
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="modalData.data?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
            :placeholder="[16, 16, 1, 5]"
            class="w-full h-44"
            :class="{ 'object-cover': modalData.data?.banner }"
          />
        </DefaultPanel>
        <div class="min-h-[120px]">
          <TableParent title="Infobox" class="float-right w-full mt-6 mb-8 xl:ml-12 xl:float-right xl:w-1/2">
            <TableRow title="Typ" :content="modalData.data.type" />
          </TableParent>
          <div v-html="modalData.data.content" />
        </div>
      </template>
      <template v-else-if="modalData.type === 'jumppoint'">
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="
              modalData.data?.banner ||
              modalData.data.systems.find((e: any) => e.name !== data.name)?.banner ||
              '650aba1c-3182-40a6-8185-a8f3d164ef2b'
            "
            :placeholder="[16, 16, 1, 5]"
            class="w-full h-44"
            :class="{
              'object-cover':
                modalData.data?.banner || modalData.data.systems.find((e: any) => e.name !== data.name)?.banner,
            }"
          />
        </DefaultPanel>
        <div class="min-h-[120px]">
          <TableParent title="Infobox" class="float-right w-full mt-6 mb-8 xl:ml-12 xl:float-right xl:w-1/2">
            <TableRow title="Größe" :content="modalData.data.size" />
          </TableParent>
          <div v-html="modalData.data.content" />
        </div>
      </template>
      <template v-else>
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="modalData.data?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
            :placeholder="[16, 16, 1, 5]"
            class="w-full h-44"
            :class="{ 'object-cover': modalData.data?.banner }"
          />
        </DefaultPanel>
        <div v-html="modalData.data.content" />
      </template>
    </template>
    <VerseExkursBaseArticle :banner="data?.banner">
      <template #title>
        Sternensystem:
        <span class="text-aris-400">{{ data?.name }}</span>
      </template>
      <TabGroup
        :tablist="tabs"
        :store="selectedMainTab"
        :change="(index: number) => (selectedMainTab = index)"
        between
        hide-hr
        no-margin
      >
        <template #tabcontent>
          <div v-if="selectedMainTab === 0">
            <TableParent v-if="true" title="Infobox" class="w-full mb-8 xl:ml-12 xl:float-right xl:w-1/2">
              <TableHr><span class="text-xl text-industrial-400">Astronomisch</span></TableHr>
              <TableRow v-if="data.size" title="Systemgröße" :content="data?.size" full-width />
              <TableRow v-if="data.planets" title="Planeten" :content="data?.planets.length" full-width />
              <TableRow
                v-if="data.planets.map((obj: any) => obj.moons).length"
                title="Monde"
                :content="
                  data.planets.map((obj: any) => obj.moons.length).reduce((sum: number, a: number) => sum + a, 0)
                "
                full-width
              />
              <TableRow
                v-if="data.asteroid_belts"
                title="Asteroidengürtel"
                :content="data?.asteroid_belts.length"
                full-width
              />
              <TableRow v-if="data.jumppoints" title="Jumppoints" :content="data?.jumppoints.length" full-width />
              <TableHr><span class="text-xl text-industrial-400">Politik & Wirtschaft</span></TableHr>
              <TableRow v-if="data.affiliation" title="Zugehörigkeit" full-width>
                <span class="flex items-center gap-x-1 text-aris-400">
                  {{ data.affiliation }}
                  <Icon
                    :name="
                      'IconsNavigationStarmap' +
                      (data.affiliation_value[0].toUpperCase() + data.affiliation_value.slice(1))
                    "
                  />
                </span>
              </TableRow>
              <TableRow v-if="data.discovery_year" title="Entdeckungsjahr" :content="data.discovery_year" full-width />
              <TableRow v-if="data.population" title="Bevölkerung" :content="data.population + ' / 10'" full-width />
              <TableRow v-if="data.economy" title="Wirtschaft" :content="data.economy + ' / 10'" full-width />
              <TableRow
                v-if="data.danger_level"
                title="Gefahrenstufe"
                :content="data.danger_level + ' / 10'"
                full-width
              />
            </TableParent>
            <div v-html="data.content" />
          </div>
          <div v-else-if="selectedMainTab === 1">
            <p class="text-aris-400">
              Orbit-View
              <!-- {{ data.value.orbit }} -->
            </p>
          </div>
          <div v-else-if="selectedMainTab === 2">
            <div>
              <TableHr> Orbital-Objekte </TableHr>
              <UAccordion
                color="accordion-gray"
                variant="outline"
                size="xl"
                :items="[
                  ...(data.stars[0] ? [{ label: 'Sterne', slot: 'sterne' }] : []),
                  ...(data.planets[0] ? [{ label: 'Planeten', slot: 'planeten' }] : []),
                  ...(data.jumppoints[0] ? [{ label: 'Sprungpunkte', slot: 'sprungpunkte' }] : []),
                  ...(data.asteroid_belts[0] ? [{ label: 'Asteroidentürtel', slot: 'asteroidenguertel' }] : []),
                ]"
              >
                <template #sterne>
                  <div class="cards-grid">
                    <UCard
                      v-for="star in data.stars"
                      :ui="{
                        strategy: 'override',
                        header: {
                          padding: 'p-0',
                        },
                        body: {
                          padding: 'px-2 py-3 sm:px-4',
                        },
                        footer: {
                          padding: 'p-0',
                        },
                      }"
                      class="flex flex-col w-full"
                    >
                      <template #header>
                        <NuxtImg
                          :src="star?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
                          class="w-full h-24"
                          :class="{
                            'object-cover': star.banner,
                          }"
                        />
                      </template>
                      <h4>{{ star.name }}</h4>

                      <template #footer>
                        <div
                          @click="
                            openQuickView(star.name, {
                              type: 'star',
                              data: star,
                            })
                          "
                          class="transition cursor-pointer bg-bsecondary hover:bg-btertiary"
                        >
                          <p class="text-center">Quick View</p>
                        </div>
                      </template>
                    </UCard>
                  </div>
                </template>
                <template #planeten>
                  <UAccordion
                    color="accordion-gray"
                    variant="outline"
                    size="xl"
                    :items="
                      data.planets.map((obj: any, index: number) => ({
                        label: `${obj.astronomical_designation}${obj.name ? ' - ' + obj.name : ''}`,
                        data: obj,
                      }))
                    "
                    class="pl-8"
                  >
                    <template #default="{ item, index, open }">
                      <UButton color="accordion-gray" variant="outline" size="xl" class="w-full mb-1.5 group">
                        <template #leading>
                          <NuxtImg
                            :src="item.data?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
                            :placeholder="[16, 16, 1, 5]"
                            class="w-auto h-12 aspect-[21/9] border border-bsecondary rounded group-hover:border-btertiary"
                            :class="{ 'object-cover': item.data?.banner }"
                          />
                        </template>

                        <span class="truncate">{{ item.label }}</span>

                        <template #trailing>
                          <UIcon
                            name="i-heroicons-chevron-right-20-solid"
                            class="w-5 h-5 transition-transform duration-200 transform ms-auto"
                            :class="[open && 'rotate-90']"
                          />
                        </template>
                      </UButton>
                    </template>
                    <template #item="{ item: planet, index }">
                      <div class="pl-8 mb-4">
                        <UCard
                          :ui="{
                            strategy: 'override',
                            header: {
                              padding: 'p-0',
                            },
                            body: {
                              padding: 'px-2 py-3 sm:px-4',
                            },
                            footer: {
                              padding: 'p-0',
                            },
                          }"
                          class="flex flex-col w-full"
                        >
                          <template #header>
                            <NuxtImg
                              :src="planet.data?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
                              class="w-full h-16"
                              :class="{ 'object-cover': planet.data?.banner }"
                            />
                          </template>
                          <h5>{{ planet.label }}</h5>

                          <template #footer>
                            <div
                              @click="
                                openQuickView(planet.label, {
                                  type: 'planet',
                                  data: planet.data,
                                })
                              "
                              class="transition cursor-pointer bg-bsecondary hover:bg-btertiary"
                            >
                              <p class="text-center">Quick View</p>
                            </div>
                          </template>
                        </UCard>
                      </div>
                      <UAccordion
                        color="accordion-gray"
                        variant="outline"
                        size="xl"
                        :items="[
                          ...(planet.data.moons[0] ? [{ label: 'Monde', slot: 'monde' }] : []),
                          ...(planet.data.space_stations[0] ? [{ label: 'Raumstationen', slot: 'raumstationen' }] : []),
                        ]"
                        class="pl-8"
                      >
                        <template #default="{ item, open }">
                          <UButton color="accordion-gray" variant="outline" size="xl" class="w-full mb-1.5">
                            <span class="truncate">{{ planet.label }}: {{ item.label }}</span>

                            <template #trailing>
                              <UIcon
                                name="i-heroicons-chevron-right-20-solid"
                                class="w-5 h-5 transition-transform duration-200 transform ms-auto"
                                :class="[open && 'rotate-90']"
                              />
                            </template>
                          </UButton>
                        </template>
                        <template #monde>
                          <div class="cards-grid">
                            <UCard
                              v-for="moon in planet.data.moons"
                              :ui="{
                                strategy: 'override',
                                header: {
                                  padding: 'p-0',
                                },
                                body: {
                                  padding: 'px-2 py-3 sm:px-4',
                                },
                                footer: {
                                  padding: 'p-0',
                                },
                              }"
                              class="flex flex-col w-full"
                            >
                              <template #header>
                                <NuxtImg
                                  :src="moon.data?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
                                  class="w-full h-24"
                                  :class="{ 'object-cover': moon.data?.banner }"
                                />
                              </template>

                              <h4>{{ moon.astronomical_designation }}{{ moon.name ? ' - ' + moon.name : '' }}</h4>

                              <template #footer>
                                <div
                                  @click="
                                    openQuickView(
                                      `${moon.astronomical_designation}${moon.name ? ' - ' + moon.name : ''}`,
                                      {
                                        type: 'moon',
                                        data: moon,
                                      },
                                    )
                                  "
                                  class="transition cursor-pointer bg-bsecondary hover:bg-btertiary"
                                >
                                  <p class="text-center">Quick View</p>
                                </div>
                              </template>
                            </UCard>
                          </div>
                        </template>
                        <template #raumstationen>
                          <div class="cards-grid">
                            <UCard
                              v-for="station in planet.data.space_stations"
                              :ui="{
                                strategy: 'override',
                                header: {
                                  padding: 'p-0',
                                },
                                body: {
                                  padding: 'px-2 py-3 sm:px-4',
                                },
                                footer: {
                                  padding: 'p-0',
                                },
                              }"
                              class="flex flex-col w-full"
                            >
                              <template #header>
                                <NuxtImg
                                  :src="station.data?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
                                  class="w-full h-24"
                                  :class="{ 'object-cover': station.data?.banner }"
                                />
                              </template>
                              <h4>{{ station.name }}</h4>
                              <ul>
                                <li>{{ station.type }}</li>
                              </ul>

                              <template #footer>
                                <div
                                  @click="
                                    openQuickView(station.label, {
                                      type: 'station',
                                      data: station,
                                    })
                                  "
                                  class="transition cursor-pointer bg-bsecondary hover:bg-btertiary"
                                >
                                  <p class="text-center">Quick View</p>
                                </div>
                              </template>
                            </UCard>
                          </div>
                        </template>
                      </UAccordion>
                    </template>
                  </UAccordion>
                  <!-- <div class="pl-8">
                    <UAccordion
                      color="accordion-gray"
                      variant="outline"
                      size="xl"
                      :items="[
                        { label: 'Monde', slot: 'monde' },
                        { label: 'Raumstationen', slot: 'raumstationen' },
                      ]"
                    >
                      <template #monde> Monde </template>
                      <template #raumstationen> Raumstationen </template>
                    </UAccordion>
                  </div> -->
                </template>
                <template #sprungpunkte>
                  <div class="cards-grid">
                    <UCard
                      v-for="jumppoint in data.jumppoints"
                      :ui="{
                        strategy: 'override',
                        header: {
                          padding: 'p-0',
                        },
                        body: {
                          padding: 'px-2 py-3 sm:px-4',
                        },
                        footer: {
                          padding: 'p-0',
                        },
                      }"
                      class="flex flex-col w-full"
                    >
                      <template #header>
                        <NuxtImg
                          :src="
                            jumppoint?.banner ||
                            jumppoint.systems.find((e: any) => e.name !== data.name)?.banner ||
                            '650aba1c-3182-40a6-8185-a8f3d164ef2b'
                          "
                          class="w-full h-24"
                          :class="{
                            'object-cover':
                              jumppoint?.banner || jumppoint.systems.find((e: any) => e.name !== data.name)?.banner,
                          }"
                        />
                      </template>
                      <h4>Sprungpunkt zu: {{ jumppoint.systems.find((e: any) => e.name !== data.name).name }}</h4>

                      <template #footer>
                        <div
                          @click="
                            openQuickView(
                              `Sprungpunkt zu: ${jumppoint.systems.find((e: any) => e.name !== data.name).name}`,
                              {
                                type: 'jumppoint',
                                data: jumppoint,
                              },
                            )
                          "
                          class="transition cursor-pointer bg-bsecondary hover:bg-btertiary"
                        >
                          <p class="text-center">Quick View</p>
                        </div>
                      </template>
                    </UCard>
                  </div>
                </template>
                <template #asteroidenguertel>
                  <div class="cards-grid">
                    <UCard
                      v-for="asteroid_belt in data.asteroid_belts"
                      :ui="{
                        strategy: 'override',
                        header: {
                          padding: 'p-0',
                        },
                        body: {
                          padding: 'px-2 py-3 sm:px-4',
                        },
                        footer: {
                          padding: 'p-0',
                        },
                      }"
                      class="flex flex-col w-full"
                    >
                      <template #header>
                        <NuxtImg
                          :src="asteroid_belt?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
                          class="w-full h-24"
                          :class="{
                            'object-cover': asteroid_belt.banner,
                          }"
                        />
                      </template>
                      <h4>{{ asteroid_belt.name }}</h4>

                      <template #footer>
                        <div
                          @click="
                            openQuickView(asteroid_belt.name, {
                              type: 'asteroid_belt',
                              data: asteroid_belt,
                            })
                          "
                          class="transition cursor-pointer bg-bsecondary hover:bg-btertiary"
                        >
                          <p class="text-center">Quick View</p>
                        </div>
                      </template>
                    </UCard>
                  </div>
                </template>
                <!-- <template #planeten>
                    <UAccordion
                      color="accordion-gray"
                      variant="outline"
                      size="xl"
                      :items="[
                        { label: 'Planten', slot: 'planeten' },
                        { label: 'Sprungpunkte', slot: 'sprungpunkte' },
                        { label: 'Asteroidentürtel', slot: 'asteroidenguertel' },
                      ]"
                    >
                    </UAccordion>
                    <TabGroup
                      :tablist="[{ header: 'Beschreibung' }, { header: 'Objekte' }]"
                      :state="selectedPlanetTab"
                      :change="changePlanetTab"
                      hideHr
                    >
                      <template #tabcontent> </template>
                    </TabGroup> 
                  </template> -->
                <!-- <template #sprungpunkte> Sprungpunkte </template>
                  <template #asteroidenguertel> Asteroidentürtel </template> -->
              </UAccordion>
            </div>
          </div>
        </template>
      </TabGroup>
    </VerseExkursBaseArticle>
  </NuxtLayout>
</template>

<style scoped lang="postcss">
.cards-grid {
  @apply grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5;
}
</style>

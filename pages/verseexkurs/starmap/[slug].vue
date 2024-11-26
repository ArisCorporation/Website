<script setup lang="ts">
const { directus, readItems } = useCMS();
const { params } = useRoute();
const modalStore = useModalStore();
const selectedMainTab = ref(0);
const modalData = ref();
const { query } = useRoute();

// DATA
const { data } = await useAsyncData(
  'STARMAP:SYSTEMS',
  () =>
    directus.request(
      readItems('systems', {
        fields: [
          'banner',
          'overview_image',
          'name',
          'content',
          'affiliation',
          'discovery_year',
          'population',
          'economy',
          'danger_level',
          'size',
          'star_type',
          'star_class',
          'orbit.collection',
          'orbit.object:stars.name',
          'orbit.object:stars.banner',
          'orbit.object:stars.size',
          'orbit.object:stars.type',
          'orbit.object:stars.content',
          'orbit.object:planets.name',
          'orbit.object:planets.astronomical_designation',
          'orbit.object:planets.slug',
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
          'orbit.object:planets.landing_zones.name',
          'orbit.object:planets.landing_zones.slug',
          'orbit.object:planets.landing_zones.banner',
          'orbit.object:planets.landing_zones.content',
          'orbit.object:planets.orbit.collection',
          'orbit.object:planets.orbit.object.name',
          'orbit.object:planets.orbit.object.slug',
          'orbit.object:planets.orbit.object:planets.astronomical_designation',
          'orbit.object:planets.orbit.object:moons.astronomical_designation',
          'orbit.object:planets.orbit.object.banner',
          'orbit.object:planets.orbit.object:space_stations.type',
          'orbit.object:asteroid_belts.name',
          'orbit.object:asteroid_belts.slug',
          'orbit.object:asteroid_belts.banner',
          'orbit.object:asteroid_belts.content',
          'orbit.object:jumppoints.size',
          'orbit.object:jumppoints.systems.systems_id.name',
          'orbit.object:jumppoints.systems.systems_id.slug',
          'orbit.object:jumppoints.systems.systems_id.banner',
        ],
        filter: {
          status: 'published',
          slug: { _eq: params.slug },
        },
        limit: 1,
      }),
    ),
  {
    transform: (rawSystems: any[]) => transformStarsystem(rawSystems[0]),
  },
);

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

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

if (query.planet) {
  selectedMainTab.value = 2;

  try {
    const obj = data.value.planets.find((e: any) => e.slug === query.planet);
    if (!obj) throw new Error('Planet not found');

    const label = `${obj.astronomical_designation}${obj.name ? ' - ' + obj.name : ''}`;
    openQuickView(label, {
      type: 'planet',
      data: obj,
    });
  } catch (error) {
    Sentry.captureException(error);
    // console.log(error);
    // throw new Error(error);
  }
}
if (query.moon) {
  selectedMainTab.value = 2;

  try {
    // console.log(data.value.orbit.find((e: any) => e.object?.orbit?.object?.slug === query.moon));
    // const findMoonBySlug = (slug: string) => {
    //   const moons = data.value.orbit.flatMap((planet: any) => planet.object?.orbit || []);
    //   console.log(moons);
    //   return moons.find((objects: any) => objects.object.slug === slug);
    // };
    // const obj = findMoonBySlug(String(query.moon));
    const obj = data.value.orbit
      .flatMap((planet: any) => planet.object?.orbit || [])
      .find((objects: any) => objects.object.slug === query.moon)?.object;
    if (!obj) throw new Error('Moon not found');

    const label = `${obj.astronomical_designation}${obj.name ? ' - ' + obj.name : ''}`;
    openQuickView(label, {
      type: 'moon',
      data: obj,
    });
    // const moonSlug = query.moon;
    // if (moonSlug) {
    //   selectedMainTab.value = 2;
    //   try {
    //     const moon = findMoonBySlug(moonSlug);
    //     if (!moon) throw new Error('Moon not found');
    //     const label = `${moon.astronomical_designation}${moon.name ? ' - ' + moon.name : ''}`;
    //     openQuickView(label, {
    //       type: 'moon',
    //       data: moon,
    //     });
    //   } catch (error) {
    //     Sentry.captureException(error);
    //   }
    // }
    // if (!obj) throw new Error('Moon not found');
    // const label = `${obj.astronomical_designation}${obj.name ? ' - ' + obj.name : ''}`;
    // openQuickView(label, {
    //   type: 'moon',
    //   data: obj,
    // });
  } catch (error) {
    Sentry.captureException(error);
  }
}
if (query.ss) {
  selectedMainTab.value = 2;

  try {
    const obj = data.value.orbit
      .flatMap((planet: any) => planet.object?.orbit || [])
      .find((objects: any) => objects.object.slug === query.ss)?.object;
    if (!obj) throw new Error('Space-Station not found');

    openQuickView(obj.name, {
      type: 'station',
      data: obj,
    });
  } catch (error) {
    Sentry.captureException(error);
  }
}
if (query.lz) {
  selectedMainTab.value = 2;

  try {
    const obj = data.value.planets
      .flatMap((planet: any) => planet?.landing_zones || [])
      .find((objects: any) => objects.slug === query.lz);
    if (!obj) throw new Error('Landing-Zone not found');

    openQuickView(obj.name, {
      type: 'landing_zone',
      data: obj,
    });
  } catch (error) {
    Sentry.captureException(error);
  }
}
if (query.ab) {
  selectedMainTab.value = 2;

  try {
    const obj = data.value.orbit.find((e: any) => e.object?.slug === query.ab)?.object;
    if (!obj) throw new Error('Asteroid-Belt not found');

    openQuickView(obj.name, {
      type: 'asteroid_belt',
      data: obj,
    });
  } catch (error) {
    Sentry.captureException(error);
  }
}

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
            :src="modalData.data?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
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
          <Editor :model-value="modalData.data.content" read-only />
        </div>
      </template>
      <template v-else-if="modalData.type === 'planet' || modalData.type === 'moon'">
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="modalData.data?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
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
          <Editor :model-value="modalData.data.content" read-only />
        </div>
      </template>
      <template v-else-if="modalData.type === 'landing_zone'">
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="modalData.data?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
            :placeholder="[16, 16, 1, 5]"
            class="w-full h-44"
            :class="{ 'object-cover': modalData.data?.banner }"
          />
        </DefaultPanel>
        <div class="min-h-[120px]">
          <Editor :model-value="modalData.data.content" read-only />
        </div>
      </template>
      <template v-else-if="modalData.type === 'station'">
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="modalData.data?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
            :placeholder="[16, 16, 1, 5]"
            class="w-full h-44"
            :class="{ 'object-cover': modalData.data?.banner }"
          />
        </DefaultPanel>
        <div class="min-h-[120px]">
          <TableParent title="Infobox" class="float-right w-full mt-6 mb-8 xl:ml-12 xl:float-right xl:w-1/2">
            <TableRow title="Typ" :content="modalData.data.type" />
          </TableParent>
          <Editor :model-value="modalData.data.content" read-only />
        </div>
      </template>
      <template v-else-if="modalData.type === 'jumppoint'">
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="
							modalData.data?.banner
								|| modalData.data.systems.find((e: any) => e.name !== data.name)?.banner
								|| '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'
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
          <Editor :model-value="modalData.data.content" read-only />
        </div>
      </template>
      <template v-else-if="modalData.type === 'asteroid_belt'">
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="modalData.data?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
            :placeholder="[16, 16, 1, 5]"
            class="w-full h-44"
            :class="{ 'object-cover': modalData.data?.banner }"
          />
        </DefaultPanel>
        <div class="min-h-[120px]">
          <Editor :model-value="modalData.data.content" read-only />
        </div>
      </template>
      <template v-else>
        <DefaultPanel bg="bprimary">
          <NuxtImg
            :src="modalData.data?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
            :placeholder="[16, 16, 1, 5]"
            class="w-full h-44"
            :class="{ 'object-cover': modalData.data?.banner }"
          />
        </DefaultPanel>
        <Editor :model-value="modalData.data.content" read-only />
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
            <div class="grid gap-4 mb-8 xl:grid-cols-2">
              <DefaultPanel class="mb-auto">
                <NuxtImg :src="data?.overview_image" :placeholder="[16, 16, 1, 5]" class="object-cover w-full h-full" />
              </DefaultPanel>
              <TableParent v-if="true" title="Infobox" class="w-full" panel-classes="h-full" bg="primary">
                <TableHr><span class="text-xl text-industrial-400">Astronomisch</span></TableHr>
                <TableRow v-if="data.size" title="Systemgröße" :content="data?.size" suffix="AE" full-width inline />
                <TableRow v-if="data.star_type" title="Sternentyp" :content="data?.star_type" inline />
                <TableRow v-if="data.star_type" title="Sternenklasse" :content="data?.star_class" inline />
                <TableRow v-if="data.planets" title="Planeten" :content="data?.planets.length" inline />
                <TableRow
                  v-if="data.planets.map((obj: any) => obj.moons).length"
                  title="Monde"
                  :content="
										data.planets.map((obj: any) => obj.moons.length).reduce((sum: number, a: number) => sum + a, 0)
									"
                  inline
                />
                <TableRow
                  v-if="data.asteroid_belts"
                  title="Asteroidengürtel"
                  :content="data?.asteroid_belts.length"
                  inline
                />
                <TableRow v-if="data.jumppoints" title="Jumppoints" :content="data?.jumppoints.length" inline />
                <TableHr><span class="text-xl text-industrial-400">Politik & Wirtschaft</span></TableHr>
                <TableRow v-if="data.affiliation" title="Zugehörigkeit" full-width inline>
                  <span class="inline-flex items-center gap-x-1 text-aris-400">
                    {{ data.affiliation }}
                    <Icon
                      :name="
                        'IconsNavigationStarmap' +
                        (data.affiliation_value[0].toUpperCase() + data.affiliation_value.slice(1))
                      "
                      class="my-auto size-6"
                    />
                  </span>
                </TableRow>
                <TableRow
                  v-if="data.name === 'Sol' ? true : data.discovery_year"
                  title="Entdeckungsjahr"
                  :content="data.name === 'Sol' ? String(0) : data.discovery_year"
                  inline
                />
                <TableRow v-if="data.population" title="Bevölkerung" :content="data.population + ' / 10'" inline />
                <TableRow v-if="data.economy" title="Wirtschaft" :content="data.economy + ' / 10'" inline />
                <TableRow title="Gefahrenstufe" :content="data.danger_level.toString() + ' / 10'" inline />
                <TableHr><span class="text-xl text-industrial-400">Landezonen</span></TableHr>
                <TableRow
                  :content="data.planets.map((obj: any) => obj.landing_zones.map((lz: any) => lz.name)).flat().sort().join(', ')"
                  is-list
                />
              </TableParent>
            </div>
            <Editor :model-value="data.content" read-only />
          </div>
          <div v-else-if="selectedMainTab === 1">
            <h2 class="">
              COMING SOON
              <!-- Orbit-View -->
              <!-- {{ data.value.orbit }} -->
            </h2>
          </div>
          <div v-else-if="selectedMainTab === 2">
            <div>
              <TableHr> Orbital-Objekte </TableHr>
              <UAccordion
                color="accordion-gray"
                variant="outline"
                size="xl"
                :items="[
                  ...(data.stars[0]
                    ? [{ label: 'Sterne', slot: 'sterne', defaultOpen: query.star ? true : false }]
                    : []),
                  ...(data.planets[0]
                    ? [
                        {
                          label: 'Planeten',
                          slot: 'planeten',
                          defaultOpen: query.planet || query.moon || query.ss || query.lz,
                        },
                      ]
                    : []),
                  ...(data.jumppoints[0]
                    ? [{ label: 'Sprungpunkte', slot: 'sprungpunkte', defaultOpen: query.jumppoint ? true : false }]
                    : []),
                  ...(data.asteroid_belts[0]
                    ? [
                        {
                          label: 'Asteroidentürtel',
                          slot: 'asteroidenguertel',
                          defaultOpen: query.ab ? true : false,
                        },
                      ]
                    : []),
                ]"
              >
                <template #sterne>
                  <div class="cards-grid">
                    <UCard
                      v-for="star in data.stars"
                      :key="star.name"
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
                      class="flex flex-col w-full overflow-clip"
                    >
                      <template #header>
                        <NuxtImg
                          :src="star?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
                          class="w-full h-24"
                          :class="{
                            'object-cover': star.banner,
                          }"
                        />
                      </template>
                      <h4>{{ star.name }}</h4>

                      <template #footer>
                        <div
                          class="transition cursor-pointer bg-bg-600 hover:bg-bg-400"
                          @click="
                            openQuickView(star.name, {
                              type: 'star',
                              data: star,
                            })
                          "
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
												defaultOpen:
													query.planet === obj.slug || obj.landing_zones.find((e: any) => e.slug === query.lz)
														? true
														: false || obj.moons.find((e: any) => e.slug === query.moon)
															? true
															: false || obj.space_stations.find((e: any) => e.slug === query.ss)
																? true
																: false,
											}))
										"
                    class="pl-8"
                  >
                    <template #default="{ item, index, open }">
                      <UButton color="accordion-gray" variant="outline" size="xl" class="w-full mb-1.5 group">
                        <template #leading>
                          <NuxtImg
                            :src="item.data?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
                            :placeholder="[16, 16, 1, 5]"
                            class="w-auto h-12 aspect-[21/9] border border-bg-600 rounded group-hover:border-btertiary"
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
                            base: 'overflow-clip',
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
                          class="flex flex-col w-full overflow-clip"
                        >
                          <template #header>
                            <NuxtImg
                              :src="planet.data?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
                              class="w-full h-16"
                              :class="{ 'object-cover': planet.data?.banner }"
                            />
                          </template>
                          <h5>{{ planet.label }}</h5>

                          <template #footer>
                            <div
                              class="transition cursor-pointer bg-bg-600 hover:bg-bg-400"
                              @click="
                                openQuickView(planet.label, {
                                  type: 'planet',
                                  data: planet.data,
                                })
                              "
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
                          ...(planet.data.landing_zones[0]
                            ? [{ label: 'Landezonen', slot: 'landezonen', defaultOpen: query.lz }]
                            : []),
                          ...(planet.data.moons[0] ? [{ label: 'Monde', slot: 'monde', defaultOpen: query.moon }] : []),
                          ...(planet.data.space_stations[0]
                            ? [{ label: 'Raumstationen', slot: 'raumstationen', defaultOpen: query.ss }]
                            : []),
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
                        <template #landezonen>
                          <div class="cards-grid">
                            <UCard
                              v-for="landing_zone in planet.data.landing_zones"
                              :key="landing_zone.name"
                              :ui="{
                                strategy: 'override',
                                base: 'overflow-clip',
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
                              class="flex flex-col w-full overflow-clip"
                            >
                              <template #header>
                                <NuxtImg
                                  :src="landing_zone?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
                                  class="w-full h-24"
                                  :class="{ 'object-cover': landing_zone?.banner }"
                                />
                              </template>

                              <h4>{{ landing_zone.name }}</h4>

                              <template #footer>
                                <div
                                  class="transition cursor-pointer bg-bg-600 hover:bg-bg-400"
                                  @click="
                                    openQuickView(landing_zone.name, {
                                      type: 'landing_zone',
                                      data: landing_zone,
                                    })
                                  "
                                >
                                  <p class="text-center">Quick View</p>
                                </div>
                              </template>
                            </UCard>
                          </div>
                        </template>
                        <template #monde>
                          <div class="cards-grid">
                            <UCard
                              v-for="moon in planet.data.moons"
                              :key="moon.name"
                              :ui="{
                                strategy: 'override',
                                base: 'overflow-clip',
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
                              class="flex flex-col w-full overflow-clip"
                            >
                              <template #header>
                                <NuxtImg
                                  :src="moon?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
                                  class="w-full h-24"
                                  :class="{ 'object-cover': moon?.banner }"
                                />
                              </template>

                              <h4>{{ moon.astronomical_designation }}{{ moon.name ? ' - ' + moon.name : '' }}</h4>

                              <template #footer>
                                <div
                                  class="transition cursor-pointer bg-bg-600 hover:bg-bg-400"
                                  @click="
                                    openQuickView(
                                      `${moon.astronomical_designation}${moon.name ? ' - ' + moon.name : ''}`,
                                      {
                                        type: 'moon',
                                        data: moon,
                                      },
                                    )
                                  "
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
                              :key="station.name"
                              :ui="{
                                strategy: 'override',
                                base: 'overflow-clip',
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
                              class="flex flex-col w-full overflow-clip"
                            >
                              <template #header>
                                <NuxtImg
                                  :src="station?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
                                  class="w-full h-24"
                                  :class="{ 'object-cover': station?.banner }"
                                />
                              </template>
                              <h4>{{ station.name }}</h4>
                              <ul>
                                <li>{{ station.type }}</li>
                              </ul>

                              <template #footer>
                                <div
                                  class="transition cursor-pointer bg-bg-600 hover:bg-bg-400"
                                  @click="
                                    openQuickView(station.name, {
                                      type: 'station',
                                      data: station,
                                    })
                                  "
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
                      :key="jumppoint.id"
                      :ui="{
                        strategy: 'override',
                        base: 'overflow-clip',
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
                      class="flex flex-col w-full overflow-clip"
                    >
                      <template #header>
                        <NuxtImg
                          :src="
														jumppoint?.banner
															|| jumppoint.systems.find((e: any) => e.name !== data.name)?.banner
															|| '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'
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
                          class="transition cursor-pointer bg-bg-600 hover:bg-bg-400"
                          @click="
                            openQuickView(
                              `Sprungpunkt zu: ${jumppoint.systems.find((e: any) => e.name !== data.name).name}`,
                              {
                                type: 'jumppoint',
                                data: jumppoint,
                              },
                            )
                          "
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
                      :key="asteroid_belt.name"
                      :ui="{
                        strategy: 'override',
                        base: 'overflow-clip',
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
                      class="flex flex-col w-full overflow-clip"
                    >
                      <template #header>
                        <NuxtImg
                          :src="asteroid_belt?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
                          class="w-full h-24"
                          :class="{
                            'object-cover': asteroid_belt.banner,
                          }"
                        />
                      </template>
                      <h4>{{ asteroid_belt.name }}</h4>

                      <template #footer>
                        <div
                          class="transition cursor-pointer bg-bg-600 hover:bg-bg-400"
                          @click="
                            openQuickView(asteroid_belt.name, {
                              type: 'asteroid_belt',
                              data: asteroid_belt,
                            })
                          "
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

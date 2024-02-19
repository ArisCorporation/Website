<script setup lang="ts">
const { readItems, readSingleton } = useDirectusItems();
const starmapLoaded = ref(false);
const historyIndex = ref(0);

const tabs = [
  {
    id: 0,
    header: 'Starmap',
    icon: 'IconsNavigationStarmapMainTab',
  },
  {
    id: 1,
    header: 'Geschichte der Erkundung',
    icon: 'IconsNavigationStarmapExploration',
  },
  {
    id: 2,
    header: 'Entfernungen im Verse',
    icon: 'IconsNavigationStarmapDistances',
  },
  {
    id: 3,
    header: 'Sprungpunkt Verbindungen',
    icon: 'IconsNavigationStarmapJumppoints',
  },
  {
    id: 4,
    header: 'Grenzen der Völker',
    icon: 'IconsNavigationStarmapBoundaries',
  },
];
const selectedTab = ref(0);
const changeTab = (index: number) => {
  selectedTab.value = index;
  starmapLoaded.value = false;
};

// DATA
const data = await readSingleton('starmap', {
  fields: ['history', 'history_introduction', 'distances', 'jumppoint_connections', 'borders'],
});
const systems = await readItems('systems', {
  fields: [
    'id',
    'name',
    'slug',
    'banner',
    'affiliation',
    'starmap_position_left',
    'starmap_position_top',
    'orbit.collection',
  ],
  filter: {
    status: 'published',
    starmap_position_left: { _nnull: true },
  },
});

// STARMAP
const starmapIcons = reactive([
  {
    starmap_id: 'ayrka',
    left: 3.12,
    top: 8.12,
  },
]);

definePageMeta({
  layout: false,
});

useHead({
  title: 'ARK Starmap',
});
</script>
<template>
  <NuxtLayout name="verse-exkurs">
    <TabGroup :tablist="tabs" :store="selectedTab" :change="changeTab">
      <template #tablist>
        <div
          class="flex flex-wrap items-center justify-between w-full gap-2 px-6 mx-auto md:px-12 sm:gap-6 lg:grid lg:grid-cols-5 lg:w-fit lg:gap-x-12"
        >
          <button
            v-for="tab in tabs"
            @click="changeTab(tab.id)"
            class="w-16 h-16 mx-auto transition sm:w-24 sm:h-24 md:w-32 md:h-32"
            :class="[selectedTab === tab.id ? 'opacity-100' : 'opacity-50 hover:opacity-100']"
          >
            <Icon :name="tab.icon" class="w-full h-full p-1" />
          </button>
        </div>
      </template>
      <template #tabcontent>
        <template v-if="selectedTab === 0">
          <h2 class="hidden m-0 text-center lg:block">
            Klicke einfach auf ein System um auf die Beschreibung zu gelangen.
          </h2>
          <h3 class="block m-0 text-center lg:hidden">Suche nach einem System um auf die Beschreibung zu gelangen.</h3>
          <div class="hidden lg:block">
            <DefaultPanel bg="bprimary">
              <div>
                <NuxtImg
                  src="e3b8e2b3-5657-4112-ab8f-c0f1311e9a6b"
                  :placeholder="[16, 16, 1, 5]"
                  @contextmenu.native="(e) => e.preventDefault()"
                />
                <div class="relative w-full h-fit">
                  <UPopover
                    v-if="starmapLoaded"
                    v-for="system in systems"
                    :popper="{ placement: 'right' }"
                    mode="hover"
                    :style="{ left: `${system.starmap_position_left}%`, top: `${system.starmap_position_top}%` }"
                    class="absolute w-[1.65%] h-auto aspect-[1/1]"
                  >
                    <NuxtLink
                      :to="'/verseexkurs/starmap/' + system.slug"
                      class="w-full h-auto aspect-[1/1] group absolute top-0"
                    >
                      <!-- class="absolute w-[1.65%] h-auto aspect-[1/1] group" -->
                      <Icon
                        :name="
                          'IconsNavigationStarmap' +
                          (system.affiliation === 'in_development'
                            ? 'Indevelopment'
                            : system.affiliation[0].toUpperCase() + system.affiliation.slice(1))
                        "
                        class="absolute z-10 w-full h-auto aspect-square"
                      />
                      <div
                        class="w-full h-full rounded-full aspect-[1/1] animate-pulse group-hover:animate-ping bg-aris-400/75 group-hover:bg-aris-400 blur-sm"
                      />
                    </NuxtLink>
                    <template #panel>
                      <div class="items-center p-4 mx-auto">
                        <NuxtImg
                          :src="system?.banner || '650aba1c-3182-40a6-8185-a8f3d164ef2b'"
                          :placeholder="[16, 16, 1, 5]"
                          class="w-56 h-20 mx-auto border rounded border-btertiary"
                          :class="{ 'object-cover': system.banner }"
                        />
                        <h3 class="mt-1.5 leading-4 text-aris-400">{{ system.name }}</h3>
                        <hr
                          class="-mx-1 mb-3 mt-2 relative bg-bprimary text-primary-400 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
                        />
                        <div class="px-2 border rounded-lg bg-bprimary border-btertiary">
                          <div class="p-2">
                            <TableRow title="Zugehörigkeit">
                              <span class="flex items-center gap-x-1 text-aris-400">
                                {{
                                  system.affiliation
                                    ? system.affiliation === 'uee'
                                      ? 'UEE'
                                      : system.affiliation === 'in_development'
                                        ? 'In Entwicklung'
                                        : system.affiliation === 'unclaimed'
                                          ? 'Nicht Beansprucht'
                                          : system.affiliation === 'banu'
                                            ? 'Banu'
                                            : system.affiliation === 'xian'
                                              ? `Xi'An`
                                              : system.affiliation === 'vanduul' && 'Vanduul'
                                    : null
                                }}
                                <Icon
                                  :name="
                                    'IconsNavigationStarmap' +
                                    (system.affiliation === 'in_development'
                                      ? 'Indevelopment'
                                      : system.affiliation[0].toUpperCase() + system.affiliation.slice(1))
                                  "
                                />
                              </span>
                            </TableRow>
                            <TableHr />
                            <TableRow
                              title="Planeten"
                              :content="system.orbit.filter((e) => e.collection === 'planets').length"
                            />
                            <TableHr />
                            <TableRow
                              title="Jumppoints"
                              :content="system.orbit.filter((e) => e.collection === 'jumppoints').length"
                            />
                            <TableHr />
                            <TableRow
                              title="Asteroidengürtel"
                              :content="system.orbit.filter((e) => e.collection === 'asteroid_belts').length"
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </UPopover>
                  <NuxtImg
                    src="59e8771b-d5a2-468e-971d-7594da3c113e"
                    :placeholder="[16, 16, 1, 5]"
                    format=""
                    @load="() => (starmapLoaded = true)"
                    class="pointer-events-none"
                  />
                </div>
              </div>
            </DefaultPanel>
          </div>
        </template>
        <template v-if="selectedTab === 1">
          <div v-html="data.history_introduction" />
          <div class="relative w-full aspect-[1200/841] h-auto">
            <button
              @click="historyIndex === 0 ? (historyIndex = data.history.length - 1) : (historyIndex -= 1)"
              class="absolute top-0 bottom-0 left-0 z-10 p-1 my-auto transition rounded-full opacity-75 cursor-pointer h-fit bg-bsecondary hover:opacity-100"
            >
              <Icon name="heroicons:chevron-left-16-solid" class="w-8 h-auto aspect-square" />
            </button>
            <button
              @click="historyIndex === data.history.length - 1 ? (historyIndex = 0) : (historyIndex += 1)"
              class="absolute top-0 bottom-0 right-0 z-10 p-1 my-auto transition rounded-full opacity-75 cursor-pointer h-fit bg-bsecondary hover:opacity-100"
            >
              <Icon name="heroicons:chevron-right-16-solid" class="w-8 h-auto aspect-square" />
            </button>
            <div class="absolute bottom-0 left-0 right-0 flex gap-2 mx-auto md:gap-4 w-fit h-fit">
              <div
                v-for="(item, index) in data.history"
                @click="historyIndex = index"
                :key="index"
                class="h-auto rounded-full cursor-pointer md:w-3 w-2 aspect-[1/1] hover:bg-aris-400/75"
                :class="[historyIndex === index ? 'bg-aris-400' : 'bg-btertiary']"
              />
            </div>
            <NuxtImg
              v-for="(item, index) in data.history"
              :key="index"
              :src="item.image.split('.')[0]"
              preload
              class="absolute w-full px-6 sm:px-12"
              :class="{ hidden: historyIndex !== index }"
            />
          </div>
          <h2 class="text-center">
            <span class="text-aris-400">{{ data.history[historyIndex].year }}</span
            >{{ data.history[historyIndex].title ? ': ' + data.history[historyIndex].title : '' }}
          </h2>
          <div v-html="data.history[historyIndex].description" />
        </template>
        <template v-if="selectedTab === 2">
          <div v-html="data.distances" />
        </template>
        <template v-if="selectedTab === 3">
          <div v-html="data.jumppoint_connections" />
        </template>
        <template v-if="selectedTab === 4">
          <div v-html="data.borders" />
        </template>
      </template>
    </TabGroup>
  </NuxtLayout>
</template>

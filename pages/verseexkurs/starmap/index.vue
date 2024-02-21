<script setup lang="ts">
const { readItems, readSingleton } = useDirectusItems();
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
    'status',
    'name',
    'slug',
    'banner',
    'affiliation',
    'starmap_position_left',
    'starmap_position_top',
    'orbit.collection',
  ],
  filter: {
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
                  class="w-1/2 h-fit aspect-[637/160]"
                />
                <div class="relative w-full h-fit">
                  <UPopover
                    v-for="system in systems.filter((e) => e.status === 'published')"
                    :popper="{ placement: 'right' }"
                    mode="hover"
                    :style="{ left: `${system.starmap_position_left}%`, top: `${system.starmap_position_top}%` }"
                    class="absolute w-[1.65%] h-auto aspect-[1/1]"
                  >
                    <NuxtLink
                      :to="system.status === 'published' && '/verseexkurs/starmap/' + system.slug"
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
                  <div
                    v-for="system in systems.filter((e) => e.status !== 'published')"
                    :style="{ left: `${system.starmap_position_left}%`, top: `${system.starmap_position_top}%` }"
                    class="absolute w-[1.65%] h-auto aspect-[1/1]"
                  >
                    <Icon
                      :name="
                        'IconsNavigationStarmap' +
                        (system.affiliation === 'in_development'
                          ? 'Indevelopment'
                          : system.affiliation[0].toUpperCase() + system.affiliation.slice(1))
                      "
                      class="absolute z-10 w-full h-auto aspect-square"
                    />
                  </div>
                  <div class="aspect-[3840/2655] w-full h-auto relative">
                    <NuxtImg
                      src="fcbbe4f2-7bf2-49fc-828c-4037c47dafe3"
                      id="starmap-names-uee"
                      :placeholder="[16, 16, 1, 5]"
                      class="absolute top-0 left-0 pointer-events-none"
                    />
                    <NuxtImg
                      src="b25ab791-24ae-47f0-aecb-96e770d3235f"
                      id="starmap-names-banu"
                      :placeholder="[16, 16, 1, 5]"
                      class="absolute top-0 left-0 pointer-events-none"
                    />
                    <NuxtImg
                      src="7977fb47-9b37-4857-9f51-20d53680dfb5"
                      id="starmap-names-vanduul"
                      :placeholder="[16, 16, 1, 5]"
                      class="absolute top-0 left-0 pointer-events-none"
                    />
                    <NuxtImg
                      src="852522cb-8df8-4c22-801f-879b8424a5ef"
                      id="starmap-names-xian"
                      :placeholder="[16, 16, 1, 5]"
                      class="absolute top-0 left-0 pointer-events-none"
                    />
                    <NuxtImg
                      src="b9b06b08-d3a4-4a24-8056-3425f3c85379"
                      id="starmap-names-unclaimed"
                      :placeholder="[16, 16, 1, 5]"
                      class="absolute top-0 left-0 pointer-events-none"
                    />
                    <NuxtImg
                      src="90bab722-42a9-4a83-b453-1552e7abda5d"
                      id="starmap-names-development"
                      :placeholder="[16, 16, 1, 5]"
                      class="absolute top-0 left-0 pointer-events-none"
                    />
                    <NuxtImg
                      src="fc7bd959-b2ff-466e-8445-2948e84735f3"
                      id="starmap-jumppoints-small"
                      :placeholder="[16, 16, 1, 5]"
                      class="absolute top-0 left-0 pointer-events-none"
                    />
                    <NuxtImg
                      src="dd257e4a-36cd-4418-87d3-9465ab9c2f34"
                      id="starmap-jumppoints-medium"
                      :placeholder="[16, 16, 1, 5]"
                      class="absolute top-0 left-0 pointer-events-none"
                    />
                    <NuxtImg
                      src="053d9d72-7519-461e-8a55-971f84927fd4"
                      id="starmap-jumppoints-large"
                      :placeholder="[16, 16, 1, 5]"
                      class="absolute top-0 left-0 pointer-events-none"
                    />
                  </div>
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

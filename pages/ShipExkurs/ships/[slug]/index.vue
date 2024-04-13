<script setup lang="ts">
import LiteYouTubeEmbed from 'vue-lite-youtube-embed';
import 'vue-lite-youtube-embed/style.css';

const { readAsyncUsers } = useDirectusUsers();
const { readAsyncItems } = useDirectusItems();
const { params } = useRoute();
const { copy, isSupported: clipboardIsSupported } = useClipboard();
const toast = useToast();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const commercial_video = ref();
const commercial_container = ref();
const commercial_fullscreen_state = ref(false);
const config = useRuntimeConfig();
const commercial_show_playing_overlay = ref(false);
const commercial_show_overlay = computed(() => commercial_show_playing_overlay.value || commercial_waiting.value);

const selectedTab = ref(0);
const setTab = (index: number) => {
  selectedTab.value = index;
};

const { data } = await readAsyncItems('ships', {
  query: {
    fields: [
      'id',
      'name',
      'slug',
      'store_image',
      'production_status',
      'description',
      'history',
      'length',
      'beam',
      'height',
      'mass',
      'cargo',
      'classification',
      'size',
      'crew_min',
      'crew_max',
      'quantum_fuel_tanks',
      'hydrogen_fuel_tanks',
      'pledge_price',
      'price',
      'speed_scm',
      'speed_max',
      'acceleration_main',
      'acceleration_retro',
      'acceleration_vtol',
      'acceleration_maneuvering',
      'insurance_claim_time',
      'insurance_expedited_time',
      'insurance_expedited_cost',
      'manufacturer.name',
      'manufacturer.slug',
      'manufacturer.logo',
      'gallery.directus_files_id',
      'commercial_video_id',
      'commercial',
    ],
    filter: {
      slug: { _eq: params.slug },
    },
  },
  transform: (rawShips: any[]) => transformShip(rawShips[0]),
});

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Daten konnten nicht aus der Schiffsdatenbank geladen werden.',
    fatal: true,
  });
}

const handleShare = () => {
  try {
    if (!clipboardIsSupported || !location?.href) throw 0;
    copy(location.href);
    toast.add({ title: 'URL in Zwischenablage kopiert!' });
  } catch {
    toast.add({ title: 'Es konnte leider nichts in die Zwischenablage kopiert werden.', color: 'red' });
  }
  // if (clipboardIsSupported && location?.href) {
  //   copy(location.href);
  //   toast.add({ title: 'URL in Zwischenablage kopiert!' });
  // } else {
  //   toast.add({ title: 'Es konnte leider nichts in die Zwischenablage kopiert werden.' });
  // }
};

const tablist = computed(() => [
  ...(data.value?.nothing ? [{ id: '1', header: 'Austattung' }] : []),
  ...(data.value.history ? [{ id: '2', header: 'Geschichte' }] : []),
  ...(data.value.gallery[0] ? [{ id: '3', header: 'Gallerie' }] : []),
  ...(data.value.commercial_video_id && data.value.commercial ? [{ id: '4', header: 'Commercial' }] : []),
  ...(data.value.rating ? [{ id: '5', header: 'Wertung' }] : []),
]);

const commercial_poster_url = computed(
  () => `https://img.youtube.com/vi/${data.value.commercial_video_id}/maxresdefault.jpg`,
);

const {
  playing: commercial_playing,
  currentTime: commercial_current_time,
  duration: commercial_duration,
  waiting: commercial_waiting,
  volume: commercial_volume,
  muted: commercial_muted,
} = useMediaControls(commercial_video, {
  src: config.public.fileBase + data.value.commercial,
});

function commercial_fullscreen_toggle() {
  const fullscreen = document.querySelector('#commercial_container');

  if (!commercial_fullscreen_state.value) fullscreen.requestFullscreen();
  else document.exitFullscreen();

  commercial_fullscreen_state.value = !commercial_fullscreen_state.value;
}

watch(commercial_playing, async () => {
  commercial_show_playing_overlay.value = true;
  await setTimeout(() => {
    commercial_show_playing_overlay.value = false;
  }, 400);
});

defineShortcuts({
  k: {
    handler: () => {
      commercial_playing.value = !commercial_playing.value;
    },
  },
  j: {
    handler: () => {
      commercial_current_time.value -= 5;
    },
  },
  l: {
    handler: () => {
      commercial_current_time.value += 5;
    },
  },
  arrowleft: {
    handler: () => {
      commercial_current_time.value -= 5;
    },
  },
  arrowright: {
    handler: () => {
      commercial_current_time.value += 5;
    },
  },
  m: {
    handler: () => {
      commercial_muted.value = !commercial_muted.value;
    },
  },
  ',': {
    handler: () => {
      commercial_volume.value = Math.max(0, Math.min(commercial_volume.value - 0.1, 1));
    },
  },
  '.': {
    handler: () => {
      commercial_volume.value = Math.max(0, Math.min(commercial_volume.value + 0.1, 1));
    },
  },
  arrowdown: {
    handler: () => {
      commercial_volume.value = Math.max(0, Math.min(commercial_volume.value - 0.1, 1));
    },
  },
  arrowup: {
    handler: () => {
      commercial_volume.value = Math.max(0, Math.min(commercial_volume.value + 0.1, 1));
    },
  },
  f: {
    handler: () => {
      commercial_fullscreen_toggle();
    },
  },
});

definePageMeta({
  layout: 'ship-exkurs',
});

useHead({
  title: data.value?.name,
});
</script>

<template>
  <div>
    <div class="flex flex-wrap justify-between">
      <div class="mt-auto">
        <h1 class="mb-0 text-industrial-400">{{ data.name }}</h1>
        <h4 class="mb-0 text-xs uppercase md:text-lg">
          <span class="text-dark-gray">Status: </span
          ><span class="italic text-light-gray">{{ data.production_status }}</span>
        </h4>
      </div>
      <div>
        <NuxtLink to="/verseexkurs/companies/" + data.manufacturer.slug>
          <NuxtImg :src="data.manufacturer.logo" class="h-20 -mb-4 md:-mb-8 md:h-40 w-fit" />
        </NuxtLink>
      </div>
    </div>
    <hr class="my-3" />
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-3 space-y-4 xl:col-span-2">
        <div class="w-full">
          <DefaultPanel>
            <NuxtImg :src="data.store_image" class="h-[300px] lg:h-[600px] xl:h-[700px] w-full object-cover" />
          </DefaultPanel>
          <DefaultPanel bg="bprimary">
            <Editor v-model="data.description" render-mode />
          </DefaultPanel>
        </div>
      </div>
      <div class="col-span-3 space-y-4 xl:col-span-1">
        <TableParent title="Basis">
          <TableRow title="Länge" :content="data.length" suffix="M" third />
          <TableRow title="Breite" :content="data.beam" suffix="M" third />
          <TableRow title="Höhe" :content="data.height" suffix="M" third />
          <TableHr />
          <TableRow
            title="Gewicht"
            :content="data.mass && Math.round((data.mass / 1000 + Number.EPSILON) * 100) / 100"
            suffix="T"
          />
          <TableRow title="Frachtkapazität" :content="data.cargo" />
          <TableHr />
          <TableRow title="Klassifizierung" :content="null" />
          <TableRow title="Größe" :content="null" />
          <TableHr />
          <TableRow title="Min Crew" :content="data.crew_min" />
          <TableRow title="Max Crew" :content="data.crew_max" />
          <TableHr />
          <TableRow
            title="Treibstoff"
            :content="
              data.hydrogen_fuel_tanks &&
              data.hydrogen_fuel_tanks.reduce((partialSum: any, a: any) => partialSum + a.capacity, 0)
            "
            suffix="L"
          />
          <TableRow
            title="Quantum Treibstoff"
            :content="
              data.quantum_fuel_tanks &&
              data.quantum_fuel_tanks.reduce((partialSum: any, a: any) => partialSum + a.capacity, 0)
            "
            suffix="L"
          />
        </TableParent>
        <TableParent title="Kaufen">
          <TableRow title="Pledgewert" :content="data.pledge_price" prefix="$" />
          <TableRow title="Kaufpreis" :content="data.price" suffix="aUEC" />
          <!-- <TableHr />
          <TableRow title="Kaufbar bei" :content="null" /> -->
        </TableParent>
        <TableParent title="Geschwindigkeit">
          <TableRow title="SCM Geschwindigkeit" :content="data.speed_scm" />
          <TableRow title="Afterburner Speed" :content="data.speed_max" />
          <TableHr />
          <TableRow
            title="Haupt-Triebwerk Beschl."
            :content="data.acceleration_main && Math.round((data.acceleration_main + Number.EPSILON) * 100) / 100"
          />
          <TableRow
            title="Retro-Triebwerk Beschl."
            :content="data.acceleration_retro && Math.round((data.acceleration_retro + Number.EPSILON) * 100) / 100"
          />
          <TableRow
            title="VTOL-Triebwerk Beschl."
            :content="data.acceleration_vtol && Math.round((data.acceleration_vtol + Number.EPSILON) * 100) / 100"
          />
          <TableRow
            title="Manövrier-Triebwerk Beschl."
            :content="
              data.acceleration_maneuvering && Math.round((data.acceleration_maneuvering + Number.EPSILON) * 100) / 100
            "
          />
        </TableParent>
        <TableParent title="Versicherung">
          <TableRow title="Zeit" :content="data.insurance_claim_time" suffix="Minuten" />
          <TableRow title="Besch. Zeit" :content="data.insurance_expedited_time" suffix="Minuten" />
          <TableRow title="Besch. Preis" :content="data.insurance_expedited_cost" suffix="aUEC" />
        </TableParent>
        <ButtonDefault @click="handleShare" class="w-full">
          <UIcon name="i-heroicons-share" class="flex w-4 h-4 m-auto" />
        </ButtonDefault>
      </div>
    </div>
    <TabGroup :tablist="tablist" :store="selectedTab" :change="(i) => (selectedTab = i)" between>
      <template #tabcontent>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '1')"> Austattung </template>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '2')">
          <DefaultPanel bg="bprimary" class="mb-3">
            <div class="px-8">
              <Editor v-if="data.history" v-model="data.history" render-mode />
            </div>
          </DefaultPanel>
        </template>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '3')">
          <DefaultPanel bg="bprimary" class="mx-auto mb-3 w-fit h-fit">
            <UCarousel
              :items="data.gallery"
              :ui="{ item: 'flex flex-none snap-center w-full aspect-[16/9]' }"
              class="max-h-[calc(100vh-4rem)] aspect-[16/9] w-auto relative"
              arrows
              indicators
            >
              <template #default="{ item }">
                <NuxtImg :src="item" class="object-cover w-full h-auto" draggable="false" />
              </template>

              <template #prev="{ onClick, disabled }">
                <UButton
                  color="gray"
                  class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 left-4 group"
                  :disabled="disabled"
                  @click="onClick"
                >
                  <UIcon
                    name="i-heroicons-chevron-left-20-solid"
                    class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
                  />
                </UButton>
              </template>

              <template #next="{ onClick, disabled }">
                <UButton
                  color="gray"
                  class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 right-4 group"
                  :disabled="disabled"
                  @click="onClick"
                >
                  <UIcon
                    name="i-heroicons-chevron-right-20-solid"
                    class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
                  />
                </UButton>
              </template>
            </UCarousel>
          </DefaultPanel>
        </template>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '4')">
          <div id="commercial_container" class="my-auto">
            <DefaultPanel bg="bprimary" class="mb-3">
              <div>
                <div @click="commercial_playing = !commercial_playing" class="relative w-full h-fit">
                  <div
                    class="absolute z-10 flex items-center justify-center w-full h-full transition-all duration-500 bg-black"
                    :class="[commercial_show_overlay ? 'opacity-50' : 'opacity-0']"
                  >
                    <Transition
                      appear
                      enter-active-class="transition-all duration-500"
                      leave-active-class=""
                      enter-from-class="scale-0 opacity-0"
                      enter-to-class="scale-125 opacity-100"
                      leave-from-class="scale-0 opacity-100"
                      leave-to-class="scale-0 opacity-0"
                    >
                      <UIcon
                        v-if="commercial_show_playing_overlay"
                        :name="commercial_playing ? 'i-heroicons-play' : 'i-heroicons-pause'"
                        class="w-14 h-auto aspect-[1/1] absolute"
                      />
                    </Transition>
                    <Transition
                      appear
                      enter-active-class="transition-all duration-500"
                      leave-active-class=""
                      enter-from-class="opacity-0"
                      enter-to-class="opacity-100"
                      leave-from-class="opacity-100"
                      leave-to-class="opacity-0"
                    >
                      <UIcon
                        v-if="commercial_waiting"
                        name="i-svg-spinners-90-ring-with-bg"
                        class="w-14 h-auto aspect-[1/1] absolute"
                      />
                    </Transition>
                  </div>
                  <video
                    ref="commercial_video"
                    :poster="commercial_poster_url"
                    class="w-full"
                    :class="[
                      commercial_fullscreen_state
                        ? 'h-screen max-h-[calc(100vh-82px)]'
                        : 'h-fit max-h-[calc(100vh-8rem)]',
                    ]"
                    :style="{
                      aspectRatio: `${commercial_video?.videoWidth} / ${commercial_video?.videoHeight}`,
                    }"
                  />
                </div>
                <div class="w-full px-2 pb-2 mt-1 space-y-2">
                  <URange
                    v-model="commercial_current_time"
                    :max="commercial_duration"
                    :step="0.1"
                    :animation="commercial_waiting && 'carousel'"
                  />
                  <div class="flex justify-between w-full h-full">
                    <div class="flex items-center gap-x-2">
                      <UButton @click="commercial_playing = !commercial_playing" color="inverted">
                        <Transition
                          appear
                          enter-active-class="transition-all duration-500"
                          leave-active-class="absolute transition-all duration-500"
                          enter-from-class="opacity-0"
                          enter-to-class="opacity-100"
                          leave-from-class="opacity-100"
                          leave-to-class="opacity-0"
                        >
                          <UIcon
                            v-if="!commercial_playing"
                            :name="commercial_playing ? 'i-heroicons-pause' : 'i-heroicons-play'"
                            class="w-5 aspect-[1/1] h-auto"
                          />
                        </Transition>
                        <Transition
                          appear
                          enter-active-class="transition-all duration-500"
                          leave-active-class="absolute transition-all duration-500"
                          enter-from-class="opacity-0"
                          enter-to-class="opacity-100"
                          leave-from-class="opacity-100"
                          leave-to-class="opacity-0"
                        >
                          <UIcon
                            v-if="commercial_playing"
                            :name="commercial_playing ? 'i-heroicons-pause' : 'i-heroicons-play'"
                            class="w-5 aspect-[1/1] h-auto"
                          />
                        </Transition>
                      </UButton>
                      <UButton
                        @click="commercial_muted = !commercial_muted"
                        color="inverted"
                        :icon="commercial_muted ? 'i-heroicons-speaker-x-mark' : 'i-heroicons-speaker-wave'"
                      />
                      <URange
                        v-model="commercial_volume"
                        :disabled="commercial_muted"
                        :min="0"
                        :max="1"
                        :step="0.001"
                        class="w-32"
                      />
                      <div>
                        {{
                          String(Math.round((commercial_current_time / 60 + Number.EPSILON) * 100) / 100).replace(
                            '.',
                            ':',
                          )
                        }}
                        /
                        {{
                          String(Math.round((commercial_duration / 60 + Number.EPSILON) * 100) / 100).replace('.', ':')
                        }}
                      </div>
                    </div>
                    <div class="flex items-center gap-x-2">
                      <UButton
                        @click="commercial_fullscreen_toggle"
                        color="inverted"
                        :icon="commercial_fullscreen_state ? 'i-mdi-fullscreen-exit' : 'i-mdi-fullscreen'"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DefaultPanel>
          </div>
        </template>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '5')">
          <DefaultPanel bg="bprimary" class="mb-3"> Wertung </DefaultPanel>
        </template>
      </template>
    </TabGroup>
  </div>
</template>

<style scoped>
video[poster] {
  object-fit: cover;
}
</style>

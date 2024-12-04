<script setup lang="ts">
import type { Ships } from '~/types/cms-types';
import { computed, ref, shallowRef, toRefs, watchEffect, watch } from 'vue';
import { Spherical, Vector3 } from 'three';

const { directus, readItems } = useCMS();
const { params } = useRoute();
const { copy, isSupported: clipboardIsSupported } = useClipboard();
const toast = useToast();
const config = useRuntimeConfig();
const carousel = ref();
const store_image_view = ref(true);
const auto_rotate = ref(true);
const camera_zoom = ref(true);
const orbit_controls = ref();
const modalStore = useModalStore();

const props = defineProps<{
  ship: Ships;
}>();

const open = defineModel('open');

const handleShare = () => {
  try {
    if (!clipboardIsSupported || !location?.href)
      throw new Error('clipboard is not supported or location.href is not set');
    copy(location.href);
    toast.add({ title: 'URL in Zwischenablage kopiert!' });
  } catch {
    toast.add({ title: 'Es konnte leider nichts in die Zwischenablage kopiert werden.', color: 'red' });
  }
};

const stars_props = {
  size: 0.1,
  sizeAttenuation: true,
  transparent: true,
  alphaTest: 0.01,
  alphaMap: null,
  count: 500,
  depth: 50,
  radius: 100,
};

const stars_position = ref();
const stars_scale = ref();

const {
  radius: stars_radius,
  depth: stars_depth,
  count: stars_count,
  size: stars_size,
  sizeAttenuation: stars_sizeAttenuation,
  transparent: stars_transparent,
  alphaMap: stars_alphaMap,
  alphaTest: stars_alphaTest,
} = toRefs(stars_props);

const setStars = () => {
  let circle = stars_radius.value + stars_depth.value;
  const increment = computed(() => stars_depth.value / stars_count.value);

  const positionArray: number[] = [];
  const scaleArray: number[] = Array.from({ length: stars_count.value }, () => (0.5 + 0.5 * Math.random()) * 4);

  const generateStars = (circle: number): Array<number> => {
    const starArray = new Vector3()
      .setFromSpherical(new Spherical(circle, Math.acos(1 - Math.random() * 2), Math.random() * 2 * Math.PI))
      .toArray();
    return starArray;
  };

  for (let i = 0; i < stars_count.value; i++) {
    circle -= increment.value * Math.random();
    positionArray.push(...generateStars(circle));
  }
  stars_position.value = new Float32Array(positionArray);
  stars_scale.value = new Float32Array(scaleArray);
};

watch(props, () => {
  console.log(props);
});

watchEffect(() => {
  setStars();
});

const starsRef = shallowRef();
</script>
<template>
  <Teleport to="#teleports">
    <div v-if="open" class="fixed inset-0 bg-black/10 backdrop-blur z-[998]" @click="open = !open" />
    <div
      v-if="open"
      class="w-[calc(100vw_-_80px)] h-[calc(100vh_-_80px)] bg-bprimary/90 absolute z-[999] top-[30px] left-1/2 -translate-x-1/2 overflow-y-auto px-2 rounded-xl pb-4"
    >
      <UButton color="inverted" class="sticky float-right top-2 size-9 z-[99]" @click="open = !open">
        <UIcon name="i-heroicons-x-mark" class="flex size-8" />
      </UButton>
      <div class="flex flex-wrap-reverse justify-between">
        <div class="mt-auto">
          <h1 class="mb-0 text-industrial-400">
            <span class="text-neutral-200">{{ ship?.manufacturer?.name }}</span> {{ ship?.name }}
          </h1>
          <h4 class="mb-0 text-xs uppercase md:text-lg">
            <span class="text-dark-gray">Status: </span
            ><span class="italic text-light-gray">{{ ship?.production_status }}</span>
          </h4>
        </div>
        <div class="ml-auto">
          <NuxtLink :to="`/verseexkurs/companies/${ship?.manufacturer?.slug}`">
            <NuxtImg :src="ship?.manufacturer?.logo" class="h-20 md:h-40 w-fit" />
          </NuxtLink>
        </div>
      </div>
      <hr class="my-3" />
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-3 space-y-4 xl:col-span-2">
          <DefaultPanel bg="bprimary">
            <div class="h-[300px] lg:h-[600px] xl:h-[700px] w-full z-50 relative">
              <div v-if="ship?.hologram" class="absolute z-40 rotate-10 top-1 right-2">
                <ButtonDefault :active="!store_image_view" @click="store_image_view = !store_image_view">
                  3D
                </ButtonDefault>
              </div>
              <div v-if="!store_image_view" class="absolute z-40 space-x-2 rotate-10 bottom-1 right-2">
                <UTooltip :text="`Auto-Rotation ${camera_zoom ? 'deaktivieren' : 'aktivieren'}`">
                  <ButtonDefault :active="auto_rotate" class="size-fit" @click="auto_rotate = !auto_rotate">
                    <UIcon name="i-lucide-orbit" class="flex size-5" />
                  </ButtonDefault>
                </UTooltip>
                <UTooltip :text="`Zoom ${camera_zoom ? 'deaktivieren' : 'aktivieren'}`">
                  <ButtonDefault :active="camera_zoom" class="size-fit" @click="camera_zoom = !camera_zoom">
                    <UIcon name="i-heroicons-magnifying-glass-16-solid" class="flex size-5" />
                  </ButtonDefault>
                </UTooltip>
              </div>
              <NuxtImg
                v-if="store_image_view"
                :src="ship?.store_image"
                class="object-cover size-full"
                :style="{ 'object-position': ship?.store_image_properties?.object_position }"
              />
              <TresCanvas
                v-else-if="!store_image_view && ship?.hologram"
                clear-color="#111"
                :tone-mapping-exposure="1"
                tone-mapping="ACESFilmicToneMapping"
                alpha
              >
                <TresPerspectiveCamera :position="[0, 20, 80]" />
                <TcientosOrbitControls
                  ref="orbit_controls"
                  :enable-zoom="camera_zoom"
                  :auto-rotate="auto_rotate"
                  :auto-rotate-speed="1"
                  make-default
                />
                <!-- <TcientosStars
								:radius="100"
								:count="500"
							/> -->
                <TresPoints ref="starsRef">
                  <TresBufferGeometry :position="[stars_position, 3]" :a-scale="[stars_scale, 1]" />
                  <TresPointsMaterial
                    :size="stars_size"
                    :size-attenuation="stars_sizeAttenuation"
                    :transparent="stars_transparent"
                    :alpha-test="stars_alphaTest"
                    :alpha-map="stars_alphaMap"
                  />
                </TresPoints>
                <Suspense>
                  <TcientosUseGLTFComponent :path="$config.public.fileBase + ship?.hologram" draco />
                </Suspense>

                <TresAmbientLight :intensity="1" />
                <TresDirectionalLight :position="[0, 100, 0]" :intensity="1.5" />
                <TresDirectionalLight :position="[0, -100, 0]" :intensity="1.5" />
              </TresCanvas>
            </div>
          </DefaultPanel>
          <DefaultPanel v-if="ship?.description" bg="bprimary">
            <Editor :model-value="ship?.description" read-only />
          </DefaultPanel>
        </div>
        <div class="col-span-3 space-y-4 xl:col-span-1">
          <TableParent title="Basis">
            <TableRow title="Länge" :content="ship?.length" suffix="M" third />
            <TableRow title="Breite" :content="ship?.beam" suffix="M" third />
            <TableRow title="Höhe" :content="ship?.height" suffix="M" third />
            <TableHr />
            <TableRow
              title="Gewicht"
              :content="ship?.mass && Math.round((ship?.mass / 1000 + Number.EPSILON) * 100) / 100"
              suffix="T"
            />
            <TableRow title="Frachtkapazität" :content="ship?.cargo" />
            <TableHr />
            <TableRow title="Klassifizierung" :content="null" />
            <TableRow title="Größe" :content="null" />
            <TableHr />
            <TableRow title="Min Crew" :content="ship?.crew_min" />
            <TableRow title="Max Crew" :content="ship?.crew_max" />
            <TableHr />
            <TableRow
              title="Treibstoff"
              :content="
							ship?.hydrogen_fuel_tanks
								&& ship?.hydrogen_fuel_tanks?.reduce((partialSum: any, a: any) => partialSum + a.capacity, 0)
						"
              suffix="L"
            />
            <TableRow
              title="Quantum Treibstoff"
              :content="
							ship?.quantum_fuel_tanks
								&& ship?.quantum_fuel_tanks?.reduce((partialSum: any, a: any) => partialSum + a.capacity, 0)
						"
              suffix="L"
            />
          </TableParent>
          <TableParent title="Kaufen">
            <TableRow title="Pledgewert" :content="ship?.pledge_price" prefix="$" />
            <TableRow title="Kaufpreis" :content="ship?.price" suffix="aUEC" />
            <!-- <TableHr />
          <TableRow title="Kaufbar bei" :content="null" /> -->
          </TableParent>
          <TableParent title="Geschwindigkeit">
            <TableRow title="SCM Geschwindigkeit" :content="ship?.speed_scm" />
            <TableRow title="Afterburner Speed" :content="ship?.speed_max" />
            <TableHr />
            <TableRow
              title="Haupt-Triebwerk Beschl."
              :content="ship?.acceleration_main && Math.round((ship?.acceleration_main + Number.EPSILON) * 100) / 100"
            />
            <TableRow
              title="Retro-Triebwerk Beschl."
              :content="ship?.acceleration_retro && Math.round((ship?.acceleration_retro + Number.EPSILON) * 100) / 100"
            />
            <TableRow
              title="VTOL-Triebwerk Beschl."
              :content="ship?.acceleration_vtol && Math.round((ship?.acceleration_vtol + Number.EPSILON) * 100) / 100"
            />
            <TableRow
              title="Manövrier-Triebwerk Beschl."
              :content="
                ship?.acceleration_maneuvering &&
                Math.round((ship?.acceleration_maneuvering + Number.EPSILON) * 100) / 100
              "
            />
          </TableParent>
          <TableParent title="Versicherung">
            <TableRow title="Zeit" :content="ship?.insurance_claim_time" suffix="Minuten" />
            <TableRow title="Besch. Zeit" :content="ship?.insurance_expedited_time" suffix="Minuten" />
            <TableRow title="Besch. Preis" :content="ship?.insurance_expedited_cost" suffix="aUEC" />
          </TableParent>
          <TableParent title="API Statistiken">
            <TableRow
              title="Letztes Update der Daten"
              :content="ship?.date_updated ? new Date(ship?.date_updated).toLocaleDateString('de-DE') : null"
              full-width
            />
            <TableRow
              title="P4K-Daten"
              :content="ship?.p4k_mode === true ? 'Aktiviert' : ship?.p4k_mode === false ? 'Deaktiviert' : null"
            />
            <TableRow title="P4K-Daten Version" :content="ship?.p4k_version" />
          </TableParent>
          <div class="flex flex-wrap max-w-full gap-2">
            <NuxtLink :to="ship?.store_url" external class="flex-grow text-neutral-200">
              <ButtonDefault class="w-full text-sm">
                <p v-if="!ship?.on_sale" class="p-0">RSI Seite</p>
                <p v-else-if="ship?.on_sale" class="p-0">
                  Aktuell zu verkaufen für: $ {{ ship?.pledge_price || 'N/A' }}
                </p>
              </ButtonDefault>
            </NuxtLink>
            <NuxtLink :to="'/shipexkurs/ships/' + ship?.slug" class="text-neutral-200">
              <ButtonDefault @click="handleShare">
                <UIcon name="i-material-symbols-open-in-new" class="flex m-auto size-5" />
              </ButtonDefault>
            </NuxtLink>
            <UDropdown
              :items="[
                [
                  ...(ship?.sales_url
                    ? [
                        {
                          label: 'RSI Promoseite',
                          icon: 'i-heroicons-presentation-chart-line',
                          to: ship?.sales_url,
                          external: true,
                          target: '_blank',
                        },
                      ]
                    : []),
                  ...(ship?.brochure
                    ? [
                        {
                          label: 'Brochure',
                          icon: 'i-heroicons-book-open',
                          to: $config.public.fileBase + ship?.brochure,
                          external: true,
                          target: '_blank',
                        },
                      ]
                    : []),
                  ...(!ship?.sales_url && !ship?.brochure
                    ? [
                        {
                          label: 'Keine Links vorhanden',
                          icon: 'i-heroicons-x-mark',
                          disabled: true,
                        },
                      ]
                    : []),
                ],
              ]"
              :popper="{ placement: 'bottom-start' }"
              :ui="{ width: 'w-56' }"
            >
              <ButtonDefault>
                <UIcon name="i-mdi-dots-vertical" class="flex m-auto size-5" />
              </ButtonDefault>
            </UDropdown>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ data: any }>();
const { directus, readItems } = useCMS();

const planetTab = ref<Record<string, string | null>>({});
const childTab = ref<Record<string, string | null>>({});
const contentCache = ref<Record<string, string | null>>({});
const contentLoading = ref<Record<string, boolean>>({});

function togglePlanetTab(slug: string, tab: string) {
  planetTab.value[slug] = planetTab.value[slug] === tab ? null : tab;
}
function toggleChildTab(slug: string, tab: string) {
  childTab.value[slug] = childTab.value[slug] === tab ? null : tab;
}

function getContent(item: any, slug: string): string | null {
  if (slug in contentCache.value) return contentCache.value[slug];
  return item.content ?? null;
}

async function openBeschreibung(item: any, collection: string, slug: string) {
  const isClosing = childTab.value[slug] === 'beschreibung';
  childTab.value[slug] = isClosing ? null : 'beschreibung';
  if (!isClosing && !item.content && !(slug in contentCache.value)) {
    contentLoading.value[slug] = true;
    try {
      const results: any[] = await directus.request(
        readItems(collection as any, {
          fields: ['slug', 'content'] as any,
          filter: { slug: { _eq: slug } } as any,
          limit: 1,
        }),
      );
      contentCache.value[slug] = results[0]?.content ?? null;
    } finally {
      contentLoading.value[slug] = false;
    }
  }
}

const tabLabels: Record<string, string> = {
  beschreibung: 'Beschreibung',
  oberflaeche: 'Oberfläche',
  landezone: 'Landezone',
  orbit: 'Orbit',
  info: 'Info',
};

const orderedItems = computed(() => {
  const result: Array<{ type: string; data: any }> = [];
  for (const star of props.data.stars || []) {
    result.push({ type: 'star', data: star });
  }
  let jpIndex = 0;
  for (const item of props.data.orbit || []) {
    if (item.collection === 'stars') continue;
    if (item.collection === 'planets') {
      const planet = (props.data.planets || []).find((p: any) => p.slug === item.object.slug);
      if (planet) result.push({ type: 'planet', data: planet });
    } else if (item.collection === 'asteroid_belts') {
      const ab = (props.data.asteroid_belts || []).find((ab: any) => ab.slug === item.object.slug);
      if (ab) result.push({ type: 'asteroid_belt', data: ab });
    } else if (item.collection === 'jumppoints') {
      const jp = (props.data.jumppoints || [])[jpIndex++];
      if (jp) result.push({ type: 'jumppoint', data: jp });
    }
  }
  return result;
});

function jpDestination(jp: any) {
  return jp.systems?.find((s: any) => s.name !== props.data.name);
}
function jpSizeLabel(size: string) {
  return ({ small: 'Klein', medium: 'Mittel', large: 'Groß' } as Record<string, string>)[size] || size;
}
</script>

<template>
  <div>
    <template v-for="(item, index) in orderedItems" :key="`${item.type}-${index}`">
      <!-- ─── STERN ──────────────────────────────────────────────────────── -->
      <div v-if="item.type === 'star'" class="border-b border-industrial-400/30">
        <div class="flex gap-3 px-3 py-3">
          <NuxtImg
            :src="item.data.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
            :placeholder="[16, 16, 1, 5]"
            class="w-20 h-20 shrink-0 object-cover rounded"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold">{{ item.data.name }} <span class="text-industrial-400">Stern</span></h3>
            <div class="flex gap-4 mt-1 text-xs text-gray-400">
              <span
                >Klassifizierung: <span class="text-industrial-400">{{ item.data.size }}</span></span
              >
              <span
                >Typ: <span class="text-aris-400">{{ item.data.type }}</span></span
              >
            </div>
            <div class="flex gap-2 mt-2">
              <button
                class="orbit-btn"
                :class="childTab[item.data.slug || item.data.name] === 'beschreibung' ? 'orbit-btn--active' : ''"
                @click="toggleChildTab(item.data.slug || item.data.name, 'beschreibung')"
              >
                <UIcon name="i-heroicons-document-text-20-solid" class="size-3.5" />
                Beschreibung
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="childTab[item.data.slug || item.data.name] === 'beschreibung'"
          class="border-t border-bsecondary border-l-2 border-l-aris-400"
        >
          <div
            class="flex items-center gap-1.5 px-4 py-2 bg-bsecondary/40 text-xs text-gray-400 border-b border-bsecondary"
          >
            <span>{{ item.data.name }}</span>
            <span class="text-gray-600">›</span>
            <span class="text-aris-400">Beschreibung</span>
          </div>
          <div v-if="item.data.content" class="p-4">
            <Editor :model-value="item.data.content" read-only />
          </div>
          <p v-else class="px-4 py-3 text-xs text-gray-500 italic">Keine Beschreibung verfügbar.</p>
        </div>
      </div>

      <!-- ─── PLANET ────────────────────────────────────────────────────── -->
      <div v-else-if="item.type === 'planet'" class="border-b border-industrial-400/30">
        <!-- Header -->
        <div
          class="flex gap-3 px-3 py-3 transition-colors"
          :class="planetTab[item.data.slug] ? 'border-l-2 border-aris-400' : 'border-l-2 border-transparent'"
        >
          <NuxtImg
            :src="item.data.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
            :placeholder="[16, 16, 1, 5]"
            class="w-20 h-20 shrink-0 object-cover rounded"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold mb-2">
              {{ item.data.astronomical_designation }}
              <template v-if="item.data.name">
                - <span class="text-aris-400">{{ item.data.name }}</span></template
              >
            </h3>

            <!-- Infobox -->
            <div class="border border-bsecondary text-xs mb-3 bg-bprimary/50 rounded-sm">
              <div class="grid grid-cols-2 divide-x divide-bsecondary">
                <div class="p-2">
                  <div class="font-semibold text-gray-300 border-b border-bsecondary pb-1 mb-1.5">Astronomisch</div>
                  <div class="space-y-0.5 text-gray-400">
                    <div>
                      Alter: <span class="text-aris-400">{{ item.data.age ?? 'N/A' }}</span>
                    </div>
                    <div>
                      Größe: <span class="text-aris-400">{{ item.data.size ?? 'N/A' }}</span>
                    </div>
                    <div>
                      Umlaufzeit: <span class="text-aris-400">{{ item.data.orbital_period ?? 'N/A' }}</span>
                    </div>
                    <div>
                      Distanz: <span class="text-aris-400">{{ item.data.distance ?? 'N/A' }}</span>
                    </div>
                    <div>
                      Typ: <span class="text-aris-400">{{ item.data.type || 'N/A' }}</span>
                    </div>
                  </div>
                </div>
                <div class="p-2">
                  <div class="font-semibold text-gray-300 border-b border-bsecondary pb-1 mb-1.5">
                    Politik & Wirtschaft
                  </div>
                  <div class="space-y-0.5 text-gray-400">
                    <div>
                      Habitabel: <span class="text-aris-400">{{ item.data.habitable ? 'Ja' : 'Nein' }}</span>
                    </div>
                    <div>
                      Fairchanceact: <span class="text-aris-400">{{ item.data.fairchanceact ? 'Ja' : 'Nein' }}</span>
                    </div>
                    <div>
                      Bevölkerung:
                      <span class="text-aris-400">{{
                        item.data.population != null ? item.data.population + ' / 10' : 'N/A'
                      }}</span>
                    </div>
                    <div>
                      Wirtschaft:
                      <span class="text-aris-400">{{
                        item.data.economy != null ? item.data.economy + ' / 10' : 'N/A'
                      }}</span>
                    </div>
                    <div>
                      Gefahrenstufe:
                      <span class="text-aris-400">{{
                        item.data.danger_level != null ? item.data.danger_level + ' / 10' : 'N/A'
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sub-Tab Buttons -->
            <div class="flex flex-wrap gap-2">
              <button
                class="orbit-btn"
                :class="planetTab[item.data.slug] === 'beschreibung' ? 'orbit-btn--active' : ''"
                @click="togglePlanetTab(item.data.slug, 'beschreibung')"
              >
                <UIcon name="i-heroicons-document-text-20-solid" class="size-3.5" />
                Beschreibung
              </button>
              <button
                class="orbit-btn"
                :class="planetTab[item.data.slug] === 'oberflaeche' ? 'orbit-btn--active' : ''"
                @click="togglePlanetTab(item.data.slug, 'oberflaeche')"
              >
                <UIcon name="i-heroicons-photo-20-solid" class="size-3.5" />
                Oberfläche
              </button>
              <button
                v-if="item.data.landing_zones?.length"
                class="orbit-btn"
                :class="planetTab[item.data.slug] === 'landezone' ? 'orbit-btn--active' : ''"
                @click="togglePlanetTab(item.data.slug, 'landezone')"
              >
                <UIcon name="i-heroicons-map-pin-20-solid" class="size-3.5" />
                Landezone
              </button>
              <button
                class="orbit-btn"
                :class="planetTab[item.data.slug] === 'orbit' ? 'orbit-btn--active' : ''"
                @click="togglePlanetTab(item.data.slug, 'orbit')"
              >
                <UIcon name="i-heroicons-arrow-path-20-solid" class="size-3.5" />
                Orbit
              </button>
            </div>
          </div>
        </div>

        <!-- Planet Expanded Content -->
        <div v-if="planetTab[item.data.slug]" class="border-t border-bsecondary border-l-2 border-l-aris-400">
          <!-- Breadcrumb -->
          <div
            class="flex items-center gap-1.5 px-4 py-2 bg-bsecondary/40 text-xs text-gray-400 border-b border-bsecondary"
          >
            <span>{{ item.data.astronomical_designation }}{{ item.data.name ? ' - ' + item.data.name : '' }}</span>
            <span class="text-gray-600">›</span>
            <span class="text-aris-400">{{ tabLabels[planetTab[item.data.slug]!] }}</span>
          </div>

          <!-- Beschreibung -->
          <div v-if="planetTab[item.data.slug] === 'beschreibung'" class="p-4">
            <Editor v-if="item.data.content" :model-value="item.data.content" read-only />
            <p v-else class="text-xs text-gray-500 italic">Keine Beschreibung verfügbar.</p>
          </div>

          <!-- Oberfläche -->
          <div v-else-if="planetTab[item.data.slug] === 'oberflaeche'" class="p-4 text-sm text-gray-500 italic">
            Keine Oberflächenbilder verfügbar.
          </div>

          <!-- Landezone -->
          <div v-else-if="planetTab[item.data.slug] === 'landezone'">
            <div
              v-for="lz in item.data.landing_zones"
              :key="lz.slug"
              class="flex gap-4 p-4 border-b border-bsecondary last:border-b-0"
            >
              <NuxtImg
                :src="lz.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
                :placeholder="[16, 16, 1, 5]"
                class="w-40 h-40 shrink-0 object-cover rounded"
              />
              <div>
                <h4 class="mb-2">
                  Landezone - <span class="text-aris-400">{{ lz.name }}</span>
                </h4>
                <Editor v-if="lz.content" :model-value="lz.content" read-only />
                <p v-else class="text-xs text-gray-500 italic">Keine Beschreibung verfügbar.</p>
              </div>
            </div>
          </div>

          <!-- Orbit: Stationen + Monde -->
          <div v-else-if="planetTab[item.data.slug] === 'orbit'">
            <!-- Raumstationen -->
            <div
              v-for="station in item.data.space_stations || []"
              :key="station.slug"
              class="border-b border-bsecondary/50 last:border-b-0"
            >
              <div class="flex gap-3 px-3 py-2 pl-8 hover:bg-bprimary/30 transition-colors">
                <NuxtImg
                  :src="station.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
                  :placeholder="[16, 16, 1, 5]"
                  class="w-14 h-14 shrink-0 object-cover rounded"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium">
                    Orbitalstation <span class="text-aris-400">{{ station.name }}</span>
                    <span v-if="station.type" class="ml-2 text-xs text-gray-500 font-normal">{{ station.type }}</span>
                  </h4>
                  <div class="flex gap-2 mt-1.5">
                    <button
                      class="orbit-btn orbit-btn--sm"
                      :class="childTab[station.slug] === 'beschreibung' ? 'orbit-btn--active' : ''"
                      @click="openBeschreibung(station, 'space_stations', station.slug)"
                    >
                      <UIcon name="i-heroicons-document-text-20-solid" class="size-3" />
                      Beschreibung
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="childTab[station.slug] === 'beschreibung'" class="px-8 pb-4 pt-2 bg-bprimary/10">
                <div class="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <span>{{ station.name }}</span>
                  <span class="text-gray-600">›</span>
                  <span class="text-aris-400">Beschreibung</span>
                </div>
                <div v-if="contentLoading[station.slug]" class="text-xs text-gray-500 italic">Lädt…</div>
                <Editor
                  v-else-if="getContent(station, station.slug)"
                  :model-value="getContent(station, station.slug)!"
                  read-only
                />
                <p v-else class="text-xs text-gray-500 italic">Keine Beschreibung verfügbar.</p>
              </div>
            </div>

            <!-- Monde -->
            <div
              v-for="moon in item.data.moons || []"
              :key="moon.slug"
              class="border-b border-bsecondary/50 last:border-b-0"
            >
              <div class="flex gap-3 px-3 py-2 pl-8 hover:bg-bprimary/30 transition-colors">
                <NuxtImg
                  :src="moon.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
                  :placeholder="[16, 16, 1, 5]"
                  class="w-14 h-14 shrink-0 object-cover rounded"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium">
                    <span class="text-aris-400">{{ moon.astronomical_designation }}</span>
                    <template v-if="moon.name"> - {{ moon.name }}</template>
                  </h4>
                  <div class="flex gap-2 mt-1.5">
                    <button
                      class="orbit-btn orbit-btn--sm"
                      :class="childTab[moon.slug] === 'info' ? 'orbit-btn--active' : ''"
                      @click="toggleChildTab(moon.slug, 'info')"
                    >
                      <UIcon name="i-heroicons-information-circle-20-solid" class="size-3" />
                      Info
                    </button>
                    <button
                      class="orbit-btn orbit-btn--sm"
                      :class="childTab[moon.slug] === 'beschreibung' ? 'orbit-btn--active' : ''"
                      @click="openBeschreibung(moon, 'moons', moon.slug)"
                    >
                      <UIcon name="i-heroicons-document-text-20-solid" class="size-3" />
                      Beschreibung
                    </button>
                  </div>
                </div>
              </div>

              <!-- Mond Expanded -->
              <div v-if="childTab[moon.slug]" class="px-8 pb-4 pt-2 bg-bprimary/10">
                <div class="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <span>{{ moon.astronomical_designation }}{{ moon.name ? ' - ' + moon.name : '' }}</span>
                  <span class="text-gray-600">›</span>
                  <span class="text-aris-400">{{ tabLabels[childTab[moon.slug]!] }}</span>
                </div>

                <div v-if="childTab[moon.slug] === 'beschreibung'">
                  <div v-if="contentLoading[moon.slug]" class="text-xs text-gray-500 italic">Lädt…</div>
                  <Editor
                    v-else-if="getContent(moon, moon.slug)"
                    :model-value="getContent(moon, moon.slug)!"
                    read-only
                  />
                  <p v-else class="text-xs text-gray-500 italic">Keine Beschreibung verfügbar.</p>
                </div>

                <div v-else-if="childTab[moon.slug] === 'info'" class="grid grid-cols-2 gap-4 text-xs">
                  <div class="space-y-1 text-gray-400">
                    <div class="font-semibold text-gray-300 mb-1.5">Astronomisch</div>
                    <div>
                      Größe: <span class="text-aris-400">{{ moon.size ?? 'N/A' }}</span>
                    </div>
                    <div>
                      Umlaufzeit: <span class="text-aris-400">{{ moon.orbital_period ?? 'N/A' }}</span>
                    </div>
                    <div>
                      Distanz: <span class="text-aris-400">{{ moon.distance ?? 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="space-y-1 text-gray-400">
                    <div class="font-semibold text-gray-300 mb-1.5">Politik & Wirtschaft</div>
                    <div>
                      Habitabel: <span class="text-aris-400">{{ moon.habitable ? 'Ja' : 'Nein' }}</span>
                    </div>
                    <div>
                      Bevölkerung:
                      <span class="text-aris-400">{{
                        moon.population != null ? moon.population + ' / 10' : 'N/A'
                      }}</span>
                    </div>
                    <div>
                      Wirtschaft:
                      <span class="text-aris-400">{{ moon.economy != null ? moon.economy + ' / 10' : 'N/A' }}</span>
                    </div>
                    <div>
                      Gefahrenstufe:
                      <span class="text-aris-400">{{
                        moon.danger_level != null ? moon.danger_level + ' / 10' : 'N/A'
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── ASTEROIDENGÜRTEL ──────────────────────────────────────────── -->
      <div v-else-if="item.type === 'asteroid_belt'" class="border-b border-industrial-400/30">
        <div class="flex gap-3 px-3 py-3">
          <NuxtImg
            :src="item.data.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
            :placeholder="[16, 16, 1, 5]"
            class="w-20 h-20 shrink-0 object-cover rounded"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold">
              Asteroidengürtel - <span class="text-aris-400">{{ item.data.name }}</span>
            </h3>
            <div class="flex gap-2 mt-2">
              <button
                class="orbit-btn"
                :class="childTab[item.data.slug] === 'beschreibung' ? 'orbit-btn--active' : ''"
                @click="toggleChildTab(item.data.slug, 'beschreibung')"
              >
                <UIcon name="i-heroicons-document-text-20-solid" class="size-3.5" />
                Beschreibung
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="childTab[item.data.slug] === 'beschreibung'"
          class="border-t border-bsecondary border-l-2 border-l-aris-400"
        >
          <div
            class="flex items-center gap-1.5 px-4 py-2 bg-bsecondary/40 text-xs text-gray-400 border-b border-bsecondary"
          >
            <span>{{ item.data.name }}</span>
            <span class="text-gray-600">›</span>
            <span class="text-aris-400">Beschreibung</span>
          </div>
          <div v-if="item.data.content" class="p-4">
            <Editor :model-value="item.data.content" read-only />
          </div>
          <p v-else class="px-4 py-3 text-xs text-gray-500 italic">Keine Beschreibung verfügbar.</p>
        </div>
      </div>

      <!-- ─── SPRUNGPUNKT ────────────────────────────────────────────────── -->
      <div v-else-if="item.type === 'jumppoint'" class="border-b border-industrial-400/30 flex gap-3 px-3 py-3">
        <NuxtImg
          :src="jpDestination(item.data)?.banner || '0a7ab10a-3309-4b1a-b624-9ce0710d0fa9'"
          :placeholder="[16, 16, 1, 5]"
          class="w-20 h-20 shrink-0 object-cover rounded"
        />
        <div class="flex-1 min-w-0">
          <h3 class="text-base font-semibold">
            Sprungpunkt -
            <span class="text-aris-400">{{ data.name }}</span>
            -
            <span class="text-aris-400">{{ jpDestination(item.data)?.name }}</span>
          </h3>
          <p class="text-xs text-gray-400 mt-1">
            Größenordnung: <span class="text-industrial-400">{{ jpSizeLabel(item.data.size) }}</span>
          </p>
          <div class="mt-2">
            <NuxtLink
              v-if="jpDestination(item.data)?.slug"
              :to="`/verseexkurs/starmap/${jpDestination(item.data)?.slug}`"
              class="orbit-btn orbit-btn--link"
            >
              <UIcon name="i-heroicons-arrow-right-circle-20-solid" class="size-3.5" />
              Sprung nach {{ jpDestination(item.data)?.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="postcss">
.orbit-btn {
  @apply flex items-center gap-1.5 border border-bsecondary rounded-sm px-2 py-1 text-xs text-gray-400
         hover:border-gray-500 hover:text-gray-200 transition-all duration-150;
}
.orbit-btn--sm {
  @apply px-1.5 py-0.5 text-[11px];
}
.orbit-btn--active {
  @apply border-aris-400 text-aris-400 bg-aris-400/10;
}
.orbit-btn--link {
  @apply border-industrial-400/50 text-industrial-400 hover:border-industrial-400 hover:bg-industrial-400/10;
}
</style>

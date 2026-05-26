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

// ─── JUMP ANIMATION ──────────────────────────────────────────────────────────
const jumping = ref(false);
const jumpPhase = ref(0); // 0: idle  1: initiating  2: tunnel  3: flash
const jumpTarget = ref<{ name: string; slug: string } | null>(null);

const JP_STREAKS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  angle: (i / 80) * 360,
  length: 22 + Math.random() * 48,
  delay: Math.random() * 0.18,
  width: 0.7 + Math.random() * 1.5,
  opacity: 0.3 + Math.random() * 0.55,
}));
const JP_RINGS = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  delay: (i / 9) * 1.5,
}));

async function triggerJump(dest: { name: string; slug: string }) {
  jumpTarget.value = dest;
  jumping.value = true;
  jumpPhase.value = 1;
  await new Promise((r) => setTimeout(r, 700));
  jumpPhase.value = 2;
  await new Promise((r) => setTimeout(r, 1900));
  jumpPhase.value = 3;
  await new Promise((r) => setTimeout(r, 280));
  await navigateTo(`/verseexkurs/starmap/${dest.slug}`);
  await new Promise((r) => setTimeout(r, 350));
  jumping.value = false;
  jumpPhase.value = 0;
  jumpTarget.value = null;
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
            <button
              v-if="jpDestination(item.data)?.slug"
              class="orbit-btn orbit-btn--link"
              @click="triggerJump({ name: jpDestination(item.data)!.name, slug: jpDestination(item.data)!.slug })"
            >
              <UIcon name="i-heroicons-arrow-right-circle-20-solid" class="size-3.5" />
              Sprung nach {{ jpDestination(item.data)?.name }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- ─── JUMP ANIMATION OVERLAY ──────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="jp-fade">
      <div v-if="jumping" class="jp-overlay" :class="`jp-phase-${jumpPhase}`">
        <div class="jp-bg" />

        <!-- Rings -->
        <div class="jp-rings-wrap">
          <div
            v-for="ring in JP_RINGS"
            :key="ring.id"
            class="jp-ring"
            :style="{ '--jp-delay': `${ring.delay}s` }"
          />
        </div>

        <!-- Star streaks -->
        <div class="jp-streaks-wrap">
          <div
            v-for="s in JP_STREAKS"
            :key="s.id"
            class="jp-streak"
            :style="{
              '--jp-angle': `${s.angle}deg`,
              '--jp-len': `${s.length}vw`,
              '--jp-delay': `${s.delay}s`,
              '--jp-w': `${s.width}px`,
              '--jp-op': s.opacity,
            }"
          />
        </div>

        <!-- Central glowing core -->
        <div class="jp-core" />

        <!-- White flash (phase 3) -->
        <div class="jp-flash" />

        <!-- HUD text -->
        <Transition name="jp-text-fade">
          <div v-if="jumpPhase <= 2" class="jp-hud">
            <div class="jp-hud-inner" :class="{ 'jp-hud--shake': jumpPhase === 2 }">
              <p class="jp-label">Initiiere Sprung nach</p>
              <p class="jp-name">{{ jumpTarget?.name }}</p>
              <div class="jp-bar">
                <div class="jp-bar-fill" :class="{ 'jp-bar-fill--active': jumpPhase === 2 }" />
              </div>
              <p class="jp-status">{{ jumpPhase === 1 ? 'SPINNE SPRUNGANTRIEB HOCH...' : 'SPRUNG AKTIV' }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
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

/* ─── JUMP ANIMATION ─────────────────────────────────────────────────────── */
.jp-fade-enter-active { transition: opacity 0.25s ease; }
.jp-fade-leave-active { transition: opacity 0.4s ease; }
.jp-fade-enter-from,
.jp-fade-leave-to  { opacity: 0; }

.jp-text-fade-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.jp-text-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.jp-text-fade-enter-from   { opacity: 0; transform: translateY(12px); }
.jp-text-fade-leave-to     { opacity: 0; transform: scale(1.1); }

.jp-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Starfield background */
.jp-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, #04111f 0%, #010810 45%, #000 100%);
}

/* Expanding tunnel rings */
.jp-rings-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.jp-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 1.5px solid #22d3ee;
  box-shadow: 0 0 8px 1px rgba(34, 211, 238, 0.4), inset 0 0 8px 1px rgba(34, 211, 238, 0.1);
  opacity: 0;
  will-change: transform, opacity;
  animation: jp-ring-expand 1.5s cubic-bezier(0.15, 0, 0.85, 1) infinite;
  animation-delay: var(--jp-delay, 0s);
  animation-play-state: paused;
  animation-fill-mode: backwards;
}
.jp-phase-2 .jp-ring,
.jp-phase-3 .jp-ring {
  animation-play-state: running;
}
@keyframes jp-ring-expand {
  0%   { transform: scale(0.15); opacity: 0; border-color: #22d3ee; box-shadow: 0 0 12px 2px rgba(34,211,238,0.6); }
  12%  { opacity: 0.8; }
  60%  { border-color: #60a5fa; box-shadow: 0 0 4px 1px rgba(96,165,250,0.3); opacity: 0.4; }
  100% { transform: scale(28); opacity: 0; }
}

/* Star streaks */
.jp-streaks-wrap {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.jp-streak {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--jp-w, 1px);
  width: 0;
  background: linear-gradient(to right, transparent 0%, rgba(186, 230, 253, 0.95) 100%);
  transform-origin: 0 50%;
  transform: rotate(var(--jp-angle, 0deg)) translateY(-50%);
  opacity: 0;
  animation: jp-streak-grow 0.35s ease-out forwards;
  animation-delay: var(--jp-delay, 0s);
  animation-play-state: paused;
}
.jp-phase-2 .jp-streak,
.jp-phase-3 .jp-streak {
  animation-play-state: running;
}
@keyframes jp-streak-grow {
  0%   { width: 0;                    opacity: 0; }
  15%  { opacity: var(--jp-op, 0.5); }
  100% { width: var(--jp-len, 20vw); opacity: var(--jp-op, 0.5); }
}

/* Central glowing core */
.jp-core {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  will-change: transform, opacity;
  box-shadow:
    0 0 6px 3px rgba(34, 211, 238, 1),
    0 0 24px 10px rgba(34, 211, 238, 0.6),
    0 0 70px 28px rgba(34, 211, 238, 0.2);
  z-index: 2;
  animation: jp-core-pulse 0.7s ease-in-out infinite alternate;
}
.jp-phase-2 .jp-core,
.jp-phase-3 .jp-core {
  animation:
    jp-core-pulse 0.25s ease-in-out infinite alternate,
    jp-core-swell 1.9s ease-in forwards;
}
@keyframes jp-core-pulse {
  from { transform: scale(1); }
  to   { transform: scale(1.4); }
}
@keyframes jp-core-swell {
  0%   { transform: scale(1); }
  100% { transform: scale(22); opacity: 0.6; }
}

/* White flash */
.jp-flash {
  position: absolute;
  inset: 0;
  background: white;
  opacity: 0;
  pointer-events: none;
  z-index: 6;
}
.jp-phase-3 .jp-flash {
  animation: jp-flash-in 0.5s ease-in forwards;
}
@keyframes jp-flash-in {
  0%   { opacity: 0; }
  70%  { opacity: 1; }
  100% { opacity: 1; }
}

/* HUD text */
.jp-hud {
  position: absolute;
  text-align: center;
  z-index: 4;
  pointer-events: none;
  user-select: none;
}
.jp-hud-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.jp-hud--shake {
  animation: jp-shake 0.08s ease-in-out infinite alternate;
}
@keyframes jp-shake {
  from { transform: translate(-0.5px, 0); }
  to   { transform: translate(0.5px, -0.5px); }
}
.jp-label {
  font-size: 0.6rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: #9ca3af;
  text-shadow: 0 0 16px rgba(34, 211, 238, 0.7);
}
.jp-name {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.1;
  color: #22d3ee;
  text-shadow:
    0 0 20px rgba(34, 211, 238, 0.9),
    0 0 60px rgba(34, 211, 238, 0.5),
    0 0 120px rgba(34, 211, 238, 0.2);
  letter-spacing: 0.04em;
}
.jp-status {
  font-size: 0.55rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #6b7280;
  margin-top: 4px;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.4);
  animation: jp-status-blink 0.9s step-end infinite;
}
@keyframes jp-status-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
.jp-bar {
  width: 220px;
  height: 1px;
  background: rgba(34, 211, 238, 0.15);
  margin-top: 14px;
  position: relative;
  overflow: hidden;
}
.jp-bar-fill {
  position: absolute;
  inset-y: 0;
  left: 0;
  width: 0;
  background: #22d3ee;
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.9);
}
.jp-bar-fill--active {
  animation: jp-bar-run 1.9s linear forwards;
}
@keyframes jp-bar-run {
  from { width: 0; }
  to   { width: 100%; }
}
</style>

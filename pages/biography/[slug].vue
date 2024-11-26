<script setup lang="ts">
import { useMouse, useWindowScroll } from '@vueuse/core';

const { directus, readUsers, readItems } = useCMS();
const { path, params } = useRoute();
const { copy, isSupported: clipboardIsSupported } = useClipboard();
const toast = useToast();
const homepageTabsStore = useHomepageTabsStore();
const userSettingsStore = useUserSettingsStore();

const selectedTab = ref(0);

const { data } = await useAsyncData(
  'BIOGRAPHY:USER',
  () =>
    directus.request(
      readUsers({
        fields: [
          'first_name',
          'last_name',
          'slug',
          'title',
          'avatar',
          'roles',
          'department.name',
          'department.slug',
          'department.tab_id',
          'head_of_department',
          'leading_department.name',
          'leading_department.slug',
          'leading_department.tab_id',
          'role.id',
          'role.label',
          'birthdate',
          'birthplace.id',
          'birthplace.name',
          'birthplace.slug',
          'birthplace.planet.id',
          'birthplace.planet.name',
          'birthplace.planet.slug',
          'current_residence',
          'current_residence.id',
          'current_residence.name',
          'current_residence.slug',
          'current_residence.planet.id',
          'current_residence.planet.name',
          'current_residence.planet.slug',
          'height',
          'weight',
          'hair_color',
          'eye_color',
          'citizen',
          'citizen_reason',
          'duty_state',
          'duty_period',
          'duty_division',
          'duty_end',
          'education_state',
          'education_name',
          'education_period',
          'hobbies',
          'habits',
          'talents',
          'tics',
          'activities',
          'mysterious_things',
          'character_trait',
          'fears',
          'books',
          'music',
          'movies',
          'clothing',
          'colors',
          'food',
          'drink',
          'alcohol',
          'sex',
          'loves',
          'hates',
          'biography',
          'hangar_items.id',
          'hangar_items.name',
          'hangar_items.name_public',
          'hangar_items.planned',
          'hangar_items.group',
          'hangar_items.department.id',
          'hangar_items.department.name',
          'hangar_items.department.logo',
          'hangar_items.ship_id.name',
          'hangar_items.ship_id.slug',
          'hangar_items.ship_id.store_image',
          'hangar_items.ship_id.production_status',
          'hangar_items.ship_id.manufacturer.name',
          'hangar_items.ship_id.manufacturer.slug',
          'hangar_items.ship_id.classification',
          'hangar_items.ship_id.crew_min',
          'hangar_items.ship_id.crew_max',
          'hangar_items.ship_id.price',
          'hangar_items.ship_id.cargo',
          'hangar_items.ship_id.length',
          'hangar_items.ship_id.beam',
          'hangar_items.ship_id.height',
          'hangar_items.active_module.id',
          'hangar_items.active_module.name',
        ],
        filter: {
          slug: { _eq: params.slug },
          hidden: { _eq: false },
        },
        deep: {
          hangar_items: {
            _filter: {
              visibility: {
                ...(path.startsWith('/ams') ? { _neq: 'private' } : { _eq: 'public' }),
              },
            },
            _sort: ['ship_id.name'],
          },
        },
      }),
    ),
  {
    transform: (rawUsers: any[]) => transformUser(rawUsers[0]),
  },
);

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage:
      'Daten konnten nicht aus dem Personalverzeichnis geladen werden. Eventuell sind sie unter Verschluss!',
    fatal: true,
  });
}
console.log(data.value);
const { data: places } = await useAsyncData(
  'BIOGRAPHY:SYSTEMS',
  () =>
    directus.request(
      readItems('systems', {
        fields: ['name', 'slug', 'orbit.collection', 'orbit.object:planets.id'],
        filter: {
          orbit: {
            'object:planets': {
              id: {
                _in: [
                  ...(data.value?.birthplace?.planet ? [data.value.birthplace?.planet?.id] : []),
                  ...(data.value?.current_residence?.planet ? [data.value.current_residence?.planet?.id] : []),
                ],
              },
            },
          },
        },
        limit: -1,
      }),
    ),
  {
    transform: (rawSystems: any[]) => rawSystems.map((rawSystem: any) => transformStarsystem(rawSystem)),
  },
);

if (data.value?.birthplace?.planet) {
  data.value.birthplace.planet.system = places.value.find((e) =>
    e.planets.find((p) => p.id === data.value.birthplace?.planet?.id),
  );
}
if (data.value?.current_residence?.planet) {
  data.value.current_residence.planet.system = places.value.find((e) =>
    e.planets.find((p) => p.id === data.value.current_residence?.planet?.id),
  );
}
// data.value.current_residence.planet.system = birthplace_data.value;

// console.log(data.value);
// console.log(birthplace_data.value);

// const { data: place_data } = await useAsyncData('user_places', async () => {
//   const user_places = await readUser(data.value.id, {
//     fields: ['birthplace.id', 'birthplace.name', 'birthplace.planet.id'],
//   });

//   const [] = await Promise.all([
//     readItems('systems', {
//       fields: ['orbit.collection', 'orbit.object:planets.id', 'orbit.object:planets.name'],
//       filter: {
//         orbit: {
//           'object:planets': {
//             name: { _eq: data.value.headquarter.planet?.name },
//           },
//         },
//       },
//       limit: 1,
//     }),
//   ]);
// });

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
const handleDepartmentLink = () => {
  homepageTabsStore.setOurTab(2);
  homepageTabsStore.setOurDepartmentTab(data.value?.department.tab_id);
};

defineShortcuts({
  d: {
    handler: () => userSettingsStore.AMSToggleHangarDetailView(),
  },
});

definePageMeta({
  alias: '/ams/employees/biography/:slug()',
  middleware: 'biography',
});
useHead({
  title: data.value?.full_name + ' - Biografie',
});
</script>

<template>
  <div>
    <div class="flex flex-wrap justify-between">
      <div class="mt-auto">
        <h1 class="mb-0">
          {{ data.full_name }}
        </h1>
        <h4 class="mb-0 text-xs md:text-lg">
          <span class="text-dark-gray">Rollen: </span
          ><span class="italic text-light-gray">{{ data.roles?.join(', ') || 'N/A' }}</span>
        </h4>
      </div>
      <div>
        <NuxtLink to="/verseexkurs/companies/ariscorp">
          <Icon name="IconsLogosAriscorp" class="h-20 -mb-4 md:-mb-8 md:h-40 w-fit animate-link" />
        </NuxtLink>
      </div>
    </div>
    <hr class="my-3" />
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-3 space-y-4 xl:col-span-1">
        <div class="w-full">
          <DefaultPanel>
            <div class="relative h-[300px] lg:h-[600px] xl:h-[700px] w-full">
              <NuxtImg
                ref="reftest"
                :src="data.avatar"
                placeholder-class="opacity-0"
                loading="lazy"
                format="png"
                class="absolute z-10 object-cover size-full"
              />
              <NuxtImg :src="data.avatar" class="absolute object-cover size-full" />
            </div>
          </DefaultPanel>
        </div>
        <ButtonDefault class="w-full" @click="handleShare">
          <UIcon name="i-heroicons-share" class="flex w-4 h-4 m-auto" />
        </ButtonDefault>
        <TableParent title="ArisCorp">
          <TableRow
            v-if="data.department || data.leading_department"
            full-width
            :title="data.head_of_department ? 'Abteilungsleiter in' : 'Arbeitet in der Abteilung'"
            :content="data.department.name"
            link="/#our"
            :click="handleDepartmentLink"
          />
          <TableRow full-width title="Position" :content="data.position.name" />
          <TableRow full-width title="Rollen innerhalb der ArisCorp" :content="data.roles?.join(', ')" />
        </TableParent>
      </div>
      <div class="col-span-3 space-y-4 xl:col-span-2">
        <TableParent title="Basis">
          <TableRow title="Bürgerlicher Name" :content="data.full_name" />
          <TableRow title="Geschlecht" :content="data.sex" />
          <TableHr />
          <TableRow
            title="Geburtsdatum"
            :content="data.birthdate && $dayjs(data.birthdate).format('DD. MMM YYYY')"
            class="sm:hidden"
          />
          <TableRow
            title="Geburtsdatum"
            :content="data.birthdate && $dayjs(data.birthdate).format('DD. MMMM YYYY')"
            class="hidden sm:block"
          />
          <TableRow
            title="Alter"
            :content="data.birthdate && $dayjs().add(930, 'years').diff(data.birthdate, 'years') + ' Jahre Alt'"
          />
          <TableHr />
          <TableRow title="Geburtsort">
            <template v-if="data.birthplace">
              <p class="p-0">
                <NuxtLink :to="'/verseexkurs/starmap/' + data.birthplace.planet.system.slug">
                  <span class="inline-block animate-link">{{ data.birthplace.planet.system.name }}</span>
                </NuxtLink>
                /
                <NuxtLink
                  :to="
                    '/verseexkurs/starmap/' +
                    data.birthplace.planet.system.slug +
                    '?planet=' +
                    data.birthplace.planet.slug
                  "
                >
                  <span class="inline-block animate-link">{{ data.birthplace.planet.name }}</span>
                </NuxtLink>
                /
                <NuxtLink
                  :to="'/verseexkurs/starmap/' + data.birthplace.planet.system.slug + '?lz=' + data.birthplace.slug"
                >
                  <span class="inline-block animate-link">{{ data.birthplace.name }}</span>
                </NuxtLink>
              </p>
            </template>
          </TableRow>
          <TableRow title="Aktueller Wohnort">
            <template v-if="data.current_residence">
              <p class="p-0">
                <NuxtLink :to="'/verseexkurs/starmap/' + data.current_residence.planet.system.slug">
                  <span class="inline-block animate-link">{{ data.current_residence.planet.system.name }}</span>
                </NuxtLink>
                /
                <NuxtLink
                  :to="
                    '/verseexkurs/starmap/' +
                    data.current_residence.planet.system.slug +
                    '?planet=' +
                    data.current_residence.planet.slug
                  "
                >
                  <span class="inline-block animate-link">{{ data.current_residence.planet.name }}</span>
                </NuxtLink>
                /
                <NuxtLink
                  :to="
                    '/verseexkurs/starmap/' +
                    data.current_residence.planet.system.slug +
                    '?lz=' +
                    data.current_residence.slug
                  "
                >
                  <span class="inline-block animate-link">{{ data.current_residence.name }}</span>
                </NuxtLink>
              </p>
            </template>
          </TableRow>
          <TableHr />
          <TableRow title="Körpergröße" :content="data.height" suffix="cm" />
          <TableRow title="Körpergewicht" :content="data.weight" suffix="kg" />
          <TableRow title="Haarfarbe" :content="data.hair_color" />
          <TableRow title="Augenfarbe" :content="data.eye_color" />
          <TableHr />
          <TableRow
            title="Bürgerstatus"
            :content="data.hasOwnProperty('citizen_state') && data.citizen_state ? 'Bürger' : 'Zivilist'"
          />
          <TableRow title="Bürgerschaftsverdienst" :content="data.citizen_state && data.citizen_reason" />
        </TableParent>
        <TableParent v-if="data.duty_state" title="Militärischer Dienst">
          <TableRow title="Dienstzeit" :content="data.duty.period" />
          <TableRow title="Division" :content="data.duty.division" />
          <TableRow title="Entlassen" :content="data.duty.end" />
        </TableParent>
        <TableParent v-if="data.education_state" title="Besondere Bildung">
          <TableRow title="Name der Ausbildung" :content="data.education.name" />
          <TableRow title="Ausbildungszeit" :content="data.education.period" />
          <TableRow title="Hochschule" content="COMING SOON" full-width />
        </TableParent>
        <TableParent title="Spezifisch">
          <TableRow title="Hobbies" :content="data.hobbies" is-list />
          <TableRow title="Angewohnheiten" :content="data.habits" is-list />
          <TableRow title="Talente" :content="data.talents" is-list />
          <TableRow title="Tics & Marotten" :content="data.tics" is-list />
          <TableRow title="Freizeitgestaltung" :content="data.activities" is-list />
          <TableRow title="Rätselhafte Züge" :content="data.mysterious_things" is-list />
          <TableRow title="Hervorstechender Charakterzug" :content="data.character" is-list />
          <TableRow title="Ängste" :content="data.fears" is-list />
        </TableParent>
        <TableParent title="Geschmäcker">
          <TableRow title="Bücher" :content="data.books" third is-list />
          <TableRow title="Musik" :content="data.music" third is-list />
          <TableRow title="Filme" :content="data.movies" third is-list />
          <TableHr />
          <TableRow title="Typische Kleidung" :content="data.clothing" is-list />
          <TableRow title="Lieblingsfarben" :content="data.colors" is-list />
          <TableHr />
          <TableRow title="Lieblingsgericht" :content="data.food" third is-list />
          <TableRow title="Lieblingsgetränk" :content="data.drink" third is-list />
          <TableRow title="Lieblingsalkohol" :content="data.alcohol" third is-list />
          <TableHr />
          <TableRow :title="data.pronom + ' liebt'" :content="data.loves" is-list />
          <TableRow :title="data.pronom + ' hast'" :content="data.hates" is-list />
        </TableParent>
      </div>
    </div>
    <TabGroup
      :tablist="[
        { id: '1', header: 'Biografie' },
        { id: '2', header: 'Hangar' },
      ]"
      :store="selectedTab"
      :change="(i) => (selectedTab = i)"
      between
    >
      <template #tabcontent>
        <template v-if="selectedTab === 0">
          <DefaultPanel bg="bprimary" class="mb-3">
            <div class="px-8">
              <Editor v-if="data.biography" v-model="data.biography" read-only />
              <div v-else className="flex justify-center my-6">
                <h1 className="text-xl sm:text-2xl md:text-4xl redacted m-0" data-text="[ REDACTED ]">[ REDACTED ]</h1>
              </div>
            </div>
          </DefaultPanel>
        </template>
        <template v-if="selectedTab === 1">
          <div>
            <div class="flex mb-3 ml-auto">
              <ButtonDefault class="mx-auto sm:mr-0 sm:ml-auto" @click="userSettingsStore.AMSToggleHangarDetailView">
                Detail Ansicht:
                {{ userSettingsStore.ams.hangarDetailView ? 'Ausschalten' : 'Anschalten' }}
              </ButtonDefault>
            </div>
            <div class="flex flex-wrap">
              <ClientOnly>
                <TransitionGroup
                  appear
                  enter-active-class="transition-all duration-500"
                  leave-active-class="transition-all duration-500"
                  enter-from-class="-translate-y-4 opacity-0"
                  enter-to-class="translate-y-0 opacity-100"
                  leave-from-class="translate-y-0 opacity-100"
                  leave-to-class="-translate-y-4 opacity-0"
                >
                  <ShipCard
                    v-for="item in data.hangar"
                    v-if="data.hangar[0]"
                    :key="item.id"
                    :ship-data="item.ship"
                    :hangar-data="item"
                    :detail-view="userSettingsStore.ams.hangarDetailView"
                    :color="item.userData.group === 'ariscorp' ? 'primary' : 'white'"
                    preload-images
                    internal-bio
                    display-department
                    :display-name="item.userData.show_name"
                    display-production-state
                    display-planned-state
                  />
                </TransitionGroup>
                <Transition
                  appear
                  enter-active-class="transition-all duration-500"
                  leave-active-class="transition-all duration-500"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <div v-if="!data.hangar[0]" class="mx-auto">
                    <h2 class="text-center text-industrial-400">Der Hangar von {{ data.full_name }} ist leer.</h2>
                  </div>
                </Transition>
              </ClientOnly>
            </div>
          </div>
        </template>
      </template>
    </TabGroup>
  </div>
</template>

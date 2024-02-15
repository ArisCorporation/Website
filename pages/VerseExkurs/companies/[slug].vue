<script setup lang="ts">
import type { Data } from 'unified/lib';

const route = useRoute();
const { readItems } = useDirectusItems();
const selectedTab = ref(0);

const dataRes = await readItems('companies', {
  fields: [
    'name',
    'banner',
    'content',
    'category.id',
    'category.name',
    'current_ceo',
    'founded',
    'founder',
    'famous_goods',
    'headquarter.collection',
    'headquarter.headquarter.name',
    'headquarter.headquarter.slug',
    'headquarter.headquarter.planet.name',
    'headquarter.headquarter.planet.slug',
    'headquarter.headquarter.moon.name',
    'headquarter.headquarter.moon.slug',
  ],
  filter: {
    slug: { _eq: route.params.slug },
  },
  limit: 1,
});

// const test = await readItems('systems', {
//   fields: ['name', 'orbit.object:planets.name'],
//   filter: {
//     orbit: {
//       'object:planets': {
//         name: { _eq: 'Crusader' },
//       },
//     },
//   },
//   limit: -1,
// });

if (!dataRes[0]) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const data = computed(() => transformCompany(dataRes[0]));

if (
  data.value.headquarter?.collection === 'planets' ||
  data.value.headquarter?.collection === 'moons' ||
  data.value.headquarter?.collection === 'landing_zones'
) {
  const system = await readItems('systems', {
    fields: ['name', 'orbit.object:planets.name'],
    filter: {
      orbit: data.value.headquarter.planet
        ? {
            'object:planets': {
              name: { _eq: data.value.headquarter.planet?.name },
            },
          }
        : {
            'object:moons': {
              name: { _eq: data.value.headquarter.moon?.name },
            },
          },
    },
    limit: 1,
  });
  if (system && system[0]) {
    data.value.headquarter.system = { name: system[0].name, slug: system[0].slug };
  }
}

useHead({
  title: data.value.name,
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VerseExkursBaseArticle :banner="data?.banner">
    <template #title>
      Firma:
      <span class="text-primary"> {{ data?.name }}</span>
    </template>
    <div>
      <!-- <DefaultPanel class="w-full mb-8 ml-12 xl:float-right xl:w-1/2"> -->
      <TableParent
        v-if="
          data.headquarter.name ||
          data.headquarter.system ||
          data.headquarter.planet ||
          data.headquarter.moon ||
          data.founded ||
          data.founder ||
          data.category.name ||
          data.famous_goods
        "
        title="Infobox"
        class="w-full mb-8 xl:ml-12 xl:float-right xl:w-1/2"
      >
        <!-- Stanton / ArcCorp / Area18 -->
        <TableRow
          v-if="data.headquarter.name || data.headquarter.system || data.headquarter.planet || data.headquarter.moon"
          title="Hauptsitz"
          full-width
        >
          <span class="my-auto">
            <NuxtLink
              v-if="data.headquarter.system"
              :to="'/VerseExkurs/starmap/' + data.headquarter.system.slug"
              class="my-auto transition opacity-75 decoration-transparent hover:opacity-100 text-aris-400"
            >
              {{ data.headquarter.system.name }}
            </NuxtLink>
            <template v-if="data.headquarter.system && data.headquarter.planet"> / </template>
            <NuxtLink
              v-if="data.headquarter.planet"
              :to="'/VerseExkurs/starmap/' + data.headquarter.system?.slug + '?planet=' + data.headquarter.planet.slug"
              class="my-auto transition opacity-75 decoration-transparent hover:opacity-100 text-aris-400"
            >
              {{ data.headquarter.planet.name }}
            </NuxtLink>
            <template v-if="data.headquarter.planet && data.headquarter.name"> / </template>
            <NuxtLink
              v-if="data.headquarter.name"
              :to="
                '/VerseExkurs/starmap/' +
                data.headquarter.system.slug +
                '?planet=' +
                data.headquarter.planet.slug +
                '?landing_zones=' +
                data.headquarter.slug
              "
              class="my-auto transition opacity-75 decoration-transparent hover:opacity-100 text-aris-400"
            >
              {{ data.headquarter.name }}
            </NuxtLink>
          </span>
        </TableRow>
        <TableRow v-if="data.founded" title="Gründungsdatum" :content="data?.founded" full-width />
        <TableRow v-if="data.founder" title="Gründer" :content="data?.founder" full-width />
        <TableRow v-if="data.category.name" title="Kategorie" :content="data?.category.name" full-width />
        <TableRow v-if="data.famous_goods" title="Bekannteste Waren" :content="data?.famous_goods" full-width />
      </TableParent>
      <!-- </DefaultPanel> -->
      <div v-html="data?.content" />
      <hr />
      <h3>Waren der Firma {{ data?.name }}</h3>
      <!-- <Disclosure v-if="data.ships[0]">
        <template #title>
          Schiffe von <span class="text-primary-400">{{ data.name }}</span>
        </template>
        <div class="flex flex-wrap">
          <ShipCard
            v-for="ship in data?.ships"
            :key="ship.id"
            :ship-data="ship.ship"
            display-department
            preload-images
          />
        </div>
      </Disclosure>
      <Disclosure v-if="data.modules[0]">
        <template #title>
          Schiffsmodule von <span class="text-primary-400">{{ data.name }}</span>
        </template>
        <div class="flex flex-wrap">
          <ShipCard
            v-for="ship in data?.modules"
            :key="ship.id"
            :ship-data="ship.ship"
            display-department
            preload-images
          />
        </div>
      </Disclosure>
      <Disclosure v-if="data.weapons[0]">
        <template #title>
          Waffen von <span class="text-primary-400">{{ data.name }}</span>
        </template>
        <div class="flex flex-wrap">
          <ShipCard
            v-for="ship in data?.weapons"
            :key="ship.id"
            :ship-data="ship.ship"
            display-department
            preload-images
          />
        </div>
      </Disclosure>
      <Disclosure v-if="data.weapon_attachments[0]">
        <template #title>
          Waffenaufsätze von <span class="text-primary-400">{{ data.name }}</span>
        </template>
        <div class="flex flex-wrap">
          <ShipCard
            v-for="ship in data?.weapon_attachments"
            :key="ship.id"
            :ship-data="ship.ship"
            display-department
            preload-images
          />
        </div>
      </Disclosure> -->
    </div>
  </VerseExkursBaseArticle>
</template>

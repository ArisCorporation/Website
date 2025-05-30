<script setup lang="ts">
import { transform } from 'typescript';
import type { Data } from 'unified/lib';

const route = useRoute();
const { directus, readItems } = useCMS();
const selectedTab = ref(0);

const { data } = await useAsyncData(
  'COMPANY',
  () =>
    directus.request(
      readItems('companies', {
        fields: [
          'name',
          'banner',
          'logo',
          'content',
          'category.id',
          'category.name',
          'current_ceo',
          'founded',
          'founder',
          'famous_goods',
          'headquarter.collection',
          'headquarter.headquarter:systems.name',
          'headquarter.headquarter:systems.slug',
          'headquarter.headquarter:planets.name',
          'headquarter.headquarter:planets.slug',
          'headquarter.headquarter:moons.name',
          'headquarter.headquarter:moons.slug',
          'headquarter.headquarter:landing_zones.name',
          'headquarter.headquarter:landing_zones.slug',
          'headquarter.headquarter:landing_zones.planet.name',
          'headquarter.headquarter:landing_zones.planet.slug',
          'headquarter.headquarter:space_stations.name',
          'headquarter.headquarter:space_stations.slug',
          'ships.store_image',
          'ships.name',
          'ships.slug',
          'ships.manufacturer.name',
          'ships.manufacturer.slug',
        ],
        filter: {
          slug: { _eq: route.params.slug },
        },
        limit: 1,
      }),
    ),
  {
    transform: (rawCompanies: any[]) => transformCompany(rawCompanies[0]),
  },
);

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

if (
  data.value.headquarter?.collection === 'planets' ||
  data.value.headquarter?.collection === 'moons' ||
  data.value.headquarter?.collection === 'landing_zones'
) {
  const system = await useAsyncData(
    'COMPANY:SYSTEM',
    () =>
      directus.request(
        readItems('systems', {
          fields: ['name', 'slug'],
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
        }),
      ),
    {
      transform: (rawSystems: any[]) => transformStarsystem(rawSystems[0]),
    },
  );
  if (system?.data?.value) {
    data.value.headquarter.system = system?.data?.value;
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
      <div class="flex flex-wrap gap-4 xl:grid xl:grid-cols-6">
        <div class="hidden col-span-1 xl:block" />
        <NuxtImg
          :src="data?.logo"
          :placeholder="[16, 16, 1, 5]"
          class="object-cover sm:mx-auto xl:m-0 size-full sm:size-1/2 xl:size-full"
        />
        <div class="hidden col-span-1 xl:block" />
        <TableParent
          v-if="
            data.headquarter?.name ||
            data.headquarter?.system ||
            data.headquarter?.planet ||
            data.headquarter?.moon ||
            data.founded ||
            data.founder ||
            data.category.name ||
            data.famous_goods
          "
          title="Infobox"
          panel-classes="h-full"
          class="w-full col-span-3 xl:mr-12"
        >
          <TableRow
            v-if="
              data.headquarter?.name || data.headquarter?.system || data.headquarter?.planet || data.headquarter?.moon
            "
            title="Hauptsitz"
            full-width
          >
            <span class="my-auto">
              <NuxtLink
                v-if="data.headquarter.system"
                :to="'/verseexkurs/starmap/' + data.headquarter.system.slug"
                class="inline-block animate-link"
              >
                {{ data.headquarter.system.name }}
              </NuxtLink>
              <template v-if="data.headquarter.system && data.headquarter.planet"> / </template>
              <NuxtLink
                v-if="data.headquarter.planet"
                :to="
                  '/verseexkurs/starmap/' + data.headquarter.system?.slug + '?planet=' + data.headquarter.planet.slug
                "
                class="inline-block animate-link"
              >
                {{ data.headquarter.planet.name }}
              </NuxtLink>
              <template v-if="data.headquarter.planet && data.headquarter.name"> / </template>
              <NuxtLink
                v-if="data.headquarter.system && data.headquarter.planet && data.headquarter.name"
                :to="'/verseexkurs/starmap/' + data.headquarter.system.slug + '?lz=' + data.headquarter.slug"
                class="inline-block animate-link"
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
      </div>
      <hr />
      <Editor :model-value="data?.content" read-only />
      <template
        v-if="
          (data?.ships && data.ships[0]) ||
          (data?.ship_modules && data?.ship_modules[0]) ||
          (data?.weapons && data.weapons[0]) ||
          (data?.weapon_mods && data.weapon_mods[0])
        "
      >
        <hr />
        <h3>Waren der Firma {{ data?.name }}</h3>
        <UAccordion
          :items="[
            ...(data?.ships && data.ships[0]
              ? [
                  {
                    label: 'Schiffe von ',
                    defaultOpen: false,
                    slot: 'ships',
                  },
                ]
              : []),
            ...(data?.ship_modules && data.ship_modules[0]
              ? [
                  {
                    label: 'Schiffsmodule von ',
                    defaultOpen: false,
                    slot: 'shipmodules',
                  },
                ]
              : []),
            ...(data?.weapons && data.weapons[0]
              ? [
                  {
                    label: 'Waffen von ',
                    defaultOpen: false,
                    slot: 'weapons',
                  },
                ]
              : []),
            ...(obj?.weapon_mods && obj.weapon_mods[0]
              ? [
                  {
                    label: 'Waffenaufsätze von ',
                    defaultOpen: false,
                    slot: 'weaponmods',
                  },
                ]
              : []),
          ]"
        >
          <template #default="{ item, index, open }">
            <h4 class="flex p-1 m-0 my-2 border rounded cursor-pointer bg-bsecondary border-btertiary animate-link">
              <span class="pl-1">
                {{ item.label }} <span class="text-primary-400">{{ data.name }}</span>
              </span>
              <UIcon
                name="i-heroicons-chevron-right-20-solid"
                class="my-auto ml-auto transition-transform duration-200 transform size-6 ms-auto"
                :class="[open && 'rotate-90']"
              />
            </h4>
          </template>
          <template #ships>
            <div class="flex flex-wrap">
              <ShipCard v-for="ship in data?.ships" :key="ship.id" :ship-data="ship" preload-images />
            </div>
          </template>
        </UAccordion>
      </template>
    </div>
  </VerseExkursBaseArticle>
</template>

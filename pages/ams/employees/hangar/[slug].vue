<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { object, string, type InferType } from 'yup';
const { params } = useRoute();
const { getItems } = useDirectusItems();
const { getUsers } = useDirectusUsers();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const loanerView = computed(() => userSettings.value.ams.hangarLoanerView);
const hideHangar = ref(false);
const search = ref('');

const { data: user } = await useAsyncData(
  'get-user',
  () =>
    getUsers({
      params: {
        filter: {
          slug: {
            _eq: params.slug,
          },
        },
      },
    }),
  {
    transform: (data) => transformUser(data[0]),
  },
);

const { data } = await useAsyncData('member-hangar', async () => {
  const [hangarItems] = await Promise.all([
    getItems({
      collection: 'member_ships',
      params: {
        filter: {
          _and: [
            {
              user_id: {
                slug: { _eq: params.slug },
              },
            },
            {
              visibility: { _neq: 'hidden' },
            },
          ],
        },
        fields: [
          'id',
          'name',
          'planned',
          'serial',
          'visibility',
          'group',
          'namePublic',
          'ship_id.id',
          'ship_id.name',
          'ship_id.slug',
          'ship_id.storeImage.id',
          'ship_id.manufacturer.firmen_name',
          'ship_id.manufacturer.code',
          'ship_id.manufacturer.slug',
          'ship_id.productionStatus',
          'ship_id.length',
          'ship_id.height',
          'ship_id.beam',
          'ship_id.classification',
          'ship_id.minCrew',
          'ship_id.maxCrew',
          'ship_id.price',
          'ship_id.cargo',
          'ship_id.loaners',
          'ship_id.modules.id',
          'ship_id.modules.name',
          'department.id',
          'department.gameplay_name',
          'department.gameplay_logo.id',
          'active_module.id',
          'active_module.name',
        ],
        limit: -1,
        sort: ['ship_id.name'],
      },
    }),
  ]);

  if (!hangarItems) {
    return null;
  }

  const loanerIds: string[] = [];
  hangarItems
    .filter((e) => e.ship_id.productionStatus !== 'flight-ready')
    .forEach((obj) => obj.ship_id.loaners?.forEach((i) => !loanerIds.includes(i.id) && loanerIds.push(i.id)));

  const [loanerData] = await Promise.all([
    getItems({
      collection: 'ships',
      params: {
        fields: [
          'id',
          'name',
          'slug',
          'storeImage.id',
          'manufacturer.firmen_name',
          'manufacturer.code',
          'manufacturer.slug',
          'productionStatus',
          'length',
          'height',
          'beam',
          'classification',
          'minCrew',
          'maxCrew',
          'price',
          'cargo',
        ],
        filter: {
          id: { _in: loanerIds },
        },
        sort: ['name'],
        limit: -1,
      },
    }),
  ]);

  if (!loanerData) {
    return null;
  }

  return {
    ships: hangarItems.map((obj) => transformHangarItem(obj, loanerData)),
  };
});

if (!data.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung des Hangarprotokolls konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const filteredHangar = ref();
const filteredLiveHangar = ref();
const currentHangar = ref();

const updateHangar = () => {
  let hangar = data.value?.ships;
  let liveHangar = [];

  // if (selectedDepartment.value.id) {
  //   hangar = fleet.filter((e) => e.userData.department?.id === selectedDepartment.value.id);
  // }
  // if (selectedMember.value.id) {
  //   hangar = fleet.filter((e) => e.userData.owner.id === selectedMember.value.id);
  // }
  filteredHangar.value = hangar;

  liveHangar = [...hangar.filter((e) => e.ship.productionState === 'Flugfertig')];

  hangar
    .filter((e) => e.ship.productionState !== 'Flugfertig')
    .forEach((hangarItem) => {
      hangarItem.ship.loaners?.map((loaner, index) => {
        liveHangar.push({
          ...hangarItem,
          id: hangarItem.id + '#loaner-' + index,
          ship: loaner,
          sourceShip: hangarItem.ship,
          loaner: true,
        });
      });
    });
  filteredLiveHangar.value = liveHangar;

  if (!loanerView.value) {
    currentHangar.value = hangar;
  } else {
    currentHangar.value = liveHangar;
  }
};

watch([loanerView], async () => {
  hideHangar.value = true;
  await setTimeout(async () => {
    await updateHangar();

    hideHangar.value = false;
  }, 500);
});
updateHangar();

definePageMeta({
  layout: false,
  middleware: 'auth',
});

useHead({
  title: 'Hangar: ' + user.value?.fullName,
});
</script>

<template>
  <NuxtLayout name="ams">
    <div class="flex flex-wrap justify-between px-6 mt-6 mb-4 gap-x-4">
      <div class="flex flex-wrap justify-center w-full mx-auto lg:w-fit h-fit lg:ml-0 lg:gap-4 lg:justify-normal">
        <div class="flex mx-auto sm:mx-0 basis-full sm:basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ArisUFormGroup size="xl" class="w-full 2xl:mx-auto lg:w-96" label="Suchen">
            <UInput
              size="2xl"
              v-model="search"
              class="my-auto"
              icon="i-heroicons-magnifying-glass-20-solid"
              placeholder="Schiffsname, Modell, Hersteller..."
            />
            <button
              v-if="search !== ''"
              @click="search = ''"
              type="button"
              class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
            >
              <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
            </button>
          </ArisUFormGroup>
        </div>
      </div>
      <div
        class="flex flex-wrap justify-center w-full mx-auto my-auto lg:w-fit h-fit lg:mr-0 lg:gap-4 lg:justify-normal"
      >
        <div class="flex mt-6 sm:pr-4 basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ButtonDefault class="mx-auto sm:mr-0 sm:ml-auto" @click="userSettingsStore.AMSToggleHangarDetailView">
            Detail Ansicht: {{ userSettings.ams.hangarDetailView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
        <div class="flex mt-6 sm:pl-4 basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ButtonDefault class="mx-auto sm:ml-0 sm:mr-auto" @click="userSettingsStore.AMSToggleHangarLoanerView">
            Leihschiff-Ansicht: {{ loanerView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap w-full">
      <ShipCard
        @edit="handleEdit"
        @remove-confirm="onRemoveSubmit"
        v-if="currentHangar"
        v-for="item in currentHangar.filter(
          (e) =>
            (e.userData.name ? e.userData.name.toLowerCase().includes(search.toLowerCase()) : false) ||
            e.ship.name.toLowerCase().includes(search.toLowerCase()) ||
            e.ship.manufacturer.name.toLowerCase().includes(search.toLowerCase()) ||
            e.ship.manufacturer.code.toLowerCase().includes(search.toLowerCase()),
        )"
        :key="item.id"
        :ship-data="item.ship"
        :hangar-data="item"
        :detail-view="userSettings.ams.hangarDetailView"
        :hidden="hideHangar"
        :color="item.userData.group === 'ariscorp' ? 'primary' : 'white'"
        preload-images
        internal-bio
        display-department
        display-name
        display-production-state
        display-loaner-state
      />
      <Presence>
        <Motion
          v-if="!currentHangar"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          key="errorMsg"
          class="mx-auto"
        >
          <h2 class="text-center text-secondary">
            Es gibt keine Schiffe in der ArisCorp-Flotte die deinen Kriterien entsprechen.
          </h2>
        </Motion>
      </Presence>
      <Presence>
        <Motion
          v-if="!currentHangar[0]"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          key="errorMsg"
          class="mx-auto"
        >
          <h2 class="text-center text-secondary">Ganz schön leer hier...</h2>
        </Motion>
      </Presence>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { getItems } = useDirectusItems();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const loanerView = computed(() => userSettings.value.ams.fleetLoanerView);
const selectedDepartment = ref({ name: 'Alle' });
const selectedMember = ref({ fullName: 'Alle' });
const hideFleet = ref(false);
const search = ref('');

const { data } = await useAsyncData('getFleetData', async () => {
  const [members, departments, fleet] = await Promise.all([
    getItems({
      collection: 'member',
      params: {
        fields: ['id', 'title', 'firstname', 'lastname', 'slug', 'member_potrait.id'],
        filter: {
          status: { _eq: 'published' },
        },
        limit: -1,
        sort: ['firstname'],
      },
    }),
    getItems({
      collection: 'gameplays',
      params: {
        fields: [
          'id',
          'gameplay_name',
          'gameplay_logo.id',
          'gameplay_bild_links.id',
          'gameplay_bild_rechts.id',
          'text',
          'ships',
          'members.id',
          'members.firstname',
          'members.lastname',
          'members.title',
          'members.slug',
          'head_of_department.id',
          'head_of_department.firstname',
          'head_of_department.lastname',
          'head_of_department.title',
          'head_of_department.slug',
          'head_of_department.member_potrait.id',
        ],
        filter: {
          status: { _eq: 'published' },
        },
        limit: -1,
        sort: ['gameplay_name'],
      },
    }),
    getItems({
      collection: 'member_ships',
      params: {
        fields: [
          'id',
          'name',
          'member_id.id',
          'member_id.firstname',
          'member_id.lastname',
          'member_id.title',
          'member_id.slug',
          'ships_id.id',
          'ships_id.name',
          'ships_id.slug',
          'ships_id.storeImage.id',
          'ships_id.manufacturer.firmen_name',
          'ships_id.manufacturer.slug',
          'ships_id.productionStatus',
          'ships_id.length',
          'ships_id.height',
          'ships_id.beam',
          'ships_id.classification',
          'ships_id.minCrew',
          'ships_id.maxCrew',
          'ships_id.price',
          'ships_id.cargo',
          'ships_id.loaners',
          'department.id',
          'department.gameplay_name',
          'department.gameplay_logo.id',
          'active_module.name',
        ],
        filter: {
          visibility: { _neq: 'private' },
          group: { _eq: 'ariscorp' },
        },
        sort: ['ships_id.name'],
        limit: -1,
      },
    }),
  ]);

  if (!members || !departments || !fleet) {
    return null;
  }

  const loanerIds: string[] = [];
  fleet
    .filter((e) => e.ships_id.productionStatus !== 'flight-ready')
    .forEach((obj) => obj.ships_id.loaners?.forEach((i) => !loanerIds.includes(i.id) && loanerIds.push(i.id)));

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
    members: members.map((obj) => transformMember(obj)),
    departments: departments.map((obj) => transformDepartment(obj)),
    test: transformShip(fleet.filter((e) => e.ships_id.productionStatus !== 'flight-ready')[3].ships_id, loanerData),
    test2: loanerData.map((obj) => transformShip(obj)),
    fleet: fleet.map((obj) => transformHangarItem(obj, loanerData)),
  };
});

if (!data.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung des Personalverzeichnisses konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const filteredFleet = ref();
const filteredLiveFleet = ref();
const currentFleet = ref();

// const setCurrentFleet = () => {
//   currentFleet.value = userSettingsStore.userSettings.ams.fleetLoanerView
//     ? filteredFleet.value.filter(
//         (e) =>
//           (e.userData.name ? e.userData.name.toLowerCase().includes(search.value.toLowerCase()) : false) ||
//           e.ship.name.toLowerCase().includes(search.value.toLowerCase()) ||
//           e.ship.manufacturer.name.toLowerCase().includes(search.value.toLowerCase()),
//       )
//     : filteredLiveFleet.value.filter(
//         (e) =>
//           (e.userData.name ? e.userData.name.toLowerCase().includes(search.value.toLowerCase()) : false) ||
//           e.ship.name.toLowerCase().includes(search.value.toLowerCase()) ||
//           e.ship.manufacturer.name.toLowerCase().includes(search.value.toLowerCase()),
//       );
// };

const updateFleet = () => {
  let fleet = data.value.fleet;
  let liveFleet = [];

  if (selectedDepartment.value.id) {
    fleet = fleet.filter((e) => e.userData.department?.id === selectedDepartment.value.id);
  }
  if (selectedMember.value.id) {
    fleet = fleet.filter((e) => e.userData.owner.id === selectedMember.value.id);
  }
  filteredFleet.value = fleet;

  liveFleet = [...fleet.filter((e) => e.ship.productionState === 'Flugfertig')];

  fleet
    .filter((e) => e.ship.productionState !== 'Flugfertig')
    .forEach((hangarItem) => {
      hangarItem.ship.loaners?.map((loaner, index) => {
        liveFleet.push({
          ...hangarItem,
          id: hangarItem.id + '#loaner-' + index,
          ship: loaner,
          sourceShip: hangarItem.ship,
          loaner: true,
        });
      });
    });
  filteredLiveFleet.value = liveFleet;

  if (!loanerView.value) {
    currentFleet.value = fleet;
  } else {
    // console.log('filteredlivef', filteredLiveFleet.value);
    currentFleet.value = liveFleet;
  }
  // setCurrentFleet();

  // currentFleet.value = loanerView.value ? liveFleet : filteredFleet;

  // if (!userSettingsStore.userSettings.ams.fleetLoanerView) {
  //   currentFleet.value = filteredFleet.value;
  // } else {
  //   currentFleet.value = filteredLiveFleet.value;
  // }
  console.log(currentFleet.value);
};

// updateFleet();
watch(
  [selectedMember, selectedDepartment, loanerView],
  async () => {
    hideFleet.value = true;
    await setTimeout(async () => {
      await updateFleet();
      // console.log('loanerview', userSettingsStore.userSettings.ams.fleetLoanerView);

      // currentFleet.value = loanerView.value ? filteredLiveFleet.value : filteredFleet.value;

      // if (userSettingsStore.userSettings.ams.fleetLoanerView) {
      //   currentFleet.value = filteredFleet.value.filter(
      //     (e) =>
      //       (e.userData.name ? e.userData.name.toLowerCase().includes(search.value.toLowerCase()) : false) ||
      //       e.ship.name.toLowerCase().includes(search.value.toLowerCase()) ||
      //       e.ship.manufacturer.name.toLowerCase().includes(search.value.toLowerCase()),
      //   );
      // } else {
      //   currentFleet.value = filteredLiveFleet.value.filter(
      //     (e) =>
      //       (e.userData.name ? e.userData.name.toLowerCase().includes(search.value.toLowerCase()) : false) ||
      //       e.ship.name.toLowerCase().includes(search.value.toLowerCase()) ||
      //       e.ship.manufacturer.name.toLowerCase().includes(search.value.toLowerCase()),
      //   );
      // }

      // currentFleet.value = userSettingsStore.userSettings.ams.fleetLoanerView
      // ? liveFleet.filter(
      //     (e) =>
      //       (e.userData.name ? e.userData.name.toLowerCase().includes(search.value.toLowerCase()) : false) ||
      //       e.ship.name.toLowerCase().includes(search.value.toLowerCase()) ||
      //       e.ship.manufacturer.name.toLowerCase().includes(search.value.toLowerCase()),
      //   )
      // : fleet.filter(
      //     (e) =>
      //       (e.userData.name ? e.userData.name.toLowerCase().includes(search.value.toLowerCase()) : false) ||
      //       e.ship.name.toLowerCase().includes(search.value.toLowerCase()) ||
      //       e.ship.manufacturer.name.toLowerCase().includes(search.value.toLowerCase()),
      //   );

      hideFleet.value = false;
    }, 500);
  },
  {
    immediate: true,
  },
);

// const filteredLiveFleet = computed(() => {
//   const fleet = [...filteredFleet.value.filter((e) => e.ship.productionState === 'Flugfertig')];
//   filteredFleet.value
//     .filter((e) => e.ship.productionState !== 'Flugfertig')
//     .forEach((hangarItem) => {
//       hangarItem.ship.loaners?.map((loaner, index) => {
//         fleet.push({
//           ...hangarItem,
//           id: hangarItem.id + '#loaner-' + index,
//           ship: loaner,
//           sourceShip: hangarItem.ship,
//           loaner: true,
//         });
//       });
//     });
//   return fleet;
// });

// const handleLoanerButton = async () => {
//   hideFleet.value = true;
//   await setTimeout(() => {
//     userSettingsStore.AMSToggleFleetLoanerView();
//     hideFleet.value = false;
//   }, 500);
// };

// const currentFleet = computed(() => {

// });

definePageMeta({
  middleware: 'auth',
  layout: 'ams',
});

useHead({
  title: 'Flotte',
});
</script>

<template>
  <div>
    <div class="flex w-full px-6">
      <UFormGroup size="xl" class="w-full 2xl:mx-auto lg:w-80" label="Suchen">
        <UInput
          size="2xl"
          v-model="search"
          class="my-auto"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Schiffsname, Modell, Hersteller..."
        />
      </UFormGroup>
    </div>
    <div class="flex flex-wrap justify-between px-6 mt-6 mb-4 gap-x-4">
      <div class="flex flex-wrap justify-center w-full mx-auto lg:w-fit h-fit lg:ml-0 lg:gap-4 lg:justify-normal">
        <div class="flex mx-auto sm:mx-0 sm:pr-4 basis-full sm:basis-1/2 lg:basis-auto lg:block lg:p-0">
          <UFormGroup class="w-full lg:w-80" label="Abteilung">
            <USelectMenu
              id="departmentSelect"
              v-model="selectedDepartment"
              searchable
              clear-search-on-close
              searchable-placeholder="Suche..."
              :search-attributes="['name']"
              name="Abteilung"
              placeholder="Abteilung filtern"
              :options="[{ name: 'Alle' }, ...data.departments]"
              size="xl"
            >
              <template #label>
                <UAvatar
                  img-class="object-cover object-top"
                  :src="
                    selectedDepartment.logo ? $config.public.fileBase + selectedDepartment.logo + '?format=webp' : null
                  "
                  :alt="selectedDepartment.name || 'Alle'"
                />
                <span>{{ selectedDepartment.name }}</span>
              </template>
              <template #option="{ option: department }">
                <UAvatar
                  img-class="object-cover object-top"
                  :src="department.logo ? $config.public.fileBase + department.logo + '?format=webp' : null"
                  :alt="department.name"
                />
                <span>{{ department.name }}</span>
              </template>
            </USelectMenu>
          </UFormGroup>
        </div>
        <div class="flex mx-auto mt-2 sm:mx-0 sm:pl-4 basis-full sm:mt-0 sm:basis-1/2 lg:basis-auto lg:block lg:p-0">
          <UFormGroup class="w-full lg:w-80" label="Mitglied">
            <USelectMenu
              id="memberSelect"
              v-model="selectedMember"
              searchable
              clear-search-on-close
              searchable-placeholder="Suche..."
              :search-attributes="['firstname', 'lastname', 'title']"
              name="Mitarbeiter"
              placeholder="Mitarbeiter filtern"
              :options="[{ fullName: 'Alle' }, ...data.members]"
              size="xl"
            >
              <template #label>
                <UAvatar
                  img-class="object-cover object-top"
                  :src="
                    selectedMember.potrait ? $config.public.fileBase + selectedMember.potrait + '?format=webp' : null
                  "
                  :alt="selectedMember.fullName || 'Alle'"
                />
                <span>{{ selectedMember.fullName }}</span>
              </template>
              <template #option="{ option: member }">
                <UAvatar
                  img-class="object-cover object-top"
                  :src="member.potrait ? $config.public.fileBase + member.potrait + '?format=webp' : null"
                  :alt="member.fullName"
                />
                <span>{{ member.fullName }}</span>
              </template>
            </USelectMenu>
          </UFormGroup>
        </div>
      </div>
      <div
        class="flex flex-wrap justify-center w-full mx-auto my-auto lg:w-fit h-fit lg:mr-0 lg:gap-4 lg:justify-normal"
      >
        <div class="flex mt-6 sm:pr-4 basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ButtonDefault class="mx-auto sm:mr-0 sm:ml-auto" @click="userSettingsStore.AMSToggleFleetDetailView">
            Detail Ansicht: {{ userSettings.ams.fleetDetailView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
        <div class="flex mt-6 sm:pl-4 basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ButtonDefault class="mx-auto sm:ml-0 sm:mr-auto" @click="userSettingsStore.AMSToggleFleetLoanerView">
            <!-- (PLACEHOLDER) -->
            Leihschiff-Ansicht: {{ loanerView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap">
      <ClientOnly>
        <ShipCard
          v-if="filteredFleet[0]"
          v-for="item in currentFleet"
          :key="item.id"
          :ship-data="item.ship"
          :hangar-data="item"
          :detail-view="userSettings.ams.fleetDetailView"
          :hidden="hideFleet"
          preload-images
          display-owner
          internal-bio
          display-department
          display-name
          display-production-state
        />
        <Presence>
          <Motion
            v-if="!filteredFleet[0]"
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
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mountedStates } from 'motion';

const { getItems } = useDirectusItems();
const { getUsers } = useDirectusUsers();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const loanerView = computed(() => userSettings.value.ams.fleetLoanerView);
const selectedDepartment = ref({ name: 'Alle' });
const selectedMember = ref({ fullName: 'Alle' });
const hideFleet = ref(false);
const search = ref('');

const { data } = await useAsyncData('getFleetData', async () => {
  const [members, departments, fleet] = await Promise.all([
    getUsers({
      params: {
        fields: ['id', 'title', 'first_name', 'last_name', 'slug', 'avatar'],
        filter: {
          status: { _eq: 'active' },
        },
        limit: -1,
        sort: ['first_name'],
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
          'planned',
          'user_id.id',
          'user_id.firstname',
          'user_id.lastname',
          'user_id.title',
          'user_id.slug',
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
          'department.id',
          'department.gameplay_name',
          'department.gameplay_logo.id',
          'active_module.name',
        ],
        filter: {
          visibility: { _neq: 'private' },
          group: { _eq: 'ariscorp' },
        },
        sort: ['ship_id.name'],
        limit: -1,
      },
    }),
  ]);

  if (!members || !departments || !fleet) {
    return null;
  }

  const loanerIds: string[] = [];
  fleet
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
    members: members.map((obj) => transformUser(obj)),
    departments: departments.map((obj) => transformDepartment(obj)),
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
    currentFleet.value = liveFleet;
  }
};
updateFleet();

watch([selectedMember, selectedDepartment, loanerView], async () => {
  hideFleet.value = true;
  await setTimeout(async () => {
    await updateFleet();

    hideFleet.value = false;
  }, 500);
});

definePageMeta({
  layout: 'ams',
  middleware: [
    'auth',
    // async function (to, from) {
    //   const { fetchUser, setUser } = useDirectusAuth();
    //   const user = transformUser(useDirectusUser().value);
    //   if (!user) {
    //     const user = await fetchUser();
    //     setUser(user.value);
    //   }
    //   if (user.position.permissionLevel < 3) {
    //     return navigateTo({
    //       path: '/ams',
    //     });
    //   }
    // },
  ],
});

useHead({
  title: 'Flotte',
});
</script>

<template>
  <div>
    <div class="flex w-full px-6">
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
    <div class="flex flex-wrap justify-between px-6 mt-6 mb-4 gap-x-4">
      <div class="flex flex-wrap justify-center w-full mx-auto lg:w-fit h-fit lg:ml-0 lg:gap-4 lg:justify-normal">
        <div class="flex mx-auto sm:mx-0 sm:pr-4 basis-full sm:basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ArisUFormGroup class="w-full lg:w-80" label="Abteilung">
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
              :ui="{
                leading: {
                  padding: {
                    xl: 'ps-10',
                  },
                },
              }"
            >
              <template v-if="selectedDepartment?.name !== 'Alle'" #leading />
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
            <button
              v-if="selectedDepartment?.name !== 'Alle'"
              @click="selectedDepartment = { name: 'Alle' }"
              class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
            >
              <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
            </button>
          </ArisUFormGroup>
        </div>
        <div class="flex mx-auto mt-2 sm:mx-0 sm:pl-4 basis-full sm:mt-0 sm:basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ArisUFormGroup class="w-full lg:w-80" label="Mitglied">
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
              :ui="{
                leading: {
                  padding: {
                    xl: 'ps-10',
                  },
                },
              }"
            >
              <template v-if="selectedMember?.fullName !== 'Alle'" #leading />
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
            <button
              v-if="selectedMember?.fullName !== 'Alle'"
              @click="selectedMember = { fullName: 'Alle' }"
              class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
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
          <ButtonDefault class="mx-auto sm:mr-0 sm:ml-auto" @click="userSettingsStore.AMSToggleFleetDetailView">
            Detail Ansicht: {{ userSettings.ams.fleetDetailView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
        <div class="flex mt-6 sm:pl-4 basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ButtonDefault class="mx-auto sm:ml-0 sm:mr-auto" @click="userSettingsStore.AMSToggleFleetLoanerView">
            Leihschiff-Ansicht: {{ loanerView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap">
      <ShipCard
        v-if="currentFleet"
        v-for="item in currentFleet.filter(
          (e) =>
            (e.userData.name ? e.userData.name.toLowerCase().includes(search.toLowerCase()) : false) ||
            e.ship.name.toLowerCase().includes(search.toLowerCase()) ||
            e.ship.manufacturer.name.toLowerCase().includes(search.toLowerCase()) ||
            e.ship.manufacturer.code.toLowerCase().includes(search.toLowerCase()),
        )"
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
          v-if="!currentFleet"
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
    </div>
  </div>
</template>

<script setup lang="ts">
const { getItems } = useDirectusItems();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const selectedDepartment = ref({ name: 'Alle' });
const selectedMember = ref({ fullName: 'Alle' });
const hideFleet = ref(false);

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

  const loanerIds: string[] = [];
  fleet
    .filter((e) => e.ships_id.productionStatus !== 'flight-ready')
    .forEach((obj) => obj.ships_id.loaners?.forEach((i) => (!loanerIds.includes(i.id) ? loanerIds.push(i.id) : null)));

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

  const loaners = [];
  fleet
    .filter((e) => e.ships_id.productionStatus !== 'flight-ready')
    .forEach(
      (obj) =>
        obj.ships_id?.loaners.forEach((i) => loaners.push({ ...obj, ships_id: loanerData.find((e) => e.id === i.id) })),
    );

  const liveList = [...loaners, ...fleet.filter((e) => e.ships_id.productionStatus === 'flight-ready')].sort((a, b) =>
    a.ships_id.name.localeCompare(b.ships_id.name),
  );

  return {
    members: members.map((obj) => transformMember(obj)),
    departments: departments.map((obj) => transformDepartment(obj)),
    fleet: fleet.map((obj) => transformHangarItem(obj)),
    loanerFleet: liveList.map((obj) => transformHangarItem(obj)),
  };
});

const handleDataChange = async () => {
  hideFleet.value = true;
  await setTimeout(() => (hideFleet.value = false), 500);
};

watch([selectedMember, selectedDepartment], async () => {
  hideFleet.value = true;
  await setTimeout(() => {
    updateFleet();
    hideFleet.value = false;
  }, 500);
});

const filteredFleet = ref();

const updateFleet = () => {
  let fleet = data.value.fleet;
  if (selectedDepartment.value.id) {
    fleet = fleet.filter((e) => e.userData.department?.id === selectedDepartment.value.id);
  }
  if (selectedMember.value.id) {
    fleet = fleet.filter((e) => e.userData.owner.id === selectedMember.value.id);
  }
  filteredFleet.value = fleet;
};

updateFleet();

const filteredLoanerFleet = computed(() => {
  let fleet = data.value.loanerFleet;
  if (selectedDepartment.value.id) {
    fleet = fleet.filter((e) => e.userData.department?.id === selectedDepartment.value.id);
  }
  if (selectedMember.value.id) {
    fleet = fleet.filter((e) => e.userData.owner.id === selectedMember.value.id);
  }

  return fleet;
});

const handleLoanerButton = async () => {
  hideFleet.value = true;
  await setTimeout(() => {
    userSettingsStore.AMSToggleFleetLoanerView();
    hideFleet.value = false;
  }, 100);
};

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
    <div class="flex flex-wrap justify-between px-6 my-4 gap-x-4">
      <div class="flex flex-wrap gap-4 mx-auto md:ml-0 md:mr-auto w-fit">
        <UFormGroup class="w-72" label="Abteilung">
          <USelectMenu
            id="departmentSelect"
            v-model="selectedDepartment"
            searchable
            clear-search-on-close
            searchable-placeholder="Suche..."
            :search-attributes="['name']"
            name="Channel"
            placeholder="Channel filtern"
            :options="[{ name: 'Alle' }, ...data.departments]"
            size="xl"
          >
            <template #label>
              <UAvatar
                img-class="object-cover object-top"
                :src="$config.public.fileBase + selectedDepartment.logo + '?format=webp'"
                :alt="selectedDepartment.name || 'Alle'"
              />
              <span>{{ selectedDepartment.name }}</span>
            </template>
            <template #option="{ option: department }">
              <UAvatar
                img-class="object-cover object-top"
                :src="$config.public.fileBase + department?.logo + '?format=webp'"
                :alt="department.name"
              />
              <span>{{ department.name }}</span>
            </template>
          </USelectMenu>
        </UFormGroup>
        <UFormGroup class="w-80" label="Mitglied">
          <USelectMenu
            id="memberSelect"
            v-model="selectedMember"
            searchable
            clear-search-on-close
            searchable-placeholder="Suche..."
            :search-attributes="['firstname', 'lastname', 'title']"
            name="Member"
            placeholder="Member filtern"
            :options="[{ fullName: 'Alle' }, ...data.members]"
            size="xl"
          >
            <template #label>
              <UAvatar
                img-class="object-cover object-top"
                :src="$config.public.fileBase + selectedMember.potrait + '?format=webp'"
                :alt="selectedMember.fullName || 'Alle'"
              />
              <span>{{ selectedMember.fullName }}</span>
            </template>
            <template #option="{ option: member }">
              <UAvatar
                img-class="object-cover object-top"
                :src="$config.public.fileBase + member.potrait + '?format=webp'"
                :alt="member.fullName"
              />
              <span>{{ member.fullName }}</span>
            </template>
          </USelectMenu>
        </UFormGroup>
      </div>
      <div class="my-auto w-fit h-fit">
        <div class="flex flex-wrap gap-4 mx-auto mt-6 md:mr-0 md:ml-auto">
          <ButtonDefault @click="userSettingsStore.AMSToggleFleetDetailView">
            Detail Ansicht: {{ userSettings.ams.fleetDetailView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
          <ButtonDefault @click="handleLoanerButton">
            Leihschiff-Ansicht: {{ userSettings.ams.fleetLoanerView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap">
      <ClientOnly>
        <ShipCard
          v-if="filteredFleet[0]"
          v-for="item in filteredFleet"
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
        <Motion :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0 }" v-else class="mx-auto">
          <h2 class="text-center text-secondary">
            Es gibt keine Schiffe in der ArisCorp-Flotte die deinen Kriterien entsprechen.
          </h2>
        </Motion>
      </ClientOnly>
    </div>
  </div>
</template>

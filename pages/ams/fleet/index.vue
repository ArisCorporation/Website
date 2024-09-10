<script setup lang="ts">
import { object, string, type InferType, boolean } from 'yup';
// import 'shepherd.js/dist/css/shepherd.css
import Shepherd from 'shepherd.js';
import { offset } from '@floating-ui/dom';
import type { FormSubmitEvent } from '#ui/types';

const { directus, readItem, readItems, readUsers } = useCMS();
const { params, path } = useRoute();
const userSettingsStore = useUserSettingsStore();
const userSettings = storeToRefs(userSettingsStore);
const loanerView = computed(() => userSettings.ams.value.fleetLoanerView);
const hideHangar = ref(false);
const search = ref('');
const search_input = ref();
const search_input_value = ref('');
const selectedTab = ref(0);
const setTab = (index: number) => {
  selectedTab.value = index;
};
const modalStore = useModalStore();
const dataChanged = ref(false);
const form = ref();
const selectedDepartment = ref({ name: 'Alle' });
const selectedMember = ref({ full_name: 'Alle' });
const hangarRefreshPending = ref(false);
const onboardingShip = ref();

const selectedShip = ref();
const quickViewOpen = ref(false);

useSearch(search, search_input_value, { debounce: true, query: false, debounceAction: getCurrentFilteredHangar });

const { data: users } = await useAsyncData(
  'AMS:FLEET_USERS',
  () =>
    directus.request(
      readUsers({
        filter: {
          status: { _eq: 'active' },
          hidden: { _eq: false },
        },
      }),
    ),
  { transform: (users: IRawUser[]) => users.map((user: IRawUser) => transformUser(user)) },
);

const { data: hangarItems, refresh: refreshHangarItems } = await useAsyncData('AMS:FLEET_USER_SHIPS', () =>
  directus.request(
    readItems('user_hangars', {
      filter: {
        group: { _eq: 'ariscorp' },
        visibility: { _neq: 'hidden' },
        ship_id: { _nnull: true },
      },
      fields: [
        'id',
        'date_created',
        'name',
        'planned',
        'serial',
        'visibility',
        'group',
        'name_public',
        'user_id.id',
        'user_id.first_name',
        'user_id.last_name',
        'user_id.title',
        'user_id.slug',
        'ship_id.id',
        'ship_id.name',
        'ship_id.slug',
        'ship_id.store_image',
        'ship_id.manufacturer.name',
        'ship_id.manufacturer.code',
        'ship_id.manufacturer.slug',
        'ship_id.production_status',
        'ship_id.length',
        'ship_id.height',
        'ship_id.beam',
        'ship_id.classification',
        'ship_id.crew_min',
        'ship_id.crew_max',
        'ship_id.price',
        'ship_id.cargo',
        'ship_id.modules.id',
        'ship_id.modules.name',
        'ship_id.production_status',
        'ship_id.loaners.loaner_id.id',
        'ship_id.loaners.loaner_id.name',
        'ship_id.loaners.loaner_id.slug',
        'ship_id.loaners.loaner_id.store_image',
        'ship_id.loaners.loaner_id.manufacturer.name',
        'ship_id.loaners.loaner_id.manufacturer.code',
        'ship_id.loaners.loaner_id.manufacturer.slug',
        'ship_id.loaners.loaner_id.production_status',
        'ship_id.loaners.loaner_id.length',
        'ship_id.loaners.loaner_id.height',
        'ship_id.loaners.loaner_id.beam',
        'ship_id.loaners.loaner_id.classification',
        'ship_id.loaners.loaner_id.crew_min',
        'ship_id.loaners.loaner_id.crew_max',
        'ship_id.loaners.loaner_id.price',
        'ship_id.loaners.loaner_id.cargo',
        'ship_id.loaners.loaner_id.production_status',
        'department.id',
        'department.name',
        'department.logo',
        'active_module.id',
        'active_module.name',
      ],
      limit: -1,
      sort: ['ship_id.name'],
    }),
  ),
);

const { data: departments } = await useAsyncData(
  'AMS:FLEET_DEPARTMENTS',
  () =>
    directus.request(
      readItems('departments', {
        fields: ['id', 'name', 'logo'],
        filter: {
          status: { _eq: 'published' },
        },
        limit: -1,
        sort: ['name'],
      }),
    ),
  { transform: (departments: any[]) => departments.map((department: any) => transformDepartment(department)) },
);

const { data: shipList } = await useAsyncData(
  'AMS:FLEET_SHIPS',
  () =>
    directus.request(
      readItems('ships', {
        fields: ['id', 'name', 'slug', 'manufacturer.name', 'manufacturer.slug', 'manufacturer.code'],
        sort: ['name'],
        limit: -1,
      }),
    ),
  { transform: (ships: any[]) => ships.map((ship: any) => transformShip(ship)) },
);

const refreshData = async () => {
  await refreshHangarItems();
  // await refreshNuxtData();
};

const ships = computed(() => hangarItems.value?.map((obj: any) => transformHangarItem(obj)));

if (!ships.value || !departments.value || !shipList.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung des Flottenprotokolls konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const schema = object({
  name: string().nullable(),
  serial: string().nullable(),
  group: string().required('Es ist eine Zuordnung erforderlich!'),
  department: object().nullable(),
  visibility: string().required('Es ist eine Sichtbarkeit erforderlich!'),
  show_name: boolean().required('Es ist eine Schiffsnamens-Sichtbarkeit erforderlich!'),
  module: object().nullable(),
  planned: boolean().required('Es ist ein Status erforderlich!'),
});
type Schema = InferType<typeof schema>;

const filteredHangar = ref();
const filteredLiveHangar = ref();
const currentHangar = ref();
const currentFilteredHangar = ref();

const updateHangar = () => {
  const hangar = ships.value;
  let liveHangar = [];

  filteredHangar.value = hangar;

  liveHangar = [...hangar.filter((e) => e.ship?.production_status_value === 'flight-ready')];

  hangar
    .filter((e) => e.ship?.production_status_value !== 'flight-ready')
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
    getCurrentFilteredHangar();
  } else {
    currentHangar.value = liveHangar;
    getCurrentFilteredHangar();
  }
};

watch([loanerView, selectedDepartment, selectedMember], async () => {
  hideHangar.value = true;
  await setTimeout(async () => {
    await updateHangar();

    hideHangar.value = false;
  }, 500);
});
updateHangar();

const formdata = reactive({
  name: '',
  serial: '',
  group: 'ariscorp',
  department: null,
  visibility: 'public',
  show_name: true,
  module: null,
  planned: false,
});

const initialFormdata: Schema = reactive({ ...formdata });
/// //*
const setFormData = (data: any) => {
  formdata.name = data.userData.name ?? '';
  formdata.serial = data.userData.serial ?? '';
  formdata.group = data.userData.group ?? 'ariscorp';
  formdata.department = data.userData.department ?? null;
  formdata.visibility = data.userData.visibility ?? 'public';
  formdata.show_name = data.userData.show_name ?? true;
  // formdata.module = data.userData.module ?? null;
  formdata.planned = data.userData.planned ?? false;

  initialFormdata.name = data.userData.name ?? '';
  initialFormdata.serial = data.userData.serial ?? '';
  initialFormdata.group = data.userData.group ?? 'ariscorp';
  initialFormdata.department = data.userData.department ?? null;
  initialFormdata.visibility = data.userData.visibility ?? 'public';
  initialFormdata.show_name = data.userData.show_name ?? true;
  // initialFormdata.module = data.userData.module ?? null;
  initialFormdata.planned = data.userData.planned ?? false;
};

function handleEdit(title: string, data: any) {
  dataChanged.value = false;
  setFormData(data);

  modalStore.setData(data);
  modalStore.openSlide({ hideCloseButton: true, hideXButton: true, type: 'editShip' });
}

function getCurrentFilteredHangar() {
  currentFilteredHangar.value = currentHangar.value
    .filter((e: any) =>
      selectedDepartment.value.name === 'Alle' ? true : e.userData.department?.id === selectedDepartment.value.id,
    )
    .filter((e: any) =>
      selectedMember.value.full_name === 'Alle' ? true : e.userData.owner.id === selectedMember.value.id,
    )
    .filter(
      (e: any) =>
        (e.userData.name ? e.userData.name.toLowerCase().includes(search.value.toLowerCase()) : false) ||
        e.ship.name.toLowerCase().includes(search.value.toLowerCase()) ||
        e.ship.manufacturer.name.toLowerCase().includes(search.value.toLowerCase()) ||
        e.ship.manufacturer.code.toLowerCase().includes(search.value.toLowerCase()),
    )
    .sort((a: any, b: any) => a.ship.name.localeCompare(b.ship.name));
}
getCurrentFilteredHangar();

defineShortcuts({
  s: {
    handler: () => {
      search_input.value?.input.focus();
    },
  },
  d: {
    handler: () => {
      userSettingsStore.AMSToggleFleetDetailView();
    },
  },
});

async function openQuickView(id: string) {
  const { data: shipData } = await useAsyncData(
    'FLEET:SELECTED_SHIP',
    () =>
      directus.request(
        readItem('ships', id, {
          fields: [
            'id',
            'date_updated',
            'p4k_mode',
            'p4k_version',
            'name',
            'slug',
            'store_image.id',
            'store_image.width',
            'store_image.height',
            'store_image.focal_point_x',
            'store_image.focal_point_y',
            'production_status',
            'description',
            'history',
            'length',
            'beam',
            'height',
            'mass',
            'cargo',
            'classification',
            'size',
            'crew_min',
            'crew_max',
            'quantum_fuel_tanks',
            'hydrogen_fuel_tanks',
            'pledge_price',
            'price',
            'speed_scm',
            'speed_max',
            'acceleration_main',
            'acceleration_retro',
            'acceleration_vtol',
            'acceleration_maneuvering',
            'insurance_claim_time',
            'insurance_expedited_time',
            'insurance_expedited_cost',
            'manufacturer.name',
            'manufacturer.slug',
            'manufacturer.logo',
            'gallery.directus_files_id',
            'commercial_video_id',
            'commercials.commercial_id.id',
            'commercials.commercial_id.type',
            'brochure',
            'hologram',
            'store_url',
            'sales_url',
            'on_sale',
            'rating.user_created',
            'rating.introduction',
            'rating.ratings',
            'rating.strengths_and_weaknesses',
            'loaners.loaner_id.id',
            'loaners.loaner_id.name',
            'loaners.loaner_id.slug',
            'loaners.loaner_id.store_image',
            'loaners.loaner_id.manufacturer.name',
            'loaners.loaner_id.manufacturer.slug',
            'loaners.loaner_id.production_status',
            'variants.variant_id.id',
            'variants.variant_id.name',
            'variants.variant_id.slug',
            'variants.variant_id.store_image',
            'variants.variant_id.manufacturer.name',
            'variants.variant_id.manufacturer.slug',
            'variants.variant_id.production_status',
            'modules.id',
            'modules.name',
            'modules.slug',
            'modules.gallery.directus_file_id',
            'modules.manufacturer.name',
            'modules.manufacturer.slug',
            'modules.production_status',
          ],
        }),
      ),
    { transform: (rawShip: any[]) => transformShip(rawShip) },
  );

  selectedShip.value = unref(shipData);
  quickViewOpen.value = true;
}

definePageMeta({
  middleware: 'auth',
  layout: false,
});

useHead({
  title: 'ArisCorp-Flotte',
});
</script>

<template>
  <NuxtLayout name="ams" :noscroll="quickViewOpen">
    <ShipQuickView v-model:open="quickViewOpen" :ship="selectedShip" />
    <div class="flex flex-wrap justify-between px-6 mt-6 mb-4 gap-x-4">
      <div
        class="flex flex-wrap justify-center mx-auto mb-6 lg:w-fit h-fit lg:ml-0 lg:gap-4 lg:justify-normal basis-full"
      >
        <div class="flex mx-auto sm:mx-0 sm:pr-4 basis-full lg:block lg:p-0 lg:basis-auto">
          <UFormGroup size="xl" class="w-full 2xl:mx-auto lg:w-96" label="Suchen">
            <UInput
              ref="search_input"
              v-model="search_input_value"
              size="2xl"
              class="my-auto"
              icon="i-heroicons-magnifying-glass-20-solid"
              placeholder="Schiffsname, Modell, Hersteller..."
            />
            <button
              v-if="search_input_value !== ''"
              type="button"
              class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
              @click="search_input_value = ''"
            >
              <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
            </button>
          </UFormGroup>
        </div>
      </div>
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
              :options="[{ name: 'Alle' }, ...departments]"
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
              class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
              @click="selectedDepartment = { name: 'Alle' }"
            >
              <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
            </button>
          </ArisUFormGroup>
        </div>
        <div class="flex mx-auto mt-2 sm:mx-0 sm:pl-4 basis-full sm:mt-0 sm:basis-1/2 lg:basis-auto lg:block lg:p-0">
          <UFormGroup class="w-full lg:w-80" label="Mitarbeiter">
            <USelectMenu
              id="memberSelect"
              v-model="selectedMember"
              searchable
              clear-search-on-close
              searchable-placeholder="Suche..."
              :search-attributes="['first_name', 'last_name', 'title']"
              name="Mitarbeiter"
              placeholder="Mitarbeiter filtern"
              :options="[{ full_name: 'Alle' }, ...users]"
              size="xl"
              :ui="{
                leading: {
                  padding: {
                    xl: 'ps-10',
                  },
                },
              }"
            >
              <template v-if="selectedMember?.full_name !== 'Alle'" #leading />
              <template #label>
                <UAvatar
                  img-class="object-cover object-top"
                  :src="selectedMember.avatar ? $config.public.fileBase + selectedMember.avatar + '?format=webp' : null"
                  :alt="selectedMember.full_name || 'Alle'"
                />
                <span>{{ selectedMember.full_name }}</span>
              </template>
              <template #option="{ option: member }">
                <UAvatar
                  img-class="object-cover object-top"
                  :src="member.avatar ? $config.public.fileBase + member.avatar + '?format=webp' : null"
                  :alt="member.full_name"
                />
                <span>{{ member.full_name }}</span>
              </template>
            </USelectMenu>
            <button
              v-if="selectedMember?.full_name !== 'Alle'"
              class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
              @click="selectedMember = { full_name: 'Alle' }"
            >
              <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
            </button>
          </UFormGroup>
        </div>
      </div>
      <div
        class="flex flex-wrap justify-center w-full mx-auto my-auto lg:w-fit h-fit lg:mr-0 lg:gap-4 lg:justify-normal"
      >
        <div class="flex mt-6 sm:pr-4 basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ButtonDefault class="mx-auto sm:mr-0 sm:ml-auto" @click="() => userSettingsStore.AMSToggleFleetDetailView()">
            Detail Ansicht:
            {{ userSettings.ams.value.fleetDetailView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
        <div class="flex mt-6 sm:pl-4 basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ButtonDefault class="mx-auto sm:ml-0 sm:mr-auto" @click="() => userSettingsStore.AMSToggleFleetLoanerView()">
            Leihschiff-Ansicht: {{ loanerView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
      </div>
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
            v-for="item in currentFilteredHangar"
            v-if="!hideHangar"
            :key="item.id"
            :ship-data="item.ship"
            :hangar-data="item"
            :detail-view="userSettings.ams.value.fleetDetailView"
            preload-images
            internal-bio
            display-department
            display-name
            display-production-state
            display-loaner-state
            display-owner
            display-planned-state
            quick-view
            @quick-view-open="openQuickView"
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
          <div
            v-if="!currentFilteredHangar[0] && !hideHangar"
            key="errorMsg"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            class="mx-auto"
          >
            <h2 class="text-center text-secondary">
              Es gibt keine Schiffe der ArisCorp-Flotte, die deinen Filterkriterien entsprechen...
            </h2>
          </div>
        </Transition>
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>

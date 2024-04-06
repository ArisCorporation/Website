<script setup lang="ts">
import { object, string, type InferType, boolean } from 'yup';
import type { FormSubmitEvent } from '#ui/types';
import { debounce } from 'lodash';

const { readAsyncItems, updateItem, deleteItems, createItems } = useDirectusItems();
const { readAsyncUsers } = useDirectusUsers();
const { params, path } = useRoute();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const loanerView = computed(() =>
  path.startsWith('/ams/fleet') ? userSettings.value.ams.fleetLoanerView : userSettings.value.ams.hangarLoanerView,
);
const hideHangar = ref(false);
const search = ref('');
const search_input = ref();
const selectedTab = ref(0);
const setTab = (index: number) => {
  selectedTab.value = index;
};
const modalStore = useModalStore();
const dataChanged = ref(false);
const form = ref();
const selectedDepartment = ref({ name: 'Alle' });
const selectedMember = ref({ full_name: 'Alle' });

const { data: user } = await readAsyncUsers({
  query: {
    filter: {
      ...(path.startsWith('/ams/hangar') && { id: useDirectusAuth().user.value?.id }),
      ...(path.startsWith('/ams/employees') && { slug: params?.slug }),
      ...(path.startsWith('/ams/fleet') && { id: 'none' }),
      // ...(path.startsWith('/ams/fleet') && { status: { _eq: 'none' } }),
    },
  },
  transform: (users: IRawUser[]) => transformUser(users[0]),
});

const { data: users } = await readAsyncUsers({
  query: {
    filter: {
      ...(path.startsWith('/ams/fleet') ? { status: { _eq: 'active' } } : { id: { _eq: 'none' } }),
    },
  },
  transform: (users: IRawUser[]) => users.map((user: IRawUser) => transformUser(user)),
});

const { data: hangarItems, refresh: refreshHangarItems } = await readAsyncItems('user_hangars', {
  query: {
    filter: {
      ...(!path.startsWith('/ams/fleet') && { user_id: { _eq: user.value?.id } }),
      ...(path.startsWith('/ams/fleet') && { group: { _eq: 'ariscorp' } }),
      ...(!path.startsWith('/ams/hangar') && { visibility: { _neq: 'hidden' } }),
    },
    fields: [
      'id',
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
      'ship_id.minCrew',
      'ship_id.maxCrew',
      'ship_id.price',
      'ship_id.cargo',
      'ship_id.loaners',
      'ship_id.modules.id',
      'ship_id.modules.name',
      'department.id',
      'department.name',
      'department.logo',
      'active_module.id',
      'active_module.name',
    ],
    limit: -1,
    sort: ['ship_id.name'],
  },
});

// const { data: wishlistItems } = await readAsyncItems('user_wishlist', {
//   query: {
//     filter: {
//       ...(path.startsWith('/ams/fleet') ? { user_id: 'DISABLED' } : { user_id: { _eq: user.value?.id } }),
//     },
//     fields: [
//       'id',
//       'user_id.id',
//       'user_id.first_name',
//       'user_id.last_name',
//       'user_id.title',
//       'user_id.slug',
//       'ship_id.id',
//       'ship_id.name',
//       'ship_id.slug',
//       'ship_id.store_image',
//       'ship_id.manufacturer.name',
//       'ship_id.manufacturer.slug',
//       'ship_id.production_status',
//       'ship_id.length',
//       'ship_id.height',
//       'ship_id.beam',
//       'ship_id.classification',
//       'ship_id.minCrew',
//       'ship_id.maxCrew',
//       'ship_id.price',
//       'ship_id.cargo',
//     ],
//     limit: -1,
//     sort: ['ship_id.name'],
//   },
// });

const { data: departments } = await readAsyncItems('departments', {
  query: {
    fields: ['id', 'name', 'logo'],
    filter: {
      status: { _eq: 'published' },
    },
    limit: -1,
    sort: ['name'],
  },
  transform: (departments: any[]) => departments.map((department: any) => transformDepartment(department)),
});

const { data: shipList } = await readAsyncItems('ships', {
  query: {
    fields: ['id', 'name', 'slug', 'manufacturer.name', 'manufacturer.slug', 'manufacturer.code'],
    sort: ['name'],
    limit: -1,
  },
  transform: (ships: any[]) => ships.map((ship: any) => transformShip(ship)),
});

let loanerData: any = [];
const getLoaners = async () => {
  const loanerIds: string[] = [];
  hangarItems.value
    .filter((e: any) => e.ship_id.production_status_value !== 'flight-ready')
    .forEach((obj: any) => obj.ship_id.loaners?.forEach((i: any) => !loanerIds.includes(i.id) && loanerIds.push(i.id)));
  loanerData = [];

  if (loanerIds.length > 0) {
    const { data: loanerList } = await readAsyncItems('ships', {
      query: {
        fields: [
          'id',
          'name',
          'slug',
          'store_image',
          'manufacturer.name',
          'manufacturer.code',
          'manufacturer.slug',
          'production_status',
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
    });

    if (!loanerList.value) {
      loanerData = [];
    } else {
      loanerData = loanerList.value;
    }
  }
};
await getLoaners();

const refreshData = async () => {
  await refreshHangarItems();
  // await refreshNuxtData();
  await getLoaners();
};

const ships = computed(() => hangarItems.value?.map((obj: any) => transformHangarItem(obj, loanerData)));
// const wishlist = computed(
//   () => path.startsWith('/ams/hangar') && wishlistItems.value?.map((obj) => transformHangarItem(obj)),
// );
// !wishlist.value ||
if (!ships.value || !departments.value || !shipList.value) {
  throw createError({
    statusCode: 500,
    statusMessage: path.startsWith('/ams/fleet')
      ? 'Die Übertragung des Flottenprotokolls konnte nicht vollständig empfangen werden!'
      : 'Die Übertragung des Hangarprotokolls konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

// const { data, refresh: refreshDataOld } = await useAsyncData('hangar-data', async () => {
//   const [hangarItems, wishlistItems, departments, shipList] = await Promise.all([
//     // getItems({
//     //   collection: 'member_ships',
//     //   params: {
//     //     filter: {
//     //       user_id: { _eq: user?.id },
//     //       ...(!path.startsWith('/ams/hangar') && { visibility: { _neq: 'hidden' } }),
//     //     },
//     //     fields: [
//     //       'id',
//     //       'name',
//     //       'planned',
//     //       'serial',
//     //       'visibility',
//     //       'group',
//     //       'name_public',
//     //       'user_id.id',
//     //       'user_id.first_name',
//     //       'user_id.last_name',
//     //       'user_id.title',
//     //       'user_id.slug',
//     //       'ship_id.id',
//     //       'ship_id.name',
//     //       'ship_id.slug',
//     //       'ship_id.store_image',
//     //       'ship_id.manufacturer.name',
//     //       'ship_id.manufacturer.code',
//     //       'ship_id.manufacturer.slug',
//     //       'ship_id.production_status',
//     //       'ship_id.length',
//     //       'ship_id.height',
//     //       'ship_id.beam',
//     //       'ship_id.classification',
//     //       'ship_id.minCrew',
//     //       'ship_id.maxCrew',
//     //       'ship_id.price',
//     //       'ship_id.cargo',
//     //       'ship_id.loaners',
//     //       'ship_id.modules.id',
//     //       'ship_id.modules.name',
//     //       'department.id',
//     //       'department.name',
//     //       'department.logo',
//     //       'active_module.id',
//     //       'active_module.name',
//     //     ],
//     //     limit: -1,
//     //     sort: ['ship_id.name'],
//     //   },
//     // }),
//     // getItems({
//     //   collection: 'member_wishlist',
//     //   params: {
//     //     filter: {
//     //       user_id: { _eq: user?.id },
//     //     },
//     //     fields: [
//     //       'id',
//     //       'user_id.id',
//     //       'user_id.first_name',
//     //       'user_id.last_name',
//     //       'user_id.title',
//     //       'user_id.slug',
//     //       'ship_id.id',
//     //       'ship_id.name',
//     //       'ship_id.slug',
//     //       'ship_id.store_image',
//     //       'ship_id.manufacturer.name',
//     //       'ship_id.manufacturer.slug',
//     //       'ship_id.production_status',
//     //       'ship_id.length',
//     //       'ship_id.height',
//     //       'ship_id.beam',
//     //       'ship_id.classification',
//     //       'ship_id.minCrew',
//     //       'ship_id.maxCrew',
//     //       'ship_id.price',
//     //       'ship_id.cargo',
//     //     ],
//     //     limit: -1,
//     //     sort: ['ship_id.name'],
//     //   },
//     // }),
//     // getItems({
//     //   collection: 'gameplays',
//     //   params: {
//     //     fields: ['id', 'name', 'logo'],
//     //     filter: {
//     //       status: { _eq: 'published' },
//     //     },
//     //     limit: -1,
//     //     sort: ['name'],
//     //   },
//     // }),
//     // getItems({
//     //   collection: 'ships',
//     //   params: {
//     //     fields: ['id', 'name', 'slug', 'manufacturer.name', 'manufacturer.slug', 'manufacturer.code'],
//     //     sort: ['name'],
//     //     limit: -1,
//     //   },
//     // }),
//   ]);

//   // return true;
//   return {
//     ships: hangarItems.map((obj) => transformHangarItem(obj, loanerData)),
//     shipList: shipList.map((obj) => transformShip(obj)),
//     wishlist: path.startsWith('/ams/hangar') && wishlistItems.map((obj) => transformHangarItem(obj)),
//     departments: departments.map((obj) => transformDepartment(obj)),
//   };
// });

// if (data) {
//   throw createError({
//     statusCode: 500,
//     statusMessage: JSON.stringify(data.value),
//     fatal: true,
//   });
// }

// if (!data.value) {
// }
/////*
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

const refreshHangar = async () => {
  await refreshData();
  await updateHangar();
};

const updateHangar = () => {
  let hangar = ships.value;
  let liveHangar = [];

  // if (path.startsWith('/ams/fleet')) {
  //   if (selectedDepartment.value.name !== 'Alle') {
  //     hangar = hangar.filter((e: IHangarItem) => e.userData.department?.id === selectedDepartment.value.id);
  //   }
  //   if (selectedMember.value.full_name !== 'Alle') {
  //     hangar = hangar.filter((e: IHangarItem) => e.userData.owner.id === selectedMember.value.id);
  //   }
  // }

  filteredHangar.value = hangar;

  liveHangar = [...hangar.filter((e) => e.ship.production_status_value === 'flight-ready')];

  hangar
    .filter((e) => e.ship.production_status_value !== 'flight-ready')
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
/////*
const setFormData = (data: IHangarItem) => {
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

function handleEdit(title: string, data: IHangarItem) {
  dataChanged.value = false;
  setFormData(data);

  modalStore.setData(data);
  modalStore.openSlide({ hideCloseButton: true, hideXButton: true, type: 'editShip' });
}

const onEditSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    if (!event.data) {
      throw new Error('Data is null!');
    }
    modalStore.closeSlide();
    await updateItem('user_hangars', modalStore.data.id, {
      name: event.data.name,
      name_public: event.data.show_name,
      serial: event.data.serial,
      group: event.data.group,
      visibility: event.data.visibility,
      department: event.data.department?.id ?? null,
      planned: event.data.planned,
      // active_module: event.data.module?.id ?? null,
    });
    await refreshHangar();
  } catch (e) {
    console.error(e);
  }
};

const onRemoveSubmit = async (data: IHangarItem) => {
  try {
    if (!data) {
      throw new Error('Data is null!');
    }
    // await setTimeout(async () => {
    //   currentFilteredHangar.value = currentFilteredHangar.value.filter((e: IHangarItem) => e.id !== data.id);
    // }, 500);
    await deleteItems('user_hangars', [data.id]);
    await refreshHangar();
  } catch (e) {
    console.error(e);
  }
};

const onWishlistRemoveSubmit = async (data: IHangarItem) => {
  try {
    if (!data) {
      throw new Error('Data is null!');
    }
    await deleteItems('member_wishlists', [data.id]);
    await refreshHangar();
  } catch (e) {
    console.error(e);
  }
};

const onAddSubmit = async (type: string, data: IShip[]) => {
  try {
    if (!data || !user.value.id) {
      throw new Error('Data is null!');
    }

    modalStore.closeModal();
    if (type === 'addShips') {
      await createItems(
        'user_hangars',
        data.map((ship) => ({
          user_id: user.value.id,
          ship_id: ship.id,
          show_name: true,
          group: 'ariscorp',
          visibility: 'public',
          planned: false,
        })),
      );
    } else if (type === 'addWishlist') {
      await createItems(
        'member_wishlist',
        data.map((ship) => ({
          user_id: user?.id,
          ship_id: ship.id,
        })),
      );
    }
    await refreshHangar();
  } catch (e) {
    console.error(e);
  }
};

const debounceSearch = debounce(() => {
  getCurrentFilteredHangar();
  hideHangar.value = false;
}, 500);

function handleSearch() {
  hideHangar.value = true;
  debounceSearch();
}

function getCurrentFilteredHangar() {
  currentFilteredHangar.value = currentHangar.value
    .filter(
      (e: any) =>
        (e.userData.name ? e.userData.name.toLowerCase().includes(search.value.toLowerCase()) : false) ||
        e.ship.name.toLowerCase().includes(search.value.toLowerCase()) ||
        e.ship.manufacturer.name.toLowerCase().includes(search.value.toLowerCase()) ||
        e.ship.manufacturer.code.toLowerCase().includes(search.value.toLowerCase()),
    )
    .sort((a: IHangarItem, b: IHangarItem) => a.ship.name.localeCompare(b.ship.name));
}
getCurrentFilteredHangar();

const openAddModal = () => {
  modalStore.setData([]);
  modalStore.openModal(selectedTab.value === 0 ? 'Hangar: Schiffe hinzufügen' : 'Wunschliste: Schiffe hinzufügen', {
    hideCloseButton: true,
    hideXButton: true,
    type: selectedTab.value === 0 ? 'addShips' : 'addWishlist',
  });
};

defineShortcuts({
  ...(path.startsWith('/ams/hangar') && {
    n: {
      handler: () => {
        if (!modalStore.isModalOpen) {
          openAddModal();
        }
      },
    },
  }),
  s: {
    handler: () => {
      search_input.value?.input.focus();
    },
  },
});

watch(
  formdata,
  () => {
    if (formdata.group !== 'ariscorp') {
      formdata.department = null;
    }

    if (formdata.department === '') {
      formdata.department = null;
    }

    dataChanged.value = !isEqual(formdata, initialFormdata);
  },
  { deep: true },
);

definePageMeta({
  alias: ['/ams/employees/hangar/:slug', '/ams/fleet'],
  middleware: 'auth',
  layout: false,
});

useHead({
  title: path.startsWith('/ams/fleet')
    ? 'ArisCorp-Flotte'
    : path.startsWith('/ams/employees')
      ? 'Hangar von ' + user.value.full_name
      : 'Mein Hangar',
});
</script>

<template>
  <NuxtLayout name="ams">
    <template #modalContent>
      <template v-if="modalStore.type === 'addShips' || modalStore.type === 'addWishlist'">
        <div class="mt-6 space-y-4 text-left">
          <ul>
            <li v-for="(ship, index) in modalStore.data">
              <div class="relative grid grid-cols-2 pr-10">
                <span class="text-tbase">{{ ship.manufacturer.name }}: </span>
                <span class="text-primary">{{ ship.name }}</span>
                <div class="absolute flex items-center h-full right-4 gap-x-2">
                  <button
                    @click="modalStore.data = [...modalStore.data, ship]"
                    class="flex w-5 h-5 transition text-dark-gray hover:text-white"
                  >
                    <Icon name="heroicons:plus-circle" class="w-full h-full" />
                  </button>
                  <button
                    @click="modalStore.data.splice(index, 1)"
                    class="flex w-5 h-5 transition text-dark-gray hover:text-white"
                  >
                    <Icon name="heroicons:x-circle" class="w-full h-full" />
                  </button>
                </div>
              </div>
            </li>
          </ul>
          <USelectMenu
            v-model="modalStore.data"
            :options="shipList"
            multiple
            searchable
            :search-attributes="['name', 'slug', 'manufacturer.name', 'manufacturer.slug', 'manufacturer.code']"
            searchable-placeholder="Suche..."
            clear-search-on-close
            size="xl"
            :ui-menu="{
              container: 'z-50 group',
              ring: 'ring-1 ring-bprimary',
            }"
          >
            <template #label>
              <span class="text-[13.9px]">Auswählen</span>
            </template>
            <template #option="{ option }">
              <span>{{ option.name }}</span>
            </template>
          </USelectMenu>
          <div class="flex flex-wrap justify-between w-full px-8 mt-6">
            <ButtonDefault type="button" @click="modalStore.closeModal" class="w-1/3" color="danger"
              >Schließen</ButtonDefault
            >
            <ButtonDefault
              @click="onAddSubmit(modalStore.type, modalStore.data)"
              type="submit"
              class="w-1/3"
              color="success"
              :class="{ grayscale: modalStore.data.length < 1 }"
              >Speichern</ButtonDefault
            >
          </div>
        </div>
      </template>
    </template>
    <template #slideCard>
      <div class="flex-1">
        <UForm ref="form" :schema="schema" :state="formdata" @submit="onEditSubmit">
          <UCard class="flex flex-col flex-1 h-screen scrollbar-gray-thin">
            <template #header>
              <NuxtImg
                :src="modalStore.data?.ship.store_image"
                :placeholder="[16, 16, 1, 5]"
                class="object-cover w-full mx-auto rounded-lg shadow-xl max-h-36"
              />
            </template>
            <TableHr><span class="flex items-center text-lg">Basisdaten</span></TableHr>
            <UFormGroup
              label="Schiffsname"
              name="name"
              description="Hier kannst du den Namen deines Schiffes eingeben."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <!-- TODO: Modellübergreifend einzigartig machen -->
              <UInput
                :icon="
                  formdata.name || initialFormdata.name
                    ? formdata.name === initialFormdata.name
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="UEE Stanton"
                size="md"
                autocomplete="off"
                v-model="formdata.name"
              />
              <!-- <template #description> -->
              <!-- <p class="px-0">Hier kannst du den Namen deines Schiffes eingeben.</p> -->
              <!-- <p class="px-0">
                  Falls du Inspiration brauchst, schau dich mal
                  <NuxtLink target="_blank" to="https://www.fantasynamegenerators.com/spaceship-names.php"
                    >hier</NuxtLink
                  >
                  um.
                </p> -->
              <!-- </template> -->
              <template v-if="formdata.name || initialFormdata.name">
                <button
                  v-if="formdata.name === initialFormdata.name"
                  @click="formdata.name = ''"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  @click="formdata.name = initialFormdata.name"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </UFormGroup>
            <UFormGroup
              label="Seriennummer"
              name="serial"
              description="Hier kannst du die Seriennummer deines Schiffes eingeben"
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <UInput
                :icon="
                  formdata.serial || initialFormdata.serial
                    ? formdata.serial === initialFormdata.serial
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="R40"
                size="md"
                autocomplete="off"
                v-model="formdata.serial"
              />
              <template v-if="formdata.serial || initialFormdata.serial">
                <button
                  v-if="formdata.serial === initialFormdata.serial"
                  @click="formdata.serial = ''"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  @click="formdata.serial = initialFormdata.serial"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </UFormGroup>
            <TableHr><span class="flex items-center text-lg">Einteilung</span></TableHr>
            <UFormGroup
              label="Einteilung"
              name="group"
              description="Hier kannst du dein Schiff der ArisCorp oder deiner privaten Flotte zuweisen."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <URadioGroup
                v-model="formdata.group"
                :options="[
                  {
                    value: 'private',
                    label: 'Privat',
                    color: 'secondary',
                  },
                  {
                    value: 'ariscorp',
                    label: 'ArisCorp',
                    color: 'primary',
                  },
                ]"
              />
            </UFormGroup>

            <UFormGroup
              label="Abteilung"
              name="department"
              description="Wenn du willst, kannst du dein Schiff hier einer beliebigen Abteilung zuweisen."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <USelectMenu
                v-model="formdata.department"
                :disabled="formdata.group !== 'ariscorp'"
                :options="['', ...departments]"
                option-attribute="name"
                searchable
                clear-search-on-close
                searchable-placeholder="Suche..."
                :search-attributes="['name']"
                :ui="
                  formdata.department || initialFormdata.department
                    ? {
                        leading: {
                          padding: {
                            xl: 'ps-10',
                          },
                        },
                      }
                    : { leading: { padding: { xl: 'hidden' } } }
                "
                :icon="
                  formdata.department || initialFormdata.department
                    ? formdata.department === initialFormdata.department
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                size="md"
              >
                <template v-if="formdata.department || initialFormdata.department" #leading />
                <template #label>
                  <span v-if="formdata.department">{{ formdata.department.name }}</span>
                  <span class="text-[13.9px]" v-else>Keine Abteilung ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <span v-if="option">{{ option.name }}</span>
                  <span v-else>Keine Abteilung</span>
                </template>
              </USelectMenu>
              <template v-if="formdata.department || initialFormdata.department">
                <button
                  v-if="formdata.department === initialFormdata.department"
                  @click="formdata.department = ''"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  @click="formdata.department = initialFormdata.department"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </UFormGroup>
            <TableHr><span class="flex items-center text-lg">Sichtbarkeit</span></TableHr>
            <UFormGroup
              label="Allgemeine Sichtbarkeit"
              name="visibility"
              description="Die Allgemeine Sichtbarkeit bezieht sich auf das gesamte Schiff."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <URadioGroup
                v-model="formdata.visibility"
                :options="[
                  {
                    value: 'public',
                    label: 'Öffentlich',
                    color: 'success',
                  },
                  {
                    value: 'internal',
                    label: 'Nur intern',
                    color: 'primary',
                  },
                  {
                    value: 'hidden',
                    label: 'Versteckt',
                    color: 'secondary',
                  },
                ]"
              />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="text-xs whitespace-break-spaces">
                      <p class="text-white">Erklärung:</p>
                      <p>
                        <span class="text-success">Öffentlich</span>: In der öffentlichen Flotte, in deiner öffentlichen
                        Biografie & internen Hangar
                      </p>
                      <p>
                        <span class="text-primary">Nur intern</span>: In der internen Flotte, in deiner internen
                        Biografie & Hangar
                      </p>
                      <p><span class="text-secondary">Versteckt</span>: In deinem privaten Hangar</p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup
              label="Schiffsnamen"
              name="show_name"
              description="Die Schiffsnamen Sichtbarkeit bezieht sich auf den individuellen Namen."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <URadioGroup
                v-model="formdata.show_name"
                :options="[
                  {
                    value: true,
                    label: 'Öffentlich',
                    color: 'success',
                  },
                  {
                    value: false,
                    label: 'Nur intern',
                    color: 'primary',
                  },
                ]"
              />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="text-xs whitespace-break-spaces">
                      <p class="text-white">Erklärung:</p>
                      <p>
                        <span class="text-success">Öffentlich</span>: In der öffentlichen Flotte, in deiner öffentlichen
                        Biografie & internen Hangar
                      </p>
                      <p>
                        <span class="text-primary">Nur intern</span>: In der internen Flotte, in deiner internen
                        Biografie & Hangar
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <TableHr><span class="flex items-center text-lg">Andere Daten</span></TableHr>
            <UFormGroup
              label="Kaufstatus"
              name="planned"
              description="Die Schiffsnamen Sichtbarkeit bezieht sich auf den individuellen Namen."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <URadioGroup
                v-model="formdata.planned"
                :options="[
                  {
                    value: false,
                    label: 'Gekauft',
                    color: 'primary',
                  },
                  {
                    value: true,
                    label: 'Geplant',
                    color: 'secondary',
                  },
                ]"
              />
            </UFormGroup>

            <template #footer>
              <div class="flex flex-wrap justify-between w-full px-8 my-auto">
                <ButtonDefault type="button" @click="modalStore.closeSlide" class="w-1/3" color="danger">
                  Schließen
                </ButtonDefault>
                <ButtonDefault
                  :type="dataChanged ? 'submit' : 'button'"
                  class="w-1/3"
                  color="success"
                  :disabled="!dataChanged"
                >
                  Speicherns
                </ButtonDefault>
              </div>
            </template>
          </UCard>
        </UForm>
        <!-- <UForm class="h-full" ref="form" :state="formdata" :schema="schema" @submit="onEditSubmit">
          <UCard class="flex flex-col flex-1 h-screen scrollbar-gray-thin"> -->
        <!-- <template #header>
              <NuxtImg
                :src="modalStore.data?.ship.store_image"
                :placeholder="[16, 16, 1, 5]"
                class="object-cover w-full mx-auto rounded-lg shadow-xl max-h-36"
              />
            </template> -->
        <!-- <h4 class="mt-0 mb-1 text-left">Basisdaten</h4> -->
        <!-- <div class="items-center justify-between space-y-4 gap-x-4"> -->
        <!-- <UFormGroup size="xl" label="Schiffsname" name="name" :ui="formgroupUi">
                <UInput v-model="formdata.name" placeholder="UEE Stanton" icon="i-mdi-rename-outline" />
                <template #hint>
                  <UPopover mode="hover">
                    <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                    <template #panel>
                      <div class="p-1 text-xs text-left text-tbase/60 whitespace-break-spaces">
                        <p>Hier kannst du den Namen deines Schiffes eingeben.</p>
                        <p>
                          Falls du Inspiration brauchst, schau dich mal
                          <NuxtLink target="_blank" to="https://www.fantasynamegenerators.com/spaceship-names.php"
                            >hier</NuxtLink
                          >
                          um.
                        </p>
                        <p>
                          <span class="text-primary">Information</span>: Innerhalb der ArisCorp sind Schiffsnamen
                          modellübergreifend Einzigartig. <br />
                          Das bedeutet wenn es ein Schiff mit Namen X gibt, ist dieser Name auch für andere Modelle
                          blockiert.
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UFormGroup> -->
        <!-- <UFormGroup size="xl" label="Seriennummer" name="serial" :ui="formgroupUi">
                <UInput v-model="formdata.serial" placeholder="R40" icon="i-mdi-rename-outline" />
                <template #hint>
                  <UPopover mode="hover">
                    <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                    <template #panel>
                      <div class="p-1 text-xs text-left text-tbase/60 whitespace-break-spaces">
                        <p>Hier kannst du die Seriennummer deines Schiffes eingeben.</p>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UFormGroup> -->
        <!-- <h4 class="mt-2 mb-1 text-left">Einteilung:</h4>
              <UFormGroup size="xl" label="Zuordnung" name="group" :ui="formgroupUi">
                <ArisRadioGroup
                  v-model="formdata.group"
                  :horizontal="true"
                  :options="[
                    {
                      value: 'private',
                      label: 'Privat',
                      color: 'secondary',
                    },
                    {
                      value: 'ariscorp',
                      label: 'ArisCorp',
                      color: 'primary',
                    },
                  ]"
                />
                <template #hint>
                  <UPopover mode="hover">
                    <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                    <template #panel>
                      <div class="p-1 text-xs text-left text-tbase/60 whitespace-break-spaces">
                        <p>Hier kannst du die Zuordnung einstellen.</p>
                        <p>
                          Entweder du stellst das Schiff der ArisCorp zur Verfügung oder
                          <br />
                          weißt es nur deinem persönlichen Hangar zu.
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UFormGroup>
              <UFormGroup size="xl" label="Abteilung" name="department" :ui="formgroupUi">
                <div v-if="formdata.group === 'ariscorp'" class="relative">
                  <USelectMenu
                    v-model="formdata.department"
                    :options="['', ...data?.departments]"
                    searchable
                    :search-attributes="['name']"
                    searchable-placeholder="Suche..."
                    clear-search-on-close
                    :ui="{ trailing: { padding: { xl: 'pr-12 pl-10' } } }"
                  >
                    <template #leading />
                    <template #label>
                      <span v-if="formdata.department?.id">{{ formdata.department.name }}</span>
                      <span v-else class="text-[13.9px]">Keine Abteilung ausgewählt</span>
                    </template>
                    <template #option="{ option }">
                      <span v-if="option.name">{{ option.name }}</span>
                      <span v-else>Keine Abteilung</span>
                    </template>
                  </USelectMenu>
                  <button
                    v-if="formdata.department?.id === initialFormdata.department?.id"
                    @click="formdata.department = null"
                    type="button"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
                  </button>
                  <button
                    v-else
                    @click="formdata.department = initialFormdata.department"
                    type="button"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon
                      name="i-heroicons-arrow-uturn-left"
                      class="my-auto transition opacity-75 hover:opacity-100"
                    />
                  </button>
                </div>
                <div v-else>
                  <UInput disabled value="Das Schiff ist Privat" />
                </div>
                <template #hint>
                  <UPopover mode="hover">
                    <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                    <template #panel>
                      <div class="p-1 text-xs text-left text-tbase/60 whitespace-break-spaces">
                        <p>Wenn du willst, kannst du dein Schiff hier einer bestimmten Abteilung zuweisen.</p>
                        <p>
                          <span class="text-primary">Information</span>: Du musst nicht in der jeweiligen Abteilung
                          arbeiten, <br />
                          um dieser dein Schiff zur verfügung zu stellen.
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UFormGroup>
              <h4 class="mt-2 mb-1 text-left">Sichtbarkeit:</h4>
              <UFormGroup size="xl" label="Allgemein" name="visibility" :ui="formgroupUi">
                <ArisRadioGroup
                  v-model="formdata.visibility"
                  :options="[
                    {
                      value: 'public',
                      label: 'Öffentlich',
                      color: 'success',
                    },
                    {
                      value: 'internal',
                      label: 'Nur intern',
                      color: 'primary',
                    },
                    {
                      value: 'hidden',
                      label: 'Versteckt',
                      color: 'secondary',
                    },
                  ]"
                />
                <template #hint>
                  <UPopover mode="hover">
                    <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                    <template #panel>
                      <div class="p-1 text-xs text-left text-tbase/60 whitespace-break-spaces">
                        <p>Die Allgemeine Sichtbarkeit bezieht sich auf das gesamte Schiff.</p>
                        <p class="text-white">Erklärung:</p>
                        <p>
                          <span class="text-success">Öffentlich</span>: In der öffentlichen Flotte, in deiner
                          öffentlichen Biografie & internen Hangar
                        </p>
                        <p>
                          <span class="text-primary">Nur intern</span>: In der internen Flotte, in deiner internen
                          Biografie & Hangar
                        </p>
                        <p><span class="text-secondary">Versteckt</span>: In deinem privaten Hangar</p>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UFormGroup>
              <UFormGroup size="xl" label="Schiffsname" name="show_name" :ui="formgroupUi">
                <ArisRadioGroup
                  v-model="formdata.show_name"
                  :options="[
                    {
                      value: true,
                      label: 'Öffentlich',
                      color: 'success',
                    },
                    {
                      value: false,
                      label: 'Nur intern',
                      color: 'primary',
                    },
                  ]"
                />
                <template #hint>
                  <UPopover mode="hover">
                    <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                    <template #panel>
                      <div class="p-1 text-xs text-left text-tbase/60 whitespace-break-spaces">
                        <p>Wie ist die Sichtbarkeit deines Schiffsnamen?</p>
                        <p class="text-white">Erklärung:</p>
                        <p>
                          <span class="text-success">Öffentlich</span>: In der öffentlichen Flotte, in deiner
                          öffentlichen Biografie & internen Hangar
                        </p>
                        <p>
                          <span class="text-primary">Nur intern</span>: In der internen Flotte, in deiner internen
                          Biografie & Hangar
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UFormGroup>
              <h4 class="mt-2 mb-1 text-left">Andere Daten:</h4>
              <UFormGroup size="xl" label="Modul" name="module" :ui="formgroupUi">
                <div v-if="modalStore.data.ship.modules.length > 0" class="relative">
                  <USelectMenu
                    v-model="formdata.module"
                    :options="['', ...modalStore.data?.ship.modules]"
                    option-attribute="name"
                    :ui="{ trailing: { padding: { xl: 'pr-12 pl-10' } } }"
                  >
                    <template #leading />
                    <template #label>
                      <span v-if="formdata.module">
                        {{ formdata.module.name }}
                      </span>
                      <span class="text-[13.9px]" v-else>Kein Modul ausgewählt</span>
                    </template>
                    <template #option="{ option }">
                      <span v-if="option">{{ option.name }}</span>
                      <span v-else>Kein Modul</span>
                    </template>
                  </USelectMenu>
                  <button
                    v-if="formdata.module?.id === initialFormdata.module?.id"
                    @click="formdata.module = null"
                    type="button"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
                  </button>
                  <button
                    v-else
                    @click="formdata.module = initialFormdata.module"
                    type="button"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon
                      name="i-heroicons-arrow-uturn-left"
                      class="my-auto transition opacity-75 hover:opacity-100"
                    />
                  </button>
                </div>
                <div v-else>
                  <UInput disabled value="Dieses Schiff ist nicht Modular" />
                </div>
                <template #hint>
                  <UPopover mode="hover">
                    <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                    <template #panel>
                      <div class="p-1 text-xs text-left text-tbase/60 whitespace-break-spaces">
                        <p>
                          Falls dein Schiff Modular ist, kannst du hier das aktuelle Modul deines Schiffes auswählen.
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UFormGroup>
              <UFormGroup size="xl" label="Status" name="planned" :ui="formgroupUi">
                <ArisRadioGroup
                  v-model="formdata.planned"
                  :options="[
                    {
                      value: false,
                      label: 'Gekauft',
                      color: 'primary',
                    },
                    {
                      value: true,
                      label: 'Geplant',
                      color: 'secondary',
                    },
                  ]"
                />
                <template #hint>
                  <UPopover mode="hover">
                    <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                    <template #panel>
                      <div class="p-1 text-xs text-left text-tbase/60 whitespace-break-spaces">
                        <p>Hier kannst du auswählen ob dein Schiff bereits gekauft ist, oder noch in Planung.</p>
                        <p>
                          <span class="text-primary">Information</span>: Bitte wähle hier nur fest geplante Schiffe aus.
                          Für alles andere hast du deine private Wunschliste.
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UFormGroup> -->
        <!-- </div>
            <template #footer>
              <div class="flex flex-wrap justify-between w-full px-8 my-auto">
                <ButtonDefault type="button" @click="modalStore.closeSlide" class="w-1/3" color="danger"
                  >Schließen</ButtonDefault
                >
                <ButtonDefault
                  @click="onEditSubmit"
                  type="submit"
                  class="w-1/3"
                  color="success"
                  :class="{ grayscale: !dataChanged }"
                  >Speichern</ButtonDefault
                >
              </div>
            </template>
          </UCard> 
        </UForm>-->
      </div>
    </template>
    <div class="flex flex-wrap justify-between px-6 mt-6 mb-4 gap-x-4">
      <div
        :class="{ 'basis-full mb-6': path.startsWith('/ams/fleet') }"
        class="flex flex-wrap justify-center mx-auto lg:w-fit h-fit lg:ml-0 lg:gap-4 lg:justify-normal"
      >
        <div
          :class="{ 'lg:basis-auto': !path.startsWith('/ams/fleet') }"
          class="flex mx-auto sm:mx-0 sm:pr-4 basis-full lg:block lg:p-0"
        >
          <UFormGroup size="xl" class="w-full 2xl:mx-auto lg:w-96" label="Suchen">
            <UInput
              id="test"
              size="2xl"
              v-model="search"
              ref="search_input"
              @input="handleSearch"
              class="my-auto"
              icon="i-heroicons-magnifying-glass-20-solid"
              :placeholder="`${selectedTab === 0 ? 'Schiffsname, ' : ''}Modell, Hersteller...`"
            />
            <button
              v-if="search !== ''"
              @click="(search = '') + handleSearch()"
              type="button"
              class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
            >
              <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
            </button>
          </UFormGroup>
        </div>
      </div>
      <div
        v-if="path.startsWith('/ams/fleet')"
        class="flex flex-wrap justify-center w-full mx-auto lg:w-fit h-fit lg:ml-0 lg:gap-4 lg:justify-normal"
      >
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
              @click="selectedDepartment = { name: 'Alle' }"
              class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
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
              @click="selectedMember = { full_name: 'Alle' }"
              class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
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
          <ButtonDefault
            class="mx-auto sm:mr-0 sm:ml-auto"
            @click="
              () =>
                path.startsWith('/ams/fleet')
                  ? userSettingsStore.AMSToggleFleetDetailView()
                  : userSettingsStore.AMSToggleHangarDetailView()
            "
          >
            Detail Ansicht:
            {{
              path.startsWith('/ams/fleet')
                ? userSettings.ams.fleetDetailView
                  ? 'Ausschalten'
                  : 'Anschalten'
                : userSettings.ams.hangarDetailView
                  ? 'Ausschalten'
                  : 'Anschalten'
            }}
          </ButtonDefault>
        </div>
        <div class="flex mt-6 sm:pl-4 basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ButtonDefault
            class="mx-auto sm:ml-0 sm:mr-auto"
            @click="
              () =>
                path.startsWith('/ams/fleet')
                  ? userSettingsStore.AMSToggleFleetLoanerView()
                  : userSettingsStore.AMSToggleHangarLoanerView()
            "
          >
            Leihschiff-Ansicht: {{ loanerView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
      </div>
    </div>
    <!-- <div class="flex w-full px-6"> -->
    <!-- search -->
    <!-- </div> -->
    <!-- <div class="flex flex-wrap justify-between px-6 mt-6 mb-4 gap-x-4">
      <div class="flex flex-wrap justify-center w-full mx-auto lg:w-fit h-fit lg:ml-0 lg:gap-4 lg:justify-normal"></div>
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
    </div> -->
    <div v-if="path.startsWith('/ams/fleet')" class="flex flex-wrap">
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
            v-if="!hideHangar"
            v-for="item in currentFilteredHangar"
            :key="item.id"
            :ship-data="item.ship"
            :hangar-data="item"
            :detail-view="userSettings.ams.fleetDetailView"
            preload-images
            internal-bio
            display-department
            display-name
            display-production-state
            display-loaner-state
            display-owner
            display-planned-states
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
            v-if="!currentHangar[0] && !hideHangar"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            key="errorMsg"
            class="mx-auto"
          >
            <h2 class="text-center text-secondary">
              Es gibt keine Schiffe der ArisCorp-Flotte, die deinen Filterkriterien entsprechen...
            </h2>
          </div>
        </Transition>
      </ClientOnly>
    </div>
    <TabGroup
      v-if="path.startsWith('/ams/hangar')"
      :tablist="[
        { id: '1', header: 'Hangar' },
        { id: '2', header: 'Wunschliste' },
      ]"
      :store="selectedTab"
      :change="setTab"
    >
      <template #tablist>
        <div class="flex flex-wrap items-center justify-between w-full">
          <div class="flex flex-wrap">
            <HeadlessTab v-slot="{ selected }" class="m-1 outline-none sm:p-1 md:p-3 focus-visible:outline-none">
              <h1
                class="m-0 uppercase transition-all duration-200 ease-in-out hover:opacity-75 hover:duration-300"
                :class="{ 'text-primary-400': selected, 'opacity-50': !selected }"
              >
                Hangar
              </h1>
            </HeadlessTab>
            <HeadlessTab v-slot="{ selected }" class="m-1 outline-none sm:p-1 md:p-3 focus-visible:outline-none">
              <h1
                class="m-0 uppercase transition-all duration-200 ease-in-out hover:opacity-75 hover:duration-300"
                :class="{ 'text-primary-400': selected, 'opacity-50': !selected }"
              >
                Wunschliste
              </h1>
            </HeadlessTab>
          </div>
          <ButtonDefault @click="openAddModal" class="h-fit">Schiffe hinzufügen</ButtonDefault>
        </div>
      </template>
      <template #tabcontent>
        <div class="relative flex flex-wrap">
          <template v-if="selectedTab === 0">
            <ClientOnly>
              <TransitionGroup
                appear
                enter-active-class="transition-all duration-500"
                leave-active-class="absolute w-full transition-all duration-500 md:w-1/2 xl:w-1/3 3xl:w-1/4"
                move-class="transition-all duration-500 delay-0"
                enter-from-class="-translate-y-4 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="opacity-0 -translate-y-0"
              >
                <ShipCard
                  v-if="!hideHangar"
                  v-for="item in currentFilteredHangar"
                  :key="item.id"
                  :ship-data="item.ship"
                  :hangar-data="item"
                  :detail-view="userSettings.ams.hangarDetailView"
                  :color="item.userData.group === 'ariscorp' ? 'primary' : 'white'"
                  @edit="handleEdit"
                  @remove-confirm="onRemoveSubmit"
                  preload-images
                  display-crud
                  internal-bio
                  display-department
                  display-name
                  display-production-state
                  display-loaner-state
                  display-hidden-state
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
                <div
                  v-if="!currentHangar[0] && !hideHangar"
                  :initial="{ opacity: 0 }"
                  :animate="{ opacity: 1 }"
                  :exit="{ opacity: 0 }"
                  key="errorMsg"
                  class="mx-auto"
                >
                  <h2 class="text-center text-secondary">
                    Es gibt keine Schiffe in deinem Hangar, die deinen Filterkriterien entsprechen...
                  </h2>
                </div>
              </Transition>
            </ClientOnly>
          </template>
          <template v-if="selectedTab === 1">
            Wishlist
            <!-- <ShipCard
              v-if="data?.wishlist[0]"
              v-for="item in wishlist?.filter(
                (e) =>
                  e.ship.name.toLowerCase().includes(search.toLowerCase()) ||
                  e.ship.manufacturer.name.toLowerCase().includes(search.toLowerCase()) ||
                  e.ship.manufacturer.code.toLowerCase().includes(search.toLowerCase()),
              )"
              @remove-confirm="onWishlistRemoveSubmit"
              :key="item.id"
              :color="item.userData.group === 'ariscorp' ? 'primary' : 'white'"
              :ship-data="item.ship"
              :hangar-data="item"
              :detail-view="userSettings.ams.hangarDetailView"
              :hidden="hideHangar"
              preload-images
              display-crud
              hide-edit
              internal-bio
              display-production-state
            />
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
                v-if="!wishlist[0] && !hideHangar"
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
                key="errorMsg"
                class="mx-auto"
              >
                <h2 class="text-center text-secondary">
                  Anscheinend hast du noch keine Schiffe auf deiner Wunschliste!
                </h2>
              </div>
            </Transition> -->
          </template>
        </div>
      </template>
    </TabGroup>
    <div v-else-if="path.startsWith('/ams/employees')" class="flex flex-wrap">
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
            v-if="!hideHangar"
            v-for="item in currentFilteredHangar"
            :key="item.id"
            :ship-data="item.ship"
            :hangar-data="item"
            :detail-view="userSettings.ams.hangarDetailView"
            :color="item.userData.group === 'ariscorp' ? 'primary' : 'white'"
            preload-images
            internal-bio
            display-department
            display-name
            display-production-state
            display-loaner-state
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
          <div
            v-if="!currentHangar[0] && !hideHangar"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            key="errorMsg"
            class="mx-auto"
          >
            <h2 class="text-center text-secondary">
              Es gibt keine Schiffe dem Hangar von {{ user.full_name }}, die deinen Filterkriterien entsprechen...
            </h2>
          </div>
        </Transition>
      </ClientOnly>
      <!-- <Presence>
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
      </Presence> -->
      <!-- <Presence> -->
      <div
        v-if="!currentHangar[0]"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        key="errorMsg"
        class="mx-auto"
      >
        <h2 class="text-center text-secondary">Ganz schön leer hier...</h2>
      </div>
      <!-- <Motion
          v-if="!currentHangar[0]"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          key="errorMsg"
          class="mx-auto"
        >
          <h2 class="text-center text-secondary">Ganz schön leer hier...</h2>
        </Motion> -->
      <!-- </Presence> -->
    </div>
  </NuxtLayout>
</template>

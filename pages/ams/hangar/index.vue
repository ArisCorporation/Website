<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { object, string, type InferType, boolean } from 'yup';

const { getItems, updateItem, deleteItems, createItems } = useDirectusItems();
const { getUsers } = useDirectusUsers();
const { params, path } = useRoute();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const loanerView = computed(() => userSettings.value.ams.hangarLoanerView);
const hideHangar = ref(false);
const search = ref('');
const selectedTab = ref(0);
const setTab = (index: number) => {
  selectedTab.value = index;
};
const modalStore = useModalStore();
const dataChanged = ref(false);
const form = ref();

const { data: user } = await useAsyncData(
  'get-user',
  async () => {
    if (path.startsWith('/ams/hangar')) {
      return await useDirectusUser().value;
    } else {
      return await getUsers({
        params: {
          filter: {
            slug: {
              _eq: params.slug,
            },
          },
        },
      });
    }
  },
  { transform: (data: any) => transformUser(data[0] ?? data) },
);
console.log(user);
const { data, refresh: refreshData } = await useAsyncData('hangar-data', async () => {
  const [hangarItems, wishlistItems, departments, shipList] = await Promise.all([
    getItems({
      collection: 'member_ships',
      params: {
        filter: {
          user_id: { _eq: user.value?.id },
          ...(!path.startsWith('/ams/hangar') && { visibility: { _neq: 'hidden' } }),
        },
        fields: [
          'id',
          'name',
          'planned',
          'serial',
          'visibility',
          'group',
          'namePublic',
          'user_id.id',
          'user_id.first_name',
          'user_id.last_name',
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
    getItems({
      collection: 'member_wishlist',
      params: {
        filter: {
          user_id: { _eq: user.value?.id },
        },
        fields: [
          'id',
          'user_id.id',
          'user_id.first_name',
          'user_id.last_name',
          'user_id.title',
          'user_id.slug',
          'ship_id.id',
          'ship_id.name',
          'ship_id.slug',
          'ship_id.storeImage.id',
          'ship_id.manufacturer.firmen_name',
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
        ],
        limit: -1,
        sort: ['ship_id.name'],
      },
    }),
    getItems({
      collection: 'gameplays',
      params: {
        fields: ['id', 'gameplay_name', 'gameplay_logo.id'],
        filter: {
          status: { _eq: 'published' },
        },
        limit: -1,
        sort: ['gameplay_name'],
      },
    }),
    getItems({
      collection: 'ships',
      params: {
        fields: ['id', 'name', 'slug', 'manufacturer.firmen_name', 'manufacturer.slug', 'manufacturer.code'],
        sort: ['name'],
        limit: -1,
      },
    }),
  ]);

  if (!hangarItems || !wishlistItems || !departments || !shipList) {
    return true;
  }

  const loanerIds: string[] = [];
  hangarItems
    .filter((e) => e.ship_id.productionStatus !== 'flight-ready')
    .forEach((obj) => obj.ship_id.loaners?.forEach((i) => !loanerIds.includes(i.id) && loanerIds.push(i.id)));

  let loanerData = null;
  if (loanerIds.length > 0) {
    const [loanerList] = await Promise.all([
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
    if (!loanerList) {
      return null;
    } else {
      loanerData = loanerList;
    }
  }

  // return true;
  return {
    ships: hangarItems.map((obj) => transformHangarItem(obj, loanerData)),
    shipList: shipList.map((obj) => transformShip(obj)),
    wishlist: path.startsWith('/ams/hangar') && wishlistItems.map((obj) => transformHangarItem(obj)),
    departments: departments.map((obj) => transformDepartment(obj)),
  };
});

// if (data) {
//   throw createError({
//     statusCode: 500,
//     statusMessage: JSON.stringify(data.value),
//     fatal: true,
//   });
// }

if (!data.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung des Hangarprotokolls konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const schema = object({
  name: string().nullable(),
  srn: string().nullable(),
  group: string().required('Es ist eine Zuordnung erforderlich!'),
  department: object().nullable(),
  visibility: string().required('Es ist eine Sichtbarkeit erforderlich!'),
  showName: boolean().required('Es ist eine Schiffsnamens-Sichtbarkeit erforderlich!'),
  module: object().nullable(),
  planned: boolean().required('Es ist ein Status erforderlich!'),
});
type Schema = InferType<typeof schema>;

const filteredHangar = ref();
const filteredLiveHangar = ref();
const currentHangar = ref();

const refreshHangar = async () => {
  await refreshData();
  updateHangar();
};

const updateHangar = () => {
  let hangar = data.value.ships;
  let liveHangar = [];

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

// const formgroupUi = {
//   strategy: 'override',
//   label: { wrapper: 'flex content-center items-center justify-between' },
// };
const formgroupUi = {
  strategy: 'override',
  container: 'relative mt-1 w-full max-w-[303px]',
  wrapper: 'flex justify-between h-fit w-full',
  label: { wrapper: 'flex content-center items-center justify-between mr-4' },
};

const formData = reactive({
  name: '',
  srn: '',
  group: 'ariscorp',
  department: null,
  visibility: 'public',
  showName: true,
  module: null,
  planned: false,
});

const initialFormData: Schema = reactive({ ...formData });

const setFormData = (data: IHangarItem) => {
  formData.name = data.userData.name ?? '';
  formData.srn = data.userData.serial ?? '';
  formData.group = data.userData.group ?? 'ariscorp';
  formData.department = data.userData.department ?? null;
  formData.visibility = data.userData.visibility ?? 'public';
  formData.showName = data.userData.showName ?? true;
  formData.module = data.userData.module ?? null;
  formData.planned = data.userData.planned ?? false;

  initialFormData.name = data.userData.name ?? '';
  initialFormData.srn = data.userData.serial ?? '';
  initialFormData.group = data.userData.group ?? 'ariscorp';
  initialFormData.department = data.userData.department ?? null;
  initialFormData.visibility = data.userData.visibility ?? 'public';
  initialFormData.showName = data.userData.showName ?? true;
  initialFormData.module = data.userData.module ?? null;
  initialFormData.planned = data.userData.planned ?? false;
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
    await updateItem({
      collection: 'member_ships',
      id: modalStore.data.id,
      item: {
        name: event.data.name,
        namePublic: event.data.showName,
        serial: event.data.srn,
        group: event.data.group,
        visibility: event.data.visibility,
        department: event.data.department?.id ?? null,
        planned: event.data.planned,
        active_module: event.data.module?.id ?? null,
      },
    });
    await refreshHangar();
  } catch (e) {
    // console.error(e);
  }
};

const onRemoveSubmit = async (data: IHangarItem) => {
  try {
    if (!data) {
      throw new Error('Data is null!');
    }
    await deleteItems({
      collection: 'member_ships',
      items: [data.id],
    });
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
    await deleteItems({
      collection: 'member_wishlist',
      items: [data.id],
    });
    await refreshHangar();
  } catch (e) {
    console.error(e);
  }
};

const onAddSubmit = async (type: string, data: IShip[]) => {
  try {
    if (!data) {
      throw new Error('Data is null!');
    }
    modalStore.closeModal();
    if (type === 'addShips') {
      await createItems({
        collection: 'member_ships',
        items: data.map((ship) => ({
          user_id: user.value?.id,
          ship_id: ship.id,
          namePublic: true,
          group: 'ariscorp',
          visibility: 'public',
          planned: false,
        })),
      });
    } else if (type === 'addWishlist') {
      await createItems({
        collection: 'member_wishlist',
        items: data.map((ship) => ({
          user_id: user.value?.id,
          ship_id: ship.id,
        })),
      });
    }
    await refreshHangar();
  } catch (e) {
    console.error(e);
  }
};

watch(
  formData,
  () => {
    if (formData.group !== 'ariscorp') {
      formData.department = null;
    }

    if (formData.department === '') {
      formData.department = null;
    }

    dataChanged.value = !isEqual(formData, initialFormData);
  },
  { deep: true },
);

definePageMeta({
  alias: '/ams/employees/hangar/:slug()',
  middleware: 'auth',
  layout: false,
});

useHead({
  title: 'Mein Hangar',
});
</script>

<template>
  <NuxtLayout name="ams">
    <template #modalContent>
      <template v-if="modalStore.type === 'addShips' || modalStore.type === 'addWishlist'">
        <div class="mt-6 space-y-4 text-left">
          <ul>
            <li v-for="ship in modalStore.data">
              <div class="relative grid grid-cols-2 pr-10">
                <span class="text-tbase">{{ ship.manufacturer.name }}: </span>
                <span class="text-primary">{{ ship.name }}</span>
                <div class="absolute flex items-center h-full right-4">
                  <button
                    @click="modalStore.data = modalStore.data.filter((e) => e.id !== ship.id)"
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
            :options="data.shipList"
            multiple
            searchable
            :search-attributes="['name', 'slug', 'manufacturer.firmen_name', 'manufacturer.slug', 'manufacturer.code']"
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
        <UForm class="h-full" ref="form" :state="formData" :schema="schema" @submit="onEditSubmit">
          <UCard class="flex flex-col flex-1 h-screen scrollbar-gray-thin">
            <template #header>
              <NuxtImg
                class="object-cover w-full mx-auto rounded-lg shadow-xl max-h-36"
                :src="modalStore.data?.ship.storeImage"
              />
            </template>
            <h4 class="mt-0 mb-1 text-left">Basisdaten</h4>
            <div class="items-center justify-between space-y-4 gap-x-4">
              <UFormGroup size="xl" label="Schiffsname" name="name" :ui="formgroupUi">
                <UInput v-model="formData.name" placeholder="UEE Stanton" icon="i-mdi-rename-outline" />
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
              </UFormGroup>
              <UFormGroup size="xl" label="Seriennummer" name="srn" :ui="formgroupUi">
                <UInput v-model="formData.srn" placeholder="R40" icon="i-mdi-rename-outline" />
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
              </UFormGroup>
              <h4 class="mt-2 mb-1 text-left">Einteilung:</h4>
              <UFormGroup size="xl" label="Zuordnung" name="group" :ui="formgroupUi">
                <!-- TODO: ADD ANIMATIONS -->
                <ArisRadioGroup
                  v-model="formData.group"
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
                <div v-if="formData.group === 'ariscorp'" class="relative">
                  <USelectMenu
                    v-model="formData.department"
                    :options="['', ...data?.departments]"
                    searchable
                    :search-attributes="['name']"
                    searchable-placeholder="Suche..."
                    clear-search-on-close
                    :ui="{ trailing: { padding: { xl: 'pr-12 pl-10' } } }"
                  >
                    <template #leading />
                    <template #label>
                      <span v-if="formData.department?.id">{{ formData.department.name }}</span>
                      <span v-else class="text-[13.9px]">Keine Abteilung ausgewählt</span>
                    </template>
                    <template #option="{ option }">
                      <span v-if="option.name">{{ option.name }}</span>
                      <span v-else>Keine Abteilung</span>
                    </template>
                  </USelectMenu>
                  <button
                    v-if="formData.department?.id === initialFormData.department?.id"
                    @click="formData.department = null"
                    type="button"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
                  </button>
                  <button
                    v-else
                    @click="formData.department = initialFormData.department"
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
                <!-- TODO: ADD ANIMATIONS -->
                <ArisRadioGroup
                  v-model="formData.visibility"
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
              <UFormGroup size="xl" label="Schiffsname" name="showName" :ui="formgroupUi">
                <!-- TODO: ADD ANIMATIONS -->
                <ArisRadioGroup
                  v-model="formData.showName"
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
                    v-model="formData.module"
                    :options="['', ...modalStore.data?.ship.modules]"
                    option-attribute="name"
                    :ui="{ trailing: { padding: { xl: 'pr-12 pl-10' } } }"
                  >
                    <template #leading />
                    <template #label>
                      <span v-if="formData.module">
                        {{ formData.module.name }}
                      </span>
                      <span class="text-[13.9px]" v-else>Kein Modul ausgewählt</span>
                    </template>
                    <template #option="{ option }">
                      <span v-if="option">{{ option.name }}</span>
                      <span v-else>Kein Modul</span>
                    </template>
                  </USelectMenu>
                  <button
                    v-if="formData.module?.id === initialFormData.module?.id"
                    @click="formData.module = null"
                    type="button"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
                  </button>
                  <button
                    v-else
                    @click="formData.module = initialFormData.module"
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
                  v-model="formData.planned"
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
              </UFormGroup>
            </div>
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
        </UForm>
      </div>
    </template>
    <div class="flex flex-wrap justify-between px-6 mt-6 mb-4 gap-x-4">
      <div class="flex flex-wrap justify-center w-full mx-auto lg:w-fit h-fit lg:ml-0 lg:gap-4 lg:justify-normal">
        <div class="flex mx-auto sm:mx-0 basis-full sm:basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ArisUFormGroup size="xl" class="w-full 2xl:mx-auto lg:w-96" label="Suchen">
            <UInput
              size="2xl"
              v-model="search"
              class="my-auto"
              icon="i-heroicons-magnifying-glass-20-solid"
              :placeholder="`${selectedTab === 0 ? 'Schiffsname, ' : ''}Modell, Hersteller...`"
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
    <TabGroup
      v-if="path.startsWith('/ams/hangar')"
      :tablist="[{ header: 'Hangar' }, { header: 'Wunschliste' }]"
      :store="selectedTab"
      :change="setTab"
    >
      <template #tablist>
        <div class="flex flex-wrap items-center justify-between w-full">
          <div class="flex flex-wrap">
            <HeadlessTab v-slot="{ selected }" class="m-1 outline-none sm:p-1 md:p-3 focus-visible:outline-none">
              <h1
                class="m-0 uppercase transition-all duration-200 ease-in-out hover:opacity-75 hover:duration-300"
                :class="{ 'text-primary-400': selected, 'opacity-50': !selected, 'text-xl': smallHeader }"
              >
                Hangar
              </h1>
            </HeadlessTab>
            <HeadlessTab v-slot="{ selected }" class="m-1 outline-none sm:p-1 md:p-3 focus-visible:outline-none">
              <h1
                class="m-0 uppercase transition-all duration-200 ease-in-out hover:opacity-75 hover:duration-300"
                :class="{ 'text-primary-400': selected, 'opacity-50': !selected, 'text-xl': smallHeader }"
              >
                Wunschliste
              </h1>
            </HeadlessTab>
          </div>
          <ButtonDefault
            @click="
              modalStore.data = [];
              modalStore.openModal(
                selectedTab === 0 ? 'Hangar: Schiffe hinzufügen' : 'Wunschliste: Schiffe hinzufügen',
                {
                  hideCloseButton: true,
                  hideXButton: true,
                  type: selectedTab === 0 ? 'addShips' : 'addWishlist',
                },
              );
            "
            class="h-fit"
            >Schiffe hinzufügen</ButtonDefault
          >
        </div>
      </template>
      <template #tabcontent>
        <div class="flex flex-wrap">
          <template v-if="selectedTab === 0">
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
              display-crud
              internal-bio
              display-department
              display-name
              display-production-state
              display-loaner-state
              display-hidden-state
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
          </template>
          <template v-if="selectedTab === 1">
            <ShipCard
              v-if="data?.wishlist[0]"
              v-for="item in data.wishlist?.filter(
                (e) =>
                  e.ship.name.toLowerCase().includes(search.toLowerCase()) ||
                  e.ship.manufacturer.name.toLowerCase().includes(search.toLowerCase()) ||
                  e.ship.manufacturer.code.toLowerCase().includes(search.toLowerCase()),
              )"
              @remove-confirm="onWishlistRemoveSubmit"
              :key="item.id"
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
            <Presence>
              <Motion
                v-if="!data?.wishlist[0]"
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
                key="errorMsg"
                class="mx-auto"
              >
                <h2 class="text-center text-secondary">
                  Anscheinend hast du noch keine Schiffe auf deiner Wunschliste!
                </h2>
              </Motion>
            </Presence>
          </template>
        </div>
      </template>
    </TabGroup>
    <div v-else class="flex flex-wrap">
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
        display-crud
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

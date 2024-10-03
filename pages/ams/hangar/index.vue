<script setup lang="ts">
import { object, string, type InferType, boolean } from 'yup';
import Shepherd from 'shepherd.js';
import { offset } from '@floating-ui/dom';
import type { FormSubmitEvent } from '#ui/types';

const { directus, readItem, readItems, updateItem, deleteItems, createItems, readMe, readUsers, updateUser } = useCMS();
const { params, path, hash } = useRoute();
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
const hangarRefreshPending = ref(false);
const onboardingShip = ref();
const loanerViewClasses = ref();

const selectedShip = ref();
// TODO:QUICKVIEW const quickViewOpen = ref(false);

useSearch(search, search_input_value, { debounce: true, query: false, debounceAction: getCurrentFilteredHangar });

// {
//         filter: {
//           ...(path.startsWith('/ams/hangar') && {
//             id: await directus.request(readMe({ fields: ['id'] })).then((data) => data.id),
//           }),
//           ...(path.startsWith('/ams/employees') && { slug: params?.slug }),
//           hidden: { _eq: false },
//         },
//       }

const { data: user } = await useAsyncData(
  'AMS:HANGAR_USER',
  () =>
    directus.request(
      path.startsWith('/ams/hangar')
        ? readMe()
        : readUsers({
            filter: {
              slug: { _eq: params?.slug.toString() },
              hidden: { _eq: false },
            },
          }),
    ),
  {
    transform: (data) => transformUser(path.startsWith('/ams/hangar') ? data : data[0]),
  },
);

const { data: hangarItems, refresh: refreshHangarItems } = await useAsyncData('AMS:HANGAR_ITEMS', () =>
  directus.request(
    readItems('user_hangars', {
      filter: {
        user_id: { _eq: user.value?.id },
        ship_id: { _nnull: true },
        ...(!path.startsWith('/ams/hangar') && { visibility: { _neq: 'hidden' } }),
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
        'ship_id.production_status',
        'ship_id.modules.id',
        'ship_id.modules.name',
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

const { data: departments } = await useAsyncData(
  'AMS:HANGAR_DEPARTMENTS',
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
  'AMS:HANGAR_SHIPS',
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

const loanerData: any = [];

const refreshData = async () => {
  await refreshHangarItems();
  // await refreshNuxtData();
};

const ships = computed(() => hangarItems.value?.map((obj: any) => transformHangarItem(obj)));
// const wishlist = computed(
//   () => path.startsWith('/ams/hangar') && wishlistItems.value?.map((obj) => transformHangarItem(obj)),
// );
// !wishlist.value ||
if (!ships.value || !departments.value || !shipList.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung des Hangarprotokolls konnte nicht vollständig empfangen werden!',
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

const refreshHangar = async () => {
  hangarRefreshPending.value = true;
  await refreshData();
  await updateHangar();
  hangarRefreshPending.value = false;
};

const updateHangar = () => {
  const hangar = ships.value;
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

  liveHangar = [...hangar.filter((e) => e.ship?.production_status_value === 'flight-ready')];

  hangar
    .filter((e) => e.ship?.production_status_value !== 'flight-ready')
    .forEach((hangarItem) => {
      hangarItem.ship.loaners?.forEach((loaner, index) => {
        console.log('loaner', loaner, hangarItem.ship);
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

watch([loanerView, selectedDepartment], async () => {
  hideHangar.value = true;
  loanerViewClasses.value = true;
  await setTimeout(async () => {
    await updateHangar();

    hideHangar.value = false;
    loanerViewClasses.value = false;
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

const onEditSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    if (!event.data) {
      throw new Error('Data is null!');
    }
    try {
      await directus.request(
        updateItem('user_hangars', modalStore.data.id, {
          name: event.data.name,
          name_public: event.data.show_name,
          serial: event.data.serial,
          group: event.data.group,
          visibility: event.data.visibility,
          department: event.data.department?.id ?? null,
          planned: event.data.planned,
          // active_module: event.data.module?.id ?? null,
        }),
      );

      modalStore.closeSlide();
      await refreshHangar();
    } catch (e) {
      form.value.setErrors([
        {
          message: 'Der Name muss Flottenweit einzigartig sein!',
          path: 'name',
        },
      ]);
    }
  } catch (e) {
    console.error(e);
  }
};

const onRemoveSubmit = async (data: any) => {
  try {
    if (!data) {
      throw new Error('Data is null!');
    }
    // await setTimeout(async () => {
    //   currentFilteredHangar.value = currentFilteredHangar.value.filter((e: IHangarItem) => e.id !== data.id);
    // }, 500);
    await directus.request(deleteItems('user_hangars', [data.id]));
    await refreshHangar();
  } catch (e) {
    console.error(e);
  }
};

const onWishlistRemoveSubmit = async (data: any) => {
  try {
    if (!data) {
      throw new Error('Data is null!');
    }
    await directus.request(deleteItems('member_wishlists', [data.id]));
    await refreshHangar();
  } catch (e) {
    console.error(e);
  }
};

const onAddSubmit = async (type: string, data: any[]) => {
  try {
    if (!data || !user.value.id) {
      throw new Error('Data is null!');
    }

    modalStore.closeModal();
    if (type === 'addShips') {
      await directus.request(
        createItems(
          'user_hangars',
          data.map((ship) => ({
            user_id: user.value.id,
            ship_id: ship.id,
            show_name: true,
            group: 'ariscorp',
            visibility: 'public',
            planned: false,
          })),
        ),
      );
    } else if (type === 'addWishlist') {
      await directus.request(
        createItems(
          'member_wishlist',
          data.map((ship) => ({
            user_id: user?.id,
            ship_id: ship.id,
          })),
        ),
      );
    }
    await refreshHangar();
  } catch (e) {
    console.error(e);
  }
};

function getCurrentFilteredHangar() {
  currentFilteredHangar.value = currentHangar.value
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
  d: {
    handler: () => {
      userSettingsStore.AMSToggleHangarDetailView();
    },
  },
});

const latestShip = computed(() => ships.value.sort((a: any, b: any) => b.id + a.id)[0]);

const tour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: {
    classes: 'shadow-md bg-purple-dark',
    scrollTo: true,
  },
  steps: [
    {
      id: 'hangar-tabs',
      text: 'Hier kannst du zwischen deinem Hangar und deiner Wunschliste wechseln.',
      attachTo: {
        element: '#hangar-tabs',
        on: 'top',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            return this.next();
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 12, crossAxis: 0 })],
      },
    },
    {
      id: 'add-button',
      text: 'Hier kannst du Schiffe zu deinem Hangar hinzufügen.',
      attachTo: {
        element: '#add-button',
        on: 'left',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            modalStore.setData([]);
            modalStore.openModal('Hangar: Schiffe hinzufügen', {
              hideCloseButton: true,
              hideXButton: true,
              type: 'addShips',
            });

            const interval = setInterval(() => {
              if (modalStore.isModalOpen) {
                clearInterval(interval);
                return this.next();
              }
            }, 100);
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
      options: {
        title: 'test',
        when: {
          show() {
            const currentStep = Shepherd.activeTour?.getCurrentStep();
            const currentStepElement = currentStep?.getElement();
            const header = currentStepElement?.querySelector('.shepherd-header');
            const progress = document.createElement('span');
            progress.style['margin-right'] = '315px';
            progress.innerText = `${Shepherd.activeTour?.steps.indexOf(currentStep) + 1}/${
              Shepherd.activeTour?.steps.length
            }`;
            header?.insertBefore(progress, currentStepElement.querySelector('.shepherd-cancel-icon'));
          },
        },
      },
    },
    {
      id: 'ship-select',
      text: 'In diesem Dropdown kannst du jegliche Schiffe auswählen.',
      attachTo: {
        element: '#ship-select',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            modalStore.data = [shipList.value[0]];
            return this.next();
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
    },
    {
      id: 'add-submit-button',
      text: 'Jetzt fügen wir alle ausgewählten Schiffe zu deinem Hangar hinzu.',
      attachTo: {
        element: '#add-submit-button',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            hangarRefreshPending.value = true;
            onAddSubmit(modalStore.type, modalStore.data);
            const interval = setInterval(() => {
              if (!hangarRefreshPending.value) {
                clearInterval(interval);
                return this.next();
              }
            }, 100);
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
    },
    {
      id: 'edit-button',
      text: 'Nun kannst du dein Schiff bearbeiten.',
      attachTo: {
        element: '#onboarding-edit-button',
        on: 'left',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            const id = latestShip.value.id;
            const title = `Bearbeiten: ${
              ships.value.find((e) => e.id === id).userData.name
                ? ships.value.find((e) => e.id === id).userData.name + ' - '
                : ''
            }${ships.value.find((e) => e.id === id).ship.manufacturer.code} ${
              ships.value.find((e) => e.id === id).ship.name
            }`;

            handleEdit(
              title,
              ships.value.find((e) => e.id === id),
            );

            const interval = setInterval(() => {
              if (modalStore.isSlideOpen) {
                clearInterval(interval);
                return this.next();
              }
            }, 100);
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
    },
    {
      id: 'ship-edit-base',
      text: 'Hier kannst den Namen und die Seriennummer deines Schiffes angeben.',
      attachTo: {
        element: '#ship-edit-base',
        on: 'left',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            return this.next();
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
    },
    {
      id: 'ship-edit-division',
      text: 'Hier geht es darum, wie du dein Schiff einteilen möchtest. Willst du es in die Flotte der ArisCorp Einteilen, eventuell sogar einer speziellen Abteilung oder gehört es doch nur in deinen privaten Hangar?',
      attachTo: {
        element: '#ship-edit-division',
        on: 'left',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            return this.next();
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
    },
    {
      id: 'ship-edit-visibility',
      text: 'Hier geht es darum, wer dein Schiff sehen darf. Du kannst einstellen, ob es für alle, Mitglieder oder nur dich sichtbar sein soll und ob der Name öffentlich sichtbar sein soll.',
      attachTo: {
        element: '#ship-edit-division',
        on: 'left',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            return this.next();
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
    },
    {
      id: 'ship-edit-other',
      text: 'In diesem Abschnitt kannst du alles andere einstellen. Zum Beispiel ob dein Schiff erst noch (fest) geplant ist, oder eventuell welches Modul du ausgerüstet hast.',
      attachTo: {
        element: '#ship-edit-other',
        on: 'left',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            return this.next();
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
    },
    {
      id: 'ship-edit-buttons',
      text: 'Danach kannst du deine Änderungen speichern oder sie verwerfen.',
      attachTo: {
        element: '#ship-edit-buttons',
        on: 'top',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            modalStore.closeSlide();
            return this.next();
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
    },
    {
      id: 'onboarding-remove-button',
      text: 'In diesem Abschnitt kannst du alles andere einstellen. Zum Beispiel ob dein Schiff erst noch (fest) geplant ist, oder eventuell welches Modul du ausgerüstet hast.',
      attachTo: {
        element: '#onboarding-remove-button',
        on: 'left',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Weiter',
          action(): any {
            onboardingShip.value[0].removePopover = true;
            setTimeout(() => {
              return this.next();
            }, 200);
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
    },
    {
      id: 'onboarding-remove-confirm-button',
      text: 'Zu guter letzt kannst du Schiffe noch entfernen.',
      attachTo: {
        element: '#onboarding-remove-confirm-button',
        on: 'top',
      },
      buttons: [
        {
          text: 'Überspringen',
          action(): any {
            return this.complete();
          },
          secondary: true,
        },
        {
          text: 'Fertig stellen',
          action(): any {
            onRemoveSubmit(latestShip.value);
            return this.next();
          },
        },
      ],
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 15, crossAxis: 0 })],
      },
    },
  ],
});

const updateOnboarding = async () => {
  const onboardings = Array.isArray(user.value.onboardings) ? user.value.onboardings : [];
  await directus.request(updateUser(user.value.id, { onboardings: [...onboardings, 'hangar'] }, {}));
};

const shipsWithCounts = computed(() => {
  const shipCount = {};
  // Count each ship's occurrences
  modalStore.data?.forEach((ship: any) => {
    const identifier = `${ship.manufacturer.name}:${ship.name}`;
    if (!shipCount[identifier]) {
      shipCount[identifier] = { ...ship, count: 0 };
    }
    shipCount[identifier].count += 1;
  });
  // Convert the object back into an array
  return Object.values(shipCount);
});

onMounted(() => {
  if (
    path.startsWith('/ams/hangar') &&
    user.value.onboardings &&
    user.value.onboardings?.find((e: string) => e !== 'hangar')
  )
    tour.start();

  tour.on('complete', () => {
    updateOnboarding();
  });
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

if (hash === '#add') {
  openAddModal();
}

// TODO:QUICKVIEW async function openQuickView(id: string) {
//   const { data: shipData } = await useAsyncData(
//     'HANGAR:SELECTED_SHIP',
//     () =>
//       directus.request(
//         readItem('ships', id, {
//           fields: [
//             'id',
//             'date_updated',
//             'p4k_mode',
//             'p4k_version',
//             'name',
//             'slug',
//             'store_image.id',
//             'store_image.width',
//             'store_image.height',
//             'store_image.focal_point_x',
//             'store_image.focal_point_y',
//             'production_status',
//             'description',
//             'history',
//             'length',
//             'beam',
//             'height',
//             'mass',
//             'cargo',
//             'classification',
//             'size',
//             'crew_min',
//             'crew_max',
//             'quantum_fuel_tanks',
//             'hydrogen_fuel_tanks',
//             'pledge_price',
//             'price',
//             'speed_scm',
//             'speed_max',
//             'acceleration_main',
//             'acceleration_retro',
//             'acceleration_vtol',
//             'acceleration_maneuvering',
//             'insurance_claim_time',
//             'insurance_expedited_time',
//             'insurance_expedited_cost',
//             'manufacturer.name',
//             'manufacturer.slug',
//             'manufacturer.logo',
//             'gallery.directus_files_id',
//             'commercial_video_id',
//             'commercials.commercial_id.id',
//             'commercials.commercial_id.type',
//             'brochure',
//             'hologram',
//             'store_url',
//             'sales_url',
//             'on_sale',
//             'rating.user_created',
//             'rating.introduction',
//             'rating.ratings',
//             'rating.strengths_and_weaknesses',
//             'loaners.loaner_id.id',
//             'loaners.loaner_id.name',
//             'loaners.loaner_id.slug',
//             'loaners.loaner_id.store_image',
//             'loaners.loaner_id.manufacturer.name',
//             'loaners.loaner_id.manufacturer.slug',
//             'loaners.loaner_id.production_status',
//             'variants.variant_id.id',
//             'variants.variant_id.name',
//             'variants.variant_id.slug',
//             'variants.variant_id.store_image',
//             'variants.variant_id.manufacturer.name',
//             'variants.variant_id.manufacturer.slug',
//             'variants.variant_id.production_status',
//             'modules.id',
//             'modules.name',
//             'modules.slug',
//             'modules.gallery.directus_file_id',
//             'modules.manufacturer.name',
//             'modules.manufacturer.slug',
//             'modules.production_status',
//           ],
//         }),
//       ),
//     { transform: (rawShip: any[]) => transformShip(rawShip) },
//   );

//   selectedShip.value = unref(shipData);
//   quickViewOpen.value = true;
// }

definePageMeta({
  alias: '/ams/employees/hangar/:slug',
  middleware: 'auth',
  layout: false,
});

useHead({
  title: path.startsWith('/ams/employees') ? 'Hangar von ' + user.value.full_name : 'Mein Hangar',
});
</script>

<template>
  <NuxtLayout name="ams" :noscroll="quickViewOpen">
    <!-- TODO:QUICKVIEW <ShipQuickView v-model:open="quickViewOpen" :ship="selectedShip" /> -->
    <template #modalContent>
      <template v-if="modalStore.type === 'addShips' || modalStore.type === 'addWishlist'">
        <div class="mt-6 space-y-4 text-left">
          <ul>
            <li v-for="(ship, index) in shipsWithCounts" :key="index">
              <div class="relative grid grid-cols-2 pr-10">
                <span class="text-tbase">{{ ship.manufacturer.name }}: </span>
                <span class="text-primary"
                  ><span class="text-tbase">{{ ship.count }}x </span>{{ ship.name }}</span
                >
                <div class="absolute flex items-center h-full right-4 gap-x-2">
                  <button
                    class="flex w-5 h-5 transition text-dark-gray hover:text-white"
                    @click="modalStore.data = [...modalStore.data, ship]"
                  >
                    <Icon name="heroicons:plus-circle" class="w-full h-full" />
                  </button>
                  <button
                    class="flex w-5 h-5 transition text-dark-gray hover:text-white"
                    @click="modalStore.data.splice(index, 1)"
                  >
                    <Icon
                      :name="ship.count > 1 ? 'heroicons:minus-circle' : 'heroicons:x-circle'"
                      class="w-full h-full"
                    />
                  </button>
                </div>
              </div>
            </li>
          </ul>
          <USelectMenu
            id="ship-select"
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
            <ButtonDefault type="button" class="w-1/3" color="danger" @click="modalStore.closeModal">
              Schließen
            </ButtonDefault>
            <ButtonDefault
              id="add-submit-button"
              type="submit"
              class="w-1/3"
              color="success"
              :class="{ grayscale: modalStore.data.length < 1 }"
              @click="onAddSubmit(modalStore.type, modalStore.data)"
            >
              Speichern
            </ButtonDefault>
          </div>
        </div>
      </template>
    </template>
    <!-- <template #slideCard> -->
    <template #slideHeader>
      <NuxtImg
        :src="modalStore.data?.ship.store_image"
        :placeholder="[16, 16, 1, 5]"
        class="object-cover w-full mx-auto rounded-lg shadow-xl max-h-36"
      />
    </template>
    <template #slideContent>
      <UForm ref="form" :schema="schema" :state="formdata" :errors="editFormErrors" @submit="onEditSubmit">
        <!-- <UCard
						class="flex flex-col flex-1 h-screen scrollbar-gray-thin"
						:ui="{
							body: {
								base: 'flex-1 overflow-auto',
								background: '',
								padding: 'px-4 py-6',
							},
						}"
					>
						<template #header>

						</template> -->
        <div id="ship-edit-base" class="px-2">
          <TableHr><span class="flex items-center text-lg">Basisdaten</span></TableHr>
          <UFormGroup
            v-slot="{ error }"
            label="Schiffsname"
            name="name"
            description="Hier kannst du den Namen deines Schiffes eingeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <!-- TODO: Modellübergreifend einzigartig machen -->
            <UInput
              v-model="formdata.name"
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
                class="absolute top-0 bottom-0 z-20 flex mt-2 left-3 h-fit"
                @click="formdata.name = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  :class="{ 'text-red-500': error }"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex mt-2 left-3 h-fit"
                @click="formdata.name = initialFormdata.name"
              >
                <UIcon
                  name="i-heroicons-arrow-uturn-left"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  :class="{ 'text-red-500': error }"
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
              v-model="formdata.serial"
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
            />
            <template v-if="formdata.serial || initialFormdata.serial">
              <button
                v-if="formdata.serial === initialFormdata.serial"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.serial = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.serial = initialFormdata.serial"
              >
                <UIcon
                  name="i-heroicons-arrow-uturn-left"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
            </template>
          </UFormGroup>
        </div>
        <div id="ship-edit-division" class="px-2">
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
                <span v-else class="text-[13.9px]">Keine Abteilung ausgewählt</span>
              </template>
              <template #option="{ option }">
                <span v-if="option">{{ option.name }}</span>
                <span v-else>Keine Abteilung</span>
              </template>
            </USelectMenu>
            <template v-if="formdata.department || initialFormdata.department">
              <button
                v-if="formdata.department === initialFormdata.department"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.department = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.department = initialFormdata.department"
              >
                <UIcon
                  name="i-heroicons-arrow-uturn-left"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
            </template>
          </UFormGroup>
        </div>
        <div id="ship-edit-visibility" class="px-2">
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
                      <span class="text-primary">Nur intern</span>: In der internen Flotte, in deiner internen Biografie
                      & Hangar
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
                      <span class="text-primary">Nur intern</span>: In der internen Flotte, in deiner internen Biografie
                      & Hangar
                    </p>
                  </div>
                </template>
              </UPopover>
            </template>
          </UFormGroup>
        </div>
        <div id="ship-edit-other" class="px-2">
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
        </div>

        <!-- </UCard> -->

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
        </UForm> -->
      </UForm>
    </template>
    <template #slideFooter>
      <div id="ship-edit-buttons" class="flex flex-wrap justify-between w-full px-8 my-auto">
        <ButtonDefault type="button" class="w-1/3" color="danger" @click="modalStore.closeSlide">
          Schließen
        </ButtonDefault>
        <ButtonDefault
          :type="dataChanged ? 'submit' : 'button'"
          class="w-1/3"
          color="success"
          :disabled="!dataChanged"
          @click="form.submit()"
        >
          Speichern
        </ButtonDefault>
      </div>
    </template>
    <!-- </template> -->
    <div class="flex flex-wrap justify-between px-6 mt-6 mb-4 gap-x-4">
      <div class="flex flex-wrap justify-center mx-auto lg:w-fit h-fit lg:ml-0 lg:gap-4 lg:justify-normal">
        <div class="flex mx-auto sm:mx-0 sm:pr-4 basis-full lg:block lg:p-0">
          <UFormGroup size="xl" class="w-full 2xl:mx-auto lg:w-96" label="Suchen">
            <UInput
              ref="search_input"
              v-model="search_input_value"
              size="2xl"
              class="my-auto"
              icon="i-heroicons-magnifying-glass-20-solid"
              :placeholder="`${selectedTab === 0 ? 'Schiffsname, ' : ''}Modell, Hersteller...`"
            />
            <button
              v-if="search_input_value !== '' && !search_input_value"
              type="button"
              class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
              @click="search_input_value = ''"
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
            @click="() => userSettingsStore.AMSToggleHangarDetailView()"
          >
            Detail Ansicht:
            {{ userSettings.ams.hangarDetailView ? 'Ausschalten' : 'Anschalten' }}
          </ButtonDefault>
        </div>
        <div class="flex mt-6 sm:pl-4 basis-1/2 lg:basis-auto lg:block lg:p-0">
          <ButtonDefault
            class="mx-auto sm:ml-0 sm:mr-auto"
            @click="() => userSettingsStore.AMSToggleHangarLoanerView()"
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
          <div id="hangar-tabs" class="flex flex-wrap">
            <HeadlessTab
              v-slot="{ selected }"
              class="m-1 outline-none sm:p-1 md:p-3 focus-visible:outline-none animate-link"
            >
              <h1
                class="m-0 uppercase transition-all duration-200 ease-in-out hover:opacity-75 hover:duration-300"
                :class="{ 'text-primary-400': selected, 'opacity-50': !selected }"
              >
                Hangar
              </h1>
            </HeadlessTab>
            <HeadlessTab
              v-slot="{ selected }"
              class="m-1 outline-none sm:p-1 md:p-3 focus-visible:outline-none animate-link"
            >
              <h1
                class="m-0 uppercase transition-all duration-200 ease-in-out hover:opacity-75 hover:duration-300"
                :class="{ 'text-primary-400': selected, 'opacity-50': !selected }"
              >
                Wunschliste
              </h1>
            </HeadlessTab>
          </div>
          <ButtonDefault id="add-button" class="h-fit" @click="openAddModal"> Schiffe hinzufügen </ButtonDefault>
        </div>
      </template>
      <template #tabcontent>
        <div class="relative flex flex-wrap">
          <template v-if="selectedTab === 0">
            <ClientOnly>
              <TransitionGroup
                appear
                enter-active-class="transition-all duration-500"
                :leave-active-class="
                  loanerViewClasses
                    ? 'w-full transition-all duration-500'
                    : 'absolute w-full transition-all duration-500 md:w-1/2 xl:w-1/3 3xl:w-1/4'
                "
                :move-class="loanerViewClasses ? null : 'transition-all duration-500 delay-0'"
                enter-from-class="-translate-y-4 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-from-class="translate-y-0 opacity-100"
                :leave-to-class="loanerViewClasses ? 'opacity-0 -translate-y-4' : 'opacity-0 -translate-y-0'"
              >
                <ShipCard
                  v-for="item in currentFilteredHangar"
                  v-if="!hideHangar"
                  :key="item.id"
                  :ref="item.id === latestShip.id ? 'onboardingShip' : null"
                  :ship-data="item.ship"
                  :hangar-data="item"
                  :detail-view="userSettings.ams.hangarDetailView"
                  :color="item.userData.group === 'ariscorp' ? 'primary' : 'white'"
                  :onboarding="item.id === latestShip.id"
                  preload-images
                  :display-crud="!loanerView"
                  internal-bio
                  display-department
                  display-name
                  display-production-state
                  display-loaner-state
                  display-hidden-state
                  display-planned-state
                  @edit="handleEdit"
                  @remove-confirm="onRemoveSubmit"
                />
                <!-- TODO:QUICKVIEW
                quick-view
                  @quick-view-open="openQuickView"
                -->
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
                  key="errorMsg"
                  :initial="{ opacity: 0 }"
                  :animate="{ opacity: 1 }"
                  :exit="{ opacity: 0 }"
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
            v-for="item in currentFilteredHangar"
            v-if="!hideHangar"
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
          <!-- TODO:QUICKVIEW
            quick-view
            @quick-view-open="openQuickView"
          -->
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
            key="errorMsg"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
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
        key="errorMsg"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
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

<style lang="postcss">
.shepherd-button {
  @apply relative inline-block after:absolute after:bg-btertiary after:left-4 after:right-4 before:absolute before:bg-btertiary before:box-border before:left-4 before:right-4 bg-bprimary text-tbase p-2 rounded-[10px] border-2 after:h-0.5 before:h-0.5 before:-top-0.5 after:-bottom-0.5 cursor-pointer border-green-600 animate-link;
}

.shepherd-button:not(:disabled):hover {
  @apply bg-bsecondary;
}

.shepherd-button.shepherd-button-secondary {
  @apply border-red-600;
}

.shepherd-button.shepherd-button-secondary:not(:disabled):hover {
  @apply bg-bsecondary;
}

.shepherd-button:disabled {
  @apply cursor-not-allowed;
}

.shepherd-footer {
  @apply rounded-b flex justify-end p-3 pt-0 space-x-4;
}

.shepherd-footer .shepherd-button:last-child {
  @apply mr-0;
}

.shepherd-cancel-icon {
  @apply bg-transparent border-none text-[#808080] text-opacity-75 cursor-pointer text-[2em] font-normal m-0 p-0 transition-colors duration-500;
}

.shepherd-cancel-icon:hover {
  @apply text-black text-opacity-75;
}

.shepherd-has-title .shepherd-content .shepherd-cancel-icon {
  @apply text-[#808080] text-opacity-75;
}

.shepherd-has-title .shepherd-content .shepherd-cancel-icon:hover {
  @apply text-black text-opacity-75;
}

.shepherd-title {
  @apply text-black text-opacity-75 flex flex-grow flex-auto text-base font-normal m-0 p-0;
}

.shepherd-header {
  @apply items-center border-t-4 flex justify-end leading-8 px-3 pt-3;
}

.shepherd-has-title .shepherd-content .shepherd-header {
  @apply bg-tbase p-4;
}

.shepherd-text {
  @apply text-tbase text-base leading-5 p-3;
}

.shepherd-text p {
  @apply mt-0;
}

.shepherd-text p:last-child {
  @apply mt-0;
}

.shepherd-content {
  @apply rounded outline-none p-0;
}

.shepherd-element {
  @apply bg-bsecondary rounded max-w-[400px] opacity-0 outline-none transition-opacity duration-300 invisible w-full z-[9999] [box-shadow:_0_1px_4px_rgba(0,_0,_0,_0.2)] border border-btertiary;
}

.shepherd-enabled.shepherd-element {
  @apply opacity-100 visible;
}

.shepherd-element[data-popper-reference-hidden]:not(.shepherd-centered) {
  @apply opacity-0 pointer-events-none invisible;
}

.shepherd-element,
.shepherd-element *,
.shepherd-element :after,
.shepherd-element :before {
  @apply box-border;
}

.shepherd-arrow,
.shepherd-arrow:before {
  @apply h-4 absolute w-4 -z-10;
}

.shepherd-arrow:before {
  @apply bg-bsecondary rotate-45 content-[''];
}

.shepherd-element[data-popper-placement='top'] .shepherd-arrow:before {
  @apply border-b border-r border-btertiary;
}

.shepherd-element[data-popper-placement='bottom'] .shepherd-arrow:before {
  @apply border-t border-l border-btertiary;
}

.shepherd-element[data-popper-placement='left'] .shepherd-arrow:before {
  @apply border-t border-r border-btertiary;
}

.shepherd-element[data-popper-placement='right'] .shepherd-arrow:before {
  @apply border-b border-l border-btertiary;
}

.shepherd-element[data-popper-placement^='top'] > .shepherd-arrow {
  @apply -bottom-[8.6px];
}

.shepherd-element[data-popper-placement^='bottom'] > .shepherd-arrow {
  @apply -top-2;
}

.shepherd-element[data-popper-placement^='left'] > .shepherd-arrow {
  @apply -right-2;
}

.shepherd-element[data-popper-placement^='right'] > .shepherd-arrow {
  @apply -left-2;
}

.shepherd-element.shepherd-centered > .shepherd-arrow {
  @apply opacity-0;
}

.shepherd-element.shepherd-has-title[data-popper-placement^='bottom'] > .shepherd-arrow:before {
  @apply bg-tbase;
}

.shepherd-target-click-disabled.shepherd-enabled.shepherd-target,
.shepherd-target-click-disabled.shepherd-enabled.shepherd-target * {
  @apply pointer-events-none;
}

.shepherd-modal-overlay-container {
  @apply h-0 left-0 opacity-0 overflow-hidden pointer-events-none fixed top-0 transition-all ease-out duration-300 w-full z-[9997];
}

.shepherd-modal-overlay-container.shepherd-modal-is-visible {
  @apply h-screen opacity-50 transition-all ease-out duration-300;
}

.shepherd-modal-overlay-container.shepherd-modal-is-visible path {
  @apply pointer-events-auto;
}
</style>

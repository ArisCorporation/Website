<script setup lang="ts">
import { object, string, array, boolean, type InferType, number, ValidationError } from 'yup';
import Editor from '@tinymce/tinymce-vue';
const config = useRuntimeConfig();
const userData = useDirectusUser();
const { getUserById } = useDirectusUsers();
const { getItems, updateItem } = useDirectusItems();
const { token: apiToken, refreshTokens } = useDirectusToken();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const modalStore = useModalStore();
const dataChanged = ref(false);
const form = ref();
const tryCount = ref(0);

const citizenReasonOptions = [
  {
    value: 'military',
    label: 'Militärischer Dienst',
    color: 'primary',
  },
  {
    value: 'education',
    label: 'Besondere Bildung',
    color: 'primary',
  },
  {
    value: 'social',
    label: 'Soziales Engagement',
    color: 'primary',
  },
];

class FetchError extends Error {
  constructor(message: string, type: string) {
    super(message);
    this.type = type;
    this.name = 'FetchError';
  }
}

const { data: user, refresh: refreshUser } = await useAsyncData(
  'get-profile',
  () =>
    getUserById({
      id: userData.value?.id,
      params: {
        fields: [
          '*',
          'currentResidence.id',
          'currentResidence.name',
          'currentResidence.slug',
          'currentResidence.planet.id',
          'currentResidence.planet.name',
          'currentResidence.planet.astronomicalDesignation',
          'currentResidence.planet.slug',
          'currentResidence.planet.starSystem.id',
          'currentResidence.planet.starSystem.name',
          'currentResidence.planet.starSystem.slug',
          'birthplace.id',
          'birthplace.name',
          'birthplace.slug',
          'birthplace.planet.id',
          'birthplace.planet.name',
          'birthplace.planet.astronomicalDesignation',
          'birthplace.planet.slug',
          'birthplace.planet.starSystem.id',
          'birthplace.planet.starSystem.name',
          'birthplace.planet.starSystem.slug',
        ],
      },
    }),
  {
    transform: (user) => transformUser(user),
  },
);

const { data } = await useAsyncData('selectionData', async () => {
  const [departments, landingZones] = await Promise.all([
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
      collection: 'landingZones',
      params: {
        fields: [
          'id',
          'name',
          'slug',
          'planet.id',
          'planet.name',
          'planet.astronomicalDesignation',
          'planet.slug',
          'planet.starSystem.id',
          'planet.starSystem.name',
          'planet.starSystem.slug',
        ],
        filter: {
          status: { _eq: 'published' },
        },
        limit: -1,
        sort: [
          'planet.starSystem.name',
          'planet.astronomicalDesignationNumber',
          'moon.planet.astronomicalDesignationNumber',
          'moon.astronomicalDesignationLetter',
          'name',
        ],
      },
    }),
  ]);

  if (!departments || !landingZones) {
    return null;
  }

  return {
    departments: departments.map((data) => transformDepartment(data)),
    landingZones: landingZones.map((data) => transformLandingZone(data)),
  };
});

if (!data.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Es gab in Fehler beim abfragen deiner Personalakte!',
    fatal: true,
  });
}

const titleOptions = ['', 'Dr.', 'Dr. Med.', 'Prof. Med.', 'Dipl. Ing.'];

const formgroupUi = {
  strategy: 'override',
  container: 'relative mt-1 w-full max-w-[303px]',
  wrapper: 'flex justify-between h-fit w-full xl:w-1/2',
  label: { wrapper: 'flex content-center items-center justify-between mr-4' },
};

const checkboxRecruitment = ref(user.value?.roles?.includes('Rekrutierung'));
const checkboxMarketing = ref(user.value?.roles?.includes('Marketing & Presse'));
const checkboxCW = ref(user.value?.roles?.includes('Inhaltsersteller'));

const birthdateDay = ref(user.value?.birthdate ? user.value?.birthdate.split('-')[2] : '');
const birthdateMonth = ref(user.value?.birthdate ? user.value?.birthdate.split('-')[1] : '');
const birthdateYear = ref(user.value?.birthdate ? user.value?.birthdate.split('-')[0] : '');

const formData = reactive({
  firstname: user.value?.firstname || '',
  lastname: user.value?.lastname || '',
  title: user.value?.title || null,
  contactEmail: user.value?.contactEmail || '',
  rsiHandle: user.value?.rsiHandle || '',
  discordName: user.value?.discordName || '',
  password: '',
  roles:
    computed(() => {
      const roles = [];
      if (checkboxRecruitment.value) roles.push('recruitment');
      if (checkboxMarketing.value) roles.push('marketing');
      if (checkboxCW.value) roles.push('contentWriter');

      return roles;
    }) || [],
  head_of_department: user.value?.headOfDepartment || false,
  department: null,
  // department: data.value?.departments.find((e) => e.id === user.value?.department.id) || null,
  currentplace: user.value?.currentplace || null,
  sex: user.value?.sex || '',
  birthdate: computed(() =>
    birthdateDay.value && birthdateMonth.value && birthdateYear.value
      ? `${birthdateYear.value}-${birthdateMonth.value}-${birthdateDay.value}`
      : null,
  ),
  birthplace: user.value?.birthplace || null,
  haircolor: user.value?.haircolor || '',
  eyecolor: user.value?.eyecolor || '',
  weight: user.value?.weight || null,
  height: user.value?.height || null,
  citizen: user.value?.ueeState === 'citizen' || false,
  citizenReason: citizenReasonOptions.find((e) => e.value === user.value?.citizenReasonValue)?.value ?? '',
  dutyState: user.value?.citizenReasonValue === 'military' ? true : user.value?.dutyState || false,
  educationState: user.value?.citizenReasonValue === 'education' ? true : user.value?.educationState || false,
  dutyPeriod: user.value?.duty.period || '',
  dutyEnd: user.value?.duty.end || '',
  dutyDivision:
    [
      { name: 'UEE Army', value: 'army' },
      { name: 'UEE Marine', value: 'marines' },
      { name: 'UEE Navy', value: 'navy' },
    ].find((e) => e.value === user.value?.duty.divisionValue) || null,
  educationName: user.value?.education.name || '',
  educationPeriod: user.value?.education.period || '',
  educationPlace: user.value?.education.place || null,
  hobbies: user.value?.hobbies || '',
  activities: user.value?.activities || '',
  talents: user.value?.talents || '',
  habits: user.value?.habits || '',
  tics: user.value?.tics || '',
  fears: user.value?.fears || '',
  character: user.value?.character || '',
  mysterious: user.value?.mysterious || '',
  music: user.value?.music || '',
  movies: user.value?.movies || '',
  books: user.value?.books || '',
  clothing: user.value?.clothing || '',
  food: user.value?.food || '',
  drinks: user.value?.drink || '',
  alcohol: user.value?.alcohol || '',
  colors: user.value?.colors || '',
  loves: user.value?.loves || '',
  hates: user.value?.hates || '',
  medicalinfo: user.value?.medicalinfo || '',
  biography: user.value?.biography || '',
});

let initialFormdata = reactive({ ...formData }); // copy of initial formdata

watch(
  formData,
  () => {
    if (formData.citizen === false) {
      formData.citizenReason = '';
    }

    if (formData.citizenReason === 'Militärischer Dienst') {
      formData.dutyState = true;
    } else if (formData.citizenReason === 'Besondere Bildung') {
      formData.educationState = true;
    }

    if (formData.title === '') {
      formData.title = null;
    }

    if (formData.department === '') {
      formData.department = null;
    }

    if (formData.currentplace === '') {
      formData.currentplace = null;
    }

    if (formData.birthplace === '') {
      formData.birthplace = null;
    }

    if (formData.dutyDivision === '') {
      formData.dutyDivision = null;
    }

    if (formData.weight === '') {
      formData.weight = null;
    }

    if (formData.height === '') {
      formData.height = null;
    }

    dataChanged.value = !isEqual(formData, initialFormdata);
  },
  { deep: true },
);

const schema = object({
  firstname: string().required('Jedes Mitglied braucht einen Vornamen.'),
  lastname: string().nullable(),
  title: string().nullable(),
  contactEmail: string().email().nullable(),
  discordName: string().nullable(),
  rsiHandle: string().nullable(),
  password: string().nullable(),
  roles: array().nullable(),
  head_of_department: boolean().required(
    'Du musst angeben ob du ein Abteilungsleiter bist. \b Solltest du kein Verwaltungsmitglied sein, rede bitte mit dem Website-Team (@Thomas_Blakeney oder @Decon_Vorn)',
  ),
  department: object().nullable(),
  currentplace: object().nullable(),
  sex: string().required('Du musst für die richtige Funktion des A.M.S. wenigstens ein Geschlecht auswählen.'),
  birthdate: string()
    .matches(
      /^(285\d{1}|29\d{2})\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/,
      'Dein Geburtsdatum stimmt nicht mit dem Format überein. Bitte denke daran dass dein Geburtsjahr der Lore entsprechen muss. (z.B. 2922) Also kannst du nicht mehrere Hundert Jahre alt sein. (z.B. 1980)',
    )
    .nullable(),
  birthplace: object().nullable(),
  haircolor: string().nullable(),
  eyecolor: string().nullable(),
  weight: number()
    .positive('Dein Gewicht kann keine negative Zahl sein.')
    .min(50, 'Dein Gewicht kann nicht unter 50kg sein.')
    .max(200, 'Dein Gewicht kann nicht über 200kg sein.')
    .typeError('Dein Gewicht darf nur aus Zahlen bestehen.')
    .nullable(),
  height: number()
    .positive('Deine Größe kann keine negative Zahl sein.')
    .min(150, 'Deine Größe kann nicht unter 100cm sein.')
    .max(250, 'Deine Größe kann nicht über 250cm sein.')
    .typeError('Deine Größe darf nur aus Zahlen bestehen.')
    .nullable(),
  citizen: boolean().required('Du musst angeben ob du einen Bürgerstatus hast.'),
  citizenReason: string().when('citizen', {
    is: true,
    then: (schema) => schema.required('Du musst einen Grund für deinen Bürgerstatus angeben.'),
    otherwise: (schema) => schema.nullable(),
  }),
  dutyState: boolean().required('Du musst angeben ob du im Militär gedient hast.'),
  educationState: boolean().required('Du musst angeben ob du eine besondere Bildung genossen hast.'),
  dutyPeriod: string().when('dutyState', {
    is: true,
    then: (schema) =>
      schema
        .required('Du musst angeben in welchem Zeitraum du gedient hast.')
        .matches(
          /^(0?[1-9]|1[0-2])\/\d{4} - (0?[1-9]|1[0-2])\/\d{4}$/,
          'Der Zeitraum stimmt nicht mit dem Format überein.',
        ),
    otherwise: (schema) => schema.nullable(),
  }),
  dutyEnd: string().when('dutyState', {
    is: true,
    then: (schema) => schema.required('Du musst angeben wie dein Dienst beendet wurde.'),
    otherwise: (schema) => schema.nullable(),
  }),
  dutyDivision: object().when('dutyState', {
    is: true,
    then: (schema) => schema.required('Du musst angeben in welcher Division du gedient hast.'),
    otherwise: (schema) => schema.nullable(),
  }),
  educationName: string().when('educationState', {
    is: true,
    then: (schema) => schema.required('Du musst angeben welche Bildung du genossen hast.'),
    otherwise: (schema) => schema.nullable(),
  }),
  educationPeriod: string().when('educationState', {
    is: true,
    then: (schema) =>
      schema
        .required('Du musst angeben in welchem Zeitraum du deine Bildung genossen hast.')
        .matches(
          /^(0?[1-9]|1[0-2])\/\d{4} - (0?[1-9]|1[0-2])\/\d{4}$/,
          'Der Zeitraum stimmt nicht mit dem Format überein.',
        ),
    otherwise: (schema) => schema.nullable(),
  }),
  educationPlace: object().when('educationState', {
    is: true,
    then: (schema) => schema.required('Du musst angeben wo du deine Bildung genossen hast.'),
    otherwise: (schema) => schema.nullable(),
  }),
  hobbies: string().nullable(),
  activities: string().nullable(),
  talents: string().nullable(),
  habits: string().nullable(),
  tics: string().nullable(),
  fears: string().nullable(),
  character: string().nullable(),
  mysterious: string().nullable(),
  music: string().nullable(),
  movies: string().nullable(),
  books: string().nullable(),
  clothing: string().nullable(),
  food: string().nullable(),
  drinks: string().nullable(),
  alcohol: string().nullable(),
  colors: string().nullable(),
  loves: string().nullable(),
  hates: string().nullable(),
  medicalinfo: string().nullable(),
  biography: string().nullable(),
});

type Schema = InferType<typeof schema>;

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (
    formData.firstname !== user.value?.firstname ||
    formData.lastname !== user.value?.lastname ||
    formData?.password
  ) {
    submitWarning(event);
  } else {
    try {
      await handleEdits(event);
    } catch (e) {
      // console.log(e);
    }
  }
};

const handleEdits = async (event: FormSubmitEvent<Schema>) => {
  form.value.clear();
  try {
    modalStore.closeModal();
    await schema.validate(formData);
    const updatedData = {
      first_name: formData.firstname,
      last_name: formData.lastname,
      title: formData.title,
      contactEmail: formData.contactEmail,
      rsiHandle: formData.rsiHandle,
      discordName: formData.discordName,
      roles: formData.roles,
      head_of_department: formData.head_of_department,
      // department: formData.department?.id ?? null,
      currentResidence: formData.currentplace?.id ?? null,
      sex: formData.sex,
      birthdate: formData.birthdate,
      birthplace: formData.birthplace?.id ?? null,
      haircolor: formData.haircolor,
      eyecolor: formData.eyecolor,
      weight: formData.weight,
      height: formData.height,
      citizen: formData.citizen,
      citizenReason: citizenReasonOptions.find((e) => e.value === user.value?.citizenReasonValue)?.value ?? '',
      dutyState: formData.dutyState,
      dutyPeriod: formData.dutyPeriod,
      dutyEnd: formData.dutyEnd,
      dutyDivision: formData.dutyDivision?.value ? formData.dutyDivision?.value : null,
      educationState: formData.educationState,
      educationName: formData.educationName,
      educationPeriod: formData.educationPeriod,
      // TODO: ADD EDUCATION PLACE
      // educationPlace: formData.educationPlace,
      hobbies: formData.hobbies,
      activities: formData.activities,
      talents: formData.talents,
      habits: formData.habits,
      tics: formData.tics,
      fears: formData.fears,
      characterTrait: formData.character,
      mysteriousThings: formData.mysterious,
      music: formData.music,
      movies: formData.movies,
      books: formData.books,
      clothing: formData.clothing,
      food: formData.food,
      drink: formData.drinks,
      alcohol: formData.alcohol,
      colors: formData.colors,
      loves: formData.loves,
      hates: formData.hates,
      medicalInformations: formData.medicalinfo,
      biography: formData.biography,
    };
    if (formData.firstname !== user.value?.firstname || formData.lastname !== user.value?.lastname) {
      updatedData.slug = useSlugify(`${formData.firstname}${formData.lastname && ' ' + formData.lastname}`);
      updatedData.email = `${useSlugify(
        formData.firstname + (formData.lastname && '.' + formData.lastname),
        true,
      )}@ariscorp.de`;
    }
    if (formData.password) {
      updatedData.password = formData?.password;
    }
    console.log(updatedData);
    let fetchError = false;
    let fetchMessage = null;
    const { data: fetchData, error: fetchErrorRes } = await useFetch(
      `${config.public.backendUrl}/users/${user.value?.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiToken.value,
          // Authorization:
          // 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc3ZmI0NDJhLTgwYjItNDBiNy05ZTNjLWY5ZDE4MTkwYWM4NiIsInJvbGUiOiI3NjdiYjA5ZS1hNmZjLTRlYmItOGM1Zi0wOGIwNjBhYjBiZGIiLCJhcHBfYWNjZXNzIjp0cnVlLCJhZG1pbl9hY2Nlc3MiOnRydWUsImlhdCI6MTcwNDgyNDY5MiwiZXhwIjoxNzA0ODI1NTkyLCJpc3MiOiJkaXJlY3R1cyJ9.jJBsc0bAVpmWaheaDqRMCtERCjqtwfbG18H5yF07u04',
        },
        body: JSON.stringify(updatedData),
        onResponseError({ request, response, options }) {
          fetchError = true;
          fetchMessage = response?._data.errors[0].message;
        },
      },
    );
    if (fetchError) {
      throw new FetchError(fetchMessage || '', 'expired');
    }
    // await updateItem({
    //   collection: 'directus_users',
    //   id: user.value?.id,
    //   item: test,
    // });
    refresh();
    tryCount.value = 0;
  } catch (e) {
    if (e instanceof ValidationError) {
      console.error(
        'Validation error: Validierungsfehler! Bitte überprüfe nochmal ob du alles richtig eingegeben hast. (Unter den jeweiligen Feldern tauchen Fehlermeldungen auf.)',
      );
      await setTimeout(
        () =>
          form.value.setErrors([
            ...form.value.getErrors(),
            {
              path: 'customErrors',
              message:
                'Validierungsfehler! Bitte überprüfe nochmal ob du alles richtig eingegeben hast. (Unter den jeweiligen Feldern tauchen Fehlermeldungen auf.)',
            },
          ]),
        0,
      );
    } else if (e instanceof FetchError) {
      if (e?.type === 'expired') {
        if (tryCount.value === 0) {
          tryCount.value = 1;
          await refreshUser();
          refreshTokens();
          handleEdits(event);
        } else {
          console.error('Fetch error:', e.message);
          form.value.setErrors([
            ...form.value.getErrors(),
            {
              path: 'customErrors',
              message: 'Dein Session Token ist ausgelaufen. Leider kann auch der Token nicht aktualisiert werden.',
            },
          ]);
        }
      }
    }
  }
};

const submitWarning = (event: FormSubmitEvent<Schema>) => {
  modalStore.openModal('ACHTUNG!!!', { hideCloseButton: true, hideXButton: true, type: 'submitWarning' });
  modalStore.setData(event);
};

const onDataResetSubmit = () => {
  modalStore.closeModal();
  setFormData();
  // Object.keys(initialFormdata).forEach((key) => {
  //   formData[key] = initialFormdata[key];
  // });
};

const handleResetData = () => {
  modalStore.openModal('Änderungen verwerfen', { hideCloseButton: true, hideXButton: true, type: 'resetData' });
};

const setFormData = () => {
  formData.firstname = user.value?.firstname || '';
  formData.lastname = user.value?.lastname || '';
  formData.title = user.value?.title || null;
  formData.contactEmail = user.value?.contactEmail || '';
  formData.rsiHandle = user.value?.rsiHandle || '';
  formData.discordName = user.value?.discordName || '';
  formData.password = '';
  formData.roles =
    computed(() => {
      const roles = [];
      if (checkboxRecruitment.value) roles.push('recruitment');
      if (checkboxMarketing.value) roles.push('marketing');
      if (checkboxCW.value) roles.push('contentWriter');

      return roles;
    }) || [];
  formData.head_of_department = user.value?.headOfDepartment || false;
  formData.department = null;
  // department: data.value?.departments.find((e) => e.id === user.value?.department.id) || null;
  formData.currentplace = user.value?.currentplace || null;
  formData.sex = user.value?.sex || '';
  formData.birthdate = computed(() =>
    birthdateDay.value && birthdateMonth.value && birthdateYear.value
      ? `${birthdateYear.value}-${birthdateMonth.value}-${birthdateDay.value}`
      : null,
  );
  formData.birthplace = user.value?.birthplace || null;
  formData.haircolor = user.value?.haircolor || '';
  formData.eyecolor = user.value?.eyecolor || '';
  formData.weight = user.value?.weight || null;
  formData.height = user.value?.height || null;
  formData.citizen = user.value?.ueeState === 'citizen' || false;
  formData.citizenReason = citizenReasonOptions.find((e) => e.value === user.value?.citizenReasonValue)?.value ?? '';
  formData.dutyState = user.value?.citizenReasonValue === 'military' ? true : user.value?.dutyState || false;
  formData.educationState = user.value?.citizenReasonValue === 'education' ? true : user.value?.educationState || false;
  formData.dutyPeriod = user.value?.duty.period || '';
  formData.dutyEnd = user.value?.duty.end || '';
  formData.dutyDivision =
    [
      { name: 'UEE Army', value: 'army' },
      { name: 'UEE Marine', value: 'marines' },
      { name: 'UEE Navy', value: 'navy' },
    ].find((e) => e.value === user.value?.duty.divisionValue) || null;
  formData.educationName = user.value?.education.name || '';
  formData.educationPeriod = user.value?.education.period || '';
  formData.educationPlace = user.value?.education.place || null;
  formData.hobbies = user.value?.hobbies || '';
  formData.activities = user.value?.activities || '';
  formData.talents = user.value?.talents || '';
  formData.habits = user.value?.habits || '';
  formData.tics = user.value?.tics || '';
  formData.fears = user.value?.fears || '';
  formData.character = user.value?.character || '';
  formData.mysterious = user.value?.mysterious || '';
  formData.music = user.value?.music || '';
  formData.movies = user.value?.movies || '';
  formData.books = user.value?.books || '';
  formData.clothing = user.value?.clothing || '';
  formData.food = user.value?.food || '';
  formData.drinks = user.value?.drink || '';
  formData.alcohol = user.value?.alcohol || '';
  formData.colors = user.value?.colors || '';
  formData.loves = user.value?.loves || '';
  formData.hates = user.value?.hates || '';
  formData.medicalinfo = user.value?.medicalinfo || '';
  formData.biography = user.value?.biography || '';

  initialFormdata.firstname = user.value?.firstname || '';
  initialFormdata.lastname = user.value?.lastname || '';
  initialFormdata.title = user.value?.title || null;
  initialFormdata.contactEmail = user.value?.contactEmail || '';
  initialFormdata.rsiHandle = user.value?.rsiHandle || '';
  initialFormdata.discordName = user.value?.discordName || '';
  initialFormdata.password = '';
  initialFormdata.roles =
    computed(() => {
      const roles = [];
      if (checkboxRecruitment.value) roles.push('recruitment');
      if (checkboxMarketing.value) roles.push('marketing');
      if (checkboxCW.value) roles.push('contentWriter');

      return roles;
    }) || [];
  initialFormdata.head_of_department = user.value?.headOfDepartment || false;
  initialFormdata.department = null;
  // department: data.value?.departments.find((e) => e.id === user.value?.department.id) || null;
  initialFormdata.currentplace = user.value?.currentplace || null;
  initialFormdata.sex = user.value?.sex || '';
  initialFormdata.birthdate = computed(() =>
    birthdateDay.value && birthdateMonth.value && birthdateYear.value
      ? `${birthdateYear.value}-${birthdateMonth.value}-${birthdateDay.value}`
      : null,
  );
  initialFormdata.birthplace = user.value?.birthplace || null;
  initialFormdata.haircolor = user.value?.haircolor || '';
  initialFormdata.eyecolor = user.value?.eyecolor || '';
  initialFormdata.weight = user.value?.weight || null;
  initialFormdata.height = user.value?.height || null;
  initialFormdata.citizen = user.value?.ueeState === 'citizen' || false;
  initialFormdata.citizenReason = citizenReasonOptions.find((e) => e.value === user.value?.citizenReasonValue)?.value ?? '';
  initialFormdata.dutyState = user.value?.citizenReasonValue === 'military' ? true : user.value?.dutyState || false;
  initialFormdata.educationState =
    user.value?.citizenReasonValue === 'education' ? true : user.value?.educationState || false;
  initialFormdata.dutyPeriod = user.value?.duty.period || '';
  initialFormdata.dutyEnd = user.value?.duty.end || '';
  initialFormdata.dutyDivision =
    [
      { name: 'UEE Army', value: 'army' },
      { name: 'UEE Marine', value: 'marines' },
      { name: 'UEE Navy', value: 'navy' },
    ].find((e) => e.value === user.value?.duty.divisionValue) || null;
  initialFormdata.educationName = user.value?.education.name || '';
  initialFormdata.educationPeriod = user.value?.education.period || '';
  initialFormdata.educationPlace = user.value?.education.place || null;
  initialFormdata.hobbies = user.value?.hobbies || '';
  initialFormdata.activities = user.value?.activities || '';
  initialFormdata.talents = user.value?.talents || '';
  initialFormdata.habits = user.value?.habits || '';
  initialFormdata.tics = user.value?.tics || '';
  initialFormdata.fears = user.value?.fears || '';
  initialFormdata.character = user.value?.character || '';
  initialFormdata.mysterious = user.value?.mysterious || '';
  initialFormdata.music = user.value?.music || '';
  initialFormdata.movies = user.value?.movies || '';
  initialFormdata.books = user.value?.books || '';
  initialFormdata.clothing = user.value?.clothing || '';
  initialFormdata.food = user.value?.food || '';
  initialFormdata.drinks = user.value?.drink || '';
  initialFormdata.alcohol = user.value?.alcohol || '';
  initialFormdata.colors = user.value?.colors || '';
  initialFormdata.loves = user.value?.loves || '';
  initialFormdata.hates = user.value?.hates || '';
  initialFormdata.medicalinfo = user.value?.medicalinfo || '';
  initialFormdata.biography = user.value?.biography || '';
};

const refresh = async () => {
  await refreshUser();
  setFormData();
};

definePageMeta({
  layout: false,
  middleware: 'auth',
});
</script>

<template>
  <NuxtLayout name="ams">
    <template #modalContent>
      <template v-if="modalStore.type === 'resetData'">
        <h6>Bist du dir sicher dass du alle Änderungen verwerfen willst?</h6>
        <div class="flex flex-wrap justify-between w-full px-4 mt-4">
          <ButtonDefault @click="onDataResetSubmit" class="w-1/3" color="danger"> Ja </ButtonDefault>
          <ButtonDefault @click="modalStore.closeModal" class="w-1/3" color="success"> Nein </ButtonDefault>
        </div>
      </template>
      <template v-else-if="modalStore.type === 'submitWarning'">
        <h6>
          <span class="text-danger">ACHTUNG</span>: Du hast deinen Vornamen, Nachnamen oder dein Passwort geändert. dies
          führt dazu, dass sich deine Login-Daten verändern.
        </h6>
        <div class="flex flex-wrap justify-between w-full px-4 mt-4">
          <ButtonDefault @click="handleEdits(modalStore.data)" class="w-1/3" color="success"> Ja </ButtonDefault>
          <ButtonDefault @click="modalStore.closeModal" class="w-1/3" color="danger"> Nein </ButtonDefault>
        </div>
      </template>
      <span v-else>PLACEHOLDER</span>
    </template>
    <div class="relative flex items-center p-5 mb-5 rounded-lg bg-bsecondary">
      <!-- TODO: ADD LOADING STATE TO AVATAR -->
      <div
        class="flex mr-6 relative overflow-hidden border-[6px] border-primary rounded-full h-36 w-36 focus:outline-none group bg-white/5"
      >
        <NuxtImg :src="user?.potrait" class="z-10 object-cover w-full h-full" />
        <div class="absolute top-0 bottom-0 left-0 right-0 m-auto w-fit h-fit">
          <LoadingBasic class="w-10 h-10 text-white" />
        </div>
      </div>
      <div class="flex-1 overflow-hidden outline-none">
        <p class="p-0 text-base font-bold text-white whitespace-nowrap">
          {{ user?.fullName }}
        </p>
        <p class="flex items-center p-0 space-x-1 text-btertiary">
          <Icon name="heroicons:at-symbol-16-solid" class="relative inline-block w-[18px] h-[18px] my-auto" />
          <span class="my-auto">{{ user?.arisEmail }}</span>
        </p>
        <p class="flex items-center p-0 space-x-1 text-btertiary">
          <template v-if="user?.currentplace">
            <Icon name="heroicons:map-pin-16-solid" class="relative inline-block w-[18px] h-[18px] my-auto" />
            <span class="my-auto">
              <NuxtLink
                :to="'/VerseExkurs/starmap/' + user?.currentplace?.planet?.system?.slug"
                class="my-auto transition opacity-75 decoration-transparent hover:opacity-100"
              >
                {{ user?.currentplace?.planet?.system?.name }}
              </NuxtLink>
              /
              <NuxtLink
                :to="
                  '/VerseExkurs/starmap/' +
                  user?.currentplace?.planet?.system?.slug +
                  '/' +
                  user?.currentplace.planet?.slug
                "
                class="my-auto transition opacity-75 decoration-transparent hover:opacity-100"
              >
                {{ user?.currentplace.planet?.name }}
              </NuxtLink>
              /
              <NuxtLink
                :to="
                  '/VerseExkurs/starmap/' +
                  user?.currentplace?.planet?.system?.slug +
                  '/' +
                  user?.currentplace.planet?.slug +
                  '/' +
                  user?.currentplace?.slug
                "
                class="my-auto transition opacity-75 decoration-transparent hover:opacity-100"
              >
                {{ user?.currentplace?.name }}
              </NuxtLink>
            </span>
          </template>
        </p>
        <p class="text-[#444] items-center flex space-x-1 absolute bottom-4 p-0">
          <Icon name="ph:address-book-bold" class="relative inline-block w-[18px] h-[18px] my-auto" />
          <NuxtLink
            :to="user?.biographyAmsLink"
            class="my-auto transition opacity-75 decoration-transparent hover:opacity-100 text-primary"
          >
            Biografie
          </NuxtLink>
        </p>
      </div>
    </div>
    <div>
      <div class="flex px-6">
        <UForm class="w-full" ref="form" :state="formData" :schema="schema">
          <div class="flex w-full text-center">
            <UFormGroup class="mx-auto" name="customErrors" />
          </div>
          <TableHr> Basisinformationen </TableHr>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup required size="xl" label="Vorname" name="firstname" :ui="formgroupUi">
              <UInput v-model="formData.firstname" placeholder="Chris" icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p class="text-danger">Jedes Mitglied braucht einen Vornamen.</p>
                      <p class="italic text-danger bold">
                        WICHTIG: Das ändern deines Vor- und Nachnamen ändert auch deinen Login-Benutzername.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic">
                        Falls du dir schon Gedanken über einen richtigen Vornamen gemacht hast.
                        <span class="text-secondary">Decon</span>
                      </p>
                      <p class="italic">
                        Natürlich kannst du auch mehrere Vornamen haben.
                        <span class="text-secondary">Decon Malcom</span>
                      </p>
                      <p class="italic">
                        Falls du noch keinen Vornamen hast, <br class="md:hidden" />
                        kannst du einfach solange deinen Benutzernamen eingeben.
                        <span class="text-secondary">Blizii</span>
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Nachname" name="lastname" :ui="formgroupUi">
              <UInput v-model="formData.lastname" placeholder="Roberts" icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Wenn du ein Vorname hast, brauchst du natürlich auch einen Nachnamen.</p>
                      <p class="text-primary">
                        WICHTIG: Das ändern deines Vor- und Nachnamen ändert auch deinen Login-Benutzername.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic">
                        Ein passender Nachname wäre zum Beispiel:
                        <span class="text-secondary">Vorn</span>
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup required size="xl" label="Titel" name="title" :ui="formgroupUi">
              <div class="relative">
                <USelectMenu
                  v-model="formData.title"
                  :options="titleOptions"
                  :ui="
                    formData.title || initialFormdata.title
                      ? {
                          leading: {
                            padding: {
                              xl: 'ps-10',
                            },
                          },
                        }
                      : { leading: { padding: { xl: 'hidden' } } }
                  "
                >
                  <template v-if="formData.title || initialFormdata.title !== null" #leading />
                  <template #label>
                    <span v-if="formData.title">{{ formData.title }}</span>
                    <span v-else>Kein Titel ausgewählt</span>
                  </template>
                  <template #option="{ option }">
                    <span v-if="option">{{ option }}</span>
                    <span v-else>Kein Titel</span>
                  </template>
                </USelectMenu>
                <template v-if="formData.title || initialFormdata.title">
                  <button
                    v-if="(formData.title === initialFormdata.title) !== null"
                    @click="formData.title = null"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
                  </button>
                  <button
                    v-else
                    @click="formData.title = initialFormdata.title"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon
                      name="i-heroicons-arrow-uturn-left"
                      class="my-auto transition opacity-75 hover:opacity-100"
                    />
                  </button>
                </template>
              </div>
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>
                        Falls du eine besondere Hochschulausbildung hast, kannst du hier den passenden Titel auswählen.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic">
                        Falls du einen Doktortitel hast:
                        <span class="text-secondary">Dr.</span>
                        oder
                        <span class="text-secondary">Dr. Med.</span>
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Passwort" name="password" :ui="formgroupUi">
              <UInput
                autocomplete="new-password"
                v-model="formData.password"
                placeholder="******"
                type="password"
                icon="i-heroicons-lock-closed"
              />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du dein Passwort ganz einfach ändern.</p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <TableHr />
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Rollen" name="roles" :ui="formgroupUi">
              <ArisCheckbox
                :disabled="(user?.position.permissionLevel || 0) < 4"
                v-model="checkboxRecruitment"
                name="recruitment"
                label="Rekrutierung"
                color="primary"
              />
              <ArisCheckbox
                :disabled="(user?.position.permissionLevel || 0) < 4"
                v-model="checkboxMarketing"
                name="marketing"
                label="Marketing & Presse"
                color="primary"
              />
              <ArisCheckbox
                :disabled="(user?.position.permissionLevel || 0) < 4"
                v-model="checkboxCW"
                name="content_writer"
                label="Inhaltsersteller"
                color="primary"
              />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du deine Rollen sehen.</p>
                      <p>Du kannst mit der Verwaltung sprechen, falls du eine der Rollen annehmen möchtest.</p>
                      <p>Falls du in der Verwaltung bist, kannst du auch deine Rollen anpassen.</p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <div class="w-full xl:w-1/2">
              <UFormGroup
                size="xl"
                label="Abteilung"
                name="department"
                :ui="{
                  ...formgroupUi,
                  container: 'relative mt-1 w-full max-w-[303px]',
                  wrapper: 'flex justify-between h-fit w-full',
                  label: {
                    wrapper: 'flex flex-wrap content-center items-center justify-between w-full',
                  },
                }"
              >
                <div class="relative">
                  <USelectMenu
                    v-model="formData.department"
                    :options="['', ...data?.departments]"
                    option-attribute="name"
                    :ui="
                      formData.department || initialFormdata.department
                        ? {
                            leading: {
                              padding: {
                                xl: 'ps-10',
                              },
                            },
                          }
                        : { leading: { padding: { xl: 'hidden' } } }
                    "
                  >
                    <template v-if="formData.department || initialFormdata.department !== null" #leading />
                    <template #label>
                      <span v-if="formData.department">{{ formData.department.name }}</span>
                      <span class="text-[13.9px]" v-else>Keine Abteilung ausgewählt</span>
                    </template>
                    <template #option="{ option }">
                      <span v-if="option">{{ option.name }}</span>
                      <span v-else>Keine Abteilung</span>
                    </template>
                  </USelectMenu>
                  <template v-if="formData.department || initialFormdata.department !== null">
                    <button
                      v-if="formData.department === initialFormdata.department"
                      @click="formData.department = null"
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    >
                      <UIcon
                        name="i-heroicons-x-mark-16-solid"
                        class="my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                    <button
                      v-else
                      @click="formData.department = initialFormdata.department"
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    >
                      <UIcon
                        name="i-heroicons-arrow-uturn-left"
                        class="my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                  </template>
                </div>
                <template #label>
                  <div class="flex">
                    Abteilung
                    <UPopover mode="hover">
                      <UButton icon="i-heroicons-information-circle" class="" variant="inputInfo" />
                      <template #panel>
                        <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                          <p>Hier kannst du auswählen in welcher Abteilung der ArisCorp du tätig sein möchtest.</p>
                          <p>
                            Außerdem kannst du sehen ob du Abteilungsleiter bist. Dies kann ein Mitglied der Verwaltung
                            ändern.
                          </p>
                          <p>
                            Falls du Mitglied der Verwaltung bist, kannst du dir außerdem den Abteilungsleiter Status
                            entfernen.
                            <br />
                            Bitte tu dies niemals ohne Rücksprache mit der Verwaltung!
                          </p>
                        </div>
                      </template>
                    </UPopover>
                  </div>
                </template>
                <template #hint>
                  <ArisCheckbox
                    v-model="formData.head_of_department"
                    name="head_of_department"
                    label="Abteilungsleiter"
                    color="primary"
                    class="mr-4"
                    :disabled="(user?.position.permissionLevel || 0) < 4"
                  />
                </template>
              </UFormGroup>
              <UFormGroup
                size="xl"
                label="Avatar"
                name="avatar"
                :ui="{
                  ...formgroupUi,
                  container: 'relative mt-1 w-full max-w-[303px]',
                  wrapper: 'flex justify-between h-fit w-full',
                }"
              >
                <!-- TODO: ADD MODAL CONTENT -->
                <!-- TODO: ADD IMAGE CONVERSION LOGIC -->
                <UInput v-if="userSettings.ams.avatarConsent" type="file" icon="i-heroicons-user" />
                <ButtonDefault
                  v-else
                  type="button"
                  class="w-full"
                  @click="modalStore.openModal('PLACEHOLDER', { hideXButton: true })"
                >
                  Avatar ändern
                </ButtonDefault>
                <template #hint>
                  <UPopover mode="hover">
                    <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                    <template #panel>
                      <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                        <p>
                          Hier kannst du deinen Avatar anpassen. Weitere Instruktionen siehst du, wenn du auf den Button
                          drückst.
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UFormGroup>
            </div>
          </div>
          <TableHr />
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Kontakt Email" name="contactEmail" :ui="formgroupUi">
              <UInput
                v-model="formData.contactEmail"
                placeholder="kontakt.email@gmail.com"
                icon="i-heroicons-envelope"
              />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>
                        Für das A.M.S. Benachrichtigungssystem (coming-soon) <span class="bold">kannst</span> du eine
                        Kontakt Email angeben. <br />Du würdest dann per Mail Benachrichtigungen bekommen und die
                        Möglichkeit per Mail dein Passwort zurück zu setzen.
                      </p>
                      <p>Alternativ kannst du auch deinen Discord-Namen angeben.</p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Discord Name" name="discordName" :ui="formgroupUi">
              <UInput v-model="formData.discordName" placeholder="Chris_Roberts" icon="i-ic-baseline-discord" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>
                        Für das A.M.S. Benachrichtigungssystem (coming-soon) <span class="bold">kannst</span> du deinen
                        Discord Namen angeben. <br />Du würdest dann per PM Benachrichtigungen bekommen und die
                        Möglichkeit per PM dein Passwort zurück zu setzen.
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4 xl:pr-4">
            <UFormGroup size="xl" label="RSI Handle" name="rsiHandle" :ui="formgroupUi">
              <UInput v-model="formData.rsiHandle" placeholder="Chris_Roberts" icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du deinen RSI Handle angeben.</p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <TableHr> Steckbrief </TableHr>
          <div class="flex flex-wrap items-center justify-between xl:pr-4 xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Aktueller Wohnsitz" name="currentplace" :ui="formgroupUi">
              <div class="relative">
                <USelectMenu
                  v-model="formData.currentplace"
                  searchable
                  clear-search-on-close
                  searchable-placeholder="Suche..."
                  :search-attributes="['name', 'planet.name', 'planet.system.name']"
                  :options="['', ...data?.landingZones]"
                  :ui="
                    formData.currentplace || initialFormdata.currentplace
                      ? {
                          leading: {
                            padding: {
                              xl: 'ps-10',
                            },
                          },
                        }
                      : { leading: { padding: { xl: 'hidden' } } }
                  "
                >
                  <template v-if="formData.currentplace || initialFormdata.currentplace !== null" #leading />
                  <template #label>
                    <span class="truncate">
                      <template v-if="!formData.currentplace">
                        <span>Kein Ort ausgewählt</span>
                      </template>
                      <template v-else>
                        <span>
                          <span>
                            {{ formData.currentplace.planet?.system?.name }}
                          </span>
                          /
                          <span>
                            {{ formData.currentplace.planet?.name }}
                          </span>
                          /
                          <span>
                            {{ formData.currentplace.name }}
                          </span>
                        </span>
                      </template>
                    </span>
                  </template>
                  <template #option="{ option: landingZone }">
                    <span class="truncate">
                      <template v-if="!landingZone">
                        <span>Kein Ort</span>
                      </template>
                      <template v-else>
                        <span>
                          {{ landingZone.planet?.system?.name }}
                        </span>
                        /
                        <span>
                          {{ landingZone.planet?.name }}
                        </span>
                        /
                        <span>
                          {{ landingZone.name }}
                        </span>
                      </template>
                    </span>
                  </template>
                </USelectMenu>
                <template v-if="formData.currentplace || initialFormdata.currentplace !== null">
                  <button
                    v-if="formData.currentplace === initialFormdata.currentplace"
                    @click="formData.currentplace = null"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
                  </button>
                  <button
                    v-else
                    @click="formData.currentplace = initialFormdata.currentplace"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon
                      name="i-heroicons-arrow-uturn-left"
                      class="my-auto transition opacity-75 hover:opacity-100"
                    />
                  </button>
                </template>
              </div>
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du deinen Aktuellen Wohnsitz auswählen.</p>
                      <p>Du kannst sowohl nach System, Planet (o. Mond) oder Landezone suchen.</p>
                      <p>
                        Falls du die Anzeige nicht verstehst hier eine Erläuterung:
                        <br />
                        <span
                          ><span class="text-secondary">System</span> /
                          <span class="text-secondary">Planet o. Mond</span> /
                          <span class="text-secondary">Landezone</span></span
                        >
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <h4 class="mt-2 mb-1">Grundlegende Informationen:</h4>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Geschlecht" name="sex" :ui="formgroupUi" class="">
              <div class="flex gap-x-4">
                <ArisRadioGroup
                  v-model="formData.sex"
                  :options="[
                    { value: 'male', label: 'Männlich', color: 'primary' },
                    { value: 'female', label: 'Weiblich', color: 'primary' },
                  ]"
                />
              </div>
              <!-- <div v-for="method in methods" :key="method.value" class="relative">
                <URadio
                  v-bind="method"
                  v-model="selected"
                  :ui="{
                    strategy: 'override',
                    base: 'relative w-4 h-4 checked:bg-bsecondary transition border-2 rounded appearance-none cursor-pointer border-0',
                    background: 'bg-bprimary',
                    border: 'border border-bsecondary',
                    ring: 'focus-within:ring-1 focus-within:ring-primary-400',
                    form: '',
                  }"
                />
                <div class="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none left-2 top-1/2 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="3"
                    stroke="currentColor"
                    class="h-3.5 w-3.5"
                  >
                    <path
                      tag="path"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      :stroke-dasharray="[selected == method.value ? '1px 1px' : '0px 1px']"
                      :class="{ 'opacity-0': selected != method.value }"
                      class="transition-all duration-300"
                      pathLength="1"
                      :animate="draw(1)"
                      :transition="{ duration: 0.6, delay: 2.4 }"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              </div> -->
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du dein (also deines Charakter) Geschlecht auswählen.</p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="lg" label="Geburtsdatum" name="birthdate" :ui="formgroupUi">
              <div class="relative flex pb-4 gap-x-4">
                <USelectMenu
                  class="w-1/3"
                  placeholder="Tag"
                  v-model="birthdateDay"
                  :options="Array.from({ length: 31 }, (_, index) => (index + 1).toString().padStart(2, '0'))"
                />
                <USelectMenu
                  class="w-1/3"
                  placeholder="Monat"
                  v-model="birthdateMonth"
                  :options="[
                    { name: 'Januar', value: '01' },
                    { name: 'Februar', value: '02' },
                    { name: 'März', value: '03' },
                    { name: 'April', value: '04' },
                    { name: 'Mai', value: '05' },
                    { name: 'Juni', value: '06' },
                    { name: 'Juli', value: '07' },
                    { name: 'August', value: '08' },
                    { name: 'September', value: '09' },
                    { name: 'Oktober', value: '10' },
                    { name: 'November', value: '11' },
                    { name: 'Dezember', value: '12' },
                  ]"
                  option-attribute="name"
                  value-attribute="value"
                />
                <UInput
                  v-model="birthdateYear"
                  class="w-1/3"
                  placeholder="Jahr"
                  type="text"
                  inputmode="numeric"
                  :ui="{ placeholder: 'text-center' }"
                />
                <div class="absolute bottom-0 right-0 text-xs italic text-light-gray w-fit">
                  <span>Alter: {{ $dayjs().add(930, 'years').diff(formData.birthdate, 'year') }} Jahre</span>
                </div>
              </div>
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du dein Geburtsdatum eingeben.</p>
                      <p>
                        Allerdings kannst du auch den Modus umstellen und einfach für das Jahr dein aktuelles Alter
                        angeben.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic">
                        <span class="text-secondary"
                          >04 12 2930 ({{ $dayjs().add(930, 'year').diff('2930-12-04', 'year') }} Jahre)</span
                        >
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:pr-4 xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Geburtsort" name="birthplace" :ui="formgroupUi">
              <div class="relative">
                <USelectMenu
                  searchable
                  clear-search-on-close
                  searchable-placeholder="Suche..."
                  :search-attributes="['name', 'planet.name', 'planet.system.name']"
                  v-model="formData.birthplace"
                  :options="['', ...data?.landingZones]"
                  :ui="
                    formData.birthplace || initialFormdata.birthplace
                      ? {
                          leading: {
                            padding: {
                              xl: 'ps-10',
                            },
                          },
                        }
                      : { leading: { padding: { xl: 'hidden' } } }
                  "
                >
                  <template v-if="formData.birthplace || initialFormdata.birthplace !== null" #leading />
                  <template #label>
                    <span class="truncate">
                      <template v-if="!formData.birthplace">
                        <span>Kein Ort ausgewählt</span>
                      </template>
                      <template v-else>
                        <span>
                          <span>
                            {{ formData.birthplace.planet?.system?.name }}
                          </span>
                          /
                          <span>
                            {{ formData.birthplace.planet?.name }}
                          </span>
                          /
                          <span>
                            {{ formData.birthplace.name }}
                          </span>
                        </span>
                      </template>
                    </span>
                  </template>
                  <template #option="{ option: landingZone }">
                    <span class="truncate">
                      <template v-if="!landingZone">
                        <span>Kein Ort</span>
                      </template>
                      <template v-else>
                        <span>
                          {{ landingZone.planet?.system?.name }}
                        </span>
                        /
                        <span>
                          {{ landingZone.planet?.name }}
                        </span>
                        /
                        <span>
                          {{ landingZone.name }}
                        </span>
                      </template>
                    </span>
                  </template>
                </USelectMenu>
                <template v-if="formData.birthplace || initialFormdata.birthplace !== null">
                  <button
                    v-if="formData.birthplace === initialFormdata.birthplace"
                    @click="formData.birthplace = null"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
                  </button>
                  <button
                    v-else
                    @click="formData.birthplace = initialFormdata.birthplace"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  >
                    <UIcon
                      name="i-heroicons-arrow-uturn-left"
                      class="my-auto transition opacity-75 hover:opacity-100"
                    />
                  </button>
                </template>
              </div>
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du dein Geburtsort auswählen.</p>
                      <p>Du kannst sowohl nach System, Planet (o. Mond) oder Landezone suchen.</p>
                      <p>
                        Falls du die Anzeige nicht verstehst hier eine Erläuterung:
                        <br />
                        <span
                          ><span class="text-secondary">System</span> /
                          <span class="text-secondary">Planet o. Mond</span> /
                          <span class="text-secondary">Landezone</span></span
                        >
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Haarfarbe" name="haircolor" :ui="formgroupUi">
              <UInput v-model="formData.haircolor" placeholder="Schwarz" icon="i-ic-round-color-lens" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du ganz einfach deine Haarfarbe eingeben.</p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic">
                        <span class="text-secondary">Schwarz</span>
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Augenfarbe" name="eyecolor" :ui="formgroupUi">
              <UInput v-model="formData.eyecolor" placeholder="Blau/Grün" icon="i-ic-round-color-lens" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du ganz einfach deine Augenfarbe eingeben.</p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic">
                        <span class="text-secondary">Blau/Grün</span>
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Gewicht" name="weight" :ui="formgroupUi">
              <UInput v-model="formData.weight" placeholder="85" icon="i-mdi-scale-balance">
                <template #trailing>
                  <span class="text-xs text-gray-400">KG</span>
                </template>
              </UInput>
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du dein Gewicht (in der Einheit Kilo) eingeben.</p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Größe" name="height" :ui="formgroupUi">
              <UInput v-model="formData.height" placeholder="192" icon="i-mdi-ruler">
                <template #trailing>
                  <span class="text-xs text-gray-400">CM</span>
                </template>
              </UInput>
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du deine Größe (in der Einheit CM) eingeben.</p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic">
                        <span class="text-secondary">182</span>
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <h5 class="mt-2 mb-1">Bürgerstatus:</h5>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4 xl:pr-4">
            <UFormGroup size="xl" label="UEE Status" name="UEEState" :ui="formgroupUi">
              <ArisRadioGroup
                v-model="formData.citizen"
                :options="[
                  {
                    value: true,
                    label: 'Bürger',
                    color: 'primary',
                  },
                  {
                    value: false,
                    label: 'Zivilist',
                    color: 'secondary',
                  },
                ]"
              />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier geht es darum wie dein UEE-Status ist.</p>
                      <p>Du kannst entweder Bürger oder Zivilist sein.</p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          {{ formData.citizenReason }}
          <Transition
            enter-active-class="transition-all duration-300 overflow-clip"
            leave-active-class="transition-all duration-300 overflow-clip"
            enter-from-class="h-0"
            enter-to-class="h-16"
            leave-from-class="h-16"
            leave-to-class="h-0"
          >
            <div v-if="formData.citizen" class="xl:pr-4">
              <UFormGroup size="xl" label="Wie wurdest du Bürger?" name="citizenReason" :ui="formgroupUi">
                <ArisRadioGroup v-model="formData.citizenReason" :options="citizenReasonOptions" />
                <template #hint>
                  <UPopover mode="hover">
                    <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                    <template #panel>
                      <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                        <p>Jeder wird aus einem bestimmten Grund ein UEE-Bürger.</p>
                        <p>Welcher Grund trifft bei dir zu?</p>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UFormGroup>
            </div>
          </Transition>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4 xl:pr-4">
            <UFormGroup size="xl" label="Was trifft auf sie zu?" name="states" :ui="formgroupUi">
              <ArisCheckbox
                v-model="formData.dutyState"
                :disabled="formData.citizenReason === 'Militärischer Dienst'"
                name="military"
                label="Ich habe im Militär gedient."
                color="primary"
              />
              <ArisCheckbox
                v-model="formData.educationState"
                :disabled="formData.citizenReason === 'Besondere Bildung'"
                name="education"
                label="Ich besitze eine Hochschulausbildung."
                color="primary"
              />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>
                        Hier kannst du auswählen ob du im Militär gedient hast oder/und eine Hochschulausbildung hast.
                      </p>
                      <p>
                        <span class="text-primary">Information</span>: Es könnte eine Option gesperrt sein, da du ihn
                        als Grund deines Bürgerstatus angegeben hast.
                      </p>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <Transition
            enter-active-class="transition-all duration-300 overflow-clip"
            leave-active-class="transition-all duration-300 overflow-clip"
            enter-from-class="h-0"
            enter-to-class="h-[140px] xl:h-[96px]"
            leave-from-class="h-[140px] xl:h-[96px]"
            leave-to-class="h-0"
          >
            <div v-if="formData.dutyState">
              <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
                <UFormGroup
                  :required="formData.dutyState"
                  size="xl"
                  label="Dienstzeit"
                  name="dutyPeriod"
                  :ui="formgroupUi"
                >
                  <UInput v-model="formData.dutyPeriod" placeholder="01/2940 - 12/2950" icon="i-heroicons-user" />
                  <template #hint>
                    <UPopover mode="hover">
                      <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                      <template #panel>
                        <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                          <p>Hier geht es um den Zeitraum, in dem du gedient hast.</p>
                          <br />
                          <p class="pb-0 font-bold text-white">Beispiele:</p>
                          <p class="italic">
                            <span class="text-secondary">01/2940 - 12/2950</span>
                          </p>
                        </div>
                      </template>
                    </UPopover>
                  </template>
                </UFormGroup>
                <UFormGroup
                  :required="formData.dutyState"
                  size="xl"
                  label="Dienstende"
                  name="dutyEnd"
                  :ui="formgroupUi"
                >
                  <ArisRadioGroup
                    v-model="formData.dutyEnd"
                    :options="[
                      {
                        value: 'honorable',
                        label: 'Ehrenhaft beendet',
                        color: 'primary',
                      },
                      {
                        value: 'dishonorable',
                        label: 'Unehrenhaft beendet',
                        color: 'danger',
                      },
                    ]"
                  />
                  <template #hint>
                    <UPopover mode="hover">
                      <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                      <template #panel>
                        <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                          <p>Hier geht es darum, wie du dein Dienst quittiert hast.</p>
                        </div>
                      </template>
                    </UPopover>
                  </template>
                </UFormGroup>
              </div>
              <div class="flex flex-wrap items-center justify-between xl:pr-4 xl:flex-nowrap gap-x-4">
                <UFormGroup
                  :required="formData.dutyState"
                  size="xl"
                  label="Division"
                  name="dutyDivision"
                  :ui="formgroupUi"
                >
                  <div class="relative">
                    <USelectMenu
                      v-model="formData.dutyDivision"
                      :options="[
                        '',
                        { name: 'UEE Army', value: 'army' },
                        { name: 'UEE Marine', value: 'marines' },
                        { name: 'UEE Navy', value: 'navy' },
                      ]"
                      :ui="
                        formData.dutyDivision || initialFormdata.dutyDivision
                          ? {
                              leading: {
                                padding: {
                                  xl: 'ps-10',
                                },
                              },
                            }
                          : { leading: { padding: { xl: 'hidden' } } }
                      "
                    >
                      <template v-if="formData.dutyDivision || initialFormdata.dutyDivision !== null" #leading />
                      <template #label>
                        <span v-if="formData.dutyDivision">{{ formData.dutyDivision?.name }}</span>
                        <span v-else>Keine Division ausgewählt</span>
                      </template>
                      <template #option="{ option }">
                        <span v-if="option.name">{{ option.name }}</span>
                        <span v-else>Keine Division</span>
                      </template>
                    </USelectMenu>
                    <template v-if="formData.dutyDivision || initialFormdata.dutyDivision !== null">
                      <button
                        v-if="formData.dutyDivision === initialFormdata.dutyDivision"
                        @click="formData.dutyDivision = ''"
                        class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      >
                        <UIcon
                          name="i-heroicons-x-mark-16-solid"
                          class="my-auto transition opacity-75 hover:opacity-100"
                        />
                      </button>
                      <button
                        v-else
                        @click="formData.dutyDivision = initialFormdata.dutyDivision"
                        class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      >
                        <UIcon
                          name="i-heroicons-arrow-uturn-left"
                          class="my-auto transition opacity-75 hover:opacity-100"
                        />
                      </button>
                    </template>
                  </div>
                  <template #hint>
                    <UPopover mode="hover">
                      <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                      <template #panel>
                        <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                          <p>
                            Falls du eine besondere Hochschulausbildung hast, kannst du hier den passenden Titel
                            auswählen.
                          </p>
                          <br />
                          <p class="pb-0 font-bold text-white">Beispiele:</p>
                          <p class="italic">
                            Falls du einen Doktortitel hast:
                            <span class="text-secondary">Dr.</span>
                            oder
                            <span class="text-secondary">Dr. Med.</span>
                          </p>
                        </div>
                      </template>
                    </UPopover>
                  </template>
                </UFormGroup>
              </div>
            </div>
          </Transition>
          <Transition
            enter-active-class="transition-all duration-300 overflow-clip"
            leave-active-class="transition-all duration-300 overflow-clip"
            enter-from-class="h-0"
            enter-to-class="h-[124px] xl:h-[76px]"
            leave-from-class="h-[124px] xl:h-[76px]"
            leave-to-class="h-0"
          >
            <div v-if="formData.educationState">
              <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
                <UFormGroup size="xl" label="Ausbildung" name="educationName" :ui="formgroupUi">
                  <UInput v-model="formData.educationName" placeholder="Medizinstudium" icon="i-heroicons-user" />
                  <template #hint>
                    <UPopover mode="hover">
                      <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                      <template #panel>
                        <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                          <p>Hier kannst du deine Hochschulausbildung eingeben.</p>
                          <br />
                          <p class="pb-0 font-bold text-white">Beispiele:</p>
                          <p class="italic">
                            <span class="text-secondary">Medizinstudium</span>
                          </p>
                        </div>
                      </template>
                    </UPopover>
                  </template>
                </UFormGroup>
                <UFormGroup size="xl" label="Ausbildungszeit" name="educationPeriod" :ui="formgroupUi">
                  <UInput v-model="formData.educationPeriod" placeholder="09/2945 - 06/2948" icon="i-heroicons-user" />
                  <template #hint>
                    <UPopover mode="hover">
                      <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                      <template #panel>
                        <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                          <p>Hier kannst du den Zeitraum deiner Hochschulausbildung eingeben.</p>
                          <br />
                          <p class="pb-0 font-bold text-white">Beispiele:</p>
                          <p class="italic">
                            <span class="text-secondary">09/2945 - 06/2948</span>
                          </p>
                        </div>
                      </template>
                    </UPopover>
                  </template>
                </UFormGroup>
              </div>
              <UFormGroup
                v-model="formData.educationPlace"
                name="educationPlace"
                size="xl"
                label="Ort"
                :ui="formgroupUi"
              >
                <!-- TODO: HOCHSCHULEN ALS AUSWAHL -->
                <span class="text-danger">SOON</span>
              </UFormGroup>
            </div>
          </Transition>
          <h4 class="mt-2 mb-1">Detaillierte Informationen:</h4>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Hobbies" name="hobbies" :ui="formgroupUi">
              <UInput v-model="formData.hobbies" placeholder="Sport, Fliegen, Schrauben, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du deine Hobbies eingeben.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Sport, Fliegen, Schrauben</span>:</p>
                      <ul class="ml-2">
                        <li>Sport</li>
                        <li>Fligen</li>
                        <li>Schrauben</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Freizeitgestaltung" name="activities" :ui="formgroupUi">
              <UInput v-model="formData.activities" placeholder="Fischen, Kochen, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du eingeben was du in deiner Frezeit machst.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Fischen, Kochen</span>:</p>
                      <ul class="ml-2">
                        <li>Fischen</li>
                        <li>Kochen</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Talente" name="talents" :ui="formgroupUi">
              <UInput
                v-model="formData.talents"
                placeholder="Spricht Sprache X, Handwerklich begabt, ..."
                icon="i-heroicons-user"
              />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du deine Talente eingeben.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Spricht Sprache X, Handwerklich begabt</span>:</p>
                      <ul class="ml-2">
                        <li>Spricht Sprache X</li>
                        <li>Handwerklich begabt</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Angewohnheiten" name="habits" :ui="formgroupUi">
              <UInput
                v-model="formData.habits"
                placeholder="Überspielt Unsicherheit mit Humor, ..."
                icon="i-heroicons-user"
              />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du deine typischen Angewohnheiten eingeben.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Überspielt Unsicherheit mit Humor</span>:</p>
                      <ul class="ml-2">
                        <li>Überspielt Unsicherheit mit Humor</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Tics & Marotten" name="tics" :ui="formgroupUi">
              <UInput v-model="formData.tics" placeholder="Hat fragwürdigen Humor, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du deine Tics & Marotten eingeben.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Hat fragwürdigen Humor</span>:</p>
                      <ul class="ml-2">
                        <li>Hat fragwürdigen Humor</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Ängste" name="fears" :ui="formgroupUi">
              <UInput v-model="formData.fears" placeholder="Hat Angst im Dunkeln, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du deine Ängste eingeben.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Hat Angst im Dunkeln</span>:</p>
                      <ul class="ml-2">
                        <li>Hat Angst im Dunkeln</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Hervorstechender Charakterzug" name="character" :ui="formgroupUi">
              <UInput v-model="formData.character" placeholder="Ist sehr loyal, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du deinen hervorstechenden Charakterzug eingeben.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Ist sehr loyal</span>:</p>
                      <ul class="ml-2">
                        <li>Ist sehr loyal</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Rästelhafte Züge" name="mysterious" :ui="formgroupUi">
              <UInput
                v-model="formData.mysterious"
                placeholder="Spricht ungern über Ereignis X, ..."
                icon="i-heroicons-user"
              />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>
                        Hier kannst du deine rätselhaften Züge eingeben. Also Dinge, die du nicht gerne über dich
                        preisgibst.
                      </p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Spricht ungern über Ereignis X</span>:</p>
                      <ul class="ml-2">
                        <li>Spricht ungern über Ereignis X</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <h5 class="mt-2 mb-1">Geschmäcker:</h5>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Musik" name="music" :ui="formgroupUi">
              <UInput v-model="formData.music" placeholder="Rock Musik, EDM, Metal, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>
                        Hier kannst du Musik eingeben die du gerne hörst. Das können Genres, Künstler oder auch einzelne
                        Lieder sein.
                      </p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Rock Musik, EDM, Metal</span>:</p>
                      <ul class="ml-2">
                        <li>Rock Musik</li>
                        <li>EDM</li>
                        <li>Metal</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Filme" name="movies" :ui="formgroupUi">
              <UInput v-model="formData.movies" placeholder="Star Trek, Star Wars, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>
                        Hier kannst du Filme eingeben die du gerne schaust. Das können Genres oder auch einzelne Filme
                        sein.
                      </p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Star Trek, Star Wars</span>:</p>
                      <ul class="ml-2">
                        <li>Star Trek</li>
                        <li>Star Wars</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Bücher" name="books" :ui="formgroupUi">
              <UInput v-model="formData.books" placeholder="Broschüren von Hersteller X, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>
                        Hier kannst du Bücher eingeben die du gerne liest. Das können Genres oder auch einzelne Bücher
                        sein.
                      </p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <p>
                        <span class="text-success">Tipp</span>: Du kannst dir
                        <NuxtLink target="_blank" to="/VerseExkurs/literature">hier</NuxtLink> im VerseExkurs unter
                        "Literatur" ein paar Bücher der Lore anschauen.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Brochuren von Hersteller X</span>:</p>
                      <ul class="ml-2">
                        <li>Broschüren von Hersteller X</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Kleidung" name="clothing" :ui="formgroupUi">
              <UInput v-model="formData.clothing" placeholder="Lederjacken, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>
                        Hier kannst du Kleidung eingeben die du gerne trägst. Das können Kleidungsstücke oder auch ganze
                        Outfits sein.
                      </p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Lederjacken</span>:</p>
                      <ul class="ml-2">
                        <li>Lederjacken</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Speisen" name="food" :ui="formgroupUi">
              <UInput v-model="formData.food" placeholder="Big Bennys Nudeln, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du Gerichte oder Dinge eingeben die du gerne isst.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Big Bennys Nudeln</span>:</p>
                      <ul class="ml-2">
                        <li>Big Bennys Nudeln</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Getränke" name="drinks" :ui="formgroupUi">
              <UInput v-model="formData.drinks" placeholder="Vestal Wasser, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du (alkoholfreie) Getränke eingeben die du gerne trinkst.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Vestal Wasser</span>:</p>
                      <ul class="ml-2">
                        <li>Vestal Wasser</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Alkohol" name="alcohol" :ui="formgroupUi">
              <UInput v-model="formData.alcohol" placeholder="Schmolz Bier, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du alkoholische Getränke eingeben die du gerne trinkst.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Schmolz Bier</span>:</p>
                      <ul class="ml-2">
                        <li>Schmolz Bier</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" label="Farben" name="colors" :ui="formgroupUi">
              <UInput v-model="formData.colors" placeholder="Schwarz, Blau, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du Farben eingeben die du gerne magst.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Schwarz, Blau</span>:</p>
                      <ul class="ml-2">
                        <li>Schwarz</li>
                        <li>Blau</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" :label="user?.pronom + ' liebt...'" name="loves" :ui="formgroupUi">
              <UInput v-model="formData.loves" placeholder="Hochwertige Schiffe, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du Dinge eingeben die du Liebst.</p>
                      <p>Das können Schiffe, Marken, Produkte oder egal was sein.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Hochwertige Schiffe</span>:</p>
                      <ul class="ml-2">
                        <li>Hochwertige Schiffe</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
            <UFormGroup size="xl" :label="user?.pronom + ' hasst...'" name="hates" :ui="formgroupUi">
              <UInput v-model="formData.hates" placeholder="Drake, ..." icon="i-heroicons-user" />
              <template #hint>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du Dinge eingeben die du hasst.</p>
                      <p>Das können Schiffe, Marken, Produkte oder egal was sein.</p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Listenfeld. Das bedeutet, dass nach
                        jedem Komma ein neues Item in der Liste kommt.
                      </p>
                      <br />
                      <p class="pb-0 font-bold text-white">Beispiele:</p>
                      <p class="italic"><span class="text-secondary">Drake</span>:</p>
                      <ul class="ml-2">
                        <li>Drake</li>
                      </ul>
                    </div>
                  </template>
                </UPopover>
              </template>
            </UFormGroup>
          </div>
          <UFormGroup size="xl">
            <UTextarea
              v-model="formData.medicalinfo"
              name="medicalinfo"
              resize
              :rows="8"
              :placeholder="'- Rechte Hand große Narbe verursacht durch eine Piratenklinge \n- Linke Ohrmuschel nicht vorhanden durch einen schlimmen Rennsport-Unfall'"
            />
            <template #label>
              <div class="flex mt-4">
                <h5 class="text-white">Medizinisch Relevantes:</h5>
                <UPopover mode="hover">
                  <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                  <template #panel>
                    <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                      <p>Hier kannst du Medizinisch relevante Details eingeben.</p>
                      <p>
                        <span class="text-primary">Information</span>: Das ist nicht deine Medizinische Akte sondern nur
                        vielleicht spannende Details.
                      </p>
                      <p>
                        <span class="text-primary">Information</span>: Dies ist ein Textfeld. Es wäre schön wenn du es
                        wie im Platzhalter gezeigt formatierst.
                      </p>
                    </div>
                  </template>
                </UPopover>
              </div>
            </template>
          </UFormGroup>
          <TableHr>
            <span class="flex">
              Biografie
              <UPopover mode="hover">
                <UButton icon="i-heroicons-information-circle" variant="inputInfo" />
                <template #panel>
                  <div class="p-1 text-xs text-tbase/60 whitespace-break-spaces">
                    <p>
                      Hier kannst du deine Biografie schreiben. Diese kann sehr ausführlich oder auch kurz und knapp
                      sein.
                    </p>
                    <p>
                      Falls du Hilfe zur Lore brauchst kannst du dich ja im Verse-Exkurs umschauen.
                      <br />
                      Alternativ kannst du auch gerne im Discord nachfragen. Oder dir die Biografien anderer Mitglieder
                      anschauen.
                    </p>
                  </div>
                </template>
              </UPopover>
            </span>
          </TableHr>
          <UFormGroup size="xl" name="biography">
            <LazyClientOnly>
              <Editor
                api-key="30ijnjychriexb76qdn1j9nrlsz8qu89urtbqt9jd7gjo5dq"
                v-model="formData.biography"
                :init="{
                  height: 500,
                  menubar: true,
                  plugins: [
                    'a11ychecker',
                    'advlist',
                    'advcode',
                    'advtable',
                    'autolink',
                    'checklist',
                    'export',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'powerpaste',
                    'fullscreen',
                    'formatpainter',
                    'insertdatetime',
                    'media',
                    'table',
                    'help',
                    'ariscorpElements',
                  ],
                  toolbar:
                    'undo redo | casechange blocks | bold italic backcolor | ' +
                    'alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help | ariscorpElements',
                  content_style: `
                    html {
                      background-color: #222;
                      color: #d1d5dd;
                    }
                    html::-webkit-scrollbar-track {
                      border-radius: 0.25rem;
                      background-color: #222;
                      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
                    }
                    html::-webkit-scrollbar {
                      width: 7px;
                      height: 7px;
                      background-color: #222;
                    }
                    html::-webkit-scrollbar-thumb {
                      border-radius: 0.375rem;
                      background-color: #00ffe8;
                      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
                    }
                    ::selection {
                      background-color: rgba(0, 255, 232, .4);
                      color: #111;
                    }
                    body {
                      font-family:nasalization, sans-serif;
                      font-size:14px;
                    }
                    h1 {
                      display: block; 
                      margin-bottom: 2rem; 
                      font-size: 1.25rem;
                      line-height: 1.75rem; 
                      font-weight: 700; 
                      letter-spacing: 0.1em; 
                      color: #ffffff; 

                      @media (min-width: 640px) { 
                        font-size: 1.5rem;
                      line-height: 2rem; 
                      }
                      @media (min-width: 768px) { 
                        font-size: 1.875rem;
                      line-height: 2.25rem; 
                      }
                      @media (min-width: 1024px) { 
                        font-size: 2.25rem;
                      line-height: 2.5rem; 
                      }
                    }
                    h2 {
                      display: block; 
                      margin-bottom: 1.5rem; 
                      margin-top: 3rem; 
                      font-size: 1.125rem;
                      line-height: 1.75rem; 
                      font-weight: 700; 
                      color: #ffffff; 

                      @media (min-width: 640px) { 
                        font-size: 1.25rem;
                      line-height: 1.75rem; 
                      }
                      @media (min-width: 768px) { 
                        font-size: 1.5rem;
                      line-height: 2rem; 
                      }
                    }
                    h3 {
                      display: block; 
                      margin-bottom: 0.75rem; 
                      font-size: 1.125rem;
                      line-height: 1.75rem; 
                      font-weight: 700; 
                      color: #ffffff; 


                      @media (min-width: 768px) { 
                        font-size: 1.25rem;
                      line-height: 1.75rem; 
                      }
                    }
                    h4 {
                      display: block; 
                      margin-bottom: 0.5rem; 
                      font-size: 1.125rem;
                      line-height: 1.75rem; 
                      font-weight: 700; 
                      color: #ffffff; 
                    }
                    h5,
                    h6 {
                      color: #ffffff; 
                    }
                    p {
                      padding: 0.5rem; 
                    }
                    a {
                      color: rgb(228 134 50);
                      text-decoration: none; 
                      cursor: pointer; 
                    }
                    a:hover {
                      text-decoration: underline; 
                    }
                    hr {
                      color: rgb(228 134 50);
                      margin-top: 1.25rem;
                      margin-bottom: 1.25rem; 
                      border-style: none; 
                      width: 100%; 
                      height: 2px;
                    }
                  `,
                  skin_url: '/tinymce-ariscorp/',
                  block_formats: 'Paragraph=p; Heading=h2; Heading 2=h3; Heading 3=h4; Heading 4=h5; Heading 5=h6',
                  verify_html: false,
                }"
              />
            </LazyClientOnly>
          </UFormGroup>
          <div id="profile_actions" class="sticky z-10 w-full h-12 mx-auto max-w-[1800px] bottom-6">
            <div
              class="absolute left-0 right-0 flex mx-auto rounded w-fit bg-bsecondary/50 sm:bg-transparent gap-x-4 sm:m-0 sm:left-auto sm:right-4"
            >
              <button
                @click="dataChanged && handleResetData()"
                class="transition opacity-50 hover:opacity-100"
                :class="[dataChanged ? 'text-danger' : 'text-dark-gray']"
              >
                <Icon name="heroicons:x-circle" size="48" />
              </button>
              <!-- TODO: ADD MODAL WARNING WHEN CHANGING PASSWORD, FIRST- OR LASTNAME -->
              <button
                @click="onSubmit"
                submit="submit"
                class="transition opacity-50 hover:opacity-100"
                :class="[dataChanged ? 'text-success' : 'text-dark-gray']"
              >
                <Icon name="heroicons:check-circle" size="48" />
              </button>
            </div>
          </div>
        </UForm>
      </div>
    </div>
  </NuxtLayout>
</template>

<style>
.tox-statusbar__right-container {
  display: none;
}
</style>

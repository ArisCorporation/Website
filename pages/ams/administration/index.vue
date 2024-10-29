<script setup lang="ts">
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';
import { number, object, string, boolean, array, type InferType, ValidationError } from 'yup';
import * as yup from 'yup';
import YupPassword from 'yup-password';

YupPassword(yup);

const { width } = useWindowSize();
const { directus, readMe, readItems, updateUser, deleteUsers, readRoles, uploadFiles, deleteFile } = useCMS();
const { data: user } = await useAsyncData('AMS:ME', () => directus.request(readMe()), {
  transform: (user: any) => transformUser(user),
});
const config = useRuntimeConfig();
const modalStore = useModalStore();
const userTable = ref();

class FetchError extends Error {
  constructor(message: string, type: string) {
    super(message);
    this.type = type;
    this.name = 'FetchError';
  }
}

const discordMembers: discordMember[] = await useFetch('/api/ams/notifications/discord/getMembers').then(
  (data: { data: { value: discordMember[] } }) => {
    return data.data.value;
  },
);

const { data: roleOptions } = await useAsyncData(
  'AMS:ROLE_OPTIONS',
  () =>
    directus.request(
      readRoles({
        fields: ['id', 'label', 'name', 'access_level'],
        limit: -1,
        sort: ['access_level'],
      }),
    ),
  {
    transform: (roles: any[]) =>
      roles
        .filter((e) => (unref(user).position.access_level >= 5 ? true : e.access_level < 5))
        .map((role: any) => ({
          id: role.id,
          position: role.name === 'Administrator' ? 'Verwaltung + Administration' : role.label,
          access_level: role.access_level,
        })),
  },
);

// const { data: roleOptions } = await useFetch(
//   `${config.public.backendUrl}/roles?fields=id,label,name,access_level&sort=access_level&limit=-1`,
//   {
//     transform: (data) =>
//       data.data
//         .filter((e) => (user.position.access_level >= 5 ? true : e.access_level < 5))
//         .map((role: any) => ({
//           id: role.id,
//           position: role.name === 'Administrator' ? 'Verwaltung + Administration' : role.label,
//           access_level: role.access_level,
//         })),
//   },
// );

// USER - Actions
function resetUserFormData() {
  userFormData.firstname = '';
  userFormData.lastname = '';
  userFormData.title = '';
  userFormData.password = null;
  userFormData.role = null;
  userFormData.discordName = '';
  userFormData.discord_user = '';
}
const handleCreate = () => {
  resetUserFormData();
  modalStore.openSlide({ type: 'createUser' });
};

const temp_pw_create = ref();
const handleUserCreation = async (event: FormSubmitEvent<UserCreationSchema>) => {
  userCreationForm.value.clear();
  temp_pw_create.value =
    userFormData.password !== null && userFormData.password !== ''
      ? userFormData.password
      : useSlugify(userFormData.firstname.trim() + (userFormData.lastname && '.' + userFormData.lastname.trim()), true);

  try {
    // await userCreationSchema.validate(userFormData)
    // TODO: GET DISCORD ID AND SET REF FOR CHECKBOX IN SUCCESS-MODAL FOR SENDING CREDENTIALS
    const userData = {
      status: 'draft',
      first_name: userFormData.firstname,
      last_name: userFormData.lastname,
      slug: useSlugify(userFormData.firstname.trim() + (userFormData.lastname && ' ' + userFormData.lastname.trim())),
      title: userFormData.title,
      email: userFormData.email,
      password:
        userFormData.password !== null && userFormData.password !== ''
          ? userFormData.password
          : useSlugify(
              userFormData.firstname.trim() + (userFormData.lastname && '.' + userFormData.lastname.trim()),
              true,
            ),
      role: userFormData.role?.id,
      discord_id: userFormData.discord_user?.id,
      temporary_password: true,
    };

    if (userTable.value.items?.find((e: IRawUser) => e.email === userData.email)) {
      throw new Error('Es existiert bereits ein Benutzer mit dieser Vor- Nachnamen-Kombination.');
    }
    console.log(userData);
    const newUser = await createUser(userData);

    modalStore.closeSlide();
    userCreationSendCredentials.value = newUser.discord_id ? true : false;
    if (!newUser.discord_id) {
      temp_pw_create.value = null;
    }

    await setTimeout(() => {
      userTable.value.refresh();
      modalStore.setData(transformUser(newUser));
      console.log('User created:', modalStore.data);
      modalStore.openModal('Benutzer erstellt.', {
        hideCloseButton: true,
        hideXButton: true,
        type: 'userCreationSuccess',
      });
    }, 600);
  } catch (e) {
    console.error('Error:', createError);
    await setTimeout(
      () =>
        userCreationForm.value.setErrors([
          ...userCreationForm.value.getErrors(),
          {
            path: 'customErrors',
            message:
              'Error! Es gab ein Problem bei der Erstellung des Benutzers. Bitte versuche es später erneut. Sollte dieser Fehler wiederholt auftreten melde dich bitte beim Website-Team. (@Thomas_Blakeney, @Decon_Malcom_Vorn)',
          },
        ]),
      0,
    );
  }
};

const { data: departments } = await useAsyncData(
  'AMS:ADMIN_DEPARTMENTS',
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
const { data: landing_zones_res } = await useAsyncData(
  'AMS:ADMINISTRATION_LZs',
  () =>
    directus.request(
      readItems('landing_zones', {
        fields: ['id', 'name', 'slug', 'planet.id', 'planet.name', 'planet.slug', 'planet.astronomical_designation'],
        filter: {
          status: { _eq: 'published' },
        },
        limit: -1,
      }),
    ),
  { transform: (landing_zones: any[]) => landing_zones.map((landing_zone: any) => transformLandingZone(landing_zone)) },
);
const { data: planets } = await useAsyncData(
  'AMS:ADMINISTRATION_PLANETS',
  () =>
    directus.request(
      readItems('planets', {
        fields: ['id', 'name', 'astronomical_designation', 'slug'],
        filter: {
          status: { _eq: 'published' },
        },
        limit: -1,
      }),
    ),
  { transform: (planets: any[]) => planets.map((planet: any) => transformPlanet(planet)) },
);
const { data: systems } = await useAsyncData(
  'AMS:ADMINISTRATION_SYSTEMS',
  () =>
    directus.request(
      readItems('systems', {
        fields: ['id', 'name', 'slug', 'orbit.collection', 'orbit.object:planets.id', 'orbit.object:planets.name'],
        filter: {
          status: { _eq: 'published' },
        },
        limit: -1,
      }),
    ),
  { transform: (systems: any[]) => systems.map((system: any) => transformStarsystem(system)) },
);

const landing_zones = computed(() => {
  return landing_zones_res.value
    .map((landing_zone: any) => {
      const planet = planets.value.find((planet: any) => planet.id === landing_zone.planet?.id);
      const system = systems.value.find((system: any) =>
        planet ? system.planets.find((p: any) => p.id === planet.id) : null,
      );
      return {
        ...landing_zone,
        planet: {
          ...planet,
          system,
        },
        path_label: [system?.name, planet?.name, landing_zone.name].filter(Boolean).join(' / '),
      };
    })
    .sort(
      (a, b) =>
        a.planet?.system?.name.localeCompare(b.planet?.system?.name) ||
        a.planet?.name?.localeCompare(b.planet?.name) ||
        a.name.localeCompare(b.name),
    );
});

const edit_birthdate_day = ref();
const edit_birthdate_month = ref();
const edit_birthdate_year = ref();

const userEditForm = ref();
const edit_schema = object({
  first_name: string().required('Du brauchst einen Vornamen!'),
  last_name: string().nullable(),
  title: string().nullable(),
  password: string()
    .min(8, 'Dein Passwort muss mindestens 8 Zeichen lang sein.')
    .minLowercase(1, 'Dein Passwort muss mindestens einen Kleinbuchstaben enthalten.')
    .minUppercase(1, 'Dein Passwort muss mindestens einen Großbuchstaben enthalten.')
    .minNumbers(1, 'Dein Passwort muss mindestens eine Zahl enthalten.')
    .minSymbols(1, 'Dein Passwort muss mindestens ein Sonderzeichen enthalten.')
    .nullable(),
  department: object({
    id: string().required(),
    name: string().required(),
    logo: string().nullable(),
  }).nullable(),
  rsi_handle: string().nullable(),
  sex: string().oneOf(['male', 'female'], 'Geschlecht ist erforderlich').required('Geschlecht ist erforderlich'),
  current_residence: object({
    id: string(),
    name: string(),
    planet: object({
      id: string(),
      name: string(),
      slug: string(),
      system: object({
        id: string(),
        name: string(),
        slug: string(),
      }).nullable(),
    }),
    slug: string(),
  }).nullable(),
  birthdate: string().nullable(),
  birthplace: object({
    id: string(),
    name: string(),
    planet: object({
      id: string(),
      name: string(),
      slug: string(),
      system: object({
        id: string(),
        name: string(),
        slug: string(),
      }).nullable(),
    }),
    slug: string(),
  }).nullable(),
  hair_color: string().nullable(),
  eye_color: string().nullable(),
  weight: number().nullable(),
  height: number().nullable(),
  citizen: boolean().nullable(),
  citizen_reason: string().nullable(),
  duty_state: boolean().required(),
  education_state: boolean().required(),
  social_state: boolean().required(),
  duty_period: string().nullable(),
  duty_end: string().nullable(),
  duty_division: string().nullable(),
  education_name: string().nullable(),
  education_period: string().nullable(),
  education_place: string().nullable(),
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
  drink: string().nullable(),
  alcohol: string().nullable(),
  colors: string().nullable(),
  loves: string().nullable(),
  hates: string().nullable(),
  medical_informations: string().nullable(),
  biography: string().nullable(),
});

type EditSchema = InferType<typeof edit_schema>;

const edit_formdata = reactive<EditSchema>({});

type discordMember = {
  id: string;
  label: string;
  global_name: string | null;
  username: string | null;
  nick: string | null;
  avatar: {
    src: string;
  };
};

const userNotificationsEditForm = ref();
const noti_schema = object({
  contact_email: string().email('Keine gültige Email-Adresse angegeben!').nullable(),
  discord_name: string().nullable(),
  discord_user: object({
    id: yup.string().required('Fehler mit Discord Benutzerdaten'),
    label: yup.string().required('Fehler mit Discord Benutzerdaten'),
    global_name: yup.string().nullable(),
    username: yup.string().nullable(),
    nick: yup.string().nullable(),
    avatar: yup
      .object()
      .shape({
        src: yup.string().required('Fehler mit Discord Benutzerdaten'),
      })
      .required('Fehler mit Discord Benutzerdaten'),
  })
    .nullable()
    .default(undefined),
});

type NotiSchema = InferType<typeof noti_schema>;

const noti_formdata = reactive<NotiSchema>({});
const noti_discord_id = ref<string>('');

watch(edit_formdata, () => {
  if (edit_formdata.citizen_reason === 'military') {
    edit_formdata.duty_state = true;
  } else if (edit_formdata.citizen_reason === 'special_education') {
    edit_formdata.education_state = true;
  } else if (edit_formdata.citizen_reason === 'social_commitment') {
    edit_formdata.social_state = true;
  }
  if (edit_formdata.department === '') {
    edit_formdata.department = null;
  }
});

const userRolesEditForm = ref();
const roles_schema = object({
  head_of_department: boolean().required('Bitte wähle aus, ob der Benutzer Abteilungsleiter ist.'),
  department: object({
    id: string().required(),
    name: string().required(),
    logo: string().nullable(),
  }).nullable(),
  roles: array().of(string()).required('Bitte wähle mindestens eine Rolle aus.'),
  role: object({
    id: string().required(),
    position: string().required(),
    access_level: number().required(),
  }).required('Bitte wähle eine Position aus.'),
});

type RolesSchema = InferType<typeof roles_schema>;

const roles_formdata = reactive<RolesSchema>({});

const roles_values_recruitment = ref();
const roles_values_marketing_and_press = ref();
const roles_values_content_writer = ref();

watch(roles_formdata, () => {
  if (roles_formdata.department === '') {
    roles_formdata.department = null;
  }
});
watch([roles_values_recruitment, roles_values_marketing_and_press, roles_values_content_writer], () => {
  const roles = [];

  if (roles_values_recruitment.value) {
    roles.push('recruitment');
  }
  if (roles_values_marketing_and_press.value) {
    roles.push('marketing_and_press');
  }
  if (roles_values_content_writer.value) {
    roles.push('content_writer');
  }

  roles_formdata.roles = roles;
});

const initialEditFormdata = reactive({ ...edit_formdata });
const initialNotificationsEditFormdata = reactive({ ...noti_formdata });
const initialRolesEditFormdata = reactive({ ...roles_formdata });

const cropper = ref();
const cropper_input = ref();

function handleAvatarEdit(user: any) {
  console.log(user);
  const userData = transformUser(user);

  edit_user.value = userData;
  cropper_input.value.click();
}
function setCropperImage(e: any) {
  const file = e.target.files[0];

  if (!file.type.includes('image/')) {
    alert('Please select an valid image file');
    return;
  }

  if (typeof FileReader === 'function') {
    modalStore.openModal('Avatar ändern', { type: 'avatar-cropper', hideCloseButton: true });
    const reader = new FileReader();

    reader.onload = (event: any) => {
      cropper.value.replace(event.target.result);
    };

    reader.readAsDataURL(file);
  } else {
    alert('Sorry, FileReader API not supported');
  }
}

const avatarUploadLoading = ref(false);
const edit_user = ref();
async function saveAvatar() {
  await cropper.value.getCroppedCanvas().toBlob(async (blob: Blob) => {
    const old_avatar =
      edit_user.value?.avatar === '8658f40d-77d9-44c4-8f0d-af820855a3bc' ? null : edit_user.value?.avatar;
    const formData = new FormData();
    console.log(edit_user);

    formData.append('title', `${edit_user.value.full_name} - Avatar.png`);
    formData.append('folder', '8658f40d-77d9-44c4-8f0d-af820855a3bc');
    formData.append('file', blob, `${edit_user.value.slug}-avatar.png`);

    try {
      avatarUploadLoading.value = true;
      const new_avatar = await directus.request(uploadFiles(formData));
      await directus.request(updateUser(edit_user.value?.id, { avatar: new_avatar.id }, { fields: ['id'] }));
      avatarUploadLoading.value = false;
      modalStore.closeModal();

      await directus.request(deleteFile(old_avatar));
    } catch (e) {
      console.error(e);
    } finally {
      userTable.value.refresh();
      userTable.value.selectedRows = [];
    }
  });
}

const handleProfileEdit = (user: any) => {
  const userData = transformUser(user);

  edit_user.value = userData;

  edit_birthdate_day.value = userData.birthdate?.split('-')[2] || null;
  edit_birthdate_month.value = userData.birthdate?.split('-')[1] || null;
  edit_birthdate_year.value = userData.birthdate?.split('-')[0] || null;

  edit_formdata.first_name = userData.first_name;
  edit_formdata.last_name = userData.last_name || '';
  edit_formdata.title = userData.title || '';
  edit_formdata.password = null;
  edit_formdata.head_of_department = userData.head_of_department || false;
  edit_formdata.department = departments.value.find((e: any) => e.id === userData.department_id) || '';
  edit_formdata.rsi_handle = userData.rsi_handle || '';
  edit_formdata.sex = userData.sex_value || '';
  edit_formdata.current_residence =
    landing_zones.value?.find((e: any) => e.id === userData.current_residence_value) || '';
  edit_formdata.birthdate = computed(
    () => `${edit_birthdate_year.value}-${edit_birthdate_month.value}-${edit_birthdate_day.value}`,
  );
  edit_formdata.birthplace = landing_zones.value?.find((e: any) => e.id === userData.birthplace_value) || '' || '';
  edit_formdata.hair_color = userData.hair_color || '';
  edit_formdata.eye_color = userData.eye_color || '';
  edit_formdata.weight = userData.weight || null;
  edit_formdata.height = userData.height || null;
  edit_formdata.citizen = userData.citizen_state || false;
  edit_formdata.citizen_reason = userData.citizen_reason_value || '';
  edit_formdata.duty_state = userData.duty_state || false;
  edit_formdata.education_state = userData.education_state || false;
  edit_formdata.social_state = userData.social_state || false;
  edit_formdata.duty_period = userData.duty?.period || '';
  edit_formdata.duty_end = userData.duty?.end_value || '';
  edit_formdata.duty_division = userData.duty?.division_value || '';
  edit_formdata.education_name = userData.education?.name || '';
  edit_formdata.education_period = userData.education?.period || '';
  edit_formdata.education_place = userData.education?.place || '';
  edit_formdata.hobbies = userData.hobbies || '';
  edit_formdata.activities = userData.activities || '';
  edit_formdata.talents = userData.talents || '';
  edit_formdata.habits = userData.habits || '';
  edit_formdata.tics = userData.tics || '';
  edit_formdata.fears = userData.fears || '';
  edit_formdata.character = userData.character || '';
  edit_formdata.mysterious = userData.mysterious || '';
  edit_formdata.music = userData.music || '';
  edit_formdata.movies = userData.movies || '';
  edit_formdata.books = userData.books || '';
  edit_formdata.clothing = userData.clothing || '';
  edit_formdata.food = userData.food || '';
  edit_formdata.drink = userData.drink || '';
  edit_formdata.alcohol = userData.alcohol || '';
  edit_formdata.colors = userData.colors || '';
  edit_formdata.loves = userData.loves || '';
  edit_formdata.hates = userData.hates || '';
  edit_formdata.medical_informations = userData.medical_informations || '';
  edit_formdata.biography = userData.biography || '';

  for (const key in edit_formdata) {
    initialEditFormdata[key as keyof typeof initialEditFormdata] = edit_formdata[key as keyof typeof edit_formdata];
  }

  modalStore.setData(userData);
  modalStore.openSlide({ type: 'editUser', big: true });
};
async function onProfileEditSubmit(event: FormSubmitEvent<EditSchema>) {
  const userId = edit_user.value.id;
  const updatedUser = {};

  for (const key in edit_formdata) {
    if (
      edit_formdata[key as keyof typeof edit_formdata] !== initialEditFormdata[key as keyof typeof initialEditFormdata]
    ) {
      updatedUser[key as keyof typeof updatedUser] = edit_formdata[key as keyof typeof edit_formdata];
    }
  }
  console.log(updatedUser);
  if (Object.keys(updatedUser).length === 0) {
    return;
  }

  if (updatedUser.hasOwnProperty('department')) {
    if (edit_user.value.head_of_department === true) {
      updatedUser.leading_department = updatedUser.department;
      updatedUser.department = null;
    } else {
      updatedUser.department = updatedUser.department;
      updatedUser.leading_department = null;
    }
  }

  try {
    await directus.request(updateUser(userId, updatedUser, { limit: -1 }));

    for (const key in edit_formdata) {
      if (
        initialEditFormdata[key as keyof typeof initialEditFormdata] !==
        edit_formdata[key as keyof typeof edit_formdata]
      ) {
        initialEditFormdata[key as keyof typeof initialEditFormdata] = edit_formdata[key as keyof typeof edit_formdata];
      }
    }

    edit_formdata.password = null;
    initialEditFormdata.password = null;

    if (
      updatedUser.hasOwnProperty('password') ||
      updatedUser.hasOwnProperty('first_name') ||
      updatedUser.hasOwnProperty('last_name')
    ) {
      modalStore.setData({
        ...((updatedUser.hasOwnProperty('first_name') || updatedUser.hasOwnProperty('last_name')) && {
          username: useSlugify(
            edit_formdata.first_name.trim() + (edit_formdata.last_name ? ' ' + edit_formdata.last_name.trim() : ''),
            true,
          ),
        }),
        ...(updatedUser.hasOwnProperty('password') && { password: updatedUser.password, temporary_password: true }),
      });

      modalStore.openModal('WARNUNG!!!', {
        type: 'cred-change',
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    userTable.value.refresh();
    userTable.value.selectedRows = [];
  }
}

const handleNotificationsEdit = (user: any) => {
  const userData = transformUser(user);

  edit_user.value = userData;
  noti_discord_id.value = userData.discord_id;

  (noti_formdata.contact_email = userData.contact_email || ''),
    (noti_formdata.discord_name = userData.discord_name || ''),
    (noti_formdata.discord_user = discordMembers.find((e) => e.id === userData?.discord_id) || null);

  for (const key in noti_formdata) {
    initialNotificationsEditFormdata[key as keyof typeof initialNotificationsEditFormdata] =
      noti_formdata[key as keyof typeof noti_formdata];
  }

  modalStore.setData(userData);
  modalStore.openSlide({ type: 'editUserNotifications', big: true });
};
async function onNotificationsEditSubmit(event: FormSubmitEvent<NotiSchema>) {
  const userId = user.id;
  const updatedUser = {};

  for (const key in noti_formdata) {
    if (
      noti_formdata[key as keyof typeof noti_formdata] !==
      initialNotificationsEditFormdata[key as keyof typeof initialNotificationsEditFormdata]
    ) {
      updatedUser[key as keyof typeof updatedUser] = noti_formdata[key as keyof typeof noti_formdata];
    }
  }

  updatedUser.discord_id = updatedUser.discord_user ? updatedUser.discord_user?.id : null;

  delete updatedUser.discord_user;
  delete updatedUser.discord_name;

  console.log(updatedUser);

  if (Object.keys(updatedUser).length === 0) {
    return;
  }

  try {
    const new_data = await directus.request(updateUser(userId, updatedUser, { limit: -1 }));

    for (const key in noti_formdata) {
      if (
        initialNotificationsEditFormdata[key as keyof typeof initialNotificationsEditFormdata] !==
        noti_formdata[key as keyof typeof noti_formdata]
      ) {
        initialNotificationsEditFormdata[key as keyof typeof initialNotificationsEditFormdata] =
          noti_formdata[key as keyof typeof noti_formdata];
      }
    }

    noti_discord_id.value = new_data.discord_id;
  } catch (e) {
    console.error(e);
  } finally {
    userTable.value.refresh();
    userTable.value.selectedRows = [];
  }
}

const handleRolesEdit = (user: any) => {
  const userData = transformUser(user);

  edit_user.value = userData;
  console.log(userData);

  roles_values_recruitment.value = userData.roles_value?.includes('recruitment') ? true : false;
  roles_values_marketing_and_press.value = userData.roles_value?.includes('marketing_and_press') ? true : false;
  roles_values_content_writer.value = userData.roles_value?.includes('content_writer') ? true : false;

  roles_formdata.head_of_department = userData.head_of_department || false;
  roles_formdata.department = unref(departments).find((e: any) => e.id === userData.department_id) || '';
  roles_formdata.roles_value = userData.roles_value || null;
  roles_formdata.role = roleOptions.value.find((e: any) => e.id === userData.position.id) || null;

  for (const key in roles_formdata) {
    initialRolesEditFormdata[key as keyof typeof initialRolesEditFormdata] =
      roles_formdata[key as keyof typeof roles_formdata];
  }

  modalStore.setData(userData);
  modalStore.openSlide({ type: 'editUserRoles', big: true });
};
async function onRolesEditSubmit(event: FormSubmitEvent<RolesSchema>) {
  const userId = edit_user.value.id;
  const updatedUser = {};
  console.log(updatedUser);
  for (const key in roles_formdata) {
    if (
      roles_formdata[key as keyof typeof roles_formdata] !==
      initialRolesEditFormdata[key as keyof typeof initialRolesEditFormdata]
    ) {
      updatedUser[key as keyof typeof updatedUser] = roles_formdata[key as keyof typeof roles_formdata];
    }
  }

  if (Object.keys(updatedUser).length === 0) {
    return;
  }
  console.log(userId);
  console.log(edit_user.value);
  console.log(updatedUser);
  if (updatedUser.hasOwnProperty('department')) {
    if (edit_user.value.head_of_department === true) {
      updatedUser.leading_department = updatedUser.department;
      updatedUser.department = null;
    } else {
      updatedUser.department = updatedUser.department;
      updatedUser.leading_department = null;
    }
  }
  console.log(userId);
  console.log(edit_user.value);
  console.log(updatedUser);

  try {
    await directus.request(updateUser(userId, updatedUser, { limit: -1 }));

    for (const key in roles_formdata) {
      if (
        initialRolesEditFormdata[key as keyof typeof initialRolesEditFormdata] !==
        roles_formdata[key as keyof typeof roles_formdata]
      ) {
        initialRolesEditFormdata[key as keyof typeof initialRolesEditFormdata] =
          roles_formdata[key as keyof typeof roles_formdata];
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    userTable.value.refresh();
    userTable.value.selectedRows = [];
  }
}
const handleDelete = async (users: any[]) => {
  modalStore.setData(users.map((user: any) => transformUser(user)));
  modalStore.openModal('Benutzer löschen', {
    type: 'deleteUsers',
    hideCloseButton: true,
    hideXButton: true,
  });
};
const submitDelete = async (users: any[]) => {
  try {
    await directus.request(deleteUsers(users?.map((obj: any) => obj.id)));
    modalStore.closeModal();
  } catch (e) {
    console.error(e);
  } finally {
    userTable.value.refresh();
    userTable.value.selectedRows = [];
  }
};
const handleLock = async (users: any[]) => {
  try {
    await Promise.all(
      users.value?.map(async (user: any) => {
        await directus.request(updateUser(user.id, { status: 'suspended' }, {}));
      }),
    );
  } catch (e) {
    console.error(e);
  } finally {
    userTable.value.refresh();
    userTable.value.selectedRows = [];
  }
};
const handleUnlock = async (users: any[]) => {
  try {
    await Promise.all(
      users.value?.map(async (user: any) => {
        await directus.request(updateUser(user.id, { status: 'active' }, {}));
      }),
    );
  } catch (e) {
    console.error(e);
  } finally {
    userTable.value.refresh();
    userTable.value.selectedRows = [];
  }
};
const handleArchive = async (users: any[]) => {
  try {
    await Promise.all(
      users.value?.map(async (user: any) => {
        await directus.request(updateUser(user.id, { status: 'archived' }, {}));
      }),
    );
  } catch (e) {
    console.error(e);
  } finally {
    userTable.value.refresh();
    userTable.value.selectedRows = [];
  }
};

const sendCredentials = async (data) => {
  console.log(data);
  const created_date = new Date();
  await useFetch('https://cms.ariscorp.de/flows/trigger/5a39f82d-6037-4db9-a948-837219ac7cd4', {
    method: 'POST',
    body: {
      discord_id: data.discord_id,
      name: data.full_name,
      created_ts: created_date.toISOString(),
      username: data?.login_email.replace('@ariscorp.de', ''),
      password: temp_pw_create.value,
    },
  });

  resetUserFormData();
  temp_pw_create.value = null;
};

// USER - Data
const userCreationForm = ref();
const userCreationSendCredentials = ref(false);
const userCreationSchema = object({
  firstname: string().required('Bitte gib einen Vornamen an.'),
  lastname: string().nullable(),
  title: string().nullable(),
  email: string()
    .email('Es gab ein Fehler bei der Generierung der Email-Adresse.')
    .required('Es gab einen Fehler bei der Generierung der Email-Adresse.'),
  password: string().nullable(),
  role: object({
    id: string().required('Bitte wähle eine Position aus.'),
    position: string().required('Bitte wähle eine Position aus.'),
    access_level: number().required('Bitte wähle eine Position aus.'),
  }).required('Bitte wähle eine Position aus.'),
  discordName: string().nullable(),
});
type UserCreationSchema = InferType<typeof userCreationSchema>;
const userFormData: {
  firstname: string;
  lastname?: string;
  title?: string;
  password: string | null;
  email: string;
  role?: object | null;
  discordName?: string;
} = reactive({
  firstname: '',
  lastname: '',
  title: '',
  password: null,
  email: computed(
    () =>
      useSlugify(userFormData.firstname.trim() + (userFormData.lastname && '.' + userFormData.lastname.trim()), true) +
      '@ariscorp.de',
  ),
  role: null,
  discordName: '',
});

// USER - Options
const titleOptions = ['Dr.', 'Dr. Med.', 'Prof. Med.', 'Dipl. Ing.'];
// const roleOptions = [
// 	{
// 		id: '030fee1b-0a1c-413c-a7c5-c1b2f10765ea',
// 		position: 'Anwärter',
// 		access_level: 1,
// 	},
// 	{
// 		id: '175c81cc-7d77-4fe8-a115-c0092df766a0',
// 		position: 'Freier Mitarbeiter',
// 		access_level: 2,
// 	},
// 	{
// 		id: '362f98a8-7be4-4b48-88bf-5ca35e4ac80e',
// 		position: 'Mitarbeiter',
// 		access_level: 3,
// 	},
// 	{
// 		id: 'd55635b8-f203-4651-9a8a-8878044bc347',
// 		position: 'Verwaltung',
// 		access_level: 4,
// 	},
// ]

// if (user.position.access_level >= 5) {
// 	roleOptions.push({
// 		id: 'bc712fc8-ce4f-4427-b431-4942eaaedaa6',
// 		position: 'Verwaltung + Administration',
// 		access_level: 5,
// 	})
// }

const submit_enable = computed<boolean>(() => {
  if (
    modalStore.type === 'createUser' &&
    userFormData.firstname !== '' &&
    userFormData.firstname !== null &&
    userFormData.role !== null
  ) {
    return true;
  } else if (modalStore.type === 'editUser' && edit_formdata.first_name !== '') {
    return true;
  } else if (modalStore.type === 'editUserNotifications') {
    return true;
  } else if (modalStore.type === 'editUserRoles' && roles_formdata.role !== null) {
    return true;
  }

  return false;
});

function handleSubmit(event) {
  console.log('handle', submit_enable.value);
  if (modalStore.type === 'createUser' && submit_enable.value) {
    handleUserCreation(event);
  } else if (modalStore.type === 'editUser' && submit_enable.value) {
    onProfileEditSubmit(event);
  } else if (modalStore.type === 'editUserNotifications' && submit_enable.value) {
    onNotificationsEditSubmit(event);
  } else if (modalStore.type === 'editUserRoles' && submit_enable.value) {
    onRolesEditSubmit(event);
  }
}

definePageMeta({
  layout: false,
  middleware: [
    'auth',
    async function (to, from) {
      const { directus, readMe } = useCMS();
      const user = transformUser(await directus.request(readMe()));
      if (user.position.access_level < 4) {
        return navigateTo({
          path: '/ams',
        });
      }
    },
  ],
});

useHead({
  title: 'Administration',
});
</script>

<template>
  <NuxtLayout name="ams">
    <Test />
    <template #modalContent>
      <div v-if="modalStore.type === 'userCreationSuccess'">
        <h4>Daten:</h4>
        <table class="prose prose-invert">
          <tbody>
            <tr class="border-aris-400">
              <td>Vorname:</td>
              <td>{{ modalStore.data?.first_name }}</td>
            </tr>
            <tr v-if="modalStore.data?.last_name" class="border-aris-400">
              <td>Nachname:</td>
              <td>{{ modalStore.data?.last_name }}</td>
            </tr>
            <tr class="border-aris-400">
              <td>Position:</td>
              <td>{{ roleOptions.find((e) => e.id === modalStore.data?.position.id).position }}</td>
            </tr>
            <tr class="border-aris-400">
              <td>Benutzername(login):</td>
              <td>{{ modalStore.data?.login_email.replace('@ariscorp.de', '') }}</td>
            </tr>
            <tr class="border-aris-400">
              <td>Passwort:</td>
              <td>
                {{
                  userFormData.password !== null && userFormData.password !== ''
                    ? userFormData.password
                    : useSlugify(
                        userFormData.firstname.trim() + (userFormData.lastname && '.' + userFormData.lastname.trim()),
                        true,
                      )
                }}
              </td>
            </tr>
          </tbody>
        </table>
        <h4 class="text-danger">
          Wichtig: Der Benutzer ist <span class="italic text-red-400">noch nicht freigeschaltet</span>. Dies muss aus
          Sicherheitsgründen manuell erfolgen. Wähle ihn hierzu einfach in der Tabelle aus und klicke unter
          &quot;Optionen&quot; auf: &quot;Freischalten&quot;
        </h4>
        <div class="mx-auto mt-4">
          <ArisUFormGroup label="Benutzer Anmeldeinformationen schicken?" class="flex items-center gap-x-4">
            <UCheckbox v-model="userCreationSendCredentials" :disabled="modalStore.data.discord_id ? false : true" />
            <template #hint>
              <p>
                Wenn sie den Discord-Namen angegeben haben, können dem Benutzer automatisch per PN die
                Anmeldeinformationen zugeschickt werden.
              </p>
            </template>
          </ArisUFormGroup>
        </div>
        <div class="mx-auto mt-4">
          <ButtonDefault
            class="w-1/3"
            color="danger"
            @click="
              () => {
                modalStore.closeModal();
                resetUserFormData();

                if (userCreationSendCredentials) {
                  sendCredentials(modalStore.data);
                } else {
                  resetUserFormData();
                }
              }
            "
          >
            Schließen
          </ButtonDefault>
        </div>
      </div>
      <template v-if="modalStore.type === 'avatar-cropper'">
        <div>
          <p>
            <span class="text-industrial-400">Achtung: </span>Sobald der neue Avatar gespeichert wird, wird der alte
            gelöscht.
          </p>
          <div class="divide-y-2 divide-btertiary">
            <!-- <UCard> -->
            <div class="pb-4">
              <DefaultPanel class="mx-auto w-fit">
                <!-- <div class="relative"> -->
                <template v-if="avatarUploadLoading">
                  <div class="absolute top-0 bottom-0 left-0 right-0 m-auto w-fit h-fit z-[9999]">
                    <LoadingBasic class="w-10 h-10 text-white" />
                  </div>
                  <div
                    class="absolute top-0 bottom-0 left-0 right-0 m-auto w-full h-full z-[9997] bg-black opacity-75"
                  />
                </template>
                <VueCropper
                  ref="cropper"
                  class="overflow-hidden aspect-[270/320] w-[270px] h-[320px]"
                  :aspect-ratio="270 / 320"
                  :toggle-drag-mode-on-dblclick="false"
                  drag-mode="move"
                  :highlight="false"
                  :min-crop-box-width="270"
                  :min-crop-box-height="320"
                  :min-container-width="270"
                  :min-container-height="320"
                  :check-orientation="false"
                  :crop-box-resizable="false"
                />
                <!-- </div> -->
              </DefaultPanel>
            </div>
            <!-- <template #footer> -->
            <div class="flex flex-wrap justify-center w-full pt-4 my-auto gap-x-[5.5rem]">
              <ButtonDefault type="button" class="w-1/3" color="danger" @click="modalStore.closeModal">
                Schließen
              </ButtonDefault>
              <ButtonDefault class="w-1/3" color="success" @click="saveAvatar"> Speichern </ButtonDefault>
            </div>
            <!-- </template> -->
            <!-- </UCard> -->
          </div>
        </div>
      </template>
      <template v-if="modalStore.type === 'cred-change'">
        <div>
          <h3>ACHTUNG!</h3>
          <p>Du hast die Anmeldedaten geändert!</p>
          <p>Das Passwort und/oder der Anmeldename ist nun anders.</p>
          <p v-if="modalStore.data.username">
            Der neue Anmeldename ist nun: <code>&apos;{{ modalStore.data.username }}&apos;</code>
          </p>
          <p v-if="modalStore.data.password">
            Das neue Passwort ist nun: <code>&apos;{{ modalStore.data.password }}&apos;</code>
          </p>
        </div>
      </template>
      <template v-if="modalStore.type === 'deleteUsers'">
        Bist du dir sicher, dass du {{ modalStore.data.length > 1 ? 'folgende' : 'den folgenden' }} Benutzer löschen
        möchtest?
        <ul class="mx-auto w-fit">
          <li v-for="user in modalStore.data" :key="user.id">
            {{ user.full_name }}
          </li>
        </ul>
        <div class="mx-auto mt-4 space-x-4">
          <ButtonDefault class="w-1/3" color="danger" @click="submitDelete(modalStore.data)"> Löschen </ButtonDefault>
          <ButtonDefault class="w-1/3" color="success" @click="modalStore.closeModal"> Abbrechen </ButtonDefault>
        </div>
      </template>
    </template>
    <template #slideHeader>
      <span v-if="modalStore.type === 'createUser'">Neues Mitglied hinzufügen</span>
      <span v-else-if="modalStore.type === 'editUser'">Profil: {{ modalStore.data.full_name }}</span>
      <span v-else-if="modalStore.type === 'editUserNotifications'"
        >Mitteilungseinstellungen: {{ modalStore.data.full_name }}</span
      >
      <span v-else-if="modalStore.type === 'editUserRoles'"
        >Organisatorische Einstellungen: {{ modalStore.data.full_name }}</span
      >
    </template>
    <template #slideContent>
      <UForm
        v-if="modalStore.type === 'createUser'"
        ref="userCreationForm"
        class="h-full"
        :state="userFormData"
        :schema="userCreationSchema"
        validate-on="submit"
      >
        <!-- <UCard class="flex flex-col flex-1 h-screen scrollbar-gray-thin"> -->
        <!-- <template #header>
						<h2 class="my-0">
							<span>
								Neues Mitglied hinzufügen
								<UPopover mode="hover">
									<UButton
										icon="i-heroicons-information-circle"
										variant="inputInfo"
									/>
									<template #panel>
										<div class="p-1 text-xs text-left text-tbase/60 whitespace-break-spaces">
											<slot name="help" />
										</div>
									</template>
								</UPopover>
							</span>
						</h2>
					</template> -->
        <div class="flex w-full text-center">
          <UFormGroup class="mx-auto" name="customErrors" />
        </div>
        <div id="ship-edit-base" class="px-2">
          <TableHr><span class="flex items-center text-lg">Basisdaten</span></TableHr>
          <UFormGroup
            label="Vorname"
            name="firstname"
            required
            description="Vorname des Mitgliedes"
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <!-- TODO: Modellübergreifend einzigartig machen -->
            <UInput
              v-model="userFormData.firstname"
              :icon="userFormData.firstname ? 'i-heroicons-x-mark-16-solid' : ''"
              placeholder="Chris"
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
            <template v-if="userFormData.firstname">
              <button
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="userFormData.firstname = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
            </template>
          </UFormGroup>
          <UFormGroup
            label="Nachnamee"
            name="lastname"
            description="Nachname des Mitgliedes"
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <UInput
              v-model="userFormData.lastname"
              :icon="userFormData.lastname ? 'i-heroicons-x-mark-16-solid' : ''"
              placeholder="Roberts"
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
            <template v-if="userFormData.lastname">
              <button
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="userFormData.lastname = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
            </template>
          </UFormGroup>
          <UFormGroup
            label="Titel"
            name="title"
            description="Das Mitglied einen Hochschulausbildung hat, kannst du hier den Titel angeben"
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <USelectMenu
                v-model="userFormData.title"
                :options="titleOptions"
                :ui="
                  userFormData.title
                    ? {
                        leading: {
                          padding: {
                            xl: 'ps-10',
                          },
                        },
                      }
                    : { leading: { padding: { xl: 'hidden' } } }
                "
                :icon="userFormData.title ? 'i-heroicons-x-mark-16-solid' : ''"
                size="md"
              >
                <template v-if="userFormData.title" #leading />
                <template #label>
                  <span v-if="userFormData.title">{{ userFormData.title }}</span>
                  <span v-else>Kein Titel ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <span v-if="option">{{ option }}</span>
                  <span v-else>Kein Titel</span>
                </template>
              </USelectMenu>
              <template v-if="userFormData.title">
                <button class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit" @click="userFormData.title = ''">
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Passwort"
            name="password"
            description="Du kannst optional ein Passwort vergeben, mit dem sich das Mitglied das erste mal anmelden kann. Falls du kein Passwort angibst, wird ein Passwort generiert."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <UInput
              v-model="userFormData.password"
              :icon="userFormData.password ? 'i-heroicons-x-mark-16-solid' : ''"
              placeholder="********"
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
            <template v-if="userFormData.password">
              <button
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="userFormData.password = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
            </template>
          </UFormGroup>
          <UFormGroup
            label="Position"
            name="role"
            required
            description="Die Position des Mitgliedes"
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <USelectMenu
                v-model="userFormData.role"
                :options="roleOptions"
                :ui="
                  userFormData.role
                    ? {
                        leading: {
                          padding: {
                            xl: 'ps-10',
                          },
                        },
                      }
                    : { leading: { padding: { xl: 'hidden' } } }
                "
                :icon="userFormData.role ? 'i-heroicons-x-mark-16-solid' : ''"
                size="md"
              >
                <template v-if="userFormData.role" #leading />
                <template #label>
                  <span v-if="userFormData.role">{{ userFormData.role.position }}</span>
                  <span v-else>Keine Position ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <span v-if="option">{{ option.position }}</span>
                  <span v-else>Keine Position</span>
                </template>
              </USelectMenu>
              <template v-if="userFormData.role">
                <button class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit" @click="userFormData.role = ''">
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
            <template v-if="userFormData?.role?.id === 'bc712fc8-ce4f-4427-b431-4942eaaedaa6'" #help>
              <span class="text-danger">
                Achtung: Du hast die Administrator-Position ausgewählt. Dies bedeutet das jemand alle Daten der Website
                verändern kann!
              </span>
            </template>
          </UFormGroup>
          <TableHr><span class="flex items-center text-lg">Mitteilungen</span></TableHr>
          <UFormGroup
            label="Discord Benutzer"
            name="discord_user"
            description="Für das A.M.S. Benachrichtigungssystem (coming-soon) kannst du einen Discord Benutzer angeben. Auch die Anmeldeinformationen können automatisch an den Benutzer gesendet werden."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <USelectMenu
                v-model="userFormData.discord_user"
                :options="['', ...discordMembers]"
                option-attribute="name"
                searchable
                clear-search-on-close
                searchable-placeholder="Suche..."
                :search-attributes="['label', 'global_name', 'username', 'nick']"
                size="md"
                :ui="
                  userFormData.discord_user
                    ? {
                        leading: {
                          padding: {
                            xl: 'ps-10',
                          },
                        },
                      }
                    : { leading: { padding: { xl: 'hidden' } } }
                "
                :icon="userFormData.discord_user ? 'i-heroicons-x-mark-16-solid' : ''"
              >
                <template v-if="userFormData.discord_user" #leading />
                <template #label>
                  <span v-if="userFormData.discord_user">{{ userFormData.discord_user.label }}</span>
                  <span v-else class="text-[13.9px]">Kein Discord Benutzer ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <UAvatar v-if="option" :src="option.avatar.src" size="2xs" />
                  <span v-if="option">{{ option.label }}</span>
                  <span v-else>Kein Discord Benutzer</span>
                </template>
              </USelectMenu>
              <template v-if="userFormData.discord_user">
                <button
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="userFormData.discord_user = null"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
        </div>
        <!-- <template #footer> -->

        <!-- </template> -->
        <!-- </UCard> -->
      </UForm>
      <UForm
        v-else-if="modalStore.type === 'editUser'"
        ref="userEditForm"
        class="h-full"
        :state="edit_formdata"
        :schema="edit_schema"
        validate-on="submit"
      >
        <div class="divide-y divide-bsecondary space-y-6 *:pt-6 first:*:pt-2 mb-6">
          <UFormGroup
            label="Vorname"
            name="first_name"
            description="Hier kannst du einen oder mehrere Vornamen angeben."
            required
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <UInput v-model="edit_formdata.first_name" placeholder="Chris" size="md" autocomplete="off" />
          </UFormGroup>
          <UFormGroup
            label="Nachname"
            name="last_name"
            description="Hier kannst du einen Nachnamen angeben. Der Nachname ist optional."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.last_name"
                :icon="
                  edit_formdata.last_name || initialEditFormdata.last_name
                    ? edit_formdata.last_name === initialEditFormdata.last_name
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Roberts"
                size="md"
                autocomplete="off"
              />
              <template v-if="edit_formdata.last_name || initialEditFormdata.last_name">
                <button
                  v-if="edit_formdata.last_name === initialEditFormdata.last_name"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.last_name = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.last_name = initialEditFormdata.last_name"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Benutzername"
            name="username"
            description="Oben siehst du deinen neuen Login-Namen, und unten siehst du den Biografie-Link."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative space-y-2' }"
          >
            <UInput
              size="md"
              disabled
              autocomplete="off"
              :model-value="
                useSlugify(
                  edit_formdata.first_name.trim() +
                    (edit_formdata.last_name ? ' ' + edit_formdata.last_name.trim() : ''),
                  true,
                )
              "
              :ui="{ leading: { padding: { md: 'ps-16' } } }"
            >
              <template #leading>
                <span class="text-sm text-dark-gray">Login:</span>
              </template>
            </UInput>
            <UInput
              size="md"
              disabled
              autocomplete="off"
              :model-value="
                useSlugify(
                  edit_formdata.first_name.trim() +
                    (edit_formdata.last_name ? ' ' + edit_formdata.last_name.trim() : ''),
                )
              "
              :ui="{ leading: { padding: { md: 'ps-[11.5rem]' } } }"
            >
              <template #leading>
                <span class="text-sm text-dark-gray">ariscorp.de/biography/</span>
              </template>
            </UInput>
          </UFormGroup>
          <UFormGroup
            label="Titel"
            name="title"
            description="Falls du eine Hochschulausbildung hast, kannst du hier deinen Titel angeben. Der Titel ist optional."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <USelectMenu
                v-model="edit_formdata.title"
                :options="titleOptions"
                :ui="
                  edit_formdata.title || initialEditFormdata.title
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
                  edit_formdata.title || initialEditFormdata.title
                    ? edit_formdata.title === initialEditFormdata.title
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                size="md"
              >
                <template v-if="edit_formdata.title || initialEditFormdata.title" #leading />
                <template #label>
                  <span v-if="edit_formdata.title">{{ edit_formdata.title }}</span>
                  <span v-else>Kein Titel ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <span v-if="option">{{ option }}</span>
                  <span v-else>Kein Titel</span>
                </template>
              </USelectMenu>
              <template v-if="edit_formdata.title || initialEditFormdata.title">
                <button
                  v-if="edit_formdata.title === initialEditFormdata.title"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.title = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.title = initialEditFormdata.title"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Passwort"
            name="password"
            description="Hier kannst du dein Passwort ganz einfach ändern."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.password"
                size="md"
                autocomplete="off"
                :icon="edit_formdata.password !== null && 'i-heroicons-x-mark-16-solid'"
                placeholder="******"
                type="password"
              />
              <button
                v-if="edit_formdata.password !== null"
                type="button"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="edit_formdata.password = null"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Rollen"
            name="roles"
            description="Hier kannst du deine Rollen sehen. Du kannst mit der Verwaltung sprechen, falls du mehr oder weniger Rollen möchtest."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <UCheckbox
              :model-value="user.roles_value?.includes('recruitment') ? true : false"
              disabled
              label="Rekrutierung"
            />
            <UCheckbox
              :model-value="user.roles_value?.includes('marketing_and_press') ? true : false"
              disabled
              label="Marketing & Presse"
            />
            <UCheckbox
              :model-value="user.roles_value?.includes('content_writer') ? true : false"
              disabled
              label="Inhaltsersteller"
            />
          </UFormGroup>
          <UFormGroup
            label="Abteilungsposition"
            name="head_of_department"
            description="Hier kannst du sehen welche Position du in der Abteilung hast."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <URadioGroup
              v-model="edit_formdata.head_of_department"
              disabled
              :options="[
                {
                  value: true,
                  label: 'Abteilungsleiter',
                },
                {
                  value: false,
                  label: 'Abteilungsmitarbeiter',
                },
              ]"
            />
          </UFormGroup>
          <UFormGroup
            label="Abteilung"
            name="department"
            description="Hier kannst du sehen ob du Abteilungsleiter bist."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <USelectMenu
                v-model="edit_formdata.department"
                :options="['', ...departments]"
                option-attribute="name"
                searchable
                clear-search-on-close
                searchable-placeholder="Suche..."
                :search-attributes="['name']"
                :ui="
                  edit_formdata.department || initialEditFormdata.department
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
                  edit_formdata.department || initialEditFormdata.department
                    ? edit_formdata.department === initialEditFormdata.department
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                size="md"
              >
                <template v-if="edit_formdata.department || initialEditFormdata.department" #leading />
                <template #label>
                  <span v-if="edit_formdata.department">{{ edit_formdata.department.name }}</span>
                  <span v-else class="text-[13.9px]">Keine Abteilung ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <span v-if="option">{{ option.name }}</span>
                  <span v-else>Keine Abteilung</span>
                </template>
              </USelectMenu>
              <template v-if="edit_formdata.department || initialEditFormdata.department">
                <button
                  v-if="edit_formdata.department === initialEditFormdata.department"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.department = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.department = initialEditFormdata.department"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="RSI Handle"
            name="rsi_handle"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.rsi_handle"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.rsi_handle || initialEditFormdata.rsi_handle
                    ? edit_formdata.rsi_handle === initialEditFormdata.rsi_handle
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="chris_roberts"
              />
              <template v-if="edit_formdata.rsi_handle || initialEditFormdata.rsi_handle">
                <button
                  v-if="edit_formdata.rsi_handle === initialEditFormdata.rsi_handle"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.rsi_handle = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.rsi_handle = initialEditFormdata.rsi_handle"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div>
                <p class="p-0 font-semibold dark:text-white">Grundlegende Informationen</p>
                <p class="p-0 mt-1 text-sm text-tbase/50">
                  Hier kannst du grundlegende Informationen über deinen Charakter angeben.
                </p>
              </div>
            </div>
          </div>
          <UFormGroup
            label="Geschlecht"
            name="sex"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <URadioGroup
              v-model="edit_formdata.sex"
              :options="[
                { label: 'Männlich', value: 'male' },
                { label: 'Weiblich', value: 'female' },
              ]"
            />
          </UFormGroup>
          <UFormGroup
            label="Aktueller Wohnort"
            name="current_residence"
            description="Hier kannst du sehen ob du Abteilungsleiter bist."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <USelectMenu
                v-model="edit_formdata.current_residence"
                :options="['', ...landing_zones]"
                option-attribute="name"
                searchable
                clear-search-on-close
                searchable-placeholder="Suche..."
                :search-attributes="['name']"
                :icon="
                  edit_formdata.current_residence || initialEditFormdata.current_residence
                    ? edit_formdata.current_residence === initialEditFormdata.current_residence
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                size="md"
              >
                <template v-if="edit_formdata.current_residence || initialEditFormdata.current_residence" #leading />
                <template #label>
                  <span v-if="edit_formdata.current_residence">{{
                    edit_formdata.current_residence.path_label || edit_formdata.current_residence.name
                  }}</span>
                  <span v-else class="text-[13.9px]">Keine Landezone ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <span v-if="option">{{ option.path_label || option.name }}</span>
                  <span v-else>Keine Landezone</span>
                </template>
              </USelectMenu>
              <template v-if="edit_formdata.current_residence || initialEditFormdata.current_residence">
                <button
                  v-if="edit_formdata.current_residence === initialEditFormdata.current_residence"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.current_residence = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.current_residence = initialEditFormdata.current_residence"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Geburtsdatum"
            name="birthdate"
            description="TBD"
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative flex pb-4 gap-x-4' }"
          >
            <div class="w-1/3">
              <USelectMenu
                v-model="edit_birthdate_day"
                placeholder="Tag"
                :options="Array.from({ length: 31 }, (_, index) => (index + 1).toString().padStart(2, '0'))"
                size="md"
              />
            </div>
            <div class="w-1/3">
              <USelectMenu
                v-model="edit_birthdate_month"
                placeholder="Monat"
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
                size="md"
              />
            </div>
            <UInput
              v-model="edit_birthdate_year"
              class="w-1/3"
              placeholder="Jahr"
              inputmode="numeric"
              :ui="{ placeholder: 'text-center' }"
              size="md"
            />
            <div class="absolute bottom-0 right-0 text-xs italic text-light-gray w-fit">
              <span>Alter: {{ $dayjs().add(930, 'years').diff(edit_formdata.birthdate, 'year') }} Jahre</span>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Geburtsort"
            name="birthplace"
            description="Hier kannst du sehen ob du Abteilungsleiter bist."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <USelectMenu
                v-model="edit_formdata.birthplace"
                :options="['', ...landing_zones]"
                option-attribute="name"
                searchable
                clear-search-on-close
                searchable-placeholder="Suche..."
                :search-attributes="['name']"
                :icon="
                  edit_formdata.birthplace || initialEditFormdata.birthplace
                    ? edit_formdata.birthplace === initialEditFormdata.birthplace
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                size="md"
              >
                <template v-if="edit_formdata.birthplace || initialEditFormdata.birthplace" #leading />
                <template #label>
                  <span v-if="edit_formdata.birthplace">{{
                    edit_formdata.birthplace.path_label || edit_formdata.birthplace.name
                  }}</span>
                  <span v-else class="text-[13.9px]">Keine Landezone ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <span v-if="option">{{ option.path_label || option.name }}</span>
                  <span v-else>Keine Landezone</span>
                </template>
              </USelectMenu>
              <template v-if="edit_formdata.birthplace || initialEditFormdata.birthplace">
                <button
                  v-if="edit_formdata.birthplace === initialEditFormdata.birthplace"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.birthplace = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.birthplace = initialEditFormdata.birthplace"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Haarfarbe"
            name="hair_color"
            description="Hier kannst du deinen RSI Handle angeben."
            class="grid items-center gap-2 md:grid-cols-2"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.hair_color"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.hair_color || initialEditFormdata.hair_color
                    ? edit_formdata.hair_color === initialEditFormdata.hair_color
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Schwarz"
              />
              <template v-if="edit_formdata.hair_color || initialEditFormdata.hair_color">
                <button
                  v-if="edit_formdata.hair_color === initialEditFormdata.hair_color"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.hair_color = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.hair_color = initialEditFormdata.hair_color"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Augenfarbe"
            name="eye_color"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.eye_color"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.eye_color || initialEditFormdata.eye_color
                    ? edit_formdata.eye_color === initialEditFormdata.eye_color
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Blau / Grün"
              />
              <template v-if="edit_formdata.eye_color || initialEditFormdata.eye_color">
                <button
                  v-if="edit_formdata.eye_color === initialEditFormdata.eye_color"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.eye_color = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.eye_color = initialEditFormdata.eye_color"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Gewicht"
            name="weight"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.weight"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.weight || initialEditFormdata.weight
                    ? edit_formdata.weight === initialEditFormdata.weight
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                trailing-icon="i-mdi-weight-kilogram"
                placeholder="82"
                inputmode="numeric"
              />
              <template v-if="edit_formdata.weight || initialEditFormdata.weight">
                <button
                  v-if="edit_formdata.weight === initialEditFormdata.weight"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.weight = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.weight = initialEditFormdata.weight"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Größe"
            name="height"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.height"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.height || initialEditFormdata.height
                    ? edit_formdata.height === initialEditFormdata.height
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                trailing-icon="i-mdi-human-male-height"
                placeholder="192"
                inputmode="numeric"
              />
              <template v-if="edit_formdata.height || initialEditFormdata.height">
                <button
                  v-if="edit_formdata.height === initialEditFormdata.height"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.height = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.height = initialEditFormdata.height"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div>
                <p class="p-0 font-semibold dark:text-white">Bürgerstatus</p>
                <p class="p-0 mt-1 text-sm text-tbase/50">Nun geht es um deinen Bürgerstatus.</p>
              </div>
            </div>
          </div>
          <UFormGroup
            label="Bürgerstatus"
            name="citizen"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <URadioGroup
              v-model="edit_formdata.citizen"
              :options="[
                { label: 'Bürger', value: true },
                { label: 'Zivilist', value: false },
              ]"
            />
          </UFormGroup>
          <Transition
            enter-active-class="transition-all duration-300 overflow-clip"
            leave-active-class="transition-all duration-300 overflow-clip"
            enter-from-class="h-0"
            enter-to-class="h-[85px]"
            leave-from-class="h-[85px]"
            leave-to-class="h-0"
          >
            <UFormGroup
              v-if="edit_formdata.citizen"
              label="Bürgerstatus - Begründung"
              name="citizen_reason"
              description="Hier kannst du deinen RSI Handle angeben."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <URadioGroup
                v-model="edit_formdata.citizen_reason"
                :options="[
                  { label: 'Militärischer Dienst', value: 'military' },
                  { label: 'Besondere Bildung', value: 'special_education' },
                  { label: 'Soziales Engagement', value: 'social_commitment' },
                ]"
              />
            </UFormGroup>
          </Transition>
          <UFormGroup
            label="Was trifft zu?"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <UFormGroup name="military" class="items-center" :ui="{ container: 'relative' }">
              <UCheckbox
                v-model="edit_formdata.duty_state"
                :disabled="edit_formdata.citizen_reason === 'military'"
                label="Militärischer Dienst"
                name="military"
              />
            </UFormGroup>
            <UFormGroup name="special_education" class="items-center" :ui="{ container: 'relative' }">
              <UCheckbox
                v-model="edit_formdata.education_state"
                :disabled="edit_formdata.citizen_reason === 'special_education'"
                label="Besondere Bildung"
                name="special_education"
              />
            </UFormGroup>
            <UFormGroup name="social_commitment" class="items-center" :ui="{ container: 'relative' }">
              <UCheckbox
                v-model="edit_formdata.social_state"
                :disabled="edit_formdata.citizen_reason === 'social_commitment'"
                label="Soziales Engagement"
                name="social_commitment"
              />
            </UFormGroup>
          </UFormGroup>
          <Transition
            enter-active-class="transition-all duration-300 overflow-clip"
            leave-active-class="transition-all duration-300 overflow-clip"
            enter-from-class="h-0"
            enter-to-class="h-[402px] md:h-[289px]"
            leave-from-class="h-[402px] md:h-[289px]"
            leave-to-class="h-0"
          >
            <div v-if="edit_formdata.duty_state" class="divide-y divide-bsecondary space-y-6 *:pt-6 first:*:pt-0 mb-6">
              <UFormGroup
                :required="edit_formdata.duty_period"
                label="Dienstzeitraum"
                description="Hier kannst du deinen RSI Handle angeben."
                class="items-center grid-cols-2 gap-2 md:grid"
                :ui="{ container: 'relative' }"
              >
                <div class="relative">
                  <UInput
                    v-model="edit_formdata.duty_period"
                    size="md"
                    placeholder="01/2940 - 12/2950"
                    :icon="
                      edit_formdata.duty_period || initialEditFormdata.duty_period
                        ? edit_formdata.duty_period === initialEditFormdata.duty_period
                          ? 'i-heroicons-x-mark-16-solid'
                          : 'i-heroicons-arrow-uturn-left'
                        : ''
                    "
                  />
                  <template v-if="edit_formdata.duty_period || initialEditFormdata.duty_period">
                    <button
                      v-if="edit_formdata.duty_period === initialEditFormdata.duty_period"
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      @click="edit_formdata.duty_period = ''"
                    >
                      <UIcon
                        name="i-heroicons-x-mark-16-solid"
                        class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                    <button
                      v-else
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      @click="edit_formdata.duty_period = initialEditFormdata.duty_period"
                    >
                      <UIcon
                        name="i-heroicons-arrow-uturn-left"
                        class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                  </template>
                </div>
              </UFormGroup>
              <UFormGroup
                :required="edit_formdata.duty_period"
                label="Dienstende"
                name="duty_end"
                description="Hier kannst du deinen RSI Handle angeben."
                class="items-center grid-cols-2 gap-2 md:grid"
                :ui="{ container: 'relative' }"
              >
                <URadioGroup
                  v-model="edit_formdata.duty_end"
                  :options="[
                    {
                      label: 'Ehrenhaft beendet',
                      value: 'honorable',
                    },
                    {
                      label: 'Unehrenhaft beendet',
                      value: 'dishonorable',
                    },
                  ]"
                />
              </UFormGroup>
              <UFormGroup
                :required="edit_formdata.duty_state"
                label="Division"
                name="duty_division"
                description="Hier kannst du deinen RSI Handle angeben."
                class="items-center grid-cols-2 gap-2 md:grid"
                :ui="{ container: 'relative' }"
              >
                <div class="relative">
                  <USelectMenu
                    v-model="edit_formdata.duty_division"
                    :options="[
                      '',
                      { name: 'UEE Army', value: 'army' },
                      { name: 'UEE Marine', value: 'marines' },
                      { name: 'UEE Navy', value: 'navy' },
                    ]"
                    size="md"
                    :icon="
                      edit_formdata.duty_division || initialEditFormdata.duty_division
                        ? edit_formdata.duty_division === initialEditFormdata.duty_division
                          ? 'i-heroicons-x-mark-16-solid'
                          : 'i-heroicons-arrow-uturn-left'
                        : ''
                    "
                    value-attribute="value"
                  >
                    <template #label>
                      <span v-if="edit_formdata.duty_division">{{
                        [
                          { name: 'UEE Army', value: 'army' },
                          { name: 'UEE Marine', value: 'marines' },
                          { name: 'UEE Navy', value: 'navy' },
                        ].find((e) => edit_formdata.duty_division === e.value)?.name
                      }}</span>
                      <span v-else>Keine Division ausgewählt</span>
                    </template>
                    <template #option="{ option }">
                      <span v-if="option.name">{{ option.name }}</span>
                      <span v-else>Keine Division</span>
                    </template>
                  </USelectMenu>
                  <template v-if="edit_formdata.duty_division || initialEditFormdata.duty_division">
                    <button
                      v-if="edit_formdata.duty_division === initialEditFormdata.duty_division"
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      @click="edit_formdata.duty_division = ''"
                    >
                      <UIcon
                        name="i-heroicons-x-mark-16-solid"
                        class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                    <button
                      v-else
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      @click="edit_formdata.duty_division = initialEditFormdata.duty_division"
                    >
                      <UIcon
                        name="i-heroicons-arrow-uturn-left"
                        class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                  </template>
                </div>
              </UFormGroup>
            </div>
          </Transition>
          <Transition
            enter-active-class="transition-all duration-300 overflow-clip"
            leave-active-class="transition-all duration-300 overflow-clip"
            enter-from-class="h-0"
            enter-to-class="h-[402px] md:h-[289px]"
            leave-from-class="h-[402px] md:h-[289px]"
            leave-to-class="h-0"
          >
            <div
              v-if="edit_formdata.education_state"
              class="divide-y divide-bsecondary space-y-6 *:pt-6 first:*:pt-0 mb-6"
            >
              <UFormGroup
                :required="edit_formdata.education_name"
                label="Ausbildung"
                description="Hier kannst du deinen RSI Handle angeben."
                class="items-center grid-cols-2 gap-2 md:grid"
                :ui="{ container: 'relative' }"
              >
                <div class="relative">
                  <UInput
                    v-model="edit_formdata.education_name"
                    size="md"
                    placeholder="Medizinisches Studium"
                    :icon="
                      edit_formdata.education_name || initialEditFormdata.education_name
                        ? edit_formdata.education_name === initialEditFormdata.education_name
                          ? 'i-heroicons-x-mark-16-solid'
                          : 'i-heroicons-arrow-uturn-left'
                        : ''
                    "
                  />
                  <template v-if="edit_formdata.education_name || initialEditFormdata.education_name">
                    <button
                      v-if="edit_formdata.education_name === initialEditFormdata.education_name"
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      @click="edit_formdata.education_name = ''"
                    >
                      <UIcon
                        name="i-heroicons-x-mark-16-solid"
                        class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                    <button
                      v-else
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      @click="edit_formdata.education_name = initialEditFormdata.education_name"
                    >
                      <UIcon
                        name="i-heroicons-arrow-uturn-left"
                        class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                  </template>
                </div>
              </UFormGroup>
              <UFormGroup
                :required="edit_formdata.education_period"
                label="Dienstzeitraum"
                description="Hier kannst du deinen RSI Handle angeben."
                class="items-center grid-cols-2 gap-2 md:grid"
                :ui="{ container: 'relative' }"
              >
                <div class="relative">
                  <UInput
                    v-model="edit_formdata.education_period"
                    size="md"
                    placeholder="01/2940 - 12/2950"
                    :icon="
                      edit_formdata.education_period || initialEditFormdata.education_period
                        ? edit_formdata.education_period === initialEditFormdata.education_period
                          ? 'i-heroicons-x-mark-16-solid'
                          : 'i-heroicons-arrow-uturn-left'
                        : ''
                    "
                  />
                  <template v-if="edit_formdata.education_period || initialEditFormdata.education_period">
                    <button
                      v-if="edit_formdata.education_period === initialEditFormdata.education_period"
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      @click="edit_formdata.education_period = ''"
                    >
                      <UIcon
                        name="i-heroicons-x-mark-16-solid"
                        class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                    <button
                      v-else
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      @click="edit_formdata.education_period = initialEditFormdata.education_period"
                    >
                      <UIcon
                        name="i-heroicons-arrow-uturn-left"
                        class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                  </template>
                </div>
              </UFormGroup>
              <UFormGroup
                :required="edit_formdata.education_state"
                label="Hochschule"
                name="duty_division"
                description="Hier kannst du deinen RSI Handle angeben."
                class="items-center grid-cols-2 gap-2 md:grid"
                :ui="{ container: 'relative' }"
              >
                <div class="relative">
                  <USelectMenu
                    v-model="edit_formdata.education_place"
                    :options="[
                      '',
                      { name: 'PLACEHOLDER', value: null },
                      { name: 'PLACEHOLDER', value: null },
                      { name: 'PLACEHOLDER', value: null },
                    ]"
                    size="md"
                    :icon="
                      edit_formdata.education_place || initialEditFormdata.education_place
                        ? edit_formdata.education_place === initialEditFormdata.education_place
                          ? 'i-heroicons-x-mark-16-solid'
                          : 'i-heroicons-arrow-uturn-left'
                        : ''
                    "
                  >
                    <template #label>
                      <span v-if="edit_formdata.education_place">{{ edit_formdata.education_place?.name }}</span>
                      <span v-else>Keine Division ausgewählt</span>
                    </template>
                    <template #option="{ option }">
                      <span v-if="option.name">{{ option.name }}</span>
                      <span v-else>Keine Division</span>
                    </template>
                  </USelectMenu>
                  <template v-if="edit_formdata.education_place || initialEditFormdata.education_place">
                    <button
                      v-if="edit_formdata.education_place === initialEditFormdata.education_place"
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      @click="edit_formdata.education_place = ''"
                    >
                      <UIcon
                        name="i-heroicons-x-mark-16-solid"
                        class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                    <button
                      v-else
                      class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                      @click="edit_formdata.duty_diveducation_placeision = initialEditFormdata.education_place"
                    >
                      <UIcon
                        name="i-heroicons-arrow-uturn-left"
                        class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                      />
                    </button>
                  </template>
                </div>
              </UFormGroup>
            </div>
          </Transition>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div>
                <p class="p-0 font-semibold dark:text-white">Geschmäcker</p>
                <p class="p-0 mt-1 text-sm text-tbase/50">Nun geht es um deinen Bürgerstatus.</p>
              </div>
            </div>
          </div>
          <UFormGroup
            label="Hobbies"
            name="hobbies"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.hobbies"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.hobbies || initialEditFormdata.hobbies
                    ? edit_formdata.hobbies === initialEditFormdata.hobbies
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Sport, Fliegen, Schrauben, ..."
              />
              <template v-if="edit_formdata.hobbies || initialEditFormdata.hobbies">
                <button
                  v-if="edit_formdata.hobbies === initialEditFormdata.hobbies"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.hobbies = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.hobbies = initialEditFormdata.hobbies"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Freizeitgestaltung"
            name="activities"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.activities"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.activities || initialEditFormdata.activities
                    ? edit_formdata.activities === initialEditFormdata.activities
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Fischen, Kochen, ..."
              />
              <template v-if="edit_formdata.activities || initialEditFormdata.activities">
                <button
                  v-if="edit_formdata.activities === initialEditFormdata.activities"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.activities = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.activities = initialEditFormdata.activities"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Talente"
            name="talents"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.talents"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.talents || initialEditFormdata.talents
                    ? edit_formdata.talents === initialEditFormdata.talents
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Spricht Sprache X, Handwerklich begabt, ..."
              />
              <template v-if="edit_formdata.talents || initialEditFormdata.talents">
                <button
                  v-if="edit_formdata.talents === initialEditFormdata.talents"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.talents = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.talents = initialEditFormdata.talents"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Angewohnheiten"
            name="habits"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.habits"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.habits || initialEditFormdata.habits
                    ? edit_formdata.habits === initialEditFormdata.habits
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Überspielt Unsicherheit mit Humor, ..."
              />
              <template v-if="edit_formdata.habits || initialEditFormdata.habits">
                <button
                  v-if="edit_formdata.habits === initialEditFormdata.habits"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.habits = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.habits = initialEditFormdata.habits"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Tics & Marotten"
            name="tics"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.tics"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.tics || initialEditFormdata.tics
                    ? edit_formdata.tics === initialEditFormdata.tics
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Hat fragwürdigen Humor, ..."
              />
              <template v-if="edit_formdata.tics || initialEditFormdata.tics">
                <button
                  v-if="edit_formdata.tics === initialEditFormdata.tics"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.tics = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.tics = initialEditFormdata.tics"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Ängste"
            name="fears"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.fears"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.fears || initialEditFormdata.fears
                    ? edit_formdata.fears === initialEditFormdata.fears
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Hat fragwürdigen Humor, ..."
              />
              <template v-if="edit_formdata.fears || initialEditFormdata.fears">
                <button
                  v-if="edit_formdata.fears === initialEditFormdata.fears"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.fears = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.fears = initialEditFormdata.fears"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Hervorstechender Charakterzug"
            name="character"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.character"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.character || initialEditFormdata.character
                    ? edit_formdata.character === initialEditFormdata.character
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Ist sehr loyal, ..."
              />
              <template v-if="edit_formdata.character || initialEditFormdata.character">
                <button
                  v-if="edit_formdata.character === initialEditFormdata.character"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.character = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.character = initialEditFormdata.character"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Rästelhafte Züge"
            name="mysterious"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.mysterious"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.mysterious || initialEditFormdata.mysterious
                    ? edit_formdata.mysterious === initialEditFormdata.mysterious
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Spricht ungern über Ereignis X, ..."
              />
              <template v-if="edit_formdata.mysterious || initialEditFormdata.mysterious">
                <button
                  v-if="edit_formdata.mysterious === initialEditFormdata.mysterious"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.mysterious = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.mysterious = initialEditFormdata.mysterious"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Musik"
            name="music"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.music"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.music || initialEditFormdata.music
                    ? edit_formdata.music === initialEditFormdata.music
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Rock Musik, EDM, Metal, ..."
              />
              <template v-if="edit_formdata.music || initialEditFormdata.music">
                <button
                  v-if="edit_formdata.music === initialEditFormdata.music"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.music = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.music = initialEditFormdata.music"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Filme"
            name="movies"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.movies"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.movies || initialEditFormdata.movies
                    ? edit_formdata.movies === initialEditFormdata.movies
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Star Trek, Star Wars, ..."
              />
              <template v-if="edit_formdata.movies || initialEditFormdata.movies">
                <button
                  v-if="edit_formdata.movies === initialEditFormdata.movies"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.movies = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.movies = initialEditFormdata.movies"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Bücher"
            name="books"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.books"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.books || initialEditFormdata.books
                    ? edit_formdata.books === initialEditFormdata.books
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Broschüren von Hersteller X, ..."
              />
              <template v-if="edit_formdata.books || initialEditFormdata.books">
                <button
                  v-if="edit_formdata.books === initialEditFormdata.books"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.books = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.books = initialEditFormdata.books"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Kleidung"
            name="clothing"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.clothing"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.clothing || initialEditFormdata.clothing
                    ? edit_formdata.clothing === initialEditFormdata.clothing
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Lederjacken, ..."
              />
              <template v-if="edit_formdata.clothing || initialEditFormdata.clothing">
                <button
                  v-if="edit_formdata.clothing === initialEditFormdata.clothing"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.clothing = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.clothing = initialEditFormdata.clothing"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Speisen"
            name="food"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.food"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.food || initialEditFormdata.food
                    ? edit_formdata.food === initialEditFormdata.food
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Big Bennys Nudeln, ..."
              />
              <template v-if="edit_formdata.food || initialEditFormdata.food">
                <button
                  v-if="edit_formdata.food === initialEditFormdata.food"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.food = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.food = initialEditFormdata.food"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Getränke"
            name="drink"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.drink"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.drink || initialEditFormdata.drink
                    ? edit_formdata.drink === initialEditFormdata.drink
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Vestal Wasser, ..."
              />
              <template v-if="edit_formdata.drink || initialEditFormdata.drink">
                <button
                  v-if="edit_formdata.drink === initialEditFormdata.drink"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.drink = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.drink = initialEditFormdata.drink"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Alkohol"
            name="alcohol"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.alcohol"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.alcohol || initialEditFormdata.alcohol
                    ? edit_formdata.alcohol === initialEditFormdata.alcohol
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Schmolz Bier, ..."
              />
              <template v-if="edit_formdata.alcohol || initialEditFormdata.alcohol">
                <button
                  v-if="edit_formdata.alcohol === initialEditFormdata.alcohol"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.alcohol = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.alcohol = initialEditFormdata.alcohol"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Farben"
            name="colors"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.colors"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.colors || initialEditFormdata.colors
                    ? edit_formdata.colors === initialEditFormdata.colors
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Schwarz, Blau, ..."
              />
              <template v-if="edit_formdata.colors || initialEditFormdata.colors">
                <button
                  v-if="edit_formdata.colors === initialEditFormdata.colors"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.colors = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.colors = initialEditFormdata.colors"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            :label="edit_formdata.sex === 'female' ? 'Sie' : 'Er' + ' liebt...'"
            name="loves"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.loves"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.loves || initialEditFormdata.loves
                    ? edit_formdata.loves === initialEditFormdata.loves
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Hochwertige Schiffe, ..."
              />
              <template v-if="edit_formdata.loves || initialEditFormdata.loves">
                <button
                  v-if="edit_formdata.loves === initialEditFormdata.loves"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.loves = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.loves = initialEditFormdata.loves"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            :label="edit_formdata.sex === 'female' ? 'Sie' : 'Er' + ' hasst...'"
            name="hates"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="edit_formdata.hates"
                size="md"
                autocomplete="off"
                :icon="
                  edit_formdata.hates || initialEditFormdata.hates
                    ? edit_formdata.hates === initialEditFormdata.hates
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="Drake, ..."
              />
              <template v-if="edit_formdata.hates || initialEditFormdata.hates">
                <button
                  v-if="edit_formdata.hates === initialEditFormdata.hates"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.hates = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="edit_formdata.hates = initialEditFormdata.hates"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Medizinisch Relevantes"
            name="medical_informations"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <UTextarea
              v-model="edit_formdata.medical_informations"
              name="medical_informations"
              resize
              :rows="8"
              :placeholder="'- Rechte Hand große Narbe verursacht durch eine Piratenklinge \n- Linke Ohrmuschel nicht vorhanden durch einen schlimmen Rennsport-Unfall'"
            />
          </UFormGroup>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div>
                <p class="p-0 font-semibold dark:text-white">Biografie</p>
                <p class="p-0 mt-1 text-sm text-tbase/50">Hier kannst du eine ausführliche Biografie schreiben.</p>
              </div>
            </div>
          </div>
          <div>
            <Editor v-model="edit_formdata.biography" />
          </div>
        </div>
      </UForm>
      <UForm
        v-else-if="modalStore.type === 'editUserNotifications'"
        ref="userNotificationsEditForm"
        class="h-full"
        :state="noti_formdata"
        :schema="noti_schema"
        validate-on="submit"
      >
        <div class="divide-y divide-bsecondary space-y-6 *:pt-6 first:*:pt-2 mb-6">
          <UFormGroup
            label="Kontakt Email"
            name="contact_email"
            description="Für das A.M.S. Benachrichtigungssystem (coming-soon) kannst du eine Kontakt Email angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <UInput
                v-model="noti_formdata.contact_email"
                size="md"
                autocomplete="off"
                :icon="
                  noti_formdata.contact_email || initialNotificationsEditFormdata.contact_email
                    ? noti_formdata.contact_email === initialNotificationsEditFormdata.contact_email
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                placeholder="contact@email.com"
              />
              <template v-if="noti_formdata.contact_email || initialNotificationsEditFormdata.contact_email">
                <button
                  v-if="noti_formdata.contact_email === initialNotificationsEditFormdata.contact_email"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="noti_formdata.contact_email = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="noti_formdata.contact_email = initialNotificationsEditFormdata.contact_email"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Discord Benutzer"
            name="discord_user"
            description="Für das A.M.S. Benachrichtigungssystem (coming-soon) kannst du einen Discord Benutzer angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <USelectMenu
                v-model="noti_formdata.discord_user"
                :options="['', ...discordMembers]"
                option-attribute="name"
                searchable
                clear-search-on-close
                searchable-placeholder="Suche..."
                :search-attributes="['label', 'global_name', 'username', 'nick']"
                size="md"
                :ui="
                  noti_formdata.discord_user || initialNotificationsEditFormdata.discord_user
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
                  noti_formdata.discord_user || initialNotificationsEditFormdata.discord_user
                    ? noti_formdata.discord_user === initialNotificationsEditFormdata.discord_user
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
              >
                <template v-if="noti_formdata.discord_user || initialNotificationsEditFormdata.discord_user" #leading />
                <template #label>
                  <span v-if="noti_formdata.discord_user">{{ noti_formdata.discord_user.label }}</span>
                  <span v-else class="text-[13.9px]">Kein Discord Benutzer ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <UAvatar v-if="option" :src="option.avatar.src" size="2xs" />
                  <span v-if="option">{{ option.label }}</span>
                  <span v-else>Kein Discord Benutzer</span>
                </template>
              </USelectMenu>
              <template v-if="noti_formdata.discord_user || initialNotificationsEditFormdata.discord_user">
                <button
                  v-if="noti_formdata.discord_user === initialNotificationsEditFormdata.discord_user"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="noti_formdata.discord_user = null"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="noti_formdata.discord_user = initialNotificationsEditFormdata.discord_user"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Discord ID"
            name="discord_id"
            description="Hier ist deine Discord ID. Diese wird generiert sobald du einen Benutzernamen angibst und speicherst."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <UInput
              size="md"
              disabled
              autocomplete="off"
              trailing
              placeholder="xxxxxxxxxxxxx"
              :model-value="noti_discord_id"
              :ui="{ leading: { padding: { md: 'ps-24' } } }"
            >
              <template #leading>
                <span class="text-sm text-dark-gray">Discord-ID:</span>
              </template>
            </UInput>
          </UFormGroup>
        </div>
      </UForm>
      <UForm
        v-else-if="modalStore.type === 'editUserRoles'"
        ref="userRolesEditForm"
        class="h-full"
        :state="roles_formdata"
        :schema="roles_schema"
        validate-on="submit"
      >
        <div class="divide-y divide-bsecondary space-y-6 *:pt-6 first:*:pt-2 mb-6">
          <UFormGroup
            label="Abteilungsposition"
            name="head_of_department"
            description="Hier kannst du sehen welche Position du in der Abteilung hast."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <URadioGroup
              v-model="roles_formdata.head_of_department"
              :options="[
                {
                  value: true,
                  label: 'Abteilungsleiter',
                },
                {
                  value: false,
                  label: 'Abteilungsmitarbeiter',
                },
              ]"
            />
          </UFormGroup>
          <UFormGroup
            label="Abteilung"
            name="department"
            description="Hier kannst du sehen ob du Abteilungsleiter bist."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <USelectMenu
                v-model="roles_formdata.department"
                :options="['', ...departments]"
                option-attribute="name"
                searchable
                clear-search-on-close
                searchable-placeholder="Suche..."
                :search-attributes="['name']"
                :ui="
                  roles_formdata.department || initialRolesEditFormdata.department
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
                  roles_formdata.department || initialRolesEditFormdata.department
                    ? roles_formdata.department === initialRolesEditFormdata.department
                      ? 'i-heroicons-x-mark-16-solid'
                      : 'i-heroicons-arrow-uturn-left'
                    : ''
                "
                size="md"
              >
                <template v-if="roles_formdata.department || initialRolesEditFormdata.department" #leading />
                <template #label>
                  <span v-if="roles_formdata.department">{{ roles_formdata.department.name }}</span>
                  <span v-else class="text-[13.9px]">Keine Abteilung ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <span v-if="option">{{ option.name }}</span>
                  <span v-else>Keine Abteilung</span>
                </template>
              </USelectMenu>
              <template v-if="roles_formdata.department || initialRolesEditFormdata.department">
                <button
                  v-if="roles_formdata.department === initialRolesEditFormdata.department"
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="roles_formdata.department = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
                <button
                  v-else
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="roles_formdata.department = initialRolesEditFormdata.department"
                >
                  <UIcon
                    name="i-heroicons-arrow-uturn-left"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
          </UFormGroup>
          <UFormGroup
            label="Rollen"
            description="Hier kannst du deine Rollen sehen. Du kannst mit der Verwaltung sprechen, falls du mehr oder weniger Rollen möchtest."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <UFormGroup>
              <UCheckbox v-model="roles_values_recruitment" name="recruitment" label="Rekrutierung" />
            </UFormGroup>
            <UFormGroup>
              <UCheckbox
                v-model="roles_values_marketing_and_press"
                name="marketing_and_press"
                label="Marketing & Presse"
              />
            </UFormGroup>
            <UFormGroup>
              <UCheckbox v-model="roles_values_content_writer" name="content_writer" label="Inhaltsersteller" />
            </UFormGroup>
          </UFormGroup>
          <UFormGroup
            label="Position"
            name="role"
            required
            description="Die Position des Mitgliedes"
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <div class="relative">
              <USelectMenu
                v-model="roles_formdata.role"
                :options="roleOptions"
                :ui="
                  roles_formdata.role
                    ? {
                        leading: {
                          padding: {
                            xl: 'ps-10',
                          },
                        },
                      }
                    : { leading: { padding: { xl: 'hidden' } } }
                "
                :icon="roles_formdata.role ? 'i-heroicons-x-mark-16-solid' : ''"
                size="md"
              >
                <template v-if="roles_formdata.role" #leading />
                <template #label>
                  <span v-if="roles_formdata.role">{{ roles_formdata.role.position }}</span>
                  <span v-else>Keine Position ausgewählt</span>
                </template>
                <template #option="{ option }">
                  <span v-if="option">{{ option.position }}</span>
                  <span v-else>Keine Position</span>
                </template>
              </USelectMenu>
              <template v-if="roles_formdata.role">
                <button
                  class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                  @click="roles_formdata.role = ''"
                >
                  <UIcon
                    name="i-heroicons-x-mark-16-solid"
                    class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                  />
                </button>
              </template>
            </div>
            <template v-if="roles_formdata?.role?.id === 'bc712fc8-ce4f-4427-b431-4942eaaedaa6'" #help>
              <span class="text-danger">
                Achtung: Du hast die Administrator-Position ausgewählt. Dies bedeutet das jemand alle Daten der Website
                verändern kann!
              </span>
            </template>
          </UFormGroup>
        </div>
      </UForm>
    </template>
    <template #slideFooter>
      <div class="sticky bottom-0 flex flex-wrap justify-between w-full px-8 my-auto">
        <ButtonDefault
          type="button "
          class="w-1/3"
          color="danger"
          @click="
            modalStore.closeSlide();
            resetUserFormData();
          "
        >
          Schließen
        </ButtonDefault>
        <ButtonDefault
          :disabled="!submit_enable"
          class="w-1/3"
          color="success"
          @click="(event) => submit_enable && handleSubmit(event)"
        >
          Speichern
        </ButtonDefault>
      </div>
    </template>
    <input
      ref="cropper_input"
      type="file"
      accept="image/jpg, image/jpeg, image/png, image/gif, image/webp"
      hidden
      @change="setCropperImage"
    />
    <div class="max-w-[calc(100vw_-_20rem)] mx-auto mb-4">
      <h1 class="text-center">Verwaltungsdashboard</h1>
      <UTabs
        :items="[{ label: 'Home' }, { label: 'Verwaltungsübersicht' }, { label: 'Benutzer' }, { label: 'Hangars' }]"
        :ui="{ list: { background: 'bg-bsecondary', marker: { background: 'bg-bprimary' } } }"
        :orientation="width > 1024 ? 'horizontal' : 'vertical'"
      >
        <template #item="{ item }">
          <div v-if="item.label === 'Home'">
            <h2>Home</h2>
            <p>Coming Soon</p>
          </div>
          <div v-else-if="item.label === 'Verwaltungsübersicht'">
            <h2>Verwaltungsübersicht</h2>
            <p>Coming Soon</p>
          </div>
          <div v-else-if="item.label === 'Benutzer'">
            <div>
              <!-- TODO: ADD LOCK AND UNLOCK FUNCTIONS -->
              <AmsAdministrationUserTable
                ref="userTable"
                @create="handleCreate"
                @edit:profile="handleProfileEdit"
                @edit:notifications="handleNotificationsEdit"
                @edit:avatar="handleAvatarEdit"
                @edit:roles="handleRolesEdit"
                @delete="handleDelete"
                @lock="handleLock"
                @unlock="handleUnlock"
                @archive="handleArchive"
              />
            </div>
          </div>
          <div v-else-if="item.label === 'Hangars'">
            <h2>Hangars</h2>
            <p>Coming Soon</p>
          </div>
        </template>
      </UTabs>
    </div>
  </NuxtLayout>
</template>

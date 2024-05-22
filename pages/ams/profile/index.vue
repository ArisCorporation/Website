<script setup lang="ts">
import { object, string, number, boolean, type InferType } from 'yup';
import * as yup from 'yup';
import YupPassword from 'yup-password';
import type { FormSubmitEvent } from '#ui/types';
const { readAsyncItems } = useDirectusItems();
const { updateUser } = useDirectusUsers();
const modalStore = useModalStore();

YupPassword(yup);

defineEmits(['cropperInput']);

const user = transformUser(await useDirectusAuth().readMe());
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
const { data: landing_zones_res } = await readAsyncItems('landing_zones', {
  query: {
    fields: ['id', 'name', 'slug', 'planet.id', 'planet.name', 'planet.slug', 'planet.astronomical_designation'],
    filter: {
      status: { _eq: 'published' },
    },
    limit: -1,
  },
  transform: (landing_zones: any[]) => landing_zones.map((landing_zone: any) => transformLandingZone(landing_zone)),
});
const { data: planets } = await readAsyncItems('planets', {
  query: {
    fields: ['id', 'name', 'astronomical_designation', 'slug'],
    filter: {
      status: { _eq: 'published' },
    },
    limit: -1,
  },
  transform: (planets: any[]) => planets.map((planet: any) => transformPlanet(planet)),
});
const { data: systems } = await readAsyncItems('systems', {
  query: {
    fields: ['id', 'name', 'slug', 'orbit.collection', 'orbit.object:planets.id', 'orbit.object:planets.name'],
    filter: {
      status: { _eq: 'published' },
    },
    limit: -1,
  },
  transform: (systems: any[]) => systems.map((system: any) => transformStarsystem(system)),
});

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

const titleOptions = ['', 'Dr.', 'Dr. Med.', 'Prof. Med.', 'Dipl. Ing.'];

const birth_date_day = ref(user.birth_date?.split('-')[2] || null);
const birth_date_month = ref(user.birth_date?.split('-')[1] || null);
const birth_date_year = ref(user.birth_date?.split('-')[0] || null);

const form = ref();
const schema = object({
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
  birth_date: string().nullable(),
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

type Schema = InferType<typeof schema>;

const formdata = reactive({
  first_name: user.first_name,
  last_name: user.last_name || '',
  title: user.title || '',
  password: null,
  department: departments.value.find((e: any) => e.id === user.department_id) || '',
  rsi_handle: user.rsi_handle || '',
  sex: user.sex || '',
  current_residence: landing_zones.value?.find((e: any) => e.id === user.current_residence_value) || '',
  birth_date: computed(() => `${birth_date_year.value}-${birth_date_month.value}-${birth_date_day.value}`),
  birthplace: landing_zones.value?.find((e: any) => e.id === user.birthplace_value) || '' || '',
  hair_color: user.hair_color || '',
  eye_color: user.eye_color || '',
  weight: user.weight || null,
  height: user.height || null,
  citizen: user.citizen_state || false,
  citizen_reason: user.citizen_reason || '',
  duty_state: user.duty_state || false,
  education_state: user.education_state || false,
  social_state: user.social_state || false,
  duty_period: user.duty?.period || '',
  duty_end: user.duty?.end || '',
  duty_division: user.duty?.division || '',
  education_name: user.education?.name || '',
  education_period: user.education?.period || '',
  education_place: user.education?.place || '',
  hobbies: user.hobbies || '',
  activities: user.activities || '',
  talents: user.talents || '',
  habits: user.habits || '',
  tics: user.tics || '',
  fears: user.fears || '',
  character: user.character || '',
  mysterious: user.mysterious || '',
  music: user.music || '',
  movies: user.movies || '',
  books: user.books || '',
  clothing: user.clothing || '',
  food: user.food || '',
  drink: user.drink || '',
  alcohol: user.alcohol || '',
  colors: user.colors || '',
  loves: user.loves || '',
  hates: user.hates || '',
  medical_informations: user.medical_informations || '',
  biography: user.biography || '',
});

watch(formdata, () => {
  if (formdata.citizen_reason === 'military') {
    formdata.duty_state = true;
  } else if (formdata.citizen_reason === 'special_education') {
    formdata.education_state = true;
  } else if (formdata.citizen_reason === 'social_commitment') {
    formdata.social_state = true;
  }
});

const initialFormdata = reactive({ ...formdata });

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const userId = user.id;
  const updatedUser = {};

  for (const key in formdata) {
    if (formdata[key as keyof typeof formdata] !== initialFormdata[key as keyof typeof initialFormdata]) {
      updatedUser[key as keyof typeof updatedUser] = formdata[key as keyof typeof formdata];
    }
  }

  if (Object.keys(updatedUser).length === 0) {
    return;
  }

  if (
    updatedUser.hasOwnProperty('password') ||
    updatedUser.hasOwnProperty('first_name') ||
    updatedUser.hasOwnProperty('last_name')
  ) {
    modalStore.setData({
      ...((updatedUser.hasOwnProperty('first_name') || updatedUser.hasOwnProperty('last_name')) && {
        username: useSlugify(
          formdata.first_name.trim() + (formdata.last_name ? ' ' + formdata.last_name.trim() : ''),
          true,
        ),
      }),
      ...(updatedUser.hasOwnProperty('password') && { password: updatedUser.password }),
    });

    modalStore.openModal('WARNUNG!!!', {
      type: 'cred-change',
    });
  }

  try {
    await updateUser(userId, updatedUser, { limit: -1 });

    for (const key in formdata) {
      if (initialFormdata[key as keyof typeof initialFormdata] !== formdata[key as keyof typeof formdata]) {
        initialFormdata[key as keyof typeof initialFormdata] = formdata[key as keyof typeof formdata];
      }
    }

    formdata.password = null;
    initialFormdata.password = null;
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <div>
    <UForm :ref="form" :schema="schema" :state="formdata" validate-on="submit" @submit="onSubmit">
      <div class="divide-y divide-bsecondary space-y-6 *:pt-6 first:*:pt-2 mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div class="flex items-center gap-1.5">
            <div>
              <p class="p-0 font-semibold text-white">Profil</p>
              <p class="p-0 mt-1 text-sm text-tbase/50">
                In deinem Profil geht es um einen rein fiktiven Charakter den du spielst.
              </p>
            </div>
          </div>
          <UButton color="green" type="submit">Speichern</UButton>
        </div>
        <UFormGroup
          label="Vorname"
          name="first_name"
          description="Hier kannst du einen oder mehrere Vornamen angeben."
          required
          class="items-center grid-cols-2 gap-2 md:grid"
          :ui="{ container: 'relative' }"
        >
          <UInput v-model="formdata.first_name" placeholder="Chris" size="md" autocomplete="off" />
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
              v-model="formdata.last_name"
              :icon="
                formdata.last_name || initialFormdata.last_name
                  ? formdata.last_name === initialFormdata.last_name
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Roberts"
              size="md"
              autocomplete="off"
            />
            <template v-if="formdata.last_name || initialFormdata.last_name">
              <button
                v-if="formdata.last_name === initialFormdata.last_name"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.last_name = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.last_name = initialFormdata.last_name"
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
              useSlugify(formdata.first_name.trim() + (formdata.last_name ? ' ' + formdata.last_name.trim() : ''), true)
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
              useSlugify(formdata.first_name.trim() + (formdata.last_name ? ' ' + formdata.last_name.trim() : ''))
            "
            :ui="{ leading: { padding: { md: 'ps-[11.5rem]' } } }"
          >
            <template #leading>
              <span class="text-sm text-dark-gray">ariscorp.de/biography/</span>
            </template>
          </UInput>
        </UFormGroup>
        <UFormGroup
          label="Avatar"
          name="avatar"
          description="Hier kannst du sehen ob du Abteilungsleiter bist."
          class="items-center grid-cols-2 gap-2 md:grid"
          :ui="{ container: 'relative' }"
        >
          <UInput
            size="md"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            @input="(e: any) => $emit('cropperInput', e)"
          />
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
              v-model="formdata.title"
              :options="titleOptions"
              :ui="
                formdata.title || initialFormdata.title
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
                formdata.title || initialFormdata.title
                  ? formdata.title === initialFormdata.title
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              size="md"
            >
              <template v-if="formdata.title || initialFormdata.title" #leading />
              <template #label>
                <span v-if="formdata.title">{{ formdata.title }}</span>
                <span v-else>Kein Titel ausgewählt</span>
              </template>
              <template #option="{ option }">
                <span v-if="option">{{ option }}</span>
                <span v-else>Kein Titel</span>
              </template>
            </USelectMenu>
            <template v-if="formdata.title || initialFormdata.title">
              <button
                v-if="formdata.title === initialFormdata.title"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.title = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.title = initialFormdata.title"
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
              v-model="formdata.password"
              size="md"
              autocomplete="off"
              :icon="formdata.password !== null && 'i-heroicons-x-mark-16-solid'"
              placeholder="******"
              type="password"
            />
            <button
              v-if="formdata.password !== null"
              type="button"
              class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
              @click="formdata.password = null"
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
          label="Abteilungsleiter"
          name="head_of_department"
          description="Hier kannst du sehen ob du Abteilungsleiter bist."
          class="items-center grid-cols-2 gap-2 md:grid"
          :ui="{ container: 'relative' }"
        >
          <UCheckbox :model-value="user.head_of_department" disabled label="Abteilungsleiter" />
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
              v-model="formdata.department"
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
              v-model="formdata.rsi_handle"
              size="md"
              autocomplete="off"
              :icon="
                formdata.rsi_handle || initialFormdata.rsi_handle
                  ? formdata.rsi_handle === initialFormdata.rsi_handle
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="chris_roberts"
            />
            <template v-if="formdata.rsi_handle || initialFormdata.rsi_handle">
              <button
                v-if="formdata.rsi_handle === initialFormdata.rsi_handle"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.rsi_handle = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.rsi_handle = initialFormdata.rsi_handle"
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
            v-model="formdata.sex"
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
              v-model="formdata.current_residence"
              :options="['', ...landing_zones]"
              option-attribute="name"
              searchable
              clear-search-on-close
              searchable-placeholder="Suche..."
              :search-attributes="['name']"
              :icon="
                formdata.current_residence || initialFormdata.current_residence
                  ? formdata.current_residence === initialFormdata.current_residence
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              size="md"
            >
              <template v-if="formdata.current_residence || initialFormdata.current_residence" #leading />
              <template #label>
                <span v-if="formdata.current_residence">{{
                  formdata.current_residence.path_label || formdata.current_residence.name
                }}</span>
                <span v-else class="text-[13.9px]">Keine Landezone ausgewählt</span>
              </template>
              <template #option="{ option }">
                <span v-if="option">{{ option.path_label || option.name }}</span>
                <span v-else>Keine Landezone</span>
              </template>
            </USelectMenu>
            <template v-if="formdata.current_residence || initialFormdata.current_residence">
              <button
                v-if="formdata.current_residence === initialFormdata.current_residence"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.current_residence = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.current_residence = initialFormdata.current_residence"
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
          name="birth_date"
          description="Hier ist deine Discord ID. Diese wird generiert sobald du einen Benutzernamen angibst und es speicherst."
          class="items-center grid-cols-2 gap-2 md:grid"
          :ui="{ container: 'relative flex pb-4 gap-x-4' }"
        >
          <div class="w-1/3">
            <USelectMenu
              v-model="birth_date_day"
              placeholder="Tag"
              :options="Array.from({ length: 31 }, (_, index) => (index + 1).toString().padStart(2, '0'))"
              size="md"
            />
          </div>
          <div class="w-1/3">
            <USelectMenu
              v-model="birth_date_month"
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
            v-model="birth_date_year"
            class="w-1/3"
            placeholder="Jahr"
            inputmode="numeric"
            :ui="{ placeholder: 'text-center' }"
            size="md"
          />
          <div class="absolute bottom-0 right-0 text-xs italic text-light-gray w-fit">
            <span>Alter: {{ $dayjs().add(930, 'years').diff(formdata.birth_date, 'year') }} Jahre</span>
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
              v-model="formdata.birthplace"
              :options="['', ...landing_zones]"
              option-attribute="name"
              searchable
              clear-search-on-close
              searchable-placeholder="Suche..."
              :search-attributes="['name']"
              :icon="
                formdata.birthplace || initialFormdata.birthplace
                  ? formdata.birthplace === initialFormdata.birthplace
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              size="md"
            >
              <template v-if="formdata.birthplace || initialFormdata.birthplace" #leading />
              <template #label>
                <span v-if="formdata.birthplace">{{ formdata.birthplace.path_label || formdata.birthplace.name }}</span>
                <span v-else class="text-[13.9px]">Keine Landezone ausgewählt</span>
              </template>
              <template #option="{ option }">
                <span v-if="option">{{ option.path_label || option.name }}</span>
                <span v-else>Keine Landezone</span>
              </template>
            </USelectMenu>
            <template v-if="formdata.birthplace || initialFormdata.birthplace">
              <button
                v-if="formdata.birthplace === initialFormdata.birthplace"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.birthplace = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.birthplace = initialFormdata.birthplace"
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
              v-model="formdata.hair_color"
              size="md"
              autocomplete="off"
              :icon="
                formdata.hair_color || initialFormdata.hair_color
                  ? formdata.hair_color === initialFormdata.hair_color
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Schwarz"
            />
            <template v-if="formdata.hair_color || initialFormdata.hair_color">
              <button
                v-if="formdata.hair_color === initialFormdata.hair_color"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.hair_color = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.hair_color = initialFormdata.hair_color"
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
              v-model="formdata.eye_color"
              size="md"
              autocomplete="off"
              :icon="
                formdata.eye_color || initialFormdata.eye_color
                  ? formdata.eye_color === initialFormdata.eye_color
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Blau / Grün"
            />
            <template v-if="formdata.eye_color || initialFormdata.eye_color">
              <button
                v-if="formdata.eye_color === initialFormdata.eye_color"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.eye_color = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.eye_color = initialFormdata.eye_color"
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
              v-model="formdata.weight"
              size="md"
              autocomplete="off"
              :icon="
                formdata.weight || initialFormdata.weight
                  ? formdata.weight === initialFormdata.weight
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              trailing-icon="i-mdi-weight-kilogram"
              placeholder="82"
              inputmode="numeric"
            />
            <template v-if="formdata.weight || initialFormdata.weight">
              <button
                v-if="formdata.weight === initialFormdata.weight"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.weight = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.weight = initialFormdata.weight"
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
              v-model="formdata.height"
              size="md"
              autocomplete="off"
              :icon="
                formdata.height || initialFormdata.height
                  ? formdata.height === initialFormdata.height
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              trailing-icon="i-mdi-human-male-height"
              placeholder="192"
              inputmode="numeric"
            />
            <template v-if="formdata.height || initialFormdata.height">
              <button
                v-if="formdata.height === initialFormdata.height"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.height = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.height = initialFormdata.height"
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
            v-model="formdata.citizen"
            :options="[
              { label: 'Bürger', value: true },
              { label: 'Zivilist', value: false },
            ]"
          >
          </URadioGroup>
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
            v-if="formdata.citizen"
            label="Bürgerstatus - Begründung"
            name="citizen_reason"
            description="Hier kannst du deinen RSI Handle angeben."
            class="items-center grid-cols-2 gap-2 md:grid"
            :ui="{ container: 'relative' }"
          >
            <URadioGroup
              v-model="formdata.citizen_reason"
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
              v-model="formdata.duty_state"
              :disabled="formdata.citizen_reason === 'military'"
              label="Militärischer Dienst"
              name="military"
            />
          </UFormGroup>
          <UFormGroup name="special_education" class="items-center" :ui="{ container: 'relative' }">
            <UCheckbox
              v-model="formdata.education_state"
              :disabled="formdata.citizen_reason === 'special_education'"
              label="Besondere Bildung"
              name="special_education"
            />
          </UFormGroup>
          <UFormGroup name="social_commitment" class="items-center" :ui="{ container: 'relative' }">
            <UCheckbox
              v-model="formdata.social_state"
              :disabled="formdata.citizen_reason === 'social_commitment'"
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
          <div v-if="formdata.duty_state" class="divide-y divide-bsecondary space-y-6 *:pt-6 first:*:pt-0 mb-6">
            <UFormGroup
              :required="formdata.duty_period"
              label="Dienstzeitraum"
              description="Hier kannst du deinen RSI Handle angeben."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <div class="relative">
                <UInput
                  v-model="formdata.duty_period"
                  size="md"
                  placeholder="01/2940 - 12/2950"
                  :icon="
                    formdata.duty_period || initialFormdata.duty_period
                      ? formdata.duty_period === initialFormdata.duty_period
                        ? 'i-heroicons-x-mark-16-solid'
                        : 'i-heroicons-arrow-uturn-left'
                      : ''
                  "
                />
                <template v-if="formdata.duty_period || initialFormdata.duty_period">
                  <button
                    v-if="formdata.duty_period === initialFormdata.duty_period"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    @click="formdata.duty_period = ''"
                  >
                    <UIcon
                      name="i-heroicons-x-mark-16-solid"
                      class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                    />
                  </button>
                  <button
                    v-else
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    @click="formdata.duty_period = initialFormdata.duty_period"
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
              :required="formdata.duty_period"
              label="Dienstende"
              name="duty_end"
              description="Hier kannst du deinen RSI Handle angeben."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <URadioGroup
                v-model="formdata.duty_end"
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
              :required="formdata.duty_state"
              label="Division"
              name="duty_division"
              description="Hier kannst du deinen RSI Handle angeben."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <div class="relative">
                <USelectMenu
                  v-model="formdata.duty_division"
                  :options="[
                    '',
                    { name: 'UEE Army', value: 'army' },
                    { name: 'UEE Marine', value: 'marines' },
                    { name: 'UEE Navy', value: 'navy' },
                  ]"
                  size="md"
                  :icon="
                    formdata.duty_division || initialFormdata.duty_division
                      ? formdata.duty_division === initialFormdata.duty_division
                        ? 'i-heroicons-x-mark-16-solid'
                        : 'i-heroicons-arrow-uturn-left'
                      : ''
                  "
                >
                  <template #label>
                    <span v-if="formdata.duty_division">{{ formdata.duty_division?.name }}</span>
                    <span v-else>Keine Division ausgewählt</span>
                  </template>
                  <template #option="{ option }">
                    <span v-if="option.name">{{ option.name }}</span>
                    <span v-else>Keine Division</span>
                  </template>
                </USelectMenu>
                <template v-if="formdata.duty_division || initialFormdata.duty_division">
                  <button
                    v-if="formdata.duty_division === initialFormdata.duty_division"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    @click="formdata.duty_division = ''"
                  >
                    <UIcon
                      name="i-heroicons-x-mark-16-solid"
                      class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                    />
                  </button>
                  <button
                    v-else
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    @click="formdata.duty_division = initialFormdata.duty_division"
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
          <div v-if="formdata.education_state" class="divide-y divide-bsecondary space-y-6 *:pt-6 first:*:pt-0 mb-6">
            <UFormGroup
              :required="formdata.education_name"
              label="Ausbildung"
              description="Hier kannst du deinen RSI Handle angeben."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <div class="relative">
                <UInput
                  v-model="formdata.education_name"
                  size="md"
                  placeholder="Medizinisches Studium"
                  :icon="
                    formdata.education_name || initialFormdata.education_name
                      ? formdata.education_name === initialFormdata.education_name
                        ? 'i-heroicons-x-mark-16-solid'
                        : 'i-heroicons-arrow-uturn-left'
                      : ''
                  "
                />
                <template v-if="formdata.education_name || initialFormdata.education_name">
                  <button
                    v-if="formdata.education_name === initialFormdata.education_name"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    @click="formdata.education_name = ''"
                  >
                    <UIcon
                      name="i-heroicons-x-mark-16-solid"
                      class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                    />
                  </button>
                  <button
                    v-else
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    @click="formdata.education_name = initialFormdata.education_name"
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
              :required="formdata.education_period"
              label="Dienstzeitraum"
              description="Hier kannst du deinen RSI Handle angeben."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <div class="relative">
                <UInput
                  v-model="formdata.education_period"
                  size="md"
                  placeholder="01/2940 - 12/2950"
                  :icon="
                    formdata.education_period || initialFormdata.education_period
                      ? formdata.education_period === initialFormdata.education_period
                        ? 'i-heroicons-x-mark-16-solid'
                        : 'i-heroicons-arrow-uturn-left'
                      : ''
                  "
                />
                <template v-if="formdata.education_period || initialFormdata.education_period">
                  <button
                    v-if="formdata.education_period === initialFormdata.education_period"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    @click="formdata.education_period = ''"
                  >
                    <UIcon
                      name="i-heroicons-x-mark-16-solid"
                      class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                    />
                  </button>
                  <button
                    v-else
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    @click="formdata.education_period = initialFormdata.education_period"
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
              :required="formdata.education_state"
              label="Hochschule"
              name="duty_division"
              description="Hier kannst du deinen RSI Handle angeben."
              class="items-center grid-cols-2 gap-2 md:grid"
              :ui="{ container: 'relative' }"
            >
              <div class="relative">
                <USelectMenu
                  v-model="formdata.education_place"
                  :options="[
                    '',
                    { name: 'PLACEHOLDER', value: null },
                    { name: 'PLACEHOLDER', value: null },
                    { name: 'PLACEHOLDER', value: null },
                  ]"
                  size="md"
                  :icon="
                    formdata.education_place || initialFormdata.education_place
                      ? formdata.education_place === initialFormdata.education_place
                        ? 'i-heroicons-x-mark-16-solid'
                        : 'i-heroicons-arrow-uturn-left'
                      : ''
                  "
                >
                  <template #label>
                    <span v-if="formdata.education_place">{{ formdata.education_place?.name }}</span>
                    <span v-else>Keine Division ausgewählt</span>
                  </template>
                  <template #option="{ option }">
                    <span v-if="option.name">{{ option.name }}</span>
                    <span v-else>Keine Division</span>
                  </template>
                </USelectMenu>
                <template v-if="formdata.education_place || initialFormdata.education_place">
                  <button
                    v-if="formdata.education_place === initialFormdata.education_place"
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    @click="formdata.education_place = ''"
                  >
                    <UIcon
                      name="i-heroicons-x-mark-16-solid"
                      class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                    />
                  </button>
                  <button
                    v-else
                    class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                    @click="formdata.duty_diveducation_placeision = initialFormdata.education_place"
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
              v-model="formdata.hobbies"
              size="md"
              autocomplete="off"
              :icon="
                formdata.hobbies || initialFormdata.hobbies
                  ? formdata.hobbies === initialFormdata.hobbies
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Sport, Fliegen, Schrauben, ..."
            />
            <template v-if="formdata.hobbies || initialFormdata.hobbies">
              <button
                v-if="formdata.hobbies === initialFormdata.hobbies"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.hobbies = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.hobbies = initialFormdata.hobbies"
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
              v-model="formdata.activities"
              size="md"
              autocomplete="off"
              :icon="
                formdata.activities || initialFormdata.activities
                  ? formdata.activities === initialFormdata.activities
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Fischen, Kochen, ..."
            />
            <template v-if="formdata.activities || initialFormdata.activities">
              <button
                v-if="formdata.activities === initialFormdata.activities"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.activities = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.activities = initialFormdata.activities"
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
              v-model="formdata.talents"
              size="md"
              autocomplete="off"
              :icon="
                formdata.talents || initialFormdata.talents
                  ? formdata.talents === initialFormdata.talents
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Spricht Sprache X, Handwerklich begabt, ..."
            />
            <template v-if="formdata.talents || initialFormdata.talents">
              <button
                v-if="formdata.talents === initialFormdata.talents"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.talents = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.talents = initialFormdata.talents"
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
              v-model="formdata.habits"
              size="md"
              autocomplete="off"
              :icon="
                formdata.habits || initialFormdata.habits
                  ? formdata.habits === initialFormdata.habits
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Überspielt Unsicherheit mit Humor, ..."
            />
            <template v-if="formdata.habits || initialFormdata.habits">
              <button
                v-if="formdata.habits === initialFormdata.habits"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.habits = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.habits = initialFormdata.habits"
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
              v-model="formdata.tics"
              size="md"
              autocomplete="off"
              :icon="
                formdata.tics || initialFormdata.tics
                  ? formdata.tics === initialFormdata.tics
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Hat fragwürdigen Humor, ..."
            />
            <template v-if="formdata.tics || initialFormdata.tics">
              <button
                v-if="formdata.tics === initialFormdata.tics"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.tics = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.tics = initialFormdata.tics"
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
              v-model="formdata.fears"
              size="md"
              autocomplete="off"
              :icon="
                formdata.fears || initialFormdata.fears
                  ? formdata.fears === initialFormdata.fears
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Hat fragwürdigen Humor, ..."
            />
            <template v-if="formdata.fears || initialFormdata.fears">
              <button
                v-if="formdata.fears === initialFormdata.fears"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.fears = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.fears = initialFormdata.fears"
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
              v-model="formdata.character"
              size="md"
              autocomplete="off"
              :icon="
                formdata.character || initialFormdata.character
                  ? formdata.character === initialFormdata.character
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Ist sehr loyal, ..."
            />
            <template v-if="formdata.character || initialFormdata.character">
              <button
                v-if="formdata.character === initialFormdata.character"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.character = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.character = initialFormdata.character"
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
              v-model="formdata.mysterious"
              size="md"
              autocomplete="off"
              :icon="
                formdata.mysterious || initialFormdata.mysterious
                  ? formdata.mysterious === initialFormdata.mysterious
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Spricht ungern über Ereignis X, ..."
            />
            <template v-if="formdata.mysterious || initialFormdata.mysterious">
              <button
                v-if="formdata.mysterious === initialFormdata.mysterious"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.mysterious = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.mysterious = initialFormdata.mysterious"
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
              v-model="formdata.music"
              size="md"
              autocomplete="off"
              :icon="
                formdata.music || initialFormdata.music
                  ? formdata.music === initialFormdata.music
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Rock Musik, EDM, Metal, ..."
            />
            <template v-if="formdata.music || initialFormdata.music">
              <button
                v-if="formdata.music === initialFormdata.music"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.music = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.music = initialFormdata.music"
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
              v-model="formdata.movies"
              size="md"
              autocomplete="off"
              :icon="
                formdata.movies || initialFormdata.movies
                  ? formdata.movies === initialFormdata.movies
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Star Trek, Star Wars, ..."
            />
            <template v-if="formdata.movies || initialFormdata.movies">
              <button
                v-if="formdata.movies === initialFormdata.movies"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.movies = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.movies = initialFormdata.movies"
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
              v-model="formdata.books"
              size="md"
              autocomplete="off"
              :icon="
                formdata.books || initialFormdata.books
                  ? formdata.books === initialFormdata.books
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Broschüren von Hersteller X, ..."
            />
            <template v-if="formdata.books || initialFormdata.books">
              <button
                v-if="formdata.books === initialFormdata.books"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.books = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.books = initialFormdata.books"
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
              v-model="formdata.clothing"
              size="md"
              autocomplete="off"
              :icon="
                formdata.clothing || initialFormdata.clothing
                  ? formdata.clothing === initialFormdata.clothing
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Lederjacken, ..."
            />
            <template v-if="formdata.clothing || initialFormdata.clothing">
              <button
                v-if="formdata.clothing === initialFormdata.clothing"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.clothing = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.clothing = initialFormdata.clothing"
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
              v-model="formdata.food"
              size="md"
              autocomplete="off"
              :icon="
                formdata.food || initialFormdata.food
                  ? formdata.food === initialFormdata.food
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Big Bennys Nudeln, ..."
            />
            <template v-if="formdata.food || initialFormdata.food">
              <button
                v-if="formdata.food === initialFormdata.food"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.food = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.food = initialFormdata.food"
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
              v-model="formdata.drink"
              size="md"
              autocomplete="off"
              :icon="
                formdata.drink || initialFormdata.drink
                  ? formdata.drink === initialFormdata.drink
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Vestal Wasser, ..."
            />
            <template v-if="formdata.drink || initialFormdata.drink">
              <button
                v-if="formdata.drink === initialFormdata.drink"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.drink = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.drink = initialFormdata.drink"
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
              v-model="formdata.alcohol"
              size="md"
              autocomplete="off"
              :icon="
                formdata.alcohol || initialFormdata.alcohol
                  ? formdata.alcohol === initialFormdata.alcohol
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Schmolz Bier, ..."
            />
            <template v-if="formdata.alcohol || initialFormdata.alcohol">
              <button
                v-if="formdata.alcohol === initialFormdata.alcohol"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.alcohol = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.alcohol = initialFormdata.alcohol"
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
              v-model="formdata.colors"
              size="md"
              autocomplete="off"
              :icon="
                formdata.colors || initialFormdata.colors
                  ? formdata.colors === initialFormdata.colors
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Schwarz, Blau, ..."
            />
            <template v-if="formdata.colors || initialFormdata.colors">
              <button
                v-if="formdata.colors === initialFormdata.colors"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.colors = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.colors = initialFormdata.colors"
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
          :label="formdata.sex === 'female' ? 'Sie' : 'Er' + ' liebt...'"
          name="loves"
          description="Hier kannst du deinen RSI Handle angeben."
          class="items-center grid-cols-2 gap-2 md:grid"
          :ui="{ container: 'relative' }"
        >
          <div class="relative">
            <UInput
              v-model="formdata.loves"
              size="md"
              autocomplete="off"
              :icon="
                formdata.loves || initialFormdata.loves
                  ? formdata.loves === initialFormdata.loves
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Hochwertige Schiffe, ..."
            />
            <template v-if="formdata.loves || initialFormdata.loves">
              <button
                v-if="formdata.loves === initialFormdata.loves"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.loves = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.loves = initialFormdata.loves"
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
          :label="formdata.sex === 'female' ? 'Sie' : 'Er' + ' hasst...'"
          name="hates"
          description="Hier kannst du deinen RSI Handle angeben."
          class="items-center grid-cols-2 gap-2 md:grid"
          :ui="{ container: 'relative' }"
        >
          <div class="relative">
            <UInput
              v-model="formdata.hates"
              size="md"
              autocomplete="off"
              :icon="
                formdata.hates || initialFormdata.hates
                  ? formdata.hates === initialFormdata.hates
                    ? 'i-heroicons-x-mark-16-solid'
                    : 'i-heroicons-arrow-uturn-left'
                  : ''
              "
              placeholder="Drake, ..."
            />
            <template v-if="formdata.hates || initialFormdata.hates">
              <button
                v-if="formdata.hates === initialFormdata.hates"
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.hates = ''"
              >
                <UIcon
                  name="i-heroicons-x-mark-16-solid"
                  class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
                />
              </button>
              <button
                v-else
                class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
                @click="formdata.hates = initialFormdata.hates"
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
            v-model="formdata.medical_informations"
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
          <Editor v-model="formdata.biography" />
        </div>
      </div>
    </UForm>
  </div>
</template>

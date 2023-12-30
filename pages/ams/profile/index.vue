<script setup lang="ts">
import Editor from '@tinymce/tinymce-vue';
const userData = useDirectusUser();
const { getUserById } = useDirectusUsers();
const { getItems } = useDirectusItems();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);
const modalStore = useModalStore();

const { data: user } = await useAsyncData(
  'get-profile',
  () =>
    getUserById({
      id: userData.value?.id,
      params: {
        fields: [
          '*',
          'birthplace.name',
          'birthplace.slug',
          'birthplace.planet.name',
          'birthplace.planet.astronomicalDesignation',
          'birthplace.planet.slug',
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
          'name',
          'slug',
          'planet.name',
          'planet.astronomicalDesignation',
          'planet.slug',
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
console.log(data.value?.landingZones);
console.log(user.value);
// const titleOptions = ['Dr.', 'Dr. Med.', 'Prof. Med.', 'Dipl. Ing.', 'Dr. Ph. D.'];
const titleOptions = [
  {
    name: 'Kein Titel',
    value: null,
  },
  {
    name: 'Dr.',
    value: 'Dr.',
  },
];
const formgroupUi = {
  strategy: 'override',
  container: 'relative mt-1 w-full max-w-[303px]',
  wrapper: 'flex justify-between h-fit w-full xl:w-1/2',
  label: { wrapper: 'flex content-center items-center justify-between mr-4' },
};
const radioformgroupUi = {
  strategy: 'override',
  wrapper: 'flex h-fit w-full xl:w-1/2',
  label: { wrapper: 'flex content-center items-center justify-between mr-4 mb-auto' },
};

const checkboxRecruitment = ref(user.value?.roles.includes('Rekrutierung'));
const checkboxMarketing = ref(user.value?.roles.includes('Marketing & Presse'));
const checkboxCW = ref(user.value?.roles.includes('Inhaltsersteller'));

// const citizenReasonRadio = ref(user.value?.citizenreason);

const selectedDepartment = ref(data.value?.departments.find((e) => e.id === user.value?.department.id));

const birthdateDay = ref(user.value?.birthdate ? user.value?.birthdate.split('.')[0] : null);
const birthdateMonth = ref(user.value?.birthdate ? user.value?.birthdate.split('.')[1] : null);
const birthdateYear = ref(user.value?.birthdate ? user.value?.birthdate.split('.')[2] : null);

const rolesArray = computed(() => {
  const roles = [];
  if (checkboxRecruitment.value) roles.push('recruitment');
  if (checkboxMarketing.value) roles.push('marketing');
  if (checkboxCW.value) roles.push('contentWriter');

  return roles;
});

const formData = reactive({
  firstname: user.value?.firstname,
  lastname: user.value?.lastname,
  title: user.value?.title || titleOptions[0],
  password: '',
  roles: rolesArray.value,
  head_of_department: user.value?.head_of_department,
  department: selectedDepartment.value,
  currentplace: user.value?.currentplace,
  sex: user.value?.sex,
  birthdate: computed(() => `${birthdateDay.value}.${birthdateMonth.value}.${birthdateYear.value}`),
  birthplace: user.value?.birthplace,
  haircolor: user.value?.haircolor,
  eyecolor: user.value?.eyecolor,
  weight: user.value?.weight,
  height: user.value?.height,
  citizen: user.value?.ueestate === 'citizen',
  citizenReason: user.value?.citizenreason,
  dutyState: user.value?.citizenreason === 'Militärischer Dienst' ? true : user.value?.dutyState,
  educationState: user.value?.citizenreason === 'Besondere Bildung' ? true : user.value?.educationState,
  dutyPeriod: user.value?.duty.period,
  dutyEnd: user.value?.duty.end,
  educationName: user.value?.education.name,
  educationPeriod: user.value?.education.period,
  educationPlace: user.value?.education.place,
  hobbys: user.value?.hobbys,
  activities: user.value?.activities,
  talents: user.value?.talents,
  habits: user.value?.habits,
  tics: user.value?.tics,
  fears: user.value?.fears,
  character: user.value?.character,
  mysterious: user.value?.mysterious,
  music: user.value?.music,
  movies: user.value?.movies,
  books: user.value?.books,
  clothing: user.value?.clothing,
  food: user.value?.food,
  drinks: user.value?.drink,
  alcohol: user.value?.alcohol,
  colors: user.value?.colors,
  loves: user.value?.loves,
  hates: user.value?.hates,
  medicalinfo: user.value?.medicalinfo,
  biography: user.value?.biography,
});

watch(formData, (newFormData) => {
  if (newFormData.citizen === false) {
    formData.citizenReason = '';
  }

  if (newFormData.citizenReason === 'Militärischer Dienst') {
    formData.dutyState = true;
  } else if (newFormData.citizenReason === 'Besondere Bildung') {
    formData.educationState = true;
  }
});

definePageMeta({
  layout: false,
  middleware: 'auth',
});
</script>

<template>
  <NuxtLayout name="ams">
    <template #modalContent>
      <span>test</span>
    </template>
    {{ formData }}
    <div class="relative flex items-center p-5 mb-5 rounded-lg bg-bsecondary">
      <!-- TODO: ADD LOADING STATE TO AVATAR -->
      <div
        class="flex mr-6 overflow-hidden border-[6px] border-primary rounded-full h-36 w-36 bg-image focus:outline-none group bg-white/5"
        :style="{ backgroundImage: `url(${$config.public.fileBase + user?.potrait})` }"
      />
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
          <!-- <template v-else>
            <div>&zwnj;</div>
          </template> -->
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
        <UForm class="w-full" ref="form" :state="formData">
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup required size="xl" label="Vorname" :ui="formgroupUi">
              <UInput v-model="formData.firstname" placeholder="Chris" icon="i-heroicons-user" />
            </UFormGroup>
            <UFormGroup size="xl" label="Nachname" :ui="formgroupUi">
              <UInput v-model="formData.lastname" placeholder="Roberts" icon="i-heroicons-user" />
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup required size="xl" label="Titel" :ui="formgroupUi">
              <USelectMenu v-model="formData.title" :options="titleOptions" option-attribute="name" />
            </UFormGroup>
            <UFormGroup size="xl" label="Passwort" :ui="formgroupUi">
              <UInput v-model="formData.password" placeholder="******" type="password" icon="i-heroicons-lock-closed" />
            </UFormGroup>
          </div>
          <TableHr />
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Rollen" :ui="formgroupUi">
              <ArisCheckbox
                :disabled="user?.permissionLevel < 4"
                v-model="checkboxRecruitment"
                name="recruitment"
                label="Rekrutierung"
                color="primary"
              />
              <ArisCheckbox
                :disabled="user?.permissionLevel < 4"
                v-model="checkboxMarketing"
                name="marketing"
                label="Marketing & Presse"
                color="primary"
              />
              <ArisCheckbox
                :disabled="user?.permissionLevel < 4"
                v-model="checkboxCW"
                name="content_writer"
                label="Inhaltsersteller"
                color="primary"
              />
            </UFormGroup>
            <div class="w-full xl:w-1/2">
              <UFormGroup
                size="xl"
                label="Abteilung"
                :ui="{
                  ...formgroupUi,
                  container: 'relative mt-1 w-full max-w-[303px]',
                  wrapper: 'flex justify-between h-fit w-full',
                  label: {
                    wrapper: 'flex flex-wrap content-center items-center justify-between w-full',
                  },
                }"
              >
                <USelectMenu v-model="selectedDepartment" :options="data?.departments" option-attribute="name" />
                <template #hint>
                  <ArisCheckbox
                    v-model="formData.head_of_department"
                    name="head_of_department"
                    label="Abteilungsleiter"
                    color="primary"
                    class="mr-4"
                    :disabled="user?.permissionLevel < 4"
                  />
                </template>
              </UFormGroup>
              <UFormGroup
                size="xl"
                label="Avatar"
                :ui="{
                  ...formgroupUi,
                  container: 'relative mt-1 w-full max-w-[303px]',
                  wrapper: 'flex justify-between h-fit w-full',
                }"
              >
                <!-- TODO: ADD MODAL CONTENT -->
                <!-- TODO: ADD IMAGE CONVERSION LOGIC -->
                <UInput v-if="userSettings.ams.avatarConsent" type="file" icon="i-heroicons-user" />
                <ButtonDefault v-else class="w-full" @click="modalStore.openModal('test', { hideXButton: true })">
                  Avatar ändern
                </ButtonDefault>
              </UFormGroup>
            </div>
          </div>
          <TableHr> Steckbrief </TableHr>
          <div class="flex flex-wrap items-center justify-between xl:pr-4 xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Aktueller Wohnsitz" :ui="formgroupUi">
              <USelectMenu
                v-model="formData.currentplace"
                searchable
                clear-search-on-close
                searchable-placeholder="Suche..."
                :search-attributes="['name', 'planet.name', 'planet.system.name']"
                :options="data?.landingZones"
              >
                <template #label>
                  <span aria-hidden="true" />
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
                  <span aria-hidden="true" />
                  <span class="truncate">
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
                  </span>
                </template>
              </USelectMenu>
            </UFormGroup>
          </div>
          <h4 class="mt-2 mb-1">Grundlegende Informationen:</h4>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Geschlecht" :ui="formgroupUi" class="">
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
            </UFormGroup>
            <UFormGroup size="xl" label="Geburtsdatum" :ui="formgroupUi">
              <!-- TODO: ADD FORMAT HINT -->
              <!-- TODO: MAX LENGTH -->
              <div
                class="relative inline-flex w-full p-0 text-base placeholder-gray-500 border-0 rounded-md shadow-sm disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none form-input bg-bprimary bg-opacity-60 ring-1 ring-inset ring-bsecondary focus:ring-2 focus-within:ring-primary"
              >
                <div class="inline-flex mx-auto">
                  <UInput
                    v-model="birthdateDay"
                    class="w-16 px-0 py-0 text-center"
                    maxlength="2"
                    placeholder="dd"
                    variant="none"
                    type="number"
                    inputmode="numeric"
                    :ui="{ placeholder: 'text-center' }"
                  />
                  <span class="my-auto">/</span>
                  <UInput
                    v-model="birthdateMonth"
                    class="w-16 px-0 py-0 text-center"
                    placeholder="mm"
                    variant="none"
                    type="number"
                    inputmode="numeric"
                    :ui="{ placeholder: 'text-center' }"
                  />
                  <span class="my-auto">/</span>
                  <UInput
                    v-model="birthdateYear"
                    class="w-20 px-0 py-0 text-center"
                    placeholder="yyyy"
                    variant="none"
                    type="number"
                    inputmode="numeric"
                    :ui="{ placeholder: 'text-center' }"
                  />
                </div>
              </div>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:pr-4 xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Geburtsort" :ui="formgroupUi">
              <USelectMenu
                searchable
                clear-search-on-close
                searchable-placeholder="Suche..."
                :search-attributes="['name', 'planet.name', 'planet.system.name']"
                v-model="formData.birthplace"
                :options="data?.landingZones"
              >
                <template #label>
                  <span aria-hidden="true" />
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
                  <span aria-hidden="true" />
                  <span class="truncate">
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
                  </span>
                </template>
              </USelectMenu>
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Haarfarbe" :ui="formgroupUi">
              <UInput placeholder="Schwarz" icon="i-ic-round-color-lens" />
            </UFormGroup>
            <UFormGroup size="xl" label="Augenfarbe" :ui="formgroupUi">
              <UInput placeholder="Blau/Grün" icon="i-ic-round-color-lens" />
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Gewicht" :ui="formgroupUi">
              <!-- TODO: MAX LENGTH -->
              <UInput placeholder="85" icon="i-mdi-scale-balance">
                <template #trailing>
                  <span class="text-xs text-gray-400">KG</span>
                </template>
              </UInput>
            </UFormGroup>
            <UFormGroup size="xl" label="Größe" :ui="formgroupUi">
              <!-- TODO: MAX LENGTH -->
              <UInput placeholder="192" icon="i-mdi-ruler">
                <template #trailing>
                  <span class="text-xs text-gray-400">CM</span>
                </template>
              </UInput>
            </UFormGroup>
          </div>
          <h5 class="mt-2 mb-1">Bürgerstatus:</h5>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4 xl:pr-4">
            <UFormGroup size="xl" label="UEE Status" :ui="formgroupUi">
              <!-- TODO: ADD ANIMATIONS -->
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
            </UFormGroup>
          </div>
          <Presence exit-before-enter>
            <Motion
              tag="div"
              :initial="{ height: '0px' }"
              :animate="{ height: '64px' }"
              :exit="{ height: '0px' }"
              v-if="formData.citizen"
              class="flex flex-wrap items-center justify-between overflow-hidden xl:flex-nowrap gap-x-4 xl:pr-4"
            >
              <UFormGroup size="xl" label="Wie wurdest du Bürger?" :ui="formgroupUi">
                <!-- TODO: ADD ANIMATIONS -->
                <ArisRadioGroup
                  v-model="formData.citizenReason"
                  :options="[
                    {
                      value: 'Militärischer Dienst',
                      label: 'Militärischer Dienst',
                      color: 'primary',
                    },
                    {
                      value: 'Besondere Bildung',
                      label: 'Besondere Bildung',
                      color: 'primary',
                    },
                    {
                      value: 'Soziales Engagement',
                      label: 'Soziales Engagement',
                      color: 'primary',
                    },
                  ]"
                />
              </UFormGroup>
            </Motion>
          </Presence>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4 xl:pr-4">
            <UFormGroup size="xl" label="Was trifft auf sie zu?" :ui="formgroupUi">
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
            </UFormGroup>
          </div>
          <!-- TODO: SHOW WHEN MILITARY -->
          <Presence exit-before-enter>
            <Motion
              tag="div"
              :initial="{ height: '0px' }"
              :animate="{ height: '50px' }"
              :exit="{ height: '0px' }"
              v-if="formData.dutyState"
              class="overflow-y-clip"
            >
              <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
                <UFormGroup size="xl" label="Dienstzeit" :ui="formgroupUi">
                  <UInput v-model="formData.dutyPeriod" placeholder="2940 - 2950" icon="i-heroicons-user" />
                </UFormGroup>
                <UFormGroup size="xl" label="Dienstende" :ui="formgroupUi">
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
                </UFormGroup>
              </div>
            </Motion>
          </Presence>
          <!-- TODO: SHOW WHEN EDUCATION -->
          <Presence exit-before-enter>
            <Motion
              tag="div"
              :initial="{ height: '0px' }"
              :animate="{ height: '78px' }"
              :exit="{ height: '0px' }"
              v-if="formData.educationState"
              class="overflow-y-clip"
            >
              <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
                <UFormGroup size="xl" label="Ausbildung" :ui="formgroupUi">
                  <UInput v-model="formData.educationName" placeholder="Medizinstudium" icon="i-heroicons-user" />
                </UFormGroup>
                <UFormGroup size="xl" label="Ausbildung" :ui="formgroupUi">
                  <UInput v-model="formData.educationPeriod" placeholder="2945 - 2948" icon="i-heroicons-user" />
                </UFormGroup>
              </div>
              <UFormGroup v-model="formData.educationPlace" size="xl" label="Ort" :ui="formgroupUi">
                <!-- TODO: HOCHSCHULEN ALS AUSWAHL -->
                <span class="text-danger">SOON</span>
              </UFormGroup>
            </Motion>
          </Presence>
          <h4 class="mt-2 mb-1">Detaillierte Informationen:</h4>
          <!-- TODO: ANWEISUNG, DASS EIN "," EINEN NEUEM LISTEN-ITEM ENTSPRICHT -->
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Hobbys" :ui="formgroupUi">
              <UInput v-model="formData.hobbys" placeholder="Sport, Fliegen, Schrauben" icon="i-heroicons-user" />
            </UFormGroup>
            <UFormGroup size="xl" label="Freizeitgestaltung" :ui="formgroupUi">
              <UInput v-model="formData.activities" placeholder="Fischen, Kochen" icon="i-heroicons-user" />
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Talente" :ui="formgroupUi">
              <UInput
                v-model="formData.talents"
                placeholder="Spricht Sprache X, Handwerklich begabt"
                icon="i-heroicons-user"
              />
            </UFormGroup>
            <UFormGroup size="xl" label="Angewohnheiten" :ui="formgroupUi">
              <UInput
                v-model="formData.habits"
                placeholder="Überspielt Unsicherheit mit Humor"
                icon="i-heroicons-user"
              />
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Tics & Marotten" :ui="formgroupUi">
              <UInput v-model="formData.tics" placeholder="Hat fragwürdigen Humor" icon="i-heroicons-user" />
            </UFormGroup>
            <UFormGroup size="xl" label="Ängste" :ui="formgroupUi">
              <UInput v-model="formData.fears" placeholder="Hat Angst im Dunkeln" icon="i-heroicons-user" />
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Hervorstechender Charakterzug" :ui="formgroupUi">
              <UInput v-model="formData.character" placeholder="Ist sehr loyal" icon="i-heroicons-user" />
            </UFormGroup>
            <UFormGroup size="xl" label="Rästelhafte Züge" :ui="formgroupUi">
              <UInput
                v-model="formData.mysterious"
                placeholder="Spricht ungern über Ereignis X"
                icon="i-heroicons-user"
              />
            </UFormGroup>
          </div>
          <h5 class="mt-2 mb-1">Geschmäcker:</h5>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Musik" :ui="formgroupUi">
              <UInput v-model="formData.music" placeholder="Rock Musik, EDM, Metal, ..." icon="i-heroicons-user" />
            </UFormGroup>
            <UFormGroup size="xl" label="Filme" :ui="formgroupUi">
              <UInput v-model="formData.movies" placeholder="Star Trek, Star Wars, ..." icon="i-heroicons-user" />
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <!-- TODO: Tipps, verseexkurs - literatur -->
            <UFormGroup size="xl" label="Bücher" :ui="formgroupUi">
              <UInput v-model="formData.books" placeholder="Brochuren von Hersteller X, ..." icon="i-heroicons-user" />
            </UFormGroup>
            <UFormGroup size="xl" label="Kleidung" :ui="formgroupUi">
              <UInput v-model="formData.clothing" placeholder="Lederjacken, ..." icon="i-heroicons-user" />
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Speisen" :ui="formgroupUi">
              <UInput v-model="formData.food" placeholder="Big Bennys Nudeln, ..." icon="i-heroicons-user" />
            </UFormGroup>
            <UFormGroup size="xl" label="Getränke" :ui="formgroupUi">
              <UInput v-model="formData.drinks" placeholder="Vestal Wasser, ..." icon="i-heroicons-user" />
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" label="Alkohol" :ui="formgroupUi">
              <UInput v-model="formData.alcohol" placeholder="Schmolz Bier, ..." icon="i-heroicons-user" />
            </UFormGroup>
            <UFormGroup size="xl" label="Farben" :ui="formgroupUi">
              <UInput v-model="formData.colors" placeholder="Schwarz, Blau, ..." icon="i-heroicons-user" />
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between xl:flex-nowrap gap-x-4">
            <UFormGroup size="xl" :label="user?.pronom + ' liebt...'" :ui="formgroupUi">
              <UInput v-model="formData.loves" placeholder="Hochwertige Schiffe, ..." icon="i-heroicons-user" />
            </UFormGroup>
            <UFormGroup size="xl" :label="user?.pronom + ' hasst...'" :ui="formgroupUi">
              <UInput v-model="formData.hates" placeholder="Drake, ..." icon="i-heroicons-user" />
            </UFormGroup>
          </div>
          <h5 class="mt-2 mb-1">Medizinisch Relevantes:</h5>
          <UFormGroup size="xl" :ui="formgroupUi">
            <UTextarea
              v-model="formData.medicalinfo"
              resize
              :rows="8"
              :placeholder="'- Rechte Hand große Narbe verursacht durch eine Piratenklinge \n- Linke Ohrmuschel nicht vorhanden durch einen schlimmen Rennsport-Unfall'"
            />
          </UFormGroup>
          <TableHr> Biografie </TableHr>
          <!-- TODO: ADD EDITOR -->
          <UFormGroup size="xl" label="Biografie">
            <ClientOnly>
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
            </ClientOnly>
          </UFormGroup>
        </UForm>
      </div>
    </div>
  </NuxtLayout>
</template>

<style>
.tox-statusbar__right-container {
  display: none;
}
/* .tox-editor-container {
  display: inline-flex;
  position: relative;
  width: 100%;
  padding: 0;
  font-size: 1rem;
  line-height: 1.5rem;
  border-width: 0px;
  border-radius: 0.375rem;
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  --tw-bg-opacity: 1;
  background-color: rgb(17 17 17 / var(--tw-bg-opacity));
  --tw-bg-opacity: 0.6;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
  --tw-ring-inset: inset;
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(34 34 34 / var(--tw-ring-opacity));
  appearance: none;
  border-color: rgb(109 109 109 / var(--tw-border-opacity, 1)); */
/* @apply placeholder-gray-500 form-input; */
/* } */
/* .tox-editor-container:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}
.tox-editor-container:focus-within {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(0 255 232 / var(--tw-ring-opacity));
  outline: 2px solid transparent;
  outline-offset: 2px;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
.tox-editor-container::placeholder {
  --tw-placeholder-opacity: 1;
  color: rgb(111 111 111 / var(--tw-placeholder-opacity));
} */
</style>

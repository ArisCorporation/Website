<script setup lang="ts">
const { directus, readUsers, readSingleton, readItems } = useCMS();
const { query } = useRoute();
const homepageTabsStore = useHomepageTabsStore();
// const scrollMargin = ref('scroll-m-14');
const scrollMargin = ref('scroll-m-0');

const { data: homeData } = await useAsyncData('HOME', () => directus.request(readSingleton('home')));
const { data: globalData } = await useAsyncData('HOME:GLOBAL_DATA', () =>
  directus.request(readSingleton('global_data')),
);

const { data: users } = await useAsyncData(
  'HOME:USERS',
  () =>
    directus.request(
      readUsers({
        fields: [
          'id',
          'title',
          'first_name',
          'last_name',
          'slug',
          'avatar',
          'roles',
          'head_of_department',
          'role.id',
          'role.label',
        ],
        filter: {
          status: { _eq: 'active' },
          hidden: { _eq: false },
        },
        limit: -1,
        sort: ['first_name'],
      }),
    ),
  {
    transform: (rawUsers) => rawUsers.map((rawUser) => transformUser(rawUser)),
  },
);
// const users = computed(() => usersRes.map((user: IRawUser) => transformUser(user)));

const { data: departments } = await useAsyncData(
  'HOME:DEPARTMENTS',
  () =>
    directus.request(
      readItems('departments', {
        fields: [
          'id',
          'name',
          'logo',
          'store_image.id',
          'gallery.directus_files_id',
          'description',
          'employees.first_name',
          'employees.last_name',
          'employees.title',
          'employees.slug',
          'head_of_department.id',
          'head_of_department.first_name',
          'head_of_department.last_name',
          'head_of_department.title',
          'head_of_department.slug',
          'head_of_department.avatar',
        ],
        sort: ['name'],
      }),
    ),
  {
    transform: (rawDepartments: any[]) =>
      rawDepartments.map((rawDepartment: any) => transformDepartment(rawDepartment)),
  },
);
// const departments = computed(() => departmentsRes.map((department: any) => transformDepartment(department)));

const { data: userHangars } = await useAsyncData(
  'HOME:HANGARS',
  () =>
    directus.request(
      readItems('user_hangars', {
        fields: [
          'id',
          'name',
          'name_public',
          'user_id.first_name',
          'user_id.last_name',
          'user_id.title',
          'user_id.slug',
          'ship_id.name',
          'ship_id.slug',
          'ship_id.store_image',
          'ship_id.manufacturer.name',
          'ship_id.manufacturer.slug',
          'ship_id.classification',
          'ship_id.crew_min',
          'ship_id.crew_max',
          'ship_id.price',
          'ship_id.cargo',
          'ship_id.length',
          'ship_id.beam',
          'ship_id.height',
          'active_module.id',
          'active_module.name',
          'department.name',
          'department.logo',
        ],
        filter: {
          visibility: { _eq: 'public' },
          group: { _eq: 'ariscorp' },
          planned: { _eq: false },
        },
        sort: ['ship_id.name'],
        limit: -1,
      }),
    ),
  { transform: (rawHangars: any[]) => rawHangars.map((rawHangar: any) => transformHangarItem(rawHangar)) },
);
// const userHangars = computed(() => userHangarsRes.map((hangar: any) => transformHangarItem(hangar)));

const { data: commLinks } = await useAsyncData(
  'HOME:COMM-LINKS',
  () =>
    directus.request(
      readItems('comm_links', {
        fields: ['id', 'name', 'banner', 'description', 'channel.name', 'channel.description', 'date_created'],
        filter: {
          status: { _eq: 'published' },
        },
        sort: ['-date_created'],
        limit: 4,
      }),
    ),
  { transform: (rawCommLinks: any[]) => rawCommLinks.map((rawCommLink: any) => transformCommLink(rawCommLink)) },
);
// const commLinks = computed(() => commLinksRes.map((link: any) => transformCommLink(link)));

const { data: partners } = await useAsyncData(
  'HOME:PARTNERS',
  () =>
    directus.request(
      readItems('partners', {
        fields: ['logo', 'name', 'url'],
        filter: {
          status: { _eq: 'published' },
        },
        sort: ['name'],
        limit: -1,
      }),
    ),
  { transform: (rawPartners: any[]) => rawPartners.map((rawPartner: any) => transformPartner(rawPartner)) },
);
// const partners = computed(() => partnersRes.map((partner: any) => transformPartner(partner)));

if (
  !homeData.value ||
  !users.value ||
  !departments.value ||
  !userHangars.value ||
  !commLinks.value ||
  !partners.value
) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Es können bestimmte Daten nicht abgerufen werden!',
    fatal: true,
  });
}

const aristabs: any[] = [
  {
    header: 'Die ArisCorp',
    content: homeData.value?.ariscorp_description,
  },
  {
    header: 'Geschichte',
    content: homeData.value?.ariscorp_history,
  },
  {
    header: 'Manifest',
    content: homeData.value?.ariscorp_manifest,
  },
  {
    header: 'Charter',
    content: homeData.value?.ariscorp_charta,
  },
];

const ourtabs: any[] = [
  {
    header: 'Mitarbeiter',
    component: 'HomeSectionMembers',
    componentData: users.value,
  },
  {
    header: 'Flotte',
    component: 'HomeSectionFleet',
    componentData: { fleetData: userHangars.value, departmentData: departments.value },
  },
  {
    header: 'Abteilungen',
    component: 'HomeSectionDepartments',
    componentData: departments.value,
  },
];

if (query) {
  if (query.aris) {
    homepageTabsStore.setArisTab(Number(query.aris));
  }
  if (query.our) {
    homepageTabsStore.setOurTab(Number(query.our));
  }
  if (query.fleet) {
    homepageTabsStore.setOurFleetTab(Number(query.fleet));
  }
  if (query.department) {
    homepageTabsStore.setOurDepartmentTab(Number(query.department));
  }
}

onMounted(() => {
  setTimeout(() => (scrollMargin.value = 'scroll-m-28'));
});

definePageMeta({
  path: '/',
});
</script>

<template>
  <div>
    <TabGroup
      id="ariscorp"
      :class="scrollMargin"
      :store="homepageTabsStore.selectedArisTab"
      :change="homepageTabsStore.setArisTab"
      :tablist="aristabs"
      title="über"
      between
    >
      <template #tabcontent>
        <template v-if="homepageTabsStore.selectedArisTab === 0">
          <Editor :model-value="homeData?.ariscorp_description" read-only />
          <ImageHoverEffect
            src="2983446c-d4a8-4df4-b63d-aa46f0f8eabe"
            alt="Made by the Community"
            class="w-1/4 mx-auto"
          />
        </template>
        <template v-if="homepageTabsStore.selectedArisTab === 1">
          <Editor :model-value="homeData?.ariscorp_history" read-only />
        </template>
        <template v-if="homepageTabsStore.selectedArisTab === 2">
          <Editor :model-value="homeData?.ariscorp_manifest" read-only />
        </template>
        <template v-if="homepageTabsStore.selectedArisTab === 3">
          <Editor :model-value="homeData?.ariscorp_charta" read-only />
        </template>
      </template>
    </TabGroup>
    <div id="fleet" class="scroll-m-[-840px] md:scroll-m-[-990px] lg:scroll-m-[-750px] xl:scroll-m-[-600px]" />
    <TabGroup
      id="our"
      :class="scrollMargin"
      :store="homepageTabsStore.selectedOurTab"
      :change="(e) => homepageTabsStore.setOurTab(e)"
      :tablist="ourtabs"
      title="unsere"
      between
    />
    <HomeSectionCommLink id="comm-link" :class="scrollMargin" :data="commLinks" />
    <HomeSectionRecruitment id="recruitment" :class="scrollMargin" :data="{ dcLink: globalData.discord_link }" />
    <HomeSectionPartner id="partners" :class="scrollMargin" :data="partners" />
  </div>
</template>

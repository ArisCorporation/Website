<script setup lang="ts">
const { readSingleton, readItems } = useDirectusItems();
const { readUsers } = useDirectusUsers();
const { query } = useRoute();
const homepageTabsStore = useHomepageTabsStore();
const scrollMargin = ref('scroll-m-14');

const home_data = await readSingleton('home');

const usersRes = await readUsers({
  fields: ['id', 'title', 'first_name', 'last_name', 'slug', 'avatar', 'roles', 'head_of_department', 'role.*'],
  filter: {
    status: { _eq: 'active' },
  },
  limit: -1,
  sort: ['first_name'],
});
const users = computed(() => usersRes.map((user: IRawUser) => transformUser(user)));

const departmentsRes = await readItems('departments', {
  fields: [
    'id',
    'name',
    'logo',
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
});
const departments = computed(() => departmentsRes.map((department: any) => transformDepartment(department)));

const userHangarsRes = await readItems('user_hangars', {
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
    'ship_id.storeImage',
    'ship_id.manufacturer.name',
    'ship_id.manufacturer.slug',
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
});
const userHangars = computed(() => userHangarsRes.map((hangar: any) => transformHangarItem(hangar)));

const commLinksRes = await readItems('comm_links', {
  fields: ['id', 'title', 'banner', 'description', 'channel.name', 'channel.description', 'date_created'],
  filter: {
    status: { _eq: 'published' },
  },
  sort: ['-date_created'],
  limit: 4,
});
const commLinks = computed(() => commLinksRes.map((link: any) => transformCommLink(link)));

const partnersRes = await readItems('partners', {
  fields: ['logo', 'name', 'url'],
  filter: {
    status: { _eq: 'published' },
  },
  sort: ['name'],
  limit: -1,
});
const partners = computed(() => partnersRes.map((partner: any) => transformPartner(partner)));

if (!home_data || !users || !departments || !userHangars || !commLinks || !partners) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Es können bestimmte Daten nicht abgerufen werden!',
    fatal: true,
  });
}

const aristabs = [
  {
    header: 'Die ArisCorp',
    content: home_data?.ariscorp_description,
  },
  {
    header: 'Geschichte',
    content: home_data?.ariscorp_history,
  },
  {
    header: 'Manifest',
    content: home_data?.ariscorp_manifest,
  },
  {
    header: 'Charter',
    content: home_data?.ariscorp_charta,
  },
];
const ourtabs = [
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
    />
    <div id="fleet" class="scroll-m-[-840px] md:scroll-m-[-990px] lg:scroll-m-[-750px] xl:scroll-m-[-600px]" />
    <TabGroup
      id="our"
      :class="scrollMargin"
      :store="homepageTabsStore.selectedOurTab"
      :change="homepageTabsStore.setOurTab"
      :tablist="ourtabs"
      title="unsere"
      between
    />
    <HomeSectionCommLink id="comm-link" :class="scrollMargin" :data="commLinks" />
    <HomeSectionRecruitment id="recruitment" :class="scrollMargin" :data="{ dcLink: home_data.discord_link }" />
    <HomeSectionPartner id="partners" :class="scrollMargin" :data="partners" />
  </div>
</template>

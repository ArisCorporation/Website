<script setup lang="ts">
const { getItems, getSingletonItem } = useDirectusItems();

const {
  data: theArisCorp,
  // pending: pending_the_ariscorp,
  // error: error_the_ariscorp,
  // refresh: refresh_the_ariscorp,
} = await useAsyncData(
  'theArisCorp',
  () =>
    getSingletonItem({
      collection: 'die_ariscorp',
      params: {
        fields: ['text'],
      },
    }),
  {
    transform: (data: any) => {
      return data.text;
    },
  },
);

const {
  data: history,
  pending: pending_history,
  error: error_history,
  refresh: refresh_history,
} = await useAsyncData(
  'ariscorpHistory',
  () =>
    getSingletonItem({
      collection: 'ariscorp_history',
      params: {
        fields: ['text'],
      },
    }),
  {
    transform: (data: any) => {
      return data.text;
    },
  },
);

const {
  data: manifest,
  pending: pending_manifest,
  error: error_manifest,
  refresh: refresh_manifest,
} = await useAsyncData(
  'manifest',
  () =>
    getSingletonItem({
      collection: 'manifest',
      params: {
        fields: ['text'],
      },
    }),
  {
    transform: (data: any) => {
      return data.text;
    },
  },
);

const {
  data: charta,
  pending: pending_charta,
  error: error_charta,
  refresh: refresh_charta,
} = await useAsyncData(
  'charta',
  () =>
    getSingletonItem({
      collection: 'charta',
      params: {
        fields: ['text'],
      },
    }),
  {
    transform: (data: any) => {
      return data.text;
    },
  },
);

const {
  data: members,
  pending: pending_members,
  error: error_members,
  refresh: refresh_members,
} = await useAsyncData(
  'members',
  () =>
    getItems({
      collection: 'member',
      params: {
        fields: [
          'id',
          'title',
          'firstname',
          'lastname',
          'slug',
          'member_potrait.id',
          'roles',
          'head_of_department',
          'position_level',
        ],
        filter: {
          status: 'published',
        },
        limit: -1,
        sort: ['firstname'],
      },
    }),
  {
    transform: (data: any) => {
      return data.map((obj) => transformMember(obj));
    },
  },
);

const {
  data: departments,
  pending: pending_departments,
  error: error_departments,
  refresh: refresh_departments,
} = await useAsyncData(
  'departments',
  () =>
    getItems({
      collection: 'gameplays',
      params: {
        fields: [
          'id',
          'gameplay_name',
          'gameplay_logo.id',
          'gameplay_bild_links.id',
          'gameplay_bild_rechts.id',
          'text',
          'ships',
          'members.id',
          'members.firstname',
          'members.lastname',
          'members.title',
          'members.slug',
          'head_of_department.id',
          'head_of_department.firstname',
          'head_of_department.lastname',
          'head_of_department.title',
          'head_of_department.slug',
          'head_of_department.member_potrait.id',
        ],
        filter: {
          status: 'published',
        },
        limit: -1,
        sort: ['gameplay_name'],
      },
    }),
  {
    transform: (data: any) => {
      return data.map((obj) => transformDepartment(obj));
    },
  },
);

const {
  data: fleet,
  pending: pending_fleet,
  error: error_fleet,
  refresh: refresh_fleet,
} = await useAsyncData(
  'fleet',
  () =>
    getItems({
      collection: 'member_ships',
      params: {
        fields: [
          'id',
          'name',
          'member_id.firstname',
          'member_id.lastname',
          'member_id.title',
          'member_id.slug',
          'ships_id.name',
          'ships_id.slug',
          'ships_id.storeImage.id',
          'ships_id.manufacturer.firmen_name',
          'ships_id.manufacturer.slug',
          'department.gameplay_name',
          'department.gameplay_logo.id',
        ],
        filter: {
          visibility: { _eq: 'public' },
          group: { _eq: 'ariscorp' },
        },
        sort: ['ships_id.name'],
        limit: -1,
      },
    }),
  {
    transform: (data: any) => {
      return data.map((obj: any) => transformHangarItem(obj));
    },
  },
);

const fleetSectionData = {
  fleetData: fleet.value,
  departmentData: departments.value,
};

const {
  data: commLinks,
  pending: pending_commLinks,
  error: error_commLinks,
  refresh: refresh_commLinks,
} = await useAsyncData(
  'comm_links',
  () =>
    getItems({
      collection: 'comm_links',
      params: {
        fields: [
          'id',
          'comm_link_titel',
          'comm_link_banner.id',
          'comm_link_beschreibung',
          'comm_link_channel.channel',
          'date_created',
        ],
        filter: {
          status: { _eq: 'published' },
        },
        sort: ['-date_created'],
        limit: 4,
      },
    }),
  {
    transform: (data: any) => {
      return data.map((obj: any) => transformCommLink(obj));
    },
  },
);

const {
  data: recruitment,
  // pending: pending_recruitment,
  // error: errorrecruitment,
  // refresh: refresh_recruitment,
} = await useAsyncData(
  'homepage',
  () =>
    getSingletonItem({
      collection: 'homepage',
      params: {
        fields: ['discordLink'],
      },
    }),
  {
    transform: (data: any) => {
      return { dcLink: data.discordLink };
    },
  },
);

const {
  data: partners,
  pending: pending_partner,
  error: error_partner,
  refresh: refresh_partner,
} = await useAsyncData(
  'partner',
  () =>
    getItems({
      collection: 'partner',
      params: {
        fields: ['id', 'partner_logo.id', 'partner_name', 'partner_website'],
        filter: {
          status: { _eq: 'published' },
        },
        sort: ['partner_name'],
        limit: -1,
      },
    }),
  {
    transform: (data: any) => {
      return data.map((obj: any) => transformPartner(obj));
    },
  },
);

definePageMeta({
  layout: 'default',
});

const aristabs = [
  {
    header: 'Die ArisCorp',
    content: theArisCorp.value,
  },
  {
    header: 'Geschichte',
    content: history.value,
  },
  {
    header: 'Manifest',
    content: manifest.value,
  },
  {
    header: 'Charter',
    content: charta.value,
  },
];

const ourtabs = [
  {
    header: 'Mitarbeiter',
    component: 'HomeSectionMembers',
    componentData: members,
  },
  {
    header: 'Flotte',
    component: 'HomeSectionFleet',
    componentData: fleetSectionData,
  },
  {
    header: 'Abteilungen',
    component: 'HomeSectionDepartments',
    componentData: departments.value,
  },
];
</script>

<template>
  <div>
    <TabGroup :tablist="aristabs" title="über" between />
    <TabGroup :tablist="ourtabs" title="unsere" between />
    <HomeSectionCommLink :data="commLinks" />
    <HomeSectionRecruitment :data="recruitment" />
    <HomeSectionPartner :data="partners" />
  </div>
</template>

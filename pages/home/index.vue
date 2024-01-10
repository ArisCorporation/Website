<script setup lang="ts">
// const { getItems, getSingletonItem } = useDirectusItems();
// const { getUsers } = useDirectusUsers();
// const { query } = useRoute();
// const homepageTabsStore = useHomepageTabsStore();
// const scrollMargin = ref('scroll-m-14');

// const { data } = await useAsyncData('homepage-data', async () => {
//   const [theArisCorp, history, manifest, charta, members, departments, fleet, commLink, recruitment, partners] =
//     await Promise.all([
//       getSingletonItem({
//         collection: 'die_ariscorp',
//         params: {
//           fields: ['text'],
//         },
//       }),
//       getSingletonItem({
//         collection: 'ariscorp_history',
//         params: {
//           fields: ['text'],
//         },
//       }),
//       getSingletonItem({
//         collection: 'manifest',
//         params: {
//           fields: ['text'],
//         },
//       }),
//       getSingletonItem({
//         collection: 'charta',
//         params: {
//           fields: ['text'],
//         },
//       }),
//       getUsers({
//         params: {
//           fields: ['id', 'title', 'first_name', 'last_name', 'slug', 'avatar', 'roles', 'head_of_department', 'role'],
//           filter: {
//             status: { _eq: 'active' },
//           },
//           limit: -1,
//           sort: ['first_name'],
//         },
//       }),
//       getItems({
//         collection: 'gameplays',
//         params: {
//           fields: [
//             'id',
//             'gameplay_name',
//             'gameplay_logo.id',
//             'gameplay_bild_links.id',
//             'gameplay_bild_rechts.id',
//             'text',
//             'ships',
//             'members.id',
//             'members.firstname',
//             'members.lastname',
//             'members.title',
//             'members.slug',
//             'head_of_department.id',
//             'head_of_department.firstname',
//             'head_of_department.lastname',
//             'head_of_department.title',
//             'head_of_department.slug',
//             'head_of_department.member_potrait.id',
//           ],
//           filter: {
//             status: { _eq: 'published' },
//           },
//           limit: -1,
//           sort: ['gameplay_name'],
//         },
//       }),
//       getItems({
//         collection: 'member_ships',
//         params: {
//           fields: [
//             'id',
//             'name',
//             'namePublic',
//             'user_id.first_name',
//             'user_id.last_name',
//             'user_id.title',
//             'user_id.slug',
//             'ship_id.name',
//             'ship_id.slug',
//             'ship_id.storeImage.id',
//             'ship_id.manufacturer.firmen_name',
//             'ship_id.manufacturer.slug',
//             'department.gameplay_name',
//             'department.gameplay_logo.id',
//           ],
//           filter: {
//             visibility: { _eq: 'public' },
//             group: { _eq: 'ariscorp' },
//             planned: { _eq: false },
//           },
//           sort: ['ship_id.name'],
//           limit: -1,
//         },
//       }),
//       getItems({
//         collection: 'comm_links',
//         params: {
//           fields: [
//             'id',
//             'comm_link_titel',
//             'comm_link_banner.id',
//             'comm_link_beschreibung',
//             'comm_link_channel.channel',
//             'comm_link_channel.beschreibung',
//             'date_created',
//           ],
//           filter: {
//             status: { _eq: 'published' },
//           },
//           sort: ['-date_created'],
//           limit: 4,
//         },
//       }),
//       getSingletonItem({
//         collection: 'homepage',
//         params: {
//           fields: ['discordLink'],
//         },
//       }),
//       getItems({
//         collection: 'partner',
//         params: {
//           fields: ['id', 'partner_logo.id', 'partner_name', 'partner_website'],
//           filter: {
//             status: { _eq: 'published' },
//           },
//           sort: ['partner_name'],
//           limit: -1,
//         },
//       }),
//     ]);

//   if (
//     !theArisCorp ||
//     !history ||
//     !manifest ||
//     !charta ||
//     !members ||
//     !departments ||
//     !fleet ||
//     !commLink ||
//     !recruitment ||
//     !partners
//   ) {
//     return null;
//   }

//   return {
//     theArisCorp: theArisCorp.text,
//     history: history.text,
//     manifest: manifest.text,
//     charta: charta.text,
//     members: members.map((obj) => transformUser(obj)),
//     departments: departments.map((obj) => transformDepartment(obj)),
//     fleetData: {
//       fleetData: fleet.map((obj) => transformHangarItem(obj)),
//       departmentData: departments.map((obj) => transformDepartment(obj)),
//     },
//     commLink: commLink.map((obj) => transformCommLink(obj)),
//     recruitment: { dcLink: recruitment.discordLink },
//     partners: partners.map((obj) => transformPartner(obj)),
//   };
// });

// if (!data.value) {
//   throw createError({
//     statusCode: 500,
//     statusMessage: 'Es können bestimmte Daten nicht abgerufen werden!',
//     fatal: true,
//   });
// }

// const aristabs = [
//   {
//     header: 'Die ArisCorp',
//     content: data.value?.theArisCorp,
//   },
//   {
//     header: 'Geschichte',
//     content: data.value?.history,
//   },
//   {
//     header: 'Manifest',
//     content: data.value?.manifest,
//   },
//   {
//     header: 'Charter',
//     content: data.value?.charta,
//   },
// ];
// const ourtabs = [
//   {
//     header: 'Mitarbeiter',
//     component: 'HomeSectionMembers',
//     componentData: data.value?.members,
//   },
//   {
//     header: 'Flotte',
//     component: 'HomeSectionFleet',
//     componentData: data.value?.fleetData,
//   },
//   {
//     header: 'Abteilungen',
//     component: 'HomeSectionDepartments',
//     componentData: data.value?.departments,
//   },
// ];

// if (query) {
//   if (query.aris) {
//     homepageTabsStore.setArisTab(Number(query.aris));
//   }
//   if (query.our) {
//     homepageTabsStore.setOurTab(Number(query.our));
//   }
//   if (query.fleet) {
//     homepageTabsStore.setOurFleetTab(Number(query.fleet));
//   }
//   if (query.department) {
//     homepageTabsStore.setOurDepartmentTab(Number(query.department));
//   }
// }
// console.log(data.value.members);
// onMounted(() => {
//   setTimeout(() => (scrollMargin.value = 'scroll-m-28'));
// });

definePageMeta({
  path: '/',
});
</script>

<template>
  <div>
    <h1 class="text-center">Currently disabled</h1>
    <!-- <TabGroup
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
    <HomeSectionCommLink id="comm-link" :class="scrollMargin" :data="data?.commLink" />
    <HomeSectionRecruitment id="recruitment" :class="scrollMargin" :data="data?.recruitment" />
    <HomeSectionPartner id="partners" :class="scrollMargin" :data="data?.partners" /> -->
  </div>
</template>

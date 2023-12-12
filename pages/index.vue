<script setup lang="ts">
const { getItems, getSingletonItem } = useDirectusItems();
const route = useRoute();
const homepageTabsStore = useHomepageTabsStore();

const { data } = await useAsyncData('cart-discount', async () => {
  const [theArisCorp, history, manifest, charta, members, departments, fleet, commLink, recruitment, partners] =
    await Promise.all([
      getSingletonItem({
        collection: 'die_ariscorp',
        params: {
          fields: ['text'],
        },
      }),
      getSingletonItem({
        collection: 'ariscorp_history',
        params: {
          fields: ['text'],
        },
      }),
      getSingletonItem({
        collection: 'manifest',
        params: {
          fields: ['text'],
        },
      }),
      getSingletonItem({
        collection: 'charta',
        params: {
          fields: ['text'],
        },
      }),
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
      getSingletonItem({
        collection: 'homepage',
        params: {
          fields: ['discordLink'],
        },
      }),
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
    ]);

  return {
    theArisCorp: theArisCorp.text,
    history: history.text,
    manifest: manifest.text,
    charta: charta.text,
    members: members.map((obj) => transformMember(obj)),
    departments: departments.map((obj) => transformDepartment(obj)),
    fleetData: {
      fleetData: fleet.map((obj) => transformHangarItem(obj)),
      departmentData: departments.map((obj) => transformDepartment(obj)),
    },
    commLink: commLink.map((obj) => transformCommLink(obj)),
    recruitment: { dcLink: recruitment.discordLink },
    partners: partners.map((obj) => transformPartner(obj)),
  };
});

definePageMeta({
  layout: 'default',
});

const aristabs = [
  {
    header: 'Die ArisCorp',
    content: data.value?.theArisCorp,
  },
  {
    header: 'Geschichte',
    content: data.value?.history,
  },
  {
    header: 'Manifest',
    content: data.value?.manifest,
  },
  {
    header: 'Charter',
    content: data.value?.charta,
  },
];
const ourtabs = [
  {
    header: 'Mitarbeiter',
    component: 'HomeSectionMembers',
    componentData: data.value?.members,
  },
  {
    header: 'Flotte',
    component: 'HomeSectionFleet',
    componentData: data.value?.fleetData,
  },
  {
    header: 'Abteilungen',
    component: 'HomeSectionDepartments',
    componentData: data.value?.departments,
  },
];
if (route.query.aris) {
  homepageTabsStore.setArisTab(Number(route.query.aris));
}
if (route.query.our) {
  homepageTabsStore.setOurTab(Number(route.query.our));
}
if (route.query.fleet) {
  homepageTabsStore.setOurFleetTab(Number(route.query.fleet));
}
if (route.query.department) {
  homepageTabsStore.setOurDepartmentTab(Number(route.query.department));
}
</script>

<template>
  <div>
    <TabGroup
      id="ariscorp"
      class="scroll-m-28"
      :store="homepageTabsStore.selectedArisTab"
      :change="homepageTabsStore.setArisTab"
      :tablist="aristabs"
      title="über"
      between
    />
    <TabGroup
      id="our"
      class="scroll-m-28"
      :store="homepageTabsStore.selectedOurTab"
      :change="homepageTabsStore.setOurTab"
      :tablist="ourtabs"
      title="unsere"
      between
    />
    <HomeSectionCommLink id="comm-link" class="scroll-m-28" :data="data?.commLink" />
    <HomeSectionRecruitment id="recruitment" class="scroll-m-28" :data="data?.recruitment" />
    <HomeSectionPartner id="partners" class="scroll-m-28" :data="data?.partners" />
  </div>
</template>

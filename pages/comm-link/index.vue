<script setup lang="ts">
const { readItems } = useDirectusItems();
const selectedChannel = ref('Alle');
const search = ref('');

const commLinks = await readItems('comm_links', {
  fields: [
    'id',
    'comm_link_titel',
    'comm_link_banner.id',
    'comm_link_channel.channel',
    'comm_link_channel.beschreibung',
    'date_created',
  ],
  filter: {
    status: { _eq: 'published' },
  },
  limit: -1,
  sort: ['-date_created'],
});

const channelsRes = await readItems('comm_link_channels', {
  fields: ['id', 'name', 'description'],
  limit: -1,
  sort: ['name'],
});
const channels = computed(() => channelsRes.map((obj) => obj.name));

// const { data } = await useAsyncData('comm-link-data', async () => {
//   const [commLinks, channels] = await Promise.all([
//     getItems({
//       collection: 'comm_links',
//       params: {
//         fields: [
//           'id',
//           'comm_link_titel',
//           'comm_link_banner.id',
//           'comm_link_channel.channel',
//           'comm_link_channel.beschreibung',
//           'date_created',
//         ],
//         filter: {
//           status: { _eq: 'published' },
//         },
//         limit: -1,
//         sort: ['-date_created'],
//       },
//     }),
//     getItems({
//       collection: 'commm_link_channel',
//       params: {
//         fields: ['id', 'channel', 'beschreibung'],
//         limit: -1,
//         sort: ['channel'],
//       },
//     }),
//   ]);

//   if (!commLinks || !channels) {
//     return null;
//   }

//   return {
//     commLinks,
//     channels: channels.map((obj) => obj.channel),
//   };
// });

if (!commLinks || !channels.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Es konnten nicht alle Daten vollständig empfangen werden!',
    fatal: true,
  });
}

const filterData = computed(() =>
  commLinks.filter((e) =>
    selectedChannel.value !== 'Alle' ? e.comm_link_channel?.channel === selectedChannel.value : e,
  ),
);
const filteredCommLinks = computed(() => {
  return filterData.value
    ?.filter((e: any) => (search.value ? e.comm_link_titel.toLowerCase().includes(search.value.toLowerCase()) : e))
    .map((obj: any) => transformCommLink(obj, filterData.value));
});

definePageMeta({
  layout: 'default',
});
useHead({
  title: 'Comm-Link',
});
</script>
<template>
  <div>
    <div>
      <NuxtImg src="2f7590ef-c84a-495c-8acc-93653f0cddd3" :placeholder="[16, 16, 1, 5]" class="w-full mx-auto" />
      <hr />
      <div class="w-full sm:flex sm:space-x-12">
        <div class="w-full">
          <label for="channelSelect">Channel:</label>
          <USelectMenu
            id="channelSelect"
            v-model="selectedChannel"
            name="Channel"
            placeholder="Channel filtern"
            :options="['Alle', ...channels]"
            size="md"
          />
        </div>
        <UInput v-model="search" size="md" placeholder="Suche..." class="w-full mt-4 sm:mt-auto" />
      </div>
      <div class="my-6">
        <TableHr />
      </div>
    </div>
    <div class="comm-link-grid">
      <CommLinkCard v-for="commLink in filteredCommLinks" :key="commLink.id" :data="commLink" :size="commLink.size" />
    </div>
  </div>
</template>

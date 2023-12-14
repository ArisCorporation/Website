<script setup lang="ts">
const { getItems } = useDirectusItems();
const selectedChannel = ref('Alle');
const search = ref('');

const { data } = await useAsyncData('comm-link-data', async () => {
  const [commLinks, channels] = await Promise.all([
    getItems({
      collection: 'comm_links',
      params: {
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
      },
    }),
    getItems({
      collection: 'commm_link_channel',
      params: {
        fields: ['id', 'channel', 'beschreibung'],
        limit: -1,
        sort: ['channel'],
      },
    }),
  ]);

  return {
    commLinks,
    channels: channels.map((obj) => obj.channel),
  };
});
const filterData = computed(
  () =>
    data.value?.commLinks.filter((e) =>
      selectedChannel.value !== 'Alle' ? e.comm_link_channel?.channel === selectedChannel.value : e,
    ),
);
const filteredCommLinks = computed(() => {
  return filterData.value
    ?.filter((e) => (search.value ? e.comm_link_titel.toLowerCase().includes(search.value.toLowerCase()) : e))
    .map((obj) => transformCommLink(obj, filterData.value));
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
      <NuxtImg class="w-full mx-auto" src="2f7590ef-c84a-495c-8acc-93653f0cddd3" />
      <hr />
      <div class="w-full sm:flex sm:space-x-12">
        <div class="w-full">
          <label for="channelSelect">Channel:</label>
          <USelectMenu
            id="channelSelect"
            v-model="selectedChannel"
            name="Channel"
            placeholder="Channel filtern"
            :options="['Alle', ...data.channels]"
          />
        </div>
        <UInput v-model="search" placeholder="Suche..." class="w-full mt-4 sm:mt-auto" />
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

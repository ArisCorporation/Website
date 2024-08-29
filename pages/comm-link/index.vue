<script setup lang="ts">
const { directus, readItems } = useCMS();
const selectedChannel = ref('Alle');
const search = ref('');
const search_input_value = ref('');

const page = ref(1);
const pageCount = ref(10);
const pageTotal = ref(0);
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));

const filters = reactive({
  status: { _eq: 'published' },
  ...useDirectusSearch(search.value, ['name', 'user_created.first_name', 'user_created.last_name']),
});

watch(search, () => {
  filters._or = useDirectusSearch(search.value, ['name', 'user_created.first_name', 'user_created.last_name'])._or;
});

const { data: commLinksCount } = await useAsyncData(
  'COMM-LINKS:COUNT',
  () =>
    directus.request(
      readItems('comm_links', {
        fields: ['id'],
        filter: filters,
        limit: -1,
        sort: ['-date_created'],
      }),
    ),
  {
    watch: [search, page, pageCount, selectedChannel],
  },
);
watch(
  [commLinksCount],
  () => {
    if (commLinksCount.value) {
      pageTotal.value = commLinksCount.value.length;
    }
  },
  { immediate: true },
);

const { data: commLinks } = await useAsyncData(
  'COMM-LINKS:DATA',
  () =>
    directus.request(
      readItems('comm_links', {
        fields: ['id', 'name', 'banner', 'description', 'channel.name', 'channel.description', 'date_created'],
        filter: filters,
        limit: pageCount.value,
        page: page.value,
        sort: ['-date_created'],
      }),
    ),
  { watch: [search, page, pageCount, selectedChannel] },
);

const { data: channels } = await useAsyncData(
  'COMM-LINKS:CHANNELS',
  () =>
    directus.request(
      readItems('comm_links_channels', {
        fields: ['id', 'name', 'description'],
        limit: -1,
        sort: ['name'],
      }),
    ),
  {
    transform: (channels: any[]) => channels.map((channel) => channel.name),
  },
);

useSearch(search, search_input_value, {
  debounce: true,
  query: true,
});

const filteredCommLinks = ref(commLinks.value.map((obj: any) => transformCommLink(obj, commLinks.value)));
watch(
  commLinks,
  () => (filteredCommLinks.value = commLinks.value.map((obj: any) => transformCommLink(obj, commLinks.value))),
);

onMounted(() => watch(page, () => window.scrollTo(0, 0)));

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
      <NuxtImg
        src="2f7590ef-c84a-495c-8acc-93653f0cddd3"
        :placeholder="[16, 16, 1, 5]"
        class="w-full h-auto mx-auto aspect-[1118/351]"
      />
      <hr >
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
        <UInput v-model="search_input_value" size="md" placeholder="Suche..." class="w-full mt-4 sm:mt-auto" />
      </div>
      <div class="my-6">
        <TableHr />
      </div>
    </div>
    <div class="comm-link-grid">
      <CommLinkCard v-for="commLink in filteredCommLinks" :key="commLink.id" :data="commLink" :size="commLink.size" />
    </div>
    <div class="col-span-3 py-2">
      <div class="mx-auto mb-2 text-center w-fit">
        <div class="flex justify-center">
          <UPagination v-model="page" :page-count="pageCount" :total="pageTotal" />
        </div>
        <div>
          <span class="text-sm leading-5">
            Zeigt
            <span class="font-medium">{{ pageFrom }}</span>
            bis
            <span class="font-medium">{{ pageTo }}</span>
            von
            <span class="font-medium">{{ pageTotal }}</span>
            Ergebnissen
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

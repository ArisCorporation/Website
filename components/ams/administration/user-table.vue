<script setup lang="ts">
const { getItems } = useDirectusItems();
const { getUsers } = useDirectusUsers();
const { width, height } = useWindowSize();

const { data: baseData } = await useAsyncData('get-administration-data', async () => {
  const [userList] = await Promise.all([
    getUsers({
      params: {
        limit: -1,
        fields: ['id'],
      },
    }),
  ]);

  if (!userList) {
    return null;
  }

  return {
    userCount: userList.length,
  };
});

// USER - Columns
const userTableColumnsOptions = [
  { key: 'id', label: 'Id' },
  // { key: 'potrait' },
  { key: 'title', label: 'Titel', sortable: true },
  { key: 'first_name', label: 'Vorname', sortable: true },
  { key: 'last_name', label: 'Nachname', sortable: true },
  // { key: 'department.gameplay_name', label: 'Abteilung', sortable: true },
  { key: 'discordName', label: 'Discord Benutzername' },
  { key: 'contactEmail', label: 'Kontakt Email' },
  { key: 'state', label: 'Status', sortable: true },
];
const selectedUserTableColumns = ref([...userTableColumnsOptions]);
const userTableColumns = computed(() =>
  userTableColumnsOptions.filter((column) => selectedUserTableColumns.value.includes(column)),
);

// USER - Selected Rows
const selectedUserRows = ref<IMember[]>([]);
function selectUser(row: IMember) {
  const index = selectedUserRows.value.findIndex((item) => item.id === row.id);
  if (index === -1) {
    selectedUserRows.value.push(row);
  } else {
    selectedUserRows.value.splice(index, 1);
  }
}

// USER - Actions

// USER - Filters
const userSearch = ref('');

// USER - Pagination
const userSort = ref({ column: 'first_name', direction: 'asc' as const });
const userPage = ref(1);
const userPageCount = ref(10);
const userPageTotal = ref(baseData.value?.userCount); // This value should be dynamic coming from the API
const userPageFrom = computed(() => (userPage.value - 1) * userPageCount.value + 1);
const userPageTo = computed(() => Math.min(userPage.value * userPageCount.value, userPageTotal.value));

// USER - Data
const { data: users, pending: usersPending } = await useLazyAsyncData(
  'members',
  async () => {
    const [userCount, users] = await Promise.all([
      getUsers({
        params: {
          limit: -1,
          fields: ['id'],
          filter: userSearch.value
            ? {
                _or: [
                  { title: { _icontains: userSearch.value } },
                  { first_name: { _icontains: userSearch.value } },
                  { last_name: { _icontains: userSearch.value } },
                  { discordName: { _icontains: userSearch.value } },
                  { rsiHandle: { _icontains: userSearch.value } },
                  // { department: { gameplay_name: { _icontains: userSearch.value } } },
                ],
              }
            : {},
        },
      }),
      getUsers({
        params: {
          limit: userPageCount.value,
          page: userPage.value,
          sort: [userSort.value.column],
          filter: userSearch.value
            ? {
                _or: [
                  { title: { _icontains: userSearch.value } },
                  { first_name: { _icontains: userSearch.value } },
                  { last_name: { _icontains: userSearch.value } },
                  { discordName: { _icontains: userSearch.value } },
                  { rsiHandle: { _icontains: userSearch.value } },
                  // { department: { gameplay_name: { _icontains: userSearch.value } } },
                ],
              }
            : {},
          fields: [
            'id',
            'title',
            'first_name',
            'last_name',
            'slug',
            'avatar',
            'roles',
            'role',
            //TODO: ADD DEPARTMENT
            // 'head_of_department',
            'discordName',
            'contactEmail',
            'status',
          ],
        },
      }),
    ]);

    userPageCount.value = userCount.length;

    return users;
  },
  {
    default: () => [],
    watch: [userPage, userSearch, userPageCount, userSort],
    transform: (data) => {
      return data.map((obj: IRawUser) => ({ ...obj }));
    },
  },
);

watch([users], () => {
  userPageTotal.value = users.value?.length;
});
</script>

<template>
  <div>
    <UCard
      :ui="{
        body: { padding: 'p-0' },
        header: { padding: 'p-0' },
      }"
    >
      <!-- Header and Filters -->
      <template #header>
        <div class="w-full divide-y divide-btertiary">
          <!-- Header -->
          <h2 class="my-4 ml-6">Mitgliederübersicht</h2>

          <!-- Filters -->
          <div class="w-full divide-y divide-btertiary">
            <div class="flex flex-wrap items-center justify-between w-full px-4 py-4 lg:flex-nowrap">
              <div class="w-full lg:w-1/4">
                <UInput size="md" v-model="userSearch" placeholder="Vorname, Nachname, Abteilung, ..." />
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between w-full px-4 py-4 lg:flex-nowrap">
              <div class="w-full lg:w-1/4 flex gap-1.5 items-center">
                <span class="text-sm leading-5">Einträge pro Seite:</span>

                <USelectMenu v-model="userPageCount" :options="[3, 5, 10, 20, 30, 40, 100]" size="sm" />
              </div>
              <div class="w-full lg:w-1/4">
                <USelectMenu
                  v-model="selectedUserTableColumns"
                  :options="userTableColumnsOptions"
                  multiple
                  placeholder="Columns"
                  size="md"
                >
                  <UButton icon="i-heroicons-view-columns" class="ml-auto"> Spalten </UButton>
                </USelectMenu>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Table -->
      <div>
        <UTable
          v-model="selectedUserRows"
          v-model:sort="userSort"
          :rows="users"
          :columns="userTableColumns"
          :loading="usersPending"
          sort-asc-icon="i-heroicons-arrow-up"
          sort-desc-icon="i-heroicons-arrow-down"
          sort-mode="manual"
          @select="selectUser"
          class="w-full whitespace-nowrap"
        />
      </div>

      <!-- Number of rows & Pagination -->
      <template #footer>
        <div class="flex flex-wrap items-center justify-between">
          <div>
            <span class="text-sm leading-5">
              Showing
              <span class="font-medium">{{ userPageFrom }}</span>
              to
              <span class="font-medium">{{ userPageTo }}</span>
              of
              <span class="font-medium">{{ userPageTotal }}</span>
              results
            </span>
          </div>

          <UPagination v-model="userPage" :page-count="userPageCount" :total="userPageTotal" />
        </div>
      </template>
    </UCard>
  </div>
</template>

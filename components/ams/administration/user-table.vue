<script setup lang="ts">
const { getUsers } = useDirectusUsers();
const userSettingsStore = useUserSettingsStore();
const { userSettings } = storeToRefs(userSettingsStore);

const { data: baseItemCount } = await useAsyncData('get-administration-data', async () =>
  getUsers({
    params: {
      limit: -1,
      fields: ['id'],
    },
  }),
);

// USER - Columns
// TODO: ADD DEPARTMENT AND AVATAR
// { key: 'department.gameplay_name', label: 'Abteilung', sortable: true },
// { key: 'potrait' },
const columns = [
  { key: 'id', label: 'Id' },
  { key: 'status', label: 'Status' },
  { key: 'title', label: 'Titel', sortable: true },
  { key: 'first_name', label: 'Vorname', sortable: true },
  { key: 'last_name', label: 'Nachname', sortable: true },
  { key: 'discordName', label: 'Discord Benutzername' },
  { key: 'contactEmail', label: 'Kontakt Email' },
  { key: 'state', label: 'Status', sortable: true },
];
const columnsTable = computed(() =>
  columns.filter((column) =>
    JSON.stringify(userSettings.value?.ams.administration.userTableColumns).includes(column.key),
  ),
);

// USER - Selected Rows
const selectedRows = ref<IMember[]>([]);
function select(row: IMember) {
  const index = selectedRows.value.findIndex((item) => item.id === row.id);
  if (index === -1) {
    selectedRows.value.push(row);
  } else {
    selectedRows.value.splice(index, 1);
  }
}

// USER - Actions

// USER - Filters
const search = ref('');

// USER - Pagination
const sort = ref({ column: 'first_name', direction: 'asc' as const });
const page = ref(1);
const pageCount = ref(10);
const pageTotal = ref(baseItemCount.value?.length); // This value should be dynamic coming from the API
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));

// USER - Data
const { data, pending, refresh } = await useLazyAsyncData(
  'members',
  async () => {
    const [itemCount, items] = await Promise.all([
      getUsers({
        params: {
          limit: -1,
          fields: ['id', 'email'],
          filter: search.value
            ? {
                _or: [
                  { title: { _icontains: search.value } },
                  { first_name: { _icontains: search.value } },
                  { last_name: { _icontains: search.value } },
                  { discordName: { _icontains: search.value } },
                  { rsiHandle: { _icontains: search.value } },
                  // { department: { gameplay_name: { _icontains: search.value } } },
                ],
              }
            : {},
        },
      }),
      getUsers({
        params: {
          limit: pageCount.value,
          page: page.value,
          sort: [sort.value.column],
          filter: search.value
            ? {
                _or: [
                  { title: { _icontains: search.value } },
                  { first_name: { _icontains: search.value } },
                  { last_name: { _icontains: search.value } },
                  { discordName: { _icontains: search.value } },
                  { rsiHandle: { _icontains: search.value } },
                  // { department: { gameplay_name: { _icontains: search.value } } },
                ],
              }
            : {},
          fields: [
            'id',
            'title',
            'first_name',
            'last_name',
            'email',
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

    pageTotal.value = itemCount.length;

    return {
      items: items.map((obj: IRawUser) => ({
        ...obj,
        statusValue: obj.status,
        status:
          obj.status === 'draft'
            ? 'Entwurf'
            : obj.status === 'invited'
              ? 'Eingeladen'
              : obj.status === 'active'
                ? 'Freigeschalten'
                : obj.status === 'suspended'
                  ? 'Gesperrt'
                  : obj.status === 'archived' && 'Archiviert',
      })),
      allItems: itemCount.map((obj: IRawUser) => ({ ...obj })),
    };
  },
  {
    default: () => [],
    watch: [page, search, pageCount, sort],
  },
);

defineExpose({
  refresh,
  items: data.value.allItems,
});

onMounted(() => {
  if (!userSettings.value.ams.administration.userTableColumns) {
    userSettingsStore.AMSAdministrationSetUserTableColumns(columns);
  }
});
</script>

<template>
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
              <UInput size="md" v-model="search" placeholder="Vorname, Nachname, Abteilung, ..." />
            </div>
          </div>
          <div class="flex flex-wrap items-center justify-between w-full px-4 py-4 gap-y-1.5">
            <div class="w-fit flex gap-1.5 items-center">
              <span class="text-sm leading-5">Einträge pro Seite:</span>

              <USelectMenu v-model="pageCount" :options="[3, 5, 10, 20, 30, 40, 100]" size="sm" />
            </div>
            <div class="w-fit flex flex-wrap text-center gap-1.5 items-center ml-auto">
              <ButtonDefault
                :disabled="!(selectedRows.length > 0 && selectedRows.every((e) => e.statusValue !== 'active'))"
                @click="
                  !(selectedRows.length > 0 && selectedRows.every((e) => e.status !== 'active')) &&
                    $emit('unlock', selectedRows)
                "
                color="success"
                class="w-fit"
                size="xs"
              >
                <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-lock-open" />Freischalten</span>
              </ButtonDefault>
              <ButtonDefault
                :disabled="!(selectedRows.length > 0 && selectedRows.every((e) => e.statusValue === 'active'))"
                @click="
                  !(selectedRows.length > 0 && selectedRows.every((e) => e.status === 'active')) &&
                    $emit('lock', selectedRows)
                "
                color="danger"
                class="w-fit"
                size="xs"
              >
                <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-lock-closed" />Sperren</span>
              </ButtonDefault>
              <ButtonDefault
                @click="!selectedRows.length < 1 && $emit('delete', selectedRows)"
                :disabled="selectedRows.length < 1"
                color="danger"
                class="w-fit"
                size="xs"
              >
                <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-trash" />Löschen</span>
              </ButtonDefault>
              <ButtonDefault
                @click="selectedRows.length === 1 && $emit('edit', selectedRows[0])"
                :disabled="selectedRows.length !== 1"
                color="secondary"
                class="w-fit"
                size="xs"
              >
                <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-pencil" />Editieren</span>
              </ButtonDefault>
              <ButtonDefault
                @click="!selectedRows.length > 0 && $emit('create')"
                :disabled="selectedRows.length > 0"
                color="success"
                class="w-fit"
                size="xs"
              >
                <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-plus" />Erstellen</span>
              </ButtonDefault>
              <USelectMenu
                :model-value="
                  userSettings.ams.administration.userTableColumns?.map((column) =>
                    columns.find((e) => e.key === column.key),
                  )
                "
                @update:model-value="userSettingsStore.AMSAdministrationSetUserTableColumns($event)"
                :options="columns"
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
        v-model="selectedRows"
        v-model:sort="sort"
        :rows="data.items"
        :columns="columnsTable"
        :loading="pending"
        sort-asc-icon="i-heroicons-arrow-up"
        sort-desc-icon="i-heroicons-arrow-down"
        sort-mode="manual"
        @select="select"
        class="w-full whitespace-nowrap"
      />
    </div>

    <!-- Number of rows & Pagination -->
    <template #footer>
      <div class="flex flex-wrap items-center justify-between">
        <div>
          <span class="text-sm leading-5">
            Showing
            <span class="font-medium">{{ pageFrom }}</span>
            to
            <span class="font-medium">{{ pageTo }}</span>
            of
            <span class="font-medium">{{ pageTotal }}</span>
            results
          </span>
        </div>

        <UPagination v-model="page" :page-count="pageCount" :total="pageTotal" />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const { getItems } = useDirectusItems();
const { getUsers } = useDirectusUsers();
const { width, height } = useWindowSize();

const { data } = await useAsyncData('get-administration-data', async () => {
  const [members] = await Promise.all([
    getUsers({
      params: {
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

  if (!members) {
    return null;
  }

  return {
    members: members.map((obj: IRawUser) => transformUser(obj)),
  };
});

const userTableColumnsOptions = [
  { key: 'id', label: 'Id' },
  // { key: 'potrait' },
  { key: 'title', label: 'Titel', sortable: true },
  { key: 'firstname', label: 'Vorname', sortable: true },
  { key: 'lastname', label: 'Nachname', sortable: true },
  { key: 'position.position', label: 'Position', sortable: true },
  { key: 'department', label: 'Abteilung', sortable: true },
  { key: 'discordName', label: 'Discord Benutzername' },
  { key: 'contactEmail', label: 'Kontakt Email' },
  { key: 'state', label: 'Status', sortable: true },
];

const selectedUserTableColumns = ref([...userTableColumnsOptions]);
const userTableColumns = computed(() =>
  userTableColumnsOptions.filter((column) => selectedUserTableColumns.value.includes(column)),
);
const selectedUsers = ref([]);

const userQ = ref('');
const filteredUserRows = computed(() => {
  if (!userQ.value) {
    return data.value?.members ?? [];
  }
  console.log('test');

  return data.value?.members.filter(
    (e: any) =>
      e.firstname?.toLowerCase().includes(userQ.value?.toLowerCase()) ||
      e.lastname?.toLowerCase().includes(userQ.value?.toLowerCase()) ||
      e.position.position?.toLowerCase().includes(userQ.value?.toLowerCase()) ||
      e.discordName?.toLowerCase().includes(userQ.value?.toLowerCase()) ||
      e.contactEmail?.toLowerCase().includes(userQ.value?.toLowerCase()) ||
      e.state?.toLowerCase().includes(userQ.value?.toLowerCase()),
  );
});

definePageMeta({
  layout: false,
  middleware: [
    'auth',
    async function (to, from) {
      const { fetchUser, setUser } = useDirectusAuth();
      const user = transformUser(useDirectusUser().value);
      if (!user) {
        const user = await fetchUser();
        setUser(user.value);
      }
      if (user.position.permissionLevel < 4) {
        return navigateTo({
          path: '/ams',
        });
      }
    },
  ],
});

useHead({
  title: 'Administration',
});
</script>

<template>
  <div>
    <!-- <div class="top-0 left-0 w-full rounded-b h-14 bg-bsecondary"></div> -->
    <NuxtLayout name="ams">
      <div class="max-w-[calc(100vw_-_20rem)] mx-auto">
        <h1 class="text-center">Verwaltungsdashboard</h1>
        <UTabs
          :items="[{ label: 'Home' }, { label: 'Verwaltungsübersicht' }, { label: 'Benutzer' }, { label: 'Hangars' }]"
          :ui="{ list: { background: 'bg-bsecondary', marker: { background: 'bg-bprimary' } } }"
          :orientation="width > 1024 ? 'horizontal' : 'vertical'"
        >
          <template #item="{ item }">
            <div v-if="item.label === 'Home'">
              <h2>Home</h2>
            </div>
            <div v-else-if="item.label === 'Verwaltungsübersicht'">
              <h2>Verwaltungsübersicht</h2>
            </div>
            <div v-else-if="item.label === 'Benutzer'">
              <div>
                <div>
                  <UCard
                    :ui="{
                      body: { padding: 'p-0' },
                      header: { padding: 'p-0' },
                    }"
                  >
                    <template #header>
                      <div class="w-full divide-y divide-btertiary">
                        <h2 class="my-4 ml-6">Mitgliederübersicht</h2>
                        <div class="flex flex-wrap justify-between w-full px-4 py-4 lg:flex-nowrap">
                          <div class="w-full lg:w-1/4">
                            <UInput size="md" v-model="userQ" placeholder="Vorname, Nachname, Abteilung, ..." />
                          </div>
                          <div class="w-full lg:w-1/4">
                            <USelectMenu
                              color="table"
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
                    </template>
                    <div>
                      <UTable
                        class="whitespace-nowrap"
                        v-model="selectedUsers"
                        :sort="{
                          column: 'firstname',
                          direction: 'asc',
                        }"
                        :columns="userTableColumns"
                        :rows="filteredUserRows"
                      />
                    </div>
                  </UCard>
                </div>
              </div>
            </div>
            <div v-else-if="item.label === 'Hangars'">
              <h2>Hangars</h2>
            </div>
          </template>
        </UTabs>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { width, height } = useWindowSize();

const userTableColumns = [
  { key: 'id', label: 'Id' },
  // { key: 'potrait' },
  { key: 'title', label: 'Titel', sortable: true },
  { key: 'firstname', label: 'Vorname', sortable: true },
  { key: 'lastname', label: 'Nachname', sortable: true },
  { key: 'position', label: 'Position', sortable: true },
  { key: 'department', label: 'Abteilung', sortable: true },
  { key: 'discordName', label: 'Discord Benutzername' },
  { key: 'contactEmail', label: 'Kontakt Email' },
  { key: 'created', label: 'Erstellt', sortable: true },
  { key: 'state', label: 'Status', sortable: true },
  { key: 'crud' },
];

const selectedUserTableColumns = ref([...userTableColumns]);
const selectedUsers = ref([]);

const userQ = ref('');
const filteredUserRows = computed(() => {
  if (!userQ.value) {
    return test;
  }

  return test.filter(
    (e) =>
      e.firstname.toLowerCase().includes(userQ.value.toLowerCase()) ||
      e.lastname.toLowerCase().includes(userQ.value.toLowerCase()) ||
      e.position.toLowerCase().includes(userQ.value.toLowerCase()) ||
      e.discordName.toLowerCase().includes(userQ.value.toLowerCase()) ||
      e.contactEmail.toLowerCase().includes(userQ.value.toLowerCase()) ||
      e.state.toLowerCase().includes(userQ.value.toLowerCase()),
  );
});

const test = [
  {
    id: 'idsadsdasdasdjasp',
    potrait: '',
    title: '',
    firstname: 'Thomas',
    lastname: 'Blakeney',
    position: 'Verwaltung',
    department: 'Logistik',
    discordName: 'thomas_blakeney',
    contactEmail: 'contact@mail.de',
    created: '2021-07-24',
    updated: '2021-07-24',
    updated3: '2021-07-24',
    state: 'Active',
  },
  {
    id: 'idsadsdasdasdjasp',
    potrait: '',
    title: '',
    firstname: 'Thomas',
    lastname: 'Blakeney',
    position: 'Verwaltung',
    discordName: 'thomas_blakeney',
    contactEmail: 'contact@mail.de',
    created: '2021-07-24',
    updated: '2021-07-24',
    updated3: '2021-07-24',
    state: 'Active',
  },
  {
    id: 'idsadsdasdasdjasp',
    potrait: '',
    title: '',
    firstname: 'Thomas',
    lastname: 'Blakeney',
    position: 'Verwaltung',
    discordName: 'thomas_blakeney',
    contactEmail: 'contact@mail.de',
    created: '2021-07-24',
    updated: '2021-07-24',
    updated3: '2021-07-24',
    state: 'Active',
  },
  {
    id: 'idsadsdasdasdjasp',
    potrait: '',
    title: '',
    firstname: 'Thomas',
    lastname: 'Blakeney',
    position: 'Verwaltung',
    discordName: 'thomas_blakeney',
    contactEmail: 'contact@mail.de',
    created: '2021-07-24',
    updated: '2021-07-24',
    updated3: '2021-07-24',
    state: 'Active',
  },
  {
    id: 'idsadsdasdasdjasp',
    potrait: '',
    title: '',
    firstname: 'Thomas',
    lastname: 'Blakeney',
    position: 'Verwaltung',
    discordName: 'thomas_blakeney',
    contactEmail: 'contact@mail.de',
    created: '2021-07-24',
    updated: '2021-07-24',
    updated3: '2021-07-24',
    state: 'Active',
  },
  {
    id: 'idsadsdasdasdjasp',
    potrait: '',
    title: '',
    firstname: 'Thomas',
    lastname: 'Blakeney',
    position: 'Verwaltung',
    discordName: 'thomas_blakeney',
    contactEmail: 'contact@mail.de',
    created: '2021-07-24',
    updated: '2021-07-24',
    updated3: '2021-07-24',
    state: 'Active',
  },
  {
    id: 'idsadsdasdasdjasp',
    potrait: '',
    title: '',
    firstname: 'Thomas',
    lastname: 'Blakeney',
    position: 'Verwaltung',
    discordName: 'thomas_blakeney',
    contactEmail: 'contact@mail.de',
    created: '2021-07-24',
    updated: '2021-07-24',
    updated3: '2021-07-24',
    state: 'Active',
  },
];

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
      <div>
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
                      <h2 class="my-4 ml-6">Mitgliederübersicht</h2>
                    </template>
                    <div class="divide-y divide-btertiary">
                      <div class="w-full">
                        <div class="flex flex-wrap justify-between w-full px-4 py-4 lg:flex-nowrap">
                          <div class="w-full lg:w-1/4">
                            <UInput size="md" v-model="userQ" placeholder="Vorname, Nachname, Abteilung, ..." />
                          </div>
                          <div class="w-full lg:w-1/4">
                            <USelectMenu
                              color="table"
                              v-model="selectedUserTableColumns"
                              :options="userTableColumns"
                              multiple
                              placeholder="Columns"
                              size="md"
                            >
                              <UButton icon="i-heroicons-view-columns" class="ml-auto"> Spalten </UButton>
                            </USelectMenu>
                          </div>
                        </div>
                        <!-- <div class="flex flex-wrap justify-between w-full px-4 py-4 lg:flex-nowrap">
                        <div class="w-full lg:w-1/4">
                          <UInput size="md" v-model="userQ" placeholder="Vorname, Nachname, Abteilung, ..." />
                        </div>
                        <div class="w-full lg:w-1/4">
                          <USelectMenu
                            color="table"
                            v-model="selectedUserTableColumns"
                            :options="userTableColumns"
                            multiple
                            placeholder="Columns"
                            size="md"
                          >
                            <UButton icon="i-heroicons-view-columns" class="ml-auto"> Spalten </UButton>
                          </USelectMenu>
                        </div>
                      </div> -->
                      </div>
                      <UTable
                        class="whitespace-nowrap"
                        v-model="selectedUsers"
                        :sort="{
                          column: 'firstname',
                          direction: 'asc',
                        }"
                        :columns="selectedUserTableColumns"
                        :rows="filteredUserRows"
                        :ui="{
                          base: 'min-w-full table-fixed block overflow-x-auto max-w-[calc(100vw_-_20rem)] mx-auto',
                        }"
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

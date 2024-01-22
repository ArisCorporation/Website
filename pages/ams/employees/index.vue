<script setup lang="ts">
const { getItems } = useDirectusItems();
const { getUsers } = useDirectusUsers();
const selectedDepartment = ref({ name: 'Alle' });
const search = ref('');
const hideMembers = ref(false);
const filteredMembers = ref();

const { data } = await useAsyncData('ams-employee-board', async () => {
  const [departments, members] = await Promise.all([
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
          status: { _eq: 'published' },
        },
        limit: -1,
        sort: ['gameplay_name'],
      },
    }),
    getUsers({
      params: {
        // TODO: ADD DEPARTMENT
        fields: ['id', 'title', 'first_name', 'last_name', 'slug', 'avatar', 'roles', 'head_of_department', 'role'],
        filter: {
          status: { _eq: 'active' },
        },
        limit: -1,
        sort: ['first_name'],
      },
    }),
  ]);

  if (!departments || !members) {
    return null;
  }

  return {
    members: members.map((obj) => transformUser(obj)),
    departments: departments.map((obj) => transformDepartment(obj)),
  };
});

if (!data.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung des Personalverzeichnisses konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const updateMembers = () =>
  selectedDepartment.value.id
    ? (filteredMembers.value = data.value?.members.filter((e) => e.department?.id === selectedDepartment.value.id))
    : (filteredMembers.value = data.value?.members);
// const updateMembers = () => (filteredMembers.value = data.value.members);

updateMembers();

watch(selectedDepartment, async () => {
  hideMembers.value = true;
  await setTimeout(() => {
    updateMembers();
    hideMembers.value = false;
  }, 500);
});

definePageMeta({
  middleware: 'auth',
  layout: 'ams',
});
</script>

<template>
  <div>
    <div class="flex flex-wrap-reverse justify-center px-6 mx-auto my-4 lg:justify-between gap-y-4 gap-x-12">
      <ArisUFormGroup size="xl" class="w-full lg:w-80" label="Abteilung">
        <USelectMenu
          id="departmentSelect"
          v-model="selectedDepartment"
          searchable
          clear-search-on-close
          searchable-placeholder="Suche..."
          :search-attributes="['name']"
          name="Abteilung"
          placeholder="Abteilung filtern"
          :options="[{ name: 'Alle' }, ...data.departments]"
          :ui="{
            leading: {
              padding: {
                xl: 'ps-10',
              },
            },
          }"
        >
          <template v-if="selectedDepartment?.name !== 'Alle'" #leading />
          <template #label>
            <UAvatar
              img-class="object-cover object-top"
              :src="selectedDepartment.logo ? $config.public.fileBase + selectedDepartment.logo + '?format=webp' : null"
              :alt="selectedDepartment.name || 'Alle'"
            />
            <span>{{ selectedDepartment.name }}</span>
          </template>
          <template #option="{ option: department }">
            <UAvatar
              img-class="object-cover object-top"
              :src="department.logo ? $config.public.fileBase + department.logo + '?format=webp' : null"
              :alt="department.name"
            />
            <span>{{ department.name }}</span>
          </template>
        </USelectMenu>
        <button
          v-if="selectedDepartment?.name !== 'Alle'"
          @click="selectedDepartment = { name: 'Alle' }"
          class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
        >
          <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
        </button>
      </ArisUFormGroup>
      <ArisUFormGroup size="xl" class="w-full lg:w-80" label="Suchen">
        <UInput
          size="2xl"
          v-model="search"
          class="my-auto"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Suche..."
        />
        <button
          v-if="search !== ''"
          @click="search = ''"
          type="button"
          class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
        >
          <UIcon name="i-heroicons-x-mark-16-solid" class="my-auto transition opacity-75 hover:opacity-100" />
        </button>
      </ArisUFormGroup>
    </div>
    <div class="flex flex-wrap justify-center">
      <MemberCard
        v-for="member in filteredMembers.filter((e) => e.fullName.toLowerCase().includes(search.toLowerCase()))"
        :key="member"
        :data="member"
        :hidden="hideMembers"
        hangar-link
        ams
      />
    </div>
  </div>
</template>

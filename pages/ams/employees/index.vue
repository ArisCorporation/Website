<script setup lang="ts">
const { readAsyncItems } = useDirectusItems();
const { readAsyncUsers } = useDirectusUsers();
const selectedDepartment = ref({ name: 'Alle' });
const search = ref('');
const search_input = ref();
const hideMembers = ref(false);
const filteredMembers = ref();

const { data: departments } = await readAsyncItems('departments', {
  query: {
    fields: [
      'id',
      'name',
      'logo',
      'ships',
      'employees.id',
      'employees.first_name',
      'employees.last_name',
      'employees.title',
      'employees.slug',
      'head_of_department.id',
      'head_of_department.first_name',
      'head_of_department.last_name',
      'head_of_department.title',
      'head_of_department.slug',
      'head_of_department.avatar',
    ],
    filter: {
      status: { _eq: 'published' },
    },
    limit: -1,
    sort: ['name'],
  },
  transform: (departments: any[]) => departments.map((department) => transformDepartment(department)),
});

const { data: users } = await readAsyncUsers({
  query: {
    fields: [
      'id',
      'title',
      'first_name',
      'last_name',
      'slug',
      'avatar',
      'roles',
      'head_of_department',
      'department',
      'leading_department',
      'role',
    ],
    filter: {
      status: { _eq: 'active' },
    },
    limit: -1,
    sort: ['first_name'],
  },
  transform: (users: IRawUser[]) => users.map((user) => transformUser(user)),
});

if (!departments.value || !users.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung des Personalverzeichnisses konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const updateMembers = () =>
  selectedDepartment.value.id
    ? (filteredMembers.value = users.value.filter((e) => e.department_id === selectedDepartment.value.id))
    : (filteredMembers.value = users.value);
// const updateMembers = () => (filteredMembers.value = data.value.members);

updateMembers();

watch(selectedDepartment, async () => {
  hideMembers.value = true;
  await setTimeout(() => {
    updateMembers();
    hideMembers.value = false;
  }, 500);
});

defineShortcuts({
  s: {
    handler: () => {
      search_input.value?.input.focus();
    },
  },
});

definePageMeta({
  middleware: 'auth',
  layout: 'ams',
});
</script>

<template>
  <div>
    <div class="flex flex-wrap-reverse justify-center px-6 mx-auto my-4 lg:justify-between gap-y-4 gap-x-12">
      <UFormGroup size="xl" class="w-full lg:w-80" label="Abteilung">
        <USelectMenu
          id="departmentSelect"
          v-model="selectedDepartment"
          searchable
          clear-search-on-close
          searchable-placeholder="Suche..."
          :search-attributes="['name']"
          name="Abteilung"
          placeholder="Abteilung filtern"
          :options="[{ name: 'Alle' }, ...departments]"
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
      </UFormGroup>
      <UFormGroup size="xl" class="w-full lg:w-80" label="Suchen">
        <UInput
          size="2xl"
          v-model="search"
          ref="search_input"
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
      </UFormGroup>
    </div>
    <div class="flex flex-wrap justify-center">
      <MemberCard
        v-for="member in filteredMembers.filter((e: any) => e.full_name.toLowerCase().includes(search.toLowerCase()))"
        :key="member"
        :data="member"
        :hidden="hideMembers"
        hangar-link
        ams
      />
    </div>
  </div>
</template>

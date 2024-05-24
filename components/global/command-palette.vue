<script setup lang="ts">
const isOpen = ref(false);
const router = useRouter();
const toast = useToast();
// const { metaSymbol } = useShortcuts();
const { readUsers } = useDirectusUsers();
const { readItems } = useDirectusItems();

// const commandPaletteRef = ref();

const pages = [
  {
    id: 'homepage',
    label: 'Homepage',
    icon: 'i-heroicons-home-solid',
    to: '/',
    // shortcuts: [metaSymbol, 'Shift', 'H'],
  },
  {
    id: 've',
    label: 'VerseExkurs',
    icon: 'i-heroicons-sun-solid',
    // avatar: {
    //   src: 'https://cms.ariscorp.de/assets/2a7389da-7ad6-46bc-ad4d-ce1b02756d3c',
    // },
    to: '/verseexkurs',
    // shortcuts: [metaSymbol, 'Shift', 'V'],
  },
  {
    id: 'see',
    label: 'ShipExkurs',
    icon: 'i-heroicons-rocket-launch',
    // avatar: {
    //   src: 'https://cms.ariscorp.de/assets/ffe7c93d-6f9e-4335-aae7-8a3db4551b95',
    // },
    to: '/shipexkurs',
    // shortcuts: [metaSymbol, 'Shift', 'S'],
  },
  {
    id: 'ams',
    label: 'ArisCorp Management System',
    icon: 'i-heroicons-user-circle',
    // avatar: {
    //   src: 'https://cms.ariscorp.de/assets/3090187e-6348-4290-a878-af1b2b48c114',
    // },
    to: '/ams',
    // shortcuts: [metaSymbol, 'Shift', 'A'],
  },
];

const ams_commands = [
  {
    id: 'new-ship',
    label: 'Neues Schiff hinzufügen',
    icon: 'i-heroicons-document-plus',
    to: '/ams/hangar#add',
    // shortcuts: [metaSymbol, 'N'],
  },
];

const commands = [
  {
    id: 'new-file',
    label: 'Add new file',
    icon: 'i-heroicons-document-plus',
    click: () => toast.add({ title: 'New file added!' }),
    // shortcuts: [metaSymbol, 'N'],
  },
  {
    id: 'new-folder',
    label: 'Add new folder',
    icon: 'i-heroicons-folder-plus',
    click: () => toast.add({ title: 'New folder added!' }),
    // shortcuts: [metaSymbol, 'F'],
  },
  {
    id: 'hashtag',
    label: 'Add hashtag',
    icon: 'i-heroicons-hashtag',
    click: () => toast.add({ title: 'Hashtag added!' }),
    // shortcuts: [metaSymbol, 'H'],
  },
  {
    id: 'label',
    label: 'Add label',
    icon: 'i-heroicons-tag',
    click: () => toast.add({ title: 'Label added!' }),
    // shortcuts: [metaSymbol, 'L'],
  },
];

const groups = computed(() => [
  // commandPaletteRef.value?.query
  //   ? {
  //       key: 'users',
  //       commands: users,
  //     }
  //   : {
  //       key: 'recent',
  //       label: 'Recent searches',
  //       commands: users.slice(0, 1),
  //     },
  {
    key: 'pages',
    label: 'Sektionen',
    commands: pages,
  },
  {
    key: 'commands',
    label: 'Aktionen',
    commands,
  },
  useDirectusAuth().user && { key: 'ams_commands', commands: ams_commands, label: 'A.M.S. Aktionen' },
  {
    key: 'employees',
    label: (q) => q && `Mitarbeiter passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      // const users = await $fetch<any[]>('https://jsonplaceholder.typicode.com/users', { params: { q } });
      const users = await readUsers({
        fields: [
          'id',
          'title',
          'first_name',
          'last_name',
          'avatar',
          'leading_department.name',
          'department.name',
          'head_of_department',
          'slug',
        ],
        filter: {
          _or: q
            .split(' ')
            .map((word) => [
              { title: { _icontains: word } },
              { first_name: { _icontains: word } },
              { last_name: { _icontains: word } },
              { leading_department: { name: { _icontains: word } } },
              { department: { name: { _icontains: word } } },
              { role: { label: { _icontains: word } } },
            ])
            .flat(),
        },
      });

      return users.map((user) => ({
        id: user.id,
        label: `${user.title ? user.title + ' ' : ''}${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`,
        suffix: `${user.leading_department ? user.leading_department.name : user.department.name} (${user.head_of_department ? 'Abteilungsleiter' : 'Mitarbeiter'})`,
        avatar: {
          src: useRuntimeConfig().public.fileBase + user.avatar,
        },
        to: '/biography/' + user.slug,
      }));
    },
  },
  {
    key: 'ships',
    label: (q) => q && `Schiffe passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      // const users = await $fetch<any[]>('https://jsonplaceholder.typicode.com/users', { params: { q } });
      const ships = await readItems('ships', {
        fields: ['id', 'name', 'manufacturer.name', 'manufacturer.logo', 'store_image', 'slug'],
        filter: {
          _or: q
            .split(' ')
            .map((word) => [
              { name: { _icontains: q } },
              { manufacturer: { name: { _icontains: q } } },
              { manufacturer: { code: { _icontains: q } } },
            ])
            .flat(),
        },
      });

      return ships.map((ship) => ({
        id: ship.id,
        label: ship.name,
        suffix: ship.manufacturer.name,
        avatar: {
          src: useRuntimeConfig().public.fileBase + ship.manufacturer.logo,
        },
        to: '/shipexkurs/ships/' + ship.slug,
      }));
    },
  },
]);

function onSelect(option) {
  if (!option) return;

  if (option.click) {
    option.click();
  } else if (option.to) {
    router.push(option.to);
  } else if (option.href) {
    window.open(option.href, '_blank');
  }

  isOpen.value = false;
}

const ui = {
  wrapper: 'flex flex-col flex-1 min-h-0 divide-y divide-gray-100 dark:divide-gray-800 bg-bprimary/75',
  group: {
    command: {
      active: 'bg-btertiary/75 text-white',
    },
  },
};

defineShortcuts({
  meta_k: {
    handler: () => {
      isOpen.value = !isOpen.value;
    },
  },
});
</script>

<template>
  <div>
    <UModal
      v-model="isOpen"
      :ui="{
        width: 'w-full sm:max-w-2xl',
        overlay: {
          background: 'bg-black/50',
        },
        background: 'bg-transparent',
      }"
    >
      <DefaultPanel>
        <UCommandPalette
          nullable
          :groups="groups"
          icon="i-heroicons-command-line"
          :ui="ui"
          :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
          placeholder="Type something to see the empty label change"
          @update:model-value="onSelect"
        />
      </DefaultPanel>
    </UModal>
  </div>
</template>

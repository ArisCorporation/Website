<script setup lang="ts">
const isOpen = ref(false);
const router = useRouter();
const toast = useToast();
// const { metaSymbol } = useShortcuts();
const { directus, readUsers, readMe, readItems } = useCMS();

const { data: user } = await useAsyncData('AMS:ME', () => directus.request(readMe()));

// const commandPaletteRef = ref();

// Add all pages and actions/commands

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

const ams_pages = [
  {
    id: 'ams-hangar',
    label: 'Hangar',
    icon: 'IconsNavigationHangar',
    to: '/ams/hangar',
  },
  {
    id: 'ams-profile',
    label: 'Profil',
    avatar: {
      src: useRuntimeConfig().public.fileBase + user.value?.avatar,
    },
    to: '/ams/profile',
  },
  {
    id: 'ams-fleet',
    label: 'Flotte',
    icon: 'IconsNavigationFleet',
    to: '/ams/fleet',
  },
  {
    id: 'ams-employees',
    label: 'Mitarbeiter',
    icon: 'IconsNavigationMembers',
    to: '/ams/employees',
  },
];

// const commands = [
//   {
//     id: 'new-file',
//     label: 'Add new file',
//     icon: 'i-heroicons-document-plus',
//     click: () => toast.add({ title: 'New file added!' }),
//     // shortcuts: [metaSymbol, 'N'],
//   },
//   {
//     id: 'new-folder',
//     label: 'Add new folder',
//     icon: 'i-heroicons-folder-plus',
//     click: () => toast.add({ title: 'New folder added!' }),
//     // shortcuts: [metaSymbol, 'F'],
//   },
//   {
//     id: 'hashtag',
//     label: 'Add hashtag',
//     icon: 'i-heroicons-hashtag',
//     click: () => toast.add({ title: 'Hashtag added!' }),
//     // shortcuts: [metaSymbol, 'H'],
//   },
//   {
//     id: 'label',
//     label: 'Add label',
//     icon: 'i-heroicons-tag',
//     click: () => toast.add({ title: 'Label added!' }),
//     // shortcuts: [metaSymbol, 'L'],
//   },
// ];

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
  // {
  //   key: 'commands',
  //   label: 'Aktionen',
  //   commands,
  // },
  ...(user.value ? [{ key: 'amsCommands', commands: ams_commands, label: 'A.M.S. Aktionen' }] : []),
  ...(user.value ? [{ key: 'amsPages', commands: ams_pages, label: 'A.M.S. Seiten' }] : []),
  {
    key: 'employees',
    label: (q) => q && `Mitarbeiter passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      const users = await directus.request(
        readUsers({
          filter: {
            ...useDirectusSearch(q, ['title', 'first_name', 'last_name', 'department.name', 'leading_department.name']),
            hidden: { _eq: false },
          },
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
          limit: 4,
        }),
      );

      return users.map(
        (user: {
          id: string;
          title: string;
          first_name: string;
          last_name: string;
          slug: string;
          avatar: string;
          department: { name: string };
          leading_department: { name: string };
        }) => ({
          id: user.id,
          label: `${user.title ? user.title + ' ' : ''}${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`,
          suffix: `${user.leading_department ? user.leading_department.name : user.department.name} (${
            user.head_of_department ? 'Abteilungsleiter' : 'Mitarbeiter'
          })`,
          avatar: {
            src: useRuntimeConfig().public.fileBase + user.avatar,
          },
          to: '/biography/' + user.slug,
        }),
      );
    },
  },
  {
    key: 'ships',
    label: (q) => q && `Schiffe passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      const ships = await directus.request(
        readItems('ships', {
          filter: {
            ...useDirectusSearch(q, ['name', 'slug', 'manufacturer.name']),
          },
          fields: ['id', 'name', 'slug', 'store_image', 'manufacturer.name', 'manufacturer.logo'],
          limit: 4,
        }),
      );

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
  {
    key: 'companies',
    label: (q) => q && `Firmen passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      const companies = await directus.request(
        readItems('companies', {
          filter: {
            ...useDirectusSearch(q, ['name', 'code', 'slug']),
          },
          fields: ['id', 'name', 'code', 'slug', 'logo'],
          limit: 4,
        }),
      );

      return companies.map((company) => ({
        id: company.id,
        label: company.name,
        suffix: company.code,
        to: '/verseexkurs/companies/' + company.slug,
        avatar: {
          src: useRuntimeConfig().public.fileBase + company.logo,
        },
      }));
    },
  },
  {
    key: 'fractions',
    label: (q) => q && `Fraktionen passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      const fractions = await directus.request(
        readItems('fractions', {
          filter: {
            ...useDirectusSearch(q, ['name', 'code', 'slug']),
          },
          fields: ['id', 'name', 'code', 'slug', 'logo'],
          limit: 4,
        }),
      );

      return fractions.map((fraction) => ({
        id: fraction.id,
        label: fraction.name,
        suffix: fraction.code,
        to: '/verseexkurs/fractions/' + fraction.slug,
        avatar: {
          src: useRuntimeConfig().public.fileBase + fraction.logo,
        },
      }));
    },
  },
  {
    key: 'aliens',
    label: (q) => q && `Alienrassen passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      const aliens = await directus.request(
        readItems('aliens', {
          filter: {
            ...useDirectusSearch(q, ['name', 'slug']),
          },
          fields: ['id', 'name', 'slug', 'banner'],
          limit: 4,
        }),
      );

      return aliens.map((alien) => ({
        id: alien.id,
        label: alien.name,
        to: '/verseexkurs/aliens/' + alien.slug,
        avatar: {
          src: useRuntimeConfig().public.fileBase + alien.banner,
        },
      }));
    },
  },
  {
    key: 'fauna',
    label: (q) => q && `Fauna passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      const faunas = await directus.request(
        readItems('fauna', {
          filter: {
            ...useDirectusSearch(q, ['name', 'slug']),
          },
          fields: ['id', 'name', 'slug', 'banner'],
          limit: 4,
        }),
      );

      return faunas.map((fauna) => ({
        id: fauna.id,
        label: fauna.name,
        to: '/verseexkurs/aliens/fauna?open=' + fauna.slug,
        avatar: {
          src: useRuntimeConfig().public.fileBase + fauna.banner,
        },
      }));
    },
  },
  {
    key: 'flora',
    label: (q) => q && `Flora passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      const floras = await directus.request(
        readItems('flora', {
          filter: {
            ...useDirectusSearch(q, ['name', 'slug']),
          },
          fields: ['id', 'name', 'slug', 'banner'],
          limit: 4,
        }),
      );

      return floras.map((flora) => ({
        id: flora.id,
        label: flora.name,
        to: '/verseexkurs/aliens/flora?open=' + flora.slug,
        avatar: {
          src: useRuntimeConfig().public.fileBase + flora.banner,
        },
      }));
    },
  },
  {
    key: 'systeme',
    label: (q) => q && `Sternensysteme passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      const systems = await directus.request(
        readItems('systems', {
          filter: {
            ...useDirectusSearch(q, [
              'name',
              'orbit.object:stars.name',
              'orbit.object:planets.name',
              'orbit.object:planets.astronomical_designation',
              'orbit.object:planets.landing_zones.name',
              'orbit.object:asteroid_belts.name',
            ]),
          },
          fields: ['id', 'name', 'slug', 'affiliation'],
          limit: 4,
        }),
      );

      return systems.map((system) => ({
        id: system.id,
        label: system.name,
        suffix:
          system.affiliation === 'uee'
            ? 'UEE'
            : system.affiliation === 'in_development'
            ? 'In Entwicklung'
            : system.affiliation === 'unclaimed'
            ? 'Nicht Beansprucht'
            : system.affiliation === 'banu'
            ? 'Banu'
            : system.affiliation === 'xian'
            ? `Xi'An`
            : system.affiliation === 'vanduul' && 'Vanduul',
        to: '/verseexkurs/starmap/' + system.slug,
      }));
    },
  },
  {
    key: 'spectrum_categories',
    label: (q) => q && `Spectrum-Kategorien passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      const categories = await directus.request(
        readItems('spectrum_categories', {
          filter: {
            ...useDirectusSearch(q, ['name', 'slug']),
          },
          fields: ['id', 'name', 'slug', 'banner'],
          limit: 4,
        }),
      );

      return categories.map((category) => ({
        id: category.id,
        label: category.name,
        to: '/verseexkurs/spectrum/' + category.slug,
        avatar: {
          src: useRuntimeConfig().public.fileBase + category.banner,
        },
      }));
    },
  },
  {
    key: 'spectrum_threads',
    label: (q) => q && `Spectrum-Beiträge passend zu “${q}”...`,
    search: async (q) => {
      if (!q) {
        return [];
      }

      const threads = await directus.request(
        readItems('spectrum_threads', {
          filter: {
            ...useDirectusSearch(q, ['name', 'slug', 'category.name']),
          },
          fields: ['id', 'name', 'slug', 'category.slug', 'category.banner'],
          limit: 4,
        }),
      );

      return threads.map((thread) => ({
        id: thread.id,
        label: thread.name,
        to: '/verseexkurs/spectrum/' + thread.category.slug + '/' + thread.slug,
        avatar: {
          src: useRuntimeConfig().public.fileBase + thread.category.banner,
        },
      }));
    },
  },
]);

function onSelect(option: any) {
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

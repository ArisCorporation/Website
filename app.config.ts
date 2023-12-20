export default defineAppConfig({
  ui: {
    strategy: 'override',
    primary: 'aris',
    gray: 'ui-bg',
    notification: {
      position: 'top-0 bottom-auto',
      title: 'text-white',
      background: 'bg-bprimary',
      ring: 'ring-2 ring-bsecondary',
    },
    selectMenu: {
      container: 'z-30 group',
      background: 'bg-bprimary',
      ring: 'ring-1 ring-bsecondary',
      option: {
        base: 'cursor-pointer select-none relative flex items-center justify-between gap-1',
        active: 'bg-bsecondary',
      },
      input:
        'block w-[calc(100%+0.5rem)] focus:ring-transparent text-sm px-3 py-1.5 bg-bsecondary border-0 border-b border-b-primary border-gray-200 focus:border-inherit sticky -top-1 -mt-1 mb-1 -mx-1 z-10 placeholder-gray-400 focus:outline-none',
    },
    select: {
      color: {
        white: {
          outline: 'bg-bprimary shadow-sm ring-1 ring-inset ring-bsecondary focus:ring-2 focus:ring-primary-400',
        },
      },
    },
    input: {
      color: {
        white: {
          outline: 'bg-bprimary shadow-sm ring-1 ring-inset ring-bsecondary focus:ring-2 focus:ring-primary-400',
        },
      },
      size: {
        '2xl': 'text-base',
      },
      gap: {
        '2xl': 'gap-x-2.5',
      },
      padding: {
        '2xl': 'px-3.5 py-3.5',
      },
      leading: {
        padding: {
          '2xl': 'ps-12',
        },
      },
      trailing: {
        padding: {
          '2xl': 'pe-12',
        },
      },
      icon: {
        size: {
          '2xl': 'h-6 w-6',
        },
        leading: {
          padding: {
            '2xl': 'px-3.5',
          },
        },
      },
    },
  },
});

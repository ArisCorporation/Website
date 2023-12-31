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
    textarea: {
      color: {
        white: {
          outline: 'bg-bprimary shadow-sm ring-1 ring-inset ring-bsecondary focus:ring-2 focus:ring-primary-400',
        },
      },
    },
    button: {
      variant: {
        solid:
          'shadow-sm text-white dark:text-gray-900 bg-{color}-500 hover:bg-{color}-600 disabled:bg-{color}-500 dark:bg-{color}-400 dark:hover:bg-{color}-500 dark:disabled:bg-{color}-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-{color}-500 dark:focus-visible:outline-{color}-400',
        outline:
          'ring-1 ring-inset ring-current text-{color}-500 dark:text-{color}-400 hover:bg-{color}-50 disabled:bg-transparent dark:hover:bg-{color}-950 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-{color}-500 dark:focus-visible:ring-{color}-400',
        soft: 'text-{color}-500 dark:text-{color}-400 bg-{color}-50 hover:bg-{color}-100 disabled:bg-{color}-50 dark:bg-{color}-950 dark:hover:bg-{color}-900 dark:disabled:bg-{color}-950 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-{color}-500 dark:focus-visible:ring-{color}-400',
        ghost:
          'text-{color}-500 dark:text-{color}-400 hover:bg-{color}-50 disabled:bg-transparent dark:hover:bg-{color}-950 dark:disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-{color}-500 dark:focus-visible:ring-{color}-400',
        link: 'text-{color}-500 hover:text-{color}-600 disabled:text-{color}-500 dark:text-{color}-400 dark:hover:text-{color}-500 dark:disabled:text-{color}-400 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-{color}-500 dark:focus-visible:ring-{color}-400',
        inputInfo:
          'text-btertiary hover:text-btertiary disabled:cursor-not-allowed disabled:text-bsecondary underline-offset-4 hover:underline focus-visible:ring-0 focus-visible:text-[#555] p-0 ml-2',
      },
    },
    popover: {
      background: 'bg-bsecondary',
      ring: 'ring-1 ring-btertiary',
    },
  },
});

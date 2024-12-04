export default defineAppConfig({
  ui: {
    strategy: 'override',
    primary: 'aris',
    gray: 'ui-bg',
    notification: {
      position: 'top-0 bottom-auto',
      title: 'text-white',
      background: 'bg-bg-800',
      ring: 'ring-2 ring-bsecondary',
    },
    selectMenu: {
      container: 'z-30 group',
      background: 'bg-bg-800',
      ring: 'ring-1 ring-bsecondary',
      option: {
        base: 'cursor-pointer select-none relative flex items-center justify-between gap-1',
        active: 'bg-bg-600',
      },
      input:
        'block w-[calc(100%+0.5rem)] focus:ring-transparent text-sm px-3 py-1.5 bg-bg-600 border-0 border-b border-b-primary border-gray-200 focus:border-inherit sticky -top-1 -mt-1 mb-1 -mx-1 z-10 placeholder-gray-400 focus:outline-none',
    },
    select: {
      color: {
        white: {
          outline: 'bg-bg-800 shadow-sm ring-1 ring-inset ring-bsecondary focus:ring-2 focus:ring-primary-400',
        },
      },
    },
    input: {
      color: {
        white: {
          outline: 'bg-bg-800 shadow-sm ring-1 ring-inset ring-bsecondary focus:ring-2 focus:ring-primary-400',
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
      file: {
        padding: {
          '2xs': 'ps-[85px]',
          xs: 'ps-[87px]',
          sm: 'ps-[96px]',
          md: 'ps-36',
          lg: 'ps-[100px]',
          xl: 'ps-[109px]',
        },
      },
    },
    textarea: {
      color: {
        white: {
          outline: 'bg-bg-800 shadow-sm ring-1 ring-inset ring-bsecondary focus:ring-2 focus:ring-primary-400',
        },
      },
    },
    button: {
      base: 'focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed animate-link',
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
          'text-dark-gray hover:text-light-gray disabled:cursor-not-allowed disabled:text-bsecondary underline-offset-4 hover:underline focus-visible:ring-0 focus-visible:text-[#555] p-0 ml-2 transition',
      },
      color: {
        table: {
          ghost:
            'text-white hover:bg-bg-600 hover:text-secondary font-medium focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-400',
        },
        contextmenu: {
          ghost:
            'text-white hover:bg-bg-600 hover:text-primary font-medium focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-400',
        },
        'accordion-gray': {
          outline:
            'ring-1 ring-inset ring-btertiary/50 text-white hover:bg-bg-600 disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-btertiary',
        },
        inverted: {
          solid:
            'shadow-sm ring-1 ring-inset ring-btertiary text-aris-400 bg-bg-600 hover:bg-gray-800/50 disabled:bg-gray-900 focus-visible:ring-2 focus-visible:ring-primary-400',
        },
        gray: {
          soft: 'text-tbase bg-bg-600 disabled:bg-bg-800 hover:bg-bg-400 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-btertiary',
        },
      },
      padding: {
        '2xl': 'px-3.5 py-2.5',
      },
      square: {
        '2xl': 'p-2.5',
      },
      icon: {
        size: {
          '2xl': 'h-8 w-8',
        },
      },
    },
    popover: {
      background: 'bg-bg-600',
      ring: 'ring-1 ring-btertiary',
    },
    slideover: {
      base: 'relative flex-1 flex flex-col w-full focus:outline-none',
      background: 'bg-bg-800',
      width: 'w-screen max-w-[532px] xl:max-w-2xl',
      overlay: {
        background: 'bg-black/50',
      },
    },
    card: {
      base: 'flex flex-col',
      body: { base: 'flex-1 overflow-auto' },
      background: 'bg-bg-800',
      ring: 'ring-1 ring-btertiary',
      divide: 'divide-y divide-btertiary',
      rounded: 'rounded-lg overflow-clip',
    },
    table: {
      divide: 'divide-y divide-btertiary',
      tbody: 'divide-y divide-btertiary',
      tr: {
        selected: 'bg-bg-600',
        active: 'hover:bg-gray-800/50 cursor-pointer',
      },
      th: {
        color: 'text-white',
        font: 'font-medium',
      },
      td: {
        base: 'whitespace-nowrap',
        padding: 'px-3 py-4',
        color: 'text-tbase',
        font: '',
        size: 'text-sm',
      },
      loadingState: {
        wrapper: 'flex flex-col items-center justify-center flex-1 px-6 py-14 sm:px-14',
        label: 'text-sm text-center text-white',
      },
      emptyState: {
        label: 'text-sm text-center text-white',
        icon: 'w-6 h-6 mx-auto text-gray-500 mb-4',
      },
      default: {
        sortButton: {
          color: 'table',
        },
      },
    },
    pagination: {
      default: {
        inactiveButton: {
          class: '!bg-bg-600',
        },
        firstButton: {
          class: '!bg-bg-600',
        },
        lastButton: {
          class: '!bg-bg-600',
        },
        prevButton: {
          class: '!bg-bg-400',
        },
        nextButton: {
          class: '!bg-bg-400',
        },
      },
    },
    dropdown: {
      background: 'bg-bg-800',
      ring: 'ring-1 ring-btertiary',
      divide: 'divide-y divide-btertiary',
      item: {
        active: 'bg-bg-600 text-white',
      },
    },
    horizontalNavigation: {
      base: 'group relative w-full flex items-center gap-1.5 px-2.5 py-3.5 rounded-md font-medium text-sm focus:outline-0 focus-visible:outline-0 focus-visible:ring-inset focus-visible:ring-0 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-75 animate-link',
    },
  },
});

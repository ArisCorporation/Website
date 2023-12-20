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
        '2xs': 'text-xs',
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-sm',
        xl: 'text-base',
        '2xl': 'text-base',
      },
      gap: {
        '2xs': 'gap-x-1',
        xs: 'gap-x-1.5',
        sm: 'gap-x-1.5',
        md: 'gap-x-2',
        lg: 'gap-x-2.5',
        xl: 'gap-x-2.5',
        '2xl': 'gap-x-2.5',
      },
      padding: {
        '2xs': 'px-2 py-1',
        xs: 'px-2.5 py-1.5',
        sm: 'px-2.5 py-1.5',
        md: 'px-3 py-2',
        lg: 'px-3.5 py-2.5',
        xl: 'px-3.5 py-2.5',
        '2xl': 'px-3.5 py-3.5',
      },
      leading: {
        padding: {
          '2xs': 'ps-7',
          xs: 'ps-8',
          sm: 'ps-9',
          md: 'ps-10',
          lg: 'ps-11',
          xl: 'ps-12',
          '2xl': 'ps-12',
        },
      },
      trailing: {
        padding: {
          '2xs': 'pe-7',
          xs: 'pe-8',
          sm: 'pe-9',
          md: 'pe-10',
          lg: 'pe-11',
          xl: 'pe-12',
          '2xl': 'pe-12',
        },
      },
      icon: {
        size: {
          '2xs': 'h-4 w-4',
          xs: 'h-4 w-4',
          sm: 'h-5 w-5',
          md: 'h-5 w-5',
          lg: 'h-5 w-5',
          xl: 'h-6 w-6',
          '2xl': 'h-6 w-6',
        },
        leading: {
          padding: {
            '2xs': 'px-2',
            xs: 'px-2.5',
            sm: 'px-2.5',
            md: 'px-3',
            lg: 'px-3.5',
            xl: 'px-3.5',
            '2xl': 'px-3.5',
          },
        },
      },
    },
  },
});

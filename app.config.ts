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
      option: { active: 'bg-bsecondary' },
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
    },
  },
});

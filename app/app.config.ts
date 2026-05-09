export default defineAppConfig({
  ui: {
    colors: {
      primary: 'aris',
      secondary: 'industrial',
      neutral: 'zinc'
    },
    button: {
      slots: {
        base: ['active:scale-95']
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'hover:shadow-primary-md hover:bg-(--ui-primary)/90'
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'hover:shadow-primary-sm ring-(--ui-primary)/20 hover:ring-(--ui-primary)/50'
        },
        {
          color: 'primary',
          variant: 'outlinedashed',
          class: 'hover:shadow-primary-sm border-dashed border border-(--ui-primary)/20 hover:bg-(--ui-primary)/10 hover:border-(--ui-primary)/60'
        },
        {
          color: 'error',
          variant: 'solid',
          class: 'hover:shadow-destructive'
        },
      ]
    },
    input: {
      compoundVariants: [
        {
          color: 'primary',
          highlight: true,
          class: 'ring-(--ui-primary)/20'
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'bg-transparent'
        },
      ]
    },
    alert: {
      slots: {
        description: '[&>p]:mb-0'
      }
    }
  }
})

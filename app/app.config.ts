export default defineAppConfig({
  ui: {
    colors: {
      primary: 'aris',
      secondary: 'industrial',
      neutral: 'zinc'
    },
    button: {
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'hover:shadow-primary-md active:scale-95 hover:bg-(--ui-primary)/90'
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'hover:shadow-primary-sm active:scale-95 ring-(--ui-primary)/20 hover:ring-(--ui-primary)/50'
        },
        {
          color: 'error',
          variant: 'solid',
          class: 'hover:shadow-destructive active:scale-95'
        },
      ]
    }
  }
})

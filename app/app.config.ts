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
    card: {
      variants: {
        variant: {
          ams: {
            root: 'ring ring-(--ui-primary)/10 divide-y divide-(--ui-primary)/10 bg-(--ui-bg-muted)/50 backdrop-blur-xs hover:shadow-primary-md',
            header: 'border-0 ams-card-title space-y-1.5 p-6 pb-3'
          }
        }
      }
    },
    alert: {
      slots: {
        description: '[&>p]:mb-0'
      }
    },
    separator: {
      variants: {
        color: {
          ams: {
            border: 'border-(--ui-primary)/10'
          }
        }
      }
    },
    table: {
      slots: {
        base: 'not-prose'
      }
    }
  }
})

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
    radioGroup: {
      variants: {
        variant: {
          amsSpaced: {
            root: 'rounded-lg ring ring-(--ui-primary)/20 p-1 bg-(--ui-bg-muted)/30 justify-center flex space-x-1 items-center h-fit',
            item: 'inline-flex hover:cursor-pointer group items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-(--ui-primary)/90 hover:shadow-[0_0_15px_rgba(0,255,232,0.3)] active:scale-95 h-9 rounded-md px-3 has-data-[state=checked]:bg-(--ui-primary) text-black',
            label: 'text-default group-hover:text-(--ui-text-accented) group-has-data-[state=checked]:text-(--ui-text-accented)'
          }
        }
      }
    },
    table: {
      slots: {
        base: 'not-prose'
      }
    },
    selectMenu: {
      slots: {
        content: ['bg-(--ui-bg-muted)/50 backdrop-blur-sm ring-(--ui-primary)/20'],
        item: 'cursor-pointer data-highlighted:not-data-disabled:before:bg-(--ui-bg-accented)/10 data-highlighted:not-data-disabled:before:backdrop-blur-xs',
        input: 'border-(--ui-primary)/20'
      },
      variants: {
        variant: {
          ams: 'text-highlighted bg-transparent ring ring-inset ring-(--ui-primary)/20',
        }
      }
    }
  }
})

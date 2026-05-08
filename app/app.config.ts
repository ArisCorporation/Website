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
          },
          amsModal: {
            root: 'ring ring-(--ui-primary)/10 divide-y divide-(--ui-primary)/10 bg-(--ui-bg-muted)/50 backdrop-blur-xs hover:shadow-primary-md',
            header: 'ams-card-title space-y-1.5 p-6 pb-3'
          },
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
        root: 'relative overflow-x-auto overflow-y-hidden',
        base: 'min-w-full not-prose',
        thead:
          'relative bg-[linear-gradient(180deg,rgba(0,255,232,0.08)_0%,rgba(9,15,32,0.92)_100%)] supports-[backdrop-filter]:backdrop-blur-sm',
        tbody:
          'divide-y divide-(--ui-primary)/10 [&>tr]:data-[selectable=true]:hover:bg-white/[0.03] [&>tr]:data-[selectable=true]:focus-visible:outline-(--ui-primary)',
        tfoot:
          'bg-[linear-gradient(180deg,rgba(9,15,32,0.88)_0%,rgba(4,9,22,0.96)_100%)]',
        tr: 'transition-colors duration-200 data-[selected=true]:bg-(--ui-primary)/8 hover:bg-white/[0.025]',
        th: 'px-4 py-3 text-left rtl:text-right text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-(--ui-primary) first:ps-5 last:pe-5 [&:has([role=checkbox])]:pe-0',
        td: 'px-4 py-3.5 text-sm text-(--ui-text) align-middle whitespace-nowrap first:ps-5 last:pe-5 [&:has([role=checkbox])]:pe-0',
        separator: 'absolute inset-x-0 bottom-0 h-px bg-(--ui-primary)/18',
        empty: 'py-10 text-center text-sm text-(--ui-text-muted)',
        loading: 'py-10 text-center'
      },
      variants: {
        pinned: {
          true: {
            th: 'sticky bg-[rgba(8,14,28,0.94)] data-[pinned=left]:left-0 data-[pinned=right]:right-0',
            td: 'sticky bg-[rgba(6,11,24,0.92)] data-[pinned=left]:left-0 data-[pinned=right]:right-0'
          }
        },
        sticky: {
          true: {
            thead:
              'sticky top-0 inset-x-0 z-[1] bg-[rgba(8,14,28,0.9)] supports-[backdrop-filter]:backdrop-blur-md',
            tfoot:
              'sticky bottom-0 inset-x-0 z-[1] bg-[rgba(8,14,28,0.9)] supports-[backdrop-filter]:backdrop-blur-md'
          },
          header: {
            thead:
              'sticky top-0 inset-x-0 z-[1] bg-[rgba(8,14,28,0.9)] supports-[backdrop-filter]:backdrop-blur-md'
          },
          footer: {
            tfoot:
              'sticky bottom-0 inset-x-0 z-[1] bg-[rgba(8,14,28,0.9)] supports-[backdrop-filter]:backdrop-blur-md'
          }
        }
      }
    },
    selectMenu: {
      slots: {
        content: ['bg-(--ui-bg-muted)/50 backdrop-blur-sm ring-(--ui-primary)/20'],
        item: 'cursor-pointer data-highlighted:not-data-disabled:before:bg-(--ui-bg-inverted)/5 data-highlighted:not-data-disabled:before:backdrop-blur-xs',
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

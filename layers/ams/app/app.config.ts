export default defineAppConfig({
  ui: {
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
        root: 'relative overflow-x-auto overflow-y-hidden rounded-[inherit] before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:z-[2] before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(0,255,232,0.55),transparent)]',
        base: 'min-w-full border-separate border-spacing-0 not-prose',
        thead:
          'relative bg-[linear-gradient(180deg,rgba(0,255,232,0.12)_0%,rgba(8,15,29,0.96)_58%,rgba(4,9,22,1)_100%)] supports-[backdrop-filter]:backdrop-blur-md',
        tbody:
          '[&>tr+tr>td]:border-t [&>tr+tr>td]:border-(--ui-primary)/10 [&>tr:nth-child(odd)>td]:bg-white/[0.015] [&>tr:hover>td]:bg-[linear-gradient(90deg,rgba(0,255,232,0.07),rgba(255,255,255,0.025)_45%,transparent)] [&>tr[data-selected=true]>td]:bg-(--ui-primary)/10 [&>tr]:data-[selectable=true]:focus-visible:outline-(--ui-primary) [&>tr:last-child>td:first-child]:rounded-bl-[0.95rem] [&>tr:last-child>td:last-child]:rounded-br-[0.95rem] [&>tr:last-child>td:only-child]:rounded-b-[0.95rem]',
        tfoot:
          'bg-[linear-gradient(180deg,rgba(9,15,32,0.88)_0%,rgba(4,9,22,0.96)_100%)]',
        tr: 'group',
        th: 'px-4 py-3 text-left rtl:text-right text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-(--ui-primary) first:ps-5 last:pe-5 [&:has([role=checkbox])]:pe-0 [text-shadow:0_0_14px_rgba(0,255,232,0.18)]',
        td: 'bg-clip-padding px-4 py-3.5 text-sm text-(--ui-text) align-middle whitespace-nowrap first:ps-5 last:pe-5 [&:has([role=checkbox])]:pe-0 group-hover:text-white/95 transition-colors duration-200',
        separator: 'absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,255,232,0.35),transparent)]',
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

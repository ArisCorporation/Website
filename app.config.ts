export default defineAppConfig({
  ui: {
    preference: 'dark',
    colors: {
      primary: 'aris',
      neutral: 'zinc',
    },
    button: {
      base: 'cursor-pointer',
      compoundVariants: [
        {
          color: 'primary',
          variant: 'aris',
          class:
            'text-inherit bg-[var(--ui-bg)] transition-all hover:duration-300 hover:text-[var(--ui-primary)] hover:bg-[var(--ui-bg-accented)] disabled:bg-[var(--ui-bg)]/75 aria-disabled:bg-[var(--ui-bg)]/75 focus-visible:outline-0 relative inline-block border-2 rounded-[calc(var(--ui-radius)*2)] after:h-0.5 before:h-0.5 before:-top-0.5 after:-bottom-0.5 after:absolute after:left-4 after:right-4 before:absolute before:box-border before:left-4 before:right-4 after:bg-[var(--ui-bg-elevated)] before:bg-[var(--ui-bg-elevated)] text-inherit border-[var(--ui-primary)] disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed shadow-[inset_0_0_0_2px_var(--ui-bg)]',
        },
        {
          color: 'secondary',
          variant: 'aris',
          class:
            'text-inherit bg-[var(--ui-bg)] transition-all hover:duration-300 hover:text-[var(--ui-secondary)] hover:bg-[var(--ui-bg-accented)] disabled:bg-[var(--ui-bg)]/75 aria-disabled:bg-[var(--ui-bg)]/75 focus-visible:outline-0 relative inline-block border-2 rounded-[calc(var(--ui-radius)*2)] after:h-0.5 before:h-0.5 before:-top-0.5 after:-bottom-0.5 after:absolute after:left-4 after:right-4 before:absolute before:box-border before:left-4 before:right-4 after:bg-[var(--ui-bg-elevated)] before:bg-[var(--ui-bg-elevated)] text-inherit border-[var(--ui-secondary)] disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed shadow-[inset_0_0_0_2px_var(--ui-bg)]',
        },
        {
          color: 'danger',
          variant: 'aris',
          class:
            'text-inherit bg-[var(--ui-bg)] transition-all hover:duration-300 hover:text-[var(--ui-error)] hover:bg-[var(--ui-bg-accented)] disabled:bg-[var(--ui-bg)]/75 aria-disabled:bg-[var(--ui-bg)]/75 focus-visible:outline-0 relative inline-block border-2 rounded-[calc(var(--ui-radius)*2)] after:h-0.5 before:h-0.5 before:-top-0.5 after:-bottom-0.5 after:absolute after:left-4 after:right-4 before:absolute before:box-border before:left-4 before:right-4 after:bg-[var(--ui-bg-elevated)] before:bg-[var(--ui-bg-elevated)] text-inherit border-[var(--ui-error)] disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed shadow-[inset_0_0_0_2px_var(--ui-bg)]',
        },
      ],
      defaultVariants: {
        color: 'primary',
        variant: 'aris',
        size: 'md',
      },
    },
  },
});

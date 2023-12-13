<template>
  <button
    class="relative inline-block w-full transition border-2 cursor-pointer p-2px group rounded-[10px] after:-bottom-2px after:absolute after:bg-bsecondary after:h-2px after:left-4 after:right-4 before:-top-2px before:absolute before:bg-bsecondary before:box-border before:h-2px before:left-4 before:right-4 bg-bprimary border-primary-400 text-inherit"
  >
    <div
      class="box-border p-2 overflow-hidden text-center rounded-md transition-group group-hover:bg-btertiary group-hover:text-primary-400 whitespace-nowrap text-ellipsis"
    >
      <p class="p-0"><slot /></p>
    </div>
  </button>
</template>

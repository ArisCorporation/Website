<template>
  <div
    class="relative box-border p-[2px] border-2 border-[#6f6f6f] rounded-3xl transition-all duration-500 ease before:absolute before:-top-[2px] before:right-20 before:left-20 before:h-[2px] before:bg-[#444] before:box-border after:absolute after:-bottom-[2px] after:right-20 after:left-20 after:h-[2px] after:bg-[#444] after:box-border"
  >
    <div
      class="relative min-h-[40px] border-[3px] border-opacity-90 rounded-[20px] shadow-sm shadow-white box-border bg-[rgba(39,43,48,.9] before:absolute before:-top-[3px] before:right-10 before:left-10 before:box-border after:box-border before:h-1 before:bg-[#444] before:rounded-b after:absolute after:-bottom-[3px] after:right-10 after:left-10 after:h-1 after:bg-[#444] after:rounded-t border-primary-400"
    >
      <div class="box-border overflow-hidden rounded-2xl">
        <slot />
      </div>
    </div>
  </div>
</template>

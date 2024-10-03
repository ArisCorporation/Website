<template>
  <div>
    <span v-if="$slots.default"><slot /></span>
    <hr />
  </div>
</template>

<style scoped lang="postcss">
hr {
  @apply m-0 my-auto relative bg-bsecondary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400;
}
div {
  @apply flex -mx-1 mt-3 mb-3 col-span-full;
}
span {
  @apply inline-block mr-4 text-2xl min-w-fit h-fit text-white font-bold;
}
</style>

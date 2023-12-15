<template>
  <div>
    <VerseExkursSidebar />
    <div class="flex flex-col justify-between flex-1 min-h-screen lg:ml-64">
      <div class="container px-4 mx-auto">
        <slot />
      </div>
      <Footer />
    </div>
  </div>
</template>

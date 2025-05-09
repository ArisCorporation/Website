<template>
  <div>
    <NavigationNavbar />
    <UiMain>
      <slot />
    </UiMain>
  </div>
</template>

<style>
:root {
  --page-header-height: 6rem;
}
</style>

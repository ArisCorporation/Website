<script setup lang="ts">
const { VERSION, SOURCE_COMMIT, ENVIRONMENT } = useRuntimeConfig().public
</script>

<template>
  <div
    class="w-auto relative h-24 -z-10 ml-auto min-[2690px]:absolute right-4 bottom-4 mt-4"
  >
    <AMSUiElementsMicrotechSystemLogo class="w-auto h-24" />
    <div class="absolute right-2 font-mono bottom-0">
      <span class="text-white/30">Version-</span
      ><span class="text-white/50">{{
        `${VERSION.substr(1)}-${SOURCE_COMMIT?.slice(0, 7) || 'DEV'}.${
          ENVIRONMENT || 'DEVELOPMENT'
        }`
      }}</span>
      <span class="text-white/30">&nbsp;// spec.net</span>
    </div>
  </div>
</template>

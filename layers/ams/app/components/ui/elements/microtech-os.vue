<script setup lang="ts">
const { VERSION, SOURCE_COMMIT, ENVIRONMENT } = useRuntimeConfig().public
</script>

<template>
  <div
    class="w-fit ml-auto relative h-24 mt-4 min-[2690px]:w-fit min-[2690px]:absolute min-[2690px]:right-4 min-[2690px]:bottom-4 min-[2690px]:mt-0 min-[2690px]:-z-10"
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

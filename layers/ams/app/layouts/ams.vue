<script setup lang="ts">
import '~/assets/css/ams.css'
</script>

<template>
  <AMSPageWrapper class="prose prose-invert max-w-none">
    <AMSUiHeader />
    <AMSUiSidebar />
    <AMSPageMain>
      <slot />
      <div
        class="w-auto relative h-24 -z-10 ml-auto min-[2690px]:absolute right-4 bottom-4"
      >
        <AMSUiElementsMicrotechSystemLogo class="w-auto h-24" />
        <div class="absolute right-2 font-mono bottom-0">
          <span class="text-white/30">Version-</span
          ><span class="text-white/50">{{
            `${useRuntimeConfig().public.VERSION.substr(1)}-${
              useRuntimeConfig().public.SOURCE_COMMIT?.slice(0, 7) || 'DEV'
            }.${useRuntimeConfig().public.ENVIRONMENT || 'DEVELOPMENT'}`
          }}</span>
          <span class="text-white/30">&nbsp;// spec.net</span>
        </div>
      </div>
    </AMSPageMain>
  </AMSPageWrapper>
</template>

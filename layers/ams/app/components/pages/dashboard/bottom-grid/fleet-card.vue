<template>
  <div class="rounded-lg border text-[hsl(0 0% 98%)] shadow-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,232,0.15)] border-(--ui-primary)/10 bg-[hsl(240 10% 9%)]/50 backdrop-blur-sm lg:col-span-4">
    <div class="space-y-1.5 p-6 flex flex-row items-center justify-between">
      <div>
        <h3 class="text-2xl font-semibold leading-none tracking-tight transition-colors duration-300 text-white">Flottenstatus</h3>
        <p class="text-sm text-muted-foreground">Übersicht der Organisationsflotte.</p>
      </div>
      <UIcon name="i-material-symbols-bar-chart-4-bars-rounded" class="h-4 w-4 text-(--ui-primary)" />
    </div>
    <div class="p-6 pt-0">
      <USkeleton class="h-[300px] w-full" />
    </div>
  </div>
</template>
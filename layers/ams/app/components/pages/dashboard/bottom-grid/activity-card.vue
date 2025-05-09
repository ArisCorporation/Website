<template>
  <div
    class="rounded-lg border text-[hsl(0 0% 98%)] shadow-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,232,0.15)] border-(--ui-primary)/10 bg-card/50 backdrop-blur-sm lg:col-span-3"
  >
    <div class="flex flex-col space-y-1.5 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3
            class="text-2xl font-semibold leading-none tracking-tight transition-colors duration-300 text-white"
          >
            Letzten Aktivitäten
          </h3>
          <p class="text-sm text-muted-foreground">
            Alle Neuigkeiten der ArisCorp.
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-transparent hover:text-(--ui-primary) hover:border-(--ui-primary)/50 hover:shadow-[0_0_10px_rgba(0,255,232,0.15)] active:scale-95 rounded-md px-3 h-8 border-(--ui-primary)/20 text-(--ui-primary) hover:bg-(--ui-primary)/10"
        >
          <span>View All</span>
          <UIcon
            name="i-material-symbols-arrow-forward-rounded"
            class="ml-2 h-3.5 w-3.5"
          />
        </button>
      </div>
    </div>
    <div class="p-6 pt-0">
      <div class="space-y-4">
        <div
          class="flex items-start space-x-3 rounded-md border border-(--ui-primary)/10 bg-[rgb(10 10 15)]/50 p-3 transition-all hover:bg-(--ui-primary)/5"
        >
          <div
            class="mt-0.5 rounded-full bg-[rgb(10 10 15)] p-1.5 text-(--ui-primary)"
          >
            <UIcon name="i-lucide-user" class="size-4" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-200">
              Neues Mitglied in der ArisCorp: <strong>Thomas Blakeney</strong>
            </p>
            <div class="mt-1 flex items-center text-xs text-gray-400">
              <UIcon name="i-lucide-clock" class="size-3 mr-1" />
              vor 10 Minuten
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<template>
  <div class="space-y-4">
    <div
      class="flex items-start space-x-3 rounded-md border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 p-3 transition-all hover:bg-(--ui-primary)/5"
    >
      <div class="mt-0.5 bg-(--ui-bg-muted) p-1.5 text-(--ui-primary)">
        <UIcon name="i-lucide-user" class="h-4 w-4" />
      </div>
      <div class="flex-1">
        <p class="text-sm text-gray-200">Neues Mitglied: Thomas Blakeney</p>
        <div class="mt-1 flex items-center text-xs text-gray-400">
          <UIcon name="i-lucide-clock" class="mr-1 h-3 w-3" />
          vor 10 Minuten
        </div>
      </div>
    </div>
  </div>
</template>

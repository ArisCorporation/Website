<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-users" class="text-(--ui-primary) size-4" />
      Crews
    </div>
    <AMSPagesCalculatorCrewTable />
    <AMSUiCardSeparator />
    <UAlert
      title="Drag & Drop Funktion"
      icon="i-lucide-arrow-right"
      variant="subtle"
      :ui="{
        icon: 'my-auto',
      }"
    >
      <template #description>
        <p className="text-xs text-(--ui-text-muted) mt-1 flex items-center">
          Ziehe Mitarbeiter auf eine Crew, um sie zuzuweisen
        </p>
      </template>
    </UAlert>
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-user" class="text-(--ui-primary) size-4" />
      Mitarbeiter
    </div>
    <AMSPagesCalculatorWorkerTable />
  </div>
</template>

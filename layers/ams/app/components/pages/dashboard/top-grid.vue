<template>
  <div class="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    <AMSUiCard>
      <AMSUiCardHeader class="flex flex-row items-center justify-between pb-2">
        <AMSUiCardTitle class="text-sm font-medium text-white">
          Total Fleet Size
        </AMSUiCardTitle>
        <UIcon
          name="i-material-symbols-rocket-launch-outline"
          class="h-4 w-4 text-(--ui-primary)"
        />
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <div class="text-2xl font-bold text-white">42</div>
        <p class="text-xs text-muted-foreground">+3 ships since last month</p>
      </AMSUiCardContent>
    </AMSUiCard>
    <AMSUiCard>
      <AMSUiCardHeader class="flex flex-row items-center justify-between pb-2">
        <AMSUiCardTitle class="text-sm font-medium text-white">
          ArisCorp Mitglieder
        </AMSUiCardTitle>
        <UIcon name="i-lucide-users" class="h-4 w-4 text-(--ui-primary)" />
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <div class="text-2xl font-bold text-white">12</div>
        <p class="text-xs text-muted-foreground">+0 ships since last month</p>
      </AMSUiCardContent>
    </AMSUiCard>
    <AMSUiCard>
      <AMSUiCardHeader class="flex flex-row items-center justify-between pb-2">
        <AMSUiCardTitle class="text-sm font-medium text-white">
          TBD
        </AMSUiCardTitle>
        <UIcon name="i-lucide-code-xml" class="h-4 w-4 text-(--ui-primary)" />
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <div class="text-2xl font-bold text-white">TBD</div>
        <p class="text-xs text-muted-foreground">TBD</p>
      </AMSUiCardContent>
    </AMSUiCard>
    <AMSUiCard>
      <AMSUiCardHeader class="flex flex-row items-center justify-between pb-2">
        <AMSUiCardTitle class="text-sm font-medium text-white">
          TBD
        </AMSUiCardTitle>
        <UIcon name="i-lucide-code-xml" class="h-4 w-4 text-(--ui-primary)" />
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <div class="text-2xl font-bold text-white">TBD</div>
        <p class="text-xs text-muted-foreground">TBD</p>
      </AMSUiCardContent>
    </AMSUiCard>
  </div>
</template>

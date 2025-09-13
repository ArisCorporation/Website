<template>
  <div class="mt-6 grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7">
    <AMSUiCard class="lg:col-span-4">
      <AMSUiCardHeader class="flex flex-row items-center justify-between">
        <div>
          <AMSUiCardTitle class="text-white"
            >Fleet Status (COMMING SOON)</AMSUiCardTitle
          >
          <AMSUiCardDescription
            >Overview of your organization's fleet status and
            composition.</AMSUiCardDescription
          >
        </div>
        <UIcon
          name="i-lucide-bar-chart-3"
          class="h-4 w-4 text-(--ui-primary)"
        />
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <div class="w-full h-[300px]" />
      </AMSUiCardContent>
    </AMSUiCard>
    <AMSUiCard class="lg:col-span-3">
      <AMSUiCardHeader>
        <div class="flex items-center justify-between">
          <div>
            <AMSUiCardTitle class="text-white">Recent Activity</AMSUiCardTitle>
            <AMSUiCardDescription>
              Latest updates from your organization. (COMMING SOON)
            </AMSUiCardDescription>
          </div>
          <UButton
            variant="outline"
            trailing
            icon="i-material-symbols-arrow-forward-rounded"
            class="h-8 text-sm whitespace-nowrap"
          >
            <span>View All</span>
          </UButton>
        </div>
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <!-- <AMSPagesDashboardRecentActivity /> -->
      </AMSUiCardContent>
    </AMSUiCard>
  </div>
</template>

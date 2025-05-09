<template>
  <div class="mt-6 grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7">
    <AMSUiCard class="bg-card/50 backdrop-blur-sm lg:col-span-4">
      <AMSUiCardHeader class="flex flex-row items-center justify-between">
        <div>
          <AMSUiCardTitle class="text-white">Fleet Status</AMSUiCardTitle>
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
        <USkeleton class="w-full h-[300px]" />
      </AMSUiCardContent>
    </AMSUiCard>
    <AMSUiCard class="bg-card/50 backdrop-blur-sm lg:col-span-3">
      <AMSUiCardHeader>
        <div class="flex items-center justify-between">
          <div>
            <AMSUiCardTitle class="text-white">Recent Activity</AMSUiCardTitle>
            <AMSUiCardDescription>
              Latest updates from your organization.
            </AMSUiCardDescription>
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
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <AMSPagesDashboardRecentActivity />
      </AMSUiCardContent>
    </AMSUiCard>
  </div>
</template>

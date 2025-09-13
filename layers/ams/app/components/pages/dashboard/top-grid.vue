<script setup lang="ts">
defineProps<{
  data: {
    fleetTotal: number
    fleetMonth: number
    employeesTotal: number
    employeesMonth: number
  }
}>()
</script>

<template>
  <div class="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    <AMSUiCard>
      <AMSUiCardHeader class="flex flex-row items-center justify-between pb-2">
        <AMSUiCardTitle class="text-sm font-medium text-white">
          ArisCorp Flottengröße
        </AMSUiCardTitle>
        <UIcon
          name="i-material-symbols-rocket-launch-outline"
          class="h-4 w-4 text-(--ui-primary)"
        />
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <div class="text-2xl font-bold text-white">{{ data?.fleetTotal }}</div>
        <p class="text-xs text-muted-foreground">
          {{ data?.fleetMonth > 0 ? '+' : '' }}
          {{ data?.fleetMonth || 0 }} Schiffe im letzten Monat
        </p>
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
        <div class="text-2xl font-bold text-white">
          {{ data?.employeesTotal }}
        </div>
        <p class="text-xs text-muted-foreground">
          {{ data?.employeesMonth < 0 ? '' : '+' }}
          {{ data?.employeesMonth || 0 }} Mitglieder im letzten Monat
        </p>
      </AMSUiCardContent>
    </AMSUiCard>
    <AMSUiCard>
      <AMSUiCardHeader class="flex flex-row items-center justify-between pb-2">
        <AMSUiCardTitle class="text-sm font-medium text-white">
          COMMING SOON
        </AMSUiCardTitle>
        <UIcon name="i-lucide-code-xml" class="h-4 w-4 text-(--ui-primary)" />
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <div class="text-2xl font-bold text-white">COMMING SOON</div>
        <p class="text-xs text-muted-foreground">COMMING SOON</p>
      </AMSUiCardContent>
    </AMSUiCard>
    <AMSUiCard>
      <AMSUiCardHeader class="flex flex-row items-center justify-between pb-2">
        <AMSUiCardTitle class="text-sm font-medium text-white">
          COMMING SOON
        </AMSUiCardTitle>
        <UIcon name="i-lucide-code-xml" class="h-4 w-4 text-(--ui-primary)" />
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <div class="text-2xl font-bold text-white">COMMING SOON</div>
        <p class="text-xs text-muted-foreground">COMMING SOON</p>
      </AMSUiCardContent>
    </AMSUiCard>
  </div>
</template>

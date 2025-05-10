<script setup lang="ts">
import type { Distribution } from '@@/types/ams-calculator'

const distributionsMock = reactive<Distribution[]>([
  {
    id: '1',
    worker: '1',
    expenses: 10000,
    share: 10000,
    percentage: 50,
  },
  {
    id: '2',
    worker: '2',
    expenses: 10000,
    share: 10000,
    percentage: 50,
  },
])
</script>

<template>
  <div class="mt-4 space-y-6">
    <AMSUiCard class="bg-(--ui-bg-muted)/50">
      <AMSUiCardHeader class="pb-3">
        <AMSUiCardTitle class="text-(--ui-primary)">
          Verteilung
        </AMSUiCardTitle>
      </AMSUiCardHeader>
      <AMSUiCardContent class="space-y-6">
        <AMSPagesCalculatorStepsDistribution />
      </AMSUiCardContent>
    </AMSUiCard>
  </div>
</template>

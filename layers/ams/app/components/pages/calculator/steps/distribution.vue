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
  <div class="space-y-6">
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AMSPagesCalculatorExpertDistributionCurrencyCard
          title="Gesamteinnahmen"
          :value="formatCurrency(300000)"
          icon="i-lucide-dollar-sign"
          color="green"
        />
        <AMSPagesCalculatorExpertDistributionCurrencyCard
          title="Gesamtausgaben"
          :value="formatCurrency(300000)"
          icon="i-lucide-dollar-sign"
          color="red"
        />
        <!-- TODO: add v-if - only when there is a transaction fee -->
        <AMSPagesCalculatorExpertDistributionCurrencyCard
          :title="`Transaktionsgebühr (TBD)`"
          :value="formatCurrency(300000)"
          icon="i-lucide-credit-card"
          color="orange"
        />
        <AMSPagesCalculatorExpertDistributionCurrencyCard
          title="Nettogewinn"
          :value="formatCurrency(300000)"
          icon="i-lucide-calculator"
          class="col-span-3"
        />
      </div>
    </div>
    <div class="space-y-4">
      <AMSPagesCalculatorExpertDistributionTable
        :distributions="distributionsMock"
      />
    </div>
  </div>
</template>

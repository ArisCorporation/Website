<script setup lang="ts">
import type {
  CalculatorSettings,
  DirectusUsers,
  OverallDistributionSummary,
} from '~~/types'

defineProps<{
  distribution: OverallDistributionSummary | null
  settings: CalculatorSettings
  users: DirectusUsers[]
  calculated: boolean
  calculating: boolean
}>()
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <AMSPagesCalculatorExpertDistributionCurrencyCard
          title="Gesamteinnahmen"
          :value="formatCurrency(distribution?.totalGrossRawIncome)"
          icon="i-lucide-dollar-sign"
          color="green"
          class="col-span-2"
        />
        <AMSPagesCalculatorExpertDistributionCurrencyCard
          title="Gesamtausgaben"
          :value="formatCurrency(distribution?.totalMissionExpenses)"
          icon="i-lucide-dollar-sign"
          color="red"
          class="col-span-2"
        />
        <AMSPagesCalculatorExpertDistributionCurrencyCard
          v-if="settings.fee_enabled"
          :title="`Transaktionsgebühr (${settings.fee_percentage}%)`"
          :value="formatCurrency(distribution?.totalAllTransactionFees)"
          icon="i-lucide-credit-card"
          color="orange"
          class="col-span-2"
        />
        <AMSPagesCalculatorExpertDistributionCurrencyCard
          title="Nettogewinn"
          :value="formatCurrency(distribution?.netOperatingProfit)"
          icon="i-lucide-calculator"
          class="col-span-3"
        />
        <AMSPagesCalculatorExpertDistributionCurrencyCard
          title="Nettogewinn pro Mitarbeiter"
          :value="
            formatCurrency(distribution?.targetNetProfitShareForEachWorker)
          "
          icon="i-lucide-calculator"
          class="col-span-3"
        />
      </div>
      <USeparator color="ams" />
      <div class="space-y-4">
        <div
          v-if="!calculated"
          class="flex flex-col items-center justify-center py-8 space-y-4 text-center"
        >
          <UIcon
            name="i-lucide-calculator"
            class="size-12 text-(--ui-primary)"
          />
          <p class="text-(--ui-text-muted)">
            Klicke auf "Verteilung berechnen", um die Anteile zu berechnen
          </p>
          <UButton
            @click="() => $emit('calculate')"
            :loading="calculating"
            icon="i-lucide-calculator"
            label="Verteilung berechnen"
          />
        </div>
        <AMSPagesCalculatorTablesDistribution v-else :users="users" />
      </div>
    </div>
  </div>
</template>

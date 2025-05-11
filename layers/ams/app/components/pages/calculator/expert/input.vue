<script setup lang="ts">
import type { DirectusUsers, Ships } from '~~/types'
import type { CalculatorSettings, OverallDistributionSummary } from '~~/types'

defineProps<{
  distribution: OverallDistributionSummary | null
  settings: CalculatorSettings
  calculated: boolean
  calculating: boolean
  users: DirectusUsers[]
  ships: Ships[]
  nextDisabled: boolean
}>()
</script>

<template>
  <div class="mt-4 space-y-6">
    <UCard variant="ams">
      <template #header>
        <h2>Missionseinstellungen</h2>
      </template>
      <template #default>
        <AMSPagesCalculatorStepsSettings />
      </template>
    </UCard>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-6">
        <UCard variant="ams">
          <template #header>
            <h2>Crews</h2>
          </template>
          <template #default>
            <div class="space-y-4">
              <AMSPagesCalculatorTablesCrew :ships="ships" />
            </div>
          </template>
        </UCard>
        <UAlert
          title="Drag & Drop Funktion"
          icon="i-lucide-arrow-right"
          variant="subtle"
          :ui="{
            icon: 'my-auto',
          }"
        >
          <template #description>
            <p
              className="text-xs text-(--ui-text-muted) mt-1 flex items-center"
            >
              Ziehe Mitarbeiter auf eine Crew, um sie zuzuweisen
            </p>
          </template>
        </UAlert>
        <UCard variant="ams">
          <template #header>
            <h2>Mitarbeiter</h2>
          </template>
          <template #default>
            <div class="space-y-4">
              <AMSPagesCalculatorTablesWorker :users="users" />
            </div>
          </template>
        </UCard>
      </div>
      <div class="space-y-6">
        <UCard variant="ams">
          <template #header>
            <h2>Einnahmen</h2>
          </template>
          <template #default>
            <div class="space-y-4">
              <AMSPagesCalculatorTablesIncome :users="users" />
            </div>
          </template>
        </UCard>
        <UCard variant="ams">
          <template #header>
            <h2>Ausgaben</h2>
          </template>
          <template #default>
            <div class="space-y-4">
              <AMSPagesCalculatorTablesExpense :users="users" />
            </div>
          </template>
        </UCard>
        <UButton
          @click="() => $emit('calculate')"
          :loading="calculating"
          :disabled="nextDisabled"
          label="Verteilung berechnen"
          icon="i-lucide-calculator"
          size="xl"
          class="w-full justify-center"
        />
      </div>
    </div>
  </div>
</template>

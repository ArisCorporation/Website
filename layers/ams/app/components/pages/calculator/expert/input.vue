<script setup lang="ts">
import type { DirectusUsers, Ships } from '~~/types'

defineProps<{ users: DirectusUsers[]; ships: Ships[]; nextDisabled: boolean }>()
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
              <AMSPagesCalculatorTablesIncome />
            </div>
          </template>
        </UCard>
        <UCard variant="ams">
          <template #header>
            <h2>Ausgaben</h2>
          </template>
          <template #default>
            <div class="space-y-4">
              <AMSPagesCalculatorTablesExpense />
            </div>
          </template>
        </UCard>
        <UButton
          :disabled="nextDisabled"
          label="Verteilung berechnen"
          icon="i-lucide-calculator"
          class="w-full justify-center"
          size="xl"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Worker, Crew } from '@@/types/ams-calculator'

const workers: Worker[] = [
  {
    id: '1',
    name: 'Thomas Blakeney',
    crew: 'Cargo',
    external: false,
    manager: true,
  },
  {
    id: '2',
    name: 'Decon M Vorn',
    crew: 'Salvaging',
    external: false,
    manager: false,
  },
]

const crews: Crew[] = [
  {
    id: '1',
    name: 'Cargo',
    ship: 'Constellation Aquila',
  },
  {
    id: '2',
    name: 'Salvaging',
    ship: 'Reclaimer',
  },
]
</script>

<template>
  <div class="mt-4 space-y-6">
    <AMSUiCard class="bg-(--ui-bg-muted)/50">
      <AMSUiCardHeader class="pb-3">
        <AMSUiCardTitle class="text-(--ui-primary)">
          Missionseinstellungen
        </AMSUiCardTitle>
      </AMSUiCardHeader>
      <AMSUiCardContent class="space-y-4">
        <AMSPagesCalculatorStepsSettings />
      </AMSUiCardContent>
    </AMSUiCard>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-6">
        <AMSUiCard class="bg-(--ui-bg-muted)/50">
          <AMSUiCardHeader class="pb-3">
            <AMSUiCardTitle class="text-(--ui-primary)"> Crews </AMSUiCardTitle>
          </AMSUiCardHeader>
          <AMSUiCardContent class="space-y-4">
            <AMSPagesCalculatorCrewTable :data="crews" />
          </AMSUiCardContent>
        </AMSUiCard>
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
        <AMSUiCard class="bg-(--ui-bg-muted)/50">
          <AMSUiCardHeader class="pb-3">
            <AMSUiCardTitle class="text-(--ui-primary)">
              Mitarbeiter
            </AMSUiCardTitle>
          </AMSUiCardHeader>
          <AMSUiCardContent class="space-y-4">
            <AMSPagesCalculatorWorkerTable :workers="workers" :crews="crews" />
          </AMSUiCardContent>
        </AMSUiCard>
      </div>
      <div class="space-y-6">
        <AMSUiCard class="bg-(--ui-bg-muted)/50">
          <AMSUiCardHeader class="pb-3">
            <AMSUiCardTitle class="text-(--ui-primary)">
              Einnahmen
            </AMSUiCardTitle>
          </AMSUiCardHeader>
          <AMSUiCardContent class="space-y-4">
            <AMSPagesCalculatorIncomeTable />
          </AMSUiCardContent>
        </AMSUiCard>
        <AMSUiCard class="bg-(--ui-bg-muted)/50">
          <AMSUiCardHeader class="pb-3">
            <AMSUiCardTitle class="text-(--ui-primary)">
              Ausgaben
            </AMSUiCardTitle>
          </AMSUiCardHeader>
          <AMSUiCardContent class="space-y-4">
            <AMSPagesCalculatorExpenseTable />
          </AMSUiCardContent>
        </AMSUiCard>
        <UButton
          label="Verteilung berechnen"
          icon="i-lucide-calculator"
          class="w-full justify-center"
          size="xl"
        />
      </div>
    </div>
  </div>
</template>

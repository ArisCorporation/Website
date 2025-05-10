<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const showWizard = ref(true)
const currentStep = ref(3)

const dropdownItems = ref<DropdownMenuItem[]>([
  {
    label: 'Aktionen',
    type: 'label',
  },
  {
    type: 'separator',
  },
  {
    onSelect: () => (showWizard.value = !showWizard.value),
    slot: 'mode',
  },
  {
    label: 'Verlauf',
  },
  {
    label: 'Zurücksetzen',
  },
])

const steps = [
  {
    title: 'Missionseinstellungen',
    icon: 'i-lucide-file-text',
  },
  {
    title: 'Crews & Mitarbeiter',
    icon: 'i-lucide-users',
  },
  {
    title: 'Einnahmen & Ausgaben',
    icon: 'i-lucide-currency',
  },
  {
    title: 'Verteilung',
    icon: 'i-lucide-calculator',
  },
]

const tabs = [
  {
    label: 'Eingabe',
    content: 'This is the account content.',
    slot: 'input',
  },
  {
    label: 'Verteilung',
    content: 'This is the password content.',
    slot: 'distribution',
  },
]

definePageMeta({
  layout: 'ams',
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-calculator"
      title="aUEC Anteilsrechner"
      description="Berechne die Verteilung von Einnahmen und Ausgaben für Missionen."
    >
      <!-- todo: onclick - handle undo -->
      <UButton
        icon="i-lucide-undo"
        variant="ghost"
        class="text-(--ui-text-muted) size-8"
      />
      <!-- todo: onclick - handle redo -->
      <UButton
        icon="i-lucide-redo"
        variant="ghost"
        class="text-(--ui-text-muted) size-8"
      />

      <UDropdownMenu
        :items="dropdownItems"
        :content="{
          align: 'start',
          side: 'bottom',
          sideOffset: 8,
        }"
        :ui="{
          content: 'w-48 ring-(--ui-primary)/20 bg-(--ui-bg-muted)',
          separator: 'bg-(--ui-primary)/10',
        }"
      >
        <UButton label="Optionen" icon="i-lucide-menu" variant="outline" />
        <template #mode-label>
          {{ showWizard ? 'Expertenmodus' : 'Assistenten-Modus' }}
        </template>
      </UDropdownMenu>
    </AMSPageHeader>
    <!-- todo: history -->
    <AMSUiCard v-if="showWizard" class="bg-(--ui-bg-muted)/50">
      <AMSUiCardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <AMSUiCardTitle class="text-(--ui-primary)">
            {{ steps[currentStep]?.title }}
          </AMSUiCardTitle>
          <div class="flex items-center space-x-2">
            <UIcon :name="steps[currentStep]?.icon ?? ''" />
            <span class="text-sm text-(--ui-text-muted)">
              Schritt {{ currentStep + 1 }} von {{ steps.length }}
            </span>
          </div>
        </div>
        <AMSPagesCalculatorStepsIndicator
          :total-steps="steps.length"
          :current-step="currentStep"
        />
      </AMSUiCardHeader>
      <AMSUiCardContent>
        <AMSPagesCalculatorStepsSettings v-if="currentStep == 0" />
        <AMSPagesCalculatorStepsCrews v-if="currentStep == 1" />
        <AMSPagesCalculatorStepsMoney v-if="currentStep == 2" />
        <AMSPagesCalculatorStepsDistribution v-if="currentStep == 3" />
        <div class="mt-4 flex w-full justify-between">
          <UButton
            @click="currentStep--"
            variant="outline"
            size="lg"
            label="Zurück"
          />
          <UButton
            @click="currentStep++"
            variant="solid"
            size="lg"
            label="Weiter"
          />
        </div>
      </AMSUiCardContent>
    </AMSUiCard>
    <UTabs
      v-else
      :items="tabs"
      class="w-full"
      :ui="{
        list: 'border border-(--ui-primary)/10 bg-(--ui-bg-muted)/70',
        indicator: 'bg-(--ui-primary)/10',
        trigger: 'data-[state=active]:text-(--ui-primary)',
      }"
    >
      <template #input="{ item }">
        <AMSPagesCalculatorExpertInput />
      </template>
      <template #distribution="{ item }">
        <AMSPagesCalculatorExpertDistribution />
      </template>
    </UTabs>
  </div>
</template>

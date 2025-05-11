<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const store = useAMSCalculatorStore()
const { settings, workers, crews, incomes, expenses } = storeToRefs(store)

const mockUsers = reactive([
  {
    id: '052a2c25-b063-4a82-90cb-110d7f809cae',
    first_name: 'Thomas',
    slug: 'thomas-blakeney',
    last_name: 'Blakeney',
    title: null,
    full_name: 'Thomas Blakeney',
    label: 'Thomas Blakeney',
    avatar: '31733e00-f4ff-4ebf-9499-668508d6c0fc',
  },
  {
    id: '54ee43a5-d877-4c11-aa61-31b1fea7d1a7',
    first_name: 'Decon Malcom',
    slug: 'decon-malcom-vorn',
    last_name: 'Vorn',
    title: null,
    full_name: 'Decon Malcom Vorn',
    label: 'Decon Malcom Vorn',
    avatar: '074bce0b-e23a-4d44-9f41-3004d7740f85',
  },
])

const mockShips = reactive([
  {
    id: '03012a07-fe69-4d0e-ac20-ca64c99052c8',
    name: 'Zeus Mk II CL',
    slug: 'zeus-mk-ii-cl',
  },
  {
    id: '3dca19c0-214c-4163-8d90-f3e39bb8f7b6',
    name: 'Vulture',
    slug: 'vulture',
  },
])

const showWizard = ref(true)
const currentStep = ref(0)

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

const isStep0Invalid = computed(() => {
  return settings.value.name.trim() === ''
})

const isStep1Invalid = computed(() => {
  return (
    crews.value.some((c) => c.name.trim() === '' || c.ship.trim() === '') ||
    workers.value.some(
      (w) => w.external === true && w.external_name?.trim() === ''
    ) ||
    workers.value.some(
      (w) => w.external === false && w.internal_id?.trim() === ''
    ) ||
    workers.value.some((w) => !w.crew) ||
    settings.value.manager === null
  )
})

const isStep2Invalid = computed(() => {
  return (
    incomes.value.some(
      (i) => i.name.trim() === '' || !i.amount || i.amount <= 0 || !i.worker
    ) ||
    expenses.value.some(
      (e) => e.name.trim() === '' || !e.amount || e.amount <= 0 || !e.worker
    )
  )
})

const nextDisabled = computed(() => {
  if (showWizard.value === true) {
    switch (currentStep.value) {
      case 0:
        return isStep0Invalid.value
      case 1:
        return isStep1Invalid.value
      case 2:
        return isStep2Invalid.value
      default:
        return true
    }
  } else {
    return isStep0Invalid.value || isStep1Invalid.value || isStep2Invalid.value
  }
})

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
    <UCard v-if="showWizard" variant="ams">
      <template #header>
        <div class="flex items-center justify-between ams-card-title">
          <h2>{{ steps[currentStep]?.title }}</h2>
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
      </template>
      <template #default>
        <AMSPagesCalculatorStepsSettings v-if="currentStep == 0" />
        <AMSPagesCalculatorStepsCrews v-if="currentStep == 1" />
        <AMSPagesCalculatorStepsMoney v-if="currentStep == 2" />
        <AMSPagesCalculatorStepsDistribution v-if="currentStep == 3" />
        <div class="mt-4 flex w-full justify-between">
          <UButton
            @click="currentStep--"
            :disabled="currentStep == 0"
            variant="outline"
            size="lg"
            label="Zurück"
          />
          <UButton
            v-if="currentStep < steps.length - 1"
            @click="currentStep++"
            :disabled="nextDisabled"
            variant="solid"
            size="lg"
            label="Weiter"
          />
        </div>
      </template>
    </UCard>
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
        <AMSPagesCalculatorExpertInput :next-disabled="nextDisabled" />
      </template>
      <template #distribution="{ item }">
        <AMSPagesCalculatorExpertDistribution />
      </template>
    </UTabs>
  </div>
</template>

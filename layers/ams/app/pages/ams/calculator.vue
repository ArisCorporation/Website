<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const store = useAMSCalculatorStore()
const { settings, workers, crews, incomes, expenses, distribution } =
  storeToRefs(store)

const wizardCookie = useCookie<boolean>('ams:calculator_wizard')
const toggleWizard = () => (wizardCookie.value = !wizardCookie.value)

const currentStep = ref(0)

const calculated = ref(false)
const calculating = ref(false)

const { data: userList } = await useFetchAMSEmployees()

const users = computed(() =>
  userList.value?.map((user) => ({
    avatar: { src: user.avatar },
    label: getUserLabel(user),
    id: user.id,
  }))
)

const { data: ships } = await useAsyncData('ships', () => {
  return useDirectus(
    readItems('ships', {
      limit: -1,
      filter: { status: { _eq: 'published' } },
      sort: ['name'],
    })
  )
})

const dropdownItems = ref<DropdownMenuItem[]>([
  {
    label: 'Verlauf',
  },
  {
    onSelect: () => store.$reset(),
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

const activeTab = ref('input')
const tabs = [
  {
    label: 'Eingabe',
    content: 'This is the account content.',
    slot: 'input',
    value: 'input',
  },
  {
    label: 'Verteilung',
    content: 'This is the password content.',
    slot: 'distribution',
    value: 'distribution',
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
  if (wizardCookie.value === true) {
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

async function calculate() {
  calculating.value = true
  await setTimeout(() => {
    const distributionData = amsCalculateDistribution(
      incomes.value,
      expenses.value,
      workers.value,
      settings.value
    )

    distribution.value = distributionData
    calculating.value = false
    calculated.value = true
    activeTab.value = 'distribution'
  }, 1000)
}

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-calculator"
      title="aUEC Anteilsrechner"
      description="Berechne die Verteilung von Einnahmen und Ausgaben für Missionen."
    >
      <AMSUiAssistantModeDropdown
        :assistant-active="wizardCookie === true"
        :extra-items="dropdownItems"
        @toggle-mode="toggleWizard"
      />
    </AMSPageHeader>
    <!-- todo: history -->
    <AMSUiAssistantFlow
      v-if="wizardCookie"
      :steps="steps"
      :current-step="currentStep"
      :previous-disabled="currentStep == 0"
      :next-disabled="nextDisabled"
      :show-next="currentStep < steps.length - 1"
      @previous="currentStep--"
      @next="currentStep++"
    >
      <AMSPagesCalculatorStepsSettings v-if="currentStep == 0" />
      <AMSPagesCalculatorStepsCrews
        v-if="currentStep == 1"
        :users="users ?? []"
        :ships="ships ?? []"
      />
      <AMSPagesCalculatorStepsMoney
        v-if="currentStep == 2"
        :users="users ?? []"
      />
      <AMSPagesCalculatorStepsDistribution
        v-if="currentStep == 3"
        @calculate="calculate"
        :calculated="calculated"
        :calculating="calculating"
        :distribution="distribution"
        :settings="settings"
        :users="users ?? []"
      />
    </AMSUiAssistantFlow>
    <UTabs
      v-else
      v-model="activeTab"
      :items="tabs"
      class="w-full"
      :ui="{
        list: 'border border-(--ui-primary)/10 bg-(--ui-bg-muted)/70',
        indicator: 'bg-(--ui-primary)/10',
        trigger: 'data-[state=active]:text-(--ui-primary)',
      }"
    >
      <template #input="{ item }">
        <AMSPagesCalculatorExpertInput
          @calculate="calculate"
          :calculated="calculated"
          :calculating="calculating"
          :users="users ?? []"
          :ships="ships ?? []"
          :next-disabled="nextDisabled"
          :distribution="distribution"
          :settings="settings"
        />
      </template>
      <template #distribution="{ item }">
        <div class="mt-4 space-y-6">
          <UCard variant="ams">
            <template #header>
              <h2>Verteilung</h2>
            </template>
            <template #default>
              <div class="space-y-4">
                <AMSPagesCalculatorStepsDistribution
                  @calculate="calculate"
                  :calculated="calculated"
                  :calculating="calculating"
                  :distribution="distribution"
                  :settings="settings"
                  :users="users ?? []"
                />
              </div>
            </template>
          </UCard>
        </div>
      </template>
    </UTabs>
  </div>
</template>

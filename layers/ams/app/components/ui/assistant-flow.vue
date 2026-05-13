<script setup lang="ts">
type AssistantStep = {
  title: string
  icon: string
}

const props = withDefaults(
  defineProps<{
    steps: AssistantStep[]
    currentStep: number
    nextDisabled?: boolean
    previousDisabled?: boolean
    showNext?: boolean
    showPrevious?: boolean
    nextLabel?: string
    previousLabel?: string
  }>(),
  {
    nextDisabled: false,
    previousDisabled: false,
    showNext: true,
    showPrevious: true,
    nextLabel: 'Weiter',
    previousLabel: 'Zurück',
  }
)

const emit = defineEmits<{
  previous: []
  next: []
}>()

const currentStepMeta = computed(() => props.steps[props.currentStep] ?? null)
</script>

<template>
  <UCard variant="ams">
    <template #header>
      <div class="flex items-center justify-between ams-card-title">
        <h2>{{ currentStepMeta?.title }}</h2>
        <div class="flex items-center space-x-2">
          <UIcon :name="currentStepMeta?.icon ?? ''" />
          <span class="text-sm text-(--ui-text-muted)">
            Schritt {{ currentStep + 1 }} von {{ steps.length }}
          </span>
        </div>
      </div>
      <AMSUiAssistantStepsIndicator
        :total-steps="steps.length"
        :current-step="currentStep"
      />
    </template>
    <div class="space-y-4">
      <slot />
      <div
        v-if="showPrevious || showNext"
        class="mt-4 flex w-full justify-between"
      >
        <UButton
          v-if="showPrevious"
          :disabled="previousDisabled"
          variant="outline"
          size="lg"
          :label="previousLabel"
          @click="emit('previous')"
        />
        <div v-else />
        <UButton
          v-if="showNext"
          :disabled="nextDisabled"
          variant="solid"
          size="lg"
          :label="nextLabel"
          @click="emit('next')"
        />
      </div>
    </div>
  </UCard>
</template>

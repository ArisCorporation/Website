<script setup lang="ts">
const store = useAMSCalculatorStore()
const { settings } = storeToRefs(store)
</script>

<template>
  <div class="space-y-2">
    <UFormField>
      <template #label>
        <div class="flex items-center space-x-2">
          <UIcon name="i-lucide-file-text" class="text-(--ui-primary)" />
          <span>Name der Mission</span>
        </div>
      </template>
      <UInput
        v-model="settings.name"
        highlight
        variant="subtle"
        class="w-full"
        placeholder="z.B. Quantanium Mining Run"
      />
    </UFormField>
    <UFormField class="flex w-full justify-between items-center">
      <template #label>
        <div class="flex items-center space-x-2">
          <UIcon name="i-lucide-credit-card" class="text-(--ui-primary)" />
          <span>Transaktionsgebühr abziehen?</span>
        </div>
      </template>
      <USwitch v-model="settings.fee_enabled" size="xl" />
    </UFormField>
    <UFormField v-if="settings.fee_enabled" class="mt-4">
      <template #label>
        <div class="flex items-center space-x-2">
          <UIcon name="i-lucide-dollar-sign" class="text-(--ui-primary)" />
          <span>Gebührenprozentsatz</span>
        </div>
      </template>
      <USlider
        v-model="settings.fee_percentage"
        size="xl"
        :min="0.5"
        :max="20"
        :step="0.5"
        class="py-4"
      />
      <div class="flex justify-between items-center">
        <span class="text-sm text-(--ui-text-muted)">0%</span>
        <span class="text-sm text-(--ui-primary)">
          {{ settings.fee_percentage }}%
        </span>
        <span class="text-sm text-(--ui-text-muted)">20%</span>
      </div>
    </UFormField>
  </div>
</template>

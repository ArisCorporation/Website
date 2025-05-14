<script setup lang="ts">
const citizenship = ref<'true' | 'false'>('false')

const reason = ref<'military' | 'education' | 'social' | null>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <UFormField
      label="Besitzt du einen Bürgerstatus"
      name="citizenship"
      size="xs"
      class="w-full"
    >
      <URadioGroup
        indicator="hidden"
        variant="table"
        orientation="horizontal"
        default-value="male"
        :items="[
          { label: 'Ja', value: 'true' },
          { label: 'Nein', value: 'false' },
        ]"
        v-model="citizenship"
        class="prose-p:my-0"
      />
    </UFormField>
    <UFormField
      label="Wie hast du deinen Bürgerstatus erlangt?"
      name="citizenship_reason"
      size="xs"
    >
      <URadioGroup
        indicator="hidden"
        variant="table"
        orientation="horizontal"
        default-value="male"
        :disabled="citizenship === 'false'"
        :items="[
          { label: 'Militärischer Dienst', value: 'military' },
          { label: 'Hochschulausbildung', value: 'education' },
          { label: 'Soziales Engagement', value: 'social' },
        ]"
        v-model="reason"
        class="prose-p:my-0"
      />
    </UFormField>
    <Transition
      appear-from-class="max-h-0 overflow-clip"
      appear-active-class="transition-[max-height] duration-[1000ms] ease-in-out"
      appear-to-class="max-h-[1000px] overflow-clip"
      enter-from-class="max-h-0 overflow-clip"
      enter-active-class="transition-[max-height] duration-[1000ms] ease-in-out"
      enter-to-class="max-h-[1000px] overflow-clip"
      leave-from-class="max-h-[1000px] overflow-clip"
      leave-active-class="transition-[max-height] duration-[1000ms] ease-in-out"
      leave-to-class="max-h-0 overflow-clip"
    >
      <div
        v-if="citizenship === 'false'"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2"
      >
        <USeparator
          color="ams"
          label="Militärischer Dienst"
          class="col-span-2"
        />
        <UFormField
          label="Wie hast du deinen Bürgerstatus erlangt?"
          name="citizenship_reason"
          size="xs"
        >
          <URadioGroup
            indicator="hidden"
            variant="table"
            orientation="horizontal"
            default-value="male"
            :disabled="citizenship === 'false'"
            :items="[
              { label: 'Militärischer Dienst', value: 'military' },
              { label: 'Hochschulausbildung', value: 'education' },
              { label: 'Soziales Engagement', value: 'social' },
            ]"
            v-model="reason"
            class="prose-p:my-0"
          />
        </UFormField>
      </div>
    </Transition>
    <USeparator color="ams" class="col-span-2" />
  </div>
</template>

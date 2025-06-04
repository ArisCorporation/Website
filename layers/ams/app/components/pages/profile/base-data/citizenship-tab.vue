<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import _ from 'lodash' // Für _.isEqual, um unnötige Updates zu vermeiden

// Annahme: Der Store ist ähnlich wie in details-tab.vue aufgebaut.
// Passe ggf. den Importpfad und den Store-Namen an.
const profileEdit = useUserProfileEditStore()

const citizenship = ref<'true' | 'false'>(
  profileEdit.formData.citizen_state ? 'true' : 'false'
)
const reason = ref<
  'military' | 'special_education' | 'social_commitment' | null
>(profileEdit.formData.citizen_reason ?? null)
const hasDone = ref<string[]>([])

// --- Synchronisation: Store -> Lokaler State (hasDone) ---
// Initialisiert `hasDone` basierend auf dem Store und hält es synchron.
watch(
  () => [profileEdit.formData.duty_state, profileEdit.formData.education_state],
  ([dutyState, educationState]) => {
    // Nur ausführen, wenn formData initialisiert ist.
    if (
      !profileEdit.formData ||
      Object.keys(profileEdit.formData).length === 0
    ) {
      if (!_.isEqual(hasDone.value, [])) {
        hasDone.value = []
      }
      return
    }

    const newHasDone: string[] = []
    if (dutyState) {
      newHasDone.push('military')
    }
    if (educationState) {
      newHasDone.push('education')
    }

    // Vergleiche sortierte Arrays, um unnötige Updates zu vermeiden.
    if (!_.isEqual(hasDone.value.slice().sort(), newHasDone.slice().sort())) {
      hasDone.value = newHasDone
    }
  },
  { immediate: true } // `immediate: true` für Ausführung beim Mounten/Initialisierung.
)

// --- Synchronisation: Lokaler State (hasDone) -> Store ---
// Aktualisiert den Store, wenn `hasDone` sich ändert.
watchEffect(() => {
  if (profileEdit.formData && Object.keys(profileEdit.formData).length > 0) {
    const militarySelected = hasDone.value.includes('military')
    const educationSelected = hasDone.value.includes('education')

    if (profileEdit.formData.duty_state !== militarySelected) {
      profileEdit.formData.duty_state = militarySelected
    }
    if (profileEdit.formData.education_state !== educationSelected) {
      profileEdit.formData.education_state = educationSelected
    }
  }
})

// --- Synchronisation für `citizenship` (Store <-> Lokaler State) ---
watch(
  () => profileEdit.formData.citizen_state,
  (newVal) => {
    const storeValue = newVal ?? 'false'
    if (citizenship.value !== storeValue) {
      citizenship.value = storeValue
    }
  },
  { immediate: true }
)

watchEffect(() => {
  if (profileEdit.formData && Object.keys(profileEdit.formData).length > 0) {
    if (profileEdit.formData.citizen_state !== citizenship.value) {
      profileEdit.formData.citizen_state = citizenship.value
    }
  }
})

// --- Synchronisation für `reason` (Store <-> Lokaler State) ---
watch(
  () => profileEdit.formData.citizen_reason,
  (newVal) => {
    const storeValue = newVal ?? null
    if (reason.value !== storeValue) {
      reason.value = storeValue
    }
  },
  { immediate: true }
)

watchEffect(() => {
  console.log(1)

  if (profileEdit.formData && Object.keys(profileEdit.formData).length > 0) {
    console.log(2)
    if (profileEdit.formData.citizen_reason !== reason.value) {
      console.log(3)
      profileEdit.formData.citizen_reason = reason.value
      console.log(4)
      console.log(profileEdit.formData.citizen_reason)
    }
  }
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <UFormField
      label="Was trifft auf dich zu?"
      name="active_extras"
      size="xs"
      class="md:col-span-2"
    >
      <AMSUiTableButtonGroup
        v-model="hasDone"
        :options="[
          { key: 'military', label: 'Militärischer Dienst' },
          { key: 'education', label: 'Hochschulausbildung' },
        ]"
      />
    </UFormField>
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
        :disabled="citizenship === 'false'"
        :items="[
          ...(hasDone.includes('military')
            ? [{ label: 'Militärischer Dienst', value: 'military' }]
            : []),
          ...(hasDone.includes('education')
            ? [{ label: 'Hochschulausbildung', value: 'special_education' }]
            : []),
          { label: 'Soziales Engagement', value: 'social_commitment' },
        ]"
        value-key="value"
        v-model="reason"
        class="prose-p:my-0"
      />
    </UFormField>
    <!-- <Transition
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
    </Transition> -->
    <!-- <USeparator color="ams" class="col-span-2" /> -->
  </div>
</template>

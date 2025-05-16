<script setup lang="ts">
const profileEdit = useProfileEditStore()

interface gender {
  label: string
  value: string | null
}

const genderOptions = reactive<gender[]>([
  { label: 'Männlich', value: 'male' },
  { label: 'Weiblich', value: 'female' },
])

// Beispiel für dynamischen Hilfetext basierend auf dem Input-Wert
const firstNameHelpText = computed(() => {
  if (
    profileEdit.currentFormData.firstName &&
    profileEdit.currentFormData.firstName.length < 2
  ) {
    return 'Mindestens 2 Zeichen benötigt.'
  }
  return ''
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <UFormField label="Geschlecht" name="gender" size="xs" class="w-full">
      <URadioGroup
        indicator="hidden"
        variant="table"
        orientation="horizontal"
        default-value="male"
        :items="genderOptions"
        class="prose-p:my-0"
      />
    </UFormField>
    <UFormField label="Geburtsdatum" name="birthdate" size="xs" class="w-full">
      <div class="grid grid-cols-3 gap-x-4">
        <UFormField label="Tag" name="birthdate_day" size="xs" class="w-full">
          <USelectMenu
            :items="
              Array.from({ length: 31 }, (_, index) =>
                (index + 1).toString().padStart(2, '0')
              )
            "
            variant="ams"
            size="md"
            placeholder="1-31"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Monat"
          name="birthdate_month"
          size="xs"
          class="w-full"
        >
          <USelectMenu
            :items="[
              { label: 'Januar', value: '01' },
              { label: 'Februar', value: '02' },
              { label: 'März', value: '03' },
              { label: 'April', value: '04' },
              { label: 'Mai', value: '05' },
              { label: 'Juni', value: '06' },
              { label: 'Juli', value: '07' },
              { label: 'August', value: '08' },
              { label: 'September', value: '09' },
              { label: 'Oktober', value: '10' },
              { label: 'November', value: '11' },
              { label: 'Dezember', value: '12' },
            ]"
            variant="ams"
            size="md"
            placeholder="Januar"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Jahr" name="birthdate_year" size="xs" class="w-full">
          <UInput highlight size="md" class="w-full" />
        </UFormField>
      </div>
    </UFormField>
    <UFormField
      label="Aktueller Wohnort"
      name="current_residence"
      class="w-full"
      size="xs"
    >
      <USelectMenu
        indicator="hidden"
        orientation="horizontal"
        variant="ams"
        size="md"
        :items="[
          { label: 'Stanton / ArcCorp / Area 18', value: '0' },
          {
            label: 'Stanton / MicroTech / New Babbage',
            value: '1',
          },
        ]"
        class="prose-p:my-0 w-full max-w-sm"
      />
    </UFormField>
    <UFormField label="Geburtsort" name="birth_place" class="w-full" size="xs">
      <USelectMenu
        indicator="hidden"
        orientation="horizontal"
        variant="ams"
        size="md"
        :items="[
          { label: 'Stanton / ArcCorp / Area 18', value: '0' },
          {
            label: 'Stanton / MicroTech / New Babbage',
            value: '1',
          },
        ]"
        class="prose-p:my-0 w-full max-w-sm"
      />
    </UFormField>
  </div>
</template>

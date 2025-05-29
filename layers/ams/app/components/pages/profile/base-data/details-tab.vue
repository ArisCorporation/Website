<script setup lang="ts">
import type { UserProfileFormData } from '@/stores/ams/profile-edit-store'

const profileEdit = useUserProfileEditStore()

interface InputConfig {
  property: keyof UserProfileFormData // Ensure this aligns with UserProfileFormData keys
  label: string
  placeholder: string
}

// 5. Wende den 'InputConfig'-Typ auf dein 'inputs'-Array an
const inputs: InputConfig[][] = [
  [
    {
      property: 'hobbies_list', // Jetzt typsicher und von TypeScript als gültig erkannt
      label: 'Hobbies',
      placeholder: 'Fliegen, Schrauben',
    },
    {
      property: 'activities_list', // Ebenfalls typsicher
      label: 'Frezeitgestaltung',
      placeholder: 'Saufen',
    },
    {
      property: 'talents_list', // Ebenfalls typsicher
      label: 'Talente',
      placeholder: 'Fliegen, Schrauben',
    },
    {
      property: 'tics_list', // Ebenfalls typsicher
      label: 'Tics & Marotten',
      placeholder: '',
    },
    {
      property: 'fears_list', // Ebenfalls typsicher
      label: 'Ängste',
      placeholder: 'Höhenangst',
    },
    {
      property: 'character_trait_list', // Ebenfalls typsicher
      label: 'Hervorstechender Charakterzug',
      placeholder: 'Arrogant',
    },
    {
      property: 'mysterious_list', // Ebenfalls typsicher
      label: 'Rätselhafte Züge',
      placeholder: 'Mag Drake',
    },
  ],
  [
    {
      property: 'music_list',
      label: 'Musik', // Beispiel für geändertes Label
      placeholder: 'AC/DC',
    },
    {
      property: 'movies_list',
      label: 'Filme',
      placeholder: 'Top Gun',
    },
    {
      property: 'books_list',
      label: 'Bücher',
      placeholder: 'Faust',
    },
    {
      property: 'food_list',
      label: 'Essen',
      placeholder: 'Whammers Burger',
    },
    {
      property: 'drink_list',
      label: 'Getränke',
      placeholder: 'FiZz Cola',
    },
    {
      property: 'alcohol_list',
      label: 'Alkohol',
      placeholder: 'Whiskey',
    },
    {
      property: 'loves_list',
      label: 'Liebt..',
      placeholder: 'Loyale Menschen',
    },
    {
      property: 'hates_list',
      label: 'Hasst...',
      placeholder: 'Unzuverlässige Schiffe',
    },
  ],
]
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <template
      v-for="(inputGroup, groupIdx) in inputs"
      :key="`group-${groupIdx}`"
    >
      <UFormField
        v-for="(configItem, itemIdx) in inputGroup"
        :key="`${String(configItem.property)}-${itemIdx}`"
        :label="configItem.label"
        :name="String(configItem.property)"
        size="xs"
        class="w-full"
      >
        <AMSUiDynamicList
          v-model="(profileEdit.formData as any)[configItem.property]"
          handle
          :placeholder="configItem.placeholder"
        />
      </UFormField>
      <USeparator
        v-if="groupIdx < inputs.length - 1"
        color="ams"
        class="col-span-1 md:col-span-2"
      />
    </template>
  </div>
</template>

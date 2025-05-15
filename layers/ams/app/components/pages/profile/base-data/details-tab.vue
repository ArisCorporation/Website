<script setup lang="ts">
interface MyData {
  hobbies: string[]
  talents: string[]
  habits: string[]
  tics: string[]
  activities: string[]
  mysterious_things: string[]
  character_trait: string[]
  fears: string[]
  books: string[]
  music: string[]
  movies: string[]
  clothing: string[]
  food: string[]
  drink: string[]
  alcohol: string[]
  loves: string[]
  hates: string[]
}

interface InputConfig {
  property: keyof MyData
  label: string
  placeholder: string
}

const data: MyData = reactive({
  hobbies: ['Schrauben', 'Fliegen'],
  talents: [],
  habits: [],
  tics: [],
  activities: [],
  mysterious_things: [],
  character_trait: [],
  fears: [],
  books: [],
  music: [],
  movies: [],
  clothing: [],
  food: [],
  drink: [],
  alcohol: [],
  loves: [],
  hates: [],
})

// 5. Wende den 'InputConfig'-Typ auf dein 'inputs'-Array an
const inputs: InputConfig[][] = [
  [
    {
      property: 'hobbies', // Jetzt typsicher und von TypeScript als gültig erkannt
      label: 'Hobbies',
      placeholder: 'Fliegen, Schrauben',
    },
    {
      property: 'activities', // Ebenfalls typsicher
      label: 'Frezeitgestaltung',
      placeholder: 'Saufen',
    },
    {
      property: 'talents', // Ebenfalls typsicher
      label: 'Talente',
      placeholder: 'Fliegen, Schrauben',
    },
    {
      property: 'tics', // Ebenfalls typsicher
      label: 'Tics & Marotten',
      placeholder: '',
    },
    {
      property: 'fears', // Ebenfalls typsicher
      label: 'Ängste',
      placeholder: 'Höhenangst',
    },
    {
      property: 'character_trait', // Ebenfalls typsicher
      label: 'Hervorstechender Charakterzug',
      placeholder: 'Arrogant',
    },
    {
      property: 'mysterious_things', // Ebenfalls typsicher
      label: 'Rätselhafte Züge',
      placeholder: 'Mag Drake',
    },
  ],
  [
    {
      property: 'music',
      label: 'Musik', // Beispiel für geändertes Label
      placeholder: 'AC/DC',
    },
    {
      property: 'movies',
      label: 'Filme',
      placeholder: 'Top Gun',
    },
    {
      property: 'books',
      label: 'Bücher',
      placeholder: 'Faust',
    },
    {
      property: 'food',
      label: 'Essen',
      placeholder: 'Whammers Burger',
    },
    {
      property: 'drink',
      label: 'Getränke',
      placeholder: 'FiZz Cola',
    },
    {
      property: 'alcohol',
      label: 'Alkohol',
      placeholder: 'Whiskey',
    },
    {
      property: 'loves',
      label: 'Liebt..',
      placeholder: 'Loyale Menschen',
    },
    {
      property: 'hates',
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
        :key="`${configItem.property}-${itemIdx}`"
        :label="configItem.label"
        :name="configItem.property"
        size="xs"
        class="w-full"
      >
        <AMSUiDynamicList
          v-model="data[configItem.property]"
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

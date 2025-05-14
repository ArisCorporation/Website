<script setup lang="ts">
// 1. Importiere 'reactive' von Vue
import { reactive } from 'vue'

// 2. Definiere einen Typ für die Struktur deines 'data'-Objekts
interface MyData {
  hobbies: string[]
  talents: string[]
  // Du könntest hier weitere Eigenschaften hinzufügen, wenn dein data-Objekt wächst
}

// 3. Definiere einen Typ für die Konfigurationsobjekte in deinem 'inputs'-Array
//    Wichtig: 'property' ist jetzt vom Typ 'keyof MyData', was bedeutet,
//    dass es nur 'hobbies' oder 'talents' sein kann.
interface InputConfig {
  property: keyof MyData
  label: string
  placeholder: string
}

// 4. Wende den 'MyData'-Typ auf dein reaktives 'data'-Objekt an
const data: MyData = reactive({
  hobbies: ['Schrauben', 'Fliegen'],
  talents: [],
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
      property: 'talents', // Ebenfalls typsicher
      label: 'Talente',
      placeholder: 'Fliegen, Schrauben',
    },
  ],
  [
    // Annahme: Diese zweite Gruppe ist für ein anderes Set von Daten oder eine andere Darstellung,
    // verwendet aber dieselben Properties. Wenn es sich um unterschiedliche Datenobjekte handeln würde,
    // bräuchte man eine komplexere Struktur.
    {
      property: 'hobbies',
      label: 'Hobbies (Gruppe 2)', // Beispiel für geändertes Label
      placeholder: 'Weitere Hobbies',
    },
    {
      property: 'talents',
      label: 'Talente (Gruppe 2)',
      placeholder: 'Weitere Talente',
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

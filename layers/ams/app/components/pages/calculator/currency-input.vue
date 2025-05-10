<script setup lang="ts">
const model = defineModel<number | null | undefined>()

const isFocused = ref(false)
const inputValue = ref<string>('')

watch(
  () => [model.value, isFocused.value], // Beobachte das model.value und den Fokus-Status
  ([newModelValue, focused]) => {
    if (focused) {
      // Im Fokus: Rohen Wert (als String) anzeigen
      inputValue.value =
        newModelValue === null || newModelValue === undefined
          ? ''
          : String(newModelValue)
    } else {
      // Nicht im Fokus: Formatierten Wert anzeigen
      inputValue.value = formatCurrency(Number(newModelValue))
    }
  },
  { immediate: true } // `immediate` sorgt für die korrekte Anzeige beim ersten Rendern und bei Initialwert
)

const handleBlur = () => {
  isFocused.value = false
  const currentDisplayValue = inputValue.value
  const rawNumber = currencyToRaw(currentDisplayValue)

  if (rawNumber !== null) {
    // Wenn eine gültige Zahl geparst wurde und sie sich vom aktuellen Modellwert unterscheidet:
    if (rawNumber !== model.value) {
      model.value = rawNumber // Aktualisiert das Modell (und löst `update:modelValue` aus)
    }
    // Wenn rawNumber === model.value, keine Aktualisierung des Modells nötig,
    // aber der Watcher wird trotzdem inputValue neu formatieren, da isFocused jetzt false ist.
  }
  // Wenn rawNumber null ist (ungültige Eingabe):
  // Der Watcher wird `inputValue` auf den formatierten Wert des aktuellen `model.value`
  // zurücksetzen, da `isFocused` auf `false` gesetzt wurde.
  // Um sicherzustellen, dass dies auch geschieht, wenn model.value sich nicht ändert:
  if (rawNumber === null) {
    inputValue.value = formatCurrency(model.value)
  }
}
</script>

<template>
  <UInput
    variant="soft"
    highlight
    icon="i-lucide-currency"
    v-model="inputValue"
    inputmode="decimal"
    @focus="isFocused = true"
    @blur="handleBlur"
  />
</template>

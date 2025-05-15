<script setup lang="ts">
const model = defineModel<string[]>()
defineProps<{
  options: { key: string; label: string }[]
}>()

function handleToggle(key: string) {
  if (model.value?.includes(key)) {
    model.value = model.value?.filter((a) => a !== key)
  } else {
    model.value?.push(key)
  }
}
</script>

<template>
  <div class="flex -space-x-px">
    <button
      v-for="option in options"
      :key="option.key"
      @click="() => handleToggle(option.key)"
      class="border text-xs border-(--ui-border-muted) first:rounded-l-md last:rounded-r-md p-2.5 h-fit"
      :class="[
        model?.find((a) => a === option.key) &&
          'bg-(--ui-primary)/10 border-(--ui-primary)/50 z-10',
      ]"
    >
      {{ option.label }}
    </button>
  </div>
</template>

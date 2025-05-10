<script setup lang="ts">
const props = defineProps<{
  icon: string
  title: string
  value: string
  color?: string
}>()

const textColor = ref<string>('text-green-400')
const iconColor = ref<string>('text-(--ui-primary)')
const iconBg = ref<string>('bg-(--ui-primary)/10')

switch (props.color) {
  case 'red':
    iconColor.value = 'text-red-400'
    iconBg.value = 'bg-red-400/10'
    textColor.value = 'text-red-400'
    break
  case 'green':
    iconColor.value = 'text-green-400'
    iconBg.value = 'bg-green-400/10'
    break
  case 'orange':
    iconColor.value = 'text-orange-400'
    iconBg.value = 'bg-orange-400/10'
    textColor.value = 'text-orange-400'
    break
}
</script>

<template>
  <div
    class="rounded-md border border-(--ui-primary)/20 p-4 bg-(--ui-bg-muted)/50 hover:bg-(--ui-bg-muted)/70 transition-colors duration-200 hover:border-(--ui-primary)/30"
  >
    <div class="flex items-center space-x-3">
      <div
        class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
        :class="iconBg"
      >
        <UIcon :name="icon" class="h-5 w-5" :class="iconColor" />
      </div>
      <div>
        <div class="text-sm text-(--ui-text-muted)">{{ title }}</div>
        <div
          class="text-xl flex items-center font-medium tabular-nums"
          :class="textColor"
        >
          {{ value }}
          <UIcon name="i-lucide-currency" class="ml-1" />
        </div>
      </div>
    </div>
  </div>
</template>

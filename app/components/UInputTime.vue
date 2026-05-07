<script setup lang="ts">
import { Time } from '@internationalized/date'
import { TimeFieldInput, TimeFieldRoot } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  modelValue?: string
  defaultValue?: string
  hourCycle?: 12 | 24
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
}>(), {
  modelValue: '',
  defaultValue: '',
  hourCycle: 24,
  disabled: false,
  required: false,
  name: undefined,
  id: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()

const defaultTimeValue = computed(() => parseTimeString(props.defaultValue))
const timeFieldValue = computed(() => parseTimeString(props.modelValue))

function parseTimeString(value?: string) {
  if (!value) {
    return undefined
  }

  const match = value.trim().match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/)

  if (!match) {
    return undefined
  }

  const hour = Number.parseInt(match[1] ?? '', 10)
  const minute = Number.parseInt(match[2] ?? '', 10)
  const second = Number.parseInt(match[3] ?? '0', 10)

  if (
    Number.isNaN(hour)
    || Number.isNaN(minute)
    || Number.isNaN(second)
    || hour < 0
    || hour > 23
    || minute < 0
    || minute > 59
    || second < 0
    || second > 59
  ) {
    return undefined
  }

  return new Time(hour, minute, second)
}

function formatTimeValue(value?: { hour: number, minute: number }) {
  if (!value) {
    return ''
  }

  return `${value.hour.toString().padStart(2, '0')}:${value.minute.toString().padStart(2, '0')}`
}

function handleTimeValueUpdate(value?: { hour: number, minute: number }) {
  emit('update:modelValue', formatTimeValue(value))
}

function getSegmentClasses(part: string) {
  if (part === 'dayPeriod') {
    return [
      'min-w-[3.25ch] rounded-md px-1.5 py-1 text-center text-xs font-semibold uppercase tracking-[0.24em]',
      'text-(--ui-text-highlighted) outline-none transition-colors duration-200',
      'data-[placeholder]:text-(--ui-text-muted)/65',
      'focus:bg-(--ui-primary)/18 focus:text-(--ui-text-highlighted)',
    ]
  }

  return [
    'min-w-[2.5ch] rounded-md px-1.5 py-1 text-center text-sm font-semibold tabular-nums tracking-[0.08em]',
    'text-(--ui-text-highlighted) outline-none transition-colors duration-200',
    'data-[placeholder]:text-(--ui-text-muted)/65',
    'focus:bg-(--ui-primary)/18 focus:text-(--ui-text-highlighted)',
  ]
}
</script>

<template>
  <TimeFieldRoot
    v-bind="attrs"
    :id="id"
    :name="name"
    :model-value="timeFieldValue"
    :default-placeholder="defaultTimeValue"
    :hour-cycle="hourCycle"
    :disabled="disabled"
    :required="required"
    granularity="minute"
    locale="de-DE"
    class="group flex min-h-11 w-full items-center gap-2 rounded-xl border border-(--ui-primary)/15 bg-(--ui-bg)/70 px-3 py-2 text-(--ui-text-highlighted) shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-white/5 backdrop-blur-sm transition-all duration-200 hover:border-(--ui-primary)/28 hover:bg-(--ui-bg-muted)/80 focus-within:border-(--ui-primary)/45 focus-within:bg-(--ui-primary)/8 focus-within:shadow-[0_0_0_1px_rgba(0,255,232,0.14),0_0_20px_rgba(0,255,232,0.12)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60"
    @update:model-value="handleTimeValueUpdate"
  >
    <template #default="{ segments }">
      <UIcon
        name="i-lucide-clock-3"
        class="size-4 shrink-0 text-(--ui-primary)/70"
      />

      <div class="flex min-w-0 items-center gap-0.5">
        <template v-for="segment in segments" :key="segment.part">
          <span
            v-if="segment.part === 'literal'"
            class="px-0.5 text-sm font-semibold text-(--ui-primary)/55"
          >
            {{ segment.value }}
          </span>
          <TimeFieldInput
            v-else
            :part="segment.part"
            as="span"
            :class="getSegmentClasses(segment.part)"
          >
            {{ segment.value }}
          </TimeFieldInput>
        </template>
      </div>
    </template>
  </TimeFieldRoot>
</template>

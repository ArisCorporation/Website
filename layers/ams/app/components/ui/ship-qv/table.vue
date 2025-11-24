<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  rows: {
    columns: 2 | 3
    items: {
      label: string
      value: string | number | Array<string | number>
      slider?: number
      link?: string
    }[]
  }[]
}>()
</script>

<template>
  <div class="space-y-4">
    <template
      v-for="(row, rowIndex) in $props.rows"
      :key="`${$props.title}-${rowIndex}`"
    >
      <div
        class="grid gap-4"
        :class="row.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'"
      >
        <div
          v-for="(item, itemIndex) in row.items"
          :key="`${$props.title}-${rowIndex}-${itemIndex}`"
        >
          <label class="font-medium text-(--ui-text-muted) text-xs!">
            {{ item.label }}
          </label>
          <template v-if="Array.isArray(item.value)">
            <ul class="mt-0 uppercase mb-0 font-mono text-xs!">
              <li
                v-for="value in item.value"
                :key="value"
                class="!my-0 marker:text-(--ui-primary) pl-0"
              >
                {{ value }}
              </li>
            </ul>
          </template>
          <template v-else>
            <NuxtLink
              v-if="item.link"
              :to="item.link"
              target="_blank"
              class="not-prose w-fit active:scale-95 transition-all hover:scale-105 block"
            >
              <p class="mt-0 mb-0 uppercase font-mono text-xs!">
                {{ item.value }}
              </p>
            </NuxtLink>
            <div v-else>
              <p class="mt-0 mb-0 uppercase font-mono text-xs!">
                {{ item.value }}
              </p>
              <UProgress
                v-if="item.slider"
                :model-value="typeof item.value === 'number' ? item.value : 0"
                :max="item.slider"
                size="xs"
              />
            </div>
          </template>
        </div>
      </div>
      <div v-if="rowIndex < $props.rows.length - 1" class="col-span-2">
        <USeparator color="ams" />
      </div>
    </template>
  </div>
</template>

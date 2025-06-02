<script setup lang="ts">
import type { CommLink } from '~~/types'

defineProps<{ data: CommLink }>()

function publishingSinceDate(item: CommLink) {
  if (!item.date_created) return 'N/A'
  const date = new Date(item.date_created)
  date.setFullYear(date.getFullYear())
  // Format to yyyy-mm-dd
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createSnippet(
  htmlContent: string | null | undefined,
  maxLength: number = 100
): string {
  if (!htmlContent) return ''
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>?/gm, '')
  // Truncate and add ellipsis
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...'
  }
  return text
}
</script>

<template>
  <UCard
    variant="ams"
    :ui="{
      header: 'mb-0',
      body: 'mt-0 flex-1 !pt-2',
      root: 'flex flex-col',
    }"
    class="hover:scale-[1.02] duration-300 transition-transform ease-out group"
  >
    <template #header>
      <div class="flex gap-x-2 justify-between not-prose">
        <UBadge variant="outline" class="h-fit shrink">
          <span class="">{{ data.channel?.name }}</span>
        </UBadge>
        <p class="text-sm ml-auto shrink-0">
          {{ publishingSinceDate(data as CommLink) }}
        </p>
      </div>
    </template>
    <template #default>
      <div class="flex flex-col h-full">
        <UButton variant="link" :to="`/ams/comm-link/${data.id}`" class="p-0">
          <h4
            class="mt-0 prose prose-invert transition-color duration-300 hover:text-(--ui-primary)"
          >
            {{ data.name }}
          </h4>
        </UButton>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ createSnippet(data.content, 80) }}
        </p>
        <div class="flex gap-x-2 datas-center flex-wrap mt-auto">
          <UAvatar :src="getAssetId(data.user_created?.avatar)" />
          <p class="not-prose">{{ getUserLabel(data.user_created) }}</p>
        </div>
      </div>
    </template>
  </UCard>
</template>

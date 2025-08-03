<script setup lang="ts">
import type { CommLink, CommLinkChannel, DirectusUser } from '~~/types'

defineProps<{ data: CommLink }>()

function sinceDate(item: CommLink) {
  const dateString =
    item.status === 'published' ? item.date_published : item.date_created
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  // Format to yyyy-mm-dd
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year + (item.status === 'draft' ? 930 : 0)}-${month}-${day}`
}

function createSnippet(
  htmlContent: string | null | undefined,
  maxLength: number = 100
): string {
  if (!htmlContent) return ''
  // Strip HTML tags
  let text = htmlContent.replace(/<[^>]*>?/gm, '')
  // Replace line breaks with a space
  text = text.replace(/\r?\n|\r/gm, ' ')
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
          <span>{{ (data.channel as CommLinkChannel)?.name }}</span>
        </UBadge>
        <p class="text-sm ml-auto shrink-0 items-center flex gap-x-2">
          <UTooltip
            :text="data.status === 'published' ? 'Veröffentlicht' : 'Entwurf'"
          >
            <UIcon
              :name="
                data.status === 'published'
                  ? 'i-lucide-globe'
                  : 'i-lucide-file-pen'
              "
            />
          </UTooltip>
          {{ sinceDate(data as CommLink) }}
        </p>
      </div>
    </template>
    <template #default>
      <div class="flex flex-col h-full">
        <UButton
          @click="$emit('select', data)"
          variant="link"
          class="p-0 w-fit"
        >
          <h4
            class="mt-0 prose wrap-anywhere prose-invert w-fit text-left transition-color duration-300 hover:text-(--ui-primary)"
          >
            {{ data.name }}
          </h4>
        </UButton>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 wrap-anywhere">
          {{ createSnippet(data.content, 80) }}
        </p>
        <div class="flex gap-x-2 mt-auto">
          <UAvatar
            :src="getAssetId((data.user_created as DirectusUser)?.avatar)"
          />
          <p class="not-prose my-auto wrap-break-word">
            {{ getUserLabel(data.user_created as DirectusUser) }}
          </p>
        </div>
      </div>
    </template>
  </UCard>
</template>

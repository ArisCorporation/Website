<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>()

const { data: patches } = await useFetch(
  'https://ungh.cc/repos/ArisCorporation/Website/releases',
  {
    transform: (data: any[]) => {
      return data?.releases
        ?.map((item: any) => ({
          title: item.name,
          markdown: item.markdown,
          html: item.html,
          createdAt: item.createdAt,
          publishedAt: item.publishedAt,
          tag: item.tag,
        }))
        .slice(0, 1)
    },
  }
)
</script>

<template>
  <ClientOnly>
    <UModal
      :open="true"
      :close="{ onClick: () => emit('close', false) }"
      title="Changelog"
      :ui="{ content: 'max-w-4xl' }"
    >
      <template #body>
        <UChangelogVersions
          as="main"
          :indicator-motion="false"
          :ui="{
            indicator: 'inset-y-0',
          }"
        >
          <UChangelogVersion
            v-for="patch in patches"
            :key="patch.tag"
            v-bind="patch"
            :ui="{
              root: 'flex items-start',
              container: 'max-w-xl m-0!',
              header: 'border-b border-default pb-4',
              title: 'text-3xl',
              date: 'text-xs/9 text-highlighted font-mono',
              indicator:
                'sticky top-0 pt-16 -mt-16 sm:pt-24 sm:-mt-24 lg:pt-32 lg:-mt-32',
            }"
          >
            <template #body>
              <MDC
                v-if="patch.markdown"
                :value="patch.markdown || '---'"
                tag="article"
                :key="patch.tag"
              />
            </template>
          </UChangelogVersion>
        </UChangelogVersions>
      </template>
      <template #footer>
        <UButton variant="subtle" @click="emit('close', false)"
          >Schließen</UButton
        >
      </template>
    </UModal>
  </ClientOnly>
</template>

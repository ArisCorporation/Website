<script setup lang="ts">
import { readItems } from '@directus/sdk'

type ReleaseNoteTranslation = {
  languages_code?: string | null
  name?: string | null
  content?: string | null
}

type ReleaseNoteRecord = {
  id: string
  version?: string | null
  banner?: string | null
  date_created?: string | null
  translations?: ReleaseNoteTranslation[] | null
}

type ReleaseNoteItem = {
  id: string
  version: string
  title: string
  markdown: string
  date?: string
  image?: string
}

const releaseNoteFields = [
  'id',
  'version',
  'banner',
  'date_created',
  'translations.languages_code',
  'translations.name',
  'translations.content',
]

function getPreferredTranslation(translations?: ReleaseNoteTranslation[] | null) {
  if (!translations?.length) return null
  return (
    translations.find((t) => t.languages_code === 'de-DE') ??
    translations.find((t) => t.languages_code === 'en-EN') ??
    translations.find((t) => t.languages_code === 'en-US') ??
    translations[0] ??
    null
  )
}

const { data: versions, pending } = await useAsyncData<ReleaseNoteItem[]>(
  'release-notes:versions-index',
  async () => {
    const raw = (await useDirectus(
      readItems('release_notes' as any, {
        fields: releaseNoteFields,
        filter: { status: { _eq: 'published' } },
        sort: ['-date_created'],
      }),
    )) as ReleaseNoteRecord[]

    return raw.map((record) => {
      const translation = getPreferredTranslation(record.translations)
      return {
        id: record.id,
        version: record.version ?? '',
        title:
          translation?.name?.trim() ||
          `Release Notes - ${record.version ?? 'Unbekannt'}`,
        markdown: translation?.content?.trim() || '',
        date: record.date_created || undefined,
        image: record.banner ? getAssetId(record.banner) : undefined,
      }
    })
  },
  { default: () => [], server: false },
)

const selectedVersion = ref<ReleaseNoteItem | null>(null)
const detailOpen = ref(false)

function openVersion(v: ReleaseNoteItem) {
  selectedVersion.value = v
  detailOpen.value = true
}

function formatDate(value?: string) {
  if (!value) return null
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-tag"
      title="Versionsübersicht"
      description="Release Notes und Changelogs aller Versionen"
    />

    <div v-if="pending" class="flex items-center justify-center py-24">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-primary)/50" />
    </div>

    <div v-else-if="!versions?.length" class="flex flex-col items-center justify-center py-24 text-center">
      <UIcon name="i-lucide-tag" class="h-12 w-12 mx-auto mb-3 text-(--ui-text-muted)/40" />
      <p class="text-(--ui-text-muted)">Keine Release Notes gefunden.</p>
    </div>

    <div v-else class="max-w-2xl space-y-3 pb-10">
      <button
        v-for="v in versions"
        :key="v.id"
        class="group w-full rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 px-5 py-4 text-left ring-1 ring-inset ring-white/5 transition-all hover:border-(--ui-primary)/30 hover:bg-(--ui-primary)/5"
        @click="openVersion(v)"
      >
        <div class="flex items-center gap-3">
          <UBadge
            v-if="v.version"
            color="primary"
            variant="subtle"
            size="sm"
            class="shrink-0 font-mono"
          >
            {{ v.version }}
          </UBadge>
          <p class="flex-1 truncate text-sm font-medium text-white">
            {{ v.title }}
          </p>
          <span v-if="v.date" class="shrink-0 text-xs text-(--ui-text-muted)">
            {{ formatDate(v.date) }}
          </span>
          <UIcon
            name="i-lucide-chevron-right"
            class="h-4 w-4 shrink-0 text-(--ui-text-muted)/40 transition-colors group-hover:text-(--ui-primary)"
          />
        </div>
      </button>
    </div>

    <UModal
      v-if="selectedVersion"
      v-model:open="detailOpen"
      :title="selectedVersion.title"
      :ui="{ content: 'max-w-4xl' }"
    >
      <template #body>
        <UChangelogVersions
          as="main"
          :indicator-motion="false"
          :ui="{ indicator: 'inset-y-0' }"
        >
          <UChangelogVersion
            :key="selectedVersion.id"
            :title="selectedVersion.title"
            :date="selectedVersion.date"
            :badge="selectedVersion.version || undefined"
            :image="selectedVersion.image"
            :ui="{
              root: 'flex items-start',
              container: 'max-w-xl m-0!',
              header: 'border-b border-default pb-4',
              title: 'text-3xl',
              date: 'text-xs/9 text-highlighted font-mono',
              imageWrapper: 'overflow-hidden rounded-2xl border border-default/60',
              image: 'w-full object-cover',
              indicator: 'sticky top-0 pt-16 -mt-16 sm:pt-24 sm:-mt-24 lg:pt-32 lg:-mt-32',
            }"
          >
            <template #body>
              <MDC
                v-if="selectedVersion.markdown"
                :key="selectedVersion.id"
                :value="selectedVersion.markdown"
                tag="article"
              />
              <p v-else class="text-sm text-(--ui-text-muted)">
                Keine Inhalte verfügbar.
              </p>
            </template>
          </UChangelogVersion>
        </UChangelogVersions>
      </template>
      <template #footer>
        <UButton variant="subtle" @click="detailOpen = false">Schließen</UButton>
      </template>
    </UModal>
  </div>
</template>

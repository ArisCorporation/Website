<script setup lang="ts">
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

const emit = defineEmits<{ close: [boolean] }>()

const runtimeConfig = useRuntimeConfig()
const releaseNoteFields = [
  'id',
  'version',
  'banner',
  'date_created',
  'translations.languages_code',
  'translations.name',
  'translations.content',
]

function normalizeVersion(value?: string | null) {
  return value?.trim().replace(/^[vV]/, '') ?? ''
}

function getPreferredTranslation(translations?: ReleaseNoteTranslation[] | null) {
  if (!translations?.length) return null

  return (
    translations.find((translation) => translation.languages_code === 'de-DE') ??
    translations.find((translation) => translation.languages_code === 'en-EN') ??
    translations.find((translation) => translation.languages_code === 'en-US') ??
    translations[0] ??
    null
  )
}

const currentVersion = computed(() =>
  normalizeVersion(runtimeConfig.public.VERSION),
)

const { data: displayedPatch } = await useAsyncData(
  'release-notes:changelog-modal',
  async () => {
    const rawVersion = runtimeConfig.public.VERSION?.trim()
    const normalizedVersion = currentVersion.value
    const versionCandidates = [...new Set([
      rawVersion,
      normalizedVersion || undefined,
      normalizedVersion ? `V${normalizedVersion}` : undefined,
      normalizedVersion ? `v${normalizedVersion}` : undefined,
    ])].filter((value): value is string => !!value)

    const matchingNotes =
      versionCandidates.length > 0
        ? (((await useDirectus(
            readItems('release_notes' as any, {
              fields: releaseNoteFields,
              filter: {
                status: { _eq: 'published' },
                _or: versionCandidates.map((value) => ({
                  version: { _eq: value },
                })),
              },
              sort: ['-date_created'],
              limit: 1,
            }),
          )) as ReleaseNoteRecord[]) ?? [])
        : []

    const fallbackNotes =
      matchingNotes.length > 0
        ? matchingNotes
        : (((await useDirectus(
            readItems('release_notes' as any, {
              fields: releaseNoteFields,
              filter: {
                status: { _eq: 'published' },
              },
              sort: ['-date_created'],
              limit: 1,
            }),
          )) as ReleaseNoteRecord[]) ?? [])

    const matchingNote = fallbackNotes[0]
    if (!matchingNote) return null

    const translation = getPreferredTranslation(matchingNote.translations)

    return {
      id: matchingNote.id,
      title:
        translation?.name?.trim() ||
        `Release Notes - Version ${matchingNote.version ?? currentVersion.value}`,
      markdown: translation?.content?.trim() || '',
      date: matchingNote.date_created || undefined,
      badge: matchingNote.version || undefined,
      image: matchingNote.banner ? getAssetId(matchingNote.banner) : undefined,
    }
  },
  {
    default: () => null,
    server: false,
  },
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
          v-if="displayedPatch"
          as="main"
          :indicator-motion="false"
          :ui="{
            indicator: 'inset-y-0',
          }"
        >
          <UChangelogVersion
            :key="displayedPatch.id"
            :title="displayedPatch.title"
            :date="displayedPatch.date"
            :badge="displayedPatch.badge"
            :image="displayedPatch.image"
            :ui="{
              root: 'flex items-start',
              container: 'max-w-xl m-0!',
              header: 'border-b border-default pb-4',
              title: 'text-3xl',
              date: 'text-xs/9 text-highlighted font-mono',
              imageWrapper: 'overflow-hidden rounded-2xl border border-default/60',
              image: 'w-full object-cover',
              indicator:
                'sticky top-0 pt-16 -mt-16 sm:pt-24 sm:-mt-24 lg:pt-32 lg:-mt-32',
            }"
          >
            <template #body>
              <MDC
                v-if="displayedPatch.markdown"
                :key="displayedPatch.id"
                :value="displayedPatch.markdown"
                tag="article"
              />
            </template>
          </UChangelogVersion>
        </UChangelogVersions>

        <div
          v-else
          class="rounded-2xl border border-dashed border-default px-6 py-10 text-center text-sm text-(--ui-text-muted)"
        >
          Keine Release Notes gefunden.
        </div>
      </template>
      <template #footer>
        <UButton variant="subtle" @click="emit('close', false)">
          Schließen
        </UButton>
      </template>
    </UModal>
  </ClientOnly>
</template>

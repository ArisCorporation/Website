<script setup lang="ts">
import type { DirectusFile, DirectusFolder } from '~~/types'
import type { TreeItem } from '@nuxt/ui'

const props = defineProps<{ allTypes: boolean }>()

const emit = defineEmits<{
  'selected:folder': [TreeItem | null]
  'selected:file': [DirectusFile]
}>()

const page = ref(1)
const itemsPerPage = ref(40)
const searchTerm = ref('')
const sortOption = ref<'recent' | 'name' | 'size'>('recent')
const viewMode = ref<'grid' | 'list'>('grid')
const expanded = ref<string[]>(['root'])
const selectedFolderId = ref<string>('all')
const selectedFile = ref<DirectusFile | null>(null)

const numberFormatter = new Intl.NumberFormat('de-DE')
const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const sortOptions = [
  { label: 'Zuletzt geändert', value: 'recent' as const },
  { label: 'Name (A–Z)', value: 'name' as const },
  { label: 'Dateigröße', value: 'size' as const },
]

const sortMapping: Record<'recent' | 'name' | 'size', string[]> = {
  recent: ['-modified_on'],
  name: ['title', 'filename_download'],
  size: ['-filesize'],
}

const perPageOptions = [
  { label: '20 pro Seite', value: 20 },
  { label: '40 pro Seite', value: 40 },
  { label: '80 pro Seite', value: 80 },
]

function transformFoldersToTreeItems(
  folders: DirectusFolder[] | null | undefined,
  visibleIds: Set<string> | null
): TreeItem[] {
  if (!folders) {
    return []
  }

  const childrenMap = new Map<string | null, DirectusFolder[]>()
  folders.forEach((folder) => {
    const parentId = folder.parent || null
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, [])
    }
    childrenMap.get(parentId)!.push(folder)
  })

  function buildTree(parentId: string | null): TreeItem[] {
    const children = childrenMap.get(parentId) || []
    children.sort((a, b) => a.name.localeCompare(b.name, 'de-DE'))

    const nodes: TreeItem[] = []

    for (const folder of children) {
      if (visibleIds && !visibleIds.has(folder.id)) {
        continue
      }

      const node: TreeItem = {
        label: folder.name,
        value: folder.id,
        id: folder.id,
        meta: {
          type: 'folder',
          folderId: folder.id,
        },
      }

      const grandChildren = buildTree(folder.id)
      if (grandChildren.length > 0) {
        node.children = grandChildren
      }

      nodes.push(node)
    }

    return nodes
  }

  return buildTree(null)
}

const { data: folders } = useAsyncData<DirectusFolder[]>(
  'ams:filebrowser-folders',
  async () =>
    await useDirectus(
      readFolders({
        sort: ['name'],
        limit: -1,
      })
    )
)

const folderParentMap = computed(() => {
  const map = new Map<string, string | null>()
  for (const folder of folders.value ?? []) {
    map.set(folder.id, folder.parent ?? null)
  }
  return map
})

const selectedFolder = ref<TreeItem | null>(null)

const getTreeItemKey = (item: TreeItem | null | undefined): string => {
  if (!item) {
    return ''
  }

  if (typeof item.id === 'string' || typeof item.id === 'number') {
    return String(item.id)
  }

  if (typeof item.value === 'string' || typeof item.value === 'number') {
    return String(item.value)
  }

  if (typeof item.label === 'string') {
    return item.label
  }

  return ''
}

const findTreeItemByKey = (
  items: TreeItem[] | undefined,
  key: string
): TreeItem | null => {
  if (!items?.length || !key) {
    return null
  }

  for (const item of items) {
    if (getTreeItemKey(item) === key) {
      return item
    }

    const match = findTreeItemByKey(item.children as TreeItem[], key)
    if (match) {
      return match
    }
  }

  return null
}

watch(
  () => selectedFolder.value,
  (item, previousItem) => {
    const key = getTreeItemKey(item) || 'all'
    const previousKey = getTreeItemKey(previousItem) || 'all'
    const changed = key !== previousKey

    if (selectedFolderId.value !== key) {
      selectedFolderId.value = key
    }

    if (changed || !previousItem) {
      emit('selected:folder', item ?? null)
    }

    if (changed) {
      page.value = 1
      selectedFile.value = null
    }
  },
  { immediate: true }
)

const { data: fileCounts } = await useAsyncData(
  'ams:filebrowser-filecounts',
  async () =>
    await useDirectus(
      aggregate('directus_files', {
        aggregate: { count: '*' },
        groupBy: ['folder'],
        filter: {
          ...(props.allTypes ? {} : { type: { _starts_with: 'image' } }),
        },
      })
    ),
  {
    watch: [() => props.allTypes],
  }
)

const folderCountSummary = computed(() => {
  const counts = new Map<string | null, number>()
  let total = 0

  for (const entry of fileCounts.value ?? []) {
    const folderId = entry.folder ?? null
    const amount = Number(entry.count ?? 0)
    counts.set(folderId, (counts.get(folderId) ?? 0) + amount)
    total += amount
  }

  return { counts, total }
})

const visibleFolderIds = computed<Set<string> | null>(() => {
  if (props.allTypes !== false) {
    return null
  }

  const result = new Set<string>()
  const parents = folderParentMap.value
  const counts = folderCountSummary.value.counts

  const addAncestors = (folderId: string | null) => {
    let current = folderId
    while (current) {
      if (!result.has(current)) {
        result.add(current)
      }
      current = parents.get(current) ?? null
    }
  }

  for (const [id, count] of counts.entries()) {
    if ((count ?? 0) <= 0) {
      continue
    }

    if (id) {
      addAncestors(id)
    } else {
      result.add('root')
    }
  }

  if (folderCountSummary.value.total > 0) {
    result.add('all')
    result.add('root')
  }

  return result
})

const folderTree = computed<TreeItem[]>(() => {
  const visibleIds = visibleFolderIds.value

  const children: TreeItem[] = []

  if (!visibleIds || visibleIds.has('all')) {
    children.push({
      id: 'all',
      value: 'all',
      label: 'Alle Dateien',
      meta: {
        type: 'virtual',
      },
    })
  }

  children.push(...transformFoldersToTreeItems(folders.value, visibleIds))

  return [
    {
      id: 'root',
      value: 'root',
      label: 'Dateibibliothek',
      meta: {
        type: 'root',
      },
      ui: {
        item: 'px-2 py-1.5 rounded-lg transition-colors duration-200 data-[selected]:bg-transparent data-[selected]:text-(--ui-text-highlighted)',
        itemWithChildren:
          'px-2 py-1.5 rounded-lg transition-colors duration-200 data-[selected]:bg-transparent data-[selected]:text-(--ui-text-highlighted)',
        link: 'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-(--ui-text-muted) transition-colors duration-200 hover:bg-transparent data-[selected]:bg-transparent data-[selected]:text-(--ui-text-highlighted)',
      },
      children,
    },
  ]
})

watch(
  [() => folderTree.value, selectedFolderId],
  () => {
    const targetKey = selectedFolderId.value || 'all'
    const match =
      findTreeItemByKey(folderTree.value, targetKey) ??
      findTreeItemByKey(folderTree.value, 'all') ??
      folderTree.value?.[0] ??
      null

    if (match && match !== selectedFolder.value) {
      selectedFolder.value = match
      return
    }

    if (!match && selectedFolderId.value !== 'all') {
      selectedFolderId.value = 'all'
    } else if (!selectedFolder.value) {
      selectedFolder.value =
        findTreeItemByKey(folderTree.value, 'all') ??
        folderTree.value?.[0] ??
        null
    }
  },
  { immediate: true }
)

const getFolderCount = (id?: string | null): number | null => {
  if (!fileCounts.value) {
    return null
  }

  if (!id || id === 'all' || id === 'root') {
    return folderCountSummary.value.total
  }

  return folderCountSummary.value.counts.get(id) ?? 0
}

const activeFolderId = computed(() =>
  selectedFolderId.value === 'root' ? 'all' : selectedFolderId.value || 'all'
)

const activeFolderLabel = computed(
  () => selectedFolder.value?.label ?? 'Alle Dateien'
)

const hasChildFolders = (item?: TreeItem | null) =>
  Boolean(item?.children?.some((child) => child.meta?.type === 'folder'))

const fileQueryKey = computed(() => ({
  folderId: activeFolderId.value,
  page: page.value,
  limit: itemsPerPage.value,
  search: searchTerm.value.trim(),
  sort: sortOption.value,
  allTypes: props.allTypes,
}))

type FilesResult = { items: DirectusFile[]; total: number }

const extractAggregateCount = (input: unknown): number | null => {
  const visited = new WeakSet<object>()

  const dig = (value: unknown): number | null => {
    if (value == null) {
      return null
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        const result = dig(entry)
        if (result != null) {
          return result
        }
      }
      return null
    }
    if (typeof value === 'object') {
      if (visited.has(value as object)) {
        return null
      }
      visited.add(value as object)

      const record = value as Record<string, unknown>

      if (typeof record.count === 'number' && Number.isFinite(record.count)) {
        return record.count
      }

      if (record.count != null) {
        const nested = dig(record.count)
        if (nested != null) {
          return nested
        }
      }

      if ('data' in record) {
        const nested = dig(record.data)
        if (nested != null) {
          return nested
        }
      }

      for (const entry of Object.values(record)) {
        const nested = dig(entry)
        if (nested != null) {
          return nested
        }
      }
    }

    return null
  }

  return dig(input)
}

const filesPending = ref(false)
const filesError = shallowRef<unknown | null>(null)
const filesResult = shallowRef<FilesResult>({ items: [], total: 0 })

watch(
  () => ({ ...fileQueryKey.value }),
  async (query, _prev, onCleanup) => {
    const abort = { cancelled: false }
    onCleanup(() => {
      abort.cancelled = true
    })

    filesPending.value = true
    filesError.value = null

    const filters: Record<string, any> = {
      ...(query.allTypes ? {} : { type: { _starts_with: 'image' } }),
    }

    if (query.folderId && query.folderId !== 'all') {
      filters.folder = { _eq: query.folderId }
    }

    if (query.search) {
      filters._or = [
        { title: { _icontains: query.search } },
        { filename_download: { _icontains: query.search } },
        { filename_disk: { _icontains: query.search } },
      ]
    }

    try {
      const [filesResponse, aggregateResponse] = await Promise.allSettled([
        useDirectus(
          readFiles({
            fields: [
              'id',
              'filename_disk',
              'filename_download',
              'type',
              'title',
              'description',
              'width',
              'height',
              'filesize',
              'modified_on',
            ],
            limit: query.limit,
            offset: (query.page - 1) * query.limit,
            sort: sortMapping[query.sort],
            filter: filters,
          })
        ),
        useDirectus(
          aggregate('directus_files', {
            aggregate: { count: '*' },
            filter: filters,
          })
        ),
      ])

      if (abort.cancelled) {
        return
      }

      if (filesResponse.status !== 'fulfilled') {
        throw filesResponse.reason ?? new Error('Files request failed')
      }

      const rawFiles = filesResponse.value
      const items = (
        Array.isArray(rawFiles)
          ? rawFiles
          : (rawFiles?.data as DirectusFile[] | undefined) ?? []
      ) as DirectusFile[]

      let total =
        aggregateResponse.status === 'fulfilled'
          ? extractAggregateCount(aggregateResponse.value)
          : null

      if (total == null) {
        const metaRecord =
          !Array.isArray(rawFiles) && rawFiles && typeof rawFiles === 'object'
            ? ((rawFiles as Record<string, unknown>).meta as
                | Record<string, unknown>
                | undefined)
            : undefined

        if (metaRecord && typeof metaRecord === 'object') {
          const candidateKeys = [
            'filter_count',
            'total_count',
            'count',
          ] as const
          for (const key of candidateKeys) {
            const candidate = metaRecord[key]
            if (typeof candidate === 'number' && Number.isFinite(candidate)) {
              total = candidate
              break
            }
          }
        }
      }

      const resolvedTotal =
        typeof total === 'number' && Number.isFinite(total)
          ? total
          : Math.max(
              (query.page - 1) * query.limit + items.length,
              items.length
            )

      if (!abort.cancelled) {
        filesResult.value = {
          items,
          total: resolvedTotal,
        }
      }
    } catch (error) {
      if (!abort.cancelled) {
        filesError.value = error
        filesResult.value = { items: [], total: 0 }
      }
    } finally {
      if (!abort.cancelled) {
        filesPending.value = false
      }
    }
  },
  { immediate: true, deep: true }
)

const displayedFiles = computed<DirectusFile[]>(
  () => filesResult.value?.items ?? []
)
const totalFiles = computed(() => filesResult.value?.total ?? 0)

const pageCount = computed(() =>
  Math.max(1, Math.ceil(totalFiles.value / itemsPerPage.value))
)

const currentRange = computed(() => {
  if (!totalFiles.value) {
    return { start: 0, end: 0 }
  }

  const start = (page.value - 1) * itemsPerPage.value + 1
  const end = Math.min(
    start + itemsPerPage.value - 1,
    totalFiles.value ?? start
  )

  return { start, end }
})

const highlightedFileId = computed(() => selectedFile.value?.id ?? null)

const isEmpty = computed(
  () => !filesPending.value && displayedFiles.value.length === 0
)

const hasError = computed(() => Boolean(filesError.value))

function formatBytes(bytes?: number | string | null): string {
  const numericBytes = Number(bytes)

  if (!Number.isFinite(numericBytes) || numericBytes < 0) {
    return '—'
  }

  if (numericBytes === 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = numericBytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }

  const precision = value < 10 && unitIndex > 0 ? 1 : 0

  return `${value.toFixed(precision)} ${units[unitIndex]}`
}

function formatDate(value?: string | null): string {
  if (!value) {
    return '—'
  }

  return dateFormatter.format(new Date(value))
}

function getFileDisplayName(file: DirectusFile): string {
  return (
    file.title ??
    file.filename_download ??
    file.filename_disk ??
    'Unbenannte Datei'
  )
}

function getFileExtension(file: DirectusFile): string {
  const byFilename =
    file.filename_download?.split('.').pop() ??
    file.filename_disk?.split('.').pop()

  if (byFilename) {
    return byFilename.toUpperCase()
  }

  if (!file.type) {
    return 'FILE'
  }

  return file.type.split('/').pop()?.toUpperCase() ?? 'FILE'
}

const selectedFilePreview = computed(() =>
  selectedFile.value?.id ? getAssetId(selectedFile.value.id) : null
)
const selectedFileIsImage = computed(() =>
  Boolean(selectedFile.value?.type?.startsWith('image'))
)

watch(
  selectedFolder,
  (item, previousItem) => {
    const key = getTreeItemKey(item) || 'all'
    const previousKey = getTreeItemKey(previousItem) || 'all'
    const changed = key !== previousKey

    if (key !== selectedFolderId.value) {
      selectedFolderId.value = key
    }

    if (changed || !previousItem) {
      emit('selected:folder', item ?? null)
    }

    if (changed) {
      page.value = 1
      selectedFile.value = null
    }
  },
  { flush: 'post' }
)

watch(
  [searchTerm, sortOption, itemsPerPage],
  () => {
    page.value = 1
  },
  { flush: 'post' }
)

watch(itemsPerPage, (value) => {
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    itemsPerPage.value = Number.isFinite(parsed) ? parsed : 40
  }
})

watch(
  () => pageCount.value,
  (count) => {
    if (page.value > count) {
      page.value = count
    }
  }
)

watch(displayedFiles, (files) => {
  if (!selectedFile.value) {
    return
  }

  const refreshed = files.find((item) => item.id === selectedFile.value?.id)
  if (refreshed) {
    selectedFile.value = { ...selectedFile.value, ...refreshed }
  }
})

function handleFileSelection(file: DirectusFile) {
  selectedFile.value = file
  emit('selected:file', file)
}
</script>

<template>
  <div
    class="flex h-full min-h-[460px] border border-(--ui-primary)/15 rounded-2xl overflow-hidden bg-(--ui-bg-muted)/30"
  >
    <aside
      class="w-72 min-w-64 max-w-sm border-r border-(--ui-primary)/15 bg-(--ui-bg-muted)/60 flex flex-col"
    >
      <div
        class="px-5 py-4 border-b border-(--ui-primary)/15 flex items-center justify-between"
      >
        <h3
          class="text-sm font-semibold tracking-wide uppercase text-(--ui-text-muted)"
        >
          Ordner
        </h3>
        <span class="text-xs text-(--ui-text-muted)">
          {{ numberFormatter.format(folderCountSummary.total) }}
        </span>
      </div>
      <div class="flex-1 overflow-y-auto px-2 py-4">
        <UTree
          v-model="selectedFolder"
          v-model:expanded="expanded"
          :items="folderTree"
          :get-key="getTreeItemKey"
          :ui="{
            root: 'space-y-2',
            list: 'space-y-1',
            listWithChildren: 'space-y-1',
            item: 'rounded-lg',
          }"
        >
          <template
            #item="{
              item,
              expanded: isExpanded,
              selected,
              handleSelect,
              handleToggle,
            }"
          >
            <div
              role="button"
              tabindex="0"
              class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)"
              :class="
                item.meta?.type === 'root'
                  ? 'text-(--ui-text-muted) hover:bg-transparent aria-selected:text-(--ui-text-highlighted)'
                  : 'text-(--ui-text) hover:bg-(--ui-primary)/10 aria-selected:bg-(--ui-primary)/15 aria-selected:text-(--ui-text-highlighted)'
              "
              :aria-selected="selected"
              @pointerdown.stop
              @click.stop="handleSelect()"
              @keydown.enter.prevent="handleSelect()"
              @keydown.space.prevent="handleSelect()"
            >
              <span class="flex items-center gap-1.5">
                <button
                  v-if="hasChildFolders(item)"
                  type="button"
                  class="inline-flex size-4 items-center justify-center rounded transition-colors duration-200 hover:bg-(--ui-primary)/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)"
                  @pointerdown.stop
                  @click.stop="handleToggle?.()"
                  :aria-label="
                    isExpanded
                      ? 'Unterordner einklappen'
                      : 'Unterordner ausklappen'
                  "
                  :aria-expanded="isExpanded"
                >
                  <UIcon
                    :name="
                      isExpanded
                        ? 'i-lucide-chevron-down'
                        : 'i-lucide-chevron-right'
                    "
                    class="size-3 text-(--ui-text-muted)"
                  />
                </button>
                <UIcon
                  :name="
                    isExpanded || selected
                      ? 'i-lucide-folder-open'
                      : 'i-lucide-folder'
                  "
                  class="size-5 shrink-0 text-(--ui-primary)"
                />
              </span>
              <span class="flex-1 truncate">
                {{ item.label }}
              </span>
              <span
                v-if="getFolderCount(item.id) !== null"
                class="ml-auto text-xs tabular-nums text-(--ui-text-muted)"
              >
                {{ numberFormatter.format(getFolderCount(item.id) ?? 0) }}
              </span>
            </div>
          </template>
        </UTree>
      </div>
    </aside>

    <section class="flex-1 flex flex-col overflow-hidden">
      <header
        class="px-6 py-4 border-b border-(--ui-primary)/15 flex flex-wrap items-center justify-between gap-4"
      >
        <div class="min-w-0">
          <h2
            class="text-lg font-semibold text-(--ui-text-highlighted) truncate"
          >
            {{ activeFolderLabel }}
          </h2>
          <p class="text-xs text-(--ui-text-muted)">
            {{ numberFormatter.format(totalFiles) }} Dateien
          </p>
        </div>
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-grid-2x2"
            :variant="viewMode === 'grid' ? 'solid' : 'ghost'"
            size="sm"
            color="primary"
            @click="viewMode = 'grid'"
            :aria-pressed="viewMode === 'grid'"
          />
          <UButton
            icon="i-lucide-list"
            :variant="viewMode === 'list' ? 'solid' : 'ghost'"
            size="sm"
            color="primary"
            @click="viewMode = 'list'"
            :aria-pressed="viewMode === 'list'"
          />
        </div>
      </header>

      <div
        class="px-6 py-4 border-b border-(--ui-primary)/15 flex flex-wrap items-center gap-3"
      >
        <UInput
          v-model="searchTerm"
          icon="i-lucide-search"
          placeholder="Dateien durchsuchen…"
          class="w-full sm:w-72"
          color="primary"
        />
        <USelectMenu
          v-model="sortOption"
          :options="sortOptions"
          option-attribute="label"
          value-attribute="value"
          :ui="{
            trigger: 'min-w-[12rem]',
            content: 'min-w-[12rem]',
          }"
        >
          <template #trigger>
            <span class="text-sm truncate">
              Sortierung:
              {{
                sortOptions.find((option) => option.value === sortOption)?.label
              }}
            </span>
          </template>
        </USelectMenu>
        <USelectMenu
          v-model="itemsPerPage"
          :options="perPageOptions"
          option-attribute="label"
          value-attribute="value"
          :ui="{
            trigger: 'min-w-[10rem]',
            content: 'min-w-[10rem]',
          }"
        >
          <template #trigger>
            <span class="text-sm truncate"> {{ itemsPerPage }} pro Seite </span>
          </template>
        </USelectMenu>
      </div>

      <div class="flex-1 overflow-hidden flex">
        <div class="flex-1 overflow-y-auto px-6 py-6">
          <UAlert
            v-if="hasError"
            color="error"
            variant="soft"
            title="Fehler beim Laden der Dateien"
            description="Bitte versuche es in wenigen Augenblicken erneut."
            class="max-w-lg"
          />

          <div v-else>
            <div
              v-if="filesPending"
              class="grid gap-4"
              :class="
                viewMode === 'grid'
                  ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              "
            >
              <USkeleton
                v-for="n in viewMode === 'grid'
                  ? itemsPerPage
                  : Math.min(itemsPerPage, 6)"
                :key="n"
                class="h-40 rounded-xl bg-(--ui-bg-muted)/60"
              />
            </div>

            <UEmptyState
              v-else-if="isEmpty"
              icon="i-lucide-image-off"
              title="Keine Dateien gefunden"
              description="Passe deine Filter an oder wähle einen anderen Ordner."
              class="py-16"
            />

            <div v-else>
              <div
                v-if="viewMode === 'grid'"
                name="list"
                tag="div"
                class="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              >
                <button
                  v-for="file in displayedFiles"
                  :key="file.id"
                  type="button"
                  @click="handleFileSelection(file)"
                  class="group relative overflow-hidden rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)"
                  :class="
                    highlightedFileId === file.id
                      ? 'border-(--ui-primary)/60 bg-(--ui-primary)/10 shadow-primary-xs'
                      : 'border-(--ui-primary)/15 hover:border-(--ui-primary)/40 hover:bg-(--ui-primary)/10'
                  "
                >
                  <div class="relative aspect-square overflow-hidden">
                    <NuxtImg
                      v-if="file.type?.startsWith('image')"
                      :src="getAssetId(file.id)"
                      width="600"
                      height="600"
                      fit="cover"
                      class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      v-else
                      class="size-full flex flex-col items-center justify-center gap-2 bg-(--ui-bg)/80"
                    >
                      <UIcon
                        name="i-lucide-file"
                        class="size-8 text-(--ui-primary)"
                      />
                      <span
                        class="text-xs font-semibold uppercase tracking-wide"
                      >
                        {{ getFileExtension(file) }}
                      </span>
                    </div>
                    <div
                      class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-(--ui-bg)/95 via-(--ui-bg)/40 to-transparent p-3 text-left"
                    >
                      <p
                        class="text-sm font-medium truncate text-(--ui-text-highlighted)"
                      >
                        {{ getFileDisplayName(file) }}
                      </p>
                      <p class="text-xs text-(--ui-text-muted)">
                        {{ formatBytes(file.filesize) }} ·
                        {{ formatDate(file.modified_on) }}
                      </p>
                    </div>
                    <span
                      class="absolute top-3 left-3 inline-flex items-center rounded-full bg-(--ui-primary)/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black shadow-sm"
                    >
                      {{ getFileExtension(file) }}
                    </span>
                  </div>
                </button>
              </div>

              <div v-else class="space-y-2">
                <button
                  v-for="file in displayedFiles"
                  :key="file.id"
                  type="button"
                  @click="handleFileSelection(file)"
                  class="w-full flex items-center gap-4 rounded-xl border px-4 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)"
                  :class="
                    highlightedFileId === file.id
                      ? 'border-(--ui-primary)/60 bg-(--ui-primary)/10 shadow-primary-xs'
                      : 'border-(--ui-primary)/15 hover:border-(--ui-primary)/40 hover:bg-(--ui-primary)/10'
                  "
                >
                  <div
                    class="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-(--ui-bg-muted)/80"
                  >
                    <NuxtImg
                      v-if="file.type?.startsWith('image')"
                      :src="getAssetId(file.id)"
                      width="150"
                      height="150"
                      fit="cover"
                      class="size-full object-cover"
                    />
                    <div v-else class="flex flex-col items-center gap-1">
                      <UIcon
                        name="i-lucide-file"
                        class="size-5 text-(--ui-primary)"
                      />
                      <span
                        class="text-[10px] font-semibold uppercase tracking-wide"
                      >
                        {{ getFileExtension(file) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-medium text-(--ui-text-highlighted) truncate"
                    >
                      {{ getFileDisplayName(file) }}
                    </p>
                    <p class="text-xs text-(--ui-text-muted) truncate">
                      {{ file.type || 'Unbekannter Typ' }}
                    </p>
                  </div>
                  <div
                    class="text-right text-xs text-(--ui-text-muted) leading-snug"
                  >
                    <p>{{ formatBytes(file.filesize) }}</p>
                    <p>{{ formatDate(file.modified_on) }}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside
          v-if="selectedFile"
          class="hidden xl:flex w-80 border-l border-(--ui-primary)/15 bg-(--ui-bg-muted)/40 flex-col"
        >
          <div class="px-5 py-4 border-b border-(--ui-primary)/15">
            <h3
              class="text-sm font-semibold uppercase tracking-wide text-(--ui-text-muted)"
            >
              Details
            </h3>
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-6 space-y-5">
            <div
              v-if="selectedFileIsImage && selectedFilePreview"
              class="overflow-hidden rounded-xl border border-(--ui-primary)/15"
            >
              <NuxtImg
                :src="selectedFilePreview"
                width="600"
                height="600"
                fit="cover"
                class="w-full object-cover"
              />
            </div>

            <div class="space-y-4 text-sm">
              <div>
                <h4
                  class="text-xs uppercase tracking-wider text-(--ui-text-muted)"
                >
                  Name
                </h4>
                <p class="font-medium text-(--ui-text-highlighted) break-all">
                  {{ getFileDisplayName(selectedFile) }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4 text-xs">
                <div class="space-y-1">
                  <h4 class="uppercase tracking-wider text-(--ui-text-muted)">
                    Typ
                  </h4>
                  <p class="font-medium text-(--ui-text-highlighted)">
                    {{ selectedFile.type || 'Unbekannt' }}
                  </p>
                </div>
                <div class="space-y-1">
                  <h4 class="uppercase tracking-wider text-(--ui-text-muted)">
                    Größe
                  </h4>
                  <p class="font-medium text-(--ui-text-highlighted)">
                    {{ formatBytes(selectedFile.filesize) }}
                  </p>
                </div>
                <div
                  v-if="selectedFile.width && selectedFile.height"
                  class="space-y-1"
                >
                  <h4 class="uppercase tracking-wider text-(--ui-text-muted)">
                    Abmessungen
                  </h4>
                  <p class="font-medium text-(--ui-text-highlighted)">
                    {{ selectedFile.width }} × {{ selectedFile.height }} px
                  </p>
                </div>
                <div class="space-y-1">
                  <h4 class="uppercase tracking-wider text-(--ui-text-muted)">
                    Aktualisiert
                  </h4>
                  <p class="font-medium text-(--ui-text-highlighted)">
                    {{ formatDate(selectedFile.modified_on) }}
                  </p>
                </div>
              </div>

              <div v-if="selectedFile.description" class="space-y-1">
                <h4
                  class="text-xs uppercase tracking-wider text-(--ui-text-muted)"
                >
                  Beschreibung
                </h4>
                <p class="text-sm text-(--ui-text)">
                  {{ selectedFile.description }}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer
        class="px-6 py-4 border-t border-(--ui-primary)/15 flex flex-wrap items-center justify-between gap-3 text-xs text-(--ui-text-muted)"
      >
        <span>
          {{
            totalFiles
              ? `Zeige ${numberFormatter.format(
                  currentRange.start
                )} – ${numberFormatter.format(
                  currentRange.end
                )} von ${numberFormatter.format(totalFiles)} Dateien`
              : 'Keine Ergebnisse'
          }}
        </span>
        <UPagination
          v-if="pageCount > 1"
          v-model:page="page"
          :total="pageCount"
          class="ml-auto"
          :ui="{
            trigger:
              'rounded-lg hover:bg-(--ui-primary)/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)',
          }"
        />
      </footer>
    </section>
  </div>
</template>

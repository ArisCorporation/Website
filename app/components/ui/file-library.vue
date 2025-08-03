<script setup lang="ts">
import type { DirectusFile, DirectusFolder } from '~~/types'
import type { TreeItem } from '@nuxt/ui'

const page = ref(1)
const itemsPerPage = ref(40) // Number of files to display per page

const emit = defineEmits(['selected:folder', 'selected:file'])

const expanded = ref<string[]>([])

const props = defineProps<{ allTypes: boolean }>()

function transformFoldersToTreeItems(
  folders: DirectusFolder[] | null | undefined
): TreeItem[] {
  if (!folders) {
    return []
  }

  // Create a map for quick lookup by ID
  const folderMap = new Map<string, DirectusFolder>()
  folders.forEach((folder) => folderMap.set(folder.id, folder))

  // Create a map to store children for each parent
  const childrenMap = new Map<string | null, DirectusFolder[]>()
  folders.forEach((folder) => {
    const parentId = folder.parent || null // Use null for root folders
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, [])
    }
    childrenMap.get(parentId)!.push(folder)
  })

  // Recursive function to build the tree
  function buildTree(parentId: string | null): TreeItem[] {
    const children = childrenMap.get(parentId) || []

    // Sort children alphabetically by name
    children.sort((a, b) => a.name.localeCompare(b.name))

    return children.map((folder) => {
      const treeItem: TreeItem = {
        label: folder.name,
        value: folder.id,
        id: folder.id,
      }

      const grandChildren = buildTree(folder.id)
      if (grandChildren.length > 0) {
        treeItem.children = grandChildren
      }

      return treeItem
    })
  }

  // Build the tree starting from the root (parentId = null)
  return buildTree(null)
}

const slideOpen = ref(true)

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

// Transform the fetched folders into the TreeItem format
const folderTree = computed(() => {
  return [
    {
      id: null,
      value: 'root',
      label: 'Dateibibliothek',
      defaultExpanded: true,
      children: [
        ...transformFoldersToTreeItems(folders.value),
        { id: 'all', value: 'all', label: 'Alle Dateien' },
      ],
    },
  ]
})

const selectedFolder = ref(folderTree.value?.[0])

const {
  data: files,
  pending: filesPending,
  error: filesError,
} = await useAsyncData<DirectusFile[]>(
  'ams:filebrowser-files',
  async () => {
    const folderId = selectedFolder.value?.id
    const currentPage = page.value

    return await useDirectus(
      readFiles({
        fields: [
          'id',
          'filename_disk',
          'type',
          'title',
          'width',
          'height',
          'modified_on',
        ],
        limit: itemsPerPage.value,
        offset: (currentPage - 1) * itemsPerPage.value,
        sort: ['-modified_on'],
        filter: {
          ...(folderId !== 'all' ? { folder: { _eq: folderId } } : {}),
          ...(props.allTypes ? {} : { type: { _starts_with: 'image' } }),
        },
      })
    )
  },
  {
    watch: [selectedFolder, page],
  }
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
    )
)

const displayedFiles = computed<DirectusFile[]>(() => files.value || [])
const totalFiles = computed(() => {
  const folderId = selectedFolder.value?.id

  if (folderId === 'all') {
    return fileCounts.value
      ?.map((file) => Number(file.count))
      ?.reduce((a, b) => a + b, 0)
  } else
    return Number(
      fileCounts.value?.find((file) => file.folder === folderId)?.count
    )
})

// Reset page to 1 when selectedFolder changes
watch(selectedFolder, () => {
  emit('selected:folder', selectedFolder)
  page.value = 1
})

function handleFileSelection(file: DirectusFile) {
  emit('selected:file', file)
}

watchEffect(() => {
  const rootFolderId = 'root' // ID of "Dateibibliothek"
  if (!expanded.value.includes(rootFolderId as any)) {
    expanded.value.push(rootFolderId as any)
  }
})
</script>

<template>
  <div class="flex divide-x h-full divide-(--ui-primary)/20">
    <div class="w-1/3 py-6 overflow-y-scroll">
      <UTree
        v-model="selectedFolder"
        v-model:expanded="expanded"
        :items="folderTree"
        :ui="{ root: 'space-y-2', listWithChildren: 'space-y-1' }"
      >
        <template #item-leading="{ item, expanded, selected }">
          <UIcon
            :name="
              expanded || selected ? 'i-lucide-folder-open' : 'i-lucide-folder'
            "
            class="size-5 shrink-0"
          />
        </template>
      </UTree>
    </div>
    <div class="w-2/3 py-6">
      <div class="flex flex-col">
        <p v-if="!displayedFiles.length" class="m-auto">
          Keine Bilder in diesem Ordner vorhanden
        </p>
        <div v-if="displayedFiles.length" class="grid gap-2 p-2 grid-cols-5">
          <UButton
            v-for="file in displayedFiles"
            :key="file.id"
            @click="() => handleFileSelection(file)"
            variant="outline"
            :ui="{ base: '!p-0' }"
            class="aspect-square w-full h-auto rounded-lg overflow-clip"
          >
            <UTooltip :text="file.title">
              <NuxtImg
                v-if="file.type?.startsWith('image')"
                :src="file.id"
                width="300"
                height="300"
                fit="cover"
                class="size-full"
              />
              <div
                v-else
                class="size-full flex items-center text-center flex-wrap"
              >
                <p class="mx-auto text-[.6rem]">{{ file.title }}</p>
                <p class="text-[.5rem] mx-auto">{{ file.type }}</p>
              </div>
            </UTooltip>
          </UButton>
        </div>
        <UPagination
          v-if="displayedFiles.length"
          v-model:page="page"
          :total="totalFiles / itemsPerPage"
          class="mx-auto"
        />
      </div>
    </div>
  </div>
</template>

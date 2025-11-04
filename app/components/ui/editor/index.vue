<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import type { DirectusFile } from '~~/types'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

const model = defineModel<string>()

const props = defineProps<{
  readOnly?: boolean
  simpleMode?: boolean
}>()

const MEDIA_ASSET_FOLDER_ID = 'c558dbe9-3f85-4c86-bdac-7b4988cde5c5'

const runtimeConfig = useRuntimeConfig()

const assetsBaseUrl = computed(() => {
  const raw = runtimeConfig.public?.ASSETS_URL ?? ''
  if (!raw) {
    return ''
  }
  return raw.endsWith('/') ? raw : `${raw}/`
})

const apiAssetsBaseUrl = computed(() => {
  const raw = runtimeConfig.public?.API_URL ?? ''
  if (!raw) {
    return ''
  }
  const normalized = raw.endsWith('/') ? raw.slice(0, -1) : raw
  return `${normalized}/assets/`
})

const normalizeAssetIdentifier = (value: unknown): string => {
  if (typeof value !== 'string') {
    return ''
  }
  return value.startsWith('assets/') ? value.slice(7) : value
}

const buildAssetSrc = (value: string): string => {
  if (!value) {
    return ''
  }
  if (/^https?:\/\//i.test(value)) {
    return value
  }
  const assetId = normalizeAssetIdentifier(value)
  if (assetsBaseUrl.value) {
    return `${assetsBaseUrl.value}${assetId}`
  }
  if (apiAssetsBaseUrl.value) {
    return `${apiAssetsBaseUrl.value}${assetId}`
  }
  return `assets/${assetId}`
}

const editorMediaModalOpen = ref(false)
const editorMediaLibraryOpen = ref(false)
const editorMediaUploading = ref(false)
const editorMediaAssetId = ref('')
const editorMediaName = ref('')
const editorFileInput = ref<DirectusFile | null | undefined>(null)

const editorMediaPreview = computed(() =>
  editorMediaAssetId.value ? getAssetId(editorMediaAssetId.value) : ''
)

const editorMediaSrc = computed(() => buildAssetSrc(editorMediaAssetId.value))

const canInsertMedia = computed(
  () => Boolean(editorMediaSrc.value) && !editorMediaUploading.value
)

const editorHeight = computed(() => (props.simpleMode ? '120px' : '100%'))

const editor = useEditor({
  editable: !props.readOnly,
  content: model.value,
  extensions: [
    TiptapStarterKit.configure({
      heading: {
        levels: [2, 3, 4, 5],
      },
      gapcursor: false,
      dropcursor: false,
    }),
    Underline,
    Link,
    TextAlign,
    CharacterCount,
    Image,
    Table.configure({
      resizable: true,
      allowTableNodeSelection: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  onUpdate: ({ editor }) => {
    model.value = editor.getHTML()
  },
})

onBeforeUnmount(() => {
  unref(editor)?.destroy()
})

const runEditorCommand = (command: (editor: Editor) => void) => {
  const instance = unref(editor)
  if (!instance) {
    return
  }

  command(instance)
}

const tableMenuItems = computed(() => {
  const instance = unref(editor)
  const canModifyTable = instance?.isActive('table') ?? false

  return [
    [
      {
        label: 'Tabelle (3×3) einfügen',
        icon: 'i-lucide-table',
        disabled: !instance,
        onSelect: () =>
          runEditorCommand((ctx) =>
            ctx
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          ),
      },
    ],
    [
      {
        label: 'Zeile oben einfügen',
        icon: 'i-lucide-plus',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().addRowBefore().run()),
      },
      {
        label: 'Zeile unten einfügen',
        icon: 'i-lucide-plus',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().addRowAfter().run()),
      },
      {
        label: 'Spalte links einfügen',
        icon: 'i-lucide-plus',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) =>
            ctx.chain().focus().addColumnBefore().run()
          ),
      },
      {
        label: 'Spalte rechts einfügen',
        icon: 'i-lucide-plus',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().addColumnAfter().run()),
      },
    ],
    [
      {
        label: 'Zeile entfernen',
        icon: 'i-lucide-trash',
        color: 'error',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().deleteRow().run()),
      },
      {
        label: 'Spalte entfernen',
        icon: 'i-lucide-trash',
        color: 'error',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().deleteColumn().run()),
      },
      {
        label: 'Tabelle entfernen',
        icon: 'i-lucide-trash',
        color: 'error',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) => ctx.chain().focus().deleteTable().run()),
      },
    ],
    [
      {
        label: 'Kopfzeile umschalten',
        icon: 'i-lucide-pilcrow',
        disabled: !canModifyTable,
        onSelect: () =>
          runEditorCommand((ctx) =>
            ctx.chain().focus().toggleHeaderRow().run()
          ),
      },
    ],
  ]
})

function resetEditorMediaState() {
  editorMediaLibraryOpen.value = false
  editorMediaUploading.value = false
  editorMediaAssetId.value = ''
  editorMediaName.value = ''

  const inputEl = editorFileInput.value?.inputRef as
    | HTMLInputElement
    | undefined
  if (inputEl) {
    inputEl.value = ''
  }
}

function handleEditorMediaModalUpdate(value: boolean) {
  if (!value) {
    resetEditorMediaState()
  }
}

function handleEditorLibrarySelect(file: DirectusFile) {
  editorMediaAssetId.value = normalizeAssetIdentifier(file?.id)
  editorMediaName.value =
    file?.filename_download ?? file?.title ?? file?.filename_disk ?? ''
  editorMediaLibraryOpen.value = false
}

function insertEditorMedia() {
  const instance = unref(editor)
  const src = editorMediaSrc.value

  if (!instance || !src) {
    return
  }

  instance
    .chain()
    .focus()
    .setImage({
      src,
      ...(editorMediaName.value ? { alt: editorMediaName.value } : {}),
    })
    .run()

  editorMediaModalOpen.value = false
}

defineExpose({
  editor,
})

watch(
  () => editorFileInput.value,
  (file) => {
    handleEditorLibrarySelect(file as DirectusFile)
  }
)

// TiptapUnderline,
// TiptapLink.configure({
//   openOnClick: false,
// }),
// TiptapImgAlign.configure({
//   inline: true,
// }),
// TiptapTableAlign.configure({
//   resizable: true,
// }),
// TiptapTableRow,
// TiptapTableHeader,
// TiptapTableCell,
// TiptapTextAlign.configure({
//   defaultAlignment: 'left',
//   types: ['heading', 'paragraph', 'image', 'img', 'table  '],
//   alignments: ['left', 'center', 'right', 'justify'],
// }),
// TiptapSubscript,
// TiptapSuperscript,
// TiptapCharacterCount,
// TiptapTextStyle,
// TiptapColor.configure({
//   types: ['textStyle'],
// }),
// TiptapArisCorpPanel,
// TiptapArisCorpPanelWithBg,
// TiptapVideo,
// TODO: USER MENTIONS
// TODO: AI
</script>

<template>
  <UCard
    v-if="!readOnly"
    variant="ams"
    class="min-h-full !shadow-none"
    :ui="{
      header: 'sticky top-0 !py-3 z-10 bg-(--ui-bg-muted)/95',
      footer:
        'sticky bottom-0 z-10 bg-(--ui-bg-muted)/95 border-t border-t-(--ui-primary)/20',
      body: 'flex-1 !py-2 border-b-0 overflow-y-scroll [scrollbar-width:_none] !pr-0',
      root: '!divide-y relative flex flex-col h-[calc(100vh_-_120px)] overflow-clip !divide-(--ui-primary)/20',
    }"
  >
    <template #header>
      <div class="flex flex-wrap items-center gap-1 bg-(--ui-bg-muted)/0 p-2">
        <UButton
          @click="editor?.commands.toggleBold"
          icon="i-lucide-bold"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleItalic"
          icon="i-lucide-italic"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('italic') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor.chain().focus()?.toggleUnderline()?.run()"
          icon="i-lucide-underline"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('underline') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          @click="editor?.commands.toggleHeading({ level: 2 })"
          icon="i-lucide-heading-1"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive('heading', { level: 2 }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleHeading({ level: 3 })"
          icon="i-lucide-heading-2"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive('heading', { level: 3 }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleHeading({ level: 4 })"
          icon="i-lucide-heading-3"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive('heading', { level: 4 }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          @click="editor?.commands.toggleBulletList"
          icon="i-lucide-list"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bulletList') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleOrderedList"
          icon="i-lucide-list-ordered"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('orderedList') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UDropdownMenu
          :items="tableMenuItems"
          :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 8,
          }"
          :ui="{
            content: 'min-w-[15rem] bg-(--ui-bg-muted) ring-(--ui-primary)/20',
          }"
        >
          <UButton
            icon="i-lucide-table"
            variant="subtle"
            class="size-8"
            :color="editor?.isActive('table') ? 'primary' : 'neutral'"
            :ui="{ leadingIcon: 'size-4 m-auto' }"
          />
          <template #mode-label> Tabelle </template>
        </UDropdownMenu>
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          icon="i-lucide-align-left"
          @click="editor?.chain()?.focus()?.setTextAlign('left')?.run()"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-align-center"
          @click="editor?.chain()?.focus()?.setTextAlign('center')?.run()"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-align-right"
          @click="editor?.chain()?.focus()?.setTextAlign('right')?.run()"
          variant="subtle"
          class="size-8"
          :color="
            editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'neutral'
          "
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          icon="i-lucide-quote"
          @click="editor?.chain()?.focus()?.toggleBlockquote()?.run()"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('blockquote') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-code"
          @click="editor?.chain()?.focus()?.toggleCode()?.run()"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('code') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <!-- <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        /> -->
        <!-- <UButton
          icon="i-lucide-link"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('link') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        /> -->
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          icon="i-lucide-image-plus"
          variant="subtle"
          class="size-8"
          @click="editorMediaModalOpen = true"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <!-- TODO: ADD COLOR -->
        <!-- <UButton
          icon="i-lucide-palette"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        /> -->
        <span class="ml-auto gap-1 flex">
          <UButton
            icon="i-lucide-undo"
            @click="editor?.chain()?.focus()?.undo().run()"
            :disabled="!editor?.can()?.undo()"
            variant="subtle"
            class="size-8"
            :ui="{ leadingIcon: 'size-4 m-auto' }"
          />

          <UButton
            icon="i-lucide-redo"
            @click="editor?.chain()?.focus()?.redo().run()"
            :disabled="!editor?.can()?.redo()"
            variant="subtle"
            class="size-8"
            :ui="{ leadingIcon: 'size-4 m-auto' }"
          />
        </span>
      </div>
    </template>
    <template #default>
      <TiptapEditorContent
        :editor="editor"
        class="size-full overflow-y-clip pr-0 prose prose-invert max-w-none"
      />
    </template>
    <template #footer>
      <div class="flex not-prose w-full divide-x divide-(--ui-primary)/20">
        <p class="ml-auto mr-2 pr-2">
          {{
            editor?.storage.characterCount
              .characters()
              .toString()
              .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
          }}
          Buchstaben
        </p>
        <p>
          {{
            editor?.storage.characterCount
              .words()
              .toString()
              .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
          }}
          Wörter
        </p>
      </div>
    </template>
  </UCard>
  <UModal
    v-if="!readOnly"
    v-model:open="editorMediaModalOpen"
    title="Datei einfügen"
    @update:open="handleEditorMediaModalUpdate"
    :ui="{
      content:
        'bg-(--ui-bg-muted)/50 backdrop-blur-xs divide-(--ui-primary)/20',
    }"
  >
    <template #body>
      <div class="space-y-4 p-4">
        <AMSGlobalFileDrawer v-model="editorFileInput" />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-4">
        <UButton
          variant="subtle"
          color="neutral"
          type="button"
          label="Abbrechen"
          @click="editorMediaModalOpen = false"
        />
        <UButton
          variant="subtle"
          type="button"
          label="Inhalt einfügen"
          :disabled="!canInsertMedia || editorMediaUploading"
          @click="insertEditorMedia"
        />
      </div>
    </template>
  </UModal>
  <TiptapEditorContent
    v-else
    :editor="editor"
    class="size-full overflow-y-clip pr-0 prose prose-invert max-w-none"
  />
</template>

<style>
.tiptap:focus {
  outline: none;
  border: none;
}
.ProseMirror {
  height: v-bind('editorHeight') !important;
  overflow-y: auto;
  padding-right: 16px;
}
</style>

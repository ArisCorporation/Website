<script setup lang="ts">
import type { Editor } from '@tiptap/core'
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
          runEditorCommand((ctx) =>
            ctx.chain().focus().addColumnAfter().run()
          ),
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
            content:
              'min-w-[15rem] bg-(--ui-bg-muted) ring-(--ui-primary)/20',
          }"
        >
          <UButton
            icon="i-lucide-table"
            variant="subtle"
            class="size-8"
            :color="editor?.isActive('table') ? 'primary' : 'neutral'"
            :ui="{ leadingIcon: 'size-4 m-auto' }"
          />
          <template #mode-label>
            Tabelle
          </template>
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
        <!-- TODO: ADD IMAGES AND VIDEOS -->
        <!-- <UButton
          icon="i-lucide-image"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        /> -->
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

<script setup lang="ts">
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Code from '@tiptap/extension-code'
import Blockquote from '@tiptap/extension-blockquote'
import TextAlign from '@tiptap/extension-text-align'

const model = defineModel<string>()

const props = defineProps<{
  readOnly?: boolean
  simpleMode?: boolean
}>()

const editorHeight = computed(() => (props.simpleMode ? '120px' : '100%'))

const editor = useEditor({
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
    Code,
    Blockquote,
    TextAlign,
  ],
  onUpdate: ({ editor }) => {
    model.value = editor.getHTML()
  },
})

onBeforeUnmount(() => {
  unref(editor)?.destroy()
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
    variant="ams"
    class="min-h-screen !shadow-none"
    :ui="{
      body: 'size-full !py-0',
      root: '!divide-y !divide-(--ui-primary)/20',
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
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          icon="i-lucide-link"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('link') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <!-- TODO: ADD IMAGES AND VIDEOS -->
        <UButton
          icon="i-lucide-image"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <!-- TODO: ADD COLOR -->
        <UButton
          icon="i-lucide-palette"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <div
          data-orientation="vertical"
          role="none"
          class="shrink-0 bg-border w-[1px] mx-1 h-6"
        />
        <UButton
          icon="i-lucide-type"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
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
      <TiptapEditorContent :editor="editor" class="size-full" />
    </template>
  </UCard>
</template>

<style>
.tiptap:focus {
  outline: none;
  border: none;
}
.ProseMirror {
  height: v-bind('editorHeight') !important;
  overflow-y: auto;
}
</style>

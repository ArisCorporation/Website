<script setup lang="ts">
const model = defineModel<string>()

const props = defineProps<{
  readOnly?: boolean
  simpleMode?: boolean
}>()

const editorHeight = computed(() => (props.simpleMode ? '120px' : '100%'))

const editor = useEditor({
  content: 'test',
  extensions: [
    TiptapStarterKit.configure({
      heading: {
        levels: [2, 3, 4, 5],
      },
      gapcursor: false,
      dropcursor: false,
    }),
  ],
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
  <UCard variant="outline" class="min-h-screen" :ui="{ body: 'size-full' }">
    <template #header>
      <div
        class="flex flex-wrap items-center gap-1 border-b border-(--ui-primary)/20 bg-(--ui-bg-muted)/70 p-2"
      >
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
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-underline"
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
          @click="editor?.commands.toggleHeading({ level: 2 })"
          icon="i-lucide-heading-1"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleHeading({ level: 3 })"
          icon="i-lucide-heading-2"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleHeading({ level: 4 })"
          icon="i-lucide-heading-3"
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
          @click="editor?.commands.toggleBulletList"
          icon="i-lucide-list"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          @click="editor?.commands.toggleOrderedList"
          icon="i-lucide-list-ordered"
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
          icon="i-lucide-align-left"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-align-center"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-align-right"
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
          icon="i-lucide-quote"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-code"
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
          icon="i-lucide-link"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
        <UButton
          icon="i-lucide-image"
          variant="subtle"
          class="size-8"
          :color="editor?.isActive('bold') ? 'primary' : 'neutral'"
          :ui="{ leadingIcon: 'size-4 m-auto' }"
        />
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
            variant="subtle"
            class="size-8"
            :ui="{ leadingIcon: 'size-4 m-auto' }"
          />

          <UButton
            icon="i-lucide-redo"
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

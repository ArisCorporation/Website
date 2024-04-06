<script setup lang="ts">
import { generateJSON, generateHTML } from '@tiptap/html';
import { TiptapArisCorpPanel } from '~/composables/tiptapExt';

const props = defineProps(['html']);
const emit = defineEmits(['update:modelValue']);

const json = generateJSON(props.html, [
  TiptapStarterKit,
  TiptapTextAlign.configure({
    defaultAlignment: 'left',
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
  }),
  TiptapUnderline,
  TiptapSubscript,
  TiptapSuperscript,
  TiptapLink.configure({
    openOnClick: false,
  }),
  TiptapCharacterCount,
  TiptapHeading.configure({
    levels: [2, 3, 4, 5],
  }),
  TiptapTextStyle,
  TiptapColor.configure({
    types: ['textStyle'],
  }),
  TiptapArisCorpPanel,
  // other extensions …
]);

const output = generateHTML(json, [
  TiptapStarterKit,
  TiptapTextAlign.configure({
    defaultAlignment: 'left',
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
  }),
  TiptapUnderline,
  TiptapSubscript,
  TiptapSuperscript,
  TiptapLink.configure({
    openOnClick: false,
  }),
  TiptapCharacterCount,
  TiptapHeading.configure({
    levels: [2, 3, 4, 5],
  }),
  TiptapTextStyle,
  TiptapColor.configure({
    types: ['textStyle'],
  }),
  TiptapArisCorpPanel,
  // other extensions …
]);

// const html = computed(() => unref(editor)?.getHTML());

// watch(
//   () => html.value,
//   () => {
//     emit('update:modelValue', html.value);
//   },
// );

// onBeforeUnmount(() => {
//   unref(editor).destroy();
// });
</script>

<template>
  <div>{{ output }}</div>
</template>

<style>
.tiptap:focus {
  outline: none;
  border: none;
}
</style>

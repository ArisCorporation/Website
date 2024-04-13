<script setup lang="ts">
import { TiptapArisCorpPanel, TiptapArisCorpPanelWithBg } from '~/composables/tiptapExt';
const fullscreen_state = ref(false);

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  renderMode: {
    type: Boolean,
    required: false,
    default: false,
  },
});
const emit = defineEmits(['update:modelValue']);

// const modelValue = defineModel();

const editor = useEditor({
  editable: !props.renderMode,
  content: props.modelValue,
  extensions: [
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
    TiptapArisCorpPanelWithBg,
    // TODO: USER MENTIONS
    // TODO: AI
  ],

  onUpdate: () => {
    emit('update:modelValue', unref(editor).getHTML());
  },
});

// const html = computed(() => unref(editor)?.getHTML());

// watch(
//   () => html.value,
//   () => {
//     emit('update:modelValue', html.value);
//     console.log(html.value);
//   },
// );

function fullscreen_toggle() {
  const fullscreen = document.querySelector('#editor_container');

  if (!fullscreen_state.value) fullscreen.requestFullscreen();
  else document.exitFullscreen();

  fullscreen_state.value = !fullscreen_state.value;
}
// base: 'max-h-[calc(100dvh_-_300px)] sm:max-h-[calc(100dvh_-_250px)] xl:max-h-[calc(100dvh_-_200px)] overflow-y-scroll',
onBeforeUnmount(() => {
  unref(editor).destroy();
});
</script>

<template>
  <ClientOnly fallback-tag="span" :fallback="renderMode ? 'Loading content...' : 'Loading editor...'">
    <div v-if="editor && !renderMode" id="editor_container">
      <UCard
        :ui="{
          header: { background: 'bg-bsecondary', padding: 'px-4 py-3 sm:px-6' },
          body: {
            base: 'max-h-[calc(100dvh_-_275px)] sm:max-h-[calc(100dvh_-_229px)] xl:max-h-[calc(100dvh_-_182px)] overflow-y-scroll',
          },
        }"
        class="overflow-clip"
      >
        <template #header>
          <div class="flex flex-row justify-between py-2 gap-x-2">
            <EditorButtonType :editor="editor" />
            <div class="flex flex-row gap-x-2">
              <EditorButtonUndo :editor="editor" />
              <EditorButtonRedo :editor="editor" />
              <EditorButtonFullscreen :fullscreen_toggle="fullscreen_toggle" :fullscreen_state="fullscreen_state" />
            </div>
          </div>
          <div class="flex -mx-2.5">
            <hr
              class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
            />
          </div>
          <div class="sm:hidden">
            <div class="flex flex-row justify-between py-2 gap-x-2">
              <div class="flex flex-row gap-x-2">
                <EditorButtonCenter :editor="editor" />
                <EditorButtonJustify :editor="editor" />
                <EditorButtonLeft :editor="editor" />
                <EditorButtonRight :editor="editor" />
              </div>
              <EditorButtonColor :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBold :editor="editor" />
                <EditorButtonItalic :editor="editor" />
                <EditorButtonUnderline :editor="editor" />
                <EditorButtonStrike :editor="editor" />
                <EditorButtonClearFormatting :editor="editor" />
              </div>
            </div>
            <div class="flex -mx-2.5">
              <hr
                @click="editor.chain().focus().setColor"
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              />
            </div>
            <div class="flex flex-row py-2 gap-x-6">
              <div class="flex flex-row gap-x-2">
                <EditorButtonSubscript :editor="editor" />
                <EditorButtonSuperscript :editor="editor" />
              </div>
              <EditorButtonBlockquote :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBulletList :editor="editor" />
                <EditorButtonOrderedList :editor="editor" />
              </div>
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              />
            </div>
            <div class="flex flex-row justify-between py-2 gap-x-2">
              <EditorButtonDivider :editor="editor" />
              <EditorButtonLink :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonImage :editor="editor" />
                <EditorButtonVideo :editor="editor" />
              </div>
              <EditorButtonTable :editor="editor" />
              <EditorButtonComponents :editor="editor" />
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              />
            </div>
          </div>
          <div class="hidden sm:block md:hidden">
            <div class="flex flex-row justify-between py-2 gap-x-2">
              <div class="flex flex-row gap-x-2">
                <EditorButtonCenter :editor="editor" />
                <EditorButtonJustify :editor="editor" />
                <EditorButtonLeft :editor="editor" />
                <EditorButtonRight :editor="editor" />
              </div>
              <EditorButtonColor :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBold :editor="editor" />
                <EditorButtonItalic :editor="editor" />
                <EditorButtonUnderline :editor="editor" />
                <EditorButtonStrike :editor="editor" />
                <EditorButtonClearFormatting :editor="editor" />
              </div>
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              />
            </div>
            <div class="flex flex-row justify-between py-2 gap-x-2">
              <div class="flex flex-row gap-x-2">
                <EditorButtonSubscript :editor="editor" />
                <EditorButtonSuperscript :editor="editor" />
              </div>
              <EditorButtonBlockquote :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBulletList :editor="editor" />
                <EditorButtonOrderedList :editor="editor" />
              </div>
              <EditorButtonDivider :editor="editor" />
              <EditorButtonLink :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonImage :editor="editor" />
                <EditorButtonVideo :editor="editor" />
              </div>
              <EditorButtonTable :editor="editor" />
              <EditorButtonComponents :editor="editor" />
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              />
            </div>
          </div>
          <div class="hidden md:block xl:hidden">
            <div class="flex flex-row justify-between py-2 gap-x-2">
              <div class="flex flex-row gap-x-2">
                <EditorButtonCenter :editor="editor" />
                <EditorButtonJustify :editor="editor" />
                <EditorButtonLeft :editor="editor" />
                <EditorButtonRight :editor="editor" />
              </div>
              <EditorButtonColor :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBold :editor="editor" />
                <EditorButtonItalic :editor="editor" />
                <EditorButtonUnderline :editor="editor" />
                <EditorButtonStrike :editor="editor" />
                <EditorButtonClearFormatting :editor="editor" />
              </div>
              <div class="flex flex-row gap-x-2">
                <EditorButtonSubscript :editor="editor" />
                <EditorButtonSuperscript :editor="editor" />
              </div>
              <EditorButtonBlockquote :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBulletList :editor="editor" />
                <EditorButtonOrderedList :editor="editor" />
              </div>
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              />
            </div>
            <div class="flex flex-row justify-between py-2 gap-x-2">
              <EditorButtonDivider :editor="editor" />
              <EditorButtonLink :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonImage :editor="editor" />
                <EditorButtonVideo :editor="editor" />
              </div>
              <EditorButtonTable :editor="editor" />
              <EditorButtonComponents :editor="editor" />
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              />
            </div>
          </div>
          <div class="hidden xl:block">
            <div class="flex flex-row justify-between py-2 gap-x-2">
              <div class="flex flex-row gap-x-2">
                <EditorButtonCenter :editor="editor" />
                <EditorButtonJustify :editor="editor" />
                <EditorButtonLeft :editor="editor" />
                <EditorButtonRight :editor="editor" />
              </div>
              <EditorButtonColor :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBold :editor="editor" />
                <EditorButtonItalic :editor="editor" />
                <EditorButtonUnderline :editor="editor" />
                <EditorButtonStrike :editor="editor" />
                <EditorButtonClearFormatting :editor="editor" />
              </div>
              <div class="flex flex-row gap-x-2">
                <EditorButtonSubscript :editor="editor" />
                <EditorButtonSuperscript :editor="editor" />
              </div>
              <EditorButtonBlockquote :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBulletList :editor="editor" />
                <EditorButtonOrderedList :editor="editor" />
              </div>
              <EditorButtonDivider :editor="editor" />
              <EditorButtonLink :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonImage :editor="editor" />
                <EditorButtonVideo :editor="editor" />
              </div>
              <EditorButtonTable :editor="editor" />
              <EditorButtonComponents :editor="editor" />
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              />
            </div>
          </div>
        </template>

        <div class="">
          <TiptapEditorContent :editor="editor" class="" />
        </div>

        <template #footer>
          <div class="flex w-full divide-x-2 divide-btertiary">
            <p class="py-0 ml-auto">
              {{
                editor?.storage.characterCount
                  .characters()
                  .toString()
                  .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
              }}
              Buchstaben
            </p>
            <p class="py-0">
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
    </div>
    <div v-else-if="editor && renderMode">
      <TiptapEditorContent :editor="editor" class="" />
    </div>
  </ClientOnly>
</template>

<style>
.tiptap:focus {
  outline: none;
  border: none;
}
</style>

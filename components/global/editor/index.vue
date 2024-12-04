<script setup lang="ts">
import cheerio from 'cheerio';
import {
  TiptapArisCorpPanel,
  TiptapArisCorpPanelWithBg,
  TiptapVideo,
  TiptapImgAlign,
  TiptapTableAlign,
  TiptapTableRow,
  TiptapTableHeader,
  TiptapTableCell,
} from '~/composables/tiptapExt';

const fullscreen_state = ref(false);
const fileLibrary = ref(false);
const fileLibraryType = ref();

const props = defineProps<{
  modelValue: string;
  readOnly?: boolean;
  simpleMode?: boolean;
  loading?: boolean;
  disableHeadings?: boolean;
}>();
const { modelValue, readOnly } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'send']);

function removeParagraphsAroundVideos(htmlString) {
  // if (!htmlString) return htmlString;

  const $ = cheerio.load(htmlString);

  $('p > video').each((_, el) => {
    const video = $(el);
    const parent = video.parent();
    parent.before(video);
    parent.remove();
  });

  return $.html();
}

const editor = useEditor({
  editable: !readOnly.value,
  content: removeParagraphsAroundVideos(modelValue.value || ''),
  extensions: [
    TiptapUnderline,
    TiptapLink.configure({
      openOnClick: false,
    }),
    TiptapImgAlign.configure({
      inline: true,
    }),
    TiptapTableAlign.configure({
      resizable: true,
    }),
    TiptapTableRow,
    TiptapTableHeader,
    TiptapTableCell,
    ...(!props.simpleMode
      ? [
          TiptapStarterKit,
          TiptapHeading.configure({
            levels: [2, 3, 4, 5],
          }),
          TiptapTextAlign.configure({
            defaultAlignment: 'left',
            types: ['heading', 'paragraph', 'image', 'img', 'table  '],
            alignments: ['left', 'center', 'right', 'justify'],
          }),
          TiptapSubscript,
          TiptapSuperscript,
          TiptapCharacterCount,
          TiptapTextStyle,
          TiptapColor.configure({
            types: ['textStyle'],
          }),
          TiptapArisCorpPanel,
          TiptapArisCorpPanelWithBg,
          TiptapVideo,
        ]
      : [
          TiptapStarterKit.configure({
            heading: false,
          }),
        ]),
    // TODO: USER MENTIONS
    // TODO: AI
  ],

  onUpdate: () => {
    emit('update:modelValue', unref(editor).getHTML());
  },
});

function fullscreenchanged(event) {
  // document.fullscreenElement will point to the element that
  // is in fullscreen mode if there is one. If there isn't one,
  // the value of the property is null.
  if (document.fullscreenElement) {
    fullscreen_state.value = true;
  } else {
    fullscreen_state.value = false;
  }
}
function toggleFullscreen() {
  const fullscreen = document.querySelector('#editor_container');
  if (!fullscreen_state.value) {
    fullscreen?.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function onFileSelection(file: any) {
  if (fileLibraryType.value === 'image') {
    editor.value?.commands.setImage({
      src: useRuntimeConfig().public.fileBase + file.id,
      alt: useRuntimeConfig().public.fileBase + file.title,
      title: useRuntimeConfig().public.fileBase + file.title,
    });
  } else if (fileLibraryType.value === 'video') {
    editor.value?.commands.setVideo(useRuntimeConfig().public.fileBase + file.id);
  }
}

defineShortcuts({
  meta_enter: {
    usingInput: true,
    whenever: [toRef(props, 'simpleMode')],
    handler: () => {
      emit('send');
    },
  },
});

// const editorHeight = computed(() => (props.simpleMode ? '100%' : 'auto'));

watch(modelValue, (value) => {
  // HTML
  const isSame = editor?.value?.getHTML() === value;

  // JSON
  // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)

  if (isSame) {
    return;
  }

  editor?.value?.commands.setContent(value, false);
});

const editorHeight = computed(() => (props.simpleMode ? '120px' : '100%'));

// base: 'max-h-[calc(100dvh_-_300px)] sm:max-h-[calc(100dvh_-_250px)] xl:max-h-[calc(100dvh_-_200px)] overflow-y-scroll',
onMounted(() => {
  document.addEventListener('fullscreenchange', fullscreenchanged);
});
onBeforeUnmount(() => {
  unref(editor).destroy();
});
</script>

<template>
  <div
    id="editor_container"
    :class="[!readOnly ? (simpleMode ? 'h-full' : 'h-[calc(100vh_-_50px)] overflow-y-auto rounded-xl') : '']"
  >
  <!-- <EditorFileLibrary v-model="fileLibrary" :file-types="fileLibraryType" @file-selection="onFileSelection" /> -->
    <div v-if="editor && !readOnly && !simpleMode">
      <UCard
        :ui="{
          header: { base: 'sticky top-0 z-10 rounded-t-lg', background: 'bg-bg-600', padding: 'px-4 py-3 sm:px-6' },
          footer: {
            base: 'sticky bottom-0 z-10 rounded-b-lg',
            background: 'bg-bg-600',
            padding: 'px-4 py-3 sm:px-6',
          },
          body: { base: 'border-x !border-bg-600' },
          ring: '',
        }"
        class="overflow-clip"
      >
        <template #header>
          <div class="flex flex-row justify-between py-2 gap-x-2">
            <EditorButtonType :editor="editor" />
            <div class="flex flex-row gap-x-2">
              <EditorButtonUndo :editor="editor" />
              <EditorButtonRedo :editor="editor" />
              <EditorButtonFullscreen :fullscreen_toggle="toggleFullscreen" :fullscreen_state="fullscreen_state" />
            </div>
          </div>
          <div class="flex -mx-2.5">
            <hr
              class="m-0 my-auto relative bg-bg-800 text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
            >
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
                class="m-0 my-auto relative bg-bg-800ext-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
                @click="editor.chain().focus().setColor"
              >
            </div>
            <div class="flex flex-row py-2 gap-x-6">
              <div class="flex flex-row gap-x-2">
                <EditorButtonSuperscript :editor="editor" />
                <EditorButtonSubscript :editor="editor" />
              </div>
              <EditorButtonBlockquote :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBulletList :editor="editor" />
                <EditorButtonOrderedList :editor="editor" />
              </div>
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bg-800ext-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              >
            </div>
            <div class="flex flex-row justify-between py-2 gap-x-2">
              <EditorButtonDivider :editor="editor" />
              <EditorButtonLink :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonImage
                  :editor="editor"
                  :open-library="
                    () => {
                      fileLibrary = true;
                      fileLibraryType = 'image';
                    }
                  "
                />
                <EditorButtonVideo
                  :editor="editor"
                  :open-library="
                    () => {
                      fileLibrary = true;
                      fileLibraryType = 'video';
                    }
                  "
                />
              </div>
              <EditorButtonTable :editor="editor" />
              <EditorButtonComponents :editor="editor" />
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bg-800ext-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              >
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
                class="m-0 my-auto relative bg-bg-800ext-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              >
            </div>
            <div class="flex flex-row justify-between py-2 gap-x-2">
              <div class="flex flex-row gap-x-2">
                <EditorButtonSuperscript :editor="editor" />
                <EditorButtonSubscript :editor="editor" />
              </div>
              <EditorButtonBlockquote :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBulletList :editor="editor" />
                <EditorButtonOrderedList :editor="editor" />
              </div>
              <EditorButtonDivider :editor="editor" />
              <EditorButtonLink :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonImage
                  :editor="editor"
                  :open-library="
                    () => {
                      fileLibrary = true;
                      fileLibraryType = 'image';
                    }
                  "
                />
                <EditorButtonVideo
                  :editor="editor"
                  :open-library="
                    () => {
                      fileLibrary = true;
                      fileLibraryType = 'video';
                    }
                  "
                />
              </div>
              <EditorButtonTable :editor="editor" />
              <EditorButtonComponents :editor="editor" />
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bg-800ext-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              >
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
                <EditorButtonSuperscript :editor="editor" />
                <EditorButtonSubscript :editor="editor" />
              </div>
              <EditorButtonBlockquote :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBulletList :editor="editor" />
                <EditorButtonOrderedList :editor="editor" />
              </div>
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bg-800ext-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              >
            </div>
            <div class="flex flex-row justify-between py-2 gap-x-2">
              <EditorButtonDivider :editor="editor" />
              <EditorButtonLink :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonImage
                  :editor="editor"
                  :open-library="
                    () => {
                      fileLibrary = true;
                      fileLibraryType = 'image';
                    }
                  "
                />
                <EditorButtonVideo
                  :editor="editor"
                  :open-library="
                    () => {
                      fileLibrary = true;
                      fileLibraryType = 'video';
                    }
                  "
                />
              </div>
              <EditorButtonTable :editor="editor" />
              <EditorButtonComponents :editor="editor" />
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bg-800ext-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              >
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
                <EditorButtonSuperscript :editor="editor" />
                <EditorButtonSubscript :editor="editor" />
              </div>
              <EditorButtonBlockquote :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonBulletList :editor="editor" />
                <EditorButtonOrderedList :editor="editor" />
              </div>
              <EditorButtonDivider :editor="editor" />
              <EditorButtonLink :editor="editor" />
              <div class="flex flex-row gap-x-2">
                <EditorButtonImage
                  :editor="editor"
                  :open-library="
                    () => {
                      fileLibrary = true;
                      fileLibraryType = 'image';
                    }
                  "
                />
                <EditorButtonVideo
                  :editor="editor"
                  :open-library="
                    () => {
                      fileLibrary = true;
                      fileLibraryType = 'video';
                    }
                  "
                />
              </div>
              <EditorButtonTable :editor="editor" />
              <EditorButtonComponents :editor="editor" />
            </div>
            <div class="flex -mx-2.5">
              <hr
                class="m-0 my-auto relative bg-bg-800ext-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              >
            </div>
          </div>
        </template>

        <div class="min-h-screen">
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
    <div v-else-if="editor && simpleMode">
      <div class="relative m-2 rounded-xl">
        <div class="px-1 border-b border-b-bg-600">
          <div class="flex flex-row justify-between py-2 gap-x-2">
            <div class="flex flex-row gap-x-2">
              <EditorButtonBold :editor="editor" />
              <EditorButtonItalic :editor="editor" />
              <EditorButtonUnderline :editor="editor" />
              <EditorButtonStrike :editor="editor" />
              <EditorButtonClearFormatting :editor="editor" />
            </div>
            <EditorButtonBlockquote :editor="editor" />
            <div class="flex flex-row gap-x-2">
              <EditorButtonBulletList :editor="editor" />
              <EditorButtonOrderedList :editor="editor" />
            </div>
            <EditorButtonLink :editor="editor" />
            <div class="flex flex-row gap-x-2">
              <EditorButtonImage
                :editor="editor"
                :open-library="
                  () => {
                    fileLibrary = true;
                    fileLibraryType = 'image';
                  }
                "
              />
            </div>
          </div>
        </div>

        <div class="">
          <TiptapEditorContent :editor="editor" name="msgInput" />
        </div>

        <!-- <div class="flex px-2 py-2 border-t border-bg-600"> -->
        <UTooltip text="Senden" class="absolute ml-auto bottom-1 right-5">
          <UButton :loading="loading" icon="i-mdi-send" class="rounded-full" size="xs" @click="$emit('send')" />
        </UTooltip>
        <!-- </div> -->
      </div>
    </div>
    <div v-else-if="editor && readOnly">
      <TiptapEditorContent :editor="editor" />
    </div>
  </div>
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

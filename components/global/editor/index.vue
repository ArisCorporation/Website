<script setup lang="ts">
import cheerio from 'cheerio';
import { TiptapArisCorpPanel, TiptapArisCorpPanelWithBg, TiptapVideo } from '~/composables/tiptapExt';

const fullscreen_state = ref(false);
const fileLibrary = ref(false);
const fileLibraryType = ref();

const props = defineProps<{ modelValue: string; readOnly?: boolean }>();
const { modelValue, readOnly } = toRefs(props);
const emit = defineEmits(['update:modelValue']);

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
    TiptapImage.configure({
      inline: true,
    }),
    TiptapArisCorpPanel,
    TiptapArisCorpPanelWithBg,
    TiptapVideo,
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

// base: 'max-h-[calc(100dvh_-_300px)] sm:max-h-[calc(100dvh_-_250px)] xl:max-h-[calc(100dvh_-_200px)] overflow-y-scroll',
onMounted(() => {
  document.addEventListener('fullscreenchange', fullscreenchanged);
});
onBeforeUnmount(() => {
  unref(editor).destroy();
});
</script>

<template>
  <div>
    <EditorFileLibrary v-model="fileLibrary" :file-types="fileLibraryType" @file-selection="onFileSelection" />
    <div v-if="editor && !readOnly" id="editor_container">
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
              <EditorButtonFullscreen :fullscreen_toggle="toggleFullscreen" :fullscreen_state="fullscreen_state" />
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
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
                @click="editor.chain().focus().setColor"
              />
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
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              />
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
                class="m-0 my-auto relative bg-bprimary text-primary-400 before:left-0 before:w-1 before:aspect-[1/1] before:absolute before:inline-block before:bg-primary-400 after:w-1 after:right-0 after:aspect-[1/1] after:absolute after:inline-block after:bg-primary-400"
              />
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
</style>

<script setup lang="ts">
interface Folder {
  id: string;
  parent: string;
  name: string;
  children: Folder;
}

const { directus, uploadFiles } = useCMS();

defineProps<{ fileTypes?: 'image' | 'video' | 'audio' }>();
const emit = defineEmits(['file-selection']);

const slideover = defineModel<boolean>();
const library_slideover = ref(false);
const active_folder = useState<Folder | null>('active_folder', () => null);

function onFileSelection(file) {
  emit('file-selection', file);
  library_slideover.value = false;
  slideover.value = false;
}

watch(library_slideover, () => (active_folder.value = null));

const dropZoneRef = ref<HTMLDivElement>();

function onDrop(files: File[] | null) {
  const file = files?.[0];
  if (file) {
    uploadFile(file);
  }
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
  dataTypes: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'],
});

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const uploadedFiles = await directus.request(uploadFiles(formData));
  onFileSelection(uploadedFiles);
}

const fileInput = ref();
function onPickFile() {
  fileInput.value.click();
}
function onFilePicked(event) {
  const file = event.target.files[0];
  uploadFile(file);
}
</script>

<template>
  <Slideover v-model="slideover">
    <template #slideContent>
      <Slideover v-model="library_slideover" big>
        <template #slideContent>
          <div class="flex h-full">
            <div class="my-auto size-full">
              <FileLibrary grid="4" :type="fileTypes" class="max-h-screen" @image-click="onFileSelection" />
            </div>
          </div>
        </template>
      </Slideover>
      <div
        ref="dropZoneRef"
        class="w-full aspect-[21/9] border border-dashed rounded-xl border-btertiary flex transition-all"
        :class="{ 'bg-bg-600': isOverDropZone }"
      >
        <div class="flex flex-wrap m-auto space-y-4">
          <p class="w-full p-0 text-sm text-center text-neutral-200/75">
            Ziehe eine Datei über dieses Feld oder wähle eine der Optionen aus.
          </p>
          <div class="flex m-auto space-x-4">
            <UTooltip text="Datei hochladen">
              <ButtonDefault @click="onPickFile">
                <UIcon name="i-heroicons-document-arrow-up" class="flex m-auto" />
              </ButtonDefault>
            </UTooltip>
            <input
              ref="fileInput"
              type="file"
              accept="image/jpg, image/jpeg, image/png, image/gif, image/webp"
              hidden
              @change="onFilePicked"
            />
            <UTooltip text="Datei-Bibliothek">
              <ButtonDefault @click="() => (library_slideover = true)">
                <UIcon name="i-heroicons-folder" class="flex m-auto" />
              </ButtonDefault>
            </UTooltip>
          </div>
        </div>
      </div>
    </template>
  </Slideover>
</template>

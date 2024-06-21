<script setup lang="ts">
interface Folder {
  id: string;
  parent: string;
  name: string;
  children: Folder;
}

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
</script>
<template>
  <Slideover v-model="slideover">
    <template #slideContent>
      <Slideover v-model="library_slideover" big>
        <template #slideContent>
          <div class="my-4">
            <FileLibrary grid="4" :type="fileTypes" @image-click="onFileSelection" />
          </div>
        </template>
      </Slideover>
      <div class="w-full aspect-[21/9] border border-dashed rounded-xl border-btertiary flex">
        <div class="flex flex-wrap m-auto space-y-4">
          <p class="w-full p-0 text-sm text-center text-tbase/75">
            Ziehe eine Datei über dieses Feld oder wähle eine der Optionen aus.
          </p>
          <div class="flex m-auto space-x-4">
            <UTooltip text="Datei hochladen - COMING SOON">
              <ButtonDefault>
                <UIcon name="i-heroicons-document-arrow-up" class="flex m-auto" />
              </ButtonDefault>
            </UTooltip>
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

<script setup lang="ts">
interface Folder {
  id: string;
  parent: string;
  name: string;
  children: Folder[];
}

const props = defineProps({
  folder: {
    type: String,
    required: false,
    default: null,
  },
});
defineEmits(['folder-select']);

const { globals, url } = useDirectus();
const { readFiles } = useDirectusFiles();
const active_folder = useState<Folder | null>('active_folder');

const { data, refresh } = await useAsyncData(async () => {
  const { data: newFolders } = await globals.fetch(url.href + 'folders?fields=*&sort=name');
  const newFiles = await readFiles({
    limit: -1,
    filter: {
      ...(props.folder !== 'all' && { folder: props.folder ? { _eq: props.folder } : { _null: true } }),
    },
  });

  newFolders.forEach((folder: any, index: number) => {
    const childrenFolders = newFolders.filter((e) => e.parent === folder.id);
    newFolders[index] = { ...folder, children: childrenFolders };
  });

  return {
    folders: newFolders,
    files: newFiles,
  };
});

const folders = computed(() => data.value?.folders);
const files = computed(() => data.value?.files);

watch(
  () => props.folder,
  async () => {
    await refresh();
  },
);

const open = ref(false);
</script>
<template>
  <div class="flex flex-row max-w-full py-2 border divide-x rounded border-bsecondary divide-bsecondary">
    <div class="px-1 min-w-72">
      <ul class="pl-0 space-y-4 list-none">
        <li class="p-0">
          <div
            class="flex justify-between max-w-full p-2 rounded cursor-pointer hover:bg-bsecondary has-[.folder-label:active]:animate-link"
            :class="{ 'bg-black': active_folder === null }"
          >
            <div class="flex flex-grow my-auto space-x-1 w-fit folder-label" @click="active_folder = null">
              <UIcon name="i-heroicons-folder" class="my-auto size-5" />
              <p class="p-0">Dateien</p>
            </div>
            <div class="relative my-auto size-5 animate-link">
              <UIcon
                name="i-heroicons-chevron-down-20-solid"
                class="w-full h-full transition-transform duration-300"
                :class="{ '-rotate-90': !open }"
                @click="open = !open"
              />
            </div>
          </div>
          <ul v-if="open" class="pt-2 space-y-3 list-none">
            <FileLibraryFolderItem
              v-for="folder in folders.filter((e) => !e.parent)"
              :key="folder.id"
              :folder="folder"
              :level="1"
            />
          </ul>
        </li>
        <li class="p-0">
          <div
            class="flex justify-between max-w-full p-2 rounded cursor-pointer hover:bg-bsecondary has-[.folder-label:active]:animate-link"
            :class="{ 'bg-black': active_folder?.id === 'all' }"
          >
            <div
              class="flex flex-grow my-auto space-x-1 w-fit folder-label"
              @click="active_folder = { id: 'all', parent: '', name: 'Alle Dateien', children: [] }"
            >
              <UIcon name="i-heroicons-folder" class="my-auto size-5" />
              <p class="p-0">Alle Dateien</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div class="flex-grow w-auto h-full p-4 ml-2">
      <div class="grid grid-cols-6 gap-4">
        <div
          v-for="file in files"
          :key="file.id"
          class="w-full h-auto aspect-[1/1] bg-bsecondary rounded-xl overflow-clip"
        >
          <NuxtImg v-if="file.type.startsWith('image')" :src="file.id" class="object-cover w-full h-full" />
          <video
            v-else-if="file.type.startsWith('video')"
            :src="$config.public.fileBase + file.id + '#t=1.1'"
            class="object-cover w-full h-full rounded-xl"
          />
          <div v-else class="flex w-full h-full text-center">
            <span class="m-auto">{{ file.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

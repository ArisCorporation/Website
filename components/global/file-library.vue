<script setup lang="ts">
interface Folder {
  id: string;
  parent: string;
  name: string;
  children: Folder[];
}

defineEmits(['image-click']);

const props = defineProps<{ grid?: string; type?: 'image' | 'video' | 'audio' }>();

const { globals, url } = useDirectus();
const { readAsyncFiles } = useDirectusFiles();
const active_folder = useState<Folder | null>('active_folder');

const { data: folders } = await useAsyncData(() => globals.fetch(url.href + 'folders?fields=*&sort=name&limit=-1'), {
  watch: [active_folder],
  transform: (data) => {
    const folders = data?.data;
    folders.forEach((folder: any, index: number) => {
      const childrenFolders = folders?.filter((e) => e.parent === folder.id);
      folders[index] = { ...folder, children: childrenFolders };
    });

    return folders;
  },
});

const { data: files, refresh: frefresh } = await useAsyncData(
  () =>
    globals.fetch(
      url.href +
        `files?fields=*&limit=-1${active_folder.value?.id !== 'all' ? `&filter[folder]${active_folder.value?.id ? `[_eq]=${active_folder.value?.id}` : '[_null]'}` : ''}${props.type ? `&filter[type][_istarts_with]=${props.type}` : ''}`,
    ),
  {
    watch: [active_folder],
    transform: (data) => data?.data,
  },
);

const open = ref(false);
</script>
<template>
  <div
    class="w-full max-w-full grid-cols-3 py-2 border divide-y rounded sm:divide-x sm:divide-y-0 sm:grid border-bsecondary divide-bsecondary"
  >
    <div class="px-1 pb-4 overflow-x-auto sm:pb-0">
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
              :folders="folders"
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
    <div class="w-auto col-span-2 p-4 mx-2 sm:mr-0 min-h-max">
      <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${grid ?? 6}, minmax(0, 1fr))` }">
        <div
          v-for="file in files"
          :key="file.id"
          class="w-full h-auto aspect-[1/1] bg-bsecondary rounded-xl overflow-clip cursor-pointer animate-link"
          @click="() => $emit('image-click', file)"
        >
          <NuxtImg v-if="file.type?.startsWith('image')" :src="file.id" class="object-cover w-full h-full" />
          <video
            v-else-if="file.type?.startsWith('video')"
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

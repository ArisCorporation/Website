<script setup lang="ts">
interface Folder {
  id: string;
  parent: string;
  name: string;
  children: Folder[];
}

defineProps({
  folder: {
    type: Object as PropType<Folder>,
    required: false,
    default: null,
  },
  level: {
    type: Number,
    required: true,
  },
});
const active_folder = useState<Folder | null>('active_folder');
const open = ref(false);
</script>
<template>
  <li class="p-0">
    <div
      class="flex justify-between max-w-full p-2 rounded cursor-pointer hover:bg-bsecondary has-[.folder-label:active]:animate-link"
      :class="{ 'bg-black': active_folder?.id == folder.id }"
    >
      <div class="flex flex-grow my-auto space-x-1 w-fit folder-label" @click="active_folder = folder">
        <UIcon name="i-heroicons-folder" class="my-auto size-5" />
        <p class="p-0">{{ folder.name }}</p>
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
    <template v-if="folder.children && folder.children.length > 0">
      <ul v-if="open" class="pt-2 space-y-2 list-none">
        <FileLibraryFolderItem v-for="child in folder.children" :key="child.id" :folder="child" :level="level + 1" />
      </ul>
    </template>
  </li>
</template>

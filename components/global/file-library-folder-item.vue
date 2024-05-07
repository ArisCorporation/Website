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
      class="flex justify-between max-w-full p-2 rounded cursor-pointer hover:bg-bsecondary"
      :class="{ 'bg-black': active_folder?.id == folder.id }"
    >
      <div class="flex my-auto space-x-1 w-fit" @click="active_folder = folder">
        <UIcon name="i-heroicons-folder" class="w-5 h-5 my-auto" />
        <p class="p-0">{{ folder.name }}</p>
      </div>
      <UIcon
        name="i-heroicons-chevron-down-20-solid"
        class="w-5 h-5 my-auto transition-transform duration-300"
        :class="{ '-rotate-90': !open }"
        @click="open = !open"
      />
    </div>
    <template v-if="folder.children && folder.children.length > 0">
      <ul v-if="open" class="pt-2 space-y-2 list-none">
        <FileLibraryFolderItem v-for="child in folder.children" :key="child.id" :folder="child" :level="level + 1" />
      </ul>
    </template>
  </li>
</template>

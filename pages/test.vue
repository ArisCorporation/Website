<script setup lang="ts">
interface Folder {
  id: string;
  parent: string;
  name: string;
  children: Folder;
}

const active_folder = useState<Folder | null>('active_folder', () => null);
</script>
<template>
  <div class="my-4">
    <h1>File-Library Test</h1>
    <h1>{{ active_folder?.name || 'Dateien' }}</h1>
    <FileLibrary :folder="active_folder?.id" @folder-select="(f: Folder) => (active_folder = f)" />
  </div>
</template>

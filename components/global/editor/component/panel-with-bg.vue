<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3';
</script>

<template>
  <NodeViewWrapper>
    <DefaultPanel>
      <div class="px-4">
        <NodeViewContent />
      </div>
    </DefaultPanel>
  </NodeViewWrapper>
</template>

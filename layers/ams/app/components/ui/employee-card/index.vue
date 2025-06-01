<script setup lang="ts">
import type { DirectusUser } from '~~/types'

defineProps<{ data: DirectusUser }>()
</script>

<template>
  <div
    class="aspect-[270/320] w-full h-auto bg-(--ui-bg-muted)/50 rounded"
  ></div>
</template>

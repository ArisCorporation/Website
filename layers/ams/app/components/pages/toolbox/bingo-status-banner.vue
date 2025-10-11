<script setup lang="ts">
/**
 * Compact status banner indicating a bingo has been achieved.
 */
/** Controls banner visibility and displays the number of completed lines. */
defineProps<{
  show: boolean
  lineCount: number
}>()
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="flex items-center gap-3 rounded-2xl border border-(--ui-primary)/40 bg-(--ui-primary)/15 px-5 py-4 text-white shadow-[0_0_35px_rgba(15,90,255,0.22)]"
    >
      <UIcon name="i-lucide-party-popper" class="h-6 w-6 text-(--ui-primary)" />
      <p class="text-sm font-semibold">Bingo!</p>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

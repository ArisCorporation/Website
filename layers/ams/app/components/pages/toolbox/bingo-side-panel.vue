<script setup lang="ts">
defineProps<{
  isExporting: boolean
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'export'): void
  (e: 'shuffle'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <div class="pointer-events-none hidden lg:flex lg:fixed lg:top-1/2 lg:right-0 lg:-translate-y-1/2">
    <div class="pointer-events-auto group relative h-[360px] w-[320px]">
      <div
        class="absolute inset-y-0 right-0 flex h-full w-[320px] translate-x-[calc(100%-4rem)] overflow-hidden rounded-l-[32px] border border-white/10 bg-[linear-gradient(160deg,rgba(7,14,28,0.96),rgba(9,60,90,0.32))] text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80 shadow-[0_28px_60px_-34px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-transform duration-300 ease-out group-hover:translate-x-0"
      >
        <div
          class="flex w-16 flex-col items-center justify-center gap-1 border-r border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] text-[11px] transition-colors duration-200 group-hover:bg-(--ui-primary)/25 group-hover:text-(--ui-primary)"
        >
          <span>O</span>
          <span>p</span>
          <span>t</span>
          <span>i</span>
          <span>o</span>
          <span>n</span>
          <span>e</span>
          <span>n</span>
          <span class="mt-1">&lt;</span>
        </div>
        <div class="flex flex-1 flex-col justify-between gap-5 px-6 py-6 text-left">
          <div class="space-y-2 text-white/75">
            <div class="flex items-center gap-2 text-[11px] font-semibold tracking-[0.32em] text-white/60">
              <UIcon name="i-lucide-corner-down-right" class="h-3.5 w-3.5" />
              Schnellzugriff
            </div>
            <p class="text-[12px] leading-5 text-white/65">
              Aktionen für dein Bingo-Board – direkt griffbereit.
            </p>
          </div>
          <div class="flex flex-col gap-3">
            <UButton
              color="primary"
              icon="i-lucide-save"
              class="justify-between"
              @click="emit('save')"
            >
              Spiel speichern
              <span class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
                Local
              </span>
            </UButton>
            <UButton
              color="primary"
              variant="soft"
              icon="i-lucide-image-down"
              :loading="isExporting"
              class="justify-between"
              @click="emit('export')"
            >
              Als Bild exportieren
              <span class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
                PNG
              </span>
            </UButton>
            <UButton
              color="primary"
              variant="outline"
              icon="i-lucide-shuffle"
              class="justify-between"
              @click="emit('shuffle')"
            >
              Neu mischen
              <span class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
                Random
              </span>
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-rotate-ccw"
              class="justify-between"
              @click="emit('reset')"
            >
              Zurücksetzen
              <span class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                Reset
              </span>
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

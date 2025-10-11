<script setup lang="ts">
/**
 * Desktop side panel for bingo controls.
 *
 * Sticks alongside the board and exposes save, export, shuffle and reset actions.
 */
defineProps<{
  isExporting: boolean
}>()

/** Emitters for panel actions delegated to the page. */
const emit = defineEmits<{
  (e: 'save'): void
  (e: 'export'): void
  (e: 'shuffle'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <aside class="hidden lg:block">
    <div class="lg:sticky lg:top-28">
      <div
        class="rounded-[28px] border border-white/12 bg-[linear-gradient(158deg,rgba(9,15,32,0.92),rgba(4,9,22,0.86))] p-6 text-sm text-white/75 shadow-[0_26px_60px_-42px_rgba(0,0,0,0.65)] backdrop-blur-xl"
      >
        <div class="space-y-2 text-left">
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/45"
          >
            Bingo Optionen
          </p>
          <h3 class="text-xl font-semibold text-white">Steuerzentrale</h3>
          <p class="text-sm leading-relaxed text-white/60">
            Passe dein Board an, sichere deinen Fortschritt und teile besondere
            Runden mit deinem Team.
          </p>
        </div>

        <div class="mt-6 flex flex-col gap-3">
          <UButton
            color="primary"
            icon="i-lucide-save"
            class="w-full justify-between"
            @click="emit('save')"
          >
            Spiel speichern
            <span
              class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70"
            >
              Lokal
            </span>
          </UButton>
          <UButton
            color="primary"
            variant="soft"
            icon="i-lucide-image-down"
            :loading="isExporting"
            class="w-full justify-between"
            @click="emit('export')"
          >
            Als Bild exportieren
            <span
              class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70"
            >
              PNG
            </span>
          </UButton>
          <UButton
            color="primary"
            variant="outline"
            icon="i-lucide-shuffle"
            class="w-full justify-between"
            @click="emit('shuffle')"
          >
            Neu mischen
            <span
              class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70"
            >
              Zufall
            </span>
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-rotate-ccw"
            class="w-full justify-between"
            @click="emit('reset')"
          >
            Zurücksetzen
            <span
              class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60"
            >
              Neustart
            </span>
          </UButton>
        </div>

        <div
          class="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-[12px] leading-5 text-white/65"
        >
          <p
            class="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40"
          >
            Tipp
          </p>
          <p>
            Speichere das Board kurz bevor du neu mischst, damit besondere Runden
            später in deinen Spielen auftauchen.
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

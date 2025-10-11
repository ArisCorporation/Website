<script setup lang="ts">
/**
 * Celebration overlay shown once a bingo is completed.
 *
 * Displays animated visuals and exposes close/export actions.
 */
/** Visibility, line count and export state driven by the page. */
defineProps<{
  show: boolean
  lineCount: number
  isExporting: boolean
}>()

/** Notify the page when the user closes the overlay or exports the board. */
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'export'): void
}>()
</script>

<template>
  <Transition name="bingo-overlay">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="absolute inset-0 bg-black/70 backdrop-blur-sm"
        role="presentation"
        @click="emit('close')"
      />
      <div
        class="relative z-10 mx-4 flex max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-[36px] border border-(--ui-primary)/30 bg-[radial-gradient(circle_at_top,_rgba(16,108,255,0.24),rgba(3,7,18,0.92))] p-10 text-center shadow-[0_45px_120px_-40px_rgba(11,92,255,0.7)]"
      >
        <span class="celebration-glow" />
        <span class="confetti confetti-1" />
        <span class="confetti confetti-2" />
        <span class="confetti confetti-3" />
        <div class="flex flex-col items-center gap-3">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80"
          >
            <UIcon name="i-lucide-sparkles" class="h-4 w-4 text-(--ui-primary)" />
            Bingo Confirmed
          </span>
          <h2 class="text-4xl font-semibold leading-tight text-white md:text-5xl">
            ArisCorp Crew hat Bingo!
          </h2>
          <p class="max-w-xl text-sm text-slate-200/80 md:text-base">
            {{ lineCount }}
            {{ lineCount === 1 ? 'Linie' : 'Linien' }} abgeschlossen – starke
            Leistung! Teile den Moment mit deiner Crew oder starte direkt in die
            nächste Runde.
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <UButton
            color="primary"
            icon="i-lucide-party-popper"
            @click="emit('close')"
          >
            Weiter spielen
          </UButton>
          <UButton
            variant="ghost"
            color="gray"
            icon="i-lucide-image-down"
            :loading="isExporting"
            @click="emit('export')"
          >
            Bingo speichern
          </UButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.bingo-overlay-enter-active,
.bingo-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.bingo-overlay-enter-from,
.bingo-overlay-leave-to {
  opacity: 0;
}

.celebration-glow {
  position: absolute;
  inset: -60%;
  background: radial-gradient(circle, rgba(15, 91, 255, 0.18), transparent 55%);
  animation: pulseGlow 4s ease-in-out infinite;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 220px;
  height: 220px;
  background: conic-gradient(
    from 45deg,
    rgba(80, 160, 255, 0.5),
    rgba(255, 255, 255, 0.35),
    rgba(80, 160, 255, 0.5)
  );
  filter: blur(28px);
  opacity: 0.85;
  animation: confettiSpin 9s linear infinite;
  pointer-events: none;
  mix-blend-mode: screen;
}

.confetti-1 {
  top: -60px;
  left: -120px;
  animation-duration: 10s;
}

.confetti-2 {
  bottom: -80px;
  right: -140px;
  animation-duration: 12s;
  animation-direction: reverse;
}

.confetti-3 {
  top: 40%;
  right: -100px;
  width: 160px;
  height: 160px;
  animation-duration: 8s;
}

@keyframes pulseGlow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.75;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes confettiSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

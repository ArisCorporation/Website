<script lang="ts" setup>
definePageMeta({
  layout: 'ams',
  auth: true,
  access_level: 1,
})
</script>
<template>
  <div class="space-y-10">
    <header class="space-y-3">
      <h1 class="text-2xl font-semibold text-white lg:text-3xl">
        Aris Toolbox
      </h1>
      <p class="max-w-2xl text-sm text-white/70 lg:text-base">
        Praktische Helferlein für das tägliche AMS-Handling. Entdecke neue Tools
        und nutze sie direkt im Management-Bereich.
      </p>
    </header>

    <div
      class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      data-testid="ams-toolbox-grid"
    >
      <NuxtLink
        to="/ams/toolbox/bingo"
        class="group flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(12,21,39,0.82),rgba(6,18,41,0.92))] p-5 text-white transition hover:border-(--ui-primary)/40 hover:bg-[linear-gradient(160deg,rgba(14,27,52,0.92),rgba(10,31,60,0.98))] hover:shadow-[0_18px_38px_-26px_rgba(0,255,232,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ui-page,#020617)]"
      >
        <div class="flex items-start justify-between gap-3">
          <span
            class="flex h-12 w-12 items-center justify-center rounded-xl border border-(--ui-primary)/30 bg-(--ui-primary)/10 text-(--ui-primary)"
          >
            <UIcon
              name="i-lucide-party-popper"
              class="h-6 w-6 transition-transform duration-200 group-hover:scale-110"
            />
          </span>
          <UIcon
            name="i-lucide-arrow-up-right"
            class="h-5 w-5 text-white/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-(--ui-primary)"
            aria-hidden="true"
          />
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold">AMS Bingo</h2>
          <p class="text-sm text-white/70">
            Sammle besondere Momente und teile dein persönliches Bingo mit der
            Crew.
          </p>
        </div>
        <div
          class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60"
        >
          <UIcon name="i-lucide-sparkles" class="h-4 w-4 text-(--ui-primary)" />
          <span>Neu im Toolbox</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
type CollectionOption = {
  id: string
  title: string
  description: string
  phraseCount: number
}

const props = defineProps<{
  collections: CollectionOption[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectedId = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

function isActive(id: string) {
  return id === selectedId.value
}
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <h2 class="text-lg font-semibold text-white">Bingo Kollektionen</h2>
      <p class="text-sm text-white/65">
        Wähle einen Satz an Begriffen für dein Bingo. Jede Kollektion mischt ein
        eigenes Themenfeld in das Board.
      </p>
    </header>
    <div
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="bingo-collection-select"
    >
      <button
        v-for="collection in props.collections"
        :key="collection.id"
        type="button"
        class="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-(--ui-primary)/40 hover:bg-white/10 hover:shadow-[0_12px_32px_-24px_rgba(0,255,232,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-primary)/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ui-page,#020617)]"
        :class="[
          isActive(collection.id)
            ? 'border-(--ui-primary)/50 bg-(--ui-primary)/15 shadow-[0_18px_48px_-24px_rgba(0,255,232,0.7)]'
            : '',
        ]"
        @click="selectedId = collection.id"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-white">
              {{ collection.title }}
            </span>
            <span
              class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-white/60"
            >
              {{ collection.phraseCount }} Felder
            </span>
          </div>
          <p class="text-sm text-white/65">
            {{ collection.description }}
          </p>
        </div>
        <span
          class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] transition"
          :class="
            isActive(collection.id)
              ? 'text-(--ui-primary)'
              : 'text-white/50 group-hover:text-(--ui-primary)'
          "
        >
          <UIcon
            :name="
              isActive(collection.id)
                ? 'i-lucide-check-circle-2'
                : 'i-lucide-mouse-pointer-click'
            "
            class="h-4 w-4"
          />
          {{ isActive(collection.id) ? 'Aktiv' : 'Auswählen' }}
        </span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
type BingoBoardSaveSummary = {
  id: string
  name: string
  createdAt: string
  collectionName: string
  activeCount: number
  completedLineCount: number
  playableCells: number
}

const props = defineProps<{
  saves: BingoBoardSaveSummary[]
}>()

const emit = defineEmits<{
  (e: 'save', name?: string): void
  (e: 'load', id: string): void
  (e: 'delete', id: string): void
  (e: 'clear'): void
}>()

const nameInput = ref('')

function submitSave() {
  emit('save', nameInput.value)
  nameInput.value = ''
}

const hasSaves = computed(() => props.saves.length > 0)

function formatDate(value: string) {
  return new Date(value).toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<template>
  <section
    class="rounded-[28px] border border-white/12 bg-[linear-gradient(155deg,rgba(9,15,32,0.82),rgba(4,9,22,0.92))] p-5 sm:p-6 space-y-5 text-white"
  >
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Vergangene Spiele</h2>
      <p class="text-sm text-white/65">
        Bewahre Layout und Fortschritt deiner Bingo-Runden lokal auf diesem
        Gerät und setze sie später fort.
      </p>
    </div>

    <form
      class="flex flex-col gap-3 sm:flex-row sm:items-center"
      @submit.prevent="submitSave"
    >
      <UButton
        type="submit"
        color="primary"
        icon="i-lucide-save"
        class="sm:self-stretch sm:px-6"
      >
        Speichern
      </UButton>
    </form>

    <div v-if="hasSaves" class="space-y-4">
      <div
        class="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_40px_-32px_rgba(0,255,232,0.45)]"
      >
        <table class="min-w-full divide-y divide-white/10 text-sm">
          <thead>
            <tr class="text-xs uppercase tracking-[0.26em] text-white/50">
              <th class="px-4 py-3 text-left font-semibold">Spiel</th>
              <th class="px-4 py-3 text-left font-semibold">Kollektion</th>
              <th class="px-4 py-3 text-left font-semibold">Fortschritt</th>
              <th class="px-4 py-3 text-left font-semibold">Bingo</th>
              <th class="px-4 py-3 text-left font-semibold">Gespeichert</th>
              <th class="px-4 py-3 text-right font-semibold">Aktionen</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10 text-white/85">
            <tr
              v-for="save in props.saves"
              :key="save.id"
              class="transition hover:bg-white/5"
            >
              <td class="px-4 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold">{{ save.name }}</span>
                  <span class="text-xs text-white/60">
                    {{ save.playableCells }} Felder + Freifeld
                  </span>
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-white/75">{{
                  save.collectionName
                }}</span>
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/70"
                >
                  <UIcon name="i-lucide-grid-2x2" class="h-3.5 w-3.5" />
                  {{ save.activeCount }} / {{ save.playableCells }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center gap-2 rounded-full border border-(--ui-primary)/30 bg-(--ui-primary)/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]"
                  :class="
                    save.completedLineCount > 0
                      ? 'text-(--ui-primary)'
                      : 'text-white/60'
                  "
                >
                  <UIcon
                    :name="
                      save.completedLineCount > 0
                        ? 'i-lucide-party-popper'
                        : 'i-lucide-minus'
                    "
                    class="h-3.5 w-3.5"
                  />
                  {{ save.completedLineCount }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm text-white/65">
                {{ formatDate(save.createdAt) }}
              </td>
              <td class="px-4 py-4 text-right">
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <UButton
                    size="sm"
                    color="primary"
                    variant="soft"
                    icon="i-lucide-play"
                    @click="emit('load', save.id)"
                  >
                    Laden
                  </UButton>
                  <UButton
                    size="sm"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    @click="emit('delete', save.id)"
                  >
                    Entfernen
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-end">
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-lucide-trash"
          @click="emit('clear')"
        >
          Alle löschen
        </UButton>
      </div>
    </div>
    <div
      v-else
      class="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/70"
    >
      Noch keine Spiele gespeichert. Vergib oben einen Namen oder nutze den
      Schnellzugriff, um dein aktuelles Bingo zu sichern.
    </div>
  </section>
</template>

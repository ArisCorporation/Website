<script setup lang="ts">
const props = defineProps<{ mission: any }>()

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  mining: { label: 'Bergbau', icon: 'i-lucide-pickaxe', color: 'text-yellow-400' },
  combat: { label: 'Kampf', icon: 'i-lucide-sword', color: 'text-red-400' },
  cargo: { label: 'Fracht', icon: 'i-lucide-package', color: 'text-blue-400' },
  exploration: { label: 'Erkundung', icon: 'i-lucide-telescope', color: 'text-purple-400' },
  rescue: { label: 'Rettung', icon: 'i-lucide-heart-pulse', color: 'text-green-400' },
  patrol: { label: 'Patrouille', icon: 'i-lucide-shield', color: 'text-orange-400' },
  event: { label: 'Event', icon: 'i-lucide-star', color: 'text-pink-400' },
  other: { label: 'Sonstiges', icon: 'i-lucide-circle-dot', color: 'text-gray-400' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Entwurf', color: 'neutral' },
  active: { label: 'Aktiv', color: 'primary' },
  completed: { label: 'Abgeschlossen', color: 'info' },
  cancelled: { label: 'Abgebrochen', color: 'error' },
  archived: { label: 'Archiviert', color: 'neutral' },
}

const type = computed(() => TYPE_CONFIG[props.mission.mission_type] ?? TYPE_CONFIG.other)
const status = computed(() => STATUS_CONFIG[props.mission.status] ?? STATUS_CONFIG.draft)

const allPositions = computed(() =>
  (props.mission.teams ?? [])
    .flatMap((t: any) => t.ships ?? [])
    .flatMap((s: any) => s.positions ?? []),
)
const openPositions = computed(() => allPositions.value.filter((p: any) => p.status === 'open').length)
const registrationCount = computed(() => (props.mission.registrations ?? []).length)

const formattedDate = computed(() => {
  if (!props.mission.planned_date) return 'Datum offen'
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(props.mission.planned_date))
})
</script>

<template>
  <NuxtLink :to="`/ams/missions/${mission.id}`" class="block h-full">
    <div
      class="group h-full flex flex-col rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 p-5 transition-all duration-300 hover:border-(--ui-primary)/30 hover:shadow-primary-xs hover:bg-(--ui-bg-muted)/80 cursor-pointer"
    >
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <UIcon :name="type.icon" class="h-5 w-5 shrink-0" :class="type.color" />
          <span class="text-xs font-medium" :class="type.color">{{ type.label }}</span>
        </div>
        <UBadge :color="(status.color as any)" variant="subtle" size="sm">
          {{ status.label }}
        </UBadge>
      </div>

      <h3
        class="text-lg font-bold text-white line-clamp-2 mb-1 group-hover:text-(--ui-primary) transition-colors"
      >
        {{ mission.title }}
      </h3>

      <div class="flex items-center gap-1.5 text-sm text-(--ui-muted-foreground) mb-4">
        <UIcon name="i-lucide-calendar" class="h-4 w-4 shrink-0" />
        <span>{{ formattedDate }}</span>
      </div>

      <div class="mt-auto grid grid-cols-3 gap-2 pt-3 border-t border-(--ui-primary)/10">
        <div class="text-center">
          <p class="text-lg font-bold text-(--ui-primary)">{{ mission.teams?.length ?? 0 }}</p>
          <p class="text-xs text-(--ui-muted-foreground)">Teams</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-(--ui-primary)">
            {{ openPositions }}/{{ allPositions.length }}
          </p>
          <p class="text-xs text-(--ui-muted-foreground)">Stellen offen</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-(--ui-primary)">{{ registrationCount }}</p>
          <p class="text-xs text-(--ui-muted-foreground)">Anmeldungen</p>
        </div>
      </div>

      <div
        v-if="mission.user_created"
        class="mt-3 flex items-center gap-2 text-xs text-(--ui-muted-foreground)"
      >
        <UIcon name="i-lucide-user" class="h-3.5 w-3.5" />
        <span>{{ mission.user_created.first_name }} {{ mission.user_created.last_name }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

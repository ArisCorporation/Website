<script setup lang="ts">
const { data: missions, refresh } = await useFetchAMSMissions();

const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);

const searchInput = ref("");
const filterType = ref("all");
const filterStatus = ref("active");

const canCreate = computed(
  () => ((currentUser.value?.role as any)?.access_level ?? 0) >= 3,
);

const TYPE_OPTIONS = [
  { label: "Alle Typen", value: "all" },
  { label: "Bergbau", value: "mining" },
  { label: "Kampf", value: "combat" },
  { label: "Fracht", value: "cargo" },
  { label: "Erkundung", value: "exploration" },
  { label: "Rettung", value: "rescue" },
  { label: "Patrouille", value: "patrol" },
  { label: "Event", value: "event" },
  { label: "Sonstiges", value: "other" },
];

const STATUS_OPTIONS = [
  { label: "Laufende", value: "active" },
  { label: "Vergangene", value: "past" },
  { label: "Abgebrochene", value: "cancelled" },
  { label: "Alle", value: "all" },
];

const ACTIVE_STATUSES = new Set(["draft", "active"]);
const PAST_STATUSES = new Set(["completed"]);
const CANCELLED_STATUSES = new Set(["cancelled", "archived"]);

const filteredMissions = computed(() => {
  return (missions.value ?? []).filter((m: any) => {
    if (filterStatus.value === "active" && !ACTIVE_STATUSES.has(m.status))
      return false;
    if (filterStatus.value === "past" && !PAST_STATUSES.has(m.status))
      return false;
    if (filterStatus.value === "cancelled" && !CANCELLED_STATUSES.has(m.status))
      return false;
    if (filterType.value !== "all" && m.mission_type !== filterType.value)
      return false;
    if (
      searchInput.value &&
      !m.title.toLowerCase().includes(searchInput.value.toLowerCase())
    )
      return false;
    return true;
  });
});

const isFiltered = computed(
  () => searchInput.value || filterType.value !== "all" || filterStatus.value !== "active",
);

definePageMeta({
  layout: "ams",
  auth: true,
});
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-rocket"
      title="Mission Control"
      description="Übersicht aller geplanten Operationen."
    >
      <UButton
        v-if="canCreate"
        to="/ams/missions/create"
        icon="i-lucide-plus"
        label="Mission erstellen"
      />
    </AMSPageHeader>

    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        placeholder="Mission suchen..."
        size="lg"
        variant="outline"
        highlight
        class="flex-1"
      />
      <USelectMenu
        v-model="filterStatus"
        :items="STATUS_OPTIONS"
        value-key="value"
        label-key="label"
        size="lg"
        class="w-full sm:w-44"
      />
      <USelectMenu
        v-model="filterType"
        :items="TYPE_OPTIONS"
        value-key="value"
        label-key="label"
        size="lg"
        class="w-full sm:w-44"
      />
    </div>

    <div
      v-if="filteredMissions.length"
      class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
    >
      <AMSPagesMissionsCard
        v-for="mission in filteredMissions"
        :key="mission.id"
        :mission="mission"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <UIcon
        name="i-lucide-rocket"
        class="h-16 w-16 text-(--ui-primary)/20 mb-4"
      />
      <h3 class="text-lg font-semibold text-white/50">
        Keine Missionen gefunden
      </h3>
      <p class="text-sm text-(--ui-muted-foreground) mt-1">
        {{
          isFiltered
            ? "Keine Ergebnisse für deine Filter."
            : "Noch keine Operationen geplant."
        }}
      </p>
      <UButton
        v-if="canCreate && !isFiltered"
        to="/ams/missions/create"
        icon="i-lucide-plus"
        label="Erste Mission erstellen"
        class="mt-4"
        variant="outline"
      />
    </div>
  </div>
</template>

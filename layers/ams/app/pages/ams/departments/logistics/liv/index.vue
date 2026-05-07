<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { DirectusUser, DirectusRole } from "~~/types";

interface LivItem {
  id: string;
  sort?: number | null;
  material?: string | null;
  quality?: number | null;
  quantity?: number | null;
  quantity_unit?: "SCU" | "mSCU" | "Units" | null;
  category?: "metal" | "gas" | "mineral" | "rare" | null;
  location?: string | null;
  notes?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  user_created?: string | null;
  user_updated?: string | null;
}

const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);
const toast = useToast();

const canEdit = computed(() => {
  const al = (currentUser.value?.role as DirectusRole | undefined)
    ?.access_level;
  return (
    (currentUser.value as any)?.liv_editor === true ||
    (typeof al === "number" && al >= 5)
  );
});

const isLogisticsHead = computed(() => {
  const al = (currentUser.value?.role as DirectusRole | undefined)
    ?.access_level;
  const isHead = currentUser.value?.head_of_department === true;
  const dept = (currentUser.value?.primary_department as any)?.slug;
  return (
    (isHead && dept === "logistics") || (typeof al === "number" && al >= 5)
  );
});

// ─── Data ─────────────────────────────────────────────────────────────────────

// server: false so refresh() always triggers a live re-fetch on the client
const {
  data: items,
  refresh,
  pending,
} = useLazyAsyncData<LivItem[]>(
  "liv-items",
  () =>
    useDirectus(
      readItems("liv" as any, {
        limit: -1,
        sort: ["sort", "material"],
      }),
    ) as Promise<LivItem[]>,
  { server: false },
);

// ─── Filters ──────────────────────────────────────────────────────────────────

const searchQuery = ref("");
const categoryFilter = ref<string | undefined>(undefined);
const locationFilter = ref<string | undefined>(undefined);
const qualityFilter = ref<string | undefined>(undefined);

const categoryItems = [
  { label: "Metall", value: "metal" },
  { label: "Gas", value: "gas" },
  { label: "Mineral", value: "mineral" },
  { label: "Rare Material", value: "rare" },
];

const qualityItems = [
  { label: "≥ 800 (Exzellent)", value: "800" },
  { label: "≥ 600", value: "600" },
  { label: "≥ 400", value: "400" },
];

const uniqueLocationItems = computed(() =>
  [
    ...new Set(
      (items.value ?? []).map((i) => i.location).filter(Boolean) as string[],
    ),
  ]
    .sort()
    .map((l) => ({ label: l, value: l })),
);

const hasActiveFilter = computed(
  () =>
    !!searchQuery.value ||
    !!categoryFilter.value ||
    !!locationFilter.value ||
    !!qualityFilter.value,
);

function clearFilters() {
  searchQuery.value = "";
  categoryFilter.value = undefined;
  locationFilter.value = undefined;
  qualityFilter.value = undefined;
}

const filteredItems = computed(() => {
  let result = items.value ?? [];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (i) =>
        i.material?.toLowerCase().includes(q) ||
        i.location?.toLowerCase().includes(q) ||
        i.notes?.toLowerCase().includes(q),
    );
  }
  if (categoryFilter.value)
    result = result.filter((i) => i.category === categoryFilter.value);
  if (locationFilter.value)
    result = result.filter((i) => i.location === locationFilter.value);
  if (qualityFilter.value)
    result = result.filter(
      (i) => (i.quality ?? 0) >= parseInt(qualityFilter.value!),
    );
  return result;
});

// ─── Stats ────────────────────────────────────────────────────────────────────

const stats = computed(() => {
  const all = items.value ?? [];
  return {
    totalVolume: all.reduce((sum, i) => sum + (i.quantity ?? 0), 0),
    materialTypes: new Set(all.map((i) => i.material).filter(Boolean)).size,
    locations: new Set(all.map((i) => i.location).filter(Boolean)).size,
    totalItems: all.length,
  };
});

// ─── Inline Editing ───────────────────────────────────────────────────────────

const editingId = ref<string | null>(null);
const editDraft = ref<Partial<LivItem>>({});
const isSaving = ref(false);
const deletingId = ref<string | null>(null);

function startEdit(item: LivItem) {
  editingId.value = item.id;
  editDraft.value = { ...item };
}

function cancelEdit() {
  editingId.value = null;
  editDraft.value = {};
}

async function saveEdit() {
  if (!editingId.value) return;
  isSaving.value = true;
  try {
    await useDirectus(
      updateItem("liv" as any, editingId.value, {
        material: editDraft.value.material,
        quality: Number(editDraft.value.quality),
        quantity: Number(editDraft.value.quantity),
        quantity_unit: editDraft.value.quantity_unit,
        category: editDraft.value.category,
        location: editDraft.value.location,
        notes: editDraft.value.notes,
      }),
    );
    toast.add({
      title: "Gespeichert",
      color: "success",
      icon: "i-lucide-check",
    });
    editingId.value = null;
    editDraft.value = {};
    await refresh();
  } catch {
    toast.add({
      title: "Fehler beim Speichern",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    isSaving.value = false;
  }
}

async function deleteRow(id: string) {
  deletingId.value = id;
  try {
    await useDirectus(deleteItem("liv" as any, id));
    toast.add({ title: "Gelöscht", color: "neutral", icon: "i-lucide-trash" });
    await refresh();
  } catch {
    toast.add({
      title: "Fehler beim Löschen",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    deletingId.value = null;
  }
}

// ─── New Item ─────────────────────────────────────────────────────────────────

const showNewModal = ref(false);
const newDraft = ref<Partial<LivItem>>({ quantity_unit: "SCU" });
const isCreating = ref(false);

function openNewModal() {
  newDraft.value = { quantity_unit: "SCU" };
  showNewModal.value = true;
}

async function createNew() {
  if (!newDraft.value.material) return;
  isCreating.value = true;
  try {
    await useDirectus(createItem("liv" as any, { ...newDraft.value }));
    toast.add({ title: "Erstellt", color: "success", icon: "i-lucide-plus" });
    showNewModal.value = false;
    await refresh();
  } catch {
    toast.add({
      title: "Fehler beim Erstellen",
      color: "error",
      icon: "i-lucide-x",
    });
  } finally {
    isCreating.value = false;
  }
}

// ─── Permission Management ────────────────────────────────────────────────────

const showPermissions = ref(false);
const memberSearch = ref("");

const { data: allMembers, refresh: refreshMembers } = useLazyAsyncData<
  DirectusUser[]
>(
  "liv-members",
  async () => {
    if (!isLogisticsHead.value) return [];
    return (await useDirectus(
      readUsers({
        filter: { status: { _eq: "active" } },
        fields: [
          "id",
          "first_name",
          "middle_name",
          "last_name",
          "avatar",
          "liv_editor" as any,
        ] as any,
        limit: -1,
        sort: ["first_name"] as any,
      }),
    )) as DirectusUser[];
  },
  { server: false },
);

const filteredMembers = computed(() => {
  const q = memberSearch.value.toLowerCase();
  return (allMembers.value ?? []).filter(
    (m) => !q || getUserLabel(m).toLowerCase().includes(q),
  );
});

const editorCount = computed(
  () => (allMembers.value ?? []).filter((m) => (m as any).liv_editor).length,
);

async function toggleEditor(user: DirectusUser) {
  const current = (user as any).liv_editor ?? false;
  try {
    await useDirectus(updateUser(user.id, { liv_editor: !current } as any));
    await refreshMembers();
  } catch {
    toast.add({ title: "Fehler", color: "error" });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryIcon(cat?: string | null) {
  return (
    {
      metal: "i-lucide-layers",
      gas: "i-lucide-wind",
      mineral: "i-lucide-gem",
      rare: "i-lucide-sparkles",
    }[cat ?? ""] ?? "i-lucide-package"
  );
}

function getCategoryLabel(cat?: string | null) {
  return (
    { metal: "Metall", gas: "Gas", mineral: "Mineral", rare: "Rare Material" }[
      cat ?? ""
    ] ??
    cat ??
    "–"
  );
}

function getCategoryColor(cat?: string | null) {
  return (
    (
      {
        metal: "neutral",
        gas: "info",
        mineral: "warning",
        rare: "primary",
      } as Record<string, any>
    )[cat ?? ""] ?? "neutral"
  );
}

function getCategoryIconColor(cat?: string | null) {
  return (
    {
      metal: "text-neutral-400",
      gas: "text-info-400",
      mineral: "text-warning-400",
      rare: "text-primary-400",
    }[cat ?? ""] ?? "text-muted"
  );
}

function getQualityBarBg(q?: number | null) {
  if (!q) return "#374151";
  if (q >= 800) return "var(--color-success-500)";
  if (q >= 500) return "var(--color-warning-500)";
  return "var(--color-error-500)";
}

function getQualityTextClass(q?: number | null) {
  if (!q) return "text-(--ui-text-muted)";
  if (q >= 800) return "text-success-400";
  if (q >= 500) return "text-warning-400";
  return "text-error-400";
}

function formatRelativeDate(d?: string | null) {
  if (!d) return "–";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 30) return `vor ${Math.floor(days / 7)} Wochen`;
  return `vor ${Math.floor(days / 30)} Monaten`;
}

// ─── Table columns ────────────────────────────────────────────────────────────

const columns = computed<TableColumn<LivItem>[]>(() => [
  { accessorKey: "material", header: "Material" },
  { accessorKey: "category", header: "Kategorie" },
  { accessorKey: "quantity", header: "Menge" },
  { accessorKey: "quality", header: "Qualität" },
  { accessorKey: "location", header: "Standort" },
  { accessorKey: "date_updated", header: "Geändert" },
  ...(canEdit.value
    ? [{ accessorKey: "actions", header: "" } as TableColumn<LivItem>]
    : []),
]);

definePageMeta({
  layout: "ams",
  auth: true,
});
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-package"
      title="Logistics Inventory"
      description="Lagerbestand &amp; Ressourcenverwaltung der Logistics-Abteilung."
    >
      <div class="flex items-center gap-2">
        <UButton
          v-if="isLogisticsHead"
          @click="showPermissions = !showPermissions"
          :variant="showPermissions ? 'solid' : 'outline'"
          :color="showPermissions ? 'primary' : 'neutral'"
          icon="i-lucide-shield-check"
          size="sm"
        >
          Zugriff
          <UBadge
            v-if="editorCount"
            :label="String(editorCount)"
            color="primary"
            variant="solid"
            size="xs"
            class="ml-1"
          />
        </UButton>
        <UButton
          v-if="canEdit"
          @click="openNewModal"
          icon="i-lucide-plus"
          size="sm"
        >
          Neu
        </UButton>
      </div>
    </AMSPageHeader>

    <!-- ─── Stats ───────────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AMSUiCard
        v-for="stat in [
          {
            label: 'Gesamtvolumen',
            value: stats.totalVolume,
            suffix: 'SCU',
            icon: 'i-lucide-box',
          },
          {
            label: 'Materialarten',
            value: stats.materialTypes,
            suffix: '',
            icon: 'i-lucide-layers',
          },
          {
            label: 'Einträge',
            value: stats.totalItems,
            suffix: '',
            icon: 'i-lucide-list',
          },
          {
            label: 'Standorte',
            value: stats.locations,
            suffix: '',
            icon: 'i-lucide-map-pin',
          },
        ]"
        :key="stat.label"
      >
        <div class="p-4 flex items-center gap-3">
          <div
            class="rounded-md bg-(--ui-primary)/10 size-8 flex shrink-0 border border-(--ui-primary)/20"
          >
            <UIcon
              :name="stat.icon"
              class="size-5 m-auto text-(--ui-primary)"
            />
          </div>
          <div class="min-w-0">
            <p
              class="text-[10px] text-(--ui-text-muted) uppercase tracking-wider font-medium truncate m-0!"
            >
              {{ stat.label }}
            </p>
            <p
              class="text-xl font-bold font-mono text-white leading-tight m-0!"
            >
              {{ stat.value.toLocaleString("de-DE") }}
              <span
                v-if="stat.suffix"
                class="text-xs font-normal text-(--ui-text-muted) ml-1"
                >{{ stat.suffix }}</span
              >
            </p>
          </div>
        </div>
      </AMSUiCard>
    </div>

    <!-- ─── Permission Panel ────────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-3"
    >
      <div v-if="showPermissions && isLogisticsHead" class="mb-6">
        <AMSUiCard>
          <div class="p-5">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <UIcon
                    name="i-lucide-shield-check"
                    class="size-4 text-(--ui-primary)"
                  />
                  <h3 class="font-semibold text-sm text-white">
                    LIV Editor-Rechte
                  </h3>
                </div>
                <p class="text-xs text-(--ui-text-muted)">
                  Mitglieder mit aktiviertem Toggle können Inventareinträge
                  erstellen, bearbeiten und löschen.
                </p>
              </div>
              <div
                class="flex items-center gap-2 text-xs text-(--ui-text-muted) shrink-0 ml-4"
              >
                <UIcon name="i-lucide-users" class="size-3.5" />
                {{ editorCount }} / {{ allMembers?.length ?? 0 }} Editoren
              </div>
            </div>

            <!-- Search -->
            <UInput
              v-model="memberSearch"
              icon="i-lucide-search"
              placeholder="Mitglied suchen …"
              size="sm"
              variant="outline"
              class="mb-4"
            />

            <!-- Member grid -->
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2"
            >
              <div
                v-for="member in filteredMembers"
                :key="member.id"
                class="relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 cursor-pointer"
                :class="
                  (member as any).liv_editor
                    ? 'border-(--ui-primary)/40 bg-(--ui-primary)/8 hover:bg-(--ui-primary)/12'
                    : 'border-(--ui-primary)/10 bg-(--ui-bg-elevated)/20 hover:border-(--ui-primary)/20 hover:bg-(--ui-bg-elevated)/40'
                "
                @click="toggleEditor(member)"
              >
                <!-- Editor badge -->
                <div
                  v-if="(member as any).liv_editor"
                  class="absolute -top-1.5 -right-1.5 rounded-full bg-(--ui-primary) size-4 flex items-center justify-center"
                >
                  <UIcon name="i-lucide-check" class="size-2.5 text-black" />
                </div>

                <!-- Avatar -->
                <div
                  class="size-12 rounded-full overflow-hidden border-2 transition-all"
                  :class="
                    (member as any).liv_editor
                      ? 'border-(--ui-primary)/60'
                      : 'border-(--ui-primary)/20'
                  "
                >
                  <NuxtImg
                    :src="
                      getAssetId(member.avatar) ??
                      '88adb941-f746-405d-bcc4-c2804fb48e33'
                    "
                    class="size-full object-cover"
                  />
                </div>

                <!-- Name -->
                <p
                  class="text-xs text-center text-white font-medium leading-tight line-clamp-2"
                >
                  {{ getUserLabel(member) }}
                </p>

                <!-- Toggle indicator -->
                <div
                  class="flex items-center gap-1 text-[10px] font-medium mt-auto"
                  :class="
                    (member as any).liv_editor
                      ? 'text-(--ui-primary)'
                      : 'text-(--ui-text-muted)'
                  "
                >
                  <UIcon
                    :name="
                      (member as any).liv_editor
                        ? 'i-lucide-shield-check'
                        : 'i-lucide-shield-off'
                    "
                    class="size-3"
                  />
                  {{ (member as any).liv_editor ? "Editor" : "Leser" }}
                </div>
              </div>

              <p
                v-if="!filteredMembers.length"
                class="col-span-full text-center text-(--ui-text-muted) text-xs py-6"
              >
                Keine Mitglieder gefunden.
              </p>
            </div>
          </div>
        </AMSUiCard>
      </div>
    </Transition>

    <!-- ─── Toolbar ──────────────────────────────────────────────────────────── -->
    <div class="flex flex-wrap gap-2 mb-4">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Material, Standort, Notizen …"
        size="sm"
        class="flex-1 min-w-48"
        variant="outline"
        highlight
      />
      <USelect
        v-model="categoryFilter"
        :items="categoryItems"
        value-key="value"
        label-key="label"
        placeholder="Kategorie"
        size="sm"
        class="w-40"
      />
      <USelect
        v-model="locationFilter"
        :items="uniqueLocationItems"
        value-key="value"
        label-key="label"
        placeholder="Standort"
        size="sm"
        class="w-40"
      />
      <USelect
        v-model="qualityFilter"
        :items="qualityItems"
        value-key="value"
        label-key="label"
        placeholder="Qualität"
        size="sm"
        class="w-40"
      />
      <UButton
        v-if="hasActiveFilter"
        @click="clearFilters"
        variant="ghost"
        icon="i-lucide-x"
        size="sm"
        color="neutral"
        class="shrink-0"
      />
    </div>

    <!-- ─── Table ────────────────────────────────────────────────────────────── -->
    <div
      class="rounded-lg border border-(--ui-primary)/20 overflow-hidden mb-8"
    >
      <div v-if="pending" class="py-12 flex justify-center">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-6 text-(--ui-primary) animate-spin"
        />
      </div>
      <UTable
        v-else
        :columns="columns"
        :data="filteredItems"
        :ui="{
          thead: 'bg-(--ui-primary)/5 [&>tr]:after:bg-(--ui-primary)/20',
          th: 'text-(--ui-primary) text-xs uppercase tracking-wider',
          tbody: 'divide-(--ui-primary)/10',
          tr: 'hover:bg-(--ui-primary)/5 transition-colors duration-150',
          td: 'text-(--ui-text) py-2.5',
        }"
      >
        <!-- Material -->
        <template #material-cell="{ row }">
          <div v-if="editingId === row.original.id">
            <UInput
              v-model="editDraft.material"
              size="sm"
              placeholder="Material"
              class="w-36"
            />
          </div>
          <div v-else class="flex items-center gap-2">
            <UIcon
              :name="getCategoryIcon(row.original.category)"
              class="size-4 shrink-0"
              :class="getCategoryIconColor(row.original.category)"
            />
            <span class="font-medium">{{ row.original.material ?? "–" }}</span>
          </div>
        </template>

        <!-- Kategorie -->
        <template #category-cell="{ row }">
          <div v-if="editingId === row.original.id">
            <USelect
              v-model="editDraft.category"
              :items="categoryItems"
              value-key="value"
              label-key="label"
              placeholder="Kategorie"
              size="sm"
              class="w-36"
            />
          </div>
          <UBadge
            v-else-if="row.original.category"
            :label="getCategoryLabel(row.original.category)"
            :color="getCategoryColor(row.original.category)"
            variant="subtle"
            size="sm"
          />
          <span v-else class="text-(--ui-text-muted) text-sm">–</span>
        </template>

        <!-- Menge -->
        <template #quantity-cell="{ row }">
          <div v-if="editingId === row.original.id" class="flex gap-1">
            <UInput
              v-model="editDraft.quantity"
              type="number"
              size="sm"
              class="w-20"
              placeholder="0"
            />
            <USelect
              v-model="editDraft.quantity_unit"
              :items="['SCU', 'mSCU', 'Units']"
              size="sm"
              class="w-24"
            />
          </div>
          <span v-else class="font-mono text-sm">
            {{ (row.original.quantity ?? 0).toLocaleString("de-DE") }}
            <span class="text-(--ui-text-muted) text-xs ml-0.5">{{
              row.original.quantity_unit ?? "SCU"
            }}</span>
          </span>
        </template>

        <!-- Qualität -->
        <template #quality-cell="{ row }">
          <div v-if="editingId === row.original.id">
            <UInput
              v-model="editDraft.quality"
              type="number"
              size="sm"
              class="w-24"
              placeholder="0–1000"
              :min="0"
              :max="1000"
            />
          </div>
          <div v-else class="flex items-center gap-2 min-w-28">
            <div
              class="flex-1 h-1.5 rounded-full bg-(--ui-bg-accented) overflow-hidden"
            >
              <div
                class="h-full rounded-full transition-all"
                :style="{
                  width: `${Math.min(((row.original.quality ?? 0) / 1000) * 100, 100)}%`,
                  background: getQualityBarBg(row.original.quality),
                }"
              />
            </div>
            <span
              class="text-xs font-mono w-8 text-right tabular-nums"
              :class="getQualityTextClass(row.original.quality)"
            >
              {{ row.original.quality ?? "–" }}
            </span>
          </div>
        </template>

        <!-- Standort -->
        <template #location-cell="{ row }">
          <div v-if="editingId === row.original.id">
            <UInput
              v-model="editDraft.location"
              size="sm"
              placeholder="z.B. ARC-L1"
              class="w-36"
            />
          </div>
          <span v-else class="text-(--ui-text-muted) text-sm">{{
            row.original.location ?? "–"
          }}</span>
        </template>

        <!-- Geändert -->
        <template #date_updated-cell="{ row }">
          <span class="text-(--ui-text-muted) text-xs whitespace-nowrap">{{
            formatRelativeDate(row.original.date_updated)
          }}</span>
        </template>

        <!-- Aktionen -->
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1 justify-end">
            <template v-if="editingId === row.original.id">
              <UButton
                @click="saveEdit"
                :loading="isSaving"
                icon="i-lucide-check"
                size="xs"
                color="success"
                variant="ghost"
              />
              <UButton
                @click="cancelEdit"
                icon="i-lucide-x"
                size="xs"
                color="neutral"
                variant="ghost"
              />
            </template>
            <template v-else-if="canEdit">
              <UButton
                @click="startEdit(row.original)"
                :disabled="!!editingId"
                icon="i-lucide-pencil"
                size="xs"
                variant="ghost"
                color="neutral"
              />
              <UButton
                @click="deleteRow(row.original.id)"
                :loading="deletingId === row.original.id"
                :disabled="!!editingId"
                icon="i-lucide-trash-2"
                size="xs"
                variant="ghost"
                color="error"
              />
            </template>
          </div>
        </template>
      </UTable>

      <div
        v-if="!pending && !filteredItems.length"
        class="py-16 text-center text-(--ui-text-muted)"
      >
        <UIcon
          name="i-lucide-package-open"
          class="size-10 mb-3 mx-auto opacity-30"
        />
        <p class="text-sm">
          {{
            hasActiveFilter
              ? "Keine Einträge für den aktuellen Filter."
              : "Noch keine Inventareinträge."
          }}
        </p>
      </div>
    </div>

    <!-- ─── New Item Modal ─────────────────────────────────────────────────── -->
    <UModal v-model:open="showNewModal" title="Neuen Eintrag erstellen">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Material" required>
            <UInput
              v-model="newDraft.material"
              placeholder="z.B. Laranite"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Kategorie">
              <USelect
                v-model="newDraft.category"
                :items="categoryItems"
                value-key="value"
                label-key="label"
                placeholder="Kategorie …"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Standort">
              <UInput
                v-model="newDraft.location"
                placeholder="z.B. ARC-L1"
                class="w-full"
              />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Menge">
              <UInput
                v-model="newDraft.quantity"
                type="number"
                placeholder="0"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Einheit">
              <USelect
                v-model="newDraft.quantity_unit"
                :items="['SCU', 'mSCU', 'Units']"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField label="Qualität (0–1000)">
            <UInput
              v-model="newDraft.quality"
              type="number"
              placeholder="1000"
              :min="0"
              :max="1000"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Notizen">
            <UTextarea
              v-model="newDraft.notes"
              placeholder="Optionale Anmerkungen …"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton @click="showNewModal = false" variant="ghost" color="neutral"
            >Abbrechen</UButton
          >
          <UButton
            @click="createNew"
            :loading="isCreating"
            :disabled="!newDraft.material"
            icon="i-lucide-plus"
          >
            Erstellen
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

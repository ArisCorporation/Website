<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { DirectusRole } from "~~/types";
import {
  buildActiveTableFilters,
  buildTableFilterOptions,
  type TableActiveFilter,
} from "../../../../../utils/table-filter";

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

const NEW_ROW_ID = "__new__";

const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);
const toast = useToast();
const AMSUiTableSortFilterHeader = resolveComponent(
  "AMSUiTableSortFilterHeader",
);

const canEdit = computed(() => {
  const al = (currentUser.value?.role as DirectusRole | undefined)
    ?.access_level;
  return (
    (currentUser.value as any)?.liv_editor === true ||
    (typeof al === "number" && al >= 5)
  );
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const {
  data: items,
  refresh,
  pending,
} = useLazyAsyncData<LivItem[]>(
  "lim-items",
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
const columnFilters = reactive({
  material: "",
  table_category: "",
  quantity: "",
  table_quality: "",
  table_location: "",
  updated: "",
});
type LivColumnFilterKey = keyof typeof columnFilters;
const livColumnFilterKeys = Object.keys(columnFilters) as LivColumnFilterKey[];

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

const columnFilterLabels: Record<LivColumnFilterKey, string> = {
  material: "Material",
  table_category: "Kategorie",
  quantity: "Menge",
  table_quality: "Qualität",
  table_location: "Standort",
  updated: "Geändert",
};

const uniqueLocationItems = computed(() =>
  [
    ...new Set(
      (items.value ?? []).map((i) => i.location).filter(Boolean) as string[],
    ),
  ]
    .sort()
    .map((l) => ({ label: l, value: l })),
);

const uniqueLocationStrings = computed(() =>
  uniqueLocationItems.value.map((l) => l.value),
);

const handleCreateLocation = (label: string) => {
  uniqueLocationItems.value.push({ label, value: label });
  editDraft.value.location = label;
};

const hasActiveFilter = computed(
  () =>
    !!searchQuery.value ||
    !!categoryFilter.value ||
    !!locationFilter.value ||
    !!qualityFilter.value ||
    livColumnFilterKeys.some((key) => !!columnFilters[key]),
);

function clearFilters() {
  searchQuery.value = "";
  categoryFilter.value = undefined;
  locationFilter.value = undefined;
  qualityFilter.value = undefined;

  for (const key of livColumnFilterKeys) {
    columnFilters[key] = "";
  }
}

function getQuantityFilterLabel(item: LivItem) {
  const quantity = item.quantity;

  if (quantity == null) return "";

  return `${quantity.toLocaleString("de-DE")} ${item.quantity_unit ?? "SCU"}`;
}

const columnFilterGetters: Record<LivColumnFilterKey, (item: LivItem) => string> = {
  material: (item) => item.material?.trim() ?? "",
  table_category: (item) => item.category ?? "",
  quantity: (item) => getQuantityFilterLabel(item),
  table_quality: (item) =>
    item.quality != null ? `${item.quality}` : "",
  table_location: (item) => item.location?.trim() ?? "",
  updated: (item) => formatRelativeDate(item.date_updated),
};

const columnFilterOptions = computed<
  Record<LivColumnFilterKey, { label: string; value: string }[]>
>(() => ({
  material: buildTableFilterOptions(items.value ?? [], (item: LivItem) => {
    const value = columnFilterGetters.material(item);
    return value ? { label: value, value } : null;
  }),
  table_category: buildTableFilterOptions(items.value ?? [], (item: LivItem) => {
    const value = columnFilterGetters.table_category(item);
    return value
      ? {
          label: getCategoryLabel(item.category),
          value,
        }
      : null;
  }),
  quantity: buildTableFilterOptions(items.value ?? [], (item: LivItem) => {
    const value = columnFilterGetters.quantity(item);
    return value ? { label: value, value } : null;
  }),
  table_quality: buildTableFilterOptions(items.value ?? [], (item: LivItem) => {
    const value = columnFilterGetters.table_quality(item);
    return value ? { label: value, value } : null;
  }),
  table_location: buildTableFilterOptions(items.value ?? [], (item: LivItem) => {
    const value = columnFilterGetters.table_location(item);
    return value ? { label: value, value } : null;
  }),
  updated: buildTableFilterOptions(items.value ?? [], (item: LivItem) => {
    const value = columnFilterGetters.updated(item);
    return value ? { label: value, value } : null;
  }),
}));

const activeFilters = computed<TableActiveFilter[]>(() => {
  const filters: TableActiveFilter[] = [];

  if (searchQuery.value.trim()) {
    filters.push({
      key: "search",
      label: "Suche",
      value: searchQuery.value,
      displayValue: searchQuery.value,
    });
  }

  if (categoryFilter.value) {
    filters.push({
      key: "category",
      label: "Kategorie",
      value: categoryFilter.value,
      displayValue:
        categoryItems.find((item) => item.value === categoryFilter.value)?.label ??
        categoryFilter.value,
    });
  }

  if (locationFilter.value) {
    filters.push({
      key: "location",
      label: "Standort",
      value: locationFilter.value,
      displayValue: locationFilter.value,
    });
  }

  if (qualityFilter.value) {
    filters.push({
      key: "quality",
      label: "Qualität",
      value: qualityFilter.value,
      displayValue:
        qualityItems.find((item) => item.value === qualityFilter.value)?.label ??
        qualityFilter.value,
    });
  }

  return [
    ...filters,
    ...buildActiveTableFilters({
      filters: columnFilters,
      labels: columnFilterLabels,
      options: columnFilterOptions.value,
    }),
  ];
});

function clearFilter(key: string) {
  if (key === "search") searchQuery.value = "";
  if (key === "category") categoryFilter.value = undefined;
  if (key === "location") locationFilter.value = undefined;
  if (key === "quality") qualityFilter.value = undefined;
  if (key in columnFilters) columnFilters[key as LivColumnFilterKey] = "";
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
  return result.filter((item) =>
    livColumnFilterKeys.every((key) => {
      const selectedValue = columnFilters[key];
      return !selectedValue || columnFilterGetters[key](item) === selectedValue;
    }),
  );
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
const pendingNewRow = ref(false);

function startEdit(item: LivItem) {
  editingId.value = item.id;
  editDraft.value = { ...item };
}

function cancelEdit() {
  if (editingId.value === NEW_ROW_ID) {
    pendingNewRow.value = false;
  }
  editingId.value = null;
  editDraft.value = {};
}

async function saveEdit() {
  if (!editingId.value) return;
  isSaving.value = true;
  try {
    if (editingId.value === NEW_ROW_ID) {
      if (!editDraft.value.material) {
        toast.add({ title: "Material ist erforderlich", color: "warning" });
        isSaving.value = false;
        return;
      }
      await useDirectus(
        createItem("liv" as any, {
          material: editDraft.value.material,
          quality: editDraft.value.quality
            ? Number(editDraft.value.quality)
            : undefined,
          quantity: editDraft.value.quantity
            ? Number(editDraft.value.quantity)
            : undefined,
          quantity_unit: editDraft.value.quantity_unit ?? "SCU",
          category: editDraft.value.category,
          location: editDraft.value.location,
          notes: editDraft.value.notes,
        }),
      );
      toast.add({ title: "Erstellt", color: "success", icon: "i-lucide-plus" });
      pendingNewRow.value = false;
    } else {
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
    }
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

function addNewRow() {
  if (!canEdit.value || pendingNewRow.value) return;
  pendingNewRow.value = true;
  editingId.value = NEW_ROW_ID;
  editDraft.value = { quantity_unit: "SCU" };
}

// ─── Table data (new row always at top) ───────────────────────────────────────

const tableData = computed<LivItem[]>(() => {
  if (pendingNewRow.value) {
    return [{ id: NEW_ROW_ID } as LivItem, ...filteredItems.value];
  }
  return filteredItems.value;
});

// ─── Sorting ──────────────────────────────────────────────────────────────────

const sorting = ref<{ id: string; desc: boolean }[]>([]);

function sortableHeader(key: LivColumnFilterKey, label: string) {
  return ({ column }: { column: any }) =>
    h(AMSUiTableSortFilterHeader, {
      label,
      column,
      items: columnFilterOptions.value[key],
      modelValue: columnFilters[key],
      "onUpdate:modelValue": (value: string) => {
        columnFilters[key] = value;
      },
    });
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
  {
    accessorKey: "material",
    header: sortableHeader("material", "Material"),
    enableSorting: true,
  },
  {
    accessorKey: "category",
    header: sortableHeader("table_category", "Kategorie"),
    enableSorting: true,
  },
  {
    accessorKey: "quantity",
    header: sortableHeader("quantity", "Menge"),
    enableSorting: true,
  },
  {
    accessorKey: "quality",
    header: sortableHeader("table_quality", "Qualität"),
    enableSorting: true,
  },
  {
    accessorKey: "location",
    header: sortableHeader("table_location", "Standort"),
    enableSorting: true,
  },
  {
    accessorKey: "date_updated",
    header: sortableHeader("updated", "Geändert"),
    enableSorting: true,
  },
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
      title="Logistics Inventory Management"
      description="Lagerbestand &amp; Ressourcenverwaltung der Logistics-Abteilung."
    >
      <UButton
        v-if="canEdit"
        @click="addNewRow"
        :disabled="!!pendingNewRow"
        icon="i-lucide-plus"
        size="sm"
      >
        Neu
      </UButton>
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
    <AMSUiTableShell
      variant="panel"
      class="mb-8"
      :filters="activeFilters"
      @clear="clearFilter"
      @clear-all="clearFilters"
    >
      <div v-if="pending" class="py-12 flex justify-center">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-6 text-(--ui-primary) animate-spin"
        />
      </div>
      <UTable
        v-else
        v-model:sorting="sorting"
        :columns="columns"
        :data="tableData"
      >
        <!-- Material -->
        <template #material-cell="{ row }">
          <div v-if="editingId === row.original.id">
            <UInput
              v-model="editDraft.material"
              size="sm"
              placeholder="Material *"
              class="w-36"
              autofocus
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
              :model-value="editDraft.category ?? undefined"
              :items="categoryItems"
              value-key="value"
              label-key="label"
              placeholder="Kategorie"
              size="sm"
              class="w-36"
              @update:model-value="
                (value) => {
                  editDraft.category = value as LivItem['category'];
                }
              "
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
              :model-value="editDraft.quantity_unit ?? undefined"
              :items="['SCU', 'mSCU', 'Units']"
              size="sm"
              class="w-24"
              @update:model-value="
                (value) => {
                  editDraft.quantity_unit = value as LivItem['quantity_unit'];
                }
              "
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
            <USelectMenu
              :model-value="editDraft.location ?? undefined"
              :items="uniqueLocationStrings"
              autocomplete
              create-item
              @create="handleCreateLocation"
              size="sm"
              placeholder="z.B. ARC-L1"
              class="w-36"
              @update:model-value="
                (value) => {
                  editDraft.location = value as LivItem['location'];
                }
              "
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
        v-if="!pending && !filteredItems.length && !pendingNewRow"
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
    </AMSUiTableShell>
  </div>
</template>

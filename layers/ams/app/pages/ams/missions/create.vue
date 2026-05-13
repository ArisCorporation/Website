<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { DateValue } from "@internationalized/date";
import type {
  DirectusField,
  MissionPlannerForm,
  MissionPlannerPositionDraft as PositionDraft,
  MissionPlannerPositionType as PositionType,
  MissionPlannerShipDraft as ShipDraft,
  MissionPlannerTeamDraft as TeamDraft,
} from "~~/types";
import { MISSION_PLANNER_POSITION_TYPE_ORDER } from "~~/types";
import { parseDate } from "@internationalized/date";
import { createItem, deleteItem, readField, readItems, updateItem } from "@directus/sdk";
import {
  STANDARD_MISSION_ROLE_OPTIONS,
  getMissionRoleOption,
  getMissionRoleOptions,
  getMissionRoleSort,
  getMissionRoleSummary,
  shipHasMissionRoles,
  generatePositionsFromShipRoles,
} from "~~/app/utils/ams-mission-roles";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const { currentUserId, currentUserAL, isAuthLoading, currentUser } = storeToRefs(authStore);

const wizardCookie = useCookie<boolean>("ams:mission_planner_wizard");
const currentStep = ref(0);

function toggleWizard() {
  wizardCookie.value = wizardCookie.value !== true;
  currentStep.value = 0;
}

const editId = computed(() => route.query.edit as string | undefined);
const isEditing = computed(() => !!editId.value);

const {
  data: fleet,
  pending: fleetPending,
  refresh: refreshFleet,
} = await useFetchAMSFleet();
const {
  data: departments,
  pending: departmentsPending,
  refresh: refreshDepartments,
} = await useSimpleDepartments();
const {
  data: teamDepartmentFieldMeta,
  refresh: refreshTeamDepartmentFieldMeta,
} = await useAsyncData<DirectusField | null>(
  "ams:mission-team-department-field",
  async () => {
    try {
      return (await useDirectus(
        readField("ams_mission_teams" as any, "department"),
      )) as unknown as DirectusField ?? null;
    } catch (error) {
      console.warn(
        "Unable to load Directus meta for ams_mission_teams.department",
        error,
      );
      return null;
    }
  },
  {
    default: () => null,
    server: false,
  },
);

const TYPE_OPTIONS = [
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
  { label: "Entwurf", value: "draft" },
  { label: "Aktiv (Anmeldungen offen)", value: "active" },
  { label: "Abgebrochen", value: "cancelled" },
  { label: "Abgeschlossen", value: "completed" },
];

const POSITION_TYPE_ORDER = [...MISSION_PLANNER_POSITION_TYPE_ORDER];
const POSITION_TYPE_LABELS: Record<PositionType, string> = {
  primary: "Primäre Funktionen",
  secondary: "Sekundäre Funktionen",
};
const POSITION_TYPE_BADGE_LABELS: Record<PositionType, string> = {
  primary: "Primär",
  secondary: "Sekundär",
};

const plannerSteps = [
  {
    title: "Basisdaten",
    icon: "i-lucide-file-text",
  },
  {
    title: "Termin & Details",
    icon: "i-lucide-calendar-clock",
  },
  {
    title: "Teams & Schiffe",
    icon: "i-lucide-layers",
  },
  {
    title: "Überblick & Speichern",
    icon: "i-lucide-save",
  },
];

const plannerModeDropdownItems = ref<DropdownMenuItem[]>([]);

const form = reactive<MissionPlannerForm>({
  title: "",
  mission_type: "mining",
  status: "draft",
  description: "",
  duration_hours: "",
  location: "",
  start_location: "",
});

const plannedCalendarDate = ref<DateValue | undefined>();
const plannedTime = ref("");
const plannedTimeDefaultValue = "00:00";

type DirectusFieldTranslation = {
  language?: string;
  translation?: string;
};

const plannedCalendarUi = {
  root: "space-y-3",
  header:
    "rounded-xl border border-(--ui-primary)/12 bg-linear-to-r from-(--ui-bg-muted)/85 via-(--ui-bg)/70 to-(--ui-bg-muted)/85 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm",
  heading:
    "text-sm font-semibold uppercase tracking-[0.28em] text-(--ui-text-highlighted)",
  grid: "w-full border-collapse select-none focus:outline-none",
  gridWeekDaysRow: "mb-1 grid w-full grid-cols-7",
  gridBody: "grid gap-y-1",
  gridRow: "grid w-full grid-cols-7",
  headCell:
    "flex h-8 w-full items-center justify-center text-center text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-(--ui-text-muted)/70",
  cell: "relative flex w-full items-center justify-center text-center",
  cellTrigger:
    "mx-auto my-0.5 flex h-8 w-8 min-h-8 min-w-8 shrink-0 aspect-square items-center justify-center rounded-full border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 p-0 text-xs leading-none font-semibold tracking-tight text-(--ui-text-muted) transition-all duration-200 sm:h-9 sm:w-9 sm:min-h-9 sm:min-w-9 sm:text-sm hover:border-(--ui-primary)/28 hover:bg-(--ui-primary)/10 hover:text-(--ui-text-highlighted) data-today:border-(--ui-primary)/35 data-today:bg-(--ui-primary)/8 data-today:text-(--ui-text-highlighted) data-[selected]:border-(--ui-primary) data-[selected]:bg-(--ui-primary)/18 data-[selected]:text-(--ui-text-highlighted) data-[selected]:shadow-[0_0_0_1px_rgba(0,255,232,0.14),0_0_14px_rgba(0,255,232,0.12)] data-[outside-view]:opacity-35 focus-visible:outline-none focus-visible:ring-0",
};

const teamDepartmentFieldTranslations = computed<DirectusFieldTranslation[]>(
  () => {
    const rawTranslations = teamDepartmentFieldMeta.value?.translations;

    if (Array.isArray(rawTranslations)) {
      return rawTranslations;
    }

    if (typeof rawTranslations === "string") {
      try {
        const parsedTranslations = JSON.parse(rawTranslations);
        return Array.isArray(parsedTranslations) ? parsedTranslations : [];
      } catch {
        return [];
      }
    }

    return [];
  },
);

const teamDepartmentFieldLabel = computed(() => {
  const translations = teamDepartmentFieldTranslations.value;
  const preferredTranslation =
    translations.find((translation) => translation.language === "de-DE") ??
    translations.find((translation) => translation.language === "en-US") ??
    translations[0];

  return (
    preferredTranslation?.translation?.trim() ||
    teamDepartmentFieldMeta.value?.field?.trim() ||
    "Abteilung"
  );
});

const teamDepartmentFieldHint = computed(
  () => teamDepartmentFieldMeta.value?.note?.trim() || undefined,
);

const teamDepartmentFieldPlaceholder = computed(
  () => `${teamDepartmentFieldLabel.value} wählen`,
);

const plannedDateValue = computed(() => {
  if (!plannedCalendarDate.value) {
    return "";
  }

  const time = plannedTime.value || plannedTimeDefaultValue;
  return `${plannedCalendarDate.value.toString()}T${time}`;
});

const plannedDateSummary = computed(() => {
  if (!plannedCalendarDate.value) {
    return "Kein Termin gesetzt";
  }

  const date = new Date(`${plannedCalendarDate.value.toString()}T00:00:00`);
  const dateLabel = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

  return `${dateLabel} • ${plannedTime.value || plannedTimeDefaultValue} Uhr`;
});

function setPlannedDate(value?: string | null) {
  const normalizedValue = value?.slice(0, 16) ?? "";

  if (!normalizedValue) {
    plannedCalendarDate.value = undefined;
    plannedTime.value = "";
    return;
  }

  try {
    plannedCalendarDate.value = parseDate(normalizedValue.slice(0, 10));
    plannedTime.value =
      normalizedValue.slice(11, 16) || plannedTimeDefaultValue;
  } catch {
    plannedCalendarDate.value = undefined;
    plannedTime.value = "";
  }
}

function normalizePositionType(value?: string | null): PositionType {
  return value === "secondary" ? "secondary" : "primary";
}

function formatDurationHours(value?: number | null) {
  const durationMinutes = Number(value ?? 0);

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return "";
  }

  const hoursValue = durationMinutes / 60;
  const formatted = Number(hoursValue.toFixed(2)).toString();

  return formatted.replace(".", ",");
}

function parseDurationHours(value?: string | null) {
  const normalizedValue = value?.trim().replace(",", ".") ?? "";

  if (!normalizedValue) {
    return null;
  }

  const parsedHours = Number(normalizedValue);

  if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
    return null;
  }

  return Math.round(parsedHours * 60);
}

const teams = ref<TeamDraft[]>([]);
const cancelTo = computed(() =>
  isEditing.value && editId.value ? `/ams/missions/${editId.value}` : "/ams/missions",
);

const originalIds = ref<{
  teams: string[];
  ships: string[];
  positions: string[];
}>({
  teams: [],
  ships: [],
  positions: [],
});
const editMissionCreatorId = ref<string | null>(null);
const originalPlannedDate = ref<string | null>(null);
const originalStatus = ref<string>('');
const editMissionLoaded = ref(!isEditing.value);
const unauthorizedEditHandled = ref(false);

if (editId.value) {
  const { data: existing } = await useFetchAMSMission(editId.value);
  if (existing.value) {
    editMissionCreatorId.value = existing.value.user_created?.id ?? null;
    originalPlannedDate.value = existing.value.planned_date?.slice(0, 16) ?? null;
    originalStatus.value = existing.value.status;
    form.title = existing.value.title;
    form.mission_type = existing.value.mission_type;
    form.status = existing.value.status;
    setPlannedDate(existing.value.planned_date);
    form.description = existing.value.description ?? "";
    form.duration_hours = formatDurationHours(
      Number((existing.value as any).duration ?? 0),
    );
    form.location = (existing.value as any).location ?? "";
    form.start_location = (existing.value as any).start_location ?? "";
    teams.value = (existing.value.teams ?? []).map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? "",
      department:
        typeof t.department === "object"
          ? (t.department?.id ?? null)
          : (t.department ?? null),
      ships: (t.ships ?? []).map((s: any) => ({
        id: s.id,
        hangar_id:
          (fleet.value ?? []).find(
            (h: any) =>
              h.id ===
              (typeof s.hangar_id === "object" ? s.hangar_id?.id : s.hangar_id),
          ) ?? null,
        positions: (s.positions ?? []).map((p: any) => ({
          id: p.id,
          sort: p.sort ?? null,
          position_type: normalizePositionType(p.position_type),
          role: p.role,
          role_description: p.role_description ?? null,
          assigned_user: p.assigned_user ?? null,
          status: p.status,
        })),
      })),
    }));

    originalIds.value = {
      teams: teams.value.map((t) => t.id).filter(Boolean) as string[],
      ships: teams.value
        .flatMap((t) => t.ships)
        .map((s) => s.id)
        .filter(Boolean) as string[],
      positions: teams.value
        .flatMap((t) => t.ships)
        .flatMap((s) => s.positions)
        .map((p) => p.id)
        .filter(Boolean) as string[],
    };
  }

  editMissionLoaded.value = true;
}

const fleetOptions = computed(() =>
  [...(fleet.value ?? [])]
    .sort((a: any, b: any) => {
      const aLabel = a.ship?.hull?.name ?? a.ship?.name ?? "";
      const bLabel = b.ship?.hull?.name ?? b.ship?.name ?? "";
      return aLabel.localeCompare(bLabel);
    })
    .map((h: any) => {
      const hullLabel = h.ship?.hull
        ? `${h.ship.hull.manufacturer?.name ? h.ship.hull.manufacturer.name + " " : ""}${h.ship.hull.name ?? ""}`.trim()
        : (h.ship?.name ?? "");
      const ownerName = h.user
        ? [h.user.first_name, h.user.last_name].filter(Boolean).join(" ")
        : null;
      return {
        label: h.name ? `${h.ship?.name ?? ""} - ${h.name}` : h.ship?.name,
        description: [hullLabel, ownerName].filter(Boolean).join(" • "),
        value: h,
        id: h.id,
      };
    }),
);

const departmentSelectItems = computed<any[]>(() => departments.value ?? []);

const canManageExistingMission = computed(() => {
  if (!isEditing.value) return true;

  const accessLevel = Number(currentUserAL.value ?? 0);
  return (
    accessLevel >= 3 ||
    (!!currentUserId.value &&
      editMissionCreatorId.value === currentUserId.value)
  );
});

async function refreshMissionPlannerSources() {
  if (isAuthLoading.value || !currentUserId.value) return;

  const tasks: Promise<unknown>[] = [];

  if (!fleet.value?.length) tasks.push(refreshFleet());
  if (!departments.value?.length) tasks.push(refreshDepartments());
  if (!teamDepartmentFieldMeta.value)
    tasks.push(refreshTeamDepartmentFieldMeta());

  if (tasks.length) {
    await Promise.all(tasks);
  }
}

onMounted(() => {
  refreshMissionPlannerSources();
});

watch(
  [isAuthLoading, currentUserId],
  ([loading, userId]) => {
    if (!loading && userId) {
      refreshMissionPlannerSources();
    }
  },
  { immediate: true },
);

watch(
  [isAuthLoading, editMissionLoaded, canManageExistingMission],
  ([loading, missionLoaded, canManage]) => {
    if (
      !isEditing.value ||
      loading ||
      !missionLoaded ||
      canManage ||
      unauthorizedEditHandled.value
    ) {
      return;
    }

    unauthorizedEditHandled.value = true;
    toast.add({
      title: "Kein Zugriff",
      description:
        "Diese Mission kann nur vom Mission Planner oder der Verwaltung bearbeitet werden.",
      color: "error",
      icon: "i-lucide-ban",
    });
    router.replace("/ams/missions");
  },
  { immediate: true },
);

watch(
  teams,
  (draftTeams) => {
    for (const team of draftTeams) {
      for (const ship of team.ships) {
        normalizeShipPositionRoles(ship);
      }
    }
  },
  { deep: true },
);

function addTeam() {
  teams.value.push({
    name: `Team ${teams.value.length + 1}`,
    description: "",
    department: null,
    ships: [],
  });
}

function removeTeam(i: number) {
  teams.value.splice(i, 1);
}

function addShip(team: TeamDraft) {
  team.ships.push({ hangar_id: null, positions: [] });
}

function removeShip(team: TeamDraft, i: number) {
  team.ships.splice(i, 1);
}

function getShipCrewLimit(ship: ShipDraft) {
  const rawCrew = (ship.hangar_id as any)?.ship?.stats?.crew;

  if (typeof rawCrew === "number" && Number.isFinite(rawCrew) && rawCrew > 0) {
    return rawCrew;
  }

  if (typeof rawCrew === "string") {
    const parsedCrew = Number.parseInt(rawCrew, 10);
    return Number.isFinite(parsedCrew) && parsedCrew > 0 ? parsedCrew : null;
  }

  return null;
}

function getShipPositionsByType(ship: ShipDraft, positionType: PositionType) {
  return ship.positions.filter(
    (position) =>
      normalizePositionType(position.position_type) === positionType,
  );
}

function getShipRoleSource(ship: ShipDraft) {
  return (ship.hangar_id as any)?.ship ?? null;
}

function getShipRoleOptions(ship: ShipDraft, positionType: PositionType) {
  return getMissionRoleOptions(
    getShipRoleSource(ship),
    positionType,
  ).map((role) => ({
    label: role.label,
    value: role.value,
  }));
}

function getShipRoleOption(
  ship: ShipDraft,
  role: string | null | undefined,
  positionType: PositionType,
) {
  return getMissionRoleOption(role, getShipRoleSource(ship), positionType);
}

function getShipDefaultRole(ship: ShipDraft, positionType: PositionType) {
  return (
    getShipRoleOptions(ship, positionType)[0]?.value ??
    STANDARD_MISSION_ROLE_OPTIONS[0]?.value ??
    "pilot"
  );
}

function getShipRoleSummary(ship: ShipDraft, positionType: PositionType) {
  return getMissionRoleSummary(getShipRoleSource(ship), positionType);
}

function isShipPositionTypeLocked(ship: ShipDraft, positionType: PositionType): boolean {
  return shipHasMissionRoles(getShipRoleSource(ship), positionType);
}

function onShipHangarChange(ship: ShipDraft) {
  const source = getShipRoleSource(ship);
  const generated = generatePositionsFromShipRoles(source);
  ship.positions = generated.map((p) => ({
    sort: p.sort ?? null,
    position_type: p.position_type,
    role: p.role,
    role_description: p.description ?? null,
    assigned_user: null,
    status: "open",
  }));
}

function normalizeShipPositionRoles(ship: ShipDraft) {
  for (const position of ship.positions) {
    const positionType = normalizePositionType(position.position_type);

    if (isShipPositionTypeLocked(ship, positionType)) continue;

    const allowedRoleValues = getShipRoleOptions(ship, positionType).map(
      (role) => role.value,
    );

    if (!allowedRoleValues.length) {
      continue;
    }

    const fallbackRole = getShipDefaultRole(ship, positionType);
    if (!allowedRoleValues.includes(position.role)) {
      position.role = fallbackRole;
    }
  }
}

function getShipPositionSort(ship: ShipDraft, position: PositionDraft) {
  if (typeof position.sort === "number") {
    return position.sort;
  }

  return getMissionRoleSort(
    position.role,
    getShipRoleSource(ship),
    normalizePositionType(position.position_type),
  );
}

function getShipPositionCount(ship: ShipDraft, positionType?: PositionType) {
  if (!positionType) {
    return ship.positions.length;
  }

  return getShipPositionsByType(ship, positionType).length;
}

function getShipLabel(ship: ShipDraft) {
  return (
    (ship.hangar_id as any)?.name ||
    (ship.hangar_id as any)?.ship?.name ||
    "dieses Schiff"
  );
}

function isShipOverCrewLimit(ship: ShipDraft, positionType: PositionType) {
  const crewLimit = getShipCrewLimit(ship);
  return (
    crewLimit !== null && getShipPositionCount(ship, positionType) > crewLimit
  );
}

function getShipPositionSummary(ship: ShipDraft, positionType: PositionType) {
  const crewLimit = getShipCrewLimit(ship);
  const positionCount = getShipPositionCount(ship, positionType);

  if (crewLimit === null) {
    return `${positionCount} Positionen`;
  }

  return `${positionCount}/${crewLimit} Positionen`;
}

function getShipCrewLimitHint(ship: ShipDraft, positionType: PositionType) {
  const crewLimit = getShipCrewLimit(ship);

  if (crewLimit === null) {
    return "Kein Crew-Limit hinterlegt";
  }

  const remainingSlots = crewLimit - getShipPositionCount(ship, positionType);

  if (remainingSlots < 0) {
    return `Max-Crew um ${Math.abs(remainingSlots)} Position${Math.abs(remainingSlots) === 1 ? "" : "en"} überschritten`;
  }

  if (remainingSlots === 0) {
    return "Maximale Crew erreicht";
  }

  return `${remainingSlots} Position${remainingSlots === 1 ? "" : "en"} frei`;
}

function addPosition(ship: ShipDraft, positionType: PositionType) {
  ship.positions.push({
    sort: null,
    position_type: positionType,
    role: getShipDefaultRole(ship, positionType),
    assigned_user: null,
    status: "open",
  });
}

function removePosition(ship: ShipDraft, position: PositionDraft) {
  const index = ship.positions.indexOf(position);
  if (index === -1) return;
  ship.positions.splice(index, 1);
}

function getAssignedUserId(pos: PositionDraft): string | null {
  if (!pos.assigned_user) return null;
  return typeof pos.assigned_user === "object"
    ? (pos.assigned_user as any).id
    : pos.assigned_user;
}

function findDraftPairedSecondary(
  ship: ShipDraft,
  pos: PositionDraft,
): PositionDraft | null {
  if (normalizePositionType(pos.position_type) !== "primary") return null;

  const secondaries = ship.positions.filter(
    (p) => normalizePositionType(p.position_type) === "secondary",
  );
  const primarySort = getShipPositionSort(ship, pos);

  if (primarySort != null) {
    return (
      secondaries.find((s) => getShipPositionSort(ship, s) === primarySort) ??
      null
    );
  }

  const primaries = ship.positions.filter(
    (p) => normalizePositionType(p.position_type) === "primary",
  );
  const idx = primaries.indexOf(pos);
  return idx !== -1 ? (secondaries[idx] ?? null) : null;
}

function getCurrentUserPositionOnShip(
  ship: ShipDraft,
  positionType: PositionType,
): PositionDraft | null {
  const userId = currentUserId.value;
  if (!userId) return null;
  return (
    ship.positions.find(
      (p) =>
        getAssignedUserId(p) === userId &&
        normalizePositionType(p.position_type) === positionType,
    ) ?? null
  );
}

const replaceConfirmOpen = ref(false);
const replaceConfirmTarget = ref<{ ship: ShipDraft; pos: PositionDraft } | null>(
  null,
);

function tryAssignSelf(ship: ShipDraft, pos: PositionDraft) {
  const existingId = getAssignedUserId(pos);
  if (existingId && existingId !== currentUserId.value) {
    replaceConfirmTarget.value = { ship, pos };
    replaceConfirmOpen.value = true;
    return;
  }
  assignSelf(ship, pos);
}

function assignSelf(ship: ShipDraft, pos: PositionDraft) {
  const user = currentUser.value;
  if (!user) return;

  const posType = normalizePositionType(pos.position_type);

  // Unassign self from another position of the same type on this ship
  const existingOnShip = getCurrentUserPositionOnShip(ship, posType);
  if (existingOnShip && existingOnShip !== pos) {
    existingOnShip.assigned_user = null;
    if (posType === "primary") {
      const existingPaired = findDraftPairedSecondary(ship, existingOnShip);
      if (
        existingPaired &&
        getAssignedUserId(existingPaired) === currentUserId.value
      ) {
        existingPaired.assigned_user = null;
      }
    }
  }

  pos.assigned_user = user;

  // Auto-pair secondary
  if (posType === "primary") {
    const paired = findDraftPairedSecondary(ship, pos);
    if (paired && !getAssignedUserId(paired)) {
      paired.assigned_user = user;
    }
  }
}

function unassignSelf(ship: ShipDraft, pos: PositionDraft) {
  pos.assigned_user = null;
  if (normalizePositionType(pos.position_type) === "primary") {
    const paired = findDraftPairedSecondary(ship, pos);
    if (paired && getAssignedUserId(paired) === currentUserId.value) {
      paired.assigned_user = null;
    }
  }
}

function confirmReplaceSelf() {
  if (!replaceConfirmTarget.value) return;
  assignSelf(replaceConfirmTarget.value.ship, replaceConfirmTarget.value.pos);
  replaceConfirmOpen.value = false;
  replaceConfirmTarget.value = null;
}

function getReplaceConfirmName(): string {
  if (!replaceConfirmTarget.value) return "";
  const assigned = replaceConfirmTarget.value.pos.assigned_user;
  if (!assigned) return "";
  return typeof assigned === "object" ? getUserLabel(assigned) : assigned;
}

const loading = ref(false);

const allDraftShips = computed(() => teams.value.flatMap((team) => team.ships));

const totalDraftCrewLimit = computed(() =>
  allDraftShips.value.reduce((total, ship) => {
    const crewLimit = getShipCrewLimit(ship);
    return crewLimit === null ? total : total + crewLimit;
  }, 0),
);

const hasUnlimitedDraftCrew = computed(() =>
  allDraftShips.value.some((ship) => getShipCrewLimit(ship) === null),
);

const shipsOverCrewLimit = computed(() =>
  teams.value.flatMap((team) =>
    team.ships.flatMap((ship) =>
      POSITION_TYPE_ORDER.filter((positionType) =>
        isShipOverCrewLimit(ship, positionType),
      ).map((positionType) => ({ ship, positionType })),
    ),
  ),
);

function getTotalDraftPositionCount(positionType: PositionType) {
  return allDraftShips.value.reduce(
    (total, ship) => total + getShipPositionCount(ship, positionType),
    0,
  );
}

function getTotalDraftPositionSummary(positionType: PositionType) {
  const positionCount = getTotalDraftPositionCount(positionType);

  if (!allDraftShips.value.length) {
    return "0 Positionen";
  }

  if (hasUnlimitedDraftCrew.value) {
    return `${positionCount} Positionen`;
  }

  return `${positionCount}/${totalDraftCrewLimit.value} Positionen`;
}

const totalDraftPrimarySummary = computed(() =>
  getTotalDraftPositionSummary("primary"),
);
const totalDraftSecondarySummary = computed(() =>
  getTotalDraftPositionSummary("secondary"),
);

const totalDraftPositionsHint = computed(() => {
  if (!allDraftShips.value.length) {
    return "Noch keine Schiffe hinzugefügt.";
  }

  if (shipsOverCrewLimit.value.length) {
    return "Mindestens ein Schiff überschreitet aktuell die hinterlegte Max-Crew.";
  }

  if (hasUnlimitedDraftCrew.value) {
    return "Schiffe ohne hinterlegte Max-Crew bleiben unbegrenzt.";
  }

  return "Basierend auf der hinterlegten Max-Crew der gewählten Schiffe.";
});

const assignedUserTypeConflict = computed(() => {
  const seenAssignments = new Map<string, Set<PositionType>>();

  for (const ship of allDraftShips.value) {
    for (const position of ship.positions) {
      const assignedUserId =
        position.assigned_user && typeof position.assigned_user === "object"
          ? position.assigned_user.id
          : (position.assigned_user ?? null);

      if (!assignedUserId) continue;

      const positionType = normalizePositionType(position.position_type);
      const userAssignments =
        seenAssignments.get(assignedUserId) ?? new Set<PositionType>();

      if (userAssignments.has(positionType)) {
        return {
          positionType,
          userLabel: getUserLabel(position.assigned_user),
        };
      }

      userAssignments.add(positionType);
      seenAssignments.set(assignedUserId, userAssignments);
    }
  }

  return null;
});

const missionTypeLabel = computed(
  () =>
    TYPE_OPTIONS.find((option) => option.value === form.mission_type)?.label ??
    "Nicht gesetzt",
);

const statusLabel = computed(
  () =>
    STATUS_OPTIONS.find((option) => option.value === form.status)?.label ??
    "Nicht gesetzt",
);

const parsedDurationMinutes = computed(() =>
  parseDurationHours(form.duration_hours),
);

const isDetailsStepInvalid = computed(() => !form.title.trim());

const isPlanningStepInvalid = computed(
  () => parsedDurationMinutes.value === null,
);

const hasIncompleteTeams = computed(() =>
  teams.value.some((team) => team.name.trim() === ""),
);

const hasUnselectedShips = computed(() =>
  teams.value.some((team) =>
    team.ships.some((ship) => !ship.hangar_id),
  ),
);

const isTeamsStepInvalid = computed(
  () =>
    hasIncompleteTeams.value ||
    hasUnselectedShips.value ||
    assignedUserTypeConflict.value !== null,
);

const nextDisabled = computed(() => {
  switch (currentStep.value) {
    case 0:
      return isDetailsStepInvalid.value;
    case 1:
      return isPlanningStepInvalid.value;
    case 2:
      return isTeamsStepInvalid.value;
    default:
      return true;
  }
});

function goToPreviousStep() {
  if (currentStep.value > 0) {
    currentStep.value -= 1;
  }
}

function goToNextStep() {
  if (currentStep.value >= plannerSteps.length - 1 || nextDisabled.value) {
    return;
  }

  currentStep.value += 1;
}

async function save() {
  if (!form.title.trim()) {
    toast.add({
      title: "Titel erforderlich",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
    return;
  }

  if (isEditing.value && !canManageExistingMission.value) {
    toast.add({
      title: "Kein Zugriff",
      description: "Diese Mission kann nicht von dir bearbeitet werden.",
      color: "error",
      icon: "i-lucide-ban",
    });
    return;
  }

  if (assignedUserTypeConflict.value) {
    toast.add({
      title: "Doppelte Rollenart",
      description: `${assignedUserTypeConflict.value.userLabel} ist mehrfach auf ${POSITION_TYPE_BADGE_LABELS[assignedUserTypeConflict.value.positionType]}-Positionen gesetzt.`,
      color: "error",
      icon: "i-lucide-users",
    });
    return;
  }

  const durationMinutes = parsedDurationMinutes.value;

  if (durationMinutes === null) {
    toast.add({
      title: "Dauer erforderlich",
      description:
        "Bitte gib eine voraussichtliche Dauer in Stunden an, z. B. 1,5.",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
    return;
  }

  loading.value = true;
  try {
    const missionPayload = {
      title: form.title,
      mission_type: form.mission_type,
      status: form.status,
      planned_date: plannedDateValue.value || null,
      description: form.description || null,
      duration: durationMinutes,
      location: form.location || null,
      start_location: form.start_location || null,
    };

    let missionId: string;

    if (isEditing.value && editId.value) {
      await useDirectus(
        updateItem("ams_missions" as any, editId.value, missionPayload),
      );
      missionId = editId.value;
    } else {
      const result = (await useDirectus(
        createItem("ams_missions" as any, missionPayload),
      )) as any;
      missionId = result.id;
    }

    const currentTeamIds: string[] = [];
    const currentShipIds: string[] = [];
    const currentPositionIds: string[] = [];
    const positionRegistrationPlan: Array<{ positionId: string; assignedUserId: string; teamId: string }> = [];

    for (const team of teams.value) {
      let teamId: string;
      const departmentId =
        team.department && typeof team.department === "object"
          ? team.department.id
          : (team.department ?? null);

      if (team.id) {
        await useDirectus(
          updateItem("ams_mission_teams" as any, team.id, {
            name: team.name,
            description: team.description || null,
            department: departmentId,
          }),
        );
        teamId = team.id;
        currentTeamIds.push(teamId);
      } else {
        const t = (await useDirectus(
          createItem("ams_mission_teams" as any, {
            mission: missionId,
            name: team.name,
            description: team.description || null,
            department: departmentId,
          }),
        )) as any;
        teamId = t.id;
        currentTeamIds.push(teamId);
      }

      const shipPromises = team.ships
        .filter((ship) => !!ship.hangar_id)
        .map(async (ship) => {
          const hangarId =
            typeof ship.hangar_id === "object"
              ? (ship.hangar_id as any).id
              : ship.hangar_id;
          let shipId: string;

          if (ship.id) {
            await useDirectus(
              updateItem("ams_mission_team_ships" as any, ship.id, {
                hangar_id: hangarId,
              }),
            );
            shipId = ship.id;
            currentShipIds.push(shipId);
          } else {
            const s = (await useDirectus(
              createItem("ams_mission_team_ships" as any, {
                team: teamId,
                hangar_id: hangarId,
              }),
            )) as any;
            shipId = s.id;
            currentShipIds.push(shipId);
          }

          await Promise.all(
            ship.positions.map(async (pos) => {
              const assignedUserId =
                pos.assigned_user && typeof pos.assigned_user === "object"
                  ? pos.assigned_user.id
                  : (pos.assigned_user ?? null);

              const posPayload = {
                sort: getShipPositionSort(ship, pos),
                position_type: normalizePositionType(pos.position_type),
                role: pos.role,
                role_description:
                  pos.role_description ??
                  getShipRoleOption(
                    ship,
                    pos.role,
                    normalizePositionType(pos.position_type),
                  )?.description ??
                  null,
                assigned_user: assignedUserId,
                status: assignedUserId ? "filled" : "open",
              };

              if (pos.id) {
                await useDirectus(
                  updateItem("ams_mission_positions" as any, pos.id, posPayload),
                );
                currentPositionIds.push(pos.id);
                if (assignedUserId) {
                  positionRegistrationPlan.push({ positionId: pos.id, assignedUserId, teamId });
                }
              } else {
                const newPos = (await useDirectus(
                  createItem("ams_mission_positions" as any, {
                    team_ship: shipId,
                    ...posPayload,
                  }),
                )) as any;
                if (assignedUserId) {
                  positionRegistrationPlan.push({ positionId: newPos.id, assignedUserId, teamId });
                }
              }
            }),
          );
        });

      await Promise.all(shipPromises);
    }

    // Sync position registrations to match planner-assigned positions
    try {
      const existingPositionRegs = (await useDirectus(
        readItems("ams_mission_registrations" as any, {
          filter: { mission: { _eq: missionId }, type: { _eq: "position" } } as any,
          fields: ["id", "position", "user"],
          limit: -1,
        }),
      )) as Array<{ id: string; position: any; user: any }>;

      const getPosId = (v: any): string | null => (typeof v === "object" ? v?.id : v) ?? null;
      const getUsrId = (v: any): string | null => (typeof v === "object" ? v?.id : v) ?? null;
      const currentPositionIdSet = new Set(positionRegistrationPlan.map((p) => p.positionId));
      const assignedMap = new Map(positionRegistrationPlan.map((p) => [p.positionId, p]));

      await Promise.all([
        // Create missing registrations for assigned positions
        ...positionRegistrationPlan
          .filter(
            (plan) =>
              !existingPositionRegs.some(
                (r) => getPosId(r.position) === plan.positionId && getUsrId(r.user) === plan.assignedUserId,
              ),
          )
          .map((plan) =>
            useDirectus(
              createItem("ams_mission_registrations" as any, {
                mission: missionId,
                user: plan.assignedUserId,
                type: "position",
                team: plan.teamId,
                position: plan.positionId,
                status: "approved",
              }),
            ),
          ),
        // Delete orphaned registrations for current positions where user changed or was cleared
        ...existingPositionRegs
          .filter((r) => {
            const posId = getPosId(r.position);
            if (!posId || !currentPositionIdSet.has(posId)) return false;
            const userId = getUsrId(r.user);
            const plan = assignedMap.get(posId);
            return !plan || plan.assignedUserId !== userId;
          })
          .map((r) => useDirectus(deleteItem("ams_mission_registrations" as any, r.id))),
      ]);
    } catch (regSyncError) {
      console.error("Position registration sync failed", regSyncError);
    }

    if (isEditing.value) {
      const removedPositions = originalIds.value.positions.filter(
        (id) => !currentPositionIds.includes(id),
      );
      const removedShips = originalIds.value.ships.filter(
        (id) => !currentShipIds.includes(id),
      );
      const removedTeams = originalIds.value.teams.filter(
        (id) => !currentTeamIds.includes(id),
      );

      await Promise.all([
        ...removedPositions.map((id) =>
          useDirectus(deleteItem("ams_mission_positions" as any, id)),
        ),
        ...removedShips.map((id) =>
          useDirectus(deleteItem("ams_mission_team_ships" as any, id)),
        ),
        ...removedTeams.map((id) =>
          useDirectus(deleteItem("ams_mission_teams" as any, id)),
        ),
      ]);

      try {
        await $fetch(`/api/ams/missions/${missionId}/sync-discord`, {
          method: "POST",
        });
      } catch (syncError) {
        console.error("Mission discord sync after save failed", syncError);
      }

      const newPlannedDate = plannedDateValue.value || null;
      const wasCancelled = form.status === 'cancelled' && originalStatus.value !== 'cancelled';
      const dateChanged = originalPlannedDate.value !== null && originalPlannedDate.value !== newPlannedDate;

      if (wasCancelled) {
        try {
          await $fetch(`/api/ams/missions/${missionId}/notify-participants`, {
            method: 'POST',
            body: { type: 'cancelled' },
          });
        } catch (e) { console.error('Notify cancelled failed', e); }
      } else if (dateChanged) {
        try {
          await $fetch(`/api/ams/missions/${missionId}/notify-participants`, {
            method: 'POST',
            body: { type: 'reschedule', oldDate: originalPlannedDate.value, newDate: newPlannedDate },
          });
        } catch (e) { console.error('Notify reschedule failed', e); }
      }
    } else {
      try {
        await $fetch(`/api/ams/missions/${missionId}/share-discord`, {
          method: "POST",
        });
      } catch (shareError) {
        console.error("Mission discord share after create failed", shareError);
        toast.add({
          title: "Mission erstellt",
          description:
            "Die Mission wurde gespeichert, aber nicht automatisch in Discord geteilt.",
          color: "warning",
          icon: "i-lucide-alert-triangle",
        });
      }
    }

    await Promise.all([
      refreshNuxtData("ams:missions"),
      refreshNuxtData(`ams:mission:${missionId}`),
    ]);

    toast.add({
      title: isEditing.value ? "Mission aktualisiert" : "Mission erstellt",
      color: "success",
      icon: "i-lucide-circle-check",
    });
    router.push(`/ams/missions/${missionId}`);
  } catch (e) {
    console.error(e);
    toast.add({
      title: "Fehler beim Speichern",
      description: "Bitte versuche es erneut.",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
  } finally {
    loading.value = false;
  }
}

definePageMeta({
  layout: "ams",
  auth: true,
  access_level: 2,
});
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-rocket"
      :title="isEditing ? 'Mission bearbeiten' : 'Neue Mission erstellen'"
      :description="
        isEditing
          ? 'Ändere die Details und Teams.'
          : 'Plane eine neue Operation.'
      "
    >
      <div class="flex flex-wrap items-center gap-2">
        <UButton
          :to="cancelTo"
          variant="ghost"
          icon="i-lucide-arrow-left"
          label="Zurück"
        />
        <AMSUiAssistantModeDropdown
          :assistant-active="wizardCookie === true"
          :extra-items="plannerModeDropdownItems"
          @toggle-mode="toggleWizard"
        />
      </div>
    </AMSPageHeader>

    <AMSUiAssistantFlow
      v-if="wizardCookie === true"
      :steps="plannerSteps"
      :current-step="currentStep"
      :previous-disabled="currentStep === 0"
      :next-disabled="nextDisabled"
      :show-next="currentStep < plannerSteps.length - 1"
      @previous="goToPreviousStep"
      @next="goToNextStep"
    >
      <AMSPagesMissionsPlannerDetailsForm
        v-if="currentStep === 0"
        v-model:form="form"
        v-model:planned-calendar-date="plannedCalendarDate"
        v-model:planned-time="plannedTime"
        section="basics"
        :type-options="TYPE_OPTIONS"
        :status-options="STATUS_OPTIONS"
        :planned-date-summary="plannedDateSummary"
        :planned-calendar-ui="plannedCalendarUi"
        :planned-time-default-value="plannedTimeDefaultValue"
        :total-draft-primary-summary="totalDraftPrimarySummary"
        :total-draft-secondary-summary="totalDraftSecondarySummary"
        :total-draft-positions-hint="totalDraftPositionsHint"
      />
      <AMSPagesMissionsPlannerDetailsForm
        v-else-if="currentStep === 1"
        v-model:form="form"
        v-model:planned-calendar-date="plannedCalendarDate"
        v-model:planned-time="plannedTime"
        section="planning"
        :type-options="TYPE_OPTIONS"
        :status-options="STATUS_OPTIONS"
        :planned-date-summary="plannedDateSummary"
        :planned-calendar-ui="plannedCalendarUi"
        :planned-time-default-value="plannedTimeDefaultValue"
        :total-draft-primary-summary="totalDraftPrimarySummary"
        :total-draft-secondary-summary="totalDraftSecondarySummary"
        :total-draft-positions-hint="totalDraftPositionsHint"
        :split-date-time="true"
      />
      <AMSPagesMissionsPlannerTeamsEditor
        v-else-if="currentStep === 2"
        :teams="teams"
        :current-user-id="currentUserId"
        :total-draft-primary-summary="totalDraftPrimarySummary"
        :total-draft-secondary-summary="totalDraftSecondarySummary"
        :total-draft-positions-hint="totalDraftPositionsHint"
        :show-role-summary="true"
        :team-department-field-label="teamDepartmentFieldLabel"
        :team-department-field-hint="teamDepartmentFieldHint"
        :team-department-field-placeholder="teamDepartmentFieldPlaceholder"
        :department-select-items="departmentSelectItems"
        :departments-pending="departmentsPending"
        :fleet-options="fleetOptions"
        :fleet-pending="fleetPending"
        :position-type-order="POSITION_TYPE_ORDER"
        :position-type-labels="POSITION_TYPE_LABELS"
        :position-type-badge-labels="POSITION_TYPE_BADGE_LABELS"
        :add-team="addTeam"
        :remove-team="removeTeam"
        :add-ship="addShip"
        :remove-ship="removeShip"
        :on-ship-hangar-change="onShipHangarChange"
        :is-ship-over-crew-limit="isShipOverCrewLimit"
        :get-ship-position-summary="getShipPositionSummary"
        :get-ship-crew-limit-hint="getShipCrewLimitHint"
        :get-ship-role-summary="getShipRoleSummary"
        :get-ship-positions-by-type="getShipPositionsByType"
        :is-ship-position-type-locked="isShipPositionTypeLocked"
        :get-assigned-user-id="getAssignedUserId"
        :get-user-label="getUserLabel"
        :try-assign-self="tryAssignSelf"
        :unassign-self="unassignSelf"
        :get-ship-role-options="getShipRoleOptions"
        :add-position="addPosition"
        :remove-position="removePosition"
      />
      <AMSPagesMissionsPlannerReview
        v-else
        :form="form"
        :planned-date-summary="plannedDateSummary"
        :mission-type-label="missionTypeLabel"
        :status-label="statusLabel"
        :teams="teams"
        :total-draft-primary-summary="totalDraftPrimarySummary"
        :total-draft-secondary-summary="totalDraftSecondarySummary"
        :total-draft-positions-hint="totalDraftPositionsHint"
        :assigned-user-type-conflict="assignedUserTypeConflict"
        :loading="loading"
        :is-editing="isEditing"
        :cancel-to="cancelTo"
        @save="save"
      />
    </AMSUiAssistantFlow>

    <div v-else class="grid grid-cols-1 gap-6 pb-10 lg:grid-cols-3">
      <div class="space-y-4 lg:col-span-2">
        <AMSPagesMissionsPlannerTeamsEditor
          :teams="teams"
          :current-user-id="currentUserId"
          :total-draft-primary-summary="totalDraftPrimarySummary"
          :total-draft-secondary-summary="totalDraftSecondarySummary"
          :team-department-field-label="teamDepartmentFieldLabel"
          :team-department-field-hint="teamDepartmentFieldHint"
          :team-department-field-placeholder="teamDepartmentFieldPlaceholder"
          :department-select-items="departmentSelectItems"
          :departments-pending="departmentsPending"
          :fleet-options="fleetOptions"
          :fleet-pending="fleetPending"
          :position-type-order="POSITION_TYPE_ORDER"
          :position-type-labels="POSITION_TYPE_LABELS"
          :position-type-badge-labels="POSITION_TYPE_BADGE_LABELS"
          :add-team="addTeam"
          :remove-team="removeTeam"
          :add-ship="addShip"
          :remove-ship="removeShip"
          :on-ship-hangar-change="onShipHangarChange"
          :is-ship-over-crew-limit="isShipOverCrewLimit"
          :get-ship-position-summary="getShipPositionSummary"
          :get-ship-crew-limit-hint="getShipCrewLimitHint"
          :get-ship-role-summary="getShipRoleSummary"
          :get-ship-positions-by-type="getShipPositionsByType"
          :is-ship-position-type-locked="isShipPositionTypeLocked"
          :get-assigned-user-id="getAssignedUserId"
          :get-user-label="getUserLabel"
          :try-assign-self="tryAssignSelf"
          :unassign-self="unassignSelf"
          :get-ship-role-options="getShipRoleOptions"
          :add-position="addPosition"
          :remove-position="removePosition"
        />
      </div>

      <div class="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <AMSPagesMissionsPlannerDetailsForm
          v-model:form="form"
          v-model:planned-calendar-date="plannedCalendarDate"
          v-model:planned-time="plannedTime"
          :type-options="TYPE_OPTIONS"
          :status-options="STATUS_OPTIONS"
          :planned-date-summary="plannedDateSummary"
          :planned-calendar-ui="plannedCalendarUi"
          :planned-time-default-value="plannedTimeDefaultValue"
          :total-draft-primary-summary="totalDraftPrimarySummary"
          :total-draft-secondary-summary="totalDraftSecondarySummary"
          :total-draft-positions-hint="totalDraftPositionsHint"
          :show-actions="true"
          :loading="loading"
          :submit-label="isEditing ? 'Änderungen speichern' : 'Mission erstellen'"
          :cancel-to="cancelTo"
          @save="save"
        />
      </div>
    </div>

    <!-- Confirm replace modal -->
    <UModal v-model:open="replaceConfirmOpen" title="Position ersetzen">
      <template #content>
        <div
          class="rounded-2xl border border-(--ui-primary)/15 bg-(--ui-bg) overflow-hidden"
        >
          <div
            class="border-b border-(--ui-primary)/12 bg-(--ui-primary)/5 px-5 py-4"
          >
            <p
              class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-primary)/70"
            >
              Zuweisung ersetzen
            </p>
            <p class="text-sm font-semibold text-white">
              Position bereits belegt
            </p>
          </div>
          <div class="px-5 py-4 space-y-4">
            <p class="text-sm text-(--ui-text-muted)">
              Diese Position ist bereits
              <span class="text-white font-medium">{{
                getReplaceConfirmName()
              }}</span>
              zugewiesen. Trotzdem durch dich ersetzen?
            </p>
            <div class="flex justify-end gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                @click="
                  replaceConfirmOpen = false;
                  replaceConfirmTarget = null;
                "
              >
                Abbrechen
              </UButton>
              <UButton
                color="warning"
                icon="i-lucide-repeat-2"
                @click="confirmReplaceSelf"
              >
                Ersetzen
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

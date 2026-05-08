<script setup lang="ts">
import type { Department, DirectusField } from "~~/types";
import type { DateValue } from "@internationalized/date";
import { parseDate } from "@internationalized/date";
import { createItem, deleteItem, readItems, updateItem } from "@directus/sdk";
import {
  STANDARD_MISSION_ROLE_OPTIONS,
  getMissionRoleOption,
  getMissionRoleOptions,
  getMissionRoleSort,
  getMissionRoleSummary,
  shipHasMissionRoles,
  generatePositionsFromShipRoles,
} from "~~/app/utils/ams-mission-roles";
import UInputTime from "~/components/UInputTime.vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const { currentUserId, currentUserAL, isAuthLoading } = storeToRefs(authStore);

const editId = computed(() => route.query.edit as string | undefined);
const isEditing = computed(() => !!editId.value);

const {
  data: fleet,
  pending: fleetPending,
  refresh: refreshFleet,
} = await useFetchAMSFleet();
const { data: employees, refresh: refreshEmployees } =
  await useFetchAMSEmployees();
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
      const fields = (await useDirectus(
        readItems("directus_fields" as any, {
          filter: {
            collection: { _eq: "ams_mission_teams" },
            field: { _eq: "department" },
          },
          fields: ["field", "note", "translations"],
          limit: 1,
        }),
      )) as DirectusField[];

      return fields[0] ?? null;
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

const POSITION_TYPE_ORDER = ["primary", "secondary"] as const;
const POSITION_TYPE_LABELS: Record<PositionType, string> = {
  primary: "Primäre Funktionen",
  secondary: "Sekundäre Funktionen",
};
const POSITION_TYPE_BADGE_LABELS: Record<PositionType, string> = {
  primary: "Primär",
  secondary: "Sekundär",
};

type PositionType = (typeof POSITION_TYPE_ORDER)[number];

interface PositionDraft {
  id?: string;
  sort?: number | null;
  position_type: PositionType;
  role: string;
  role_description?: string | null;
  assigned_user: any | null;
  status: string;
}

interface ShipDraft {
  id?: string;
  hangar_id: any | null;
  positions: PositionDraft[];
}

interface TeamDraft {
  id?: string;
  name: string;
  description: string;
  department: Department | string | null;
  ships: ShipDraft[];
}

const form = reactive({
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

const plannedDateModel = computed<DateValue | undefined>({
  get: () => plannedCalendarDate.value,
  set: (value) => {
    plannedCalendarDate.value = value;

    if (value && !plannedTime.value) {
      plannedTime.value = plannedTimeDefaultValue;
    }
  },
});

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

function clearPlannedDate() {
  plannedCalendarDate.value = undefined;
  plannedTime.value = "";
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
const editMissionLoaded = ref(!isEditing.value);
const unauthorizedEditHandled = ref(false);

if (editId.value) {
  const { data: existing } = await useFetchAMSMission(editId.value);
  if (existing.value) {
    editMissionCreatorId.value = existing.value.user_created?.id ?? null;
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

const employeeOptions = computed(() =>
  (employees.value ?? []).map((u: any) => ({
    label: getUserLabel(u),
    value: u,
    id: u.id,
  })),
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
  if (!employees.value?.length) tasks.push(refreshEmployees());
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

  const durationMinutes = parseDurationHours(form.duration_hours);

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
      }

      for (const ship of team.ships) {
        if (!ship.hangar_id) continue;
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
        }

        for (const pos of ship.positions) {
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
          } else {
            await useDirectus(
              createItem("ams_mission_positions" as any, {
                team_ship: shipId,
                ...posPayload,
              }),
            );
          }
        }
      }
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

      for (const id of removedPositions) {
        await useDirectus(deleteItem("ams_mission_positions" as any, id));
      }
      for (const id of removedShips) {
        await useDirectus(deleteItem("ams_mission_team_ships" as any, id));
      }
      for (const id of removedTeams) {
        await useDirectus(deleteItem("ams_mission_teams" as any, id));
      }

      try {
        await $fetch(`/api/ams/missions/${missionId}/sync-discord`, {
          method: "POST",
        });
      } catch (syncError) {
        console.error("Mission discord sync after save failed", syncError);
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
      <UButton
        to="/ams/missions"
        variant="ghost"
        icon="i-lucide-arrow-left"
        label="Zurück"
      />
    </AMSPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
      <!-- Teams & Schiffe – Hauptbereich -->
      <div class="lg:col-span-2 space-y-4">
        <div
          class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 overflow-hidden"
        >
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-(--ui-primary)/10 bg-(--ui-primary)/5"
          >
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-layers"
                class="h-4 w-4 text-(--ui-primary)"
              />
              <h2
                class="text-sm font-semibold text-(--ui-primary) uppercase tracking-wider m-0!"
              >
                Teams & Schiffe
              </h2>
            </div>
            <div class="flex items-center gap-2">
              <UBadge color="neutral" variant="subtle" size="sm">
                Primär {{ totalDraftPrimarySummary }}
              </UBadge>
              <UBadge color="neutral" variant="subtle" size="sm">
                Sekundär {{ totalDraftSecondarySummary }}
              </UBadge>
              <UButton
                size="sm"
                variant="outline"
                icon="i-lucide-plus"
                label="Team hinzufügen"
                @click="addTeam"
              />
            </div>
          </div>

          <div class="p-5 space-y-4">
            <div
              v-if="!teams.length"
              class="text-center py-10 text-(--ui-muted-foreground) text-sm"
            >
              <UIcon
                name="i-lucide-users"
                class="h-8 w-8 mx-auto mb-2 opacity-30"
              />
              <p>Noch keine Teams. Klicke auf "Team hinzufügen".</p>
            </div>

            <div
              v-for="(team, ti) in teams"
              :key="ti"
              class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg)/50 overflow-hidden"
            >
              <!-- Team Header -->
              <div
                class="px-4 py-3 bg-(--ui-primary)/5 border-b border-(--ui-primary)/10 space-y-3"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="text-xs font-bold text-(--ui-primary)/50 w-5 text-center shrink-0"
                    >{{ ti + 1 }}</span
                  >
                  <UInput
                    v-model="team.name"
                    placeholder="Team Name"
                    variant="ghost"
                    class="flex-1 font-semibold"
                  />
                  <UButton
                    size="xs"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    @click="removeTeam(ti)"
                  />
                </div>

                <div class="grid gap-2 lg:grid-cols-[minmax(0,1fr)_16rem]">
                  <UInput
                    v-model="team.description"
                    placeholder="Beschreibung (optional)"
                    variant="ghost"
                    class="text-sm text-(--ui-muted-foreground)"
                  />
                  <UFormField
                    size="sm"
                    :label="teamDepartmentFieldLabel"
                    :hint="teamDepartmentFieldHint"
                    class="min-w-0"
                  >
                    <USelectMenu
                      v-model="team.department"
                      :items="departmentSelectItems"
                      value-key="id"
                      label-key="name"
                      :placeholder="teamDepartmentFieldPlaceholder"
                      :loading="departmentsPending"
                      searchable
                      clearable
                      class="w-3/4"
                    />
                  </UFormField>
                </div>
              </div>

              <!-- Schiffe -->
              <div class="divide-y divide-(--ui-primary)/5">
                <div
                  v-if="!team.ships.length"
                  class="px-4 py-3 text-sm text-(--ui-muted-foreground) text-center"
                >
                  Kein Schiff zugewiesen.
                </div>

                <div
                  v-for="(ship, si) in team.ships"
                  :key="si"
                  class="px-4 py-3 space-y-3"
                >
                  <!-- Schiff auswählen -->
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-rocket"
                      class="h-4 w-4 text-(--ui-primary)/50 shrink-0"
                    />
                    <USelectMenu
                      v-model="ship.hangar_id"
                      :items="fleetOptions"
                      value-key="value"
                      label-key="label"
                      placeholder="Schiff aus der Flotte wählen…"
                      :loading="fleetPending"
                      class="flex-1"
                      searchable
                      @update:model-value="onShipHangarChange(ship)"
                    />
                    <UBadge
                      :color="
                        isShipOverCrewLimit(ship, 'primary')
                          ? 'error'
                          : 'neutral'
                      "
                      variant="subtle"
                      size="sm"
                    >
                      Primär {{ getShipPositionSummary(ship, "primary") }}
                    </UBadge>
                    <UBadge
                      :color="
                        isShipOverCrewLimit(ship, 'secondary')
                          ? 'error'
                          : 'neutral'
                      "
                      variant="subtle"
                      size="sm"
                    >
                      Sekundär {{ getShipPositionSummary(ship, "secondary") }}
                    </UBadge>
                    <UButton
                      size="xs"
                      color="error"
                      variant="ghost"
                      icon="i-lucide-x"
                      @click="removeShip(team, si)"
                    />
                  </div>

                  <p
                    class="ml-6 text-xs"
                    :class="
                      isShipOverCrewLimit(ship, 'primary') ||
                      isShipOverCrewLimit(ship, 'secondary')
                        ? 'text-red-400'
                        : 'text-(--ui-text-muted)'
                    "
                  >
                    Primär: {{ getShipCrewLimitHint(ship, "primary") }} •
                    Sekundär:
                    {{ getShipCrewLimitHint(ship, "secondary") }}
                  </p>
                  <p
                    v-if="ship.hangar_id"
                    class="ml-6 text-xs text-(--ui-primary)/75"
                  >
                    Primäre Rollen:
                    {{ getShipRoleSummary(ship, "primary") || "Standardrollen" }}
                    <span class="text-(--ui-text-muted)">•</span>
                    Sekundäre Rollen:
                    {{
                      getShipRoleSummary(ship, "secondary") || "Standardrollen"
                    }}
                  </p>

                  <!-- Positionen -->
                  <div class="ml-6 grid gap-4 md:grid-cols-2">
                    <div
                      v-for="positionType in POSITION_TYPE_ORDER"
                      :key="positionType"
                      class="space-y-2 rounded-xl border border-(--ui-primary)/8 bg-(--ui-bg-muted)/25 p-3"
                    >
                      <div class="flex items-center justify-between gap-3">
                        <div>
                          <p class="text-xs font-semibold text-white">
                            {{ POSITION_TYPE_LABELS[positionType] }}
                          </p>
                          <p class="text-[11px] text-(--ui-text-muted)">
                            {{ getShipPositionSummary(ship, positionType) }}
                          </p>
                        </div>
                        <UButton
                          v-if="!isShipPositionTypeLocked(ship, positionType)"
                          size="xs"
                          variant="ghost"
                          icon="i-lucide-plus"
                          :label="POSITION_TYPE_BADGE_LABELS[positionType]"
                          @click="addPosition(ship, positionType)"
                        />
                        <UBadge
                          v-else
                          color="neutral"
                          variant="subtle"
                          size="xs"
                          icon="i-lucide-lock"
                        >
                          Fixiert
                        </UBadge>
                      </div>

                      <div
                        v-if="getShipPositionsByType(ship, positionType).length"
                        class="space-y-2"
                      >
                        <div
                          v-for="(pos, pi) in getShipPositionsByType(ship, positionType)"
                          :key="pos.id ?? `${positionType}-${pi}`"
                          :class="[
                            'grid gap-2 sm:items-center',
                            isShipPositionTypeLocked(ship, positionType)
                              ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
                              : 'sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_auto]',
                          ]"
                        >
                          <span
                            v-if="isShipPositionTypeLocked(ship, positionType)"
                            class="truncate text-sm text-white"
                          >
                            {{ pos.role }}
                          </span>
                          <USelectMenu
                            v-else
                            v-model="pos.role"
                            :items="getShipRoleOptions(ship, positionType)"
                            value-key="value"
                            label-key="label"
                            class="w-full min-w-0"
                          />
                          <USelectMenu
                            v-model="pos.assigned_user"
                            :items="employeeOptions"
                            value-key="value"
                            label-key="label"
                            placeholder="Direkt zuweisen"
                            class="w-full min-w-0"
                            searchable
                            clearable
                          />
                          <div
                            v-if="!isShipPositionTypeLocked(ship, positionType)"
                            class="flex justify-end sm:justify-start"
                          >
                            <UButton
                              size="xs"
                              color="error"
                              variant="ghost"
                              icon="i-lucide-minus"
                              @click="removePosition(ship, pos)"
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        v-else
                        class="rounded-lg border border-dashed border-(--ui-primary)/12 px-3 py-4 text-center text-xs text-(--ui-text-muted)"
                      >
                        Noch keine
                        {{ POSITION_TYPE_LABELS[positionType].toLowerCase() }}.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Schiff hinzufügen -->
              <div
                class="px-4 py-2 border-t border-(--ui-primary)/5 bg-(--ui-bg-muted)/20"
              >
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-plus"
                  label="Schiff hinzufügen"
                  @click="addShip(team)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details Sidebar -->
      <div class="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <div
          class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50 p-5 space-y-4"
        >
          <h2
            class="text-xs font-semibold text-(--ui-primary) uppercase tracking-wider mt-0!"
          >
            Mission Details
          </h2>

          <UFormField label="Titel" required>
            <UInput
              v-model="form.title"
              placeholder="z.B. Operation Silberstern"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Typ">
              <USelectMenu
                v-model="form.mission_type"
                :items="TYPE_OPTIONS"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Status">
              <USelectMenu
                v-model="form.status"
                :items="STATUS_OPTIONS"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Treffpunkt">
              <UInput
                v-model="form.start_location"
                placeholder="Port Olisar…"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Missionsort">
              <UInput
                v-model="form.location"
                placeholder="Lorville…"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UFormField
              label="Vorr. Dauer"
              hint="in Stunden, z.B. 1,5"
              required
            >
              <UInput
                v-model="form.duration_hours"
                inputmode="decimal"
                placeholder="z.B. 2,5"
                class="w-full"
              />
            </UFormField>

            <div
              class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5"
            >
              <p
                class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-text-muted)"
              >
                Rollenübersicht
              </p>
              <p class="mt-1 text-sm font-medium text-white">
                Primär {{ totalDraftPrimarySummary }}
              </p>
              <p class="mt-1 text-sm font-medium text-white">
                Sekundär {{ totalDraftSecondarySummary }}
              </p>
              <p class="mt-1 text-xs text-(--ui-text-muted)">
                {{ totalDraftPositionsHint }}
              </p>
            </div>
          </div>

          <UFormField label="Beschreibung">
            <UTextarea
              v-model="form.description"
              placeholder="Ziele, Regeln, Infos…"
              :rows="4"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Datum & Uhrzeit">
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm text-(--ui-text-muted)">
                  {{ plannedDateSummary }}
                </p>
                <UButton
                  v-if="plannedCalendarDate"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-x"
                  label="Leeren"
                  @click="clearPlannedDate"
                />
              </div>

              <div
                class="relative overflow-hidden rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-white/5 backdrop-blur-sm"
              >
                <div
                  aria-hidden="true"
                  class="pointer-events-none absolute inset-x-6 top-0 h-20 rounded-full bg-(--ui-primary)/10 blur-3xl not-prose"
                />
                <UCalendar
                  v-model="plannedDateModel"
                  :week-starts-on="1"
                  calendar-label="Missionsdatum"
                  size="xs"
                  variant="outline"
                  class="relative w-full not-prose!"
                  :ui="plannedCalendarUi"
                />
              </div>

              <UInputTime
                v-model="plannedTime"
                :hour-cycle="24"
                :default-value="plannedTimeDefaultValue"
                class="w-full"
                :disabled="!plannedCalendarDate"
              />
            </div>
          </UFormField>
        </div>

        <div class="flex flex-col gap-2">
          <UButton
            :loading="loading"
            icon="i-lucide-save"
            :label="isEditing ? 'Änderungen speichern' : 'Mission erstellen'"
            class="w-full justify-center"
            @click="save"
          />
          <UButton
            to="/ams/missions"
            variant="ghost"
            label="Abbrechen"
            class="w-full justify-center"
          />
        </div>
      </div>
    </div>
  </div>
</template>

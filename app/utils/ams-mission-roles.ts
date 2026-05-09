export interface MissionRoleOption {
  label: string;
  value: string;
  description?: string | null;
  isCustom?: boolean;
}

export type MissionRolePositionType = "primary" | "secondary";

export type MissionRoleSource =
  | {
      mission_roles?: unknown;
      mission_roles_secondary?: unknown;
    }
  | null
  | undefined;

export const STANDARD_MISSION_ROLE_OPTIONS: MissionRoleOption[] = [
  { label: "Pilot", value: "pilot" },
  { label: "Co-Pilot", value: "co_pilot" },
  { label: "Mining Operator", value: "mining_operator" },
  { label: "Cargo Operator", value: "cargo_operator" },
  { label: "Turret Operator", value: "turret_operator" },
  { label: "Ingenieur", value: "engineer" },
  { label: "Medic", value: "medic" },
  { label: "Aufklärer", value: "scout" },
  { label: "Passagier", value: "passenger" },
  { label: "Sonstiges", value: "other" },
];

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeMissionRolePositionType(
  positionType?: string | null,
): MissionRolePositionType {
  return positionType === "secondary" ? "secondary" : "primary";
}

function parseRoleArray(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [];
  }

  if (!normalizedValue.startsWith("[")) {
    return normalizedValue.split(",");
  }

  try {
    const parsedValue = JSON.parse(normalizedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function getRoleRecord(entry: unknown): Record<string, unknown> | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const roleRecord = entry as Record<string, unknown>;
  const relatedRole = roleRecord.ams_mission_role_id;

  if (relatedRole && typeof relatedRole === "object") {
    return relatedRole as Record<string, unknown>;
  }

  return roleRecord;
}

function normalizeCustomMissionRoleEntry(
  entry: unknown,
): MissionRoleOption | null {
  if (typeof entry === "string") {
    const label = normalizeString(entry);

    return label
      ? {
          label,
          value: label,
          description: null,
          isCustom: true,
        }
      : null;
  }

  if (!entry || typeof entry !== "object") {
    return null;
  }

  const roleRecord = getRoleRecord(entry);
  if (!roleRecord) {
    return null;
  }

  const label = normalizeString(
    roleRecord.name ?? roleRecord.label ?? roleRecord.value ?? roleRecord.role,
  );

  if (!label) {
    return null;
  }

  const description = normalizeString(
    roleRecord.description ?? roleRecord.note,
  );

  return {
    label,
    value: label,
    description: description || null,
    isCustom: true,
  };
}

function getSortedMissionRoleEntries(entries: unknown[]) {
  return [...entries].sort((left, right) => {
    const leftSort = getMissionRoleEntrySort(left) ?? Number.MAX_SAFE_INTEGER;
    const rightSort =
      getMissionRoleEntrySort(right) ?? Number.MAX_SAFE_INTEGER;

    return leftSort - rightSort;
  });
}

function getMissionRoleEntrySort(entry: unknown) {
  return typeof (entry as { sort?: unknown })?.sort === "number"
    ? ((entry as { sort?: number }).sort ?? null)
    : null;
}

function getMissionRoleEntries(
  source?: MissionRoleSource,
  positionType: MissionRolePositionType = "primary",
) {
  const normalizedPositionType = normalizeMissionRolePositionType(positionType);
  const relationEntries =
    normalizedPositionType === "secondary"
      ? source?.mission_roles_secondary
      : source?.mission_roles;

  if (Array.isArray(relationEntries) && relationEntries.length) {
    return getSortedMissionRoleEntries(relationEntries);
  }

  if (normalizedPositionType === "primary") {
    return source?.mission_roles;
  }

  return [];
}

export function normalizeCustomMissionRoles(value: unknown) {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? parseRoleArray(value)
      : [];

  const seenRoles = new Set<string>();
  const roles: MissionRoleOption[] = [];

  for (const rawEntry of rawValues) {
    const normalizedRole = normalizeCustomMissionRoleEntry(rawEntry);
    if (!normalizedRole) continue;

    const roleKey = normalizedRole.value.toLocaleLowerCase("de-DE");
    if (seenRoles.has(roleKey)) continue;

    seenRoles.add(roleKey);
    roles.push(normalizedRole);
  }

  return roles;
}

export function getMissionRoleOptions(
  source?: MissionRoleSource,
  positionType: MissionRolePositionType = "primary",
) {
  const customRoles = normalizeCustomMissionRoles(
    getMissionRoleEntries(source, positionType),
  );

  if (customRoles.length) {
    return customRoles;
  }

  return STANDARD_MISSION_ROLE_OPTIONS;
}

export function getMissionRoleOption(
  roleValue: unknown,
  source?: MissionRoleSource,
  positionType: MissionRolePositionType = "primary",
) {
  const normalizedRole = normalizeString(roleValue);

  if (!normalizedRole) {
    return null;
  }

  const roleOptions = getMissionRoleOptions(source, positionType);
  const matchingRole = roleOptions.find(
    (role) => role.value === normalizedRole || role.label === normalizedRole,
  );

  if (matchingRole) {
    return matchingRole;
  }

  const standardRole = STANDARD_MISSION_ROLE_OPTIONS.find(
    (role) => role.value === normalizedRole,
  );

  if (standardRole) {
    return standardRole;
  }

  return {
    label: normalizedRole,
    value: normalizedRole,
    description: null,
  } satisfies MissionRoleOption;
}

export function getMissionRoleLabel(
  roleValue: unknown,
  source?: MissionRoleSource,
  positionType: MissionRolePositionType = "primary",
) {
  return (
    getMissionRoleOption(roleValue, source, positionType)?.label ?? "Position"
  );
}

export function getMissionRoleDescription(
  roleValue: unknown,
  source?: MissionRoleSource,
  positionType: MissionRolePositionType = "primary",
) {
  return (
    getMissionRoleOption(roleValue, source, positionType)?.description ?? null
  );
}

export function getMissionRoleOrder(
  roleValue: unknown,
  source?: MissionRoleSource,
  positionType: MissionRolePositionType = "primary",
) {
  const normalizedRole = normalizeString(roleValue);

  if (!normalizedRole) {
    return Number.MAX_SAFE_INTEGER;
  }

  const roleOptions = getMissionRoleOptions(source, positionType);
  const shipRoleIndex = roleOptions.findIndex(
    (role) => role.value === normalizedRole || role.label === normalizedRole,
  );

  if (shipRoleIndex !== -1) {
    return shipRoleIndex;
  }

  const standardRoleIndex = STANDARD_MISSION_ROLE_OPTIONS.findIndex(
    (role) => role.value === normalizedRole,
  );

  if (standardRoleIndex !== -1) {
    return standardRoleIndex;
  }

  return roleOptions.length + STANDARD_MISSION_ROLE_OPTIONS.length;
}

export function shipHasMissionRoles(
  source?: MissionRoleSource,
  positionType?: MissionRolePositionType,
): boolean {
  if (positionType) {
    const entries = getMissionRoleEntries(source, positionType);
    return Array.isArray(entries) && entries.length > 0;
  }

  const primaryEntries = getMissionRoleEntries(source, "primary");
  const secondaryEntries = getMissionRoleEntries(source, "secondary");

  return (
    (Array.isArray(primaryEntries) && primaryEntries.length > 0) ||
    (Array.isArray(secondaryEntries) && secondaryEntries.length > 0)
  );
}

export interface GeneratedPosition {
  position_type: MissionRolePositionType;
  role: string;
  description: string | null;
  sort: number | null;
}

export function generatePositionsFromShipRoles(
  source?: MissionRoleSource,
): GeneratedPosition[] {
  const positions: GeneratedPosition[] = [];

  for (const positionType of ["primary", "secondary"] as MissionRolePositionType[]) {
    const entries = getMissionRoleEntries(source, positionType);
    if (!Array.isArray(entries) || !entries.length) continue;

    const sortedEntries = getSortedMissionRoleEntries(entries);

    const labelCounts = new Map<string, number>();
    for (const entry of sortedEntries) {
      const option = normalizeCustomMissionRoleEntry(entry);
      if (!option) continue;
      labelCounts.set(option.label, (labelCounts.get(option.label) ?? 0) + 1);
    }

    const labelIndices = new Map<string, number>();

    for (const entry of sortedEntries) {
      const option = normalizeCustomMissionRoleEntry(entry);
      if (!option) continue;

      const count = labelCounts.get(option.label) ?? 1;
      const isDash = option.label.trim() === "-";
      let role: string;

      if (count > 1 && !isDash) {
        const index = (labelIndices.get(option.label) ?? 0) + 1;
        labelIndices.set(option.label, index);
        role = `${option.label} ${index}`;
      } else {
        role = option.label;
      }

      positions.push({
        position_type: positionType,
        role,
        description: option.description ?? null,
        sort: getMissionRoleEntrySort(entry),
      });
    }
  }

  return positions;
}

export function getMissionRoleSummary(
  source?: MissionRoleSource,
  positionType: MissionRolePositionType = "primary",
) {
  const customRoles = normalizeCustomMissionRoles(
    getMissionRoleEntries(source, positionType),
  );

  if (customRoles.length) {
    return customRoles.map((role) => role.label).join(", ");
  }

  return null;
}

export function getMissionRoleSort(
  roleValue: unknown,
  source?: MissionRoleSource,
  positionType: MissionRolePositionType = "primary",
) {
  const normalizedRole = normalizeString(roleValue);

  if (!normalizedRole) {
    return null;
  }

  const normalizedPositionType = normalizeMissionRolePositionType(positionType);
  const generatedPositions = generatePositionsFromShipRoles(source).filter(
    (position) => position.position_type === normalizedPositionType,
  );

  const generatedMatch = generatedPositions.find(
    (position) => normalizeString(position.role) === normalizedRole,
  );

  if (generatedMatch) {
    return generatedMatch.sort;
  }

  const relationEntries = getMissionRoleEntries(source, normalizedPositionType);
  if (!Array.isArray(relationEntries) || !relationEntries.length) {
    return null;
  }

  const relationMatch = getSortedMissionRoleEntries(relationEntries).find(
    (entry) => {
      const option = normalizeCustomMissionRoleEntry(entry);
      if (!option) return false;

      return (
        normalizeString(option.value) === normalizedRole ||
        normalizeString(option.label) === normalizedRole
      );
    },
  );

  return relationMatch ? getMissionRoleEntrySort(relationMatch) : null;
}

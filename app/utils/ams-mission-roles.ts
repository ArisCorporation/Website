export interface MissionRoleOption {
  label: string;
  value: string;
  description?: string | null;
  isCustom?: boolean;
}

export type MissionRoleSource =
  | {
      mission_roles?: unknown;
      custom_mission_roles?: unknown;
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

function normalizeCustomMissionRoleEntry(entry: unknown): MissionRoleOption | null {
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

function getMissionRoleEntries(source?: MissionRoleSource) {
  if (Array.isArray(source?.mission_roles) && source.mission_roles.length) {
    return [...source.mission_roles].sort((left, right) => {
      const leftSort =
        typeof (left as { sort?: unknown })?.sort === "number"
          ? ((left as { sort?: number }).sort ?? Number.MAX_SAFE_INTEGER)
          : Number.MAX_SAFE_INTEGER;
      const rightSort =
        typeof (right as { sort?: unknown })?.sort === "number"
          ? ((right as { sort?: number }).sort ?? Number.MAX_SAFE_INTEGER)
          : Number.MAX_SAFE_INTEGER;

      return leftSort - rightSort;
    });
  }

  return source?.custom_mission_roles;
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

export function getMissionRoleOptions(source?: MissionRoleSource) {
  const customRoles = normalizeCustomMissionRoles(getMissionRoleEntries(source));

  if (customRoles.length) {
    return customRoles;
  }

  return STANDARD_MISSION_ROLE_OPTIONS;
}

export function getMissionRoleOption(
  roleValue: unknown,
  source?: MissionRoleSource,
) {
  const normalizedRole = normalizeString(roleValue);

  if (!normalizedRole) {
    return null;
  }

  const roleOptions = getMissionRoleOptions(source);
  const matchingRole = roleOptions.find(
    (role) =>
      role.value === normalizedRole || role.label === normalizedRole,
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
) {
  return getMissionRoleOption(roleValue, source)?.label ?? "Position";
}

export function getMissionRoleDescription(
  roleValue: unknown,
  source?: MissionRoleSource,
) {
  return getMissionRoleOption(roleValue, source)?.description ?? null;
}

export function getMissionRoleOrder(
  roleValue: unknown,
  source?: MissionRoleSource,
) {
  const normalizedRole = normalizeString(roleValue);

  if (!normalizedRole) {
    return Number.MAX_SAFE_INTEGER;
  }

  const roleOptions = getMissionRoleOptions(source);
  const shipRoleIndex = roleOptions.findIndex(
    (role) =>
      role.value === normalizedRole || role.label === normalizedRole,
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

export function getMissionRoleSummary(source?: MissionRoleSource) {
  const customRoles = normalizeCustomMissionRoles(getMissionRoleEntries(source));

  if (customRoles.length) {
    return customRoles.map((role) => role.label).join(", ");
  }

  return null;
}

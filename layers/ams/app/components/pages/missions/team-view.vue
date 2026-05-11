<script setup lang="ts">
import {
  getMissionRoleDescription,
  getMissionRoleLabel,
  getMissionRoleOrder,
} from "~~/app/utils/ams-mission-roles";

const props = defineProps<{
  teams: any[];
  registrations?: any[];
  myActiveRegistrations?: any[];
  canManageRegistrations: boolean;
  signupOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "signupFlexTeam", team: any): void;
  (e: "signupPosition", team: any, ship: any, position: any): void;
  (e: "removeRegistration", registration: any): void;
}>();

const POSITION_TYPE_ORDER = ["primary", "secondary"] as const;
type PositionType = (typeof POSITION_TYPE_ORDER)[number];

const POSITION_TYPE_LABELS: Record<PositionType, string> = {
  primary: "Primäre Funktionen",
  secondary: "Sekundäre Funktionen",
};

const POSITION_TYPE_BADGE_LABELS: Record<PositionType, string> = {
  primary: "Primär",
  secondary: "Sekundär",
};

function normalizePositionType(value?: string | null): PositionType {
  return value === "secondary" ? "secondary" : "primary";
}

function getNormalizedRegistrationStatus(status?: string) {
  if (status === "tentative") return "approved";
  return status ?? "pending";
}

function findMissionPosition(positionId?: string) {
  if (!positionId) return null;

  return (
    (props.teams ?? [])
      .flatMap((team: any) => team.ships ?? [])
      .flatMap((ship: any) => ship.positions ?? [])
      .find((position: any) => position.id === positionId) ?? null
  );
}

function getPositionAssignedUserId(position: any) {
  if (!position?.assigned_user) return null;
  return typeof position.assigned_user === "object"
    ? (position.assigned_user.id ?? null)
    : position.assigned_user;
}

function isRegistrationEffectivelyActive(registration: any) {
  const status = getNormalizedRegistrationStatus(registration?.status);
  if (status === "rejected") return false;

  if (registration?.type !== "position") {
    return true;
  }

  const position = findMissionPosition(registration?.position?.id);
  if (!position) return false;

  if (status === "pending") {
    return position.status === "pending";
  }

  if (status === "approved") {
    return getPositionAssignedUserId(position) === registration?.user?.id;
  }

  return false;
}

const myActiveRegistrations = computed(() => props.myActiveRegistrations ?? []);

const activeRegistrations = computed(() =>
  (props.registrations ?? []).filter((registration: any) =>
    isRegistrationEffectivelyActive(registration),
  ),
);

const missionFlexRegistrations = computed(() =>
  sortRegistrations(
    activeRegistrations.value.filter(
      (registration: any) => registration.type === "flex",
    ),
  ),
);

const positionRegistrations = computed(() => {
  const grouped = new Map<string, any[]>();

  for (const registration of activeRegistrations.value) {
    const positionId = registration.position?.id;
    if (!positionId) continue;

    const existing = grouped.get(positionId) ?? [];
    existing.push(registration);
    grouped.set(positionId, existing);
  }

  const statusOrder: Record<string, number> = {
    pending: 0,
    approved: 1,
  };

  for (const registrations of grouped.values()) {
    registrations.sort(
      (a: any, b: any) =>
        (statusOrder[getNormalizedRegistrationStatus(a.status)] ?? 99) -
        (statusOrder[getNormalizedRegistrationStatus(b.status)] ?? 99),
    );
  }

  return grouped;
});

const myFlexRegistration = computed(
  () =>
    myActiveRegistrations.value.find(
      (registration: any) =>
        registration.type === "flex" || registration.type === "flex_team",
    ) ?? null,
);

const myPositionRegistrations = computed(() =>
  myActiveRegistrations.value.filter(
    (registration: any) => registration.type === "position",
  ),
);

const myPositionTypes = computed(() => {
  const types = new Set<PositionType>();

  for (const registration of myPositionRegistrations.value) {
    types.add(normalizePositionType(registration.position?.position_type));
  }

  return types;
});

const canSignupFlex = computed(
  () => props.signupOpen && !myActiveRegistrations.value.length,
);

function sortRegistrations(registrations: any[]) {
  const statusOrder: Record<string, number> = {
    pending: 0,
    approved: 1,
  };

  return [...registrations].sort((a: any, b: any) => {
    const statusDelta =
      (statusOrder[getNormalizedRegistrationStatus(a.status)] ?? 99) -
      (statusOrder[getNormalizedRegistrationStatus(b.status)] ?? 99);
    if (statusDelta !== 0) return statusDelta;

    return getUserLabel(a.user).localeCompare(getUserLabel(b.user), "de");
  });
}

function getTeamShipCount(team: any) {
  return team.ships?.length ?? 0;
}

function getTeamOpenPositions(team: any) {
  return (team.ships ?? [])
    .flatMap((ship: any) => ship.positions ?? [])
    .filter((position: any) => getEffectivePositionState(position) === "open")
    .length;
}

function getTeamPendingPositions(team: any) {
  return (team.ships ?? [])
    .flatMap((ship: any) => ship.positions ?? [])
    .filter(
      (position: any) => getEffectivePositionState(position) === "pending",
    ).length;
}

function getShipName(ship: any) {
  return (
    ship.hangar_id?.name || ship.hangar_id?.ship?.name || "Unbekanntes Schiff"
  );
}

function getTeamDepartmentLabel(team: any) {
  if (!team?.department) return null;
  return typeof team.department === "object"
    ? (team.department?.name ?? null)
    : team.department;
}

function getShipMeta(ship: any) {
  const manufacturer = ship.hangar_id?.ship?.hull?.manufacturer?.name;
  const hull = ship.hangar_id?.ship?.hull?.name;
  const owner = ship.hangar_id?.user?.first_name
    ? `${ship.hangar_id.user.first_name} ${ship.hangar_id.user.last_name ?? ""}`.trim()
    : null;

  return [manufacturer, owner ? `Besatzung: ${owner}` : null]
    .filter(Boolean)
    .join(" • ");
}

function getShipCrewLimit(ship: any) {
  const rawCrew = ship.hangar_id?.ship?.stats?.crew;

  if (typeof rawCrew === "number" && Number.isFinite(rawCrew) && rawCrew > 0) {
    return rawCrew;
  }

  if (typeof rawCrew === "string") {
    const parsedCrew = Number.parseInt(rawCrew, 10);
    return Number.isFinite(parsedCrew) && parsedCrew > 0 ? parsedCrew : null;
  }

  return null;
}

function getShipPositionsByType(ship: any, positionType: PositionType) {
  return (ship.positions ?? []).filter(
    (position: any) =>
      normalizePositionType(position.position_type) === positionType,
  );
}

function getShipPositionCount(ship: any, positionType?: PositionType) {
  if (!positionType) return ship.positions?.length ?? 0;
  return getShipPositionsByType(ship, positionType).length;
}

function getShipOpenPositions(ship: any, positionType?: PositionType) {
  const positions = positionType
    ? getShipPositionsByType(ship, positionType)
    : (ship.positions ?? []);
  return positions.filter(
    (position: any) => getEffectivePositionState(position) === "open",
  ).length;
}

function getShipPositionSummary(ship: any, positionType: PositionType) {
  const crewLimit = getShipCrewLimit(ship);
  const count = getShipPositionCount(ship, positionType);

  if (crewLimit === null) {
    return `${count} Positionen`;
  }

  return `${count}/${crewLimit} Positionen`;
}

function getShipRoleSource(ship: any) {
  return ship?.hangar_id?.ship ?? null;
}

function getPositionRoleLabel(pos: any, ship: any) {
  return getMissionRoleLabel(
    pos?.role,
    getShipRoleSource(ship),
    normalizePositionType(pos?.position_type),
  );
}

function getPositionRoleDescription(pos: any, ship: any) {
  if (
    typeof pos?.role_description === "string" &&
    pos.role_description.trim()
  ) {
    return pos.role_description.trim();
  }

  return getMissionRoleDescription(
    pos?.role,
    getShipRoleSource(ship),
    normalizePositionType(pos?.position_type),
  );
}

function getSortedPositions(ship: any, positionType: PositionType) {
  return [...getShipPositionsByType(ship, positionType)].sort(
    (a: any, b: any) => {
      const orderDelta =
        getMissionRoleOrder(a.role, getShipRoleSource(ship), positionType) -
        getMissionRoleOrder(b.role, getShipRoleSource(ship), positionType);
      if (orderDelta !== 0) return orderDelta;

      return getPositionRoleLabel(a, ship).localeCompare(
        getPositionRoleLabel(b, ship),
        "de",
      );
    },
  );
}

function hasMyTeamFlex(team: any) {
  return (
    myFlexRegistration.value?.type === "flex_team" &&
    myFlexRegistration.value?.team?.id === team.id
  );
}

function getTeamFlexRegistrations(team: any) {
  return sortRegistrations(
    activeRegistrations.value.filter(
      (registration: any) =>
        registration.type === "flex_team" && registration.team?.id === team.id,
    ),
  );
}

function getRelevantPositionRegistration(pos: any) {
  const registrations = positionRegistrations.value.get(pos.id) ?? [];
  if (!registrations.length) return null;

  const assignedUserId = pos.assigned_user?.id;

  if (assignedUserId) {
    const assignedRegistration = registrations.find(
      (registration: any) =>
        registration.user?.id === assignedUserId &&
        getNormalizedRegistrationStatus(registration.status) === "approved",
    );

    if (assignedRegistration) return assignedRegistration;
  }

  return registrations[0];
}

function getPositionRegistrations(pos: any) {
  return positionRegistrations.value.get(pos.id) ?? [];
}

function getPositionPendingCount(pos: any) {
  return getPositionRegistrations(pos).filter(
    (registration: any) =>
      getNormalizedRegistrationStatus(registration.status) === "pending",
  ).length;
}

function getEffectivePositionState(pos: any) {
  const registration = getRelevantPositionRegistration(pos);
  const status = getNormalizedRegistrationStatus(registration?.status);

  if (status === "pending") return "pending";
  if (status === "approved" || pos.status === "filled") return "filled";
  return "open";
}

function canSignupPosition(pos: any) {
  if (!props.signupOpen) return false;
  if (myFlexRegistration.value) return false;
  if (normalizePositionType(pos.position_type) === "secondary") return false;

  const positionType = normalizePositionType(pos.position_type);
  return !myPositionTypes.value.has(positionType);
}

function isPositionInteractive(pos: any) {
  return getEffectivePositionState(pos) === "open" && canSignupPosition(pos);
}

function getPositionStatusLabel(pos: any) {
  const state = getEffectivePositionState(pos);

  if (state === "filled") return "Besetzt";
  if (state === "pending") return "Anfrage";
  if (normalizePositionType(pos.position_type) === "secondary") return "Auto";
  return "Offen";
}

function getPositionStatusColor(pos: any) {
  const state = getEffectivePositionState(pos);

  if (state === "filled") return "info";
  if (state === "pending") return "warning";
  if (normalizePositionType(pos.position_type) === "secondary")
    return "neutral";
  return canSignupPosition(pos) ? "primary" : "neutral";
}

function getPositionOccupantLabel(pos: any) {
  const registration = getRelevantPositionRegistration(pos);
  const status = getNormalizedRegistrationStatus(registration?.status);

  if (registration?.user) {
    if (status === "pending") {
      const pendingCount = getPositionPendingCount(pos);

      if (isPositionInteractive(pos)) {
        return pendingCount > 1
          ? `${pendingCount} Anfragen offen • Klicken zum Anfragen`
          : `${getUserLabel(registration.user)} angefragt • Klicken zum Anfragen`;
      }

      return pendingCount > 1
        ? `${pendingCount} Anfragen offen`
        : `${getUserLabel(registration.user)} angefragt`;
    }
    return getUserLabel(registration.user);
  }

  if (pos.assigned_user) {
    return getUserLabel(pos.assigned_user);
  }

  if (canSignupPosition(pos)) return "Klicken zum Anfragen";

  const positionType = normalizePositionType(pos.position_type);
  if (
    positionType === "secondary" &&
    getEffectivePositionState(pos) === "open"
  ) {
    return "Automatisch mit Primär";
  }

  if (myFlexRegistration.value) return "Flex bereits eingetragen";

  if (myPositionTypes.value.has(positionType)) {
    return `${POSITION_TYPE_BADGE_LABELS[positionType]} bereits belegt`;
  }

  return "Noch frei";
}

function getPositionTextClass(pos: any) {
  const state = getEffectivePositionState(pos);

  if (state === "pending") {
    return isPositionInteractive(pos)
      ? "text-yellow-200"
      : "text-yellow-300/80";
  }
  if (state === "filled") return "text-(--ui-text-muted)";
  return canSignupPosition(pos)
    ? "text-(--ui-primary)/80"
    : "text-(--ui-text-muted)";
}

function getRegistrationStatusLabel(registration: any) {
  if (getNormalizedRegistrationStatus(registration.status) === "pending")
    return "Anfrage";
  return null;
}

function getRegistrationStatusColor(registration: any) {
  if (getNormalizedRegistrationStatus(registration.status) === "pending")
    return "warning";
  return "neutral";
}

function positionClasses(pos: any) {
  const state = getEffectivePositionState(pos);

  if (state === "filled") {
    return "border-(--ui-info)/18 bg-(--ui-info)/6";
  }

  if (state === "pending") {
    if (isPositionInteractive(pos)) {
      return "border-yellow-500/24 bg-yellow-500/8 cursor-pointer hover:border-yellow-400/45 hover:bg-yellow-500/14";
    }

    return "border-yellow-500/18 bg-yellow-500/6";
  }

  if (canSignupPosition(pos)) {
    return "border-(--ui-primary)/22 bg-(--ui-primary)/6 cursor-pointer hover:border-(--ui-primary)/42 hover:bg-(--ui-primary)/12";
  }

  return "border-(--ui-border)/20 bg-(--ui-bg-muted)/30";
}

function handlePositionClick(team: any, ship: any, pos: any) {
  if (isPositionInteractive(pos)) {
    emit("signupPosition", team, ship, pos);
  }
}

function removeRegistration(registration: any) {
  emit("removeRegistration", registration);
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="
        myFlexRegistration?.type === 'flex' ||
        myFlexRegistration?.type === 'flex_team'
      "
      class="rounded-xl border border-(--ui-primary)/12 bg-(--ui-bg)/70 px-3.5 py-3 ring-1 ring-inset ring-white/5"
    >
      <div class="flex items-start gap-2.5">
        <UIcon
          name="i-lucide-badge-info"
          class="mt-0.5 h-4 w-4 shrink-0 text-(--ui-primary)"
        />
        <div class="min-w-0">
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-(--ui-primary)/75"
          >
            Dein Flex-Status
          </p>
          <p class="mt-1 text-sm text-white">
            <template v-if="myFlexRegistration.type === 'flex'">
              Du bist aktuell als Flex für die gesamte Mission eingetragen.
            </template>
            <template v-else>
              Du bist aktuell als Team-Flex für
              {{ myFlexRegistration.team?.name || "dieses Team" }} eingetragen.
            </template>
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="missionFlexRegistrations.length"
      class="rounded-xl border border-(--ui-primary)/12 bg-(--ui-bg)/70 px-3.5 py-3 ring-1 ring-inset ring-white/5"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-(--ui-primary)/75"
          >
            Mission-Flex
          </p>
          <p class="mt-1 text-[11px] text-(--ui-text-muted)">
            Direkt für die Mission eingetragene Teilnehmer
          </p>
        </div>
        <UBadge color="primary" variant="subtle" size="sm">
          {{ missionFlexRegistrations.length }}
        </UBadge>
      </div>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <div
          v-for="registration in missionFlexRegistrations"
          :key="registration.id"
          class="inline-flex max-w-full items-center gap-2 rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 px-2 py-1.5"
        >
          <NuxtImg
            class="h-4 w-4 shrink-0 rounded-full object-cover"
            :src="
              getAssetId(registration.user?.avatar) ??
              '88adb941-f746-405d-bcc4-c2804fb48e33'
            "
            :alt="getUserLabel(registration.user)"
          />
          <span class="truncate text-xs text-white">
            {{ getUserLabel(registration.user) }}
          </span>
          <UBadge
            v-if="getRegistrationStatusLabel(registration)"
            :color="getRegistrationStatusColor(registration) as any"
            variant="subtle"
            size="xs"
          >
            {{ getRegistrationStatusLabel(registration) }}
          </UBadge>
          <UButton
            v-if="canManageRegistrations"
            size="xs"
            color="error"
            variant="ghost"
            icon="i-lucide-user-minus"
            @click.stop="removeRegistration(registration)"
          />
        </div>
      </div>
    </div>

    <div
      v-if="!teams?.length"
      class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/30 p-5 text-center text-(--ui-muted-foreground)"
    >
      <UIcon name="i-lucide-users" class="mx-auto mb-2 h-10 w-10 opacity-30" />
      <p>Noch keine Teams für diese Mission erstellt.</p>
    </div>

    <div
      v-for="team in teams"
      :key="team.id"
      class="overflow-hidden rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 ring-1 ring-inset ring-white/5"
    >
      <div
        class="flex flex-col gap-2 border-b border-(--ui-primary)/10 bg-linear-to-r from-(--ui-primary)/7 via-transparent to-transparent px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-users"
              class="h-3.5 w-3.5 text-(--ui-primary)"
            />
            <h3 class="m-0! text-sm font-semibold text-white">
              {{ team.name }}
            </h3>
            <UBadge
              v-if="hasMyTeamFlex(team)"
              color="primary"
              variant="subtle"
              size="xs"
            >
              Dein Team-Flex
            </UBadge>
          </div>
          <p
            v-if="team.description"
            class="mt-1 truncate text-[11px] text-(--ui-text-muted)"
          >
            {{ team.description }}
          </p>
          <div
            v-if="getTeamDepartmentLabel(team)"
            class="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md border border-(--ui-primary)/10 bg-(--ui-bg)/55 px-2 py-1"
          >
            <UIcon
              name="i-lucide-building-2"
              class="h-3 w-3 shrink-0 text-(--ui-primary)/80"
            />
            <span
              class="truncate text-[11px] font-medium text-(--ui-text-highlighted)"
            >
              Fokus: {{ getTeamDepartmentLabel(team) }}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ getTeamShipCount(team) }} Schiffe
          </UBadge>
          <UBadge
            :color="(getTeamOpenPositions(team) ? 'primary' : 'neutral') as any"
            variant="subtle"
            size="sm"
          >
            {{ getTeamOpenPositions(team) }} offen
          </UBadge>
          <UBadge
            v-if="getTeamPendingPositions(team)"
            color="warning"
            variant="subtle"
            size="sm"
          >
            {{ getTeamPendingPositions(team) }} Anfrage
          </UBadge>
          <UButton
            v-if="canSignupFlex"
            size="xs"
            variant="outline"
            icon="i-lucide-user-plus"
            label="Flex"
            @click="$emit('signupFlexTeam', team)"
          />
        </div>
      </div>

      <div
        v-if="getTeamFlexRegistrations(team).length"
        class="border-b border-(--ui-primary)/8 bg-(--ui-bg)/50 px-3.5 py-2.5"
      >
        <div
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <p
            class="text-[11px] font-medium uppercase tracking-[0.16em] text-(--ui-text-muted)"
          >
            Team-Flex
          </p>
          <div class="flex flex-wrap gap-1.5">
            <div
              v-for="registration in getTeamFlexRegistrations(team)"
              :key="registration.id"
              class="inline-flex max-w-full items-center gap-2 rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 px-2 py-1.5"
            >
              <NuxtImg
                class="h-4 w-4 shrink-0 rounded-full object-cover"
                :src="
                  getAssetId(registration.user?.avatar) ??
                  '88adb941-f746-405d-bcc4-c2804fb48e33'
                "
                :alt="getUserLabel(registration.user)"
              />
              <span class="truncate text-xs text-white">
                {{ getUserLabel(registration.user) }}
              </span>
              <UBadge
                v-if="getRegistrationStatusLabel(registration)"
                :color="getRegistrationStatusColor(registration) as any"
                variant="subtle"
                size="xs"
              >
                {{ getRegistrationStatusLabel(registration) }}
              </UBadge>
              <UButton
                v-if="canManageRegistrations"
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-user-minus"
                @click.stop="removeRegistration(registration)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="divide-y divide-(--ui-primary)/8">
        <div
          v-if="!team.ships?.length"
          class="px-3.5 py-4 text-center text-sm text-(--ui-muted-foreground)"
        >
          Keine Schiffe zugewiesen.
        </div>

        <div
          v-for="ship in team.ships"
          :key="ship.id"
          class="grid gap-3 px-3.5 py-3 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-(--ui-primary)/10 bg-(--ui-bg)/60"
              >
                <NuxtImg
                  v-if="ship.hangar_id?.ship?.thumbnail?.id"
                  :src="ship.hangar_id.ship.thumbnail.id"
                  class="h-7 w-12 object-contain"
                />
                <UIcon
                  v-else
                  name="i-lucide-ship-wheel"
                  class="h-4 w-4 text-(--ui-text-muted)"
                />
              </div>

              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-white">
                  {{ getShipName(ship) }}
                </p>
                <p class="mt-0.5 truncate text-[11px] text-(--ui-text-muted)">
                  {{ getShipMeta(ship) || "Keine zusätzlichen Schiffsdaten" }}
                </p>
                <div class="mt-1.5 flex flex-wrap gap-1.5">
                  <UBadge color="neutral" variant="subtle" size="xs">
                    {{ getShipPositionCount(ship) }} Rollen
                  </UBadge>
                  <UBadge color="neutral" variant="subtle" size="xs">
                    Primär {{ getShipPositionSummary(ship, "primary") }}
                  </UBadge>
                  <UBadge color="neutral" variant="subtle" size="xs">
                    Sekundär {{ getShipPositionSummary(ship, "secondary") }}
                  </UBadge>
                  <UBadge
                    :color="
                      (getShipOpenPositions(ship)
                        ? 'primary'
                        : 'neutral') as any
                    "
                    variant="subtle"
                    size="xs"
                  >
                    {{ getShipOpenPositions(ship) }} offen
                  </UBadge>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="getShipPositionCount(ship)"
            class="grid gap-3 xl:grid-cols-2"
          >
            <div
              v-for="positionType in POSITION_TYPE_ORDER"
              :key="positionType"
              class="rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg)/45 p-2.5"
            >
              <div class="flex items-center justify-between gap-2">
                <p
                  class="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--ui-primary)/75"
                >
                  {{ POSITION_TYPE_LABELS[positionType] }}
                </p>
                <UBadge
                  :color="
                    (getShipOpenPositions(ship, positionType)
                      ? 'primary'
                      : 'neutral') as any
                  "
                  variant="subtle"
                  size="xs"
                >
                  {{ getShipPositionSummary(ship, positionType) }}
                </UBadge>
              </div>

              <div
                v-if="getShipPositionsByType(ship, positionType).length"
                class="mt-2 space-y-1.5"
              >
                <div
                  v-for="pos in getSortedPositions(ship, positionType)"
                  :key="pos.id"
                  class="rounded-lg border px-2.5 py-2 transition-all"
                  :class="positionClasses(pos)"
                  @click="handlePositionClick(team, ship, pos)"
                >
                  <UTooltip
                    :text="getPositionRoleDescription(pos, ship)"
                    :ui="{
                      content: 'max-w-[220px] h-fit',
                      text: 'whitespace-normal break-words',
                    }"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <p
                        class="truncate text-xs font-semibold leading-5 text-white mb-2! mt-0!"
                      >
                        {{ getPositionRoleLabel(pos, ship) }}
                      </p>
                      <div class="flex items-center gap-1">
                        <UIcon
                          v-if="
                            positionType === 'secondary' &&
                            getEffectivePositionState(pos) === 'open'
                          "
                          name="i-lucide-link-2"
                          class="h-3 w-3 shrink-0 text-(--ui-text-muted)/50"
                        />
                        <UBadge color="neutral" variant="subtle" size="xs">
                          {{ POSITION_TYPE_BADGE_LABELS[positionType] }}
                        </UBadge>
                        <UBadge
                          :color="getPositionStatusColor(pos) as any"
                          variant="subtle"
                          size="xs"
                        >
                          {{ getPositionStatusLabel(pos) }}
                        </UBadge>
                      </div>
                    </div>

                    <!-- <p
                      v-if="getPositionRoleDescription(pos, ship)"
                      class="mt-1 text-[11px] leading-4 text-(--ui-text-muted)"
                    >
                      {{ getPositionRoleDescription(pos, ship) }}
                    </p> -->

                    <p
                      class="mt-1.5 truncate text-[11px] m-0!"
                      :class="getPositionTextClass(pos)"
                    >
                      {{ getPositionOccupantLabel(pos) }}
                    </p>
                  </UTooltip>
                </div>
              </div>

              <p v-else class="mt-2 text-xs text-(--ui-text-muted)">
                Keine
                {{ POSITION_TYPE_LABELS[positionType].toLowerCase() }}
                definiert.
              </p>
            </div>
          </div>
          <p v-else class="text-xs text-(--ui-text-muted)">
            Keine Positionen definiert.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

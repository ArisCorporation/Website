<script setup lang="ts">
import { deleteItem, updateItem } from "@directus/sdk";
import { getMissionRoleLabel } from "~~/app/utils/ams-mission-roles";

const route = useRoute();
const { data: mission, refresh } = await useFetchAMSMission(
  route.params.id as string,
);

const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);
const toast = useToast();
const currentTimestamp = ref(Date.now());
let currentTimestampInterval: ReturnType<typeof setInterval> | null = null;
const managementAccessLevel = 3;
const POSITION_TYPE_ORDER = ["primary", "secondary"] as const;
type PositionType = (typeof POSITION_TYPE_ORDER)[number];

const POSITION_TYPE_BADGE_LABELS: Record<PositionType, string> = {
  primary: "Primär",
  secondary: "Sekundär",
};

const canManageMission = computed(
  () =>
    mission.value?.user_created?.id === currentUser.value?.id ||
    ((currentUser.value?.role as any)?.access_level ?? 0) >=
      managementAccessLevel,
);

function normalizePositionType(value?: string | null): PositionType {
  return value === "secondary" ? "secondary" : "primary";
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

const activeMyRegistrations = computed(() =>
  (mission.value?.registrations ?? []).filter(
    (registration: any) =>
      registration.user?.id === currentUser.value?.id &&
      isRegistrationEffectivelyActive(registration),
  ),
);

const rejectedMyRegistrations = computed(() =>
  (mission.value?.registrations ?? []).filter(
    (registration: any) =>
      registration.user?.id === currentUser.value?.id &&
      getNormalizedRegistrationStatus(registration.status) === "rejected",
  ),
);

const myFlexRegistration = computed(
  () =>
    activeMyRegistrations.value.find(
      (registration: any) =>
        registration.type === "flex" || registration.type === "flex_team",
    ) ?? null,
);

function getRegistrationPositionType(registration: any) {
  return normalizePositionType(registration?.position?.position_type);
}

const myPositionRegistrationsByType = computed(() => {
  const registrations = new Map<PositionType, any>();

  for (const registration of activeMyRegistrations.value) {
    if (registration.type !== "position") continue;

    const positionType = getRegistrationPositionType(registration);
    if (!registrations.has(positionType)) {
      registrations.set(positionType, registration);
    }
  }

  return registrations;
});

const sortedMyActiveRegistrations = computed(() => {
  const typeOrder: Record<string, number> = {
    flex: 0,
    flex_team: 1,
    position_primary: 2,
    position_secondary: 3,
  };

  return [...activeMyRegistrations.value].sort((a: any, b: any) => {
    const aKey =
      a.type === "position"
        ? `position_${getRegistrationPositionType(a)}`
        : a.type;
    const bKey =
      b.type === "position"
        ? `position_${getRegistrationPositionType(b)}`
        : b.type;

    return (typeOrder[aKey] ?? 99) - (typeOrder[bKey] ?? 99);
  });
});

const availablePositionTypes = computed(() =>
  POSITION_TYPE_ORDER.filter(
    (positionType) => !myPositionRegistrationsByType.value.has(positionType),
  ),
);

const signupModalOpen = ref(false);
const signupTarget = ref<{
  type: "flex" | "flex_team" | "position";
  team?: any;
  ship?: any;
  position?: any;
} | null>(null);

async function syncDiscordShare(silent = true) {
  if (!mission.value) return;

  try {
    await $fetch(`/api/ams/missions/${mission.value.id}/sync-discord`, {
      method: "POST",
    });
  } catch (error: any) {
    console.error("Discord mission sync failed", error);

    if (!silent) {
      toast.add({
        title: "Discord-Embed nicht aktualisiert",
        description:
          error?.data?.statusMessage ||
          "Die bestehende Discord-Nachricht konnte nicht aktualisiert werden.",
        color: "warning",
        icon: "i-lucide-alert-triangle",
      });
    }
  }
}

async function handleMissionSignupRegistered() {
  await syncDiscordShare();
  await refresh();
}

function openSignup(
  type: "flex" | "flex_team" | "position",
  team?: any,
  ship?: any,
  position?: any,
) {
  if (!missionCanRegister.value) {
    toast.add({
      title: signupClosedTitle.value,
      description: signupClosedMessage.value,
      color: signupClosedColor.value as any,
      icon: signupClosedIcon.value,
    });
    return;
  }

  if (type === "flex" || type === "flex_team") {
    if (activeMyRegistrations.value.length) {
      toast.add({
        title: "Bereits eingetragen",
        description:
          "Flex-Anmeldungen sind nur möglich, wenn du noch keine andere aktive Rolle oder Flex-Anmeldung hast.",
        color: "warning",
        icon: "i-lucide-ban",
      });
      return;
    }
  }

  if (type === "position") {
    const positionType = normalizePositionType(position?.position_type);

    if (myFlexRegistration.value) {
      toast.add({
        title: "Flex bereits aktiv",
        description:
          "Melde dich zuerst vom Flex-Eintrag ab, bevor du eine feste Position anfragst.",
        color: "warning",
        icon: "i-lucide-ban",
      });
      return;
    }

    if (myPositionRegistrationsByType.value.has(positionType)) {
      toast.add({
        title: "Rollenart bereits belegt",
        description: `Du hast bereits eine ${POSITION_TYPE_BADGE_LABELS[positionType]}-Funktion in dieser Mission.`,
        color: "warning",
        icon: "i-lucide-ban",
      });
      return;
    }
  }

  signupTarget.value = { type, team, ship, position };
  signupModalOpen.value = true;
}

function getNormalizedRegistrationStatus(status?: string) {
  if (status === "tentative") return "approved";
  return status ?? "pending";
}

async function removeRegistration(
  registration: any,
  successTitle = "Teilnehmer entfernt",
) {
  const reg = registration;
  if (!reg) return;

  try {
    if (reg.type === "position" && reg.position?.id) {
      await useDirectus(
        updateItem("ams_mission_positions" as any, reg.position.id, {
          status: "open",
          assigned_user: null,
        }),
      );
    }
    await useDirectus(deleteItem("ams_mission_registrations" as any, reg.id));
    toast.add({
      title: successTitle,
      color: "success",
      icon: "i-lucide-user-minus",
    });
    await syncDiscordShare();
    await refresh();
  } catch {
    toast.add({
      title: "Fehler",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
  }
}

async function unregister(registration: any) {
  await removeRegistration(registration, "Abgemeldet");
}

function findMissionPosition(positionId?: string) {
  if (!positionId) return null;
  return (
    (mission.value?.teams ?? [])
      .flatMap((team: any) => team.ships ?? [])
      .flatMap((ship: any) => ship.positions ?? [])
      .find((position: any) => position.id === positionId) ?? null
  );
}

function findMissionShipByPositionId(positionId?: string) {
  if (!positionId) return null;

  return (
    (mission.value?.teams ?? [])
      .flatMap((team: any) => team.ships ?? [])
      .find((ship: any) =>
        (ship.positions ?? []).some(
          (position: any) => position.id === positionId,
        ),
      ) ?? null
  );
}

function getMissionRoleSourceForPosition(position?: any, ship?: any) {
  return (
    ship?.hangar_id?.ship ??
    findMissionShipByPositionId(position?.id)?.hangar_id?.ship ??
    null
  );
}

function getRegistrationTypeLabel(reg: any) {
  if (reg.type === "flex") return "Flex-Anmeldung (gesamte Mission)";
  if (reg.type === "flex_team")
    return `Team-Flex: ${reg.team?.name || "Unbekanntes Team"}`;

  const positionType = getRegistrationPositionType(reg);
  const roleLabel = getMissionRoleLabel(
    reg.position?.role,
    getMissionRoleSourceForPosition(reg.position),
    positionType,
  );
  const positionTypeLabel = POSITION_TYPE_BADGE_LABELS[positionType];
  const teamSuffix = reg.team?.name ? ` (${reg.team.name})` : "";

  return `${positionTypeLabel}: ${roleLabel}${teamSuffix}`;
}

function canResetRejectedRegistration(reg: any) {
  if (getNormalizedRegistrationStatus(reg.status) !== "rejected") return false;
  if (!reg.position?.id) return true;

  const position = findMissionPosition(reg.position.id);
  return position?.status === "open";
}

function getRejectedResetHint(reg: any) {
  if (!reg.position?.id) return "Anfrage wieder auf ausstehend setzen";

  const position = findMissionPosition(reg.position.id);

  if (!position) return "Position nicht gefunden";
  if (position.status !== "open") {
    return "Die Position ist inzwischen wieder vergeben oder bereits erneut angefragt.";
  }

  return "Anfrage wieder auf ausstehend setzen";
}

async function updateRegistrationStatus(
  id: string,
  status: "approved" | "rejected" | "pending",
) {
  const reg = mission.value?.registrations?.find((item: any) => item.id === id);
  if (!reg) return;

  const currentStatus = getNormalizedRegistrationStatus(reg.status);

  if (
    status === "pending" &&
    reg.position?.id &&
    !canResetRejectedRegistration({ ...reg, status: currentStatus })
  ) {
    toast.add({
      title: "Widerruf nicht möglich",
      description: getRejectedResetHint(reg),
      color: "warning",
      icon: "i-lucide-rotate-ccw",
    });
    return;
  }

  try {
    await useDirectus(
      updateItem("ams_mission_registrations" as any, id, { status }),
    );

    if (status === "approved" && reg?.position?.id) {
      await useDirectus(
        updateItem("ams_mission_positions" as any, reg.position.id, {
          status: "filled",
          assigned_user: reg.user?.id,
        }),
      );
    } else if (status === "rejected" && reg?.position?.id) {
      await useDirectus(
        updateItem("ams_mission_positions" as any, reg.position.id, {
          status: "open",
          assigned_user: null,
        }),
      );
    } else if (status === "pending" && reg?.position?.id) {
      await useDirectus(
        updateItem("ams_mission_positions" as any, reg.position.id, {
          status: "pending",
          assigned_user: null,
        }),
      );
    }

    const statusFeedback = {
      approved: {
        title: "Genehmigt",
        description: "Die Anmeldung ist bestätigt.",
        color: "success",
        icon: "i-lucide-check",
      },
      rejected: {
        title: "Abgelehnt",
        description: "Die Anmeldung wurde abgelehnt.",
        color: "error",
        icon: "i-lucide-x",
      },
      pending: {
        title: "Wieder geöffnet",
        description: "Die Anmeldung ist wieder ausstehend.",
        color: "warning",
        icon: "i-lucide-rotate-ccw",
      },
    } as const;

    toast.add({
      title: statusFeedback[status].title,
      description: statusFeedback[status].description,
      color: statusFeedback[status].color as any,
      icon: statusFeedback[status].icon,
    });
    await syncDiscordShare();
    await refresh();
  } catch {
    toast.add({
      title: "Fehler",
      color: "error",
      icon: "i-lucide-alert-triangle",
    });
  }
}

const DEFAULT_TYPE_CONFIG = {
  label: "Sonstiges",
  icon: "i-lucide-circle-dot",
  color: "text-gray-400",
};

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  mining: {
    label: "Bergbau",
    icon: "i-lucide-pickaxe",
    color: "text-yellow-400",
  },
  combat: { label: "Kampf", icon: "i-lucide-sword", color: "text-red-400" },
  cargo: { label: "Fracht", icon: "i-lucide-package", color: "text-blue-400" },
  exploration: {
    label: "Erkundung",
    icon: "i-lucide-telescope",
    color: "text-purple-400",
  },
  rescue: {
    label: "Rettung",
    icon: "i-lucide-heart-pulse",
    color: "text-green-400",
  },
  patrol: {
    label: "Patrouille",
    icon: "i-lucide-shield",
    color: "text-orange-400",
  },
  event: { label: "Event", icon: "i-lucide-star", color: "text-pink-400" },
  other: DEFAULT_TYPE_CONFIG,
};

const typeConf = computed(
  (): { label: string; icon: string; color: string } => {
    const missionType = mission.value?.mission_type as
      | keyof typeof TYPE_CONFIG
      | undefined;
    return (missionType && TYPE_CONFIG[missionType]) || DEFAULT_TYPE_CONFIG;
  },
);

const formattedDate = computed(() => {
  if (!mission.value?.planned_date) return "Datum offen";
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(mission.value.planned_date));
});

const formattedDuration = computed(() => {
  const durationMinutes = Number((mission.value as any)?.duration ?? 0);

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return null;

  const hoursValue = durationMinutes / 60;
  return `${Number(hoursValue.toFixed(2)).toString().replace(".", ",")} h`;
});

function getRegistrationStatusLabel(registration: any) {
  const status = getNormalizedRegistrationStatus(registration?.status);
  if (status === "approved") return "Angenommen";
  if (status === "rejected") return "Abgelehnt";
  return "Ausstehend";
}

function getRegistrationStatusColor(registration: any) {
  const status = getNormalizedRegistrationStatus(registration?.status);
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warning";
}

const pendingRegistrations = computed(() =>
  (mission.value?.registrations ?? []).filter(
    (r: any) => getNormalizedRegistrationStatus(r.status) === "pending",
  ),
);

const approvedRegistrationsCount = computed(
  () =>
    (mission.value?.registrations ?? []).filter(
      (r: any) => getNormalizedRegistrationStatus(r.status) === "approved",
    ).length,
);

const rejectedRegistrationsCount = computed(
  () =>
    (mission.value?.registrations ?? []).filter(
      (r: any) => getNormalizedRegistrationStatus(r.status) === "rejected",
    ).length,
);

const DEFAULT_STATUS_CONFIG = { label: "Entwurf", color: "neutral" };

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: DEFAULT_STATUS_CONFIG,
  active: { label: "Aktiv", color: "success" },
  cancelled: { label: "Abgebrochen", color: "error" },
  completed: { label: "Abgeschlossen", color: "info" },
  archived: { label: "Archiviert", color: "neutral" },
};

const statusConf = computed((): { label: string; color: string } => {
  const missionStatus = mission.value?.status as
    | keyof typeof STATUS_CONFIG
    | undefined;
  return (
    (missionStatus && STATUS_CONFIG[missionStatus]) || DEFAULT_STATUS_CONFIG
  );
});

const openPositionsCount = computed(
  () =>
    (mission.value?.teams ?? [])
      .flatMap((t: any) => t.ships ?? [])
      .flatMap((s: any) => s.positions ?? [])
      .filter((p: any) => p.status === "open").length,
);

const allPositions = computed(() =>
  (mission.value?.teams ?? [])
    .flatMap((team: any) => team.ships ?? [])
    .flatMap((ship: any) => ship.positions ?? []),
);

const filledPositionsCount = computed(
  () =>
    allPositions.value.filter((position: any) => position.status === "filled")
      .length,
);

const pendingPositionsCount = computed(
  () =>
    allPositions.value.filter((position: any) => position.status === "pending")
      .length,
);

const teamCount = computed(() => mission.value?.teams?.length ?? 0);
const registrationCount = computed(
  () =>
    (mission.value?.registrations ?? []).filter(
      (registration: any) =>
        getNormalizedRegistrationStatus(registration.status) !== "rejected",
    ).length,
);

const missionStartTimestamp = computed(() => {
  if (!mission.value?.planned_date) return null;

  const parsedDate = new Date(mission.value.planned_date).getTime();
  return Number.isFinite(parsedDate) ? parsedDate : null;
});

const missionHasStarted = computed(() => {
  if (missionStartTimestamp.value === null) return false;
  return missionStartTimestamp.value <= currentTimestamp.value;
});

const missionCanRegister = computed(
  () => mission.value?.status === "active" && !missionHasStarted.value,
);
const canSignupMissionFlex = computed(
  () => missionCanRegister.value && !activeMyRegistrations.value.length,
);
const canSignupMorePositions = computed(
  () =>
    missionCanRegister.value &&
    !myFlexRegistration.value &&
    availablePositionTypes.value.length > 0,
);

const canManageOwnRegistration = computed(
  () => mission.value?.status === "active",
);

const signupClosedMessage = computed(() => {
  if (mission.value?.status === "cancelled") {
    return "Diese Mission wurde abgebrochen. Neue Anmeldungen sind nicht mehr möglich.";
  }

  if (mission.value?.status === "completed") {
    return "Diese Mission ist bereits abgeschlossen. Neue Anmeldungen sind nicht mehr möglich.";
  }

  if (missionHasStarted.value) {
    return "Die Mission läuft bereits. Neue Anmeldungen sind nicht mehr möglich.";
  }

  return "Anmeldung derzeit nicht möglich.";
});

const signupClosedTitle = computed(() => {
  if (mission.value?.status === "cancelled") return "Mission abgebrochen";
  if (mission.value?.status === "completed") return "Mission abgeschlossen";
  if (missionHasStarted.value) return "Mission läuft bereits";
  return "Anmeldung geschlossen";
});

const signupClosedColor = computed(() => {
  if (mission.value?.status === "cancelled") return "error";
  if (mission.value?.status === "completed") return "info";
  if (missionHasStarted.value) return "warning";
  return "neutral";
});

const signupClosedIcon = computed(() => {
  if (mission.value?.status === "cancelled") return "i-lucide-ban";
  if (mission.value?.status === "completed") return "i-lucide-flag";
  if (missionHasStarted.value) return "i-lucide-ban";
  return "i-lucide-lock";
});

const missionPlannerLabel = computed(() => {
  if (!mission.value?.user_created) return "Unbekannt";
  return getUserLabel(mission.value.user_created);
});

const remainingPositionTypeLabel = computed(() => {
  const labels = availablePositionTypes.value.map(
    (positionType) => POSITION_TYPE_BADGE_LABELS[positionType],
  );

  if (!labels.length) return "";
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} oder ${labels[labels.length - 1]}`;
});

const participationStateLabel = computed(() => {
  if (mission.value?.status === "cancelled") return "Mission abgebrochen";
  if (mission.value?.status === "completed") return "Mission abgeschlossen";

  if (activeMyRegistrations.value.length) {
    const statuses = activeMyRegistrations.value.map((registration: any) =>
      getNormalizedRegistrationStatus(registration.status),
    );
    const hasPending = statuses.includes("pending");
    const hasApproved = statuses.includes("approved");

    if (hasPending && hasApproved) return "Teilweise ausstehend";
    if (hasPending) return "Ausstehend";
    return "Eingetragen";
  }

  if (rejectedMyRegistrations.value.length) return "Anfrage abgelehnt";
  if (missionHasStarted.value) return "Mission läuft";
  return missionCanRegister.value ? "Anmeldung offen" : "Anmeldung geschlossen";
});

const participationStateColor = computed(() => {
  if (mission.value?.status === "cancelled") return "error";
  if (mission.value?.status === "completed") return "info";

  if (activeMyRegistrations.value.length) {
    return activeMyRegistrations.value.some(
      (registration: any) =>
        getNormalizedRegistrationStatus(registration.status) === "pending",
    )
      ? "warning"
      : "success";
  }

  if (rejectedMyRegistrations.value.length) return "error";
  if (missionHasStarted.value) return "warning";
  return missionCanRegister.value ? "success" : "neutral";
});

const sortedRegistrations = computed(() => {
  const statusOrder: Record<string, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
  };

  return [...(mission.value?.registrations ?? [])].sort((a: any, b: any) => {
    const statusDelta =
      (statusOrder[getNormalizedRegistrationStatus(a.status)] ?? 99) -
      (statusOrder[getNormalizedRegistrationStatus(b.status)] ?? 99);
    if (statusDelta !== 0) return statusDelta;

    return getUserLabel(a.user).localeCompare(getUserLabel(b.user), "de");
  });
});

const regStatusLabel: Record<string, string> = {
  pending: "Ausstehend",
  approved: "OK",
  rejected: "Abgelehnt",
};

const regStatusColor: Record<string, string> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

definePageMeta({
  layout: "ams",
  auth: true,
});

onMounted(() => {
  currentTimestampInterval = setInterval(() => {
    currentTimestamp.value = Date.now();
  }, 15000);
});

onBeforeUnmount(() => {
  if (!currentTimestampInterval) return;
  clearInterval(currentTimestampInterval);
});
</script>

<template>
  <div v-if="mission">
    <AMSPageHeader
      :icon="typeConf.icon"
      :title="mission.title"
      :description="`${typeConf.label} &bull; ${formattedDate}`"
    >
      <UButton
        v-if="canManageMission"
        :to="`/ams/missions/create?edit=${mission.id}`"
        icon="i-lucide-pencil"
        variant="outline"
        label="Bearbeiten"
      />
    </AMSPageHeader>

    <div
      class="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,20rem)]"
    >
      <div
        class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 p-4 ring-1 ring-inset ring-white/5"
      >
        <div class="flex flex-wrap items-center gap-2">
          <UBadge :color="statusConf.color as any" variant="subtle" size="sm">
            {{ statusConf.label }}
          </UBadge>
          <UBadge color="primary" variant="soft" size="sm">
            {{ typeConf.label }}
          </UBadge>
          <UBadge
            :color="participationStateColor as any"
            variant="outline"
            size="sm"
          >
            {{ participationStateLabel }}
          </UBadge>
        </div>
        <div class="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <div
            class="rounded-xl col-span-2 border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5"
          >
            <p
              class="text-[0.6rem] mt-1! mb-2! uppercase tracking-[0.24em] text-(--ui-text-muted)"
            >
              Start
            </p>
            <p class="mt-1 mb-0! text-sm font-medium text-white">
              {{ formattedDate }}
            </p>
          </div>
          <div
            v-if="formattedDuration"
            class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5"
          >
            <p
              class="text-[0.6rem] mt-1! mb-2! uppercase tracking-[0.24em] text-(--ui-text-muted)"
            >
              Vorr. Dauer
            </p>
            <p class="mt-1 mb-0! text-sm font-medium text-white">
              {{ formattedDuration }}
            </p>
          </div>
          <div
            class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5"
          >
            <p
              class="text-[0.6rem] mt-1! mb-2! uppercase tracking-[0.24em] text-(--ui-text-muted)"
            >
              Treffpunkt
            </p>
            <p class="mt-1 mb-0! text-sm font-medium text-white">
              {{ (mission as any).start_location || "Noch offen" }}
            </p>
          </div>
          <div
            class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5"
          >
            <p
              class="text-[0.6rem] mt-1! mb-2! uppercase tracking-[0.24em] text-(--ui-text-muted)"
            >
              Missionsort
            </p>
            <p class="mt-1 mb-0! text-sm font-medium text-white">
              {{ (mission as any).location || "Noch offen" }}
            </p>
          </div>
          <div
            class="rounded-xl col-span-2 border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5"
          >
            <p
              class="text-[0.6rem] m-0! uppercase tracking-[0.24em] text-(--ui-text-muted)"
            >
              Missionsleiter
            </p>
            <div
              v-if="mission.user_created"
              class="mt-1.5 flex items-center gap-3"
            >
              <NuxtImg
                class="h-10 w-10 shrink-0 rounded-full object-cover m-0!"
                :src="
                  getAssetId(mission.user_created.avatar) ??
                  '88adb941-f746-405d-bcc4-c2804fb48e33'
                "
                :alt="missionPlannerLabel"
              />
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-white mb-1! mt-2!">
                  {{ missionPlannerLabel }}
                </p>
                <p class="text-xs text-(--ui-text-muted) mt-0! mb-2!">
                  Ersteller der Mission
                </p>
              </div>
            </div>
            <p v-else class="mt-1 text-sm font-medium text-white">
              {{ missionPlannerLabel }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
        <div
          class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 px-3 py-3 ring-1 ring-inset ring-white/5"
        >
          <p
            class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)"
          >
            Anmeldungen
          </p>
          <p class="mt-1.5 text-xl font-semibold text-white">
            {{ registrationCount }}
          </p>
        </div>
        <div
          class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 px-3 py-3 ring-1 ring-inset ring-white/5"
        >
          <p
            class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)"
          >
            Offen
          </p>
          <p class="mt-1.5 text-xl font-semibold text-(--ui-primary)">
            {{ openPositionsCount }}
          </p>
        </div>
        <div
          class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 px-3 py-3 ring-1 ring-inset ring-white/5"
        >
          <p
            class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)"
          >
            Bestätigt
          </p>
          <p class="mt-1.5 text-xl font-semibold text-white">
            {{ approvedRegistrationsCount }}
          </p>
        </div>
        <div
          class="rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg-muted)/45 px-3 py-3 ring-1 ring-inset ring-white/5"
        >
          <p
            class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)"
          >
            Teams
          </p>
          <p class="mt-1.5 text-xl font-semibold text-white">
            {{ teamCount }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,20rem)]">
      <div class="space-y-4">
        <div
          v-if="mission.description"
          class="overflow-hidden rounded-2xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 ring-1 ring-inset ring-white/5"
        >
          <div
            class="flex items-center justify-between gap-3 border-b border-(--ui-primary)/10 px-4 py-3"
          >
            <div>
              <p
                class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-primary)/75"
              >
                Briefing
              </p>
              <h2 class="mt-1 text-base font-semibold text-white">
                Missionsbeschreibung
              </h2>
            </div>
            <UBadge color="neutral" variant="subtle" size="sm">
              Kompakt
            </UBadge>
          </div>
          <div
            class="prose prose-sm prose-invert max-w-none px-4 py-4 text-sm"
            v-html="mission.description"
          />
        </div>

        <div
          class="overflow-hidden rounded-2xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 ring-1 ring-inset ring-white/5"
        >
          <div
            class="flex flex-col gap-2 border-b border-(--ui-primary)/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p
                class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-primary)/75"
              >
                Crew Board
              </p>
              <h2 class="mt-1 text-base font-semibold text-white">
                Teams, Schiffe und Rollen
              </h2>
            </div>

            <div class="flex flex-wrap gap-2 text-xs">
              <UBadge color="primary" variant="subtle" size="sm">
                {{ openPositionsCount }} offen
              </UBadge>
              <UBadge
                v-if="pendingPositionsCount"
                color="warning"
                variant="subtle"
                size="sm"
              >
                {{ pendingPositionsCount }} in Prüfung
              </UBadge>
              <UBadge
                v-if="filledPositionsCount"
                color="info"
                variant="subtle"
                size="sm"
              >
                {{ filledPositionsCount }}/{{ allPositions.length }} besetzt
              </UBadge>
            </div>
          </div>

          <div class="p-4">
            <AMSPagesMissionsTeamView
              :teams="mission.teams"
              :registrations="mission.registrations"
              :my-active-registrations="activeMyRegistrations"
              :can-manage-registrations="canManageMission"
              :signup-open="missionCanRegister"
              @signup-flex-team="(team) => openSignup('flex_team', team)"
              @signup-position="
                (team, ship, pos) => openSignup('position', team, ship, pos)
              "
              @remove-registration="removeRegistration"
            />
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div
          class="relative z-10 rounded-2xl border border-(--ui-primary)/12 bg-(--ui-bg)/95 p-4 shadow-[0_18px_40px_rgba(3,8,15,0.28)] ring-1 ring-inset ring-white/5 backdrop-blur-sm xl:sticky xl:top-4 xl:bg-(--ui-bg)/92"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p
                class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-primary)/75"
              >
                Teilnahme
              </p>
              <h3 class="mt-1 text-base font-semibold text-white">
                {{
                  sortedMyActiveRegistrations.length
                    ? "Deine Anmeldungen"
                    : "Eintragen"
                }}
              </h3>
            </div>
            <UBadge
              :color="participationStateColor as any"
              variant="subtle"
              size="sm"
            >
              {{ participationStateLabel }}
            </UBadge>
          </div>

          <div v-if="sortedMyActiveRegistrations.length" class="mt-4 space-y-3">
            <div
              v-for="registration in sortedMyActiveRegistrations"
              :key="registration.id"
              class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p
                    class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)"
                  >
                    Anmeldung
                  </p>
                  <p class="mt-1.5 text-sm font-medium text-white">
                    {{ getRegistrationTypeLabel(registration) }}
                  </p>
                </div>
                <UBadge
                  :color="getRegistrationStatusColor(registration) as any"
                  variant="subtle"
                  size="xs"
                >
                  {{ getRegistrationStatusLabel(registration) }}
                </UBadge>
              </div>

              <p
                v-if="registration.note"
                class="mt-2 text-xs italic text-(--ui-text-muted)"
              >
                "{{ registration.note }}"
              </p>

              <div v-if="canManageOwnRegistration" class="mt-3 grid gap-2">
                <UButton
                  size="sm"
                  color="error"
                  variant="outline"
                  icon="i-lucide-user-minus"
                  label="Abmelden"
                  class="w-full justify-center"
                  @click="unregister(registration)"
                />
              </div>
            </div>

            <div
              v-if="canSignupMorePositions"
              class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5 text-xs text-(--ui-text-muted)"
            >
              Du kannst noch eine {{ remainingPositionTypeLabel }}-Funktion
              anfragen.
            </div>
          </div>

          <div v-else-if="missionCanRegister" class="mt-4 space-y-3">
            <p class="text-sm leading-6 text-(--ui-text-muted)">
              Flex direkt anmelden oder unten gezielt eine feste Rolle anfragen.
            </p>
            <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <UButton
                icon="i-lucide-user-plus"
                label="Flex anmelden"
                variant="subtle"
                class="w-full justify-center"
                :disabled="!canSignupMissionFlex"
                @click="openSignup('flex')"
              />
            </div>
            <div
              class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-2.5 text-xs text-(--ui-text-muted)"
            >
              Feste Rollen laufen immer zuerst über eine Freigabe.
            </div>
          </div>

          <UAlert
            v-else
            class="mt-4"
            :title="signupClosedTitle"
            :description="signupClosedMessage"
            :color="signupClosedColor as any"
            variant="subtle"
            :icon="signupClosedIcon"
          />

          <div v-if="rejectedMyRegistrations.length" class="mt-4 space-y-2">
            <p
              class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)"
            >
              Abgelehnte Anfragen
            </p>
            <div
              v-for="registration in rejectedMyRegistrations"
              :key="registration.id"
              class="rounded-xl border border-red-500/15 bg-red-500/5 px-3 py-3"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-white">
                    {{ getRegistrationTypeLabel(registration) }}
                  </p>
                  <p class="mt-1 text-xs text-red-200/80">
                    Der Mission Planner kann diese Anfrage wieder öffnen.
                  </p>
                </div>
                <UBadge color="error" variant="subtle" size="xs">
                  {{ getRegistrationStatusLabel(registration) }}
                </UBadge>
              </div>

              <p
                v-if="registration.note"
                class="mt-2 text-xs italic text-(--ui-text-muted)"
              >
                "{{ registration.note }}"
              </p>
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 p-4 ring-1 ring-inset ring-white/5"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p
                class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-primary)/75"
              >
                Snapshot
              </p>
              <h3 class="mt-1 text-base font-semibold text-white">Lagebild</h3>
            </div>
            <UBadge color="neutral" variant="subtle" size="sm">
              Aktuell
            </UBadge>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <div
              class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3"
            >
              <p
                class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)"
              >
                Rollen
              </p>
              <p class="mt-1.5 text-lg font-semibold text-white">
                {{ filledPositionsCount }}/{{ allPositions.length }}
              </p>
            </div>
            <div
              class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3"
            >
              <p
                class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)"
              >
                Ausstehend
              </p>
              <p class="mt-1.5 text-lg font-semibold text-white">
                {{ pendingRegistrations.length }}
              </p>
            </div>
            <div
              class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3"
            >
              <p
                class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)"
              >
                Abgelehnt
              </p>
              <p class="mt-1.5 text-lg font-semibold text-white">
                {{ rejectedRegistrationsCount }}
              </p>
            </div>
            <div
              class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3"
            >
              <p
                class="text-[0.6rem] uppercase tracking-[0.22em] text-(--ui-text-muted)"
              >
                Teilnehmer
              </p>
              <p class="mt-1.5 text-lg font-semibold text-white">
                {{ approvedRegistrationsCount + pendingRegistrations.length }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="canManageMission && mission.registrations?.length"
          class="rounded-2xl border border-(--ui-primary)/10 bg-(--ui-bg-muted)/45 p-4 ring-1 ring-inset ring-white/5"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p
                class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-primary)/75"
              >
                Planner Queue
              </p>
              <h3 class="mt-1 text-base font-semibold text-white m-0!">
                Anmeldungen
              </h3>
            </div>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-if="pendingRegistrations.length"
                color="warning"
                variant="subtle"
                size="sm"
              >
                {{ pendingRegistrations.length }} ausstehend
              </UBadge>
              <UBadge
                v-if="rejectedRegistrationsCount"
                color="error"
                variant="subtle"
                size="sm"
              >
                {{ rejectedRegistrationsCount }} abgelehnt
              </UBadge>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <div
              v-for="reg in sortedRegistrations"
              :key="reg.id"
              class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-3 py-3"
            >
              <div class="flex items-start gap-2.5">
                <NuxtImg
                  class="h-8 w-8 rounded-full object-cover shrink-0"
                  :src="
                    getAssetId(reg.user?.avatar) ??
                    '88adb941-f746-405d-bcc4-c2804fb48e33'
                  "
                  :alt="getUserLabel(reg.user)"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-white">
                        {{ getUserLabel(reg.user) }}
                      </p>
                      <p class="mt-0.5 truncate text-xs text-(--ui-text-muted)">
                        {{ getRegistrationTypeLabel(reg) }}
                      </p>
                    </div>
                    <UBadge
                      :color="
                        (regStatusColor[
                          getNormalizedRegistrationStatus(reg.status)
                        ] ?? 'neutral') as any
                      "
                      variant="subtle"
                      size="xs"
                      class="shrink-0"
                    >
                      {{
                        regStatusLabel[
                          getNormalizedRegistrationStatus(reg.status)
                        ] ?? reg.status
                      }}
                    </UBadge>
                  </div>

                  <p
                    v-if="reg.note"
                    class="mt-2 text-xs italic text-(--ui-text-muted)"
                  >
                    "{{ reg.note }}"
                  </p>

                  <div
                    v-if="
                      getNormalizedRegistrationStatus(reg.status) === 'pending'
                    "
                    class="mt-2 flex flex-wrap gap-2"
                  >
                    <UButton
                      size="xs"
                      color="success"
                      variant="outline"
                      icon="i-lucide-check"
                      label="Genehmigen"
                      @click="updateRegistrationStatus(reg.id, 'approved')"
                    />
                    <UButton
                      size="xs"
                      color="error"
                      variant="outline"
                      icon="i-lucide-x"
                      label="Ablehnen"
                      @click="updateRegistrationStatus(reg.id, 'rejected')"
                    />
                    <UButton
                      size="xs"
                      color="error"
                      variant="ghost"
                      icon="i-lucide-user-minus"
                      label="Entfernen"
                      @click="removeRegistration(reg)"
                    />
                  </div>

                  <div
                    v-else-if="
                      getNormalizedRegistrationStatus(reg.status) === 'rejected'
                    "
                    class="mt-2 flex flex-wrap gap-2"
                  >
                    <UTooltip :text="getRejectedResetHint(reg)">
                      <UButton
                        size="xs"
                        color="warning"
                        variant="ghost"
                        icon="i-lucide-rotate-ccw"
                        label="Widerrufen"
                        :disabled="!canResetRejectedRegistration(reg)"
                        @click="updateRegistrationStatus(reg.id, 'pending')"
                      />
                    </UTooltip>
                    <UButton
                      size="xs"
                      color="error"
                      variant="ghost"
                      icon="i-lucide-user-minus"
                      label="Entfernen"
                      @click="removeRegistration(reg)"
                    />
                  </div>
                  <div v-else class="mt-2">
                    <UButton
                      size="xs"
                      color="error"
                      variant="ghost"
                      icon="i-lucide-user-minus"
                      label="Entfernen"
                      @click="removeRegistration(reg)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AMSPagesMissionsSignupModal
      v-model:open="signupModalOpen"
      :mission-id="mission.id"
      :target="signupTarget"
      :signup-allowed="missionCanRegister"
      :signup-closed-message="signupClosedMessage"
      @registered="handleMissionSignupRegistered"
    />
  </div>

  <div v-else class="flex items-center justify-center py-24">
    <div class="text-center">
      <UIcon
        name="i-lucide-alert-circle"
        class="h-12 w-12 text-(--ui-muted-foreground) mx-auto mb-3"
      />
      <p class="text-(--ui-muted-foreground)">Mission nicht gefunden.</p>
      <UButton
        to="/ams/missions"
        variant="ghost"
        icon="i-lucide-arrow-left"
        label="Zurück"
        class="mt-4"
      />
    </div>
  </div>
</template>

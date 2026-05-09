import { directusServer, readItems, updateItem } from "./directus-server";

const DISCORD_API_BASE = "https://discord.com/api/v10";
const REMINDER_WINDOW_HOURS = 24;

const ROLE_LABELS: Record<string, string> = {
  pilot: "Pilot",
  co_pilot: "Co-Pilot",
  mining_operator: "Mining Operator",
  cargo_operator: "Cargo Operator",
  turret_operator: "Turret Operator",
  engineer: "Ingenieur",
  medic: "Medic",
  scout: "Aufklärer",
  passenger: "Passagier",
  other: "Sonstiges",
};

const POSITION_TYPE_LABELS: Record<string, string> = {
  primary: "Primär",
  secondary: "Sekundär",
};

type ReminderMission = {
  id: string;
  title?: string | null;
  mission_type?: string | null;
  status?: string | null;
  planned_date?: string | null;
  duration?: number | null;
  location?: string | null;
  start_location?: string | null;
};

type ReminderUser = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  discord_id?: string | null;
};

type ReminderTeam = {
  id?: string | null;
  name?: string | null;
};

type ReminderPosition = {
  id?: string | null;
  role?: string | null;
  position_type?: string | null;
};

type ReminderRegistration = {
  id: string;
  type?: "flex" | "flex_team" | "position" | string | null;
  status?: string | null;
  discord_reminder_key?: string | null;
  discord_reminder_sent_at?: string | null;
  mission?: ReminderMission | null;
  user?: ReminderUser | null;
  team?: ReminderTeam | null;
  position?: ReminderPosition | null;
};

type ReminderGroup = {
  mission: ReminderMission;
  user: ReminderUser;
  registrations: ReminderRegistration[];
};

type ReminderRunResult = {
  checked: number;
  sent: number;
  skippedNoDiscordId: number;
  skippedAlreadySent: number;
  skippedInvalid: number;
  failed: number;
};

type DiscordChannelResponse = {
  id: string;
};

function getMissionReminderKey(mission?: ReminderMission | null) {
  return mission?.planned_date?.trim() ?? "";
}

function getUserLabel(user?: ReminderUser | null) {
  if (!user) return "Teilnehmer";

  return [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "Teilnehmer";
}

function getRoleLabel(role?: string | null) {
  return ROLE_LABELS[role ?? ""] ?? role ?? "Position";
}

function getRegistrationLabel(registration: ReminderRegistration) {
  if (registration.type === "flex") {
    return "Flex (gesamte Mission)";
  }

  if (registration.type === "flex_team") {
    return registration.team?.name
      ? `Team-Flex (${registration.team.name})`
      : "Team-Flex";
  }

  const roleLabel = getRoleLabel(registration.position?.role);
  const positionTypeLabel =
    POSITION_TYPE_LABELS[registration.position?.position_type ?? "primary"] ??
    POSITION_TYPE_LABELS.primary;
  const teamSuffix = registration.team?.name ? ` (${registration.team.name})` : "";

  return `${positionTypeLabel}: ${roleLabel}${teamSuffix}`;
}

function formatMissionDate(value?: string | null) {
  if (!value) return "Datum offen";

  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMissionDuration(value?: number | null) {
  const durationMinutes = Number(value ?? 0);

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return null;
  }

  const durationHours = durationMinutes / 60;
  return `${Number(durationHours.toFixed(2)).toString().replace(".", ",")} h`;
}

function buildMissionUrl(siteUrl: string, missionId: string) {
  return `${siteUrl.replace(/\/+$/, "")}/ams/missions/${missionId}`;
}

function buildReminderDescription(group: ReminderGroup) {
  const labels = [...new Set(group.registrations.map(getRegistrationLabel))];
  return [
    `Erinnerung: Deine Mission **${group.mission.title || "Unbenannte Mission"}** startet bald.`,
    "",
    `Deine Teilnahme: ${labels.join(", ")}`,
  ].join("\n");
}

async function createDmChannel(discordUserId: string, botToken: string) {
  return await $fetch<DiscordChannelResponse>(
    `${DISCORD_API_BASE}/users/@me/channels`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${botToken}`,
      },
      body: {
        recipient_id: discordUserId,
      },
    },
  );
}

async function sendReminderDm(options: {
  botToken: string;
  discordUserId: string;
  embed: Record<string, unknown>;
}) {
  const channel = await createDmChannel(options.discordUserId, options.botToken);

  await $fetch(`${DISCORD_API_BASE}/channels/${channel.id}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${options.botToken}`,
    },
    body: {
      embeds: [options.embed],
    },
  });
}

async function fetchReminderCandidates(windowHours = REMINDER_WINDOW_HOURS) {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowHours * 60 * 60 * 1000);

  return (await directusServer.request(
    readItems("ams_mission_registrations" as any, {
      fields: [
        "id",
        "type",
        "status",
        "discord_reminder_key",
        "discord_reminder_sent_at",
        {
          mission: [
            "id",
            "title",
            "mission_type",
            "status",
            "planned_date",
            "duration",
            "location",
            "start_location",
          ],
        },
        {
          user: ["id", "first_name", "last_name", "discord_id"],
        },
        {
          team: ["id", "name"],
        },
        {
          position: ["id", "role", "position_type"],
        },
      ],
      filter: {
        status: {
          _eq: "approved",
        },
        mission: {
          status: {
            _eq: "active",
          },
          planned_date: {
            _nnull: true,
            _gt: now.toISOString(),
            _lte: windowEnd.toISOString(),
          },
        },
        user: {
          _nnull: true,
        },
      },
      limit: -1,
      sort: ["mission.planned_date", "user.first_name"],
    }),
  )) as ReminderRegistration[];
}

function groupReminderCandidates(registrations: ReminderRegistration[]) {
  const groups = new Map<string, ReminderGroup>();

  for (const registration of registrations) {
    const mission = registration.mission;
    const user = registration.user;

    if (!mission?.id || !user?.id) {
      continue;
    }

    const groupKey = `${mission.id}:${user.id}`;
    const existingGroup = groups.get(groupKey);

    if (existingGroup) {
      existingGroup.registrations.push(registration);
      continue;
    }

    groups.set(groupKey, {
      mission,
      user,
      registrations: [registration],
    });
  }

  return [...groups.values()];
}

async function markReminderSent(group: ReminderGroup, reminderKey: string) {
  const sentAt = new Date().toISOString();

  for (const registration of group.registrations) {
    await directusServer.request(
      updateItem("ams_mission_registrations" as any, registration.id, {
        discord_reminder_key: reminderKey,
        discord_reminder_sent_at: sentAt,
      }),
    );
  }
}

export async function sendPendingMissionReminderDms(options: {
  botToken?: string | null;
  siteUrl: string;
  windowHours?: number;
}) {
  const result: ReminderRunResult = {
    checked: 0,
    sent: 0,
    skippedNoDiscordId: 0,
    skippedAlreadySent: 0,
    skippedInvalid: 0,
    failed: 0,
  };

  if (!options.botToken) {
    console.warn("Mission reminder run skipped: Discord bot token missing");
    return result;
  }

  const registrations = await fetchReminderCandidates(options.windowHours);
  const groups = groupReminderCandidates(registrations);

  for (const group of groups) {
    result.checked += 1;

    const reminderKey = getMissionReminderKey(group.mission);
    if (!reminderKey) {
      result.skippedInvalid += 1;
      continue;
    }

    if (!group.user.discord_id?.trim()) {
      result.skippedNoDiscordId += 1;
      continue;
    }

    const alreadySent = group.registrations.some(
      (registration) => registration.discord_reminder_key === reminderKey,
    );

    if (alreadySent) {
      result.skippedAlreadySent += 1;
      continue;
    }

    try {
      const embed = {
        title: "Missionserinnerung",
        description: buildReminderDescription(group),
        color: 0x00ffe8,
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: "Start",
            value: formatMissionDate(group.mission.planned_date),
            inline: false,
          },
          ...(group.mission.duration
            ? [
                {
                  name: "Vorr. Dauer",
                  value: formatMissionDuration(group.mission.duration) ?? "Offen",
                  inline: true,
                },
              ]
            : []),
          ...(group.mission.location
            ? [
                {
                  name: "Treffpunkt",
                  value: group.mission.location,
                  inline: true,
                },
              ]
            : []),
          ...(group.mission.start_location
            ? [
                {
                  name: "Startort",
                  value: group.mission.start_location,
                  inline: true,
                },
              ]
            : []),
          {
            name: "Mission öffnen",
            value: buildMissionUrl(options.siteUrl, group.mission.id),
            inline: false,
          },
        ],
        footer: {
          text: getUserLabel(group.user),
        },
      };

      await sendReminderDm({
        botToken: options.botToken,
        discordUserId: group.user.discord_id.trim(),
        embed,
      });
      await markReminderSent(group, reminderKey);
      result.sent += 1;
    } catch (error) {
      result.failed += 1;
      console.error("Mission reminder DM failed", {
        missionId: group.mission.id,
        userId: group.user.id,
        error,
      });
    }
  }

  return result;
}

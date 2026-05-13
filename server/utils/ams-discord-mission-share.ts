const DISCORD_API_BASE = "https://discord.com/api/v10";
const AMS_BASE_URL = "https://ams.ariscorp.de";
const AUTHOR_ICON_URL =
  "https://cms.ariscorp.de/assets/cb368123-74a3-4021-bb70-2fffbcdd05fa";
const THUMBNAIL_URL =
  "https://cms.ariscorp.de/assets/3090187e-6348-4290-a878-af1b2b48c114";
const FALLBACK_FOOTER_ICON_URL =
  "https://cdn.discordapp.com/embed/avatars/1.png";

export const PRODUCTION_CHANNEL_ID = "1501988606527668497";
export const DEVELOPMENT_DM_USER_ID = "350897207261659137";
export const DISCORD_EMBED_COLOR = 0x00ffe8;
export const MISSION_PLANNER_ACCESS_LEVEL = 3;

const TYPE_LABELS: Record<string, string> = {
  mining: "Bergbau",
  combat: "Kampf",
  cargo: "Fracht",
  exploration: "Erkundung",
  rescue: "Rettung",
  patrol: "Patrouille",
  event: "Event",
  other: "Sonstiges",
};

type DiscordChannelResponse = {
  id: string;
};

type DiscordMessageResponse = {
  id: string;
  channel_id: string;
};

type DiscordBotIdentity = {
  username: string;
  avatarUrl: string;
};

type DiscordShareTarget = {
  channelId: string;
  messageId: string;
};

type DiscordShareTargets = Partial<
  Record<"PRODUCTION" | "DEVELOPMENT", DiscordShareTarget>
>;

type MissionPosition = {
  status?: string | null;
};

type MissionShip = {
  positions?: MissionPosition[] | null;
};

type MissionTeam = {
  ships?: MissionShip[] | null;
};

type MissionRegistration = {
  id: string;
  status?: string | null;
};

type MissionShareRecord = {
  id: string;
  title?: string | null;
  status?: string | null;
  mission_type?: string | null;
  planned_date?: string | null;
  duration?: number | null;
  description?: string | null;
  location?: string | null;
  start_location?: string | null;
  user_created?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  discord_share_channel_id?: string | null;
  discord_share_message_id?: string | null;
  discord_share_environment?: string | null;
  registrations?: MissionRegistration[] | null;
  teams?: MissionTeam[] | null;
  discord_share_targets?: DiscordShareTargets | string | null;
};

type ShareResult = {
  created?: boolean;
  updated?: boolean;
  skipped?: boolean;
  target?: "channel" | "dm";
  targetId?: string;
  message?: string;
};

type ProxyHeaders = Record<string, string> | undefined;

function stripHtml(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function getUserLabel(
  user?: { first_name?: string | null; last_name?: string | null } | null,
) {
  if (!user) return "Unbekannt";

  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || "Unbekannt";
}

function getDiscordEnvironment(
  environmentValue?: string | null,
): "PRODUCTION" | "DEVELOPMENT" {
  return String(environmentValue || "DEVELOPMENT").toUpperCase() ===
    "PRODUCTION"
    ? "PRODUCTION"
    : "DEVELOPMENT";
}

function getEventUrl(missionId: string) {
  return `${AMS_BASE_URL}/ams/missions/${missionId}`;
}

function getDiscordTimestamp(value?: string | null) {
  if (!value) return "Datum offen";

  const parsedDate = new Date(value);
  const unixSeconds = Math.floor(parsedDate.getTime() / 1000);

  if (!Number.isFinite(unixSeconds) || unixSeconds <= 0) return "Datum offen";
  return `<t:${unixSeconds}:F>`;
}

function formatDuration(value?: number | null) {
  const durationMinutes = Number(value ?? 0);

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return null;
  }

  const hoursValue = durationMinutes / 60;
  return `${Number(hoursValue.toFixed(2)).toString().replace(".", ",")} h`;
}

function hasMissionPlannerAccess(accessLevel?: number | null) {
  return Number(accessLevel ?? 0) >= MISSION_PLANNER_ACCESS_LEVEL;
}

function parseShareTargets(value: MissionShareRecord["discord_share_targets"]) {
  if (!value) return {} as DiscordShareTargets;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed
        ? (parsed as DiscordShareTargets)
        : {};
    } catch {
      return {};
    }
  }

  return value;
}

async function getBotIdentity(botToken: string): Promise<DiscordBotIdentity> {
  const botUser = await $fetch<{
    id: string;
    username: string;
    avatar?: string | null;
  }>(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bot ${botToken}`,
    },
  });

  const avatarUrl = botUser.avatar
    ? `https://cdn.discordapp.com/avatars/${botUser.id}/${botUser.avatar}.png`
    : FALLBACK_FOOTER_ICON_URL;

  return {
    username: botUser.username || "ArisCorp AMS Bot",
    avatarUrl,
  };
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

async function createDiscordMessage(
  channelId: string,
  botToken: string,
  body: object,
) {
  return await $fetch<DiscordMessageResponse>(
    `${DISCORD_API_BASE}/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${botToken}`,
      },
      body,
    },
  );
}

async function updateDiscordMessage(
  channelId: string,
  messageId: string,
  botToken: string,
  body: object,
) {
  return await $fetch<DiscordMessageResponse>(
    `${DISCORD_API_BASE}/channels/${channelId}/messages/${messageId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${botToken}`,
      },
      body,
    },
  );
}

function getDiscordErrorStatus(error: any) {
  return Number(error?.response?.status ?? error?.statusCode ?? 0);
}

async function fetchMissionShareRecord(
  missionId: string,
  requestHeaders: ProxyHeaders,
) {
  const response = await $fetch<{ data: MissionShareRecord }>(
    `/api/proxy/items/ams_missions/${missionId}`,
    {
      headers: requestHeaders,
      query: {
        fields: [
          "id",
          "title",
          "status",
          "mission_type",
          "planned_date",
          "duration",
          "description",
          "location",
          "start_location",
          "discord_share_channel_id",
          "discord_share_message_id",
          "discord_share_environment",
          "discord_share_targets",
          "user_created.id",
          "user_created.first_name",
          "user_created.last_name",
          "registrations.id",
          "registrations.status",
          "teams.ships.positions.status",
        ].join(","),
      },
    },
  );

  return response.data;
}

async function updateMissionShareRecord(
  missionId: string,
  requestHeaders: ProxyHeaders,
  payload: Record<string, any>,
) {
  await $fetch(`/api/proxy/items/ams_missions/${missionId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-ams-discord-internal": "1",
      ...(requestHeaders ?? {}),
    },
    body: payload,
  });
}

function getShareErrorMessage(error: any) {
  const directusMessage =
    error?.data?.errors?.[0]?.message ||
    error?.response?._data?.errors?.[0]?.message ||
    error?.response?._data?.error ||
    error?.message;

  return directusMessage || "Discord Share fehlgeschlagen";
}

function buildMissionEmbed(
  mission: MissionShareRecord,
  botIdentity: DiscordBotIdentity,
) {
  const approvedRegistrations =
    mission.registrations?.filter(
      (registration) => registration.status === "approved",
    ).length ?? 0;
  const pendingRegistrations =
    mission.registrations?.filter(
      (registration) => registration.status === "pending",
    ).length ?? 0;
  const registrationCount = approvedRegistrations + pendingRegistrations;
  const allPositions = (mission.teams ?? [])
    .flatMap((team) => team.ships ?? [])
    .flatMap((ship) => ship.positions ?? []);
  const openPositions = allPositions.filter(
    (position) => position.status === "open",
  ).length;
  const pendingPositions = allPositions.filter(
    (position) => position.status === "pending",
  ).length;
  const filledPositions = allPositions.filter(
    (position) => position.status === "filled",
  ).length;
  const description = truncate(
    stripHtml(mission.description) ||
      "Keine zusätzliche Missionsbeschreibung hinterlegt.",
    900,
  );
  const missionType = mission.mission_type ?? "other";
  const eventUrl = getEventUrl(mission.id);
  const duration = formatDuration(mission.duration);

  const baseFields = [
    {
      name: "Typ",
      value: TYPE_LABELS[missionType] ?? TYPE_LABELS.other,
      inline: true,
    },
    {
      name: "Start",
      value: getDiscordTimestamp(mission.planned_date),
      inline: true,
    },
    ...(duration
      ? [
          {
            name: "Vorr. Dauer",
            value: duration,
            inline: true,
          },
        ]
      : []),
    {
      name: "Planner",
      value: getUserLabel(mission.user_created),
      inline: true,
    },
    {
      name: "Treffpunkt",
      value: mission.start_location?.trim() || "Noch offen",
      inline: true,
    },
    {
      name: "Missionsort",
      value: mission.location?.trim() || "Noch offen",
      inline: true,
    },
    {
      name: "Anmeldungen",
      value: `${registrationCount}`,
      inline: true,
    },
    {
      name: "Status",
      value: `${approvedRegistrations} bestätigt • ${pendingRegistrations} ausstehend`,
      inline: false,
    },
    {
      name: "Positionen",
      value: `${filledPositions} besetzt • ${pendingPositions} angefragt • ${openPositions} frei`,
      inline: false,
    },
  ];

  return {
    author: {
      name: "ArisCorp Management System",
      url: AMS_BASE_URL,
      icon_url: AUTHOR_ICON_URL,
    },
    thumbnail: {
      url: THUMBNAIL_URL,
    },
    color: DISCORD_EMBED_COLOR,
    title: mission.title || "AMS Mission",
    url: eventUrl,
    description,
    fields: [
      ...baseFields,
      {
        name: "Event-Link",
        value: `[Mission im AMS öffnen](${eventUrl})`,
        inline: false,
      },
    ],
    footer: {
      text: botIdentity.username || "ArisCorp AMS Bot",
      icon_url: botIdentity.avatarUrl || FALLBACK_FOOTER_ICON_URL,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function upsertMissionDiscordShare(options: {
  missionId: string;
  createIfMissing: boolean;
  botToken: string;
  environment: "PRODUCTION" | "DEVELOPMENT";
  requestHeaders?: ProxyHeaders;
}) {
  const mission = await fetchMissionShareRecord(
    options.missionId,
    options.requestHeaders,
  );
  const shareTargets = parseShareTargets(mission.discord_share_targets);
  const legacyEnvironment = getDiscordEnvironment(
    mission.discord_share_environment,
  );

  if (
    !shareTargets[options.environment] &&
    mission.discord_share_channel_id &&
    mission.discord_share_message_id &&
    legacyEnvironment === options.environment
  ) {
    shareTargets[options.environment] = {
      channelId: mission.discord_share_channel_id,
      messageId: mission.discord_share_message_id,
    };
  }

  const botIdentity = await getBotIdentity(options.botToken);
  const embed = buildMissionEmbed(mission, botIdentity);
  const currentTarget = shareTargets[options.environment];

  const updatePayload = async (target: DiscordShareTarget) => {
    const nextTargets: DiscordShareTargets = {
      ...shareTargets,
      [options.environment]: target,
    };

    await updateMissionShareRecord(mission.id, options.requestHeaders, {
      discord_share_channel_id: target.channelId,
      discord_share_message_id: target.messageId,
      discord_share_environment: options.environment,
      discord_share_targets: nextTargets,
    });
  };

  if (currentTarget?.channelId && currentTarget?.messageId) {
    try {
      await updateDiscordMessage(
        currentTarget.channelId,
        currentTarget.messageId,
        options.botToken,
        {
          embeds: [embed],
          allowed_mentions: { parse: [] },
        },
      );

      await updatePayload(currentTarget);

      return {
        updated: true,
        target: options.environment === "PRODUCTION" ? "channel" : "dm",
        targetId: currentTarget.channelId,
        message: "Discord-Embed wurde aktualisiert.",
      } satisfies ShareResult;
    } catch (error) {
      if (getDiscordErrorStatus(error) !== 404 || !options.createIfMissing) {
        throw createError({
          statusCode: 502,
          statusMessage: getShareErrorMessage(error),
          cause: error,
        });
      }
    }
  }

  if (!options.createIfMissing) {
    return {
      skipped: true,
      message: "Kein Discord-Share für dieses Environment vorhanden.",
    } satisfies ShareResult;
  }

  const channelId =
    options.environment === "PRODUCTION"
      ? PRODUCTION_CHANNEL_ID
      : (await createDmChannel(DEVELOPMENT_DM_USER_ID, options.botToken)).id;

  const createdMessage = await createDiscordMessage(
    channelId,
    options.botToken,
    {
      embeds: [embed],
      allowed_mentions: { parse: [] },
    },
  );

  await updatePayload({
    channelId,
    messageId: createdMessage.id,
  });

  return {
    created: true,
    target: options.environment === "PRODUCTION" ? "channel" : "dm",
    targetId:
      options.environment === "PRODUCTION"
        ? PRODUCTION_CHANNEL_ID
        : DEVELOPMENT_DM_USER_ID,
    message:
      options.environment === "PRODUCTION"
        ? "Event wurde in den Produktions-Discord-Channel gesendet."
        : "Development-Vorschau wurde per Discord-DM gesendet.",
  } satisfies ShareResult;
}

export { getDiscordEnvironment, getShareErrorMessage, hasMissionPlannerAccess };

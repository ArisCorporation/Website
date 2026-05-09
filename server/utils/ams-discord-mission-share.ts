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

const ROLE_ORDER = [
  "pilot",
  "co_pilot",
  "mining_operator",
  "cargo_operator",
  "turret_operator",
  "engineer",
  "medic",
  "scout",
  "passenger",
  "other",
];

const POSITION_TYPE_LABELS: Record<"primary" | "secondary", string> = {
  primary: "Primär",
  secondary: "Sekundär",
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
  id: string;
  role?: string | null;
  status?: string | null;
  position_type?: "primary" | "secondary" | null;
};

type MissionShip = {
  id: string;
  hangar_id?: {
    id?: number | null;
    name?: string | null;
    ship?: {
      name?: string | null;
      hull?: {
        name?: string | null;
        manufacturer?: {
          name?: string | null;
        } | null;
      } | null;
    } | null;
  } | null;
  positions?: MissionPosition[] | null;
};

type MissionTeam = {
  id: string;
  name?: string | null;
  department?: {
    id?: string | null;
    name?: string | null;
  } | null;
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

function getPositionStatusLabel(position: MissionPosition) {
  if (position.status === "filled") return "besetzt";
  if (position.status === "pending") return "angefragt";
  return "frei";
}

function getPositionType(position: MissionPosition): "primary" | "secondary" {
  return position.position_type === "secondary" ? "secondary" : "primary";
}

function getRoleOrder(role?: string | null) {
  const index = ROLE_ORDER.indexOf(role ?? "");
  return index === -1 ? ROLE_ORDER.length : index;
}

function getShipLabel(ship: MissionShip) {
  const shipName = ship.hangar_id?.ship?.name?.trim();
  const hullName = ship.hangar_id?.ship?.hull?.name?.trim();
  const manufacturer = ship.hangar_id?.ship?.hull?.manufacturer?.name?.trim();
  const hullLabel = [manufacturer, hullName].filter(Boolean).join(" ");

  return (
    ship.hangar_id?.name?.trim() ||
    hullLabel ||
    shipName ||
    "Unbekanntes Schiff"
  );
}

function getSortedPositions(ship: MissionShip) {
  return [...(ship.positions ?? [])].sort((a, b) => {
    const typeDelta =
      (getPositionType(a) === "secondary" ? 1 : 0) -
      (getPositionType(b) === "secondary" ? 1 : 0);
    if (typeDelta !== 0) return typeDelta;

    const roleDelta = getRoleOrder(a.role) - getRoleOrder(b.role);
    if (roleDelta !== 0) return roleDelta;

    return (ROLE_LABELS[a.role ?? ""] ?? a.role ?? "").localeCompare(
      ROLE_LABELS[b.role ?? ""] ?? b.role ?? "",
      "de",
    );
  });
}

function buildPositionGroup(label: string, positions: MissionPosition[]) {
  if (!positions.length) return null;

  const lines = positions.map(
    (position) =>
      `• ${ROLE_LABELS[position.role ?? ""] ?? position.role ?? "Position"} ${getPositionStatusLabel(position)}`,
  );

  return `${label}:\n${lines.join("\n")}`;
}

function buildTeamField(team: MissionTeam) {
  const shipBlocks = (team.ships ?? []).map((ship) => {
    const sortedPositions = getSortedPositions(ship);
    const primaryPositions = sortedPositions.filter(
      (position) => getPositionType(position) === "primary",
    );
    const secondaryPositions = sortedPositions.filter(
      (position) => getPositionType(position) === "secondary",
    );
    const positionGroups = [
      buildPositionGroup(POSITION_TYPE_LABELS.primary, primaryPositions),
      buildPositionGroup(POSITION_TYPE_LABELS.secondary, secondaryPositions),
    ].filter((group): group is string => Boolean(group));

    return [
      `**${getShipLabel(ship)}**`,
      positionGroups.join("\n") || "Keine Positionen",
    ].join("\n");
  });

  const fallback = shipBlocks.length
    ? shipBlocks.join("\n")
    : "Keine Schiffe zugewiesen";
  const prefix = team.department?.name
    ? `Fokus: ${team.department.name}\n`
    : "";

  return {
    name: team.name?.trim() || "Unbenanntes Team",
    value: truncate(`${prefix}${fallback}`, 1024),
    inline: false,
  };
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
          "teams.id",
          "teams.name",
          "teams.department.id",
          "teams.department.name",
          "teams.ships.id",
          "teams.ships.hangar_id.id",
          "teams.ships.hangar_id.name",
          "teams.ships.hangar_id.ship.name",
          "teams.ships.hangar_id.ship.hull.name",
          "teams.ships.hangar_id.ship.hull.manufacturer.name",
          "teams.ships.positions.id",
          "teams.ships.positions.role",
          "teams.ships.positions.status",
          "teams.ships.positions.position_type",
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

  const teamFields = (mission.teams ?? [])
    .slice(0, 8)
    .map((team) => buildTeamField(team));

  if ((mission.teams?.length ?? 0) > 8) {
    teamFields.push({
      name: "Weitere Teams",
      value: `+${(mission.teams?.length ?? 0) - 8} weitere Teams im AMS`,
      inline: false,
    });
  }

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
      ...teamFields,
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

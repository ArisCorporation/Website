import { DEVELOPMENT_DM_USER_ID, DISCORD_EMBED_COLOR, getDiscordEnvironment } from '../../../../utils/ams-discord-mission-share'

const DISCORD_API_BASE = 'https://discord.com/api/v10'

type NotifyType = 'reschedule' | 'cancelled' | 'archived'

type NotifyBody = {
  type: NotifyType
  oldDate?: string | null
  newDate?: string | null
}

type MissionParticipant = {
  id: string
  discord_id?: string | null
  first_name?: string | null
  last_name?: string | null
}

type MissionRecord = {
  id: string
  title?: string | null
  planned_date?: string | null
  registrations?: Array<{
    id: string
    status?: string | null
    user?: MissionParticipant | null
  }> | null
}

function getUserLabel(user?: MissionParticipant | null) {
  if (!user) return 'Unbekannt'
  return [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || 'Unbekannt'
}

function getDiscordTimestamp(value?: string | null) {
  if (!value) return 'Datum offen'
  const unixSeconds = Math.floor(new Date(value).getTime() / 1000)
  if (!Number.isFinite(unixSeconds) || unixSeconds <= 0) return 'Datum offen'
  return `<t:${unixSeconds}:F>`
}

function buildNotificationEmbed(
  mission: MissionRecord,
  type: NotifyType,
  oldDate?: string | null,
  newDate?: string | null,
) {
  const missionUrl = `https://ams.ariscorp.de/ams/missions/${mission.id}`

  if (type === 'reschedule') {
    return {
      color: DISCORD_EMBED_COLOR,
      title: `📅 Mission verschoben: ${mission.title}`,
      url: missionUrl,
      description: `Die Mission wurde auf einen neuen Termin verschoben.`,
      fields: [
        {
          name: 'Alter Termin',
          value: getDiscordTimestamp(oldDate),
          inline: true,
        },
        {
          name: 'Neuer Termin',
          value: getDiscordTimestamp(newDate),
          inline: true,
        },
        {
          name: 'Mission',
          value: `[Im AMS öffnen](${missionUrl})`,
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
    }
  }

  if (type === 'cancelled') {
    return {
      color: 0xff4444,
      title: `❌ Mission abgebrochen: ${mission.title}`,
      url: missionUrl,
      description: `Diese Mission wurde vom Planner abgebrochen.`,
      fields: [
        {
          name: 'Mission',
          value: `[Im AMS öffnen](${missionUrl})`,
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
    }
  }

  return {
    color: 0x888888,
    title: `🗄️ Mission archiviert: ${mission.title}`,
    url: missionUrl,
    description: `Diese Mission wurde archiviert.`,
    fields: [
      {
        name: 'Mission',
        value: `[Im AMS öffnen](${missionUrl})`,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
  }
}

async function createDmChannel(discordUserId: string, botToken: string) {
  const response = await $fetch<{ id: string }>(`${DISCORD_API_BASE}/users/@me/channels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${botToken}`,
    },
    body: { recipient_id: discordUserId },
  })
  return response.id
}

async function sendDm(channelId: string, botToken: string, embed: object) {
  await $fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${botToken}`,
    },
    body: {
      embeds: [embed],
      allowed_mentions: { parse: [] },
    },
  })
}

export default defineEventHandler(async (event) => {
  const missionId = getRouterParam(event, 'id')
  if (!missionId) {
    throw createError({ statusCode: 400, statusMessage: 'Mission id missing' })
  }

  const config = useRuntimeConfig()
  const botToken = config.discordBotToken
  if (!botToken) {
    throw createError({ statusCode: 500, statusMessage: 'Discord bot token missing' })
  }

  const body = await readBody<NotifyBody>(event)
  if (!body?.type) {
    throw createError({ statusCode: 400, statusMessage: 'Notification type missing' })
  }

  const cookie = getHeader(event, 'cookie')
  const requestHeaders = cookie ? { cookie } : undefined

  // Auth check
  try {
    await $fetch('/api/proxy/users/me', {
      headers: requestHeaders,
      query: { fields: 'id' },
    })
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Nicht angemeldet' })
  }

  // Load mission + participants
  const missionResponse = await $fetch<{ data: MissionRecord }>(
    `/api/proxy/items/ams_missions/${missionId}`,
    {
      headers: requestHeaders,
      query: {
        fields: [
          'id',
          'title',
          'planned_date',
          'registrations.id',
          'registrations.status',
          'registrations.user.id',
          'registrations.user.first_name',
          'registrations.user.last_name',
          'registrations.user.discord_id',
        ].join(','),
      },
    },
  )

  const mission = missionResponse.data
  const embed = buildNotificationEmbed(mission, body.type, body.oldDate, body.newDate)
  const environment = getDiscordEnvironment(config.public.ENVIRONMENT)

  // Collect unique Discord IDs from active registrations
  const seen = new Set<string>()
  const recipients: MissionParticipant[] = []

  for (const reg of mission.registrations ?? []) {
    if (!reg.user?.discord_id) continue
    if (reg.status === 'rejected') continue

    const discordId = reg.user.discord_id
    if (seen.has(discordId)) continue
    seen.add(discordId)
    recipients.push(reg.user)
  }

  const results = { sent: 0, failed: 0, skipped: 0 }

  for (const recipient of recipients) {
    const discordId = recipient.discord_id!

    // In development mode, only send to the dev DM user
    const targetDiscordId = environment === 'PRODUCTION' ? discordId : DEVELOPMENT_DM_USER_ID

    try {
      const channelId = await createDmChannel(targetDiscordId, botToken)
      await sendDm(channelId, botToken, embed)
      results.sent++
    } catch (error) {
      console.error(`Failed to notify ${getUserLabel(recipient)} (${discordId})`, error)
      results.failed++
    }
  }

  return {
    success: true,
    type: body.type,
    ...results,
    message: `${results.sent} DMs gesendet, ${results.failed} fehlgeschlagen`,
  }
})

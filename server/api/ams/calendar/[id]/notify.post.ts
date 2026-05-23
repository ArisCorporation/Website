import { DEVELOPMENT_DM_USER_ID, DISCORD_EMBED_COLOR } from '../../../../utils/ams-discord-mission-share'

const DISCORD_API_BASE = 'https://discord.com/api/v10'

type NotifyBody = {
  type: 'reminder' | 'update' | 'cancelled'
  message?: string | null
}

type CalendarEvent = {
  id: string
  name?: string | null
  start?: string | null
  end?: string | null
  location?: string | null
  description?: string | null
}

type SubscriberUser = {
  id: string
  discord_id?: string | null
  first_name?: string | null
  last_name?: string | null
}

type CalendarSubscription = {
  id: string
  user?: SubscriberUser | null
}

function getDiscordTimestamp(value?: string | null) {
  if (!value) return 'Datum offen'
  const unixSeconds = Math.floor(new Date(value).getTime() / 1000)
  if (!Number.isFinite(unixSeconds) || unixSeconds <= 0) return 'Datum offen'
  return `<t:${unixSeconds}:F>`
}

function getDiscordEnvironment(): 'PRODUCTION' | 'DEVELOPMENT' {
  const config = useRuntimeConfig()
  return String(config.public?.ENVIRONMENT || 'DEVELOPMENT').toUpperCase() === 'PRODUCTION'
    ? 'PRODUCTION'
    : 'DEVELOPMENT'
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

function buildNotifyEmbed(
  event: CalendarEvent,
  type: NotifyBody['type'],
  customMessage?: string | null,
) {
  const fields: Array<{ name: string; value: string; inline: boolean }> = []

  fields.push({
    name: 'Start',
    value: getDiscordTimestamp(event.start),
    inline: true,
  })

  if (event.location?.trim()) {
    fields.push({
      name: 'Ort',
      value: event.location.trim(),
      inline: true,
    })
  }

  if (customMessage?.trim()) {
    fields.push({
      name: 'Nachricht',
      value: customMessage.trim(),
      inline: false,
    })
  }

  if (type === 'reminder') {
    return {
      color: DISCORD_EMBED_COLOR,
      title: `⏰ Erinnerung: ${event.name}`,
      fields,
      footer: { text: 'ArisCorp AMS' },
      timestamp: new Date().toISOString(),
    }
  }

  if (type === 'update') {
    return {
      color: 0xf59e0b,
      title: `📝 Termin aktualisiert: ${event.name}`,
      fields,
      footer: { text: 'ArisCorp AMS' },
      timestamp: new Date().toISOString(),
    }
  }

  // cancelled
  return {
    color: 0xef4444,
    title: `❌ Termin abgesagt: ${event.name}`,
    fields,
    footer: { text: 'ArisCorp AMS' },
    timestamp: new Date().toISOString(),
  }
}

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'Event-ID fehlt' })
  }

  const config = useRuntimeConfig()
  const botToken = config.discordBotToken as string | undefined
  if (!botToken) {
    throw createError({ statusCode: 500, statusMessage: 'Discord Bot Token nicht konfiguriert' })
  }

  const body = await readBody<NotifyBody>(event)
  if (!body?.type || !['reminder', 'update', 'cancelled'].includes(body.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültiger Typ — erwartet: reminder | update | cancelled' })
  }

  const cookie = getHeader(event, 'cookie')
  const requestHeaders = cookie ? { cookie } : undefined

  // Auth check — require access_level >= 3
  try {
    const meResponse = await $fetch<{ data: { id: string; role?: { access_level?: number | null } | null } }>(
      '/api/proxy/users/me',
      {
        headers: requestHeaders,
        query: { fields: 'id,role.access_level' },
      },
    )
    const accessLevel = meResponse.data?.role?.access_level ?? 0
    if (accessLevel < 3) {
      throw createError({ statusCode: 403, statusMessage: 'Nicht berechtigt' })
    }
  } catch (error: any) {
    if (error?.statusCode === 403) throw error
    throw createError({ statusCode: 401, statusMessage: 'Nicht angemeldet' })
  }

  // Fetch calendar event
  const calendarEventResponse = await $fetch<{ data: CalendarEvent }>(
    `/api/proxy/items/calendar/${eventId}`,
    {
      headers: requestHeaders,
      query: { fields: 'id,name,start,end,location,description' },
    },
  )
  const calendarEvent = calendarEventResponse.data

  // Fetch all subscriptions with user details
  const subscriptionsResponse = await $fetch<{ data: CalendarSubscription[] }>(
    '/api/proxy/items/calendar_subscriptions',
    {
      headers: requestHeaders,
      query: {
        'filter[calendar_event][_eq]': eventId,
        fields: 'id,user.id,user.discord_id,user.first_name,user.last_name',
        limit: -1,
      },
    },
  )

  const subscriptions = subscriptionsResponse.data ?? []
  const environment = getDiscordEnvironment()
  const embed = buildNotifyEmbed(calendarEvent, body.type, body.message)

  const results = { sent: 0, failed: 0 }

  // Deduplicate by discord_id so one user with multiple subscriptions only gets one DM
  const seen = new Set<string>()

  for (const subscription of subscriptions) {
    const user = subscription.user
    if (!user?.discord_id) continue

    const targetDiscordId =
      environment === 'PRODUCTION' ? user.discord_id : DEVELOPMENT_DM_USER_ID

    if (seen.has(targetDiscordId)) continue
    seen.add(targetDiscordId)

    try {
      const channelId = await createDmChannel(targetDiscordId, botToken)
      await sendDm(channelId, botToken, embed)
      results.sent++
    } catch (error) {
      const userLabel = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.id
      console.error(`Failed to notify ${userLabel} (${user.discord_id})`, error)
      results.failed++
    }
  }

  return {
    success: true,
    sent: results.sent,
    failed: results.failed,
  }
})

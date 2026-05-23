import { DEVELOPMENT_DM_USER_ID, DISCORD_EMBED_COLOR } from '../../../utils/ams-discord-mission-share'

const DISCORD_API_BASE = 'https://discord.com/api/v10'

type SubscribeBody = {
  eventId: string
  action: 'subscribe' | 'unsubscribe'
}

type CalendarUser = {
  id: string
  discord_id?: string | null
  first_name?: string | null
  last_name?: string | null
}

type CalendarEvent = {
  id: string
  name?: string | null
  start?: string | null
  location?: string | null
}

type CalendarSubscription = {
  id: string
  user: string | CalendarUser
  calendar_event: string | CalendarEvent
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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const botToken = config.discordBotToken as string | undefined

  const body = await readBody<SubscribeBody>(event)
  if (!body?.eventId) {
    throw createError({ statusCode: 400, statusMessage: 'eventId fehlt' })
  }
  if (body.action !== 'subscribe' && body.action !== 'unsubscribe') {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige action — erwartet: subscribe | unsubscribe' })
  }

  const cookie = getHeader(event, 'cookie')
  const requestHeaders = cookie ? { cookie } : undefined

  // Auth check
  let currentUser: CalendarUser
  try {
    const meResponse = await $fetch<{ data: CalendarUser }>('/api/proxy/users/me', {
      headers: requestHeaders,
      query: { fields: 'id,discord_id,first_name,last_name' },
    })
    currentUser = meResponse.data
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Nicht angemeldet' })
  }

  const userId = currentUser.id

  if (body.action === 'subscribe') {
    // Check if subscription already exists
    const existingResponse = await $fetch<{ data: CalendarSubscription[] }>(
      '/api/proxy/items/calendar_subscriptions',
      {
        headers: requestHeaders,
        query: {
          'filter[user][_eq]': userId,
          'filter[calendar_event][_eq]': body.eventId,
          fields: 'id',
          limit: 1,
        },
      },
    )

    if (!existingResponse.data || existingResponse.data.length === 0) {
      await $fetch('/api/proxy/items/calendar_subscriptions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(requestHeaders ?? {}),
        },
        body: {
          user: userId,
          calendar_event: body.eventId,
        },
      })
    }

    // Fetch the calendar event for the DM embed
    let calendarEvent: CalendarEvent | null = null
    try {
      const eventResponse = await $fetch<{ data: CalendarEvent }>(
        `/api/proxy/items/calendar/${body.eventId}`,
        {
          headers: requestHeaders,
          query: { fields: 'id,name,start,location' },
        },
      )
      calendarEvent = eventResponse.data
    } catch (error) {
      console.error('Failed to fetch calendar event for subscription DM', error)
    }

    // Send Discord DM if the user has a discord_id and we have a bot token
    if (botToken && calendarEvent) {
      const environment = getDiscordEnvironment()
      const targetDiscordId =
        environment === 'PRODUCTION'
          ? (currentUser.discord_id ?? null)
          : DEVELOPMENT_DM_USER_ID

      if (targetDiscordId) {
        const embedFields: Array<{ name: string; value: string; inline: boolean }> = [
          {
            name: 'Start',
            value: getDiscordTimestamp(calendarEvent.start),
            inline: true,
          },
        ]

        if (calendarEvent.location?.trim()) {
          embedFields.push({
            name: 'Ort',
            value: calendarEvent.location.trim(),
            inline: true,
          })
        }

        const embed = {
          color: DISCORD_EMBED_COLOR,
          title: `🔔 Termin abonniert: ${calendarEvent.name}`,
          description: 'Du erhältst eine Benachrichtigung, wenn sich dieser Termin ändert.',
          fields: embedFields,
          footer: { text: 'ArisCorp AMS' },
          timestamp: new Date().toISOString(),
        }

        try {
          const channelId = await createDmChannel(targetDiscordId, botToken)
          await sendDm(channelId, botToken, embed)
        } catch (error) {
          console.error('Failed to send subscription confirmation DM', error)
        }
      }
    }

    return {
      success: true,
      subscribed: true,
      message: 'Erfolgreich abonniert',
    }
  }

  // action === 'unsubscribe'
  const existingResponse = await $fetch<{ data: CalendarSubscription[] }>(
    '/api/proxy/items/calendar_subscriptions',
    {
      headers: requestHeaders,
      query: {
        'filter[user][_eq]': userId,
        'filter[calendar_event][_eq]': body.eventId,
        fields: 'id',
        limit: 1,
      },
    },
  )

  if (existingResponse.data && existingResponse.data.length > 0) {
    const subscriptionId = existingResponse.data[0].id
    await $fetch(`/api/proxy/items/calendar_subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: requestHeaders,
    })
  }

  return {
    success: true,
    subscribed: false,
    message: 'Erfolgreich abgemeldet',
  }
})

const DISCORD_API_BASE = 'https://discord.com/api/v10'

type PasswordResetDmPayload = {
  discordId?: string | null
  password?: string
  userLabel?: string
}

type DiscordChannelResponse = {
  id: string
}

export default defineEventHandler(async (event) => {
  const { discordId, password, userLabel }: PasswordResetDmPayload =
    await readBody(event)

  if (!discordId || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'discordId and password are required',
    })
  }

  const config = useRuntimeConfig()
  const botToken = config.discordBotToken

  if (!botToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Discord bot token missing',
    })
  }

  try {
    const dmChannel = await $fetch<DiscordChannelResponse>(
      `${DISCORD_API_BASE}/users/@me/channels`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${botToken}`,
        },
        body: {
          recipient_id: discordId,
        },
      }
    )

    const embedDescription = [
      'Dein Passwort wurde zurückgesetzt. Nutze das unten stehende temporäre Passwort für den nächsten Login und ändere es anschließend direkt im AMS.',
      '```',
      password,
      '```',
    ].join('\n')

    await $fetch(`${DISCORD_API_BASE}/channels/${dmChannel.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${botToken}`,
      },
      body: {
        embeds: [
          {
            title: 'Passwort zurückgesetzt',
            description: embedDescription,
            color: 0x5865f2,
            timestamp: new Date().toISOString(),
            fields: userLabel
              ? [
                  {
                    name: 'Benutzer',
                    value: userLabel,
                    inline: true,
                  },
                ]
              : [],
          },
        ],
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Discord password reset DM failed', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Discord DM failed',
    })
  }
})

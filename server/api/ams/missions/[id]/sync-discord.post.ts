import { getDiscordEnvironment, getShareErrorMessage, upsertMissionDiscordShare } from '../../../../utils/ams-discord-mission-share'

type CurrentUser = {
  id: string
}

export default defineEventHandler(async (event) => {
  const missionId = getRouterParam(event, 'id')

  if (!missionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mission id missing',
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

  const cookie = getHeader(event, 'cookie')
  const requestHeaders = cookie ? { cookie } : undefined

  try {
    await $fetch<{ data: CurrentUser }>('/api/proxy/users/me', {
      headers: requestHeaders,
      query: {
        fields: 'id',
      },
    })
  } catch (error) {
    console.error('Discord mission sync auth failed', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Nicht angemeldet',
    })
  }

  try {
    return await upsertMissionDiscordShare({
      missionId,
      createIfMissing: false,
      botToken,
      environment: getDiscordEnvironment(config.public.ENVIRONMENT),
      requestHeaders,
    })
  } catch (error: any) {
    console.error('Discord mission sync failed', error)
    throw createError({
      statusCode: error?.statusCode || 502,
      statusMessage: getShareErrorMessage(error),
      cause: error,
    })
  }
})

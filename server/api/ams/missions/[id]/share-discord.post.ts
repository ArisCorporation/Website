import {
  getDiscordEnvironment,
  getShareErrorMessage,
  hasMissionPlannerAccess,
  upsertMissionDiscordShare,
} from '../../../../utils/ams-discord-mission-share'

type CurrentUser = {
  id: string
  role?: {
    access_level?: number | null
  } | null
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

  let currentUser: CurrentUser
  try {
    const currentUserResponse = await $fetch<{ data: CurrentUser }>('/api/proxy/users/me', {
      headers: requestHeaders,
      query: {
        fields: 'id,role.access_level',
      },
    })

    currentUser = currentUserResponse.data
  } catch (error) {
    console.error('Discord mission share auth failed', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Nicht angemeldet',
    })
  }

  const missionResponse = await $fetch<{ data: { id: string; user_created?: string | null } }>(`/api/proxy/items/ams_missions/${missionId}`, {
    headers: requestHeaders,
    query: {
      fields: 'id,user_created',
    },
  })
  const mission = missionResponse.data

  const currentUserAccessLevel = Number(currentUser.role?.access_level ?? 0)
  const isPlanner = mission.user_created === currentUser.id || hasMissionPlannerAccess(currentUserAccessLevel)

  if (!isPlanner) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Nur Mission Planner, Verwaltung und Admins dürfen ein Event auf Discord teilen',
    })
  }

  try {
    return await upsertMissionDiscordShare({
      missionId,
      createIfMissing: true,
      botToken,
      environment: getDiscordEnvironment(config.public.ENVIRONMENT),
      requestHeaders,
    })
  } catch (error: any) {
    console.error('Discord mission share failed', error)
    throw createError({
      statusCode: error?.statusCode || 502,
      statusMessage: getShareErrorMessage(error),
      cause: error,
    })
  }
})

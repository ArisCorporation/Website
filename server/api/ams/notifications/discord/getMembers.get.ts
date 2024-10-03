const config = useRuntimeConfig()

type DiscordMember = {
  avatar?: string | null
  communication_disabled_until?: string | null
  flags: number
  joined_at: string
  nick?: string | null
  pending: boolean
  premium_since?: string | null
  roles: string[]
  user: {
    id: string
    username: string
    avatar: string
    discriminator: string
    public_flags: number
    flags: number
    banner: null | string
    accent_color: null | number
    global_name: string
    banner_color: null | string
  }
  mute: boolean
  deaf: boolean
}

export default defineEventHandler(async (event: any) => {
  const discordMembers = await $fetch('https://discord.com/api/v10/guilds/791018916196778034/members?limit=1000', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${config.discordBotToken}`,
      'Access-Control-Allow-Origin': '*',
    },
  }).then(res => res.filter((e: DiscordMember) => e.roles.includes('791029669944229908') || e.roles.includes('1000713516010963026') || e.roles.includes('1000713684328390696') || e.roles.includes('1000713788779143218')).map((e: DiscordMember) => ({
    id: e.user.id,
    label: e.nick || e.user.global_name,
    global_name: e.user.global_name,
    username: e.user.username,
    nick: e.nick,
    avatar: {
      src: e.avatar ? `https://cdn.discordapp.com/guilds/${config.discordGuildId}/users/${e.user.id}/avatars/${e.avatar}.png` : e.user.avatar ? `https://cdn.discordapp.com/avatars/${e.user.id}/${e.user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png',
    },
  })))

  return discordMembers
})

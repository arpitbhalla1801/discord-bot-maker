// API Route to fetch user's Discord guilds via OAuth
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import db from '@/lib/db'

interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
  features: string[]
}

interface DiscordGuildWithBotStatus extends DiscordGuild {
  botInGuild: boolean
  hasManagePermissions: boolean
}

export async function GET(request: NextRequest) {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's Discord account from database
    const discordAccount = await db.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: 'discord'
      }
    })

    if (!discordAccount || !discordAccount.accessToken) {
      return NextResponse.json({ 
        error: 'Discord account not linked. Please sign in with Discord.' 
      }, { status: 400 })
    }

    // Fetch user's guilds from Discord API using their OAuth token
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${discordAccount.accessToken}`
      }
    })

    if (!guildsResponse.ok) {
      console.error('Discord API error:', await guildsResponse.text())
      return NextResponse.json({ 
        error: 'Failed to fetch Discord servers. Please re-authenticate.' 
      }, { status: 500 })
    }

    const guilds: DiscordGuild[] = await guildsResponse.json()

    // Filter guilds where user has MANAGE_GUILD permission (0x20 = 32)
    const MANAGE_GUILD = 0x20
    const manageableGuilds = guilds.filter(guild => {
      const permissions = BigInt(guild.permissions)
      return guild.owner || (permissions & BigInt(MANAGE_GUILD)) === BigInt(MANAGE_GUILD)
    })

    // Fetch which guilds the bot is currently in
    const botId = process.env.DISCORD_BOT_ID
    if (!botId) {
      return NextResponse.json({ 
        error: 'Bot ID not configured' 
      }, { status: 500 })
    }

    // Get bot's guilds from our database (from deployments and bot events)
    const deployments = await db.guildDeployment.findMany({
      where: {
        isActive: true
      },
      select: {
        guildId: true
      }
    })

    const botGuildIds = new Set(deployments.map(d => d.guildId))

    // Combine the data
    const guildsWithStatus: DiscordGuildWithBotStatus[] = manageableGuilds.map(guild => ({
      ...guild,
      botInGuild: botGuildIds.has(guild.id),
      hasManagePermissions: true
    }))

    return NextResponse.json({
      guilds: guildsWithStatus,
      totalGuilds: guilds.length,
      manageableGuilds: manageableGuilds.length,
      botGuilds: botGuildIds.size
    })

  } catch (error) {
    console.error('Error fetching Discord guilds:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch servers' 
    }, { status: 500 })
  }
}

// API Route to fetch user's Discord guilds via OAuth
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import db from '@/lib/db'

// Simple in-memory cache to prevent rate limiting
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 1 minute

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

    console.log('[Discord Guilds API] Session:', session?.user?.id)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check cache first
    const cacheKey = `guilds:${session.user.id}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[Discord Guilds API] Returning cached data')
      return NextResponse.json(cached.data)
    }

    // Get the user's Discord account from database
    const discordAccount = await db.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: 'discord'
      }
    })

    console.log('[Discord Guilds API] Account found:', !!discordAccount)
    console.log('[Discord Guilds API] Access token exists:', !!discordAccount?.accessToken)
    console.log('[Discord Guilds API] Scopes:', discordAccount?.scope)

    if (!discordAccount || !discordAccount.accessToken) {
      return NextResponse.json({ 
        error: 'Discord account not linked. Please sign in with Discord.',
        needsReauth: true
      }, { status: 400 })
    }

    // Check if guilds scope is granted (scopes can be space or comma separated)
    const scopes = discordAccount.scope?.split(/[\s,]+/) || []
    console.log('[Discord Guilds API] Parsed scopes:', scopes)
    if (!scopes.includes('guilds')) {
      console.log('[Discord Guilds API] Missing guilds scope. User needs to re-authenticate.')
      return NextResponse.json({ 
        error: 'Missing guilds permission. Please sign out and sign in again to grant server access.',
        needsReauth: true,
        currentScopes: scopes
      }, { status: 403 })
    }

    // Fetch user's guilds from Discord API using their OAuth token
    console.log('[Discord Guilds API] Fetching guilds from Discord API...')
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${discordAccount.accessToken}`
      }
    })

    if (!guildsResponse.ok) {
      const errorText = await guildsResponse.text()
      console.error('[Discord Guilds API] Discord API error:', guildsResponse.status, errorText)
      
      // If unauthorized, token might be expired
      if (guildsResponse.status === 401) {
        return NextResponse.json({ 
          error: 'Your Discord session has expired. Please sign out and sign in again.',
          needsReauth: true
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch Discord servers. Please try again or re-authenticate.',
        needsReauth: true
      }, { status: 500 })
    }

    const guilds: DiscordGuild[] = await guildsResponse.json()
    console.log('[Discord Guilds API] Fetched guilds count:', guilds.length)

    // Filter guilds where user has MANAGE_GUILD permission (0x20 = 32)
    const MANAGE_GUILD = 0x20
    const manageableGuilds = guilds.filter(guild => {
      const permissions = BigInt(guild.permissions)
      return guild.owner || (permissions & BigInt(MANAGE_GUILD)) === BigInt(MANAGE_GUILD)
    })

    console.log('[Discord Guilds API] Manageable guilds count:', manageableGuilds.length)

    // Fetch which guilds the bot is currently in from the bot service
    let botGuildIds = new Set<string>()
    try {
      const { sharedBot } = await import('@/services/SharedBotService')
      const client = sharedBot.getClient()
      
      if (client.isReady()) {
        // Get bot's guilds from Discord client
        const botGuilds = client.guilds.cache
        botGuildIds = new Set(Array.from(botGuilds.keys()))
        console.log('[Discord Guilds API] Bot in guilds count:', botGuildIds.size)
        console.log('[Discord Guilds API] Bot guild IDs:', Array.from(botGuildIds))
      } else {
        console.warn('[Discord Guilds API] Bot client not ready, falling back to database')
        // Fallback to database if bot not ready
        const deployments = await db.guildDeployment.findMany({
          where: { isActive: true },
          select: { guildId: true }
        })
        botGuildIds = new Set(deployments.map(d => d.guildId))
      }
    } catch (error) {
      console.error('[Discord Guilds API] Error fetching bot guilds:', error)
      // Fallback to database
      const deployments = await db.guildDeployment.findMany({
        where: { isActive: true },
        select: { guildId: true }
      })
      botGuildIds = new Set(deployments.map(d => d.guildId))
    }

    // Combine the data
    const guildsWithStatus: DiscordGuildWithBotStatus[] = manageableGuilds.map(guild => ({
      ...guild,
      botInGuild: botGuildIds.has(guild.id),
      hasManagePermissions: true
    }))

    const responseData = {
      guilds: guildsWithStatus,
      totalGuilds: guilds.length,
      manageableGuilds: manageableGuilds.length,
      botGuilds: botGuildIds.size
    }

    // Cache the response
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    })

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error fetching Discord guilds:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch servers' 
    }, { status: 500 })
  }
}

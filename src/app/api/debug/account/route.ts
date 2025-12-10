import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import db from '@/lib/db'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        session: null 
      })
    }

    const discordAccount = await db.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: 'discord'
      },
      select: {
        id: true,
        providerId: true,
        accountId: true,
        scope: true,
        accessToken: true,
        accessTokenExpiresAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      },
      account: discordAccount ? {
        id: discordAccount.id,
        providerId: discordAccount.providerId,
        accountId: discordAccount.accountId,
        scopes: discordAccount.scope?.split(' ') || [],
        hasAccessToken: !!discordAccount.accessToken,
        accessTokenLength: discordAccount.accessToken?.length || 0,
        accessTokenExpiresAt: discordAccount.accessTokenExpiresAt,
        hasGuildsScope: discordAccount.scope?.includes('guilds') || false,
        createdAt: discordAccount.createdAt,
        updatedAt: discordAccount.updatedAt
      } : null
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch account data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

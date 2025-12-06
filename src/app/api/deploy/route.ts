// Deploy project commands to a guild
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import db from '@/lib/db'
import { sharedBot } from '@/services/SharedBotService'

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, guildId } = body

    if (!projectId || !guildId) {
      return NextResponse.json(
        { error: 'projectId and guildId are required' },
        { status: 400 }
      )
    }

    // Verify user owns the project
    const project = await db.botProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      include: {
        commands: {
          where: {
            isEnabled: true,
            type: 'SLASH'
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    if (project.commands.length === 0) {
      return NextResponse.json(
        { error: 'Project has no enabled slash commands' },
        { status: 400 }
      )
    }

    // Check if bot is in the guild
    let guild = sharedBot.getClient().guilds.cache.get(guildId)
    
    // If not in cache, try to fetch it
    if (!guild) {
      try {
        guild = await sharedBot.getClient().guilds.fetch(guildId)
      } catch (error) {
        console.error('[Deploy] Failed to fetch guild:', error)
        return NextResponse.json(
          { error: 'Bot is not in this server. Please invite the bot first.' },
          { status: 400 }
        )
      }
    }
    
    console.log('[Deploy] Guild found:', guild.name, 'ID:', guild.id)

    // TODO: Verify user has manage guild permission in Discord
    // This requires Discord OAuth2 integration

    // Check if already deployed
    const existingDeployment = await (db as any).guildDeployment.findUnique({
      where: {
        guildId_projectId: {
          guildId,
          projectId
        }
      }
    })

    if (existingDeployment && existingDeployment.isActive) {
      return NextResponse.json(
        { error: 'Project is already deployed to this server' },
        { status: 409 }
      )
    }

    // Deploy commands to guild
    const commandCount = await sharedBot.deployToGuild(projectId, guildId)

    // Create or update guild record
    const guildData = {
      id: guildId,
      name: guild.name,
      icon: guild.icon,
      ownerId: guild.ownerId,
      addedBy: session.user.id
    }

    await (db as any).guild.upsert({
      where: { id: guildId },
      create: guildData,
      update: {
        name: guild.name,
        icon: guild.icon,
        ownerId: guild.ownerId,
        updatedAt: new Date()
      }
    })

    // Create or update deployment
    const deployment = existingDeployment
      ? await (db as any).guildDeployment.update({
          where: { id: existingDeployment.id },
          data: {
            isActive: true,
            updatedAt: new Date()
          }
        })
      : await (db as any).guildDeployment.create({
          data: {
            guildId,
            projectId,
            isActive: true
          }
        })

    return NextResponse.json({
      success: true,
      deployment: {
        id: deployment.id,
        guildId,
        projectId,
        commandsRegistered: commandCount
      },
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('[API] Deploy error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to deploy' },
      { status: 500 }
    )
  }
}

// List all user's deployments
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const projectId = searchParams.get('projectId')

    // Get all guilds where user has deployed
    const where: any = {
      project: {
        userId: session.user.id
      },
      isActive: true
    }

    if (projectId) {
      where.projectId = projectId
    }

    const deployments = await (db as any).guildDeployment.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        },
        guild: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        }
      },
      orderBy: {
        deployedAt: 'desc'
      }
    })

    // Get command counts for each deployment
    const deploymentsWithCount = await Promise.all(
      deployments.map(async (d: any) => {
        const commandCount = await db.command.count({
          where: {
            projectId: d.projectId,
            isEnabled: true,
            type: 'SLASH'
          }
        })

        return {
          id: d.id,
          guildId: d.guildId,
          guildName: d.guild.name,
          guildIcon: d.guild.icon,
          projectId: d.projectId,
          projectName: d.project.name,
          projectIcon: d.project.icon,
          commandCount,
          isActive: d.isActive,
          deployedAt: d.deployedAt,
          updatedAt: d.updatedAt
        }
      })
    )

    return NextResponse.json({
      deployments: deploymentsWithCount
    })

  } catch (error: any) {
    console.error('[API] Get deployments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployments' },
      { status: 500 }
    )
  }
}

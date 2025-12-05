import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type Params = {
  params: Promise<{ projectId: string }>
}

// GET /api/projects/:projectId/sessions - List bot sessions for a project
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { projectId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project ownership
    const project = await prisma.botProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const sessions = await prisma.botSession.findMany({
      where: {
        projectId
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 50 // Limit to last 50 sessions
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// POST /api/projects/:projectId/sessions - Start a new bot session
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { projectId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project ownership
    const project = await prisma.botProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      include: {
        commands: {
          include: {
            commandGraphs: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if bot token is configured
    if (!project.botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured. Please add a Discord bot token to your project.' },
        { status: 400 }
      )
    }

    // Check if there's already a running session
    const existingSession = await prisma.botSession.findFirst({
      where: {
        projectId,
        status: 'RUNNING'
      }
    })

    if (existingSession) {
      return NextResponse.json(
        { error: 'A bot session is already running for this project' },
        { status: 400 }
      )
    }

    // Create new session (expires in 1 hour by default)
    const body = await request.json().catch(() => ({}))
    const duration = body.duration || 3600000 // 1 hour in milliseconds
    
    const botSession = await prisma.botSession.create({
      data: {
        projectId,
        status: 'RUNNING',
        expiresAt: new Date(Date.now() + duration),
        runtimeNode: `node_${session.user.id}_${Date.now()}`
      }
    })

    // Update project status
    await prisma.botProject.update({
      where: { id: projectId },
      data: { status: 'active' }
    })

    // TODO: Actually start the Discord bot process here
    // This would involve spawning a worker process or using a job queue
    // For now, we're just tracking the session in the database

    return NextResponse.json(botSession, { status: 201 })
  } catch (error) {
    console.error('Error starting session:', error)
    return NextResponse.json(
      { error: 'Failed to start bot session' },
      { status: 500 }
    )
  }
}

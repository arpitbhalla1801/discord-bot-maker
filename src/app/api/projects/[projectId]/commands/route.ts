import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type Params = {
  params: Promise<{ projectId: string }>
}

// GET /api/projects/:projectId/commands - List all commands for a project
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

    const commands = await prisma.command.findMany({
      where: {
        projectId
      },
      include: {
        commandGraphs: {
          where: { isActive: true },
          orderBy: { version: 'desc' },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(commands)
  } catch (error) {
    console.error('Error fetching commands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commands' },
      { status: 500 }
    )
  }
}

// POST /api/projects/:projectId/commands - Create a new command
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
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, type, isEnabled, graphJson } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Command name is required' },
        { status: 400 }
      )
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Command description is required' },
        { status: 400 }
      )
    }

    // Check for duplicate command name in this project
    const existingCommand = await prisma.command.findFirst({
      where: {
        projectId,
        name: name.trim()
      }
    })

    if (existingCommand) {
      return NextResponse.json(
        { error: 'A command with this name already exists in this project' },
        { status: 400 }
      )
    }

    // Create command with initial graph
    const command = await prisma.command.create({
      data: {
        projectId,
        name: name.trim(),
        description: description.trim(),
        type: type || 'SLASH',
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        commandGraphs: {
          create: {
            graphJson: graphJson || {
              nodes: [],
              edges: [],
              variables: {}
            },
            version: 1,
            isActive: true
          }
        }
      },
      include: {
        commandGraphs: true
      }
    })

    return NextResponse.json(command, { status: 201 })
  } catch (error) {
    console.error('Error creating command:', error)
    return NextResponse.json(
      { error: 'Failed to create command' },
      { status: 500 }
    )
  }
}

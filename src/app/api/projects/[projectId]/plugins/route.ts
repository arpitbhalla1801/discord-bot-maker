import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type Params = {
  params: Promise<{ projectId: string }>
}

// GET /api/projects/:projectId/plugins - List installed plugins for a project
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

    const projectPlugins = await prisma.projectPlugin.findMany({
      where: {
        projectId
      },
      include: {
        plugin: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        installedAt: 'desc'
      }
    })

    return NextResponse.json(projectPlugins)
  } catch (error) {
    console.error('Error fetching project plugins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plugins' },
      { status: 500 }
    )
  }
}

// POST /api/projects/:projectId/plugins - Install a plugin to project
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
    const { pluginId, config } = body

    if (!pluginId) {
      return NextResponse.json(
        { error: 'Plugin ID is required' },
        { status: 400 }
      )
    }

    // Check if plugin exists and is accessible
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    })

    if (!plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 })
    }

    if (!plugin.isPublic && plugin.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Plugin is not public' }, { status: 403 })
    }

    // Check if already installed
    const existing = await prisma.projectPlugin.findFirst({
      where: {
        projectId,
        pluginId
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Plugin is already installed in this project' },
        { status: 400 }
      )
    }

    // Install plugin
    const projectPlugin = await prisma.projectPlugin.create({
      data: {
        projectId,
        pluginId,
        config: config || {},
        isEnabled: true
      },
      include: {
        plugin: true
      }
    })

    return NextResponse.json(projectPlugin, { status: 201 })
  } catch (error) {
    console.error('Error installing plugin:', error)
    return NextResponse.json(
      { error: 'Failed to install plugin' },
      { status: 500 }
    )
  }
}

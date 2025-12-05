import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type Params = {
  params: Promise<{ projectId: string }>
}

// GET /api/projects/:projectId - Get a single project
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { projectId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.botProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      include: {
        commands: {
          include: {
            commandGraphs: {
              where: { isActive: true },
              orderBy: { version: 'desc' },
              take: 1
            }
          }
        },
        sessions: {
          where: {
            status: 'RUNNING'
          },
          orderBy: {
            startedAt: 'desc'
          },
          take: 5
        },
        projectPlugins: {
          include: {
            plugin: true
          },
          where: {
            isEnabled: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/:projectId - Update a project
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { projectId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon, discordBotId, botToken, status } = body

    // Verify ownership
    const existingProject = await prisma.botProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (icon !== undefined) updateData.icon = icon || null
    if (discordBotId !== undefined) updateData.discordBotId = discordBotId || null
    if (botToken !== undefined) updateData.botToken = botToken || null
    if (status !== undefined) updateData.status = status

    const project = await prisma.botProject.update({
      where: { id: projectId },
      data: updateData
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/:projectId - Delete a project
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { projectId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existingProject = await prisma.botProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete project (cascade will handle related records)
    await prisma.botProject.delete({
      where: { id: projectId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}

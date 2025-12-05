import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type Params = {
  params: Promise<{ projectId: string; commandId: string }>
}

// GET /api/projects/:projectId/commands/:commandId - Get a single command
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { projectId, commandId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const command = await prisma.command.findFirst({
      where: {
        id: commandId,
        projectId,
        project: {
          userId: session.user.id
        }
      },
      include: {
        commandGraphs: {
          where: { isActive: true },
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    })

    if (!command) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 })
    }

    return NextResponse.json(command)
  } catch (error) {
    console.error('Error fetching command:', error)
    return NextResponse.json(
      { error: 'Failed to fetch command' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/:projectId/commands/:commandId - Update a command
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { projectId, commandId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, type, isEnabled, graphJson } = body

    // Verify ownership
    const existingCommand = await prisma.command.findFirst({
      where: {
        id: commandId,
        projectId,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!existingCommand) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 })
    }

    // Check for duplicate name if changing name
    if (name && name !== existingCommand.name) {
      const duplicate = await prisma.command.findFirst({
        where: {
          projectId,
          name: name.trim(),
          id: { not: commandId }
        }
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'A command with this name already exists in this project' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (type !== undefined) updateData.type = type
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled

    // Update command
    const command = await prisma.command.update({
      where: { id: commandId },
      data: updateData
    })

    // If graphJson is provided, create new version
    if (graphJson !== undefined) {
      // Deactivate old graphs
      await prisma.commandGraph.updateMany({
        where: {
          commandId,
          isActive: true
        },
        data: {
          isActive: false
        }
      })

      // Get latest version number
      const latestGraph = await prisma.commandGraph.findFirst({
        where: { commandId },
        orderBy: { version: 'desc' }
      })

      // Create new graph version
      await prisma.commandGraph.create({
        data: {
          commandId,
          graphJson,
          version: (latestGraph?.version || 0) + 1,
          isActive: true
        }
      })
    }

    // Fetch updated command with graph
    const updatedCommand = await prisma.command.findUnique({
      where: { id: commandId },
      include: {
        commandGraphs: {
          where: { isActive: true },
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json(updatedCommand)
  } catch (error) {
    console.error('Error updating command:', error)
    return NextResponse.json(
      { error: 'Failed to update command' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/:projectId/commands/:commandId - Delete a command
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { projectId, commandId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existingCommand = await prisma.command.findFirst({
      where: {
        id: commandId,
        projectId,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!existingCommand) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 })
    }

    // Delete command (cascade will handle command graphs)
    await prisma.command.delete({
      where: { id: commandId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting command:', error)
    return NextResponse.json(
      { error: 'Failed to delete command' },
      { status: 500 }
    )
  }
}

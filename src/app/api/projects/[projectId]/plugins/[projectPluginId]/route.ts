import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type Params = {
  params: Promise<{ projectId: string; projectPluginId: string }>
}

// PATCH /api/projects/:projectId/plugins/:projectPluginId - Update plugin config or toggle
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { projectId, projectPluginId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify ownership
    const projectPlugin = await prisma.projectPlugin.findFirst({
      where: {
        id: projectPluginId,
        projectId,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!projectPlugin) {
      return NextResponse.json({ error: 'Plugin installation not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (body.config !== undefined) updateData.config = body.config
    if (body.isEnabled !== undefined) updateData.isEnabled = body.isEnabled

    const updated = await prisma.projectPlugin.update({
      where: { id: projectPluginId },
      data: updateData,
      include: {
        plugin: true
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating plugin:', error)
    return NextResponse.json(
      { error: 'Failed to update plugin' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/:projectId/plugins/:projectPluginId - Uninstall plugin
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { projectId, projectPluginId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const projectPlugin = await prisma.projectPlugin.findFirst({
      where: {
        id: projectPluginId,
        projectId,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!projectPlugin) {
      return NextResponse.json({ error: 'Plugin installation not found' }, { status: 404 })
    }

    await prisma.projectPlugin.delete({
      where: { id: projectPluginId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error uninstalling plugin:', error)
    return NextResponse.json(
      { error: 'Failed to uninstall plugin' },
      { status: 500 }
    )
  }
}

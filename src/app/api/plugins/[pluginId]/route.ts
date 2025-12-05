import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type Params = {
  params: Promise<{ pluginId: string }>
}

// GET /api/plugins/:pluginId - Get plugin details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { pluginId } = await params

    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            projectPlugins: true
          }
        }
      }
    })

    if (!plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 })
    }

    // If plugin is not public, check authorization
    if (!plugin.isPublic) {
      const session = await auth.api.getSession({
        headers: await headers()
      })

      if (!session || session.user.id !== plugin.authorId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return NextResponse.json(plugin)
  } catch (error) {
    console.error('Error fetching plugin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plugin' },
      { status: 500 }
    )
  }
}

// PATCH /api/plugins/:pluginId - Update plugin
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { pluginId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify ownership
    const existingPlugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    })

    if (!existingPlugin || existingPlugin.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Plugin not found or unauthorized' }, { status: 404 })
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.version !== undefined) updateData.version = body.version
    if (body.type !== undefined) updateData.type = body.type
    if (body.manifest !== undefined) updateData.manifest = body.manifest
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic

    const plugin = await prisma.plugin.update({
      where: { id: pluginId },
      data: updateData
    })

    return NextResponse.json(plugin)
  } catch (error) {
    console.error('Error updating plugin:', error)
    return NextResponse.json(
      { error: 'Failed to update plugin' },
      { status: 500 }
    )
  }
}

// DELETE /api/plugins/:pluginId - Delete plugin
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { pluginId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existingPlugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    })

    if (!existingPlugin || existingPlugin.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Plugin not found or unauthorized' }, { status: 404 })
    }

    await prisma.plugin.delete({
      where: { id: pluginId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting plugin:', error)
    return NextResponse.json(
      { error: 'Failed to delete plugin' },
      { status: 500 }
    )
  }
}

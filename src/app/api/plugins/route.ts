import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// GET /api/plugins - List all public plugins (marketplace)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const authorId = searchParams.get('authorId')

    const where: any = {}
    
    // If authorId is provided, show user's plugins (public and private)
    // Otherwise, only show public plugins
    if (authorId) {
      where.authorId = authorId
    } else {
      where.isPublic = true
    }

    if (type) {
      where.type = type
    }

    const plugins = await prisma.plugin.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(plugins)
  } catch (error) {
    console.error('Error fetching plugins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plugins' },
      { status: 500 }
    )
  }
}

// POST /api/plugins - Create a new plugin
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, version, type, manifest, isPublic } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check for duplicate slug
    const existingPlugin = await prisma.plugin.findUnique({
      where: { slug }
    })

    if (existingPlugin) {
      return NextResponse.json(
        { error: 'A plugin with this slug already exists' },
        { status: 400 }
      )
    }

    const plugin = await prisma.plugin.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        version: version || '1.0.0',
        type: type || 'BLOCKS',
        manifest: manifest || {},
        isPublic: isPublic || false,
        authorId: session.user.id
      }
    })

    return NextResponse.json(plugin, { status: 201 })
  } catch (error) {
    console.error('Error creating plugin:', error)
    return NextResponse.json(
      { error: 'Failed to create plugin' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// GET /api/projects - List all projects for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.botProject.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        commands: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            commands: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log('Projects API response:', projects)
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const project = await prisma.botProject.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || null,
        userId: session.user.id,
        status: 'inactive'
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

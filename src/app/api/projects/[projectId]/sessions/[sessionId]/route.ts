import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type Params = {
  params: Promise<{ projectId: string; sessionId: string }>
}

// GET /api/projects/:projectId/sessions/:sessionId - Get session details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { projectId, sessionId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const botSession = await prisma.botSession.findFirst({
      where: {
        id: sessionId,
        projectId,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!botSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(botSession)
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/:projectId/sessions/:sessionId - Update session (typically to stop it)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { projectId, sessionId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, lastError } = body

    // Verify ownership
    const botSession = await prisma.botSession.findFirst({
      where: {
        id: sessionId,
        projectId,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!botSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (status !== undefined) {
      updateData.status = status
      if (status === 'STOPPED' || status === 'EXPIRED' || status === 'FAILED') {
        updateData.stoppedAt = new Date()
      }
    }
    if (lastError !== undefined) {
      updateData.lastError = lastError
    }

    const updatedSession = await prisma.botSession.update({
      where: { id: sessionId },
      data: updateData
    })

    // If stopping the session, update project status
    if (status === 'STOPPED' || status === 'EXPIRED' || status === 'FAILED') {
      // Check if there are other running sessions
      const otherRunningSessions = await prisma.botSession.findFirst({
        where: {
          projectId,
          status: 'RUNNING',
          id: { not: sessionId }
        }
      })

      if (!otherRunningSessions) {
        await prisma.botProject.update({
          where: { id: projectId },
          data: { status: status === 'FAILED' ? 'error' : 'inactive' }
        })
      }
    }

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/:projectId/sessions/:sessionId - Delete session record
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { projectId, sessionId } = await params
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const botSession = await prisma.botSession.findFirst({
      where: {
        id: sessionId,
        projectId,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!botSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Can only delete stopped sessions
    if (botSession.status === 'RUNNING') {
      return NextResponse.json(
        { error: 'Cannot delete a running session. Stop it first.' },
        { status: 400 }
      )
    }

    await prisma.botSession.delete({
      where: { id: sessionId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}

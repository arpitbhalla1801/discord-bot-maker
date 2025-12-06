// Undeploy a project from a guild
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import db from '@/lib/db'
import { sharedBot } from '@/services/SharedBotService'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deploymentId } = params

    // Fetch deployment and verify ownership
    const deployment = await (db as any).guildDeployment.findUnique({
      where: { id: deploymentId },
      include: {
        project: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    if (deployment.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Undeploy from guild
    await sharedBot.undeployFromGuild(deployment.projectId, deployment.guildId)

    // Mark as inactive
    await (db as any).guildDeployment.update({
      where: { id: deploymentId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Project undeployed successfully'
    })

  } catch (error: any) {
    console.error('[API] Undeploy error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to undeploy' },
      { status: 500 }
    )
  }
}

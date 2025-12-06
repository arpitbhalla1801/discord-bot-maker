'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FaPlay, FaStop, FaTrash, FaClock, FaCheckCircle, FaExclamationCircle, FaArrowLeft, FaFileAlt, FaCircle } from 'react-icons/fa'

interface BotSession {
  id: string
  projectId: string
  status: 'RUNNING' | 'STOPPED' | 'EXPIRED' | 'FAILED'
  runtimeNode: string | null
  lastError: string | null
  startedAt: string
  expiresAt: string
  stoppedAt: string | null
  project?: {
    id: string
    name: string
    icon: string | null
  }
}

interface Project {
  id: string
  name: string
  botToken: string | null
  discordBotId: string | null
  status: string
}

export default function SessionManagerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')

  const [project, setProject] = useState<Project | null>(null)
  const [sessions, setSessions] = useState<BotSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [duration, setDuration] = useState(60) // Default 60 minutes

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
    fetchSessions()
    
    // Poll for session updates every 10 seconds
    const interval = setInterval(fetchSessions, 10000)
    return () => clearInterval(interval)
  }, [projectId])

  const fetchProject = async () => {
    if (!projectId) return
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) throw new Error('Failed to fetch project')
      const data = await response.json()
      setProject(data)
    } catch (err) {
      console.error('Error fetching project:', err)
    }
  }

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const url = projectId 
        ? `/api/sessions?projectId=${projectId}`
        : `/api/sessions`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/api/auth/signin')
          return
        }
        throw new Error('Failed to fetch sessions')
      }

      const data = await response.json()
      setSessions(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    if (!projectId) return

    if (!project?.botToken) {
      alert('Please configure a Discord bot token in project settings first.')
      router.push(`/settings?project=${projectId}`)
      return
    }

    if (!project?.discordBotId) {
      alert('Please configure your Discord Application ID in project settings first.')
      router.push(`/settings?project=${projectId}`)
      return
    }

    try {
      setActionLoading('start')
      const response = await fetch(`/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          durationMinutes: duration
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to start session')
      }

      await fetchSessions()
      await fetchProject()
    } catch (err: any) {
      console.error('Error starting session:', err)
      alert(err.message || 'Failed to start bot session')
    } finally {
      setActionLoading(null)
    }
  }

  const stopSession = async (sessionId: string) => {
    try {
      setActionLoading(sessionId)
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'stop'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to stop session')
      }

      await fetchSessions()
      await fetchProject()
    } catch (err) {
      console.error('Error stopping session:', err)
      alert('Failed to stop session')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Delete this session record?')) return

    try {
      setActionLoading(sessionId)
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete session')
      }

      await fetchSessions()
    } catch (err: any) {
      console.error('Error deleting session:', err)
      alert(err.message || 'Failed to delete session')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (start: string, end: string | null) => {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()
    const diff = endDate.getTime() - startDate.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime()
    const expiry = new Date(expiresAt).getTime()
    const diff = expiry - now
    
    if (diff <= 0) return 'Expired'
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`
    }
    return `${minutes}m remaining`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <FaCircle className="text-green-500 animate-pulse" />
      case 'STOPPED':
        return <FaStop className="text-gray-500" />
      case 'EXPIRED':
        return <FaClock className="text-yellow-500" />
      case 'FAILED':
        return <FaExclamationCircle className="text-red-500" />
      default:
        return <FaCheckCircle className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'text-green-400 bg-green-500/10'
      case 'STOPPED': return 'text-gray-400 bg-gray-500/10'
      case 'EXPIRED': return 'text-yellow-400 bg-yellow-500/10'
      case 'FAILED': return 'text-red-400 bg-red-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const runningSession = sessions.find(s => s.status === 'RUNNING')

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              {projectId && (
                <Link
                  href={`/builder/${projectId}`}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                  title="Back to Project"
                >
                  <FaArrowLeft />
                </Link>
              )}
              <h1 className="text-3xl font-bold">Bot Sessions</h1>
            </div>
            {project && (
              <p className="text-gray-400">
                {project.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {projectId && !runningSession && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  className="w-20 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
                />
                <span className="text-sm text-gray-400">minutes</span>
              </div>
            )}
            
            {projectId && !runningSession ? (
              <button
                onClick={startSession}
                disabled={actionLoading === 'start' || !project?.botToken}
                className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50"
              >
                <FaPlay />
                <span>{actionLoading === 'start' ? 'Starting...' : 'Start Bot'}</span>
              </button>
            ) : projectId && runningSession ? (
              <button
                onClick={() => stopSession(runningSession.id)}
                disabled={actionLoading === runningSession.id}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <FaStop />
                <span>{actionLoading === runningSession.id ? 'Stopping...' : 'Stop Bot'}</span>
              </button>
            ) : null}
          </div>
        </div>

        {projectId && !project?.botToken && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg flex items-center gap-3">
            <FaExclamationCircle />
            <span>No bot token configured.</span>
            <Link href={`/settings?project=${projectId}`} className="underline hover:no-underline">
              Configure in Settings →
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Running Session Banner */}
      {runningSession && (
        <div className="bg-green-500/10 border-2 border-green-500 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FaCircle className="text-green-500 animate-pulse text-sm" />
              Bot is Running
            </h2>
            <Link
              href={`/sessions/${runningSession.id}/logs`}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <FaFileAlt />
              View Logs
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Started</p>
              <p className="font-medium">{formatDate(runningSession.startedAt)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Duration</p>
              <p className="font-medium">{formatDuration(runningSession.startedAt, null)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Time Remaining</p>
              <p className="font-medium">{getTimeRemaining(runningSession.expiresAt)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Session ID</p>
              <p className="font-mono text-xs">{runningSession.id.slice(0, 12)}...</p>
            </div>
          </div>
        </div>
      )}

      {/* Session History */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Session History</h2>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400">No sessions yet. Start your bot to create the first session!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <div
              key={session.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(session.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                      {session.project && (
                        <span className="text-sm text-gray-400">{session.project.name}</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm text-gray-400 mb-2">
                      <div>
                        <span className="text-xs">Started:</span>
                        <div className="font-medium text-white">{formatDate(session.startedAt)}</div>
                      </div>
                      <div>
                        <span className="text-xs">Duration:</span>
                        <div className="font-medium text-white">{formatDuration(session.startedAt, session.stoppedAt)}</div>
                      </div>
                      {session.status === 'RUNNING' && (
                        <div>
                          <span className="text-xs">Remaining:</span>
                          <div className="font-medium text-white">{getTimeRemaining(session.expiresAt)}</div>
                        </div>
                      )}
                      {session.stoppedAt && (
                        <div>
                          <span className="text-xs">Stopped:</span>
                          <div className="font-medium text-white">{formatDate(session.stoppedAt)}</div>
                        </div>
                      )}
                    </div>

                    {session.lastError && (
                      <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-sm text-red-400">
                        <strong>Error:</strong> {session.lastError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {session.status === 'RUNNING' && (
                    <>
                      <Link
                        href={`/sessions/${session.id}/logs`}
                        className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        title="View Logs"
                      >
                        <FaFileAlt />
                      </Link>
                      <button
                        onClick={() => stopSession(session.id)}
                        disabled={actionLoading === session.id}
                        className="p-2 rounded text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Stop Session"
                      >
                        <FaStop />
                      </button>
                    </>
                  )}
                  {session.status !== 'RUNNING' && (
                    <>
                      <Link
                        href={`/sessions/${session.id}/logs`}
                        className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        title="View Logs"
                      >
                        <FaFileAlt />
                      </Link>
                      <button
                        onClick={() => deleteSession(session.id)}
                        disabled={actionLoading === session.id}
                        className="p-2 rounded text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Delete Session"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

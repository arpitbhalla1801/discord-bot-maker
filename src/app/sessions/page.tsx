'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaPlay, FaStop, FaTrash, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

interface BotSession {
  id: string
  projectId: string
  status: 'RUNNING' | 'STOPPED' | 'EXPIRED' | 'FAILED'
  runtimeNode: string | null
  lastError: string | null
  startedAt: string
  expiresAt: string
  stoppedAt: string | null
}

interface Project {
  id: string
  name: string
  botToken: string | null
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

  useEffect(() => {
    if (!projectId) {
      router.push('/dashboard')
      return
    }
    fetchProject()
    fetchSessions()
    
    // Poll for session updates every 5 seconds
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [projectId])

  const fetchProject = async () => {
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
      const response = await fetch(`/api/projects/${projectId}/sessions`)
      
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
    if (!project?.botToken) {
      alert('Please configure a Discord bot token in project settings first.')
      return
    }

    try {
      setActionLoading('start')
      const response = await fetch(`/api/projects/${projectId}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          duration: 3600000 // 1 hour
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
      const response = await fetch(`/api/projects/${projectId}/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'STOPPED'
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
      const response = await fetch(`/api/projects/${projectId}/sessions/${sessionId}`, {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <FaPlay className="text-green-500" />
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

  const runningSession = sessions.find(s => s.status === 'RUNNING')

  if (!projectId) return null

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bot Session Manager</h1>
            {project && (
              <p className="text-gray-400">
                {project.name} - 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  project.status === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {project.status}
                </span>
              </p>
            )}
          </div>

          {!runningSession ? (
            <button
              onClick={startSession}
              disabled={actionLoading === 'start' || !project?.botToken}
              className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50"
            >
              <FaPlay />
              <span>{actionLoading === 'start' ? 'Starting...' : 'Start Bot'}</span>
            </button>
          ) : (
            <button
              onClick={() => stopSession(runningSession.id)}
              disabled={actionLoading === runningSession.id}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded flex items-center gap-2 disabled:opacity-50"
            >
              <FaStop />
              <span>{actionLoading === runningSession.id ? 'Stopping...' : 'Stop Bot'}</span>
            </button>
          )}
        </div>

        {!project?.botToken && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-4 py-3 rounded">
            ⚠️ No bot token configured. Add a Discord bot token in project settings to start sessions.
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Running Session */}
      {runningSession && (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaPlay className="text-green-500" />
            Currently Running
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Started</p>
              <p className="font-medium">{formatDate(runningSession.startedAt)}</p>
            </div>
            <div>
              <p className="text-gray-400">Duration</p>
              <p className="font-medium">{formatDuration(runningSession.startedAt, null)}</p>
            </div>
            <div>
              <p className="text-gray-400">Expires</p>
              <p className="font-medium">{formatDate(runningSession.expiresAt)}</p>
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
              className="bg-gray-800 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">
                    {getStatusIcon(session.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{session.status}</span>
                      <span className="text-xs text-gray-500">
                        {formatDuration(session.startedAt, session.stoppedAt)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <span>Started: {formatDate(session.startedAt)}</span>
                      {session.stoppedAt && (
                        <span className="ml-4">Stopped: {formatDate(session.stoppedAt)}</span>
                      )}
                    </div>
                    {session.lastError && (
                      <div className="mt-2 text-sm text-red-400">
                        Error: {session.lastError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {session.status === 'RUNNING' && (
                    <button
                      onClick={() => stopSession(session.id)}
                      disabled={actionLoading === session.id}
                      className="btn-secondary px-3 py-2 text-sm disabled:opacity-50"
                    >
                      <FaStop />
                    </button>
                  )}
                  {session.status !== 'RUNNING' && (
                    <button
                      onClick={() => deleteSession(session.id)}
                      disabled={actionLoading === session.id}
                      className="text-gray-400 hover:text-red-500 p-2"
                    >
                      <FaTrash />
                    </button>
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

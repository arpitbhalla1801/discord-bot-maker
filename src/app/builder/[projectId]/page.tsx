'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaProjectDiagram, FaToggleOn, FaToggleOff } from 'react-icons/fa'

interface Command {
  id: string
  name: string
  description: string
  type: string
  isEnabled: boolean
  commandGraphs: Array<{
    version: number
  }>
}

interface BotProject {
  id: string
  name: string
  description: string | null
  commands: Command[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  
  const [project, setProject] = useState<BotProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingCommand, setCreatingCommand] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/api/auth/signin')
          return
        }
        throw new Error('Failed to fetch project')
      }

      const data = await response.json()
      setProject(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching project:', err)
      setError('Failed to load project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createCommand = async () => {
    try {
      setCreatingCommand(true)
      const response = await fetch(`/api/projects/${projectId}/commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'newcommand',
          description: 'A new command',
          type: 'SLASH'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create command')
      }

      const newCommand = await response.json()
      // Navigate to graph editor for the new command
      router.push(`/builder/${projectId}/commands/${newCommand.id}/graph`)
    } catch (err) {
      console.error('Error creating command:', err)
      alert('Failed to create command. Please try again.')
    } finally {
      setCreatingCommand(false)
    }
  }

  const toggleCommand = async (commandId: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/commands/${commandId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isEnabled: !currentState
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle command')
      }

      // Refresh project data
      fetchProject()
    } catch (err) {
      console.error('Error toggling command:', err)
      alert('Failed to toggle command. Please try again.')
    }
  }

  const deleteCommand = async (commandId: string, commandName: string) => {
    if (!confirm(`Are you sure you want to delete the command "/${commandName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/commands/${commandId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete command')
      }

      // Refresh project data
      fetchProject()
    } catch (err) {
      console.error('Error deleting command:', err)
      alert('Failed to delete command. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple mx-auto mb-4"></div>
            <p className="text-gray-400">Loading project...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-white transition-colors"
          title="Back to Dashboard"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-400 mt-1">{project.description || 'No description'}</p>
        </div>
      </div>

      {/* Commands Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Commands ({project.commands.length})</h2>
          <button
            onClick={createCommand}
            disabled={creatingCommand}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus />
            {creatingCommand ? 'Creating...' : 'New Command'}
          </button>
        </div>

        {project.commands.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FaProjectDiagram className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No commands yet</h3>
            <p className="mb-6">Create your first command to get started building your bot</p>
            <button
              onClick={createCommand}
              disabled={creatingCommand}
              className="btn-primary"
            >
              Create First Command
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {project.commands.map(command => (
              <div
                key={command.id}
                className="bg-discord-darkSecondary border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-discord-blurple font-mono text-lg font-semibold">
                        /{command.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        command.type === 'SLASH' ? 'bg-blue-500/20 text-blue-400' :
                        command.type === 'MESSAGE' ? 'bg-green-500/20 text-green-400' :
                        command.type === 'BUTTON' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {command.type}
                      </span>
                      {command.commandGraphs.length > 0 && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          v{command.commandGraphs[0].version}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{command.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCommand(command.id, command.isEnabled)}
                      className={`p-2 rounded transition-colors ${
                        command.isEnabled
                          ? 'text-green-400 hover:text-green-300'
                          : 'text-gray-500 hover:text-gray-400'
                      }`}
                      title={command.isEnabled ? 'Disable' : 'Enable'}
                    >
                      {command.isEnabled ? <FaToggleOn className="w-6 h-6" /> : <FaToggleOff className="w-6 h-6" />}
                    </button>

                    <Link
                      href={`/builder/${projectId}/commands/${command.id}/graph`}
                      className="btn-secondary flex items-center gap-2 px-4 py-2"
                    >
                      <FaProjectDiagram />
                      Edit Graph
                    </Link>

                    <button
                      onClick={() => deleteCommand(command.id, command.name)}
                      className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                      title="Delete command"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href={`/sessions?project=${projectId}`}
          className="card p-6 hover:bg-gray-800 transition-colors text-center"
        >
          <h3 className="text-lg font-semibold mb-2">🚀 Test Bot</h3>
          <p className="text-sm text-gray-400">Start a session to test your bot live</p>
        </Link>

        <Link
          href={`/export?project=${projectId}`}
          className="card p-6 hover:bg-gray-800 transition-colors text-center"
        >
          <h3 className="text-lg font-semibold mb-2">📦 Export Code</h3>
          <p className="text-sm text-gray-400">Download production-ready bot code</p>
        </Link>

        <Link
          href={`/settings?project=${projectId}`}
          className="card p-6 hover:bg-gray-800 transition-colors text-center"
        >
          <h3 className="text-lg font-semibold mb-2">⚙️ Settings</h3>
          <p className="text-sm text-gray-400">Configure bot token and options</p>
        </Link>
      </div>
    </div>
  )
}

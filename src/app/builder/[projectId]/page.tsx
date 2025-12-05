'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaProjectDiagram, FaToggleOn, FaToggleOff, FaCog, FaSearch, FaFilter } from 'react-icons/fa'
import CommandModal, { CommandFormData } from '@/components/builder/CommandModal'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState<Command | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')

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

  const handleCreateCommand = async (data: CommandFormData) => {
    const response = await fetch(`/api/projects/${projectId}/commands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to create command')
    }

    const newCommand = await response.json()
    await fetchProject() // Refresh the list
    // Navigate to graph editor for the new command
    router.push(`/builder/${projectId}/commands/${newCommand.id}/graph`)
  }

  const handleEditCommand = async (data: CommandFormData) => {
    if (!editingCommand) return

    const response = await fetch(`/api/projects/${projectId}/commands/${editingCommand.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to update command')
    }

    await fetchProject() // Refresh the list
    setEditingCommand(null)
  }

  const openEditModal = (command: Command) => {
    setEditingCommand(command)
    setModalOpen(true)
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

  const filteredCommands = project?.commands.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'ALL' || cmd.type === filterType
    return matchesSearch && matchesFilter
  }) || []

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          title="Back to Dashboard"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-400 mt-1">{project.description || 'No description'}</p>
        </div>
        <Link
          href={`/settings?project=${projectId}`}
          className="btn-secondary flex items-center gap-2"
        >
          <FaCog />
          Settings
        </Link>
      </div>

      {/* Commands Section */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Commands</h2>
            <p className="text-gray-400 text-sm mt-1">
              {filteredCommands.length} of {project.commands.length} commands
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCommand(null)
              setModalOpen(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus />
            New Command
          </button>
        </div>

        {/* Search and Filter */}
        {project.commands.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search commands..."
                className="w-full bg-discord-darkSecondary border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-discord-blurple focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'SLASH', 'MESSAGE', 'BUTTON', 'MODAL'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-discord-blurple text-white'
                      : 'bg-discord-darkSecondary text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {project.commands.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="bg-discord-darkSecondary/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FaProjectDiagram className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">No commands yet</h3>
            <p className="mb-6 max-w-md mx-auto">
              Create your first command to start building your bot's functionality with visual graphs
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary"
            >
              <FaPlus className="inline mr-2" />
              Create First Command
            </button>
          </div>
        ) : filteredCommands.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No commands match your search</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterType('ALL')
              }}
              className="text-discord-blurple hover:underline mt-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredCommands.map(command => (
              <div
                key={command.id}
                className="bg-discord-darkSecondary border border-gray-700 rounded-lg p-5 hover:border-gray-600 transition-all hover:shadow-lg group"
              >
                <div className="flex items-start gap-4">
                  {/* Command Icon/Status */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    command.type === 'SLASH' ? 'bg-blue-500/20 text-blue-400' :
                    command.type === 'MESSAGE' ? 'bg-green-500/20 text-green-400' :
                    command.type === 'BUTTON' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    <span className="text-xl font-bold">
                      {command.type === 'SLASH' && '/'}
                      {command.type === 'MESSAGE' && '💬'}
                      {command.type === 'BUTTON' && '🔘'}
                      {command.type === 'MODAL' && '📝'}
                    </span>
                  </div>

                  {/* Command Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-lg font-semibold text-white font-mono">
                        {command.type === 'SLASH' ? '/' : ''}{command.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        command.type === 'SLASH' ? 'bg-blue-500/20 text-blue-400' :
                        command.type === 'MESSAGE' ? 'bg-green-500/20 text-green-400' :
                        command.type === 'BUTTON' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {command.type}
                      </span>
                      {command.commandGraphs.length > 0 && (
                        <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded">
                          v{command.commandGraphs[0].version}
                        </span>
                      )}
                      <div className={`w-2 h-2 rounded-full ${
                        command.isEnabled ? 'bg-green-400' : 'bg-gray-600'
                      }`} title={command.isEnabled ? 'Enabled' : 'Disabled'} />
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{command.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleCommand(command.id, command.isEnabled)}
                      className={`p-2 rounded-lg transition-colors ${
                        command.isEnabled
                          ? 'text-green-400 hover:bg-green-500/10'
                          : 'text-gray-500 hover:bg-gray-700'
                      }`}
                      title={command.isEnabled ? 'Disable command' : 'Enable command'}
                    >
                      {command.isEnabled ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => openEditModal(command)}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      title="Edit command settings"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/builder/${projectId}/commands/${command.id}/graph`}
                      className="px-4 py-2 bg-discord-blurple hover:bg-discord-blurple/80 text-white rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                    >
                      <FaProjectDiagram />
                      Edit Graph
                    </Link>

                    <button
                      onClick={() => deleteCommand(command.id, command.name)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete command"
                    >
                      <FaTrash className="w-4 h-4" />
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
          className="card p-6 hover:bg-gray-800 transition-all hover:shadow-lg border border-gray-700 hover:border-gray-600 group"
        >
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-discord-blurple transition-colors">Test Bot</h3>
          <p className="text-sm text-gray-400">Start a session to test your bot live</p>
        </Link>

        <Link
          href={`/export?project=${projectId}`}
          className="card p-6 hover:bg-gray-800 transition-all hover:shadow-lg border border-gray-700 hover:border-gray-600 group"
        >
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-discord-blurple transition-colors">Export Code</h3>
          <p className="text-sm text-gray-400">Download production-ready bot code</p>
        </Link>

        <Link
          href={`/settings?project=${projectId}`}
          className="card p-6 hover:bg-gray-800 transition-all hover:shadow-lg border border-gray-700 hover:border-gray-600 group"
        >
          <div className="text-4xl mb-3">⚙️</div>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-discord-blurple transition-colors">Settings</h3>
          <p className="text-sm text-gray-400">Configure bot token and options</p>
        </Link>
      </div>

      {/* Command Modal */}
      <CommandModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingCommand(null)
        }}
        onSave={editingCommand ? handleEditCommand : handleCreateCommand}
        initialData={editingCommand ? {
          name: editingCommand.name,
          description: editingCommand.description,
          type: editingCommand.type as 'SLASH' | 'MESSAGE' | 'BUTTON' | 'MODAL'
        } : undefined}
        mode={editingCommand ? 'edit' : 'create'}
      />
    </div>
  )
}

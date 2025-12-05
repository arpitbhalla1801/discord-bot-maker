'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import GraphEditor from '@/components/graph/GraphEditor'
import { CommandGraphJson } from '@/types/graph'
import { FaArrowLeft, FaSave, FaSpinner } from 'react-icons/fa'

interface Command {
  id: string
  name: string
  description: string
  type: string
  commandGraphs: Array<{
    id: string
    graphJson: any
    version: number
    isActive: boolean
  }>
}

export default function CommandGraphPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const commandId = params.commandId as string
  const router = useRouter()
  
  const [command, setCommand] = useState<Command | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [graphData, setGraphData] = useState<CommandGraphJson | null>(null)

  useEffect(() => {
    fetchCommand()
  }, [projectId, commandId])

  // Auto-save timer
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || !graphData) return

    const timer = setTimeout(() => {
      handleSave(graphData)
    }, 3000) // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timer)
  }, [graphData, hasUnsavedChanges, autoSaveEnabled])

  const fetchCommand = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/commands/${commandId}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/api/auth/signin')
          return
        }
        throw new Error('Failed to fetch command')
      }

      const data = await response.json()
      setCommand(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching command:', err)
      setError('Failed to load command. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (graph: CommandGraphJson) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/projects/${projectId}/commands/${commandId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          graphJson: graph
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save graph')
      }

      const updatedCommand = await response.json()
      setCommand(updatedCommand)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      
      // Show success notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
      notification.textContent = 'Graph saved successfully!'
      document.body.appendChild(notification)
      setTimeout(() => {
        notification.remove()
      }, 3000)
    } catch (err) {
      console.error('Error saving graph:', err)
      alert('Failed to save graph. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleGraphChange = (graph: CommandGraphJson) => {
    setHasUnsavedChanges(true)
    setGraphData(graph)
  }

  const handleManualSave = () => {
    if (graphData) {
      handleSave(graphData)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading command...</p>
        </div>
      </div>
    )
  }

  if (error || !command) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Command not found'}</p>
          <button
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const currentGraph = command.commandGraphs?.[0]?.graphJson as CommandGraphJson | undefined

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/dashboard?project=${projectId}`)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">/{command.name}</h1>
            <p className="text-sm text-gray-400">{command.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          {hasUnsavedChanges && !autoSaveEnabled && (
            <div className="flex items-center gap-2 text-yellow-500">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}

          {saving && (
            <div className="flex items-center gap-2 text-blue-400">
              <FaSpinner className="w-3 h-3 animate-spin" />
              <span className="text-sm">Saving...</span>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-400">Auto-save</span>
          </label>

          <button
            onClick={handleManualSave}
            disabled={saving || !graphData}
            className="btn-primary flex items-center gap-2"
          >
            <FaSave className="w-4 h-4" />
            Save Now
          </button>
        </div>
      </div>

      {/* Graph Editor */}
      <div className="flex-1 overflow-hidden" data-graph-editor>
        <GraphEditor
          initialGraph={currentGraph}
          onSave={handleSave}
          onChange={handleGraphChange}
        />
      </div>

      {/* Footer Info */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Version: {command.commandGraphs?.[0]?.version || 0}
          </span>
          <span>
            Type: {command.type}
          </span>
        </div>
      </div>
    </div>
  )
}

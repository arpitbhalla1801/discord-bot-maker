'use client'

import { useState, useEffect } from 'react'
import { NodeType, NODE_TYPES_METADATA } from '@/types/graph'

interface NodeEditorProps {
  nodeId: string
  nodeType: NodeType
  nodeData: any
  onSave: (nodeId: string, newData: any) => void
  onClose: () => void
}

export default function NodeEditor({ nodeId, nodeType, nodeData, onSave, onClose }: NodeEditorProps) {
  const [formData, setFormData] = useState(nodeData || {})
  const metadata = NODE_TYPES_METADATA[nodeType]

  useEffect(() => {
    setFormData(nodeData || {})
  }, [nodeData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(nodeId, formData)
    onClose()
  }

  const renderFields = () => {
    switch (nodeType) {
      case 'SEND_MESSAGE':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Message Content</label>
              <textarea
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                rows={4}
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter message text..."
              />
              <p className="text-xs text-gray-400 mt-1">Use {`{{variableName}}`} to insert variables</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.ephemeral || false}
                  onChange={(e) => setFormData({ ...formData, ephemeral: e.target.checked })}
                />
                Ephemeral (only visible to user)
              </label>
            </div>
          </div>
        )

      case 'SEND_EMBED':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Embed title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Embed description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color (hex)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                value={formData.color || '#5865F2'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#5865F2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Footer Text</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                value={formData.footer || ''}
                onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                placeholder="Footer text"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.ephemeral || false}
                  onChange={(e) => setFormData({ ...formData, ephemeral: e.target.checked })}
                />
                Ephemeral
              </label>
            </div>
          </div>
        )

      case 'SET_VARIABLE':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Variable Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                value={formData.variableName || ''}
                onChange={(e) => setFormData({ ...formData, variableName: e.target.value })}
                placeholder="myVariable"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Value to store"
              />
            </div>
          </div>
        )

      case 'IF_CONDITION':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Variable to Check</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                value={formData.variable || ''}
                onChange={(e) => setFormData({ ...formData, variable: e.target.value })}
                placeholder="variableName"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Operator</label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                value={formData.operator || 'equals'}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
                <option value="is_empty">Is Empty</option>
                <option value="is_not_empty">Is Not Empty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare Value</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Value to compare"
              />
            </div>
          </div>
        )

      case 'DELAY':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Duration (milliseconds)</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                value={formData.duration || 1000}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min={0}
                step={100}
              />
              <p className="text-xs text-gray-400 mt-1">1000ms = 1 second</p>
            </div>
          </div>
        )

      case 'START':
      case 'END':
        return (
          <div className="text-sm text-gray-400 text-center py-4">
            This node has no configurable properties.
          </div>
        )

      default:
        return (
          <div className="text-sm text-gray-400 text-center py-4">
            No editor available for this node type yet.
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{metadata.icon}</span>
            <h3 className="text-lg font-semibold">Edit {metadata.label}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {renderFields()}

          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

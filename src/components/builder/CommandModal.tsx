'use client'

import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'

interface CommandModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CommandFormData) => Promise<void>
  initialData?: CommandFormData
  mode: 'create' | 'edit'
}

export interface SlashCommandOption {
  name: string
  description: string
  type: 'STRING' | 'INTEGER' | 'BOOLEAN' | 'USER' | 'CHANNEL' | 'ROLE'
  required: boolean
}

export interface CommandPermissions {
  requiredPermissions: string[]
  allowedRoles: string[]
  allowedChannels: string[]
  cooldownSeconds: number
}

export interface CommandFormData {
  name: string
  description: string
  type: 'SLASH' | 'MESSAGE' | 'BUTTON' | 'MODAL'
  options?: SlashCommandOption[]
  permissions?: CommandPermissions
}

export default function CommandModal({ isOpen, onClose, onSave, initialData, mode }: CommandModalProps) {
  const [formData, setFormData] = useState<CommandFormData>(
    initialData || {
      name: '',
      description: '',
      type: 'SLASH',
      options: [],
      permissions: {
        requiredPermissions: [],
        allowedRoles: [],
        allowedChannels: [],
        cooldownSeconds: 0
      }
    }
  )
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Command name is required'
    } else if (!/^[a-z0-9_-]+$/.test(formData.name)) {
      newErrors.name = 'Only lowercase letters, numbers, hyphens, and underscores allowed'
    } else if (formData.name.length > 32) {
      newErrors.name = 'Command name must be 32 characters or less'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length > 100) {
      newErrors.description = 'Description must be 100 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSaving(true)
      await onSave(formData)
      onClose()
    } catch (err) {
      console.error('Error saving command:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!saving) {
      setFormData(initialData || {
        name: '',
        description: '',
        type: 'SLASH',
        options: [],
        permissions: {
          requiredPermissions: [],
          allowedRoles: [],
          allowedChannels: [],
          cooldownSeconds: 0
        }
      })
      setErrors({})
      setShowAdvanced(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-discord-darkBg border border-gray-700 rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Command' : 'Edit Command'}
          </h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Command Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Command Name *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-discord-blurple font-mono">
                /
              </span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
                disabled={saving || mode === 'edit'}
                placeholder="ping"
                className={`w-full bg-discord-darkSecondary border rounded-lg px-3 pl-7 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-discord-blurple focus:border-transparent'
                } ${mode === 'edit' ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.name && (
              <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>
            )}
            {mode === 'edit' && (
              <p className="text-gray-500 text-xs mt-1.5">Command name cannot be changed after creation</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={saving}
              placeholder="Responds with pong and latency"
              rows={3}
              maxLength={100}
              className={`w-full bg-discord-darkSecondary border rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-discord-blurple focus:border-transparent'
              }`}
            />
            <div className="flex justify-between items-center mt-1.5">
              {errors.description ? (
                <p className="text-red-400 text-xs">{errors.description}</p>
              ) : (
                <span className="text-gray-500 text-xs">
                  {formData.description.length}/100 characters
                </span>
              )}
            </div>
          </div>

          {/* Command Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Command Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['SLASH', 'MESSAGE', 'BUTTON', 'MODAL'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  disabled={saving}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.type === type
                      ? 'border-discord-blurple bg-discord-blurple/20 text-white'
                      : 'border-gray-600 bg-discord-darkSecondary text-gray-400 hover:border-gray-500 hover:text-gray-300'
                  }`}
                >
                  {type === 'SLASH' && '/ Slash'}
                  {type === 'MESSAGE' && '💬 Message'}
                  {type === 'BUTTON' && '🔘 Button'}
                  {type === 'MODAL' && '📝 Modal'}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2">
              {formData.type === 'SLASH' && 'Traditional slash commands that appear in Discord\'s command menu'}
              {formData.type === 'MESSAGE' && 'Respond to regular messages matching patterns'}
              {formData.type === 'BUTTON' && 'Handle button click interactions'}
              {formData.type === 'MODAL' && 'Handle modal form submissions'}
            </p>
          </div>

          {/* Advanced Configuration Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full text-left text-sm text-discord-blurple hover:underline"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Configuration (Options & Permissions)
          </button>

          {/* Advanced Configuration */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-discord-darkSecondary/50 rounded-lg border border-gray-700">
              {/* Slash Command Options */}
              {formData.type === 'SLASH' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slash Command Options
                  </label>
                  <div className="space-y-2">
                    {formData.options?.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center bg-gray-800 p-2 rounded">
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => {
                            const newOptions = [...(formData.options || [])]
                            newOptions[index].name = e.target.value
                            setFormData({ ...formData, options: newOptions })
                          }}
                          placeholder="option_name"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                        />
                        <select
                          value={option.type}
                          onChange={(e) => {
                            const newOptions = [...(formData.options || [])]
                            newOptions[index].type = e.target.value as any
                            setFormData({ ...formData, options: newOptions })
                          }}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="STRING">String</option>
                          <option value="INTEGER">Integer</option>
                          <option value="BOOLEAN">Boolean</option>
                          <option value="USER">User</option>
                          <option value="CHANNEL">Channel</option>
                          <option value="ROLE">Role</option>
                        </select>
                        <label className="flex items-center text-xs">
                          <input
                            type="checkbox"
                            checked={option.required}
                            onChange={(e) => {
                              const newOptions = [...(formData.options || [])]
                              newOptions[index].required = e.target.checked
                              setFormData({ ...formData, options: newOptions })
                            }}
                            className="mr-1"
                          />
                          Required
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = formData.options?.filter((_, i) => i !== index)
                            setFormData({ ...formData, options: newOptions })
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          options: [
                            ...(formData.options || []),
                            { name: '', description: 'Option description', type: 'STRING', required: false }
                          ]
                        })
                      }}
                      className="text-xs text-discord-blurple hover:underline"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cooldown (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.permissions?.cooldownSeconds || 0}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions!,
                        cooldownSeconds: parseInt(e.target.value) || 0
                      }
                    })
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Prevent spam by adding a cooldown between uses</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-discord-blurple hover:bg-discord-blurple/80 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : mode === 'create' ? 'Create Command' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

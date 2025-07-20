import { useState } from 'react'
import { FaPlus, FaTrash, FaPen, FaCopy, FaSave, FaTimes } from 'react-icons/fa'
import { useBuilderStore, useCommands, useSelectedCommand } from '../../store/builderStore'

export default function CommandBuilder() {
  const commands = useCommands()
  const selectedCommand = useSelectedCommand()
  const { 
    addCommand, 
    updateCommand, 
    deleteCommand, 
    duplicateCommand,
    setSelectedCommand,
    addCommandOption,
    updateCommandOption,
    deleteCommandOption
  } = useBuilderStore()
  
  const [isEditing, setIsEditing] = useState(false)

  const handleAddCommand = () => {
    const newCommandId = addCommand()
    setSelectedCommand(newCommandId)
    setIsEditing(true)
  }

  const handleEditCommand = (commandId: string) => {
    setSelectedCommand(commandId)
    setIsEditing(true)
  }

  const handleDeleteCommand = (commandId: string) => {
    if (window.confirm('Are you sure you want to delete this command?')) {
      deleteCommand(commandId)
      if (selectedCommand?.id === commandId) {
        setSelectedCommand(undefined)
        setIsEditing(false)
      }
    }
  }

  const handleDuplicateCommand = (commandId: string) => {
    const newCommandId = duplicateCommand(commandId)
    setSelectedCommand(newCommandId)
    setIsEditing(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Slash Commands</h2>
        <button 
          onClick={handleAddCommand}
          className="bg-discord-blurple hover:bg-discord-blurple/80 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          Add Command
        </button>
      </div>

      {commands.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FaPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No commands yet</h3>
          <p className="text-sm mb-4">Create your first slash command to get started</p>
          <button 
            onClick={handleAddCommand}
            className="bg-discord-blurple hover:bg-discord-blurple/80 text-white px-6 py-3 rounded-md transition-colors"
          >
            Create Your First Command
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commands List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Commands ({commands.length})</h3>
            <div className="space-y-2">
              {commands.map((command) => (
                <div 
                  key={command.id}
                  className={`bg-discord-darkBg border rounded-lg p-4 cursor-pointer transition-all $\{
                    selectedCommand?.id === command.id 
                      ? 'border-discord-blurple bg-discord-blurple/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => handleEditCommand(command.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-discord-blurple font-mono">/{command.name}</span>
                        {command.options.length > 0 && (
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {command.options.length} option{command.options.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{command.description}</p>
                      {command.category && (
                        <span className="inline-block text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded mt-2">
                          {command.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicateCommand(command.id)
                        }}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Duplicate command"
                      >
                        <FaCopy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCommand(command.id)
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete command"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Command Editor */}
          <div className="space-y-4">
            {selectedCommand ? (
              <div className="bg-discord-darkBg border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Edit Command</h3>
                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-discord-blurple hover:bg-discord-blurple/80 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <FaPen className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Command Name</label>
                      <input
                        type="text"
                        value={selectedCommand.name}
                        onChange={(e) => updateCommand(selectedCommand.id, { name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
                        placeholder="my-command"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <input
                        type="text"
                        value={selectedCommand.category || ''}
                        onChange={(e) => updateCommand(selectedCommand.id, { category: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
                        placeholder="General"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={selectedCommand.description}
                      onChange={(e) => updateCommand(selectedCommand.id, { description: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
                      rows={3}
                      placeholder="What does this command do?"
                    />
                  </div>

                  {/* Response Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Response Type</label>
                    <select
                      value={selectedCommand.responseType}
                      onChange={(e) => updateCommand(selectedCommand.id, { responseType: e.target.value as 'text' | 'embed' | 'custom' })}
                      disabled={!isEditing}
                      className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
                    >
                      <option value="text">Simple Text</option>
                      <option value="embed">Rich Embed</option>
                      <option value="custom">Custom Code</option>
                    </select>
                  </div>

                  {/* Response Content */}
                  {selectedCommand.responseType === 'text' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Response Message</label>
                      <textarea
                        value={selectedCommand.response}
                        onChange={(e) => updateCommand(selectedCommand.id, { response: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
                        rows={3}
                        placeholder="Hello! This command works!"
                      />
                    </div>
                  )}

                  {/* Command Options */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Command Options</h4>
                      {isEditing && (
                        <button
                          onClick={() => selectedCommand && addCommandOption(selectedCommand.id)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <FaPlus className="w-3 h-3" />
                          Add Option
                        </button>
                      )}
                    </div>

                    {selectedCommand.options.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No options added yet. {isEditing && 'Click "Add Option" to get started.'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedCommand.options.map((option) => (
                          <div key={option.id} className="bg-discord-lighterBg border border-gray-600 rounded p-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium mb-1">Name</label>
                                <input
                                  type="text"
                                  value={option.name}
                                  onChange={(e) => updateCommandOption(selectedCommand.id, option.id, { name: e.target.value })}
                                  disabled={!isEditing}
                                  className="w-full bg-discord-darkBg border border-gray-700 rounded px-2 py-1 text-sm disabled:opacity-60"
                                  placeholder="option-name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Type</label>
                                <select
                                  value={option.type}
                                  onChange={(e) => updateCommandOption(selectedCommand.id, option.id, { type: e.target.value as any })}
                                  disabled={!isEditing}
                                  className="w-full bg-discord-darkBg border border-gray-700 rounded px-2 py-1 text-sm disabled:opacity-60"
                                >
                                  <option value="STRING">Text</option>
                                  <option value="INTEGER">Number</option>
                                  <option value="BOOLEAN">True/False</option>
                                  <option value="USER">User</option>
                                  <option value="CHANNEL">Channel</option>
                                  <option value="ROLE">Role</option>
                                </select>
                              </div>
                              <div className="flex items-end gap-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={option.required}
                                    onChange={(e) => updateCommandOption(selectedCommand.id, option.id, { required: e.target.checked })}
                                    disabled={!isEditing}
                                    className="mr-2"
                                  />
                                  <label className="text-xs">Required</label>
                                </div>
                                {isEditing && (
                                  <button
                                    onClick={() => deleteCommandOption(selectedCommand.id, option.id)}
                                    className="text-red-400 hover:text-red-300 p-1"
                                    title="Delete option"
                                  >
                                    <FaTrash className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              <label className="block text-xs font-medium mb-1">Description</label>
                              <input
                                type="text"
                                value={option.description}
                                onChange={(e) => updateCommandOption(selectedCommand.id, option.id, { description: e.target.value })}
                                disabled={!isEditing}
                                className="w-full bg-discord-darkBg border border-gray-700 rounded px-2 py-1 text-sm disabled:opacity-60"
                                placeholder="What is this option for?"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-discord-darkBg border border-gray-700 rounded-lg p-12 text-center">
                <FaPen className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-medium mb-2">Select a command to edit</h3>
                <p className="text-sm text-gray-400">
                  Choose a command from the list to view and edit its settings
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

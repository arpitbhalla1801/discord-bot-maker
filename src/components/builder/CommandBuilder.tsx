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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-1">Slash Commands</h2>
          <p className="text-discord-text-secondary">Create and manage your bot's commands</p>
        </div>
        <button 
          onClick={handleAddCommand}
          className="btn-primary px-5 py-2.5 flex items-center gap-2 whitespace-nowrap"
        >
          <FaPlus className="w-4 h-4" />
          Add Command
        </button>
      </div>

      {commands.length === 0 ? (
        <div className="card-flat text-center py-16 animate-slide-up">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-discord-blurple/10 flex items-center justify-center">
              <FaPlus className="w-10 h-10 text-discord-blurple" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No commands yet</h3>
            <p className="text-discord-text-secondary mb-6">
              Create your first slash command to get started building your bot
            </p>
            <button 
              onClick={handleAddCommand}
              className="btn-primary px-8 py-3 text-lg inline-flex items-center gap-2"
            >
              <FaPlus />
              Create Your First Command
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Commands List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Commands ({commands.length})</h3>
            </div>
            <div className="space-y-3">
              {commands.map((command) => (
                <div 
                  key={command.id}
                  className={`card-flat cursor-pointer group transition-all duration-300 ${
                    selectedCommand?.id === command.id 
                      ? 'border-discord-blurple bg-discord-blurple/5 shadow-lg shadow-discord-blurple/20' 
                      : 'hover:border-discord-blurple/50'
                  }`}
                  onClick={() => handleEditCommand(command.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-lg font-bold text-discord-blurple font-mono group-hover:text-discord-blurpleHover transition-colors">
                          /{command.name}
                        </span>
                        {command.options.length > 0 && (
                          <span className="badge-primary text-xs">
                            {command.options.length} option{command.options.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-discord-text-secondary line-clamp-2 mb-2">
                        {command.description}
                      </p>
                      {command.category && (
                        <span className="badge bg-gray-700/70 text-gray-300 border-gray-600">
                          {command.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicateCommand(command.id)
                        }}
                        className="p-2 text-discord-text-muted hover:text-discord-blurple hover:bg-discord-blurple/10 rounded-lg transition-all"
                        title="Duplicate command"
                      >
                        <FaCopy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCommand(command.id)
                        }}
                        className="p-2 text-discord-text-muted hover:text-discord-red hover:bg-discord-red/10 rounded-lg transition-all"
                        title="Delete command"
                      >
                        <FaTrash className="w-4 h-4" />
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
              <div className="card-flat animate-scale-in">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Edit Command</h3>
                    <p className="text-discord-text-secondary text-sm">Configure command settings and options</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                      >
                        <FaPen className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                    {isEditing && (
                      <button
                        onClick={() => setIsEditing(false)}
                        className="btn-success px-4 py-2 text-sm flex items-center gap-2"
                      >
                        <FaSave className="w-3 h-3" />
                        Save
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-discord-text-primary">
                          Command Name
                        </label>
                        <input
                          type="text"
                          value={selectedCommand.name}
                          onChange={(e) => updateCommand(selectedCommand.id, { name: e.target.value })}
                          disabled={!isEditing}
                          className="input-field w-full"
                          placeholder="my-command"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-discord-text-primary">
                          Category
                        </label>
                        <input
                          type="text"
                          value={selectedCommand.category || ''}
                          onChange={(e) => updateCommand(selectedCommand.id, { category: e.target.value })}
                          disabled={!isEditing}
                          className="input-field w-full"
                          placeholder="General"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-discord-text-primary">
                      Description
                    </label>
                    <textarea
                      value={selectedCommand.description}
                      onChange={(e) => updateCommand(selectedCommand.id, { description: e.target.value })}
                      disabled={!isEditing}
                      className="input-field w-full"
                      rows={3}
                      placeholder="What does this command do?"
                    />
                  </div>

                  {/* Response Type */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Response Settings</h4>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-discord-text-primary">
                        Response Type
                      </label>
                      <select
                        value={selectedCommand.responseType}
                        onChange={(e) => updateCommand(selectedCommand.id, { responseType: e.target.value as 'text' | 'embed' | 'custom' })}
                        disabled={!isEditing}
                        className="input-field w-full"
                      >
                        <option value="text">Simple Text</option>
                        <option value="embed">Rich Embed</option>
                        <option value="custom">Custom Code</option>
                      </select>
                    </div>
                  </div>

                  {/* Response Content */}
                  {selectedCommand.responseType === 'text' && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-discord-text-primary">
                        Response Message
                      </label>
                      <textarea
                        value={selectedCommand.response}
                        onChange={(e) => updateCommand(selectedCommand.id, { response: e.target.value })}
                        disabled={!isEditing}
                        className="input-field w-full"
                        rows={3}
                        placeholder="Hello! This command works!"
                      />
                    </div>
                  )}

                  {/* Command Options */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Command Options</h4>
                      {isEditing && (
                        <button
                          onClick={() => selectedCommand && addCommandOption(selectedCommand.id)}
                          className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                        >
                          <FaPlus className="w-3 h-3" />
                          Add Option
                        </button>
                      )}
                    </div>

                    {selectedCommand.options.length === 0 ? (
                      <div className="bg-discord-darkBg rounded-lg p-8 text-center border border-dashed border-gray-700">
                        <p className="text-discord-text-secondary">
                          No options added yet. {isEditing && 'Click "Add Option" to get started.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedCommand.options.map((option) => (
                          <div key={option.id} className="bg-discord-darkBg border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/50 transition-all">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-semibold mb-2 text-discord-text-primary">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={option.name}
                                  onChange={(e) => updateCommandOption(selectedCommand.id, option.id, { name: e.target.value })}
                                  disabled={!isEditing}
                                  className="input-field w-full text-sm"
                                  placeholder="option-name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-2 text-discord-text-primary">
                                  Type
                                </label>
                                <select
                                  value={option.type}
                                  onChange={(e) => updateCommandOption(selectedCommand.id, option.id, { type: e.target.value as any })}
                                  disabled={!isEditing}
                                  className="input-field w-full text-sm"
                                >
                                  <option value="STRING">Text</option>
                                  <option value="INTEGER">Number</option>
                                  <option value="BOOLEAN">True/False</option>
                                  <option value="USER">User</option>
                                  <option value="CHANNEL">Channel</option>
                                  <option value="ROLE">Role</option>
                                </select>
                              </div>
                              <div className="flex items-end gap-3">
                                <div className="flex items-center flex-1">
                                  <input
                                    type="checkbox"
                                    checked={option.required}
                                    onChange={(e) => updateCommandOption(selectedCommand.id, option.id, { required: e.target.checked })}
                                    disabled={!isEditing}
                                    className="w-4 h-4 text-discord-blurple bg-discord-darkBg border-gray-700 rounded focus:ring-discord-blurple focus:ring-2"
                                  />
                                  <label className="text-sm ml-2 text-discord-text-primary">Required</label>
                                </div>
                                {isEditing && (
                                  <button
                                    onClick={() => deleteCommandOption(selectedCommand.id, option.id)}
                                    className="p-2 text-discord-text-muted hover:text-discord-red hover:bg-discord-red/10 rounded-lg transition-all"
                                    title="Delete option"
                                  >
                                    <FaTrash className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="mt-3">
                              <label className="block text-xs font-semibold mb-2 text-discord-text-primary">
                                Description
                              </label>
                              <input
                                type="text"
                                value={option.description}
                                onChange={(e) => updateCommandOption(selectedCommand.id, option.id, { description: e.target.value })}
                                disabled={!isEditing}
                                className="input-field w-full text-sm"
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
              <div className="card-flat text-center py-16 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-discord-blurple/10 flex items-center justify-center">
                  <FaPen className="w-10 h-10 text-discord-blurple" />
                </div>
                <h3 className="text-xl font-bold mb-2">Select a command to edit</h3>
                <p className="text-discord-text-secondary">
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

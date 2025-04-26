import { useState } from 'react'
import { FaPlus, FaTrash, FaPen } from 'react-icons/fa'

type CommandOption = {
  name: string;
  description: string;
  type: string;
  required: boolean;
}

type Command = {
  id: string;
  name: string;
  description: string;
  options: CommandOption[];
  response: string;
}

type CommandBuilderProps = {
  commands: Command[];
  onChange: (commands: Command[]) => void;
}

export default function CommandBuilder({ commands = [], onChange }: CommandBuilderProps) {
  const [editingCommand, setEditingCommand] = useState<Command | null>(null)
  
  const handleAddCommand = () => {
    const newCommand: Command = {
      id: Date.now().toString(),
      name: 'new-command',
      description: 'Description of your command',
      options: [],
      response: 'Hello! This is a response from the bot.'
    }
    
    onChange([...commands, newCommand])
    setEditingCommand(newCommand)
  }
  
  const handleDeleteCommand = (id: string) => {
    onChange(commands.filter(cmd => cmd.id !== id))
    if (editingCommand?.id === id) {
      setEditingCommand(null)
    }
  }
  
  const handleUpdateCommand = (updatedCommand: Command) => {
    onChange(commands.map(cmd => 
      cmd.id === updatedCommand.id ? updatedCommand : cmd
    ))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Slash Commands</h2>
        <button 
          className="btn-primary flex items-center gap-2"
          onClick={handleAddCommand}
        >
          <FaPlus /> Add Command
        </button>
      </div>

      {commands.length === 0 ? (
        <div className="text-center py-12 bg-discord-darkBg rounded-lg">
          <p className="text-gray-400 mb-4">No commands created yet</p>
          <button 
            className="btn-primary flex items-center gap-2 mx-auto"
            onClick={handleAddCommand}
          >
            <FaPlus /> Create Your First Command
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {commands.map(command => (
            <div 
              key={command.id}
              className="bg-discord-darkBg p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">/{command.name}</h3>
                <p className="text-sm text-gray-400">{command.description}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="p-2 rounded-md bg-discord-lighterBg hover:bg-opacity-80"
                  onClick={() => setEditingCommand(command)}
                >
                  <FaPen />
                </button>
                <button 
                  className="p-2 rounded-md bg-discord-red hover:bg-opacity-80"
                  onClick={() => handleDeleteCommand(command.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingCommand && (
        <div className="mt-8 bg-discord-darkBg p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Edit Command</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Command Name</label>
              <input 
                type="text"
                value={editingCommand.name}
                onChange={(e) => setEditingCommand({
                  ...editingCommand,
                  name: e.target.value
                })}
                className="w-full bg-discord-lighterBg border border-gray-700 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block mb-1">Description</label>
              <input 
                type="text"
                value={editingCommand.description}
                onChange={(e) => setEditingCommand({
                  ...editingCommand,
                  description: e.target.value
                })}
                className="w-full bg-discord-lighterBg border border-gray-700 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block mb-1">Response</label>
              <textarea 
                value={editingCommand.response}
                onChange={(e) => setEditingCommand({
                  ...editingCommand,
                  response: e.target.value
                })}
                rows={4}
                className="w-full bg-discord-lighterBg border border-gray-700 rounded-md px-3 py-2"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="btn-secondary"
                onClick={() => setEditingCommand(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  handleUpdateCommand(editingCommand)
                  setEditingCommand(null)
                }}
              >
                Save Command
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

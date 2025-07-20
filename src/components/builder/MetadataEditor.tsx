import { useState } from 'react'
import { FaSave, FaRobot, FaCog, FaShieldAlt } from 'react-icons/fa'
import { useBuilderStore, useMetadata } from '../../store/builderStore'

export default function MetadataEditor() {
  const metadata = useMetadata()
  const { updateMetadata } = useBuilderStore()
  const [isEditing, setIsEditing] = useState(false)

  const availableIntents = [
    { value: 'GUILDS', label: 'Guilds', description: 'Basic server information' },
    { value: 'GUILD_MEMBERS', label: 'Guild Members', description: 'Member join/leave events' },
    { value: 'GUILD_MESSAGES', label: 'Guild Messages', description: 'Message events in servers' },
    { value: 'MESSAGE_CONTENT', label: 'Message Content', description: 'Read message content (privileged)' },
    { value: 'GUILD_MESSAGE_REACTIONS', label: 'Message Reactions', description: 'Reaction add/remove events' },
    { value: 'DIRECT_MESSAGES', label: 'Direct Messages', description: 'DM events' },
    { value: 'GUILD_VOICE_STATES', label: 'Voice States', description: 'Voice channel events' },
    { value: 'GUILD_PRESENCES', label: 'Presences', description: 'User presence updates (privileged)' },
  ]

  const statusOptions = [
    { value: 'online', label: '🟢 Online' },
    { value: 'idle', label: '🟡 Idle' },
    { value: 'dnd', label: '🔴 Do Not Disturb' },
    { value: 'invisible', label: '⚫ Invisible' },
  ]

  const activityTypes = [
    { value: 'PLAYING', label: 'Playing' },
    { value: 'STREAMING', label: 'Streaming' },
    { value: 'LISTENING', label: 'Listening to' },
    { value: 'WATCHING', label: 'Watching' },
    { value: 'CUSTOM', label: 'Custom Status' },
  ]

  const handleIntentToggle = (intent: string) => {
    const currentIntents = metadata.intents || []
    const newIntents = currentIntents.includes(intent)
      ? currentIntents.filter(i => i !== intent)
      : [...currentIntents, intent]
    
    updateMetadata({ intents: newIntents })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bot Configuration</h2>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-discord-blurple hover:bg-discord-blurple/80 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <FaCog className="w-3 h-3" />
              Edit
            </button>
          )}
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <FaSave className="w-3 h-3" />
              Save
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-discord-darkBg border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaRobot className="text-discord-blurple" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bot Name</label>
              <input 
                type="text"
                value={metadata.name}
                onChange={(e) => updateMetadata({ name: e.target.value })}
                disabled={!isEditing}
                placeholder="My Awesome Bot"
                className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bot Token</label>
              <input 
                type="password"
                value={metadata.token}
                onChange={(e) => updateMetadata({ token: e.target.value })}
                disabled={!isEditing}
                placeholder="YOUR_BOT_TOKEN"
                className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Client ID</label>
              <input 
                type="text"
                value={metadata.clientId}
                onChange={(e) => updateMetadata({ clientId: e.target.value })}
                disabled={!isEditing}
                placeholder="123456789012345678"
                className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prefix</label>
              <input 
                type="text"
                value={metadata.prefix}
                onChange={(e) => updateMetadata({ prefix: e.target.value })}
                disabled={!isEditing}
                placeholder="!"
                className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Bot Intents */}
        <div className="bg-discord-darkBg border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaShieldAlt className="text-green-400" />
            <h3 className="text-lg font-semibold">Bot Intents</h3>
          </div>
          
          <div className="space-y-3">
            {availableIntents.map((intent) => (
              <div key={intent.value} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={metadata.intents?.includes(intent.value) || false}
                  onChange={() => handleIntentToggle(intent.value)}
                  disabled={!isEditing}
                  className="mt-1 disabled:opacity-60"
                  id={`intent-${intent.value}`}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`intent-${intent.value}`} 
                    className="block text-sm font-medium cursor-pointer"
                  >
                    {intent.label}
                    {['MESSAGE_CONTENT', 'GUILD_PRESENCES', 'GUILD_MEMBERS'].includes(intent.value) && (
                      <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                        Privileged
                      </span>
                    )}
                  </label>
                  <p className="text-xs text-gray-400 mt-1">{intent.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

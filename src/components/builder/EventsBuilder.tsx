import { useState } from 'react'
import { FaPlus, FaTrash, FaPen, FaCopy, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import { useBuilderStore, useEvents, useSelectedEvent } from '../../store/builderStore'

export default function EventsBuilder() {
  const events = useEvents()
  const selectedEvent = useSelectedEvent()
  const { 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    duplicateEvent,
    toggleEvent,
    setSelectedEvent
  } = useBuilderStore()
  
  const [isEditing, setIsEditing] = useState(false)

  const eventTypes = [
    { value: 'ready', label: 'Bot Ready' },
    { value: 'messageCreate', label: 'Message Created' },
    { value: 'guildMemberAdd', label: 'Member Joined' },
    { value: 'guildMemberRemove', label: 'Member Left' },
    { value: 'interactionCreate', label: 'Interaction Created' },
    { value: 'voiceStateUpdate', label: 'Voice State Update' },
  ]

  const actionTypes = [
    { value: 'log', label: 'Console Log' },
    { value: 'message', label: 'Send Message' },
    { value: 'role', label: 'Assign Role' },
    { value: 'custom', label: 'Custom Code' },
  ]

  const handleAddEvent = () => {
    const newEventId = addEvent()
    setSelectedEvent(newEventId)
    setIsEditing(true)
  }

  const handleEditEvent = (eventId: string) => {
    setSelectedEvent(eventId)
    setIsEditing(true)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId)
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(undefined)
        setIsEditing(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Event Listeners</h2>
        <button 
          onClick={handleAddEvent}
          className="bg-discord-blurple hover:bg-discord-blurple/80 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FaPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No events yet</h3>
          <p className="text-sm mb-4">Create your first event listener to get started</p>
          <button 
            onClick={handleAddEvent}
            className="bg-discord-blurple hover:bg-discord-blurple/80 text-white px-6 py-3 rounded-md transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Events ({events.length})</h3>
            <div className="space-y-2">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className={`bg-discord-darkBg border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedEvent?.id === event.id 
                      ? 'border-discord-blurple bg-discord-blurple/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => handleEditEvent(event.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-400 font-mono text-sm">{event.type}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleEvent(event.id)
                          }}
                          className={`transition-colors ${
                            event.enabled ? 'text-green-400' : 'text-gray-500'
                          }`}
                          title={event.enabled ? 'Disable event' : 'Enable event'}
                        >
                          {event.enabled ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>
                      <p className="text-sm font-medium mb-1">{event.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded">
                          {actionTypes.find(type => type.value === event.actionType)?.label || event.actionType}
                        </span>
                        {!event.enabled && (
                          <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const newEventId = duplicateEvent(event.id)
                          setSelectedEvent(newEventId)
                        }}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Duplicate event"
                      >
                        <FaCopy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEvent(event.id)
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete event"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Editor */}
          <div className="space-y-4">
            {selectedEvent ? (
              <div className="bg-discord-darkBg border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Edit Event</h3>
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
                      <label className="block text-sm font-medium mb-2">Event Type</label>
                      <select
                        value={selectedEvent.type}
                        onChange={(e) => updateEvent(selectedEvent.id, { type: e.target.value as any })}
                        disabled={!isEditing}
                        className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
                      >
                        {eventTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Action Type</label>
                      <select
                        value={selectedEvent.actionType}
                        onChange={(e) => updateEvent(selectedEvent.id, { actionType: e.target.value as any })}
                        disabled={!isEditing}
                        className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
                      >
                        {actionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Event Name</label>
                    <input
                      type="text"
                      value={selectedEvent.name}
                      onChange={(e) => updateEvent(selectedEvent.id, { name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
                      placeholder="My Event Handler"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={selectedEvent.description}
                      onChange={(e) => updateEvent(selectedEvent.id, { description: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
                      rows={3}
                      placeholder="What does this event do?"
                    />
                  </div>

                  {/* Action Content based on action type */}
                  {selectedEvent.actionType === 'log' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Log Message</label>
                      <input
                        type="text"
                        value={selectedEvent.action}
                        onChange={(e) => updateEvent(selectedEvent.id, { action: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm disabled:opacity-60"
                        placeholder="Event triggered!"
                      />
                    </div>
                  )}

                  {selectedEvent.actionType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Custom Code</label>
                      <textarea
                        value={selectedEvent.customCode || selectedEvent.action}
                        onChange={(e) => updateEvent(selectedEvent.id, { 
                          customCode: e.target.value,
                          action: e.target.value 
                        })}
                        disabled={!isEditing}
                        className="w-full bg-discord-lighterBg border border-gray-600 rounded px-3 py-2 text-sm font-mono disabled:opacity-60"
                        rows={8}
                        placeholder={`console.log('Event triggered:', event);\n// Add your custom logic here`}
                      />
                    </div>
                  )}

                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center gap-3 p-4 bg-discord-lighterBg rounded-lg">
                    <button
                      onClick={() => toggleEvent(selectedEvent.id)}
                      disabled={!isEditing}
                      className={`transition-colors disabled:opacity-60 ${
                        selectedEvent.enabled ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {selectedEvent.enabled ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                    </button>
                    <div>
                      <p className="font-medium">
                        {selectedEvent.enabled ? 'Event Enabled' : 'Event Disabled'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedEvent.enabled 
                          ? 'This event will trigger when the condition is met' 
                          : 'This event is disabled and will not trigger'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-discord-darkBg border border-gray-700 rounded-lg p-12 text-center">
                <FaPen className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-medium mb-2">Select an event to edit</h3>
                <p className="text-sm text-gray-400">
                  Choose an event from the list to view and edit its settings
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { FaPlus, FaTrash, FaPen } from 'react-icons/fa'

type Event = {
  id: string;
  type: string;
  name: string;
  description: string;
  action: string;
}

type EventsBuilderProps = {
  events: Event[];
  onChange: (events: Event[]) => void;
}

export default function EventsBuilder({ events = [], onChange }: EventsBuilderProps) {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  
  const eventTypes = [
    { value: 'messageCreate', label: 'Message Created' },
    { value: 'guildMemberAdd', label: 'Member Joined' },
    { value: 'guildMemberRemove', label: 'Member Left' },
    { value: 'ready', label: 'Bot Ready' },
  ]
  
  const handleAddEvent = () => {
    const newEvent: Event = {
      id: Date.now().toString(),
      type: 'messageCreate',
      name: 'New Event',
      description: 'Responds to messages',
      action: 'console.log("A message was sent!");'
    }
    
    onChange([...events, newEvent])
    setEditingEvent(newEvent)
  }
  
  const handleDeleteEvent = (id: string) => {
    onChange(events.filter(event => event.id !== id))
    if (editingEvent?.id === id) {
      setEditingEvent(null)
    }
  }
  
  const handleUpdateEvent = (updatedEvent: Event) => {
    onChange(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Event Listeners</h2>
        <button 
          className="btn-primary flex items-center gap-2"
          onClick={handleAddEvent}
        >
          <FaPlus /> Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-discord-darkBg rounded-lg">
          <p className="text-gray-400 mb-4">No events configured yet</p>
          <button 
            className="btn-primary flex items-center gap-2 mx-auto"
            onClick={handleAddEvent}
          >
            <FaPlus /> Create Your First Event Listener
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map(event => (
            <div 
              key={event.id}
              className="bg-discord-darkBg p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{event.name}</h3>
                <p className="text-sm text-gray-400">
                  {eventTypes.find(e => e.value === event.type)?.label || event.type}
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="p-2 rounded-md bg-discord-lighterBg hover:bg-opacity-80"
                  onClick={() => setEditingEvent(event)}
                >
                  <FaPen />
                </button>
                <button 
                  className="p-2 rounded-md bg-discord-red hover:bg-opacity-80"
                  onClick={() => handleDeleteEvent(event.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingEvent && (
        <div className="mt-8 bg-discord-darkBg p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Edit Event</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Event Name</label>
              <input 
                type="text"
                value={editingEvent.name}
                onChange={(e) => setEditingEvent({
                  ...editingEvent,
                  name: e.target.value
                })}
                className="w-full bg-discord-lighterBg border border-gray-700 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block mb-1">Event Type</label>
              <select
                value={editingEvent.type}
                onChange={(e) => setEditingEvent({
                  ...editingEvent,
                  type: e.target.value
                })}
                className="w-full bg-discord-lighterBg border border-gray-700 rounded-md px-3 py-2"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-1">Description</label>
              <input 
                type="text"
                value={editingEvent.description}
                onChange={(e) => setEditingEvent({
                  ...editingEvent,
                  description: e.target.value
                })}
                className="w-full bg-discord-lighterBg border border-gray-700 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block mb-1">Action Code</label>
              <textarea 
                value={editingEvent.action}
                onChange={(e) => setEditingEvent({
                  ...editingEvent,
                  action: e.target.value
                })}
                rows={4}
                className="w-full bg-discord-lighterBg border border-gray-700 rounded-md px-3 py-2 font-mono"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="btn-secondary"
                onClick={() => setEditingEvent(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  handleUpdateEvent(editingEvent)
                  setEditingEvent(null)
                }}
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

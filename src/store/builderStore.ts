import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types for command options
export interface CommandOption {
  id: string
  name: string
  description: string
  type: 'STRING' | 'INTEGER' | 'BOOLEAN' | 'USER' | 'CHANNEL' | 'ROLE' | 'MENTIONABLE' | 'NUMBER'
  required: boolean
  choices?: { name: string; value: string | number }[]
  minValue?: number
  maxValue?: number
  minLength?: number
  maxLength?: number
}

// Types for commands
export interface Command {
  id: string
  name: string
  description: string
  options: CommandOption[]
  response: string
  responseType: 'text' | 'embed' | 'custom'
  embedData?: {
    title?: string
    description?: string
    color?: string
    footer?: string
    thumbnail?: string
    image?: string
    fields?: { name: string; value: string; inline?: boolean }[]
  }
  customCode?: string
  category?: string
  permissions?: string[]
  cooldown?: number
}

// Types for events
export interface Event {
  id: string
  type: 'ready' | 'messageCreate' | 'guildMemberAdd' | 'guildMemberRemove' | 'interactionCreate' | 'voiceStateUpdate'
  name: string
  description: string
  action: string
  actionType: 'log' | 'message' | 'role' | 'custom'
  channelId?: string
  roleId?: string
  customCode?: string
  enabled: boolean
}

// Types for bot metadata
export interface BotMetadata {
  name: string
  token: string
  prefix: string
  clientId: string
  guildId?: string
  intents: string[]
  description?: string
  version: string
  author?: string
  color?: string
  status?: 'online' | 'idle' | 'dnd' | 'invisible'
  activity?: {
    type: 'PLAYING' | 'STREAMING' | 'LISTENING' | 'WATCHING' | 'CUSTOM'
    name: string
    url?: string
  }
}

// Types for project settings
export interface ProjectSettings {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  version: string
  tags: string[]
}

// Main bot data interface
export interface BotData {
  commands: Command[]
  events: Event[]
  metadata: BotMetadata
  settings: ProjectSettings
}

// Builder UI state
export interface BuilderUIState {
  activeTab: 'commands' | 'events' | 'metadata' | 'settings'
  selectedCommandId?: string
  selectedEventId?: string
  isPreviewOpen: boolean
  isDirty: boolean
  lastSaved?: Date
  errors: { [key: string]: string[] }
  warnings: { [key: string]: string[] }
}

// Store interface
interface BuilderStore {
  // Bot data
  botData: BotData
  
  // UI state
  uiState: BuilderUIState
  
  // Actions for commands
  addCommand: () => string
  updateCommand: (id: string, updates: Partial<Command>) => void
  deleteCommand: (id: string) => void
  duplicateCommand: (id: string) => string
  reorderCommands: (oldIndex: number, newIndex: number) => void
  
  // Actions for command options
  addCommandOption: (commandId: string) => string
  updateCommandOption: (commandId: string, optionId: string, updates: Partial<CommandOption>) => void
  deleteCommandOption: (commandId: string, optionId: string) => void
  reorderCommandOptions: (commandId: string, oldIndex: number, newIndex: number) => void
  
  // Actions for events
  addEvent: () => string
  updateEvent: (id: string, updates: Partial<Event>) => void
  deleteEvent: (id: string) => void
  duplicateEvent: (id: string) => string
  toggleEvent: (id: string) => void
  
  // Actions for metadata
  updateMetadata: (updates: Partial<BotMetadata>) => void
  updateProjectSettings: (updates: Partial<ProjectSettings>) => void
  
  // UI actions
  setActiveTab: (tab: BuilderUIState['activeTab']) => void
  setSelectedCommand: (id?: string) => void
  setSelectedEvent: (id?: string) => void
  togglePreview: () => void
  markDirty: () => void
  markClean: () => void
  
  // Validation and error handling
  validateCommand: (id: string) => string[]
  validateEvent: (id: string) => string[]
  validateMetadata: () => string[]
  clearErrors: () => void
  
  // Project management
  resetProject: () => void
  loadProject: (data: Partial<BotData>) => void
  exportProject: () => BotData
  importProject: (data: BotData) => void
  
  // Template management
  saveAsTemplate: (name: string, description?: string) => void
  loadTemplate: (templateData: BotData) => void
}

// Default values
const defaultMetadata: BotMetadata = {
  name: 'My Discord Bot',
  token: 'YOUR_BOT_TOKEN',
  prefix: '!',
  clientId: 'YOUR_CLIENT_ID',
  intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT'],
  version: '1.0.0',
  status: 'online',
  activity: {
    type: 'PLAYING',
    name: 'with commands!'
  }
}

const defaultSettings: ProjectSettings = {
  id: crypto.randomUUID(),
  name: 'Untitled Project',
  createdAt: new Date(),
  updatedAt: new Date(),
  version: '1.0.0',
  tags: []
}

const defaultUIState: BuilderUIState = {
  activeTab: 'commands',
  isPreviewOpen: false,
  isDirty: false,
  errors: {},
  warnings: {}
}

// Helper functions
const generateId = () => crypto.randomUUID()

const createDefaultCommand = (): Command => ({
  id: generateId(),
  name: 'new-command',
  description: 'Description of your command',
  options: [],
  response: 'Hello! This is a response from the bot.',
  responseType: 'text',
  category: 'General',
  permissions: [],
  cooldown: 0
})

const createDefaultEvent = (): Event => ({
  id: generateId(),
  type: 'messageCreate',
  name: 'New Event',
  description: 'Responds to messages',
  action: 'console.log("A message was sent!");',
  actionType: 'log',
  enabled: true
})

const createDefaultCommandOption = (): CommandOption => ({
  id: generateId(),
  name: 'option',
  description: 'An option for this command',
  type: 'STRING',
  required: false
})

// Validation functions
const validateCommandName = (name: string): string[] => {
  const errors: string[] = []
  if (!name || name.trim().length === 0) {
    errors.push('Command name is required')
  } else if (!/^[\w-]+$/.test(name)) {
    errors.push('Command name can only contain letters, numbers, hyphens, and underscores')
  } else if (name.length > 32) {
    errors.push('Command name cannot exceed 32 characters')
  }
  return errors
}

const validateCommandDescription = (description: string): string[] => {
  const errors: string[] = []
  if (!description || description.trim().length === 0) {
    errors.push('Command description is required')
  } else if (description.length > 100) {
    errors.push('Command description cannot exceed 100 characters')
  }
  return errors
}

// Create the store
export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      // Initial state
      botData: {
        commands: [],
        events: [],
        metadata: defaultMetadata,
        settings: defaultSettings
      },
      uiState: defaultUIState,

      // Command actions
      addCommand: () => {
        const newCommand = createDefaultCommand()
        set((state) => ({
          botData: {
            ...state.botData,
            commands: [...state.botData.commands, newCommand]
          },
          uiState: {
            ...state.uiState,
            selectedCommandId: newCommand.id,
            isDirty: true
          }
        }))
        return newCommand.id
      },

      updateCommand: (id: string, updates: Partial<Command>) => {
        set((state) => ({
          botData: {
            ...state.botData,
            commands: state.botData.commands.map((cmd) =>
              cmd.id === id ? { ...cmd, ...updates } : cmd
            )
          },
          uiState: {
            ...state.uiState,
            isDirty: true
          }
        }))
      },

      deleteCommand: (id: string) => {
        set((state) => ({
          botData: {
            ...state.botData,
            commands: state.botData.commands.filter((cmd) => cmd.id !== id)
          },
          uiState: {
            ...state.uiState,
            selectedCommandId: state.uiState.selectedCommandId === id ? undefined : state.uiState.selectedCommandId,
            isDirty: true
          }
        }))
      },

      duplicateCommand: (id: string) => {
        const command = get().botData.commands.find((cmd) => cmd.id === id)
        if (!command) return ''

        const duplicatedCommand = {
          ...command,
          id: generateId(),
          name: `${command.name}-copy`
        }

        set((state) => ({
          botData: {
            ...state.botData,
            commands: [...state.botData.commands, duplicatedCommand]
          },
          uiState: {
            ...state.uiState,
            selectedCommandId: duplicatedCommand.id,
            isDirty: true
          }
        }))
        return duplicatedCommand.id
      },

      reorderCommands: (oldIndex: number, newIndex: number) => {
        set((state) => {
          const commands = [...state.botData.commands]
          const [movedCommand] = commands.splice(oldIndex, 1)
          commands.splice(newIndex, 0, movedCommand)

          return {
            botData: {
              ...state.botData,
              commands
            },
            uiState: {
              ...state.uiState,
              isDirty: true
            }
          }
        })
      },

      // Command option actions
      addCommandOption: (commandId: string) => {
        const newOption = createDefaultCommandOption()
        set((state) => ({
          botData: {
            ...state.botData,
            commands: state.botData.commands.map((cmd) =>
              cmd.id === commandId
                ? { ...cmd, options: [...cmd.options, newOption] }
                : cmd
            )
          },
          uiState: {
            ...state.uiState,
            isDirty: true
          }
        }))
        return newOption.id
      },

      updateCommandOption: (commandId: string, optionId: string, updates: Partial<CommandOption>) => {
        set((state) => ({
          botData: {
            ...state.botData,
            commands: state.botData.commands.map((cmd) =>
              cmd.id === commandId
                ? {
                    ...cmd,
                    options: cmd.options.map((opt) =>
                      opt.id === optionId ? { ...opt, ...updates } : opt
                    )
                  }
                : cmd
            )
          },
          uiState: {
            ...state.uiState,
            isDirty: true
          }
        }))
      },

      deleteCommandOption: (commandId: string, optionId: string) => {
        set((state) => ({
          botData: {
            ...state.botData,
            commands: state.botData.commands.map((cmd) =>
              cmd.id === commandId
                ? { ...cmd, options: cmd.options.filter((opt) => opt.id !== optionId) }
                : cmd
            )
          },
          uiState: {
            ...state.uiState,
            isDirty: true
          }
        }))
      },

      reorderCommandOptions: (commandId: string, oldIndex: number, newIndex: number) => {
        set((state) => ({
          botData: {
            ...state.botData,
            commands: state.botData.commands.map((cmd) => {
              if (cmd.id === commandId) {
                const options = [...cmd.options]
                const [movedOption] = options.splice(oldIndex, 1)
                options.splice(newIndex, 0, movedOption)
                return { ...cmd, options }
              }
              return cmd
            })
          },
          uiState: {
            ...state.uiState,
            isDirty: true
          }
        }))
      },

      // Event actions
      addEvent: () => {
        const newEvent = createDefaultEvent()
        set((state) => ({
          botData: {
            ...state.botData,
            events: [...state.botData.events, newEvent]
          },
          uiState: {
            ...state.uiState,
            selectedEventId: newEvent.id,
            isDirty: true
          }
        }))
        return newEvent.id
      },

      updateEvent: (id: string, updates: Partial<Event>) => {
        set((state) => ({
          botData: {
            ...state.botData,
            events: state.botData.events.map((event) =>
              event.id === id ? { ...event, ...updates } : event
            )
          },
          uiState: {
            ...state.uiState,
            isDirty: true
          }
        }))
      },

      deleteEvent: (id: string) => {
        set((state) => ({
          botData: {
            ...state.botData,
            events: state.botData.events.filter((event) => event.id !== id)
          },
          uiState: {
            ...state.uiState,
            selectedEventId: state.uiState.selectedEventId === id ? undefined : state.uiState.selectedEventId,
            isDirty: true
          }
        }))
      },

      duplicateEvent: (id: string) => {
        const event = get().botData.events.find((evt) => evt.id === id)
        if (!event) return ''

        const duplicatedEvent = {
          ...event,
          id: generateId(),
          name: `${event.name} Copy`
        }

        set((state) => ({
          botData: {
            ...state.botData,
            events: [...state.botData.events, duplicatedEvent]
          },
          uiState: {
            ...state.uiState,
            selectedEventId: duplicatedEvent.id,
            isDirty: true
          }
        }))
        return duplicatedEvent.id
      },

      toggleEvent: (id: string) => {
        set((state) => ({
          botData: {
            ...state.botData,
            events: state.botData.events.map((event) =>
              event.id === id ? { ...event, enabled: !event.enabled } : event
            )
          },
          uiState: {
            ...state.uiState,
            isDirty: true
          }
        }))
      },

      // Metadata actions
      updateMetadata: (updates: Partial<BotMetadata>) => {
        set((state) => ({
          botData: {
            ...state.botData,
            metadata: { ...state.botData.metadata, ...updates }
          },
          uiState: {
            ...state.uiState,
            isDirty: true
          }
        }))
      },

      updateProjectSettings: (updates: Partial<ProjectSettings>) => {
        set((state) => ({
          botData: {
            ...state.botData,
            settings: {
              ...state.botData.settings,
              ...updates,
              updatedAt: new Date()
            }
          },
          uiState: {
            ...state.uiState,
            isDirty: true
          }
        }))
      },

      // UI actions
      setActiveTab: (tab: BuilderUIState['activeTab']) => {
        set((state) => ({
          uiState: { ...state.uiState, activeTab: tab }
        }))
      },

      setSelectedCommand: (id?: string) => {
        set((state) => ({
          uiState: { ...state.uiState, selectedCommandId: id }
        }))
      },

      setSelectedEvent: (id?: string) => {
        set((state) => ({
          uiState: { ...state.uiState, selectedEventId: id }
        }))
      },

      togglePreview: () => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            isPreviewOpen: !state.uiState.isPreviewOpen
          }
        }))
      },

      markDirty: () => {
        set((state) => ({
          uiState: { ...state.uiState, isDirty: true }
        }))
      },

      markClean: () => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            isDirty: false,
            lastSaved: new Date()
          }
        }))
      },

      // Validation actions
      validateCommand: (id: string) => {
        const command = get().botData.commands.find((cmd) => cmd.id === id)
        if (!command) return []

        const errors: string[] = []
        errors.push(...validateCommandName(command.name))
        errors.push(...validateCommandDescription(command.description))

        // Validate options
        command.options.forEach((option, index) => {
          if (!option.name.trim()) {
            errors.push(`Option ${index + 1}: Name is required`)
          }
          if (!option.description.trim()) {
            errors.push(`Option ${index + 1}: Description is required`)
          }
        })

        return errors
      },

      validateEvent: (id: string) => {
        const event = get().botData.events.find((evt) => evt.id === id)
        if (!event) return []

        const errors: string[] = []
        if (!event.name.trim()) {
          errors.push('Event name is required')
        }
        if (!event.action.trim()) {
          errors.push('Event action is required')
        }

        return errors
      },

      validateMetadata: () => {
        const { metadata } = get().botData
        const errors: string[] = []

        if (!metadata.name.trim()) {
          errors.push('Bot name is required')
        }
        if (!metadata.clientId.trim()) {
          errors.push('Client ID is required')
        }
        if (metadata.intents.length === 0) {
          errors.push('At least one intent is required')
        }

        return errors
      },

      clearErrors: () => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            errors: {},
            warnings: {}
          }
        }))
      },

      // Project management actions
      resetProject: () => {
        set({
          botData: {
            commands: [],
            events: [],
            metadata: { ...defaultMetadata },
            settings: {
              ...defaultSettings,
              id: generateId(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          },
          uiState: { ...defaultUIState }
        })
      },

      loadProject: (data: Partial<BotData>) => {
        set((state) => ({
          botData: {
            ...state.botData,
            ...data,
            settings: {
              ...state.botData.settings,
              ...data.settings,
              updatedAt: new Date()
            }
          },
          uiState: {
            ...state.uiState,
            isDirty: false,
            selectedCommandId: undefined,
            selectedEventId: undefined
          }
        }))
      },

      exportProject: () => {
        return get().botData
      },

      importProject: (data: BotData) => {
        set({
          botData: {
            ...data,
            settings: {
              ...data.settings,
              updatedAt: new Date()
            }
          },
          uiState: {
            ...defaultUIState,
            isDirty: false
          }
        })
      },

      // Template actions
      saveAsTemplate: (name: string, description?: string) => {
        const { botData } = get()
        const templateData = {
          ...botData,
          settings: {
            ...botData.settings,
            name,
            description,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
        
        // In a real app, you'd save this to a templates API/database
        console.log('Template saved:', templateData)
      },

      loadTemplate: (templateData: BotData) => {
        set({
          botData: {
            ...templateData,
            settings: {
              ...templateData.settings,
              id: generateId(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          },
          uiState: {
            ...defaultUIState,
            isDirty: true
          }
        })
      }
    }),
    {
      name: 'discord-bot-builder',
      partialize: (state) => ({
        botData: state.botData
      })
    }
  )
)

// Selector hooks for better performance
export const useCommands = () => useBuilderStore((state) => state.botData.commands)
export const useEvents = () => useBuilderStore((state) => state.botData.events)
export const useMetadata = () => useBuilderStore((state) => state.botData.metadata)
export const useProjectSettings = () => useBuilderStore((state) => state.botData.settings)
export const useUIState = () => useBuilderStore((state) => state.uiState)
export const useSelectedCommand = () => useBuilderStore((state) => {
  const selectedId = state.uiState.selectedCommandId
  return selectedId ? state.botData.commands.find(cmd => cmd.id === selectedId) : undefined
})
export const useSelectedEvent = () => useBuilderStore((state) => {
  const selectedId = state.uiState.selectedEventId
  return selectedId ? state.botData.events.find(evt => evt.id === selectedId) : undefined
})

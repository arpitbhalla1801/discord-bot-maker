import { CommandGraphJson } from '@/types/graph'

export interface GraphTemplate {
  id: string
  name: string
  description: string
  category: 'welcome' | 'moderation' | 'utility' | 'fun' | 'advanced'
  icon: string
  graph: CommandGraphJson
}

export const GRAPH_TEMPLATES: GraphTemplate[] = [
  {
    id: 'simple-reply',
    name: 'Simple Reply',
    description: 'Basic command that sends a message',
    category: 'welcome',
    icon: '💬',
    graph: {
      nodes: [
        {
          id: 'start-1',
          type: 'START',
          position: { x: 250, y: 50 },
          data: { label: 'Command Started' }
        },
        {
          id: 'msg-1',
          type: 'SEND_MESSAGE',
          position: { x: 250, y: 150 },
          data: {
            content: 'Hello! This is a simple reply.',
            ephemeral: false
          }
        },
        {
          id: 'end-1',
          type: 'END',
          position: { x: 250, y: 250 },
          data: { label: 'Done' }
        }
      ] as any,
      edges: [
        {
          id: 'e1-2',
          source: 'start-1',
          target: 'msg-1'
        },
        {
          id: 'e2-3',
          source: 'msg-1',
          target: 'end-1'
        }
      ],
      variables: {}
    }
  },
  {
    id: 'welcome-message',
    name: 'Welcome Message',
    description: 'Sends an embed with welcome information',
    category: 'welcome',
    icon: '👋',
    graph: {
      nodes: [
        {
          id: 'start-1',
          type: 'START',
          position: { x: 250, y: 50 },
          data: { label: 'Welcome Command' }
        },
        {
          id: 'embed-1',
          type: 'SEND_EMBED',
          position: { x: 250, y: 150 },
          data: {
            title: 'Welcome to {guild.name}! 👋',
            description: 'Thanks for joining, {user.username}! We are glad to have you here.',
            color: '#5865F2',
            footer: 'Enjoy your stay!',
            fields: [
              {
                name: '📜 Rules',
                value: 'Check out #rules',
                inline: true
              },
              {
                name: '💬 Chat',
                value: 'Say hi in #general',
                inline: true
              }
            ]
          }
        },
        {
          id: 'end-1',
          type: 'END',
          position: { x: 250, y: 300 },
          data: { label: 'Done' }
        }
      ] as any,
      edges: [
        {
          id: 'e1-2',
          source: 'start-1',
          target: 'embed-1'
        },
        {
          id: 'e2-3',
          source: 'embed-1',
          target: 'end-1'
        }
      ],
      variables: {}
    }
  },
  {
    id: 'user-info',
    name: 'User Info',
    description: 'Display information about a user',
    category: 'utility',
    icon: '👤',
    graph: {
      nodes: [
        {
          id: 'start-1',
          type: 'START',
          position: { x: 250, y: 50 },
          data: { label: 'User Info Command' }
        },
        {
          id: 'embed-1',
          type: 'SEND_EMBED',
          position: { x: 250, y: 150 },
          data: {
            title: 'User Information',
            description: 'Details about {user.username}',
            color: '#00FF00',
            thumbnail: '{user.avatar}',
            fields: [
              {
                name: 'Username',
                value: '{user.username}',
                inline: true
              },
              {
                name: 'User ID',
                value: '{user.id}',
                inline: true
              },
              {
                name: 'Joined Server',
                value: '{user.joinedAt}',
                inline: false
              }
            ]
          }
        },
        {
          id: 'end-1',
          type: 'END',
          position: { x: 250, y: 300 },
          data: { label: 'Done' }
        }
      ] as any,
      edges: [
        {
          id: 'e1-2',
          source: 'start-1',
          target: 'embed-1'
        },
        {
          id: 'e2-3',
          source: 'embed-1',
          target: 'end-1'
        }
      ],
      variables: {}
    }
  },
  {
    id: 'random-response',
    name: 'Random Response',
    description: 'Pick a random response from options',
    category: 'fun',
    icon: '🎲',
    graph: {
      nodes: [
        {
          id: 'start-1',
          type: 'START',
          position: { x: 250, y: 50 },
          data: { label: 'Start' }
        },
        {
          id: 'random-1',
          type: 'RANDOM',
          position: { x: 250, y: 150 },
          data: {
            min: 1,
            max: 3,
            variableName: 'randomChoice'
          }
        },
        {
          id: 'msg-1',
          type: 'SEND_MESSAGE',
          position: { x: 250, y: 250 },
          data: {
            content: 'Your random number is: {randomChoice}! 🎲',
            ephemeral: false
          }
        },
        {
          id: 'end-1',
          type: 'END',
          position: { x: 250, y: 350 },
          data: { label: 'Done' }
        }
      ] as any,
      edges: [
        {
          id: 'e1-2',
          source: 'start-1',
          target: 'random-1'
        },
        {
          id: 'e2-3',
          source: 'random-1',
          target: 'msg-1'
        },
        {
          id: 'e3-4',
          source: 'msg-1',
          target: 'end-1'
        }
      ],
      variables: {}
    }
  },
  {
    id: 'delayed-message',
    name: 'Delayed Message',
    description: 'Send a message after a delay',
    category: 'utility',
    icon: '⏱️',
    graph: {
      nodes: [
        {
          id: 'start-1',
          type: 'START',
          position: { x: 250, y: 50 },
          data: { label: 'Start' }
        },
        {
          id: 'msg-1',
          type: 'SEND_MESSAGE',
          position: { x: 250, y: 150 },
          data: {
            content: 'Processing... Please wait 3 seconds.',
            ephemeral: false
          }
        },
        {
          id: 'delay-1',
          type: 'DELAY',
          position: { x: 250, y: 250 },
          data: {
            duration: 3000
          }
        },
        {
          id: 'msg-2',
          type: 'SEND_MESSAGE',
          position: { x: 250, y: 350 },
          data: {
            content: 'Done! Thanks for waiting.',
            ephemeral: false
          }
        },
        {
          id: 'end-1',
          type: 'END',
          position: { x: 250, y: 450 },
          data: { label: 'Done' }
        }
      ] as any,
      edges: [
        {
          id: 'e1-2',
          source: 'start-1',
          target: 'msg-1'
        },
        {
          id: 'e2-3',
          source: 'msg-1',
          target: 'delay-1'
        },
        {
          id: 'e3-4',
          source: 'delay-1',
          target: 'msg-2'
        },
        {
          id: 'e4-5',
          source: 'msg-2',
          target: 'end-1'
        }
      ],
      variables: {}
    }
  }
]

export const TEMPLATE_CATEGORIES = [
  { id: 'welcome', label: 'Welcome', emoji: '👋' },
  { id: 'moderation', label: 'Moderation', emoji: '🛡️' },
  { id: 'utility', label: 'Utility', emoji: '🔧' },
  { id: 'fun', label: 'Fun', emoji: '🎉' },
  { id: 'advanced', label: 'Advanced', emoji: '⚡' },
] as const

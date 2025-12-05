// Graph Node Types - Core building blocks for bot commands

export type NodeType =
  | 'START'
  | 'SEND_MESSAGE'
  | 'SEND_EMBED'
  | 'IF_CONDITION'
  | 'SET_VARIABLE'
  | 'GET_VARIABLE'
  | 'AWAIT_REPLY'
  | 'ADD_ROLE'
  | 'REMOVE_ROLE'
  | 'API_CALL'
  | 'DELAY'
  | 'RANDOM'
  | 'MATH_OPERATION'
  | 'END'

export type VariableScope = 'local' | 'global' | 'user' | 'server'

export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'

// Base node structure
export interface BaseNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: Record<string, any>
}

// Specific node types with their data structures

export interface StartNode extends BaseNode {
  type: 'START'
  data: {
    label: string
  }
}

export interface SendMessageNode extends BaseNode {
  type: 'SEND_MESSAGE'
  data: {
    content: string
    channelId?: string // Optional: specific channel, otherwise reply to interaction
    ephemeral?: boolean // Only sender can see
    deleteAfter?: number // Auto-delete after N seconds
  }
}

export interface SendEmbedNode extends BaseNode {
  type: 'SEND_EMBED'
  data: {
    title?: string
    description?: string
    color?: string // Hex color
    footer?: string
    thumbnail?: string
    image?: string
    fields?: Array<{
      name: string
      value: string
      inline?: boolean
    }>
    channelId?: string
    ephemeral?: boolean
  }
}

export interface IfConditionNode extends BaseNode {
  type: 'IF_CONDITION'
  data: {
    variable: string
    operator: ConditionOperator
    value: string | number | boolean
    trueLabel?: string
    falseLabel?: string
  }
}

export interface SetVariableNode extends BaseNode {
  type: 'SET_VARIABLE'
  data: {
    variableName: string
    value: string | number | boolean
    scope: VariableScope
    type: 'string' | 'number' | 'boolean' | 'object'
  }
}

export interface GetVariableNode extends BaseNode {
  type: 'GET_VARIABLE'
  data: {
    variableName: string
    scope: VariableScope
    defaultValue?: any
  }
}

export interface AwaitReplyNode extends BaseNode {
  type: 'AWAIT_REPLY'
  data: {
    prompt: string
    timeout?: number // Milliseconds
    variableName: string // Store reply in this variable
    filter?: {
      userId?: string // Only accept from specific user
      channelId?: string // Only accept in specific channel
    }
  }
}

export interface AddRoleNode extends BaseNode {
  type: 'ADD_ROLE'
  data: {
    userId: string // Variable name containing user ID
    roleId: string // Variable name or literal role ID
  }
}

export interface RemoveRoleNode extends BaseNode {
  type: 'REMOVE_ROLE'
  data: {
    userId: string
    roleId: string
  }
}

export interface ApiCallNode extends BaseNode {
  type: 'API_CALL'
  data: {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    headers?: Record<string, string>
    body?: string // JSON string or variable reference
    responseVariable: string // Store response in this variable
    errorVariable?: string // Store error in this variable
  }
}

export interface DelayNode extends BaseNode {
  type: 'DELAY'
  data: {
    duration: number // Milliseconds
  }
}

export interface RandomNode extends BaseNode {
  type: 'RANDOM'
  data: {
    min: number
    max: number
    variableName: string // Store random number here
  }
}

export interface MathOperationNode extends BaseNode {
  type: 'MATH_OPERATION'
  data: {
    operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'modulo'
    operand1: string | number // Variable name or literal
    operand2: string | number
    resultVariable: string
  }
}

export interface EndNode extends BaseNode {
  type: 'END'
  data: {
    label: string
  }
}

// Union type of all node types
export type GraphNode = 
  | StartNode
  | SendMessageNode
  | SendEmbedNode
  | IfConditionNode
  | SetVariableNode
  | GetVariableNode
  | AwaitReplyNode
  | AddRoleNode
  | RemoveRoleNode
  | ApiCallNode
  | DelayNode
  | RandomNode
  | MathOperationNode
  | EndNode

// Edge structure
export interface GraphEdge {
  id: string
  source: string // Source node ID
  target: string // Target node ID
  sourceHandle?: string // For conditional branches (e.g., 'true', 'false')
  targetHandle?: string
  label?: string
}

// Variable definition
export interface GraphVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object'
  scope: VariableScope
  defaultValue?: any
  description?: string
}

// Complete graph structure (stored in CommandGraph.graphJson)
export interface CommandGraphJson {
  nodes: GraphNode[]
  edges: GraphEdge[]
  variables: Record<string, GraphVariable>
  metadata?: {
    zoom?: number
    viewportX?: number
    viewportY?: number
  }
}

// Node metadata for the visual editor
export interface NodeMetadata {
  type: NodeType
  label: string
  description: string
  color: string
  icon: string
  category: 'basic' | 'logic' | 'variables' | 'discord' | 'advanced'
  inputs: number // Number of input handles
  outputs: number | 'dynamic' // Number of output handles
}

// Node metadata registry
export const NODE_TYPES_METADATA: Record<NodeType, NodeMetadata> = {
  START: {
    type: 'START',
    label: 'Start',
    description: 'Entry point of the command',
    color: '#10b981',
    icon: '▶️',
    category: 'basic',
    inputs: 0,
    outputs: 1
  },
  SEND_MESSAGE: {
    type: 'SEND_MESSAGE',
    label: 'Send Message',
    description: 'Send a text message',
    color: '#3b82f6',
    icon: '💬',
    category: 'basic',
    inputs: 1,
    outputs: 1
  },
  SEND_EMBED: {
    type: 'SEND_EMBED',
    label: 'Send Embed',
    description: 'Send a rich embed message',
    color: '#8b5cf6',
    icon: '📋',
    category: 'basic',
    inputs: 1,
    outputs: 1
  },
  IF_CONDITION: {
    type: 'IF_CONDITION',
    label: 'If Condition',
    description: 'Branch based on a condition',
    color: '#f59e0b',
    icon: '🔀',
    category: 'logic',
    inputs: 1,
    outputs: 2 // true and false branches
  },
  SET_VARIABLE: {
    type: 'SET_VARIABLE',
    label: 'Set Variable',
    description: 'Store a value in a variable',
    color: '#06b6d4',
    icon: '📝',
    category: 'variables',
    inputs: 1,
    outputs: 1
  },
  GET_VARIABLE: {
    type: 'GET_VARIABLE',
    label: 'Get Variable',
    description: 'Retrieve a variable value',
    color: '#0ea5e9',
    icon: '📖',
    category: 'variables',
    inputs: 1,
    outputs: 1
  },
  AWAIT_REPLY: {
    type: 'AWAIT_REPLY',
    label: 'Await Reply',
    description: 'Wait for user to reply',
    color: '#ec4899',
    icon: '⏳',
    category: 'advanced',
    inputs: 1,
    outputs: 1
  },
  ADD_ROLE: {
    type: 'ADD_ROLE',
    label: 'Add Role',
    description: 'Add a role to a user',
    color: '#14b8a6',
    icon: '➕',
    category: 'discord',
    inputs: 1,
    outputs: 1
  },
  REMOVE_ROLE: {
    type: 'REMOVE_ROLE',
    label: 'Remove Role',
    description: 'Remove a role from a user',
    color: '#ef4444',
    icon: '➖',
    category: 'discord',
    inputs: 1,
    outputs: 1
  },
  API_CALL: {
    type: 'API_CALL',
    label: 'API Call',
    description: 'Make an HTTP request',
    color: '#a855f7',
    icon: '🌐',
    category: 'advanced',
    inputs: 1,
    outputs: 1
  },
  DELAY: {
    type: 'DELAY',
    label: 'Delay',
    description: 'Wait for a duration',
    color: '#64748b',
    icon: '⏱️',
    category: 'basic',
    inputs: 1,
    outputs: 1
  },
  RANDOM: {
    type: 'RANDOM',
    label: 'Random Number',
    description: 'Generate a random number',
    color: '#f97316',
    icon: '🎲',
    category: 'logic',
    inputs: 1,
    outputs: 1
  },
  MATH_OPERATION: {
    type: 'MATH_OPERATION',
    label: 'Math Operation',
    description: 'Perform mathematical operations',
    color: '#84cc16',
    icon: '🔢',
    category: 'logic',
    inputs: 1,
    outputs: 1
  },
  END: {
    type: 'END',
    label: 'End',
    description: 'End of command execution',
    color: '#ef4444',
    icon: '⏹️',
    category: 'basic',
    inputs: 1,
    outputs: 0
  }
}

// Helper to create a new node
export function createNode(type: NodeType, position: { x: number; y: number }, data?: Partial<GraphNode['data']>): GraphNode {
  const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const baseNode = {
    id,
    type,
    position,
    data: data || {}
  }

  // Set default data based on type
  switch (type) {
    case 'START':
      return { ...baseNode, type, data: { label: 'Start', ...data } } as StartNode
    case 'SEND_MESSAGE':
      return { ...baseNode, type, data: { content: '', ephemeral: false, ...data } } as SendMessageNode
    case 'SEND_EMBED':
      return { ...baseNode, type, data: { title: '', description: '', ...data } } as SendEmbedNode
    case 'IF_CONDITION':
      return { ...baseNode, type, data: { variable: '', operator: 'equals', value: '', ...data } } as IfConditionNode
    case 'SET_VARIABLE':
      return { ...baseNode, type, data: { variableName: '', value: '', scope: 'local', type: 'string', ...data } } as SetVariableNode
    case 'END':
      return { ...baseNode, type, data: { label: 'End', ...data } } as EndNode
    default:
      return baseNode as GraphNode
  }
}

// Helper to create an edge
export function createEdge(source: string, target: string, sourceHandle?: string): GraphEdge {
  return {
    id: `edge_${source}_${target}_${sourceHandle || 'default'}`,
    source,
    target,
    sourceHandle,
    label: sourceHandle
  }
}

// Validate graph structure
export function validateGraph(graph: CommandGraphJson): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for start node
  const startNodes = graph.nodes.filter(n => n.type === 'START')
  if (startNodes.length === 0) {
    errors.push('Graph must have a START node')
  } else if (startNodes.length > 1) {
    errors.push('Graph can only have one START node')
  }

  // Check for orphaned nodes (except START)
  const connectedNodeIds = new Set<string>()
  graph.edges.forEach(edge => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })

  graph.nodes.forEach(node => {
    if (node.type !== 'START' && !connectedNodeIds.has(node.id)) {
      errors.push(`Node ${node.id} (${node.type}) is not connected`)
    }
  })

  // Check for circular references (simple check)
  // This is a basic check - more sophisticated cycle detection could be added
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]))
  const edgeMap = new Map<string, string[]>()
  
  graph.edges.forEach(edge => {
    if (!edgeMap.has(edge.source)) {
      edgeMap.set(edge.source, [])
    }
    edgeMap.get(edge.source)!.push(edge.target)
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

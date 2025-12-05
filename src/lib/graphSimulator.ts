// Graph Simulator - Execute graphs locally for testing
import { CommandGraphJson, GraphNode as GraphNodeType } from '@/types/graph'

export interface SimulationContext {
  variables: Map<string, any>
  user: MockUser
  guild: MockGuild
  channel: MockChannel
  outputs: SimulationOutput[]
  currentNodeId: string | null
}

export interface MockUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
}

export interface MockGuild {
  id: string
  name: string
}

export interface MockChannel {
  id: string
  name: string
  type: 'text' | 'voice'
}

export interface SimulationOutput {
  id: string
  timestamp: Date
  type: 'message' | 'embed' | 'error' | 'variable' | 'log' | 'delay'
  nodeId: string
  nodeName: string
  content: any
}

export interface SimulationStep {
  nodeId: string
  nodeName: string
  action: string
  status: 'success' | 'error' | 'skipped'
  output?: any
  error?: string
}

export class GraphSimulator {
  private graph: CommandGraphJson
  private context: SimulationContext
  private steps: SimulationStep[] = []
  private executionPath: string[] = []

  constructor(graph: CommandGraphJson, initialContext?: Partial<SimulationContext>) {
    this.graph = graph
    this.context = {
      variables: new Map(),
      user: initialContext?.user || this.createMockUser(),
      guild: initialContext?.guild || this.createMockGuild(),
      channel: initialContext?.channel || this.createMockChannel(),
      outputs: [],
      currentNodeId: null
    }
  }

  private createMockUser(): MockUser {
    return {
      id: '123456789012345678',
      username: 'TestUser',
      discriminator: '0001',
      avatar: null
    }
  }

  private createMockGuild(): MockGuild {
    return {
      id: '987654321098765432',
      name: 'Test Server'
    }
  }

  private createMockChannel(): MockChannel {
    return {
      id: '111222333444555666',
      name: 'general',
      type: 'text'
    }
  }

  async simulate(): Promise<{ steps: SimulationStep[], outputs: SimulationOutput[], context: SimulationContext }> {
    // Find START node
    const startNode = this.graph.nodes.find(n => n.type === 'START')
    if (!startNode) {
      throw new Error('No START node found in graph')
    }

    // Begin execution
    await this.executeNode(startNode.id)

    return {
      steps: this.steps,
      outputs: this.context.outputs,
      context: this.context
    }
  }

  private async executeNode(nodeId: string): Promise<void> {
    const node = this.graph.nodes.find(n => n.id === nodeId)
    if (!node) {
      this.addStep(nodeId, 'Unknown', 'Node not found', 'error', undefined, 'Node not found')
      return
    }

    this.context.currentNodeId = nodeId
    this.executionPath.push(nodeId)

    this.addStep(nodeId, node.type, `Executing ${node.type}`, 'success')

    try {
      switch (node.type) {
        case 'START':
          await this.handleStart(node)
          break
        case 'SEND_MESSAGE':
          await this.handleSendMessage(node)
          break
        case 'SEND_EMBED':
          await this.handleSendEmbed(node)
          break
        case 'IF_CONDITION':
          await this.handleIfCondition(node)
          return // Conditional handles its own flow
        case 'SET_VARIABLE':
          await this.handleSetVariable(node)
          break
        case 'GET_VARIABLE':
          await this.handleGetVariable(node)
          break
        case 'DELAY':
          await this.handleDelay(node)
          break
        case 'RANDOM':
          await this.handleRandom(node)
          break
        case 'MATH_OPERATION':
          await this.handleMathOperation(node)
          break
        case 'END':
          await this.handleEnd(node)
          return // Stop execution
        default:
          this.addOutput('log', nodeId, node.type, `Unsupported node type: ${node.type}`)
      }

      // Find next node(s) and execute
      const nextEdges = this.graph.edges.filter(e => e.source === nodeId)
      if (nextEdges.length > 0) {
        // Execute first connected node
        await this.executeNode(nextEdges[0].target)
      }
    } catch (error: any) {
      this.addStep(nodeId, node.type, 'Error during execution', 'error', undefined, error.message)
      this.addOutput('error', nodeId, node.type, error.message)
    }
  }

  private async handleStart(node: GraphNodeType): Promise<void> {
    this.addOutput('log', node.id, 'START', 'Command execution started')
  }

  private async handleSendMessage(node: GraphNodeType): Promise<void> {
    const data = node.data as any
    const content = this.replaceVariables(data.content || 'Hello!')
    this.addOutput('message', node.id, 'SEND_MESSAGE', content)
  }

  private async handleSendEmbed(node: GraphNodeType): Promise<void> {
    const data = node.data as any
    const embed = {
      title: this.replaceVariables(data.title || ''),
      description: this.replaceVariables(data.description || ''),
      color: data.color || '#5865F2',
      fields: data.fields || []
    }
    this.addOutput('embed', node.id, 'SEND_EMBED', embed)
  }

  private async handleIfCondition(node: GraphNodeType): Promise<void> {
    const data = node.data as any
    const leftValue = this.replaceVariables(data.leftValue || '')
    const rightValue = this.replaceVariables(data.rightValue || '')
    const operator = data.operator || 'equals'

    let result = false
    switch (operator) {
      case 'equals':
        result = leftValue === rightValue
        break
      case 'not_equals':
        result = leftValue !== rightValue
        break
      case 'greater_than':
        result = Number(leftValue) > Number(rightValue)
        break
      case 'less_than':
        result = Number(leftValue) < Number(rightValue)
        break
      case 'contains':
        result = String(leftValue).includes(String(rightValue))
        break
      case 'starts_with':
        result = String(leftValue).startsWith(String(rightValue))
        break
      case 'ends_with':
        result = String(leftValue).endsWith(String(rightValue))
        break
    }

    this.addOutput('log', node.id, 'IF_CONDITION', `Condition: ${leftValue} ${operator} ${rightValue} = ${result}`)

    // Find the appropriate edge (true/false)
    const edges = this.graph.edges.filter(e => e.source === node.id)
    const nextEdge = edges.find(e => e.label === (result ? 'true' : 'false'))

    if (nextEdge) {
      await this.executeNode(nextEdge.target)
    }
  }

  private async handleSetVariable(node: GraphNodeType): Promise<void> {
    const data = node.data as any
    const varName = data.variableName || 'variable'
    const value = this.replaceVariables(data.value || '')
    
    this.context.variables.set(varName, value)
    this.addOutput('variable', node.id, 'SET_VARIABLE', `Set ${varName} = ${value}`)
  }

  private async handleGetVariable(node: GraphNodeType): Promise<void> {
    const data = node.data as any
    const varName = data.variableName || 'variable'
    const value = this.context.variables.get(varName)
    
    this.addOutput('variable', node.id, 'GET_VARIABLE', `Get ${varName} = ${value}`)
  }

  private async handleDelay(node: GraphNodeType): Promise<void> {
    const data = node.data as any
    const duration = data.duration || 1000
    this.addOutput('delay', node.id, 'DELAY', `Waiting ${duration}ms`)
    
    // Simulate delay (but don't actually wait in simulation)
    await new Promise(resolve => setTimeout(resolve, Math.min(duration, 100)))
  }

  private async handleRandom(node: GraphNodeType): Promise<void> {
    const data = node.data as any
    const min = Number(data.min || 0)
    const max = Number(data.max || 100)
    const result = Math.floor(Math.random() * (max - min + 1)) + min
    
    const outputVar = data.outputVariable || 'random'
    this.context.variables.set(outputVar, result)
    
    this.addOutput('variable', node.id, 'RANDOM', `Generated random number: ${result} (${min}-${max})`)
  }

  private async handleMathOperation(node: GraphNodeType): Promise<void> {
    const data = node.data as any
    const left = Number(this.replaceVariables(data.leftOperand || '0'))
    const right = Number(this.replaceVariables(data.rightOperand || '0'))
    const operation = data.operation || 'add'
    
    let result = 0
    switch (operation) {
      case 'add':
        result = left + right
        break
      case 'subtract':
        result = left - right
        break
      case 'multiply':
        result = left * right
        break
      case 'divide':
        result = right !== 0 ? left / right : 0
        break
      case 'modulo':
        result = right !== 0 ? left % right : 0
        break
    }
    
    const outputVar = data.outputVariable || 'result'
    this.context.variables.set(outputVar, result)
    
    this.addOutput('variable', node.id, 'MATH_OPERATION', `${left} ${operation} ${right} = ${result}`)
  }

  private async handleEnd(node: GraphNodeType): Promise<void> {
    this.addOutput('log', node.id, 'END', 'Command execution completed')
  }

  private replaceVariables(text: string): string {
    let result = text

    // Replace variables {varName}
    result = result.replace(/\{(\w+)\}/g, (match, varName) => {
      const value = this.context.variables.get(varName)
      return value !== undefined ? String(value) : match
    })

    // Replace user placeholders
    result = result.replace(/\{user\.username\}/g, this.context.user.username)
    result = result.replace(/\{user\.id\}/g, this.context.user.id)
    result = result.replace(/\{user\.mention\}/g, `<@${this.context.user.id}>`)

    // Replace guild placeholders
    result = result.replace(/\{guild\.name\}/g, this.context.guild.name)
    result = result.replace(/\{guild\.id\}/g, this.context.guild.id)

    // Replace channel placeholders
    result = result.replace(/\{channel\.name\}/g, this.context.channel.name)
    result = result.replace(/\{channel\.id\}/g, this.context.channel.id)

    return result
  }

  private addOutput(type: SimulationOutput['type'], nodeId: string, nodeName: string, content: any): void {
    this.context.outputs.push({
      id: `output-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      nodeId,
      nodeName,
      content
    })
  }

  private addStep(nodeId: string, nodeName: string, action: string, status: SimulationStep['status'], output?: any, error?: string): void {
    this.steps.push({
      nodeId,
      nodeName,
      action,
      status,
      output,
      error
    })
  }

  getExecutionPath(): string[] {
    return this.executionPath
  }

  getVariables(): Map<string, any> {
    return this.context.variables
  }
}

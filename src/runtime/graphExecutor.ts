// Graph Runtime Executor
// This module interprets and executes the graph-based command flows

import { CommandGraphJson, GraphNode, GraphEdge } from '@/types/graph'
import { Client, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'

interface ExecutionContext {
  interaction: ChatInputCommandInteraction
  client: Client
  variables: Map<string, any>
  hasReplied: boolean
}

interface ExecutionResult {
  success: boolean
  error?: string
  nextNodeId?: string
}

export class GraphExecutor {
  private graph: CommandGraphJson
  private context: ExecutionContext

  constructor(graph: CommandGraphJson, interaction: ChatInputCommandInteraction, client: Client) {
    this.graph = graph
    this.context = {
      interaction,
      client,
      variables: new Map(),
      hasReplied: false
    }
  }

  async execute(): Promise<void> {
    // Find START node
    const startNode = this.graph.nodes.find(n => n.type === 'START')
    if (!startNode) {
      throw new Error('No START node found in graph')
    }

    // Begin execution from START node
    await this.executeNode(startNode.id)
  }

  private async executeNode(nodeId: string): Promise<void> {
    const node = this.graph.nodes.find(n => n.id === nodeId)
    if (!node) {
      console.error(`Node ${nodeId} not found`)
      return
    }

    console.log(`Executing node: ${node.type} (${nodeId})`)

    try {
      let result: ExecutionResult

      switch (node.type) {
        case 'START':
          result = await this.executeStart(node)
          break
        case 'SEND_MESSAGE':
          result = await this.executeSendMessage(node)
          break
        case 'SEND_EMBED':
          result = await this.executeSendEmbed(node)
          break
        case 'IF_CONDITION':
          result = await this.executeIfCondition(node)
          break
        case 'SET_VARIABLE':
          result = await this.executeSetVariable(node)
          break
        case 'GET_VARIABLE':
          result = await this.executeGetVariable(node)
          break
        case 'DELAY':
          result = await this.executeDelay(node)
          break
        case 'END':
          result = { success: true }
          return
        default:
          console.warn(`Unsupported node type: ${node.type}`)
          result = { success: true }
      }

      if (result.success && result.nextNodeId) {
        await this.executeNode(result.nextNodeId)
      } else if (result.success) {
        // Find next node through edges
        const nextEdge = this.graph.edges.find(e => e.source === nodeId)
        if (nextEdge) {
          await this.executeNode(nextEdge.target)
        }
      }
    } catch (error) {
      console.error(`Error executing node ${nodeId}:`, error)
      throw error
    }
  }

  private async executeStart(node: GraphNode): Promise<ExecutionResult> {
    // START node just passes through
    return { success: true }
  }

  private async executeSendMessage(node: GraphNode): Promise<ExecutionResult> {
    const data = node.data as any
    const content = this.resolveVariables(data.content || 'No message')

    console.log('[GraphExecutor] Send Message - hasReplied:', this.context.hasReplied, 'interaction.replied:', this.context.interaction.replied, 'interaction.deferred:', this.context.interaction.deferred)

    if (this.context.hasReplied) {
      // Use followUp for subsequent messages
      await this.context.interaction.followUp({
        content,
        ephemeral: data.ephemeral || false
      })
    } else {
      // First message - use reply
      await this.context.interaction.reply({
        content,
        ephemeral: data.ephemeral || false
      })
      this.context.hasReplied = true
    }

    return { success: true }
  }

  private async executeSendEmbed(node: GraphNode): Promise<ExecutionResult> {
    const data = node.data as any

    const embed = new EmbedBuilder()
    
    if (data.title) embed.setTitle(this.resolveVariables(data.title))
    if (data.description) embed.setDescription(this.resolveVariables(data.description))
    if (data.color) embed.setColor(data.color as any)
    if (data.footer) embed.setFooter({ text: this.resolveVariables(data.footer) })
    if (data.thumbnail) embed.setThumbnail(data.thumbnail)
    if (data.image) embed.setImage(data.image)
    
    if (data.fields && Array.isArray(data.fields)) {
      data.fields.forEach((field: any) => {
        embed.addFields({
          name: this.resolveVariables(field.name),
          value: this.resolveVariables(field.value),
          inline: field.inline || false
        })
      })
    }

    console.log('[GraphExecutor] Send Embed - hasReplied:', this.context.hasReplied)

    if (this.context.hasReplied) {
      await this.context.interaction.followUp({
        embeds: [embed],
        ephemeral: data.ephemeral || false
      })
    } else {
      await this.context.interaction.reply({
        embeds: [embed],
        ephemeral: data.ephemeral || false
      })
      this.context.hasReplied = true
    }

    return { success: true }
  }

  private async executeIfCondition(node: GraphNode): Promise<ExecutionResult> {
    const data = node.data as any
    const variableValue = this.context.variables.get(data.variable)
    const compareValue = data.value

    let condition = false

    switch (data.operator) {
      case 'equals':
        condition = variableValue === compareValue
        break
      case 'not_equals':
        condition = variableValue !== compareValue
        break
      case 'greater_than':
        condition = Number(variableValue) > Number(compareValue)
        break
      case 'less_than':
        condition = Number(variableValue) < Number(compareValue)
        break
      case 'contains':
        condition = String(variableValue).includes(String(compareValue))
        break
      case 'starts_with':
        condition = String(variableValue).startsWith(String(compareValue))
        break
      case 'ends_with':
        condition = String(variableValue).endsWith(String(compareValue))
        break
      case 'is_empty':
        condition = !variableValue || variableValue === ''
        break
      case 'is_not_empty':
        condition = !!variableValue && variableValue !== ''
        break
    }

    // Find the appropriate edge based on condition
    const edge = this.graph.edges.find(e => 
      e.source === node.id && e.sourceHandle === (condition ? 'true' : 'false')
    )

    if (edge) {
      return { success: true, nextNodeId: edge.target }
    }

    return { success: true }
  }

  private async executeSetVariable(node: GraphNode): Promise<ExecutionResult> {
    const data = node.data as any
    this.context.variables.set(data.variableName, data.value)
    console.log(`Set variable: ${data.variableName} = ${data.value}`)
    return { success: true }
  }

  private async executeGetVariable(node: GraphNode): Promise<ExecutionResult> {
    const data = node.data as any
    const value = this.context.variables.get(data.variableName) || data.defaultValue
    console.log(`Get variable: ${data.variableName} = ${value}`)
    return { success: true }
  }

  private async executeDelay(node: GraphNode): Promise<ExecutionResult> {
    const data = node.data as any
    const duration = data.duration || 1000
    
    await new Promise(resolve => setTimeout(resolve, duration))
    
    return { success: true }
  }

  private resolveVariables(text: string): string {
    // Replace {{variableName}} with actual values
    return text.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      const value = this.context.variables.get(variableName)
      return value !== undefined ? String(value) : match
    })
  }
}

// Example usage:
// const executor = new GraphExecutor(commandGraph, interaction, client)
// await executor.execute()

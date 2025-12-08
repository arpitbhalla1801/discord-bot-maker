// Shared Bot Service - Single bot instance serving all guilds
import { Client, GatewayIntentBits, Events, REST, Routes, ChatInputCommandInteraction } from 'discord.js'
import { GraphExecutor } from '@/runtime/graphExecutor'
import db from '@/lib/db'

export interface CommandExecutionContext {
  guildId: string
  userId: string
  channelId: string
  commandName: string
  options: Record<string, any>
}

export class SharedBotService {
  private static instance: SharedBotService
  private client: Client
  private rest: REST
  private isReady = false
  private guildCommandMap: Map<string, Map<string, string>> = new Map() // guildId -> commandName -> projectId

  private constructor() {
    const botToken = process.env.DISCORD_BOT_TOKEN
    if (!botToken) {
      throw new Error('DISCORD_BOT_TOKEN environment variable is required')
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
      ]
    })

    this.rest = new REST({ version: '10' }).setToken(botToken)
    this.setupEventHandlers()
  }

  static getInstance(): SharedBotService {
    if (!SharedBotService.instance) {
      SharedBotService.instance = new SharedBotService()
      // Auto-start the bot if not already started
      if (!SharedBotService.instance.isReady) {
        SharedBotService.instance.start().catch(err => {
          console.error('[Bot] Failed to auto-start:', err)
        })
      }
    }
    return SharedBotService.instance
  }

  private setupEventHandlers() {
    this.client.on(Events.ClientReady, () => {
      console.log(`[Bot] Logged in as ${this.client.user?.tag}`)
      this.isReady = true
    })

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return
      await this.handleCommand(interaction)
    })

    this.client.on(Events.GuildCreate, async (guild) => {
      console.log(`[Bot] Joined guild: ${guild.name} (${guild.id})`)
      // Auto-deploy if there's a pending deployment
      await this.syncGuildCommands(guild.id)
    })

    this.client.on(Events.GuildDelete, async (guild) => {
      console.log(`[Bot] Left guild: ${guild.name} (${guild.id})`)
      // Clean up guild data
      await this.cleanupGuild(guild.id)
    })

    this.client.on(Events.Error, (error) => {
      console.error('[Bot] Client error:', error)
    })

    this.client.on(Events.ShardError, (error) => {
      console.error('[Bot] WebSocket error:', error)
    })
  }

  async start() {
    const botToken = process.env.DISCORD_BOT_TOKEN
    if (!botToken) {
      throw new Error('DISCORD_BOT_TOKEN is not configured')
    }

    try {
      await this.client.login(botToken)
      console.log('[Bot] Service started successfully')
    } catch (error: any) {
      console.error('[Bot] Failed to start:', error.message)
      throw error
    }
  }

  async stop() {
    console.log('[Bot] Shutting down...')
    this.client.destroy()
  }

  /**
   * Deploy a project's commands to a specific guild
   */
  async deployToGuild(projectId: string, guildId: string): Promise<number> {
    console.log(`[Bot] Deploying project ${projectId} to guild ${guildId}`)

    // Fetch all enabled commands for the project
    const commands = await db.command.findMany({
      where: {
        projectId,
        isEnabled: true,
        type: 'SLASH'
      }
    })

    if (commands.length === 0) {
      throw new Error('No enabled commands found in project')
    }

    // Transform to Discord API format
    const discordCommands = commands.map(cmd => {
      const options = (cmd as any).options || []
      return {
        name: cmd.name,
        description: cmd.description || 'No description',
        options: Array.isArray(options) ? options.map((opt: any) => ({
          name: opt.name,
          description: opt.description || 'No description',
          type: this.mapOptionType(opt.type),
          required: opt.required || false
        })) : []
      }
    })

    // Register commands to guild
    const botId = process.env.DISCORD_BOT_ID
    if (!botId) {
      throw new Error('DISCORD_BOT_ID is not configured')
    }

    try {
      await this.rest.put(
        Routes.applicationGuildCommands(botId, guildId),
        { body: discordCommands }
      )

      // Update local command map
      const guildMap = this.guildCommandMap.get(guildId) || new Map()
      for (const cmd of commands) {
        guildMap.set(cmd.name, projectId)
      }
      this.guildCommandMap.set(guildId, guildMap)

      console.log(`[Bot] Deployed ${commands.length} commands to guild ${guildId}`)
      return commands.length
    } catch (error: any) {
      console.error('[Bot] Failed to deploy commands:', error)
      throw new Error(`Failed to register commands: ${error.message}`)
    }
  }

  /**
   * Undeploy a project from a guild
   */
  async undeployFromGuild(projectId: string, guildId: string): Promise<void> {
    console.log(`[Bot] Undeploying project ${projectId} from guild ${guildId}`)

    // Get all active deployments for this guild
    const remainingDeployments = await (db as any).guildDeployment.findMany({
      where: {
        guildId,
        isActive: true,
        projectId: { not: projectId }
      },
      include: {
        project: {
          include: {
            commands: {
              where: {
                isEnabled: true,
                type: 'SLASH'
              }
            }
          }
        }
      }
    });

    // Re-register only remaining projects' commands
    const remainingCommands = remainingDeployments.flatMap((d: any) =>
      d.project.commands.map((cmd: any) => ({
        name: cmd.name,
        description: cmd.description || 'No description',
        options: Array.isArray((cmd as any).options) ? (cmd as any).options.map((opt: any) => ({
          name: opt.name,
          description: opt.description || 'No description',
          type: this.mapOptionType(opt.type),
          required: opt.required || false
        })) : []
      }))
    );

    const botId = process.env.DISCORD_BOT_ID
    if (!botId) {
      throw new Error('DISCORD_BOT_ID is not configured')
    }

    try {
      await this.rest.put(
        Routes.applicationGuildCommands(botId, guildId),
        { body: remainingCommands }
      )

      // Update local map
      const guildMap = new Map<string, string>()
      for (const deployment of remainingDeployments) {
        for (const cmd of deployment.project.commands) {
          guildMap.set(cmd.name, deployment.projectId)
        }
      }
      this.guildCommandMap.set(guildId, guildMap)

      console.log(`[Bot] Undeployed project ${projectId} from guild ${guildId}`)
    } catch (error: any) {
      console.error('[Bot] Failed to undeploy:', error)
      throw new Error(`Failed to unregister commands: ${error.message}`)
    }
  }

  /**
   * Handle incoming command interactions
   */
  private async handleCommand(interaction: ChatInputCommandInteraction) {
    const { guildId, commandName, user, channelId } = interaction

    if (!guildId) {
      await interaction.reply({ content: 'This bot only works in servers, not DMs.', ephemeral: true })
      return
    }

    console.log(`[Bot] Command received: /${commandName} in guild ${guildId} by ${user.tag}`)

    try {
      // Find which project owns this command in this guild
      const guildMap = this.guildCommandMap.get(guildId)
      let projectId = guildMap?.get(commandName)

      // If not in cache, query database
      if (!projectId) {
        const deployment = await (db as any).guildDeployment.findFirst({
          where: {
            guildId,
            isActive: true,
            project: {
              commands: {
                some: {
                  name: commandName,
                  isEnabled: true
                }
              }
            }
          },
          select: {
            projectId: true
          }
        })

        if (!deployment) {
          await interaction.reply({ content: 'This command is not deployed to this server.', ephemeral: true })
          return
        }

        projectId = deployment.projectId
      }

      // Fetch command and graph
      const command = await db.command.findFirst({
        where: {
          projectId,
          name: commandName,
          isEnabled: true
        },
        include: {
          commandGraphs: {
            where: { isActive: true },
            orderBy: { version: 'desc' },
            take: 1
          }
        }
      })

      if (!command || command.commandGraphs.length === 0) {
        await interaction.reply({ content: 'Command configuration not found.', ephemeral: true })
        return
      }

      // Check cooldowns
      const permissions = (command as any).permissions
      if (permissions?.cooldownSeconds) {
        const cooldownKey = `${user.id}:${command.id}`
        // TODO: Implement cooldown tracking with Redis or in-memory cache
      }

      // Execute graph
      const graph = command.commandGraphs[0]

      // Execute in sandbox (will handle graph execution internally)
      await this.executeSandboxed(graph.graphJson, interaction)

      // Log execution
      console.log(`[Bot] Command /${commandName} executed successfully for ${user.tag}`)

    } catch (error: any) {
      console.error('[Bot] Command execution error:', error)
      
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ An error occurred while executing this command.',
            ephemeral: true
          })
        } else {
          await interaction.followUp({
            content: '❌ An error occurred while executing this command.',
            ephemeral: true
          })
        }
      } catch (e) {
        console.error('[Bot] Failed to send error reply:', e)
      }
    }
  }

  /**
   * Execute graph in a sandboxed environment
   * TODO: Implement proper sandboxing (VM2, Worker Threads, or Docker)
   */
  private async executeSandboxed(graphJson: any, interaction: ChatInputCommandInteraction): Promise<any> {
    // For now, use the existing executor
    // In production, this MUST be sandboxed
    const executor = new GraphExecutor(graphJson, interaction, this.client)
    
    try {
      await Promise.race([
        executor.execute(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Execution timeout')), 5000)
        )
      ])
      
      return { success: true }
    } catch (error) {
      console.error('[Sandbox] Execution error:', error)
      throw error
    }
  }

  /**
   * Sync all commands for a guild (called when bot joins)
   */
  private async syncGuildCommands(guildId: string) {
    const deployments = await (db as any).guildDeployment.findMany({
      where: {
        guildId,
        isActive: true
      }
    })

    for (const deployment of deployments) {
      try {
        await this.deployToGuild(deployment.projectId, guildId)
      } catch (error) {
        console.error(`[Bot] Failed to sync deployment ${deployment.id}:`, error)
      }
    }
  }

  /**
   * Clean up guild data when bot leaves
   */
  private async cleanupGuild(guildId: string) {
    try {
      await (db as any).guildDeployment.updateMany({
        where: { guildId },
        data: { isActive: false }
      })
      this.guildCommandMap.delete(guildId)
      console.log(`[Bot] Cleaned up data for guild ${guildId}`)
    } catch (error) {
      console.error('[Bot] Failed to cleanup guild:', error)
    }
  }

  /**
   * Map option types to Discord API types
   */
  private mapOptionType(type: string): number {
    const typeMap: Record<string, number> = {
      STRING: 3,
      INTEGER: 4,
      BOOLEAN: 5,
      USER: 6,
      CHANNEL: 7,
      ROLE: 8,
      MENTIONABLE: 9,
      NUMBER: 10
    }
    return typeMap[type] || 3 // Default to STRING
  }

  getClient(): Client {
    return this.client
  }

  isClientReady(): boolean {
    return this.isReady
  }
}

// Singleton export
export const sharedBot = SharedBotService.getInstance()

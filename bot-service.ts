#!/usr/bin/env bun
// Bot Service Runner - Starts the shared Discord bot
import { sharedBot } from './src/services/SharedBotService'

async function main() {
  console.log('[Bot Service] Starting...')

  // Validate required environment variables
  const requiredEnvVars = [
    'DISCORD_BOT_TOKEN',
    'DISCORD_BOT_ID',
    'DATABASE_URL'
  ]

  const missing = requiredEnvVars.filter(v => !process.env[v])
  if (missing.length > 0) {
    console.error(`[Bot Service] Missing required environment variables: ${missing.join(', ')}`)
    process.exit(1)
  }

  try {
    // Start the shared bot
    await sharedBot.start()
    
    console.log('[Bot Service] ✓ Bot is running')
    console.log('[Bot Service] Ready to handle commands')

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n[Bot Service] Shutting down gracefully...')
      await sharedBot.stop()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      console.log('\n[Bot Service] Shutting down gracefully...')
      await sharedBot.stop()
      process.exit(0)
    })

  } catch (error) {
    console.error('[Bot Service] Fatal error:', error)
    process.exit(1)
  }
}

main()

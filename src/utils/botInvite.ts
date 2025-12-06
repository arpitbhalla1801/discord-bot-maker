// Generate bot invite link with proper permissions
export function generateBotInviteUrl(guildId?: string): string {
  const botId = process.env.NEXT_PUBLIC_DISCORD_BOT_ID || process.env.DISCORD_BOT_ID
  
  if (!botId) {
    throw new Error('Discord bot ID is not configured')
  }

  // Calculate required permissions
  const permissions = [
    2048,         // Send Messages
    2147483648,   // Use Slash Commands  
    16384,        // Embed Links
    32768,        // Attach Files
    65536,        // Read Message History
    64,           // Add Reactions
    274877906944  // Use External Emojis
  ]

  const permissionInteger = permissions.reduce((acc, perm) => acc | perm, 0)

  const baseUrl = 'https://discord.com/oauth2/authorize'
  const params = new URLSearchParams({
    client_id: botId,
    permissions: permissionInteger.toString(),
    scope: 'bot applications.commands'
  })

  // If guild ID is provided, pre-select the guild
  if (guildId) {
    params.append('guild_id', guildId)
    params.append('disable_guild_select', 'true')
  }

  return `${baseUrl}?${params.toString()}`
}

// Permission constants for reference
export const BOT_PERMISSIONS = {
  SEND_MESSAGES: 2048,
  USE_SLASH_COMMANDS: 2147483648,
  EMBED_LINKS: 16384,
  ATTACH_FILES: 32768,
  READ_MESSAGE_HISTORY: 65536,
  ADD_REACTIONS: 64,
  USE_EXTERNAL_EMOJIS: 274877906944
} as const

export function getPermissionLabel(permission: number): string {
  const labels: Record<number, string> = {
    2048: 'Send Messages',
    2147483648: 'Use Slash Commands',
    16384: 'Embed Links',
    32768: 'Attach Files',
    65536: 'Read Message History',
    64: 'Add Reactions',
    274877906944: 'Use External Emojis'
  }
  
  return labels[permission] || 'Unknown Permission'
}

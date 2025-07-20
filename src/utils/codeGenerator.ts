import type { BotData, Command, Event } from '@/store/builderStore'

export type GeneratedFile = {
  name: string
  content: string
  path: string
}

// Template for main index.js file
const generateIndexJs = (botData: BotData): string => {
  return `const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ] 
});

// Commands collection
client.commands = new Collection();

// Load command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(\`[INFO] Loaded command: \${command.data.name}\`);
  } else {
    console.log(\`[WARNING] The command at \${filePath} is missing a required "data" or "execute" property.\`);
  }
}

// Load event files
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(\`[INFO] Loaded event: \${event.name}\`);
  }
}

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(\`No command matching \${interaction.commandName} was found.\`);
    return;
  }
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(\`Error executing \${interaction.commandName}:\`, error);
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ 
        content: 'There was an error while executing this command!', 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: 'There was an error while executing this command!', 
        ephemeral: true 
      });
    }
  }
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log(\`Ready! Logged in as \${client.user.tag}\`);
});

// Login to Discord with your client's token
const { token } = require('./config.json');
client.login(token);
`
}

// Template for command files
const generateCommandFile = (command: Command): string => {
  const optionsCode = command.options && command.options.length > 0 
    ? command.options.map(option => {
        const methodName = option.type === 'STRING' ? 'addStringOption' 
                         : option.type === 'INTEGER' ? 'addIntegerOption'
                         : option.type === 'BOOLEAN' ? 'addBooleanOption'
                         : option.type === 'USER' ? 'addUserOption'
                         : option.type === 'CHANNEL' ? 'addChannelOption'
                         : option.type === 'ROLE' ? 'addRoleOption'
                         : option.type === 'MENTIONABLE' ? 'addMentionableOption'
                         : option.type === 'NUMBER' ? 'addNumberOption'
                         : 'addStringOption';
        
        return `.${methodName}(option =>
      option.setName('${option.name}')
        .setDescription('${option.description}')
        .setRequired(${option.required})
    )`;
      }).join('\n    ')
    : '';

  return `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('${command.name}')
    .setDescription('${command.description}')${optionsCode ? '\n    ' + optionsCode : ''},
  
  async execute(interaction) {
    await interaction.reply('${command.response || 'Hello from ' + command.name + '!'}');
  },
};
`;
}

// Template for event files
const generateEventFile = (event: Event): string => {
  return `module.exports = {
  name: '${event.type}',
  once: ${event.type === 'ready'},
  execute(${event.type === 'ready' ? 'client' : '...args'}) {
    ${event.action || `console.log('${event.type} event triggered');`}
  },
};
`;
}

// Template for package.json
const generatePackageJson = (botData: BotData): string => {
  return JSON.stringify({
    name: botData.metadata.name.toLowerCase().replace(/\s+/g, '-') || 'discord-bot',
    version: "1.0.0",
    description: botData.metadata.description || 'A Discord bot created with Discord Bot Maker',
    main: "index.js",
    scripts: {
      start: "node index.js",
      deploy: "node deploy-commands.js"
    },
    dependencies: {
      "discord.js": "^14.14.1"
    },
    author: botData.metadata.author || 'Discord Bot Maker User',
    license: 'MIT'
  }, null, 2);
}

// Template for config.json
const generateConfigFile = (botData: BotData): string => {
  return JSON.stringify({
    token: "YOUR_BOT_TOKEN_HERE",
    clientId: "YOUR_CLIENT_ID_HERE",
    guildId: "YOUR_GUILD_ID_HERE"
  }, null, 2);
}

// Template for deploy-commands.js
const generateDeployCommands = (botData: BotData): string => {
  return `const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const { clientId, guildId, token } = require('./config.json');

const commands = [];

// Grab all command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(\`[WARNING] The command at \${filePath} is missing a required "data" or "execute" property.\`);
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy the commands
(async () => {
  try {
    console.log(\`Started refreshing \${commands.length} application (/) commands.\`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log(\`Successfully reloaded \${data.length} application (/) commands.\`);
  } catch (error) {
    console.error(error);
  }
})();
`;
}

// Template for README.md
const generateReadme = (botData: BotData): string => {
  return `# ${botData.metadata.name || 'Discord Bot'}

A Discord bot created with Discord Bot Maker.

## Setup Instructions

1. **Install Node.js** - Download and install Node.js (v16.9.0 or newer) from [nodejs.org](https://nodejs.org/)

2. **Install Dependencies** - Open a terminal in this folder and run:
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Bot** - Edit \`config.json\` and add your bot credentials:
   - \`token\`: Your bot's token from Discord Developer Portal
   - \`clientId\`: Your bot's application ID
   - \`guildId\`: Your Discord server ID (for guild commands)

4. **Deploy Commands** - Run this once to register slash commands:
   \`\`\`bash
   npm run deploy
   \`\`\`

5. **Start Bot** - Run the bot:
   \`\`\`bash
   npm start
   \`\`\`

## Commands

${botData.commands.map(cmd => `- \`/${cmd.name}\` - ${cmd.description}`).join('\n')}

## Events

${botData.events.map(evt => `- **${evt.type}** - ${evt.description || 'Custom event handler'}`).join('\n')}

## Getting Your Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "Bot" section
4. Copy the bot token
5. Add the bot to your server with appropriate permissions

## Need Help?

- [Discord.js Guide](https://discordjs.guide/)
- [Discord.js Documentation](https://discord.js.org/#/docs)
- [Discord Developer Portal](https://discord.com/developers/docs)

---

*This bot was created using Discord Bot Maker*
`;
}

// Template for .env.example
const generateEnvExample = (): string => {
  return `# Copy this file to .env and fill in your bot's credentials
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
`;
}

// Main generation function
export const generateBotCode = (botData: BotData): GeneratedFile[] => {
  const files: GeneratedFile[] = []
  
  // Main index.js
  files.push({
    name: 'index.js',
    content: generateIndexJs(botData),
    path: 'index.js'
  })
  
  // Commands
  botData.commands.forEach(command => {
    files.push({
      name: `${command.name}.js`,
      content: generateCommandFile(command),
      path: `commands/${command.name}.js`
    })
  })
  
  // Events  
  botData.events.forEach(event => {
    files.push({
      name: `${event.type}.js`,
      content: generateEventFile(event),
      path: `events/${event.type}.js`
    })
  })
  
  // Package files
  files.push({
    name: 'package.json',
    content: generatePackageJson(botData),
    path: 'package.json'
  })
  
  files.push({
    name: 'config.json',
    content: generateConfigFile(botData),
    path: 'config.json'
  })
  
  files.push({
    name: 'deploy-commands.js',
    content: generateDeployCommands(botData),
    path: 'deploy-commands.js'
  })
  
  files.push({
    name: 'README.md',
    content: generateReadme(botData),
    path: 'README.md'
  })
  
  files.push({
    name: '.env.example',
    content: generateEnvExample(),
    path: '.env.example'
  })
  
  return files
}

// Alternative function for compatibility
export function generateBotFiles(botData: BotData) {
  return generateBotCode(botData).map(file => ({
    name: file.path,
    content: file.content
  }));
}

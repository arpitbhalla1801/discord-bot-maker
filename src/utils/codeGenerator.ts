type BotData = {
  commands: any[];
  events: any[];
  metadata: {
    name: string;
    token: string;
    prefix: string;
  };
}

export function generateBotFiles(botData: BotData) {
  const files: { name: string; content: string }[] = [];
  
  // Generate index.js (main file)
  files.push({
    name: 'index.js',
    content: generateIndexFile(botData)
  });
  
  // Generate config file
  files.push({
    name: 'config.json',
    content: generateConfigFile(botData)
  });
  
  // Generate command files
  botData.commands.forEach(command => {
    files.push({
      name: `commands/${command.name}.js`,
      content: generateCommandFile(command)
    });
  });
  
  // Generate event handler files
  botData.events.forEach(event => {
    files.push({
      name: `events/${event.type}.js`,
      content: generateEventFile(event)
    });
  });
  
  // Generate package.json
  files.push({
    name: 'package.json',
    content: generatePackageJson(botData)
  });
  
  // Generate README
  files.push({
    name: 'README.md',
    content: generateReadme(botData)
  });
  
  return files;
}

function generateIndexFile(botData: BotData) {
  return `const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token } = require('./config.json');

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
    console.log(\`Loaded command: \${command.data.name}\`);
  } else {
    console.warn(\`Warning: The command at \${filePath} is missing required properties.\`);
  }
}

// Load event handlers
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
    
    console.log(\`Loaded event: \${event.name}\`);
  }
}

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) return;
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ 
      content: 'There was an error executing this command!', 
      ephemeral: true 
    });
  }
});

// Login to Discord
client.login(token);
`;
}

function generateConfigFile(botData: BotData) {
  return JSON.stringify({
    token: "YOUR_BOT_TOKEN_HERE",
    clientId: "YOUR_CLIENT_ID_HERE",
    name: botData.metadata.name,
    prefix: botData.metadata.prefix
  }, null, 2);
}

function generateCommandFile(command: any) {
  return `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('${command.name}')
    .setDescription('${command.description}')
    ${generateCommandOptions(command)},
    
  async execute(interaction) {
    // Your command logic here
    await interaction.reply('${command.response}');
  },
};
`;
}

function generateCommandOptions(command: any) {
  if (!command.options || command.options.length === 0) {
    return '';
  }
  
  return command.options.map((option: any) => {
    if (option.type === 'string') {
      return `.addStringOption(option => 
        option.setName('${option.name}')
        .setDescription('${option.description}')
        .setRequired(${option.required})
      )`;
    }
    
    if (option.type === 'integer') {
      return `.addIntegerOption(option => 
        option.setName('${option.name}')
        .setDescription('${option.description}')
        .setRequired(${option.required})
      )`;
    }
    
    if (option.type === 'boolean') {
      return `.addBooleanOption(option => 
        option.setName('${option.name}')
        .setDescription('${option.description}')
        .setRequired(${option.required})
      )`;
    }
    
    return '';
  }).join('\n    ');
}

function generateEventFile(event: any) {
  return `module.exports = {
  name: '${event.type}',
  once: ${event.type === 'ready'},
  execute(${event.type === 'ready' ? 'client' : '...args'}) {
    ${event.action}
  },
};
`;
}

function generatePackageJson(botData: BotData) {
  return JSON.stringify({
    name: botData.metadata.name.toLowerCase().replace(/\s+/g, '-'),
    version: "1.0.0",
    description: `A Discord bot created with Discord Bot Maker`,
    main: "index.js",
    scripts: {
      start: "node index.js"
    },
    dependencies: {
      "discord.js": "^14.14.1"
    }
  }, null, 2);
}

function generateReadme(botData: BotData) {
  return `# ${botData.metadata.name}

A Discord bot created with Discord Bot Maker.

## Setup Instructions

1. Install [Node.js](https://nodejs.org/) (version 16.9.0 or newer)
2. Clone or download this repository
3. Open a terminal in the project folder
4. Run \`npm install\` to install dependencies
5. Edit \`config.json\` and add your bot token
6. Run \`node index.js\` to start the bot

## Commands

${botData.commands.map(cmd => `- \`/${cmd.name}\`: ${cmd.description}`).join('\n')}

## Features

${botData.events.map(evt => `- ${evt.name}: ${evt.description}`).join('\n')}

## Need Help?

This bot was created using Discord Bot Maker. If you need assistance, check the Discord.js documentation at https://discord.js.org/
`;
}

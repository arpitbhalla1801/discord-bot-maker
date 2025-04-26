type BotMetadata = {
  name: string;
  token: string;
  prefix: string;
  [key: string]: string;
}

type MetadataEditorProps = {
  metadata: BotMetadata;
  onChange: (metadata: BotMetadata) => void;
}

export default function MetadataEditor({ metadata, onChange }: MetadataEditorProps) {
  const handleChange = (key: string, value: string) => {
    onChange({
      ...metadata,
      [key]: value
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Bot Settings</h2>
      
      <div className="space-y-6 bg-discord-darkBg p-6 rounded-lg">
        <div>
          <label className="block mb-2 font-medium">Bot Name</label>
          <input 
            type="text"
            value={metadata.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="My Awesome Bot"
            className="w-full bg-discord-lighterBg border border-gray-700 rounded-md px-3 py-2"
          />
          <p className="text-sm text-gray-400 mt-1">
            This will be used in help commands and embeds.
          </p>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Bot Token</label>
          <input 
            type="password"
            value={metadata.token}
            onChange={(e) => handleChange('token', e.target.value)}
            placeholder="YOUR_BOT_TOKEN"
            className="w-full bg-discord-lighterBg border border-gray-700 rounded-md px-3 py-2"
          />
          <p className="text-sm text-gray-400 mt-1">
            Get this from the Discord Developer Portal. We won't store this value.
          </p>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Command Prefix</label>
          <input 
            type="text"
            value={metadata.prefix}
            onChange={(e) => handleChange('prefix', e.target.value)}
            placeholder="!"
            className="w-full bg-discord-lighterBg border border-gray-700 rounded-md px-3 py-2"
          />
          <p className="text-sm text-gray-400 mt-1">
            Used for message commands. Slash commands don't need this.
          </p>
        </div>
        
        <div className="bg-discord-blurple bg-opacity-20 p-4 rounded-md border border-discord-blurple">
          <h3 className="font-medium mb-2">Info about Bot Tokens</h3>
          <p className="text-sm">
            Never share your bot token or commit it to a public repository. 
            In your downloaded code, you'll need to add your token in a config file 
            or use environment variables.
          </p>
        </div>
      </div>
    </div>
  )
}

import { FaSlash, FaBell, FaCog } from 'react-icons/fa'
import classNames from 'classnames'

type BuilderPanelProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BuilderPanel({ activeTab, onTabChange }: BuilderPanelProps) {
  const tabs = [
    { id: 'commands', label: 'Slash Commands', icon: <FaSlash /> },
    { id: 'events', label: 'Event Listeners', icon: <FaBell /> },
    { id: 'metadata', label: 'Bot Settings', icon: <FaCog /> },
  ]
  
  return (
    <div className="w-full lg:w-64 bg-discord-darkSecondary rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Builder Tools</h2>
      <ul className="space-y-2">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              className={classNames(
                'w-full text-left p-3 rounded-md flex items-center gap-3',
                {
                  'bg-discord-blurple': activeTab === tab.id,
                  'hover:bg-discord-lighterBg': activeTab !== tab.id
                }
              )}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
      
      <div className="mt-8 p-4 bg-discord-darkBg rounded-md">
        <h3 className="font-medium mb-2">Tips</h3>
        <p className="text-sm text-gray-300">
          {activeTab === 'commands' && "Create slash commands your users can access in Discord."}
          {activeTab === 'events' && "Set up listeners for events like new members joining."}
          {activeTab === 'metadata' && "Configure your bot's name, token, and other settings."}
        </p>
      </div>
    </div>
  )
}

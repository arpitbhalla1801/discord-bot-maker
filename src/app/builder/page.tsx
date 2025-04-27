'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BuilderPanel from '@/components/builder/BuilderPanel'
import CommandBuilder from '@/components/builder/CommandBuilder'
import EventsBuilder from '@/components/builder/EventsBuilder'
import MetadataEditor from '@/components/builder/MetadataEditor'

type BuilderTab = 'commands' | 'events' | 'metadata'

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState<BuilderTab>('commands')
  const [botData, setBotData] = useState({
    commands: [],
    events: [],
    metadata: {
      name: 'My Discord Bot',
      token: 'YOUR_BOT_TOKEN',
      prefix: '!'
    }
  })
  const router = useRouter()

  const handleGenerateCode = () => {
    
    localStorage.setItem('botData', JSON.stringify(botData))
    router.push('/preview')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bot Builder</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left sidebar */}
        <BuilderPanel 
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as BuilderTab)}
        />
        
        {/* Main content area */}
        <div className="flex-grow bg-discord-darkSecondary rounded-lg p-6">
          {activeTab === 'commands' && (
            <CommandBuilder 
              commands={botData.commands}
              onChange={(commands) => setBotData({...botData, commands})}
            />
          )}
          
          {activeTab === 'events' && (
            <EventsBuilder 
              events={botData.events}
              onChange={(events) => setBotData({...botData, events})}
            />
          )}
          
          {activeTab === 'metadata' && (
            <MetadataEditor 
              metadata={botData.metadata}
              onChange={(metadata) => setBotData({...botData, metadata})}
            />
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end gap-4">
        <button 
          className="btn-secondary"
          onClick={() => router.push('/')}
        >
          Cancel
        </button>
        <button 
          className="btn-primary"
          onClick={handleGenerateCode}
        >
          Generate & Preview Code
        </button>
      </div>
    </div>
  )
}

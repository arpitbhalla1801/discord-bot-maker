'use client'

import { useRouter } from 'next/navigation'
import { useBuilderStore, useCommands, useEvents, useMetadata, useUIState } from '../../store/builderStore'
import BuilderPanel from '../../components/builder/BuilderPanel'
import CommandBuilder from '../../components/builder/CommandBuilder'
import EventsBuilder from '../../components/builder/EventsBuilder'
import MetadataEditor from '../../components/builder/MetadataEditor'

export default function BuilderPage() {
  const router = useRouter()
  
  // Use the store
  const { setActiveTab, markClean, exportProject } = useBuilderStore()
  const { activeTab, isDirty } = useUIState()
  const commands = useCommands()
  const events = useEvents()
  const metadata = useMetadata()

  const handleGenerateCode = () => {
    const botData = exportProject()
    localStorage.setItem('botData', JSON.stringify(botData))
    markClean()
    router.push('/preview')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Bot Builder</h1>
        {isDirty && (
          <div className="flex items-center gap-2 text-yellow-500">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span className="text-sm">Unsaved changes</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left sidebar */}
        <BuilderPanel 
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as 'commands' | 'events' | 'metadata' | 'settings')}
        />
        
        {/* Main content area */}
        <div className="flex-grow bg-discord-darkSecondary rounded-lg p-6">
          {activeTab === 'commands' && (
            <CommandBuilder />
          )}
          
          {activeTab === 'events' && (
            <EventsBuilder />
          )}
          
          {activeTab === 'metadata' && (
            <MetadataEditor />
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
          className="btn-primary flex items-center gap-2"
          onClick={handleGenerateCode}
        >
          <span>Generate & Preview Code</span>
          {commands.length + events.length === 0 && (
            <span className="text-xs opacity-70">(Add commands or events first)</span>
          )}
        </button>
      </div>
    </div>
  )
}

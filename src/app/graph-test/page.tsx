'use client'

import { useState } from 'react'
import GraphEditor from '@/components/graph/GraphEditor'
import { CommandGraphJson } from '@/types/graph'

export default function GraphTestPage() {
  const [savedGraph, setSavedGraph] = useState<CommandGraphJson | null>(null)

  const handleSave = (graph: CommandGraphJson) => {
    console.log('Graph saved:', graph)
    setSavedGraph(graph)
    alert('Graph saved! Check console for details.')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold">Graph Editor Test</h1>
        <p className="text-sm text-gray-400 mt-1">
          Build your bot command flow visually
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <GraphEditor onSave={handleSave} />
      </div>

      {savedGraph && (
        <div className="bg-gray-800 border-t border-gray-700 p-4 max-h-48 overflow-auto">
          <h3 className="font-semibold mb-2">Saved Graph JSON:</h3>
          <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto">
            {JSON.stringify(savedGraph, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

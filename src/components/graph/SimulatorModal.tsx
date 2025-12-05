'use client'

import { useState } from 'react'
import { FaTimes, FaPlay, FaRedo, FaCog, FaChevronRight } from 'react-icons/fa'
import { CommandGraphJson } from '@/types/graph'
import { GraphSimulator, SimulationOutput, SimulationStep, MockUser, MockGuild, MockChannel } from '@/lib/graphSimulator'

interface SimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  graph: CommandGraphJson
  commandName: string
}

export default function SimulatorModal({ isOpen, onClose, graph, commandName }: SimulatorModalProps) {
  const [simulating, setSimulating] = useState(false)
  const [outputs, setOutputs] = useState<SimulationOutput[]>([])
  const [steps, setSteps] = useState<SimulationStep[]>([])
  const [variables, setVariables] = useState<Map<string, any>>(new Map())
  const [executionPath, setExecutionPath] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)
  
  // Mock data settings
  const [mockUser, setMockUser] = useState<MockUser>({
    id: '123456789012345678',
    username: 'TestUser',
    discriminator: '0001',
    avatar: null
  })
  const [mockGuild, setMockGuild] = useState<MockGuild>({
    id: '987654321098765432',
    name: 'Test Server'
  })
  const [mockChannel, setMockChannel] = useState<MockChannel>({
    id: '111222333444555666',
    name: 'general',
    type: 'text'
  })

  if (!isOpen) return null

  const runSimulation = async () => {
    try {
      setSimulating(true)
      setOutputs([])
      setSteps([])
      setVariables(new Map())
      setExecutionPath([])

      const simulator = new GraphSimulator(graph, {
        user: mockUser,
        guild: mockGuild,
        channel: mockChannel
      })

      const result = await simulator.simulate()
      
      setSteps(result.steps)
      setOutputs(result.outputs)
      setVariables(result.context.variables)
      setExecutionPath(simulator.getExecutionPath())
    } catch (error: any) {
      const errorOutput: SimulationOutput = {
        id: `error-${Date.now()}`,
        timestamp: new Date(),
        type: 'error',
        nodeId: 'simulator',
        nodeName: 'SIMULATOR',
        content: error.message
      }
      setOutputs([errorOutput])
    } finally {
      setSimulating(false)
    }
  }

  const resetSimulation = () => {
    setOutputs([])
    setSteps([])
    setVariables(new Map())
    setExecutionPath([])
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-discord-darkBg border border-gray-700 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>🧪</span> Graph Simulator
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Test /{commandName} without deploying
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Mock Data Settings"
            >
              <FaCog className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-b border-gray-700 p-4 bg-discord-darkSecondary">
            <h3 className="font-semibold mb-3 text-sm">Mock Data Settings</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  value={mockUser.username}
                  onChange={(e) => setMockUser({ ...mockUser, username: e.target.value })}
                  className="w-full bg-discord-darkBg border border-gray-600 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Guild Name</label>
                <input
                  type="text"
                  value={mockGuild.name}
                  onChange={(e) => setMockGuild({ ...mockGuild, name: e.target.value })}
                  className="w-full bg-discord-darkBg border border-gray-600 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Channel Name</label>
                <input
                  type="text"
                  value={mockChannel.name}
                  onChange={(e) => setMockChannel({ ...mockChannel, name: e.target.value })}
                  className="w-full bg-discord-darkBg border border-gray-600 rounded px-2 py-1 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Execution Steps */}
          <div className="w-1/3 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700 bg-discord-darkSecondary">
              <h3 className="font-semibold text-sm">Execution Steps</h3>
              <p className="text-xs text-gray-400 mt-1">{steps.length} steps executed</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {steps.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No execution yet.<br />Click Run to start.
                </p>
              ) : (
                steps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-sm ${
                      step.status === 'success'
                        ? 'bg-green-500/10 border-green-500/30'
                        : step.status === 'error'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-gray-700/30 border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">#{index + 1}</span>
                      <FaChevronRight className="w-3 h-3 text-gray-600" />
                      <span className="font-semibold text-xs">{step.nodeName}</span>
                    </div>
                    <p className="text-xs text-gray-400">{step.action}</p>
                    {step.error && (
                      <p className="text-xs text-red-400 mt-1">{step.error}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Output Preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-700 bg-discord-darkSecondary">
              <h3 className="font-semibold text-sm">Output Preview</h3>
              <p className="text-xs text-gray-400 mt-1">What users will see</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {outputs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-sm">Output will appear here</p>
                </div>
              ) : (
                outputs.map((output) => (
                  <div key={output.id}>
                    {output.type === 'message' && (
                      <div className="bg-discord-darkSecondary rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-discord-blurple flex items-center justify-center text-sm font-bold">
                            {mockUser.username[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-sm">{commandName} Bot</span>
                            <span className="text-xs text-gray-400 ml-2">
                              {output.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-white">{output.content}</p>
                      </div>
                    )}

                    {output.type === 'embed' && (
                      <div className="bg-discord-darkSecondary rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-discord-blurple flex items-center justify-center text-sm font-bold">
                            {mockUser.username[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-sm">{commandName} Bot</span>
                            <span className="text-xs text-gray-400 ml-2">
                              {output.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div
                          className="border-l-4 pl-4 py-2 rounded"
                          style={{ borderColor: output.content.color }}
                        >
                          {output.content.title && (
                            <h4 className="font-bold text-white mb-2">{output.content.title}</h4>
                          )}
                          {output.content.description && (
                            <p className="text-gray-300 text-sm">{output.content.description}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {output.type === 'log' && (
                      <div className="bg-gray-800/50 rounded px-3 py-2 border border-gray-700">
                        <p className="text-xs text-gray-400 font-mono">{output.content}</p>
                      </div>
                    )}

                    {output.type === 'variable' && (
                      <div className="bg-blue-500/10 rounded px-3 py-2 border border-blue-500/30">
                        <p className="text-xs text-blue-400 font-mono">{output.content}</p>
                      </div>
                    )}

                    {output.type === 'delay' && (
                      <div className="bg-yellow-500/10 rounded px-3 py-2 border border-yellow-500/30">
                        <p className="text-xs text-yellow-400 font-mono">⏱️ {output.content}</p>
                      </div>
                    )}

                    {output.type === 'error' && (
                      <div className="bg-red-500/10 rounded px-3 py-2 border border-red-500/30">
                        <p className="text-xs text-red-400 font-mono">❌ {output.content}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Variables Display */}
            {variables.size > 0 && (
              <div className="border-t border-gray-700 p-4 bg-discord-darkSecondary">
                <h4 className="text-xs font-semibold mb-2 text-gray-400">VARIABLES</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from(variables.entries()).map(([key, value]) => (
                    <div key={key} className="bg-discord-darkBg rounded px-3 py-2 border border-gray-700">
                      <span className="text-xs text-gray-400 font-mono">{key}:</span>
                      <span className="text-xs text-white font-mono ml-2">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-700 p-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {executionPath.length > 0 && (
              <span>{executionPath.length} nodes executed</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetSimulation}
              disabled={simulating || outputs.length === 0}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <FaRedo className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={runSimulation}
              disabled={simulating}
              className="px-6 py-2 bg-discord-blurple hover:bg-discord-blurple/80 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {simulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <FaPlay className="w-4 h-4" />
                  Run Simulation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

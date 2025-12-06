'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaDiscord, FaRocket, FaServer, FaTrash, FaPlus, FaExternalLinkAlt } from 'react-icons/fa'
import { generateBotInviteUrl } from '@/utils/botInvite'

interface Deployment {
  id: string
  guildId: string
  guildName: string
  guildIcon: string | null
  projectId: string
  projectName: string
  projectIcon: string | null
  commandCount: number
  isActive: boolean
  deployedAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  description: string | null
  icon: string | null
  commandCount: number
}

export default function DeployPage() {
  const router = useRouter()
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [guildId, setGuildId] = useState('')
  const [showDeployForm, setShowDeployForm] = useState(false)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      const [deploymentsRes, projectsRes] = await Promise.all([
        fetch('/api/deploy'),
        fetch('/api/projects')
      ])

      if (deploymentsRes.ok) {
        const data = await deploymentsRes.json()
        setDeployments(data.deployments || [])
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json()
        console.log('Raw projects response:', data)
        // Simpler approach: use _count from projects API
        const projectsList = (data.projects || []).map((p: any) => {
          console.log('Project:', p.name, 'Count:', p._count)
          return {
            ...p,
            commandCount: p._count?.commands || 0
          }
        })
        console.log('Final projects list:', projectsList)
        setProjects(projectsList)
      } else {
        console.error('Projects fetch failed:', projectsRes.status, await projectsRes.text())
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeploy() {
    if (!selectedProject || !guildId) {
      alert('Please select a project and enter a server ID')
      return
    }

    setDeploying(selectedProject)

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          guildId: guildId.trim()
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert(`✅ Deployed ${data.deployment.commandsRegistered} commands to ${data.guild.name}!`)
        setShowDeployForm(false)
        setSelectedProject('')
        setGuildId('')
        fetchData()
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      alert('Failed to deploy. Please try again.')
    } finally {
      setDeploying(null)
    }
  }

  async function handleUndeploy(deploymentId: string, guildName: string) {
    if (!confirm(`Remove commands from ${guildName}?`)) return

    try {
      const res = await fetch(`/api/deploy/${deploymentId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('✅ Commands removed successfully')
        fetchData()
      } else {
        const data = await res.json()
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      alert('Failed to undeploy. Please try again.')
    }
  }

  function handleInviteBot() {
    const inviteUrl = generateBotInviteUrl()
    window.open(inviteUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading deployments...</p>
        </div>
      </div>
    )
  }

  console.log('Render - projects state:', projects)
  console.log('Render - projects.length:', projects.length)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FaRocket className="text-blue-500" />
                Deploy to Discord
              </h1>
              <p className="text-gray-400">
                Deploy your bot commands to Discord servers
              </p>
            </div>
            <button
              onClick={() => setShowDeployForm(!showDeployForm)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <FaPlus />
              New Deployment
            </button>
          </div>
        </div>

        {/* Deploy Form */}
        {showDeployForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Deploy to Server</h2>
            
            {/* Step 1: Invite Bot */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Invite Bot to Your Server</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    First, add our bot to your Discord server with the required permissions.
                  </p>
                  <button
                    onClick={handleInviteBot}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FaDiscord />
                    Invite Bot to Server
                    <FaExternalLinkAlt className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Select Project */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Select Project</h3>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose a project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.commandCount} commands)
                      </option>
                    ))}
                  </select>
                  {projects.length === 0 && (
                    <p className="text-sm text-yellow-500 mt-2">
                      No projects found. Create a project first!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Enter Server ID */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Enter Server ID</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Right-click your server icon → Copy Server ID (enable Developer Mode in Discord settings)
                  </p>
                  <input
                    type="text"
                    value={guildId}
                    onChange={(e) => setGuildId(e.target.value)}
                    placeholder="123456789012345678"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Deploy Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeploy}
                disabled={!selectedProject || !guildId || deploying !== null}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                {deploying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deploying...
                  </>
                ) : (
                  <>
                    <FaRocket />
                    Deploy Commands
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeployForm(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Active Deployments */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaServer className="text-purple-500" />
            Active Deployments
          </h2>

          {deployments.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
              <FaRocket className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-4">No active deployments</p>
              <p className="text-gray-500 mb-6">
                Deploy your bot commands to a Discord server to get started
              </p>
              <button
                onClick={() => setShowDeployForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <FaPlus />
                Deploy Now
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {deployments.map(d => (
                <div
                  key={d.id}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Guild Icon */}
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {d.guildIcon ? (
                          <img
                            src={`https://cdn.discordapp.com/icons/${d.guildId}/${d.guildIcon}.png`}
                            alt={d.guildName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaDiscord className="text-3xl text-gray-500" />
                        )}
                      </div>

                      {/* Details */}
                      <div>
                        <h3 className="text-xl font-bold mb-1">{d.guildName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Project: <span className="text-white">{d.projectName}</span></span>
                          <span>•</span>
                          <span>{d.commandCount} commands</span>
                          <span>•</span>
                          <span>Deployed {new Date(d.deployedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2">
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                            ● Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleUndeploy(d.id, d.guildName)}
                      className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                    >
                      <FaTrash />
                      Undeploy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <FaDiscord className="text-blue-400" />
            How It Works
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Your commands are deployed only to the servers you choose</li>
            <li>• Commands appear instantly in Discord (no global propagation delay)</li>
            <li>• Each server can have different projects deployed</li>
            <li>• You can deploy the same project to multiple servers</li>
            <li>• Maximum 100 commands per server (Discord limit)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

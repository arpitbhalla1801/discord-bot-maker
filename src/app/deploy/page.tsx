'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaDiscord, FaRocket, FaServer, FaTrash, FaPlus, FaExternalLinkAlt, FaCheck, FaTimes, FaCrown, FaSync } from 'react-icons/fa'
import { generateBotInviteUrl } from '@/utils/botInvite'
import { signOut } from '@/lib/auth-client'

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

interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  botInGuild: boolean
  hasManagePermissions: boolean
}

export default function DeployPage() {
  const router = useRouter()
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [guilds, setGuilds] = useState<DiscordGuild[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingGuilds, setLoadingGuilds] = useState(false)
  const [deploying, setDeploying] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedGuild, setSelectedGuild] = useState<string>('')
  const [showDeployForm, setShowDeployForm] = useState(false)
  const [needsReauth, setNeedsReauth] = useState(false)

  useEffect(() => {
    fetchData()
    fetchGuilds()
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
        const projectsList = (data.projects || []).map((p: any) => ({
          ...p,
          commandCount: p._count?.commands || 0
        }))
        setProjects(projectsList)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchGuilds() {
    setLoadingGuilds(true)
    try {
      const res = await fetch('/api/discord/guilds')
      const data = await res.json()
      
      if (res.ok) {
        setGuilds(data.guilds || [])
        setNeedsReauth(false)
        console.log('Guilds loaded:', data)
      } else if (res.status === 401) {
        router.push('/api/auth/signin')
      } else if ((res.status === 403 || res.status === 400) && data.needsReauth) {
        // Missing guilds scope - need to re-authenticate
        setNeedsReauth(true)
        console.error('Missing guilds scope or invalid token:', data)
      } else {
        console.error('Failed to fetch guilds:', data)
        alert(`Failed to fetch Discord servers: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to fetch guilds:', error)
      alert('Failed to connect to Discord. Please try again.')
    } finally {
      setLoadingGuilds(false)
    }
  }

  async function handleDeploy() {
    if (!selectedProject || !selectedGuild) {
      alert('Please select a project and a server')
      return
    }

    const guild = guilds.find(g => g.id === selectedGuild)
    if (!guild?.botInGuild) {
      alert('Bot is not in this server. Please invite the bot first.')
      return
    }

    setDeploying(selectedProject)

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          guildId: selectedGuild
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert(`✅ Deployed ${data.deployment.commandsRegistered} commands to ${data.guild.name}!`)
        setShowDeployForm(false)
        setSelectedProject('')
        setSelectedGuild('')
        fetchData()
        fetchGuilds()
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Re-authentication Warning Banner */}
        {needsReauth && (
          <div className="mb-8 bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-500 mb-2">
                  Discord Re-authentication Required
                </h3>
                <p className="text-gray-300 mb-4">
                  To view and manage your Discord servers, you need to sign out and sign in again to grant the necessary permissions.
                  Go to your profile page, click "Sign Out", then sign in again with Discord.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      window.location.href = '/dashboard/profile'
                    }}
                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FaDiscord />
                    Go to Profile & Re-authenticate
                  </button>
                  <button
                    onClick={() => setNeedsReauth(false)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Deploy to Server</h2>
              <button
                onClick={fetchGuilds}
                disabled={loadingGuilds}
                className="text-sm px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaSync className={loadingGuilds ? 'animate-spin' : ''} />
                Refresh Servers
              </button>
            </div>
            
            {/* Step 1: Select Project */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
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

            {/* Step 2: Select Server */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Select Server</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Choose from your Discord servers where you have manage permissions
                  </p>
                  
                  {loadingGuilds ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  ) : guilds.length === 0 ? (
                    <div className="text-center py-8">
                      <FaServer className="text-4xl text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 mb-4">No manageable servers found</p>
                      <button
                        onClick={handleInviteBot}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
                      >
                        <FaDiscord />
                        Invite Bot to Server
                        <FaExternalLinkAlt className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                      {guilds.map(guild => (
                        <button
                          key={guild.id}
                          onClick={() => setSelectedGuild(guild.id)}
                          disabled={!guild.botInGuild}
                          className={`
                            p-3 rounded-lg border-2 transition-all text-left
                            ${selectedGuild === guild.id 
                              ? 'border-blue-500 bg-blue-500/20' 
                              : 'border-gray-600 hover:border-gray-500'
                            }
                            ${!guild.botInGuild ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {guild.icon ? (
                                <img
                                  src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`}
                                  alt={guild.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FaDiscord className="text-2xl text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold truncate">{guild.name}</span>
                                {guild.owner && (
                                  <FaCrown className="text-yellow-500 flex-shrink-0" title="Owner" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {guild.botInGuild ? (
                                  <span className="text-xs flex items-center gap-1 text-green-400">
                                    <FaCheck /> Bot in server
                                  </span>
                                ) : (
                                  <span className="text-xs flex items-center gap-1 text-red-400">
                                    <FaTimes /> Bot not in server
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedGuild === guild.id && (
                              <FaCheck className="text-blue-500 text-xl flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {guilds.length > 0 && guilds.every(g => !g.botInGuild) && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                      <p className="text-sm text-yellow-400 mb-2">
                        Bot is not in any of your servers
                      </p>
                      <button
                        onClick={handleInviteBot}
                        className="text-sm px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
                      >
                        <FaDiscord />
                        Invite Bot
                        <FaExternalLinkAlt className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deploy Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeploy}
                disabled={!selectedProject || !selectedGuild || deploying !== null}
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
            <li>• We automatically fetch your Discord servers where you have manage permissions</li>
            <li>• Only servers where the bot is present can be deployed to</li>
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

'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEdit, FaDownload, FaTrash, FaPlus, FaRocket } from 'react-icons/fa';

interface BotProject {
  id: string
  name: string
  description: string | null
  icon: string | null
  status: string
  updatedAt: string
  _count: {
    commands: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<BotProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingProject, setCreatingProject] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/api/auth/signin')
          return
        }
        throw new Error('Failed to fetch projects')
      }

      const data = await response.json()
      setProjects(data.projects || data)
      setError(null)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createNewProject = async () => {
    try {
      setCreatingProject(true)
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'New Bot Project',
          description: 'A new Discord bot'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const newProject = await response.json()
      router.push(`/builder/${newProject.id}`)
    } catch (err) {
      console.error('Error creating project:', err)
      alert('Failed to create project. Please try again.')
    } finally {
      setCreatingProject(false)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      // Remove from local state
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (err) {
      console.error('Error deleting project:', err)
      alert('Failed to delete project. Please try again.')
    }
  }

  const duplicateProject = async (projectId: string) => {
    alert('Duplicate feature coming soon!')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="flex justify-center items-center h-96">
          <div className="text-center animate-fade-in">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-discord-blurple/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-discord-blurple border-t-transparent animate-spin"></div>
            </div>
            <p className="text-discord-text-secondary text-lg">Loading your projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">My Bot Projects</h1>
          <p className="text-discord-text-secondary">Manage and deploy your Discord bots</p>
        </div>
        <button 
          onClick={createNewProject}
          disabled={creatingProject}
          className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
        >
          <FaPlus />
          <span>{creatingProject ? 'Creating...' : 'New Bot'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-discord-red/20 border border-discord-red rounded-xl px-5 py-4 mb-6 animate-slide-up">
          <p className="text-discord-red font-medium">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        {projects.map((project, index) => (
          <div 
            key={project.id} 
            className="card-flat hover:border-discord-blurple/50 transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h2 className="text-2xl lg:text-3xl font-bold group-hover:text-discord-blurple transition-colors">
                    {project.name}
                  </h2>
                  <span className={`badge ${
                    project.status === 'active' ? 'badge-success' : 'bg-gray-700/50 text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-discord-text-secondary mb-4 line-clamp-2">
                  {project.description || 'No description provided'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="badge-primary">
                    <FaEdit className="w-3 h-3" />
                    {project._count.commands} Commands
                  </span>
                  <span className="badge bg-gray-700/50 text-discord-text-secondary border-gray-600/50">
                    Updated {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 lg:min-w-[140px]">
                <Link 
                  href={`/builder/${project.id}`} 
                  className="btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <FaEdit />
                  <span>Edit</span>
                </Link>
                <Link 
                  href={`/deploy?project=${project.id}`} 
                  className="btn-success flex items-center justify-center gap-2 text-sm"
                >
                  <FaRocket />
                  <span>Deploy</span>
                </Link>
                <Link 
                  href={`/export?project=${project.id}`} 
                  className="btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <FaDownload />
                  <span>Export</span>
                </Link>
              </div>
            </div>
            
            <div className="flex mt-6 pt-4 border-t border-gray-700/50 justify-between items-center">
              <div className="text-xs text-discord-text-muted">
                Project ID: <code className="bg-discord-darkBg px-2 py-1 rounded">{project.id.slice(0, 8)}</code>
              </div>
              <button 
                onClick={() => deleteProject(project.id)}
                className="text-discord-text-muted hover:text-discord-red p-2 rounded-lg hover:bg-discord-red/10 transition-all"
                title="Delete project"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {projects.length === 0 && !loading && (
        <div className="text-center py-20 animate-fade-in">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">🤖</div>
            <h2 className="text-3xl font-bold mb-4">No Projects Yet</h2>
            <p className="text-discord-text-secondary mb-8 text-lg">
              Create your first Discord bot to get started on your automation journey!
            </p>
            <button 
              onClick={createNewProject}
              disabled={creatingProject}
              className="btn-primary px-8 py-4 text-lg disabled:opacity-50 inline-flex items-center gap-2"
            >
              <FaPlus />
              {creatingProject ? 'Creating...' : 'Create Your First Bot'}
            </button>
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Quick Start Templates</h2>
              <p className="text-discord-text-secondary">Get started faster with pre-built templates</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/builder?template=moderation-bot" className="card group">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-discord-blurple transition-colors">
                Moderation Bot
              </h3>
              <p className="text-discord-text-secondary">
                Keep your server safe with kick, ban, mute commands and auto-moderation.
              </p>
            </Link>
            <Link href="/builder?template=music-bot" className="card group">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-discord-blurple transition-colors">
                Music Bot
              </h3>
              <p className="text-discord-text-secondary">
                Play music in voice channels with queue management and playback controls.
              </p>
            </Link>
            <Link href="/templates" className="card group bg-gradient-to-br from-discord-blurple/20 to-discord-fuchsia/20 border-discord-blurple/30">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2 text-discord-blurple">
                Browse All Templates →
              </h3>
              <p className="text-discord-text-secondary">
                Explore our full collection of ready-to-use bot templates.
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
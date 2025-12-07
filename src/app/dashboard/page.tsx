'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEdit, FaDownload, FaTrash, FaCopy, FaPlay, FaPlus, FaRocket } from 'react-icons/fa';

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
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">My Bot Projects</h1>
        <button 
          onClick={createNewProject}
          disabled={creatingProject}
          className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50"
        >
          <FaPlus />
          <span>{creatingProject ? 'Creating...' : 'New Bot'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {projects.map(project => (
          <div key={project.id} className="card p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold">{project.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded ${
                    project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-300 mb-3">{project.description || 'No description'}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="bg-discord-blurple/30 px-3 py-1 rounded-full">
                    {project._count.commands} Commands
                  </span>
                  <span className="bg-gray-700 px-3 py-1 rounded-full">
                    Last modified: {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-3 mt-2 md:mt-0">
                <Link href={`/builder/${project.id}`} className="btn-secondary flex items-center gap-2 px-4 py-2">
                  <FaEdit className="text-sm" />
                  <span>Edit</span>
                </Link>
                <Link href={`/deploy?project=${project.id}`} className="btn-secondary flex items-center gap-2 px-4 py-2 bg-discord-blurple hover:bg-discord-blurple/80">
                  <FaRocket className="text-sm" />
                  <span>Deploy</span>
                </Link>
                <Link href={`/sessions?project=${project.id}`} className="btn-secondary flex items-center gap-2 px-4 py-2">
                  <FaPlay className="text-sm" />
                  <span>Run</span>
                </Link>
                <Link href={`/export?project=${project.id}`} className="btn-secondary flex items-center gap-2 px-4 py-2">
                  <FaDownload className="text-sm" />
                  <span>Export</span>
                </Link>
              </div>
            </div>
            <div className="flex mt-4 justify-end gap-3">
              <button 
                onClick={() => duplicateProject(project.id)}
                className="text-gray-400 hover:text-gray-200 p-2"
                title="Duplicate project"
              >
                <FaCopy />
              </button>
              <button 
                onClick={() => deleteProject(project.id)}
                className="text-gray-400 hover:text-red-500 p-2"
                title="Delete project"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {projects.length === 0 && !loading && (
        <div className="text-center py-16">
          <h2 className="text-2xl mb-4">You don&apos;t have any bot projects yet</h2>
          <p className="text-gray-300 mb-8">Create your first Discord bot to get started!</p>
          <button 
            onClick={createNewProject}
            disabled={creatingProject}
            className="btn-primary px-6 py-3 disabled:opacity-50"
          >
            {creatingProject ? 'Creating...' : 'Create New Bot'}
          </button>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recently Used Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/builder?template=moderation-bot" className="card p-6 hover:bg-gray-800 transition">
            <h3 className="text-xl font-semibold mb-2">Moderation Bot</h3>
            <p className="text-gray-300">Keep your server clean with moderation commands.</p>
          </Link>
          <Link href="/builder?template=music-bot" className="card p-6 hover:bg-gray-800 transition">
            <h3 className="text-xl font-semibold mb-2">Music Bot</h3>
            <p className="text-gray-300">Play music in your Discord voice channels.</p>
          </Link>
          <Link href="/templates" className="card p-6 hover:bg-gray-800 transition flex items-center justify-center">
            <span className="text-xl font-semibold text-discord-blurple">Browse All Templates →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
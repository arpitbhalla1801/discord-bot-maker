'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowRight, FaRobot } from 'react-icons/fa'

export default function BuilderPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to dashboard after a brief moment
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-12">
          <div className="text-discord-blurple text-6xl mb-6 flex justify-center">
            <FaRobot />
          </div>
          <h1 className="text-3xl font-bold mb-4">Welcome to the Builder!</h1>
          <p className="text-gray-300 mb-8">
            You'll be redirected to your dashboard where you can create and manage your bot projects.
          </p>
          <div className="flex flex-col gap-4">
            <Link 
              href="/dashboard" 
              className="btn-primary flex items-center justify-center gap-2 text-lg py-3"
            >
              Go to Dashboard
              <FaArrowRight />
            </Link>
            <p className="text-sm text-gray-400">
              Redirecting automatically in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { signOut } from '@/lib/auth-client'

export default function DebugAuthPage() {
  const [accountData, setAccountData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccountData()
  }, [])

  async function fetchAccountData() {
    try {
      const res = await fetch('/api/debug/account')
      const data = await res.json()
      setAccountData(data)
    } catch (error) {
      console.error('Failed to fetch account data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Discord Auth Debug</h1>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(accountData, null, 2)}
          </pre>
        </div>

        <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h3 className="font-bold mb-2">Expected Scopes</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li><code>identify</code> - User profile info</li>
            <li><code>email</code> - User email</li>
            <li><code>guilds</code> - User's Discord servers <strong>(Required for deployment)</strong></li>
          </ul>

          <div className="mt-4">
            <h3 className="font-bold mb-2">If guilds scope is missing:</h3>
            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-300">
              <li>Click "Go to Profile Page" button below</li>
              <li>Click "Sign Out" on the profile page</li>
              <li>Click "Sign In with Discord"</li>
              <li>Check that the Discord authorization page shows "View your Discord servers"</li>
              <li>Click "Authorize"</li>
              <li>Come back to this page to verify</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              window.location.href = '/dashboard/profile'
            }}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
          >
            Go to Profile Page
          </button>
          <button
            onClick={fetchAccountData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

export default function TestAPIPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testProjects = async () => {
    setLoading(true)
    try {
      // Test GET projects
      const getResponse = await fetch('/api/projects')
      const getData = await getResponse.json()
      
      let testResults = '=== TEST RESULTS ===\n\n'
      testResults += `GET /api/projects - Status: ${getResponse.status}\n`
      testResults += `Response: ${JSON.stringify(getData, null, 2)}\n\n`

      // Test CREATE project
      const createResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Bot ' + Date.now(),
          description: 'A test bot project'
        })
      })
      const createData = await createResponse.json()
      
      testResults += `POST /api/projects - Status: ${createResponse.status}\n`
      testResults += `Response: ${JSON.stringify(createData, null, 2)}\n\n`

      if (createData.id) {
        // Test CREATE command
        const cmdResponse = await fetch(`/api/projects/${createData.id}/commands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'test-command',
            description: 'A test command',
            type: 'SLASH'
          })
        })
        const cmdData = await cmdResponse.json()
        
        testResults += `POST /api/projects/${createData.id}/commands - Status: ${cmdResponse.status}\n`
        testResults += `Response: ${JSON.stringify(cmdData, null, 2)}\n\n`

        // Test GET commands
        const getCommandsResponse = await fetch(`/api/projects/${createData.id}/commands`)
        const getCommandsData = await getCommandsResponse.json()
        
        testResults += `GET /api/projects/${createData.id}/commands - Status: ${getCommandsResponse.status}\n`
        testResults += `Response: ${JSON.stringify(getCommandsData, null, 2)}\n\n`

        // Test UPDATE project
        const updateResponse = await fetch(`/api/projects/${createData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Updated Test Bot',
            status: 'active'
          })
        })
        const updateData = await updateResponse.json()
        
        testResults += `PATCH /api/projects/${createData.id} - Status: ${updateResponse.status}\n`
        testResults += `Response: ${JSON.stringify(updateData, null, 2)}\n\n`
      }

      testResults += '\n✅ All tests completed!'
      setResult(testResults)
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="mb-6">
        <button
          onClick={testProjects}
          disabled={loading}
          className="btn-primary px-6 py-3 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run API Tests'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
            {result}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-200 text-sm">
          <strong>Note:</strong> This page is for testing the API endpoints. 
          Make sure you are logged in before running tests.
        </p>
      </div>
    </div>
  )
}

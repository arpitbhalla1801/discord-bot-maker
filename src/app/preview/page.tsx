'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaDownload, FaCopy, FaArrowLeft, FaPlay } from 'react-icons/fa'
import CodeViewer from '@/components/preview/CodeViewer'
import FileSidebar from '@/components/preview/FileSidebar'
import { generateBotCode } from '@/utils/codeGenerator'
import { useBuilderStore } from '@/store/builderStore'
import type { GeneratedFile } from '@/utils/codeGenerator'

export default function PreviewPage() {
  const { exportProject } = useBuilderStore()
  const [files, setFiles] = useState<GeneratedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string>('index.js')
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    // Get bot data from store or localStorage
    let botData
    try {
      botData = exportProject()
    } catch {
      const stored = localStorage.getItem('botData')
      botData = stored ? JSON.parse(stored) : null
    }
    
    if (botData) {
      const generatedFiles = generateBotCode(botData)
      setFiles(generatedFiles)
    }
  }, [exportProject])

  const handleCopyCode = () => {
    const fileContent = files.find(f => f.name === selectedFile)?.content || ''
    navigator.clipboard.writeText(fileContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    
    try {
      const botData = exportProject()
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(botData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate bot code')
      }

      // Download the zip file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${botData.metadata.name.toLowerCase().replace(/\s+/g, '-')}-bot.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download bot code. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Code Preview</h1>
        <div className="flex items-center gap-3">
          <Link href="/builder" className="btn-secondary flex items-center gap-2">
            <FaArrowLeft className="w-4 h-4" />
            Back to Builder
          </Link>
          <button 
            onClick={handleDownload}
            disabled={isDownloading || files.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <FaDownload className="w-4 h-4" />
            {isDownloading ? 'Generating...' : 'Download ZIP'}
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FaPlay className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No bot data found</h3>
          <p className="text-sm mb-4">Please go back to the builder and create some commands or events</p>
          <Link href="/builder" className="btn-primary">
            Go to Builder
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* File sidebar */}
            <div className="lg:col-span-1">
              <FileSidebar 
                files={files.map(f => ({ name: f.name, path: f.path }))}
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
              />
            </div>
            
            {/* Code viewer */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedFile}</h2>
                  <p className="text-sm text-gray-400">
                    {files.find(f => f.name === selectedFile)?.path}
                  </p>
                </div>
                <button 
                  className="btn-secondary flex items-center gap-2"
                  onClick={handleCopyCode}
                >
                  <FaCopy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <CodeViewer 
                code={files.find(f => f.name === selectedFile)?.content || '// Loading...'}
                language="javascript"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-discord-darkBg border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 Getting Started</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-discord-blurple mb-2">1. Download & Extract</h4>
                <p className="text-sm text-gray-400">
                  Click the "Download ZIP" button to get your bot files. Extract the ZIP file to your desired location.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-green-400 mb-2">2. Install Dependencies</h4>
                <p className="text-sm text-gray-400">
                  Open terminal in the bot folder and run:
                </p>
                <code className="block mt-2 p-2 bg-discord-lighterBg rounded text-xs font-mono">
                  npm install
                </code>
              </div>
              <div>
                <h4 className="font-medium text-yellow-400 mb-2">3. Configure & Run</h4>
                <p className="text-sm text-gray-400">
                  Copy <code>.env.example</code> to <code>.env</code>, add your bot token, then run:
                </p>
                <code className="block mt-2 p-2 bg-discord-lighterBg rounded text-xs font-mono">
                  npm start
                </code>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-600/20 border border-yellow-600/50 rounded">
              <h4 className="font-medium text-yellow-400 mb-2">⚠️ Important Notes</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Get your bot token from the <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-discord-blurple hover:underline">Discord Developer Portal</a></li>
                <li>• For slash commands, run <code>npm run deploy</code> after setting up your environment</li>
                <li>• Make sure your bot has the necessary permissions in your Discord server</li>
                <li>• Never share your bot token publicly or commit it to version control</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

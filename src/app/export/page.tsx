'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaDownload, FaCheck, FaGithub } from 'react-icons/fa'
import { downloadBotFiles } from '@/utils/zipGenerator'

export default function ExportPage() {
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    // In a real app, this would get the data from a more reliable source
    const botData = JSON.parse(localStorage.getItem('botData') || '{}')
    
    try {
      await downloadBotFiles(botData)
      setDownloaded(true)
    } catch (error) {
      console.error('Download failed', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-discord-blurple mb-4">
            {downloaded ? (
              <FaCheck className="text-2xl" />
            ) : (
              <FaDownload className="text-2xl" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {downloaded ? 'Bot Files Downloaded!' : 'Export Your Bot'}
          </h1>
          <p className="text-gray-300">
            {downloaded 
              ? 'Your bot files have been downloaded. Follow the instructions below to get your bot up and running.'
              : 'Your bot is ready to be exported. Click the button below to download the files.'}
          </p>
        </div>

        {!downloaded && (
          <div className="text-center mb-8">
            <button 
              className="btn-primary flex items-center gap-2 mx-auto"
              onClick={handleDownload}
              disabled={downloading}
            >
              <FaDownload /> 
              {downloading ? 'Preparing download...' : 'Download Bot Files (.zip)'}
            </button>
          </div>
        )}

        <div className="bg-discord-darkBg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <ol className="list-decimal pl-6 space-y-3">
            <li>Extract the downloaded ZIP file to a folder of your choice</li>
            <li>Open a terminal or command prompt in that folder</li>
            <li>Run <code className="bg-black px-2 py-1 rounded">npm install</code> to install dependencies</li>
            <li>Set up your bot token in the <code className="bg-black px-2 py-1 rounded">config.json</code> file</li>
            <li>Run <code className="bg-black px-2 py-1 rounded">node index.js</code> to start your bot</li>
          </ol>
        </div>

        <div className="flex justify-between">
          <Link href="/preview" className="btn-secondary">
            Back to Preview
          </Link>
          <a 
            href="https://discord.js.org/#/docs/main/stable/general/welcome" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Discord.js Documentation
          </a>
        </div>
      </div>
    </div>
  )
}

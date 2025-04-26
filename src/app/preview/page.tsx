'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaDownload, FaCopy } from 'react-icons/fa'
import CodeViewer from '@/components/preview/CodeViewer'
import FileSidebar from '@/components/preview/FileSidebar'
import { generateBotFiles } from '@/utils/codeGenerator'

export default function PreviewPage() {
  const [files, setFiles] = useState<{name: string, content: string}[]>([])
  const [selectedFile, setSelectedFile] = useState<string>('index.js')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // In a real app, this would get the data from a more reliable source
    const botData = JSON.parse(localStorage.getItem('botData') || '{}')
    // Generate files based on bot configuration
    const generatedFiles = generateBotFiles(botData)
    setFiles(generatedFiles)
  }, [])

  const handleCopyCode = () => {
    const fileContent = files.find(f => f.name === selectedFile)?.content || ''
    navigator.clipboard.writeText(fileContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Code Preview</h1>
      
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* File sidebar */}
        <FileSidebar 
          files={files.map(f => f.name)}
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
        />
        
        {/* Code viewer */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">{selectedFile}</h2>
            <button 
              className="btn-secondary flex items-center gap-2"
              onClick={handleCopyCode}
            >
              <FaCopy /> {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <CodeViewer 
            code={files.find(f => f.name === selectedFile)?.content || '// Loading...'}
            language="javascript"
          />
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Link href="/builder" className="btn-secondary">
          Back to Builder
        </Link>
        <Link href="/export" className="btn-primary flex items-center gap-2">
          <FaDownload /> Download Bot Files
        </Link>
      </div>
    </div>
  )
}

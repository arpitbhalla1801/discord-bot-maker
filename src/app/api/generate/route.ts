import { NextRequest, NextResponse } from 'next/server'
import { generateBotCode } from '../../../utils/codeGenerator'
import JSZip from 'jszip'
import type { BotData } from '../../../store/builderStore'

export async function POST(request: NextRequest) {
  try {
    const botData: BotData = await request.json()
    
    if (!botData || !botData.metadata) {
      return NextResponse.json(
        { error: 'Invalid bot data provided' },
        { status: 400 }
      )
    }

    // Generate code files
    const files = generateBotCode(botData)
    
    // Create ZIP file
    const zip = new JSZip()
    
    // Add files to zip
    files.forEach(file => {
      // Create directories if they don't exist
      const parts = file.path.split('/')
      if (parts.length > 1) {
        parts.pop() // Remove filename
        const dirPath = parts.join('/')
        zip.folder(dirPath)
      }
      
      zip.file(file.path, file.content)
    })
    
    // Generate zip buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    
    // Return zip file
    const fileName = `${botData.metadata.name.toLowerCase().replace(/\s+/g, '-')}-bot.zip`
    
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    })
    
  } catch (error) {
    console.error('Error generating bot code:', error)
    return NextResponse.json(
      { error: 'Failed to generate bot code' },
      { status: 500 }
    )
  }
}

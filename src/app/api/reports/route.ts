import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const reportsDir = '/home/legion/.openclaw/workspace/bot-reports'
  
  const reports: any[] = []
  
  try {
    if (!fs.existsSync(reportsDir)) {
      return NextResponse.json({ reports: [] })
    }
    
    const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.md'))
    
    for (const file of files) {
      const filePath = path.join(reportsDir, file)
      const stat = fs.statSync(filePath)
      const content = fs.readFileSync(filePath, 'utf-8')
      
      // Parse filename to get bot name
      const botName = file
        .replace('.md', '')
        .replace(/-latest/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
      
      reports.push({
        id: file,
        botName,
        fileName: file,
        content: content.substring(0, 500), // First 500 chars
        updatedAt: stat.mtime.toISOString(),
      })
    }
    
    // Sort by most recent
    reports.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
  } catch (error) {
    console.error('Error reading reports:', error)
  }
  
  return NextResponse.json({ reports })
}
